<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use App\Models\Producto;
use App\Models\Cliente;
use App\Support\DatabaseMetrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PedidoController extends Controller
{
    public function index(Request $request)
    {
        $pedidos = DB::table('pedidos')
            ->leftJoin('clientes','pedidos.cliente_id','=','clientes.id')
            ->leftJoin('users','pedidos.usuario_id','=','users.id')
            ->select('pedidos.*','clientes.nombre as cliente_nombre','users.name as vendedor')
            ->when($request->buscar, fn($q) => $q->where(fn($q2) =>
                $q2->where('pedidos.numero','like','%'.$request->buscar.'%')
                   ->orWhere('clientes.nombre','like','%'.$request->buscar.'%')
            ))
            ->when($request->estado, fn($q) => $q->where('pedidos.estado', $request->estado))
            ->orderByDesc('pedidos.fecha_entrada')
            ->paginate(10)->withQueryString();

        $stats = [
            'total_mes'     => Pedido::whereBetween('fecha_entrada', DatabaseMetrics::currentMonthRange())->count(),
            'pendientes'    => Pedido::whereIn('estado',['registrado','en_preparacion'])->count(),
            'despachados'   => Pedido::whereBetween('fecha_entrada', DatabaseMetrics::currentMonthRange())->where('estado','despachado')->count(),
            'ventas_mes'    => (float) Pedido::whereBetween('fecha_entrada', DatabaseMetrics::currentMonthRange())->sum('total'),
        ];

        return Inertia::render('Pedidos/Index', compact('pedidos','stats'));
    }

    public function create()
    {
        $clientes  = Cliente::where('activo',1)->orderBy('nombre')->get(['id','nombre','documento','zona']);
        $productos = Producto::where('activo',1)->where('stock_actual','>',0)
            ->orderBy('nombre')->get(['id','codigo','nombre','precio_venta','stock_actual']);

        return Inertia::render('Pedidos/Nuevo', compact('clientes','productos'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'nullable|exists:clientes,id',
            'tipo'       => 'required|string',
            'zona'       => 'nullable|string',
            'items'      => 'required|array|min:1',
            'items.*.producto_id' => 'required|exists:productos,id|distinct',
            'items.*.cantidad'    => 'required|integer|min:1',
            'items.*.precio'      => 'required|numeric|min:0',
            'descuento'  => 'nullable|numeric|min:0',
            'observaciones' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $subtotal = collect($request->items)->sum(fn($i) => $i['cantidad'] * $i['precio']);
            $descuento = $request->descuento ?? 0;
            $total = $subtotal - $descuento;

            if ($total < 0) {
                throw ValidationException::withMessages([
                    'descuento' => 'El descuento no puede ser mayor al subtotal.',
                ]);
            }

            $numero = 'PED-' . str_pad(Pedido::count() + 1, 4, '0', STR_PAD_LEFT);

            $pedidoId = DB::table('pedidos')->insertGetId([
                'numero'       => $numero,
                'cliente_id'   => $request->cliente_id,
                'fecha_entrada'=> now(),
                'estado'       => 'registrado',
                'tipo'         => $request->tipo,
                'zona'         => $request->zona,
                'subtotal'     => $subtotal,
                'descuento'    => $descuento,
                'total'        => $total,
                'usuario_id'   => auth()->id(),
                'observaciones'=> $request->observaciones,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            foreach ($request->items as $item) {
                $producto = Producto::where('activo', 1)->lockForUpdate()->find($item['producto_id']);
                if (!$producto) {
                    throw ValidationException::withMessages([
                        'items' => 'Uno de los productos no está disponible.',
                    ]);
                }
                if ($producto->stock_actual < $item['cantidad']) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuficiente para {$producto->nombre}. Disponible: {$producto->stock_actual}.",
                    ]);
                }

                $stockAnterior = $producto->stock_actual;
                $stockNuevo = $stockAnterior - $item['cantidad'];

                DB::table('pedidos_detalle')->insert([
                    'pedido_id'     => $pedidoId,
                    'producto_id'   => $item['producto_id'],
                    'cantidad'      => $item['cantidad'],
                    'precio_unitario'=> $item['precio'],
                    'subtotal'      => $item['cantidad'] * $item['precio'],
                ]);
                // Reserve stock
                $producto->update(['stock_actual' => $stockNuevo]);
                DB::table('inventario_movimientos')->insert([
                    'producto_id'    => $item['producto_id'],
                    'tipo'           => 'salida',
                    'cantidad'       => $item['cantidad'],
                    'stock_anterior' => $stockAnterior,
                    'stock_nuevo'    => $stockNuevo,
                    'motivo'         => 'Pedido ' . $numero,
                    'referencia'     => $numero,
                    'usuario_id'     => auth()->id(),
                    'fecha_hora'     => now(),
                ]);
            }

            // Auto-create despacho
            DB::table('despachos')->insert([
                'pedido_id'  => $pedidoId,
                'numero'     => 'DES-' . str_pad($pedidoId, 4, '0', STR_PAD_LEFT),
                'estado'     => 'pendiente',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Auto-notify Almacén
            DB::table('requerimientos')->insert([
                'area_origen'  => 'Ventas',
                'area_destino' => 'Almacén',
                'tipo'         => 'Despacho',
                'asunto'       => 'Nuevo pedido ' . $numero . ' listo para preparar',
                'descripcion'  => 'Se registró el pedido ' . $numero . ' por S/.' . number_format($total, 2) . '. Por favor preparar despacho.',
                'prioridad'    => 'alta',
                'estado'       => 'pendiente',
                'fecha_envio'  => now(),
                'usuario_envio'=> auth()->id(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);
        });

        return redirect()->route('pedidos.index')->with('success', 'Pedido registrado y despacho generado.');
    }

    public function show(Pedido $pedido)
    {
        $pedido->load(['cliente','usuario','detalle.producto','despacho']);
        return Inertia::render('Pedidos/Ver', ['pedido' => $pedido]);
    }

    public function actualizarEstado(Request $request, Pedido $pedido)
    {
        $request->validate(['estado' => 'required|in:en_preparacion,despachado,entregado,cancelado']);

        DB::transaction(function () use ($request, $pedido) {
            if ($request->estado === 'cancelado') {
                if (in_array($pedido->estado, ['despachado', 'entregado'], true)) {
                    throw ValidationException::withMessages([
                        'estado' => 'No se puede cancelar un pedido ya despachado o entregado.',
                    ]);
                }

                if ($pedido->estado !== 'cancelado') {
                    foreach ($pedido->detalle as $detalle) {
                        $producto = Producto::lockForUpdate()->findOrFail($detalle->producto_id);
                        $stockAnterior = $producto->stock_actual;
                        $stockNuevo = $stockAnterior + $detalle->cantidad;
                        $producto->update(['stock_actual' => $stockNuevo]);

                        DB::table('inventario_movimientos')->insert([
                            'producto_id'    => $producto->id,
                            'tipo'           => 'entrada',
                            'cantidad'       => $detalle->cantidad,
                            'stock_anterior' => $stockAnterior,
                            'stock_nuevo'    => $stockNuevo,
                            'motivo'         => 'Cancelación pedido ' . $pedido->numero,
                            'referencia'     => $pedido->numero,
                            'usuario_id'     => auth()->id(),
                            'fecha_hora'     => now(),
                        ]);
                    }
                }
            }

            $data = ['estado' => $request->estado];
            if ($request->estado === 'despachado') $data['fecha_despacho'] = now();
            if ($request->estado === 'entregado')  $data['fecha_entrega']  = now();
            $pedido->update($data);
        });

        return back()->with('success', 'Estado actualizado.');
    }
}
