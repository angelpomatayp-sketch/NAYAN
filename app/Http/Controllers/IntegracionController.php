<?php
namespace App\Http\Controllers;

use App\Support\DatabaseMetrics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IntegracionController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('requerimientos')
            ->join('users as u1','requerimientos.usuario_envio','=','u1.id')
            ->leftJoin('users as u2','requerimientos.usuario_atencion','=','u2.id')
            ->select('requerimientos.*','u1.name as remitente_nombre','u2.name as atencion_nombre');

        if ($request->filled('estado')) $query->where('requerimientos.estado', $request->estado);
        if ($request->filled('area'))   $query->where('requerimientos.area_destino', $request->area);
        if ($request->filled('buscar')) $query->where(fn($q) =>
            $q->where('requerimientos.asunto','like','%'.$request->buscar.'%')
              ->orWhere('requerimientos.area_origen','like','%'.$request->buscar.'%')
        );

        $requerimientos = $query->orderByDesc('fecha_envio')->paginate(10)->withQueryString();

        // TAFI stats
        $tafi = DB::table('requerimientos')
            ->whereNotNull('fecha_atencion')
            ->avg(DB::raw(DatabaseMetrics::diff('minute', 'fecha_envio', 'fecha_atencion')));

        $stats = [
            'pendientes'  => DB::table('requerimientos')->where('estado','pendiente')->count(),
            'en_atencion' => DB::table('requerimientos')->where('estado','en_atencion')->count(),
            'atendidos'   => DB::table('requerimientos')->where('estado','atendido')->count(),
            'tafi'        => round((float)$tafi, 1),
        ];

        $areas = ['Ventas','Almacén','Logística','Administración','Gerencia'];
        return Inertia::render('Integracion/Index', compact('requerimientos','stats','areas'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'area_destino' => 'required|string',
            'tipo'         => 'nullable|string',
            'asunto'       => 'required|string|max:200',
            'descripcion'  => 'required|string',
            'prioridad'    => 'required|in:baja,media,alta,urgente',
        ]);

        $areaMap = [
            'vendedor'  => 'Ventas',
            'almacen'   => 'Almacén',
            'logistica' => 'Logística',
            'gerente'   => 'Gerencia',
            'admin'     => $request->area_origen ?? 'Administración',
        ];
        $areaOrigen = $areaMap[auth()->user()->rol] ?? 'Administración';

        DB::table('requerimientos')->insert([
            'area_origen'  => $areaOrigen,
            'area_destino' => $request->area_destino,
            'tipo'         => $request->tipo,
            'asunto'       => $request->asunto,
            'descripcion'  => $request->descripcion,
            'prioridad'    => $request->prioridad,
            'estado'       => 'pendiente',
            'fecha_envio'  => now(),
            'usuario_envio'=> auth()->id(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        return back()->with('success', 'Requerimiento enviado correctamente.');
    }

    public function atender(Request $request, int $id)
    {
        $request->validate([
            'respuesta' => 'required|string',
            'estado'    => 'required|in:en_atencion,atendido',
        ]);

        $data = [
            'respuesta'        => $request->respuesta,
            'estado'           => $request->estado,
            'usuario_atencion' => auth()->id(),
            'updated_at'       => now(),
        ];
        if ($request->estado === 'atendido') $data['fecha_atencion'] = now();

        DB::table('requerimientos')->where('id', $id)->update($data);
        return back()->with('success', 'Requerimiento actualizado.');
    }
}
