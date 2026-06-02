<?php
namespace App\Http\Controllers;

use App\Models\Proveedor;
use App\Models\Producto;
use App\Support\DatabaseMetrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CompraController extends Controller
{
    public function index()
    {
        $ordenes = DB::table('ordenes_compra')
            ->join('proveedores','ordenes_compra.proveedor_id','=','proveedores.id')
            ->join('users','ordenes_compra.usuario_id','=','users.id')
            ->select('ordenes_compra.*','proveedores.nombre as proveedor_nombre','users.name as usuario_nombre')
            ->when(request('buscar'), fn($q) => $q->where(fn($q2) =>
                $q2->where('ordenes_compra.numero','like','%'.request('buscar').'%')
                   ->orWhere('proveedores.nombre','like','%'.request('buscar').'%')
            ))
            ->when(request('estado'), fn($q) => $q->where('ordenes_compra.estado', request('estado')))
            ->orderByDesc('ordenes_compra.created_at')
            ->paginate(10)->withQueryString();

        $stats = [
            'pendientes' => DB::table('ordenes_compra')->where('estado','pendiente')->count(),
            'enviadas'   => DB::table('ordenes_compra')->where('estado','enviada')->count(),
            'recibidas_mes' => DB::table('ordenes_compra')->where('estado','recibida')
                ->whereBetween('fecha_recepcion', DatabaseMetrics::currentMonthRange())->count(),
            'tpri' => round((float) DB::table('solicitudes_reposicion')
                ->whereNotNull('fecha_recepcion')
                ->avg(DB::raw(DatabaseMetrics::diff('day', 'fecha_solicitud', 'fecha_recepcion'))), 1),
        ];

        return Inertia::render('Compras/Index', compact('ordenes','stats'));
    }

    public function create(Request $request)
    {
        $proveedores = Proveedor::where('activo',1)->orderBy('nombre')->get(['id','nombre','condiciones_pago']);
        $productos   = Producto::where('activo',1)->orderBy('nombre')
            ->get(['id','codigo','nombre','precio_compra','stock_actual','stock_reorden']);
        $productoPresel = $request->filled('producto') ? Producto::find($request->producto) : null;

        $productosAlerta = Producto::where('activo',1)
            ->whereRaw('stock_actual <= stock_reorden')
            ->orderBy('stock_actual')
            ->get(['id','codigo','nombre','precio_compra','stock_actual','stock_minimo','stock_reorden']);

        return Inertia::render('Compras/Nueva', compact('proveedores','productos','productoPresel','productosAlerta'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'proveedor_id'   => 'required|exists:proveedores,id',
            'fecha_esperada' => 'nullable|date',
            'items'          => 'required|array|min:1',
            'items.*.producto_id'   => 'required|exists:productos,id',
            'items.*.cantidad'      => 'required|integer|min:1',
            'items.*.precio_unitario' => 'required|numeric|min:0',
            'observaciones'  => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $total = collect($request->items)->sum(fn($i) => $i['cantidad'] * $i['precio_unitario']);
            $numero = 'OC-' . str_pad(DB::table('ordenes_compra')->count() + 1, 4, '0', STR_PAD_LEFT);

            $ordenId = DB::table('ordenes_compra')->insertGetId([
                'numero'        => $numero,
                'proveedor_id'  => $request->proveedor_id,
                'fecha_emision' => now(),
                'fecha_esperada'=> $request->fecha_esperada,
                'estado'        => 'pendiente',
                'total'         => $total,
                'usuario_id'    => auth()->id(),
                'observaciones' => $request->observaciones,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            foreach ($request->items as $item) {
                DB::table('ordenes_compra_detalle')->insert([
                    'orden_id'       => $ordenId,
                    'producto_id'    => $item['producto_id'],
                    'cantidad'       => $item['cantidad'],
                    'precio_unitario'=> $item['precio_unitario'],
                    'cantidad_recibida'=> 0,
                ]);
                // Log reposition request
                DB::table('solicitudes_reposicion')->insertOrIgnore([
                    'producto_id'     => $item['producto_id'],
                    'orden_compra_id' => $ordenId,
                    'estado'          => 'en_proceso',
                    'usuario_id'      => auth()->id(),
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
            }
        });

        return redirect()->route('compras.index')->with('success', 'Orden de compra creada.');
    }

    public function recibir(int $id)
    {
        $orden = DB::table('ordenes_compra')
            ->join('proveedores','ordenes_compra.proveedor_id','=','proveedores.id')
            ->select('ordenes_compra.*','proveedores.nombre as proveedor_nombre')
            ->where('ordenes_compra.id', $id)->first();

        $items = DB::table('ordenes_compra_detalle')
            ->join('productos','ordenes_compra_detalle.producto_id','=','productos.id')
            ->where('ordenes_compra_detalle.orden_id', $id)
            ->select('ordenes_compra_detalle.*','productos.nombre as producto_nombre','productos.stock_actual')
            ->get();

        return Inertia::render('Compras/Recibir', compact('orden','items'));
    }

    public function procesarRecepcion(Request $request, int $id)
    {
        $request->validate([
            'items'                 => 'required|array',
            'items.*.detalle_id'    => 'required|integer',
            'items.*.producto_id'   => 'required|exists:productos,id',
            'items.*.cantidad_recibida' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($request, $id) {
            $orden = DB::table('ordenes_compra')->where('id', $id)->lockForUpdate()->first();
            if (!$orden) {
                abort(404);
            }
            if ($orden->estado === 'recibida') {
                throw ValidationException::withMessages([
                    'items' => 'Esta orden de compra ya fue recibida.',
                ]);
            }

            foreach ($request->items as $item) {
                $detalle = DB::table('ordenes_compra_detalle')
                    ->where('id', $item['detalle_id'])
                    ->where('orden_id', $id)
                    ->lockForUpdate()
                    ->first();
                if (!$detalle) continue;
                if ($item['cantidad_recibida'] > $detalle->cantidad) {
                    throw ValidationException::withMessages([
                        'items' => 'La cantidad recibida no puede superar la cantidad solicitada.',
                    ]);
                }
                if ($item['cantidad_recibida'] < $detalle->cantidad_recibida) {
                    throw ValidationException::withMessages([
                        'items' => 'La cantidad recibida no puede ser menor a una recepción ya registrada.',
                    ]);
                }

                $cantidadNueva = $item['cantidad_recibida'] - $detalle->cantidad_recibida;
                if ($cantidadNueva <= 0) continue;

                $producto = Producto::lockForUpdate()->findOrFail($detalle->producto_id);
                $stockAnterior = $producto->stock_actual;
                $stockNuevo    = $stockAnterior + $cantidadNueva;

                $producto->update(['stock_actual' => $stockNuevo]);

                DB::table('inventario_movimientos')->insert([
                    'producto_id'    => $item['producto_id'],
                    'tipo'           => 'entrada',
                    'cantidad'       => $cantidadNueva,
                    'stock_anterior' => $stockAnterior,
                    'stock_nuevo'    => $stockNuevo,
                    'motivo'         => 'Recepción OC #' . $id,
                    'referencia'     => DB::table('ordenes_compra')->where('id',$id)->value('numero'),
                    'usuario_id'     => auth()->id(),
                    'fecha_hora'     => now(),
                ]);

                DB::table('ordenes_compra_detalle')->where('id', $item['detalle_id'])
                    ->update(['cantidad_recibida' => $item['cantidad_recibida']]);
            }

            $pendientes = DB::table('ordenes_compra_detalle')
                ->where('orden_id', $id)
                ->whereColumn('cantidad_recibida', '<', 'cantidad')
                ->exists();

            DB::table('ordenes_compra')->where('id', $id)->update([
                'estado'          => $pendientes ? 'enviada' : 'recibida',
                'fecha_recepcion' => $pendientes ? null : now(),
                'updated_at'      => now(),
            ]);

            // Update solicitudes reposicion
            DB::table('solicitudes_reposicion')
                ->where('orden_compra_id', $id)
                ->update([
                    'estado' => $pendientes ? 'en_proceso' : 'recibido',
                    'fecha_recepcion' => $pendientes ? null : now(),
                    'updated_at' => now(),
                ]);
        });

        return redirect()->route('compras.index')->with('success', 'Recepción registrada e inventario actualizado.');
    }
}
