<?php
namespace App\Http\Controllers;

use App\Models\Producto;
use App\Support\DatabaseMetrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ReporteController extends Controller
{
    public function index()
    {
        $kpis = $this->calcularKPIs();
        $histFinanciero = DB::table("datos_financieros")->orderBy("periodo")->get()->map(fn($r)=>[
            "periodo"=>$r->periodo,
            "roa"=>$r->activos_totales>0?round($r->utilidad_neta/$r->activos_totales*100,2):0,
            "mn"=>$r->ventas_netas>0?round($r->utilidad_neta/$r->ventas_netas*100,2):0,
            "clv"=>$r->ventas_netas>0?round($r->costos_logisticos/$r->ventas_netas*100,2):0,
            "ventas"=>$r->ventas_netas,
            "utilidad"=>$r->utilidad_neta,
        ]);
        return Inertia::render("Reportes/Index", compact("kpis","histFinanciero"));
    }

    // ── EXCEL EXPORTS ─────────────────────────────────────────────
    public function exportar(Request $request)
    {
        $tipo = $request->tipo ?? "inventario";
        $spreadsheet = new Spreadsheet();
        $spreadsheet->getProperties()
            ->setCreator('NAYAN Mobile Accessories')
            ->setTitle('Reporte ' . ucfirst($tipo));

        match($tipo) {
            "inventario" => $this->xlsInventario($spreadsheet),
            "pedidos"    => $this->xlsPedidos($spreadsheet),
            "kpis"       => $this->xlsKPIs($spreadsheet),
            "financiero" => $this->xlsFinanciero($spreadsheet),
            default      => $this->xlsInventario($spreadsheet),
        };

        $filename = "nayan_{$tipo}_" . date("Y-m-d") . ".xlsx";
        $writer   = new Xlsx($spreadsheet);

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function headerStyle(): array
    {
        return [
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1e3a5f']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ];
    }

    private function rowStyle(): array
    {
        return ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_HAIR, 'color' => ['rgb' => 'CCCCCC']]]];
    }

    private function xlsInventario(Spreadsheet $s): void
    {
        $sheet = $s->getActiveSheet()->setTitle('Inventario');
        $headers = ['Código','Nombre','Categoría','Stock Actual','Stock Mínimo','Punto Reorden','P.Compra','P.Venta','Ubicación','Estado'];
        $sheet->fromArray([$headers], null, 'A1');
        $sheet->getStyle('A1:J1')->applyFromArray($this->headerStyle());

        $row = 2;
        DB::table("productos")->join("categorias","productos.categoria_id","=","categorias.id","left")
            ->select("productos.*","categorias.nombre as categoria")->where("productos.activo",1)->orderBy("nombre")
            ->each(function($p) use ($sheet, &$row) {
                $estado = $p->stock_actual <= $p->stock_minimo ? 'Crítico' : ($p->stock_actual <= $p->stock_reorden ? 'Bajo' : 'OK');
                $sheet->fromArray([[$p->codigo,$p->nombre,$p->categoria??'-',$p->stock_actual,$p->stock_minimo,$p->stock_reorden,$p->precio_compra,$p->precio_venta,$p->ubicacion_almacen??'-',$estado]], null, "A{$row}");
                if ($estado === 'Crítico') $sheet->getStyle("A{$row}:J{$row}")->getFont()->getColor()->setRGB('DC2626');
                $sheet->getStyle("A{$row}:J{$row}")->applyFromArray($this->rowStyle());
                $row++;
            });
        foreach (range('A','J') as $col) $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    private function xlsPedidos(Spreadsheet $s): void
    {
        $sheet = $s->getActiveSheet()->setTitle('Pedidos');
        $headers = ['N° Pedido','Cliente','Fecha Entrada','Fecha Despacho','Estado','Total','Tiempo (h)'];
        $sheet->fromArray([$headers], null, 'A1');
        $sheet->getStyle('A1:G1')->applyFromArray($this->headerStyle());

        $row = 2;
        DB::table("pedidos")->leftJoin("clientes","pedidos.cliente_id","=","clientes.id")
            ->select("pedidos.*","clientes.nombre as cliente")->orderByDesc("fecha_entrada")
            ->each(function($p) use ($sheet, &$row) {
                $horas = $p->fecha_despacho ? round((strtotime($p->fecha_despacho)-strtotime($p->fecha_entrada))/3600,1) : '-';
                $sheet->fromArray([[$p->numero,$p->cliente??"Mostrador",$p->fecha_entrada,$p->fecha_despacho??'-',$p->estado,$p->total,$horas]], null, "A{$row}");
                $sheet->getStyle("A{$row}:G{$row}")->applyFromArray($this->rowStyle());
                $row++;
            });
        foreach (range('A','G') as $col) $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    private function xlsKPIs(Spreadsheet $s): void
    {
        $sheet = $s->getActiveSheet()->setTitle('KPIs');
        $kpis  = $this->calcularKPIs();
        $headers = ['KPI','Dimensión','Valor','Unidad','Meta','Estado'];
        $sheet->fromArray([$headers], null, 'A1');
        $sheet->getStyle('A1:F1')->applyFromArray($this->headerStyle());

        $rows = [
            ['TPRI','D1 - Planificación Digital',$kpis['tpri']??'-','días','≤7 días',$this->semLabel($kpis['tpri'],7,15)],
            ['TAFI','D2 - Integración Operativa',$kpis['tafi']??'-','min','≤15 min',$this->semLabel($kpis['tafi'],15,29)],
            ['TPPP','D3 - Ejecución Automatizada',$kpis['tppp']??'-','horas','≤5 h',$this->semLabel($kpis['tppp'],5,15)],
            ['EI','D4 - Trazabilidad',$kpis['ei']??'-','%','≥95%',$this->semLabel($kpis['ei'],95,90,true)],
            ['PEPD','D5a - Control Logístico',$kpis['pepd']??'-','%','<1%',$this->semLabel($kpis['pepd'],1,3)],
            ['CLP','D5b - Control Logístico',$kpis['clp']??'-','S/.','≤S/.10',$this->semLabel($kpis['clp'],10,20)],
            ['TRC','D6 - Reclamos Cliente',$kpis['trc']??'-','%','<2%',$this->semLabel($kpis['trc'],2,5)],
            ['ROA','Rentabilidad',$kpis['roa']??'-','%','≥4%',$this->semLabel($kpis['roa'],4,2,true)],
            ['Margen Neto','Rentabilidad',$kpis['mn']??'-','%','≥10%',$this->semLabel($kpis['mn'],10,6,true)],
            ['CL/Ventas','Rentabilidad Logística',$kpis['clv']??'-','%','<8%',$this->semLabel($kpis['clv'],8,12)],
        ];
        $sheet->fromArray($rows, null, 'A2');
        foreach (range('A','F') as $col) $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    private function xlsFinanciero(Spreadsheet $s): void
    {
        $sheet = $s->getActiveSheet()->setTitle('Financiero');
        $headers = ['Período','Ventas Netas','Utilidad Neta','Activos Totales','Costos Logísticos','ROA (%)','MN (%)','CL/V (%)'];
        $sheet->fromArray([$headers], null, 'A1');
        $sheet->getStyle('A1:H1')->applyFromArray($this->headerStyle());

        $row = 2;
        DB::table("datos_financieros")->orderBy("periodo")->each(function($r) use ($sheet, &$row) {
            $sheet->fromArray([[
                $r->periodo,$r->ventas_netas,$r->utilidad_neta,$r->activos_totales,$r->costos_logisticos,
                $r->activos_totales>0?round($r->utilidad_neta/$r->activos_totales*100,2):0,
                $r->ventas_netas>0?round($r->utilidad_neta/$r->ventas_netas*100,2):0,
                $r->ventas_netas>0?round($r->costos_logisticos/$r->ventas_netas*100,2):0,
            ]], null, "A{$row}");
            $sheet->getStyle("A{$row}:H{$row}")->applyFromArray($this->rowStyle());
            $row++;
        });
        foreach (range('A','H') as $col) $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    private function semLabel(float $v, float $verde, float $amarillo, bool $mayorMejor = false): string
    {
        if (!$v && $v !== 0.0) return '—';
        if ($mayorMejor) return $v >= $verde ? '✓ Meta' : ($v >= $amarillo ? '⚠ Alerta' : '✗ Fuera');
        return $v <= $verde ? '✓ Meta' : ($v <= $amarillo ? '⚠ Alerta' : '✗ Fuera');
    }

    // ── PDF EXPORTS ──────────────────────────────────────────────
    public function exportarPDF(Request $request)
    {
        $tipo = $request->tipo ?? 'kpis';
        $pdf  = match($tipo) {
            'inventario' => $this->pdfInventario(),
            'pedidos'    => $this->pdfPedidos(),
            'financiero' => $this->pdfFinanciero(),
            'kardex'     => $this->pdfKardex(),
            default      => $this->pdfKPIs(),
        };
        $filename = 'nayan_' . $tipo . '_' . now()->format('Y-m-d') . '.pdf';
        return $pdf->download($filename);
    }

    private function pdfKardex()
    {
        $movimientos = DB::table('inventario_movimientos')
            ->join('productos', 'inventario_movimientos.producto_id', '=', 'productos.id')
            ->join('users', 'inventario_movimientos.usuario_id', '=', 'users.id')
            ->select(
                'inventario_movimientos.*',
                'productos.nombre as producto_nombre',
                'productos.codigo as producto_codigo',
                'users.name as usuario_nombre'
            )
            ->orderByDesc('inventario_movimientos.fecha_hora')
            ->limit(500)
            ->get();

        $stats = [
            'total'    => $movimientos->count(),
            'entradas' => $movimientos->where('tipo', 'entrada')->count(),
            'salidas'  => $movimientos->where('tipo', 'salida')->count(),
            'ajustes'  => $movimientos->whereIn('tipo', ['ajuste','conteo_fisico'])->count(),
        ];

        return Pdf::loadView('pdf.kardex', [
            'titulo'      => 'Kardex General de Movimientos',
            'movimientos' => $movimientos,
            'stats'       => $stats,
            'usuario'     => auth()->user()->name,
        ])->setPaper('a4', 'landscape');
    }

    private function pdfKPIs()
    {
        $kpis = $this->calcularKPIs();
        $histFinanciero = DB::table('datos_financieros')->orderBy('periodo')->get();
        $kpis['sem_tpri'] = $this->sem($kpis['tpri'], 7, 15);
        $kpis['sem_tafi'] = $this->sem($kpis['tafi'], 15, 29);
        $kpis['sem_tppp'] = $this->sem($kpis['tppp'], 5, 15);
        $kpis['sem_ei']   = $this->sem($kpis['ei'], 95, 90, true);
        $kpis['sem_pepd'] = $this->sem($kpis['pepd'], 1, 3);
        $kpis['sem_clp']  = $this->sem($kpis['clp'], 10, 20);
        $kpis['sem_trc']  = $this->sem($kpis['trc'], 2, 5);
        $kpis['sem_roa']  = $this->sem($kpis['roa'], 4, 2, true);
        $kpis['sem_mn']   = $this->sem($kpis['mn'], 10, 6, true);
        $kpis['sem_clv']  = $this->sem($kpis['clv'], 8, 12);
        return Pdf::loadView('pdf.kpis', [
            'titulo'         => 'Reporte de KPIs — Gestión Logística y Rentabilidad',
            'kpis'           => $kpis,
            'histFinanciero' => $histFinanciero,
            'usuario'        => auth()->user()->name,
        ])->setPaper('a4', 'landscape');
    }

    private function pdfInventario()
    {
        $productos = Producto::with('categoria')->where('activo', 1)->orderBy('nombre')->get();
        $alertas   = Producto::where('activo', 1)->whereRaw('stock_actual <= stock_reorden')->orderByRaw('(stock_actual - stock_minimo)')->get();
        $stats = [
            'total'   => $productos->count(),
            'critico' => $productos->filter(fn($p) => $p->stock_actual <= $p->stock_minimo)->count(),
            'bajo'    => $productos->filter(fn($p) => $p->stock_actual > $p->stock_minimo && $p->stock_actual <= $p->stock_reorden)->count(),
            'valor'   => $productos->sum(fn($p) => $p->stock_actual * $p->precio_compra),
        ];
        return Pdf::loadView('pdf.inventario', [
            'titulo'    => 'Reporte de Inventario',
            'productos' => $productos,
            'alertas'   => $alertas,
            'stats'     => $stats,
            'usuario'   => auth()->user()->name,
        ])->setPaper('a4', 'landscape');
    }

    private function pdfPedidos()
    {
        $pedidos = DB::table('pedidos')
            ->leftJoin('clientes', 'pedidos.cliente_id', '=', 'clientes.id')
            ->select('pedidos.*', 'clientes.nombre as cliente_nombre')
            ->orderByDesc('pedidos.fecha_entrada')->limit(200)->get();
        $stats = [
            'total'      => $pedidos->count(),
            'entregados' => $pedidos->where('estado', 'entregado')->count(),
            'pendientes' => $pedidos->whereIn('estado', ['registrado','en_preparacion'])->count(),
            'ventas'     => $pedidos->sum('total'),
        ];
        return Pdf::loadView('pdf.pedidos', [
            'titulo'  => 'Reporte de Pedidos y Ventas',
            'pedidos' => $pedidos,
            'stats'   => $stats,
            'periodo' => 'Todos los registros',
            'usuario' => auth()->user()->name,
        ])->setPaper('a4', 'landscape');
    }

    private function pdfFinanciero()
    {
        $historial = DB::table('datos_financieros')->orderBy('periodo')->get();
        $finActual = DB::table('datos_financieros')->orderByDesc('periodo')->first();
        $kpis      = $this->calcularKPIs();
        return Pdf::loadView('pdf.financiero', [
            'titulo'    => 'Reporte de Datos Financieros y Rentabilidad',
            'historial' => $historial,
            'finActual' => $finActual,
            'kpis'      => $kpis,
            'usuario'   => auth()->user()->name,
        ])->setPaper('a4', 'landscape');
    }

    private function sem(float $v, float $verde, float $amarillo, bool $mayorMejor = false): string
    {
        if (!$v && $v !== 0.0) return 'gris';
        if ($mayorMejor) {
            if ($v >= $verde)    return 'verde';
            if ($v >= $amarillo) return 'amarillo';
            return 'rojo';
        }
        if ($v <= $verde)    return 'verde';
        if ($v <= $amarillo) return 'amarillo';
        return 'rojo';
    }

    private function calcularKPIs(): array
    {
        $fin = DB::table("datos_financieros")->orderByDesc("periodo")->first();
        $totalEntregados = DB::table("pedidos")->where("estado","entregado")->count();
        $conReclamo      = DB::table("reclamaciones")->distinct("pedido_id")->count("pedido_id");
        return [
            "tpri" => round((float)DB::table("solicitudes_reposicion")->whereNotNull("fecha_recepcion")->avg(DB::raw(DatabaseMetrics::diff("day", "fecha_solicitud", "fecha_recepcion"))),1),
            "tafi" => round((float)DB::table("requerimientos")->whereNotNull("fecha_atencion")->avg(DB::raw(DatabaseMetrics::diff("minute", "fecha_envio", "fecha_atencion"))),1),
            "tppp" => round((float)DB::table("pedidos")->whereNotNull("fecha_despacho")->avg(DB::raw(DatabaseMetrics::diff("hour", "fecha_entrada", "fecha_despacho"))),1),
            "ei"   => (float)DB::table("conteos_fisicos")->where("estado","completado")->orderByDesc("fecha_fin")->value("porcentaje_exactitud"),
            "pepd" => (function(){ $r=DB::table("despachos")->whereIn("estado",["despachado","entregado"])->selectRaw("COUNT(*) as t," . DatabaseMetrics::booleanSum("tiene_error") . " as e")->first(); return $r->t>0?round($r->e/$r->t*100,1):0; })(),
            "clp"  => round((float)DB::table("despachos")->whereIn("estado",["despachado","entregado"])->avg("costo_total"),2),
            "trc"  => $totalEntregados > 0 ? round($conReclamo / $totalEntregados * 100, 1) : 0,
            "roa"  => $fin&&$fin->activos_totales>0?round($fin->utilidad_neta/$fin->activos_totales*100,2):0,
            "mn"   => $fin&&$fin->ventas_netas>0?round($fin->utilidad_neta/$fin->ventas_netas*100,2):0,
            "clv"  => $fin&&$fin->ventas_netas>0?round($fin->costos_logisticos/$fin->ventas_netas*100,2):0,
        ];
    }
}
