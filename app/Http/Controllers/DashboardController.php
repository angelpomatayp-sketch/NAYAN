<?php

namespace App\Http\Controllers;

use App\Support\DatabaseMetrics;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // ── TPRI: Tiempo promedio reposición inventario (días) ──
        $tpri = DB::table('solicitudes_reposicion')
            ->whereNotNull('fecha_recepcion')
            ->where('fecha_solicitud', '>=', now()->subMonths(3))
            ->avg(DB::raw(DatabaseMetrics::diff('day', 'fecha_solicitud', 'fecha_recepcion')));

        // ── TAFI: Tiempo promedio flujo de información (minutos) ──
        $tafi = DB::table('requerimientos')
            ->whereNotNull('fecha_atencion')
            ->where('fecha_envio', '>=', now()->subMonths(3))
            ->avg(DB::raw(DatabaseMetrics::diff('minute', 'fecha_envio', 'fecha_atencion')));

        // ── TPPP: Tiempo promedio procesamiento pedido (horas) ──
        $tppp = DB::table('pedidos')
            ->whereNotNull('fecha_despacho')
            ->where('fecha_entrada', '>=', now()->subMonths(3))
            ->avg(DB::raw(DatabaseMetrics::diff('hour', 'fecha_entrada', 'fecha_despacho')));

        // ── EI: Exactitud de inventario (%) ──
        $ei = DB::table('conteos_fisicos')
            ->where('estado', 'completado')
            ->orderByDesc('fecha_fin')
            ->value('porcentaje_exactitud');

        // ── PEPD: % Errores picking/despacho ──
        $despachoStats = DB::table('despachos')
            ->whereIn('estado', ['despachado','entregado'])
            ->where('fecha_picking_inicio', '>=', now()->subMonths(3))
            ->selectRaw('COUNT(*) as total, SUM(tiene_error) as errores')
            ->first();
        $pepd = $despachoStats->total > 0
            ? round(($despachoStats->errores / $despachoStats->total) * 100, 1)
            : null;

        // ── CLP: Costo logístico promedio por pedido ──
        $clp = DB::table('despachos')
            ->whereIn('estado', ['despachado','entregado'])
            ->where('fecha_picking_inicio', '>=', now()->subMonths(3))
            ->avg('costo_total');

        // ── Financieros: ROA, MN, CL/V ──
        $fin = DB::table('datos_financieros')->orderByDesc('periodo')->first();
        $roa = $clv = $mn = null;
        if ($fin && $fin->activos_totales > 0 && $fin->ventas_netas > 0) {
            $roa = round(($fin->utilidad_neta / $fin->activos_totales) * 100, 2);
            $mn  = round(($fin->utilidad_neta / $fin->ventas_netas) * 100, 2);
            $clv = round(($fin->costos_logisticos / $fin->ventas_netas) * 100, 2);
        }

        // ── Stats rápidos ──
        $totalPedidosMes   = DB::table('pedidos')->whereBetween('fecha_entrada', DatabaseMetrics::currentMonthRange())->count();
        $pendientesDespacho= DB::table('despachos')->whereIn('estado',['pendiente','en_picking'])->count();
        $stockCritico      = DB::table('productos')->where('activo',1)->whereRaw('stock_actual <= stock_minimo')->count();
        $reqPendientes     = DB::table('requerimientos')->where('estado','pendiente')->count();

        // ── Últimos pedidos ──
        $ultimosPedidos = DB::table('pedidos')
            ->leftJoin('clientes','pedidos.cliente_id','=','clientes.id')
            ->select('pedidos.numero','pedidos.estado','pedidos.total','pedidos.fecha_entrada','clientes.nombre as cliente')
            ->orderByDesc('pedidos.fecha_entrada')
            ->limit(6)
            ->get();

        // ── Ventas por mes (6 meses) ──
        $monthBucket = DatabaseMetrics::monthBucket('fecha_entrada');
        $ventasMes = DB::table('pedidos')
            ->where('fecha_entrada', '>=', now()->subMonths(6))
            ->selectRaw("{$monthBucket} as mes, COUNT(*) as num_pedidos, ROUND(SUM(total),2) as total_ventas")
            ->groupByRaw($monthBucket)
            ->orderBy('mes')
            ->get();

        // ── Histórico financiero ──
        $histFinanciero = DB::table('datos_financieros')
            ->orderBy('periodo')
            ->limit(6)
            ->get()
            ->map(fn($r) => [
                'periodo' => $r->periodo,
                'roa'     => $r->activos_totales > 0 ? round($r->utilidad_neta / $r->activos_totales * 100, 2) : 0,
                'mn'      => $r->ventas_netas > 0    ? round($r->utilidad_neta / $r->ventas_netas * 100, 2)    : 0,
                'clv'     => $r->ventas_netas > 0    ? round($r->costos_logisticos / $r->ventas_netas * 100, 2): 0,
            ]);

        // ── Alertas stock ──
        $alertasStock = DB::table('productos')
            ->where('activo', 1)
            ->whereRaw('stock_actual <= stock_reorden')
            ->orderByRaw('(stock_actual - stock_minimo)')
            ->limit(6)
            ->get(['id','nombre','stock_actual','stock_minimo','stock_reorden']);

        return Inertia::render('Dashboard', compact(
            'tpri','tafi','tppp','ei','pepd','clp','roa','mn','clv',
            'totalPedidosMes','pendientesDespacho','stockCritico','reqPendientes',
            'ultimosPedidos','ventasMes','histFinanciero','alertasStock'
        ));
    }
}
