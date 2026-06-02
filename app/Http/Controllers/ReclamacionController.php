<?php

namespace App\Http\Controllers;

use App\Models\Reclamacion;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReclamacionController extends Controller
{
    public function index()
    {
        $reclamaciones = DB::table('reclamaciones')
            ->join('pedidos', 'reclamaciones.pedido_id', '=', 'pedidos.id')
            ->join('users', 'reclamaciones.usuario_id', '=', 'users.id')
            ->leftJoin('clientes', 'pedidos.cliente_id', '=', 'clientes.id')
            ->select(
                'reclamaciones.*',
                'pedidos.numero as pedido_numero',
                'pedidos.total as pedido_total',
                'clientes.nombre as cliente_nombre',
                'users.name as vendedor_nombre'
            )
            ->orderByDesc('reclamaciones.fecha_reclamo')
            ->paginate(20);

        $totalEntregados = DB::table('pedidos')->where('estado', 'entregado')->count();
        $conReclamo      = DB::table('reclamaciones')->distinct('pedido_id')->count('pedido_id');
        $trc             = $totalEntregados > 0 ? round($conReclamo / $totalEntregados * 100, 1) : 0;

        $stats = [
            'total'      => DB::table('reclamaciones')->count(),
            'pendientes' => DB::table('reclamaciones')->where('estado', 'pendiente')->count(),
            'valor_total'=> (float) DB::table('reclamaciones')->sum('valor_reclamo'),
            'trc'        => $trc,
        ];

        return Inertia::render('Reclamaciones/Index', compact('reclamaciones', 'stats'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'pedido_id'           => 'required|exists:pedidos,id',
            'tipo'                => 'required|in:mal_estado,cantidad_incorrecta,producto_incorrecto,no_entregado,otro',
            'descripcion'         => 'required|string|max:500',
            'productos_afectados' => 'nullable|array',
        ]);

        $valorReclamo = 0;
        if ($request->productos_afectados) {
            $valorReclamo = collect($request->productos_afectados)
                ->sum(fn($p) => ($p['cantidad'] ?? 0) * ($p['precio_unitario'] ?? 0));
        }

        Reclamacion::create([
            'pedido_id'           => $request->pedido_id,
            'usuario_id'          => auth()->id(),
            'tipo'                => $request->tipo,
            'descripcion'         => $request->descripcion,
            'productos_afectados' => $request->productos_afectados,
            'valor_reclamo'       => $valorReclamo,
            'estado'              => 'pendiente',
            'fecha_reclamo'       => now(),
        ]);

        return back()->with('success', 'Reclamo registrado correctamente.');
    }

    public function update(Request $request, Reclamacion $reclamacion)
    {
        $request->validate(['estado' => 'required|in:pendiente,en_revision,resuelto']);
        $reclamacion->update(['estado' => $request->estado]);
        return back()->with('success', 'Estado del reclamo actualizado.');
    }
}
