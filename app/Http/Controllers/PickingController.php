<?php
namespace App\Http\Controllers;

use App\Support\DatabaseMetrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PickingController extends Controller
{
    public function index()
    {
        $despachos = DB::table('despachos')
            ->join('pedidos','despachos.pedido_id','=','pedidos.id')
            ->leftJoin('clientes','pedidos.cliente_id','=','clientes.id')
            ->leftJoin('users','despachos.usuario_picking','=','users.id')
            ->select('despachos.*','pedidos.numero as pedido_numero','pedidos.total',
                     'pedidos.fecha_entrada','pedidos.fecha_despacho',
                     'clientes.nombre as cliente_nombre','users.name as picker_nombre')
            ->when(request('buscar'), fn($q) => $q->where(fn($q2) =>
                $q2->where('despachos.numero','like','%'.request('buscar').'%')
                   ->orWhere('pedidos.numero','like','%'.request('buscar').'%')
                   ->orWhere('clientes.nombre','like','%'.request('buscar').'%')
            ))
            ->when(request('estado'), fn($q) => $q->where('despachos.estado', request('estado')))
            ->orderByDesc('despachos.created_at')
            ->paginate(10)->withQueryString();

        $stats = [
            'pendientes'   => DB::table('despachos')->where('estado','pendiente')->count(),
            'en_picking'   => DB::table('despachos')->where('estado','en_picking')->count(),
            'despachados'  => DB::table('despachos')->where('estado','despachado')->count(),
            'tasa_error'   => DB::table('despachos')->whereIn('estado',['despachado','entregado'])
                ->selectRaw('ROUND(' . DatabaseMetrics::booleanSum('tiene_error') . '/COUNT(*)*100,1) as tasa')
                ->value('tasa') ?? 0,
        ];

        return Inertia::render('Picking/Index', compact('despachos','stats'));
    }

    public function show(int $id)
    {
        $despacho = DB::table('despachos')
            ->join('pedidos','despachos.pedido_id','=','pedidos.id')
            ->leftJoin('clientes','pedidos.cliente_id','=','clientes.id')
            ->select('despachos.*','pedidos.numero as pedido_numero',
                     'pedidos.fecha_entrada','pedidos.fecha_despacho',
                     'clientes.nombre as cliente_nombre')
            ->where('despachos.id', $id)
            ->first();

        $items = DB::table('picking_items')
            ->join('productos','picking_items.producto_id','=','productos.id')
            ->where('picking_items.despacho_id', $id)
            ->select('picking_items.*','productos.nombre as producto_nombre','productos.codigo','productos.ubicacion_almacen')
            ->get();

        // Auto-create picking items if none exist
        if ($items->isEmpty() && $despacho) {
            $detalle = DB::table('pedidos_detalle')
                ->join('productos','pedidos_detalle.producto_id','=','productos.id')
                ->where('pedidos_detalle.pedido_id', $despacho->pedido_id)
                ->select('pedidos_detalle.producto_id','pedidos_detalle.cantidad','productos.ubicacion_almacen')
                ->get();
            foreach ($detalle as $d) {
                DB::table('picking_items')->insertOrIgnore([
                    'despacho_id'       => $id,
                    'producto_id'       => $d->producto_id,
                    'cantidad_solicitada'=> $d->cantidad,
                    'ubicacion'         => $d->ubicacion_almacen,
                    'estado'            => 'pendiente',
                ]);
            }
            $items = DB::table('picking_items')
                ->join('productos','picking_items.producto_id','=','productos.id')
                ->where('picking_items.despacho_id', $id)
                ->select('picking_items.*','productos.nombre as producto_nombre','productos.codigo','productos.ubicacion_almacen')
                ->get();
        }

        return Inertia::render('Picking/Ver', compact('despacho','items'));
    }

    public function iniciarPicking(int $id)
    {
        DB::table('despachos')->where('id', $id)->update([
            'estado'             => 'en_picking',
            'fecha_picking_inicio'=> now(),
            'usuario_picking'    => auth()->id(),
            'updated_at'         => now(),
        ]);
        return back()->with('success', 'Picking iniciado.');
    }

    public function confirmarItem(Request $request, int $itemId)
    {
        $request->validate([
            'cantidad_pickeada' => 'required|integer|min:0',
            'tiene_error'       => 'boolean',
            'tipo_error'        => 'nullable|string',
        ]);

        $item = DB::table('picking_items')
            ->join('despachos', 'picking_items.despacho_id', '=', 'despachos.id')
            ->where('picking_items.id', $itemId)
            ->select('picking_items.*', 'despachos.estado as despacho_estado')
            ->first();

        if (!$item) {
            abort(404);
        }
        if ($item->despacho_estado !== 'en_picking') {
            throw ValidationException::withMessages([
                'cantidad_pickeada' => 'Solo se pueden confirmar ítems de un despacho en picking.',
            ]);
        }
        if ($request->cantidad_pickeada > $item->cantidad_solicitada) {
            throw ValidationException::withMessages([
                'cantidad_pickeada' => 'La cantidad pickeada no puede superar la cantidad solicitada.',
            ]);
        }

        $tieneError = $request->boolean('tiene_error') || (int)$request->cantidad_pickeada !== (int)$item->cantidad_solicitada;
        $estado = $tieneError ? 'error' : 'confirmado';
        DB::table('picking_items')->where('id', $itemId)->update([
            'cantidad_pickeada' => $request->cantidad_pickeada,
            'estado'            => $estado,
            'tiene_error'       => $tieneError,
            'tipo_error'        => $tieneError ? ($request->tipo_error ?? 'cantidad_erronea') : null,
        ]);

        return back()->with('success', 'Ítem actualizado.');
    }

    public function finalizarDespacho(Request $request, int $id)
    {
        $request->validate([
            'costo_flete'    => 'required|numeric|min:0',
            'costo_embalaje' => 'required|numeric|min:0',
            'costo_personal' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $id) {
            $despacho = DB::table('despachos')->where('id', $id)->lockForUpdate()->first();
            if (!$despacho) {
                abort(404);
            }

            $items = DB::table('picking_items')->where('despacho_id', $id)->get();
            if ($items->isEmpty()) {
                throw ValidationException::withMessages([
                    'items' => 'No se puede finalizar un despacho sin ítems de picking.',
                ]);
            }
            if ($items->contains(fn($item) => $item->estado === 'pendiente')) {
                throw ValidationException::withMessages([
                    'items' => 'Todos los ítems deben confirmarse antes de finalizar.',
                ]);
            }
            if ($items->contains(fn($item) => $item->tiene_error || (int)$item->cantidad_pickeada !== (int)$item->cantidad_solicitada)) {
                throw ValidationException::withMessages([
                    'items' => 'No se puede finalizar el despacho con diferencias de cantidad. Corrige el picking antes de despachar.',
                ]);
            }

            $total = $request->costo_flete + $request->costo_embalaje + $request->costo_personal;

            DB::table('despachos')->where('id', $id)->update([
                'estado'             => 'despachado',
                'fecha_picking_fin'  => now(),
                'costo_flete'        => $request->costo_flete,
                'costo_embalaje'     => $request->costo_embalaje,
                'costo_personal'     => $request->costo_personal,
                'costo_total'        => $total,
                'tiene_error'        => false,
                'codigo_confirmacion'=> strtoupper(substr(md5(uniqid()), 0, 8)),
                'updated_at'         => now(),
            ]);

            $pedido = DB::table('pedidos')->where('id', $despacho->pedido_id)->first();

            DB::table('pedidos')->where('id', $despacho->pedido_id)->update([
                'estado'        => 'despachado',
                'fecha_despacho'=> now(),
                'updated_at'    => now(),
            ]);

            if ($pedido) {
                DB::table('requerimientos')
                    ->where('asunto', 'like', '%' . $pedido->numero . '%')
                    ->where('area_destino', 'Almacén')
                    ->where('estado', '!=', 'atendido')
                    ->update([
                        'estado'           => 'atendido',
                        'fecha_atencion'   => now(),
                        'usuario_atencion' => auth()->id(),
                        'respuesta'        => 'Despacho finalizado automáticamente.',
                        'updated_at'       => now(),
                    ]);
            }
        });

        return redirect()->route('picking.index')->with('success', 'Despacho finalizado correctamente.');
    }
}
