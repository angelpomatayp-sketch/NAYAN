<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventarioController extends Controller
{
    public function index(Request $request)
    {
        $query = Producto::with('categoria')->where('activo', 1);

        if ($request->filled('buscar')) {
            $query->where(fn($q) => $q->where('nombre','like','%'.$request->buscar.'%')->orWhere('codigo','like','%'.$request->buscar.'%'));
        }
        if ($request->filled('categoria')) {
            $query->where('categoria_id', $request->categoria);
        }
        if ($request->filled('estado')) {
            match($request->estado) {
                'critico' => $query->whereRaw('stock_actual <= stock_minimo'),
                'bajo'    => $query->whereRaw('stock_actual > stock_minimo AND stock_actual <= stock_reorden'),
                'ok'      => $query->whereRaw('stock_actual > stock_reorden'),
                default   => null,
            };
        }

        $productos = $query->orderBy('nombre')->paginate(10)->through(fn($p) => [
            ...$p->toArray(),
            'stock_status'     => $p->stock_status,
            'categoria_nombre' => $p->categoria?->nombre,
        ])->withQueryString();
        $categorias  = Categoria::orderBy('nombre')->get();
        $stats = [
            'total'          => Producto::where('activo',1)->count(),
            'critico'        => Producto::where('activo',1)->whereRaw('stock_actual<=stock_minimo')->count(),
            'bajo'           => Producto::where('activo',1)->whereRaw('stock_actual>stock_minimo AND stock_actual<=stock_reorden')->count(),
            'valor_inventario'=> (float) Producto::where('activo',1)->sum(DB::raw('stock_actual * precio_compra')),
        ];

        return Inertia::render('Inventario/Index', compact('productos','categorias','stats'));
    }

    public function kardex(Request $request)
    {
        $productos = Producto::where('activo',1)->orderBy('nombre')->get(['id','codigo','nombre','stock_actual']);
        $movimientos = [];
        $productoSel = null;

        if ($request->filled('producto')) {
            $productoSel = Producto::find($request->producto);
            if ($productoSel) {
                $movimientos = DB::table('inventario_movimientos')
                    ->join('users','inventario_movimientos.usuario_id','=','users.id')
                    ->where('inventario_movimientos.producto_id', $request->producto)
                    ->when($request->buscar, fn($q) => $q->where(fn($q2) =>
                        $q2->where('inventario_movimientos.motivo','like','%'.$request->buscar.'%')
                           ->orWhere('inventario_movimientos.tipo','like','%'.$request->buscar.'%')
                    ))
                    ->select('inventario_movimientos.*','users.name as usuario_nombre')
                    ->orderByDesc('fecha_hora')
                    ->paginate(10)->withQueryString();
            }
        }

        return Inertia::render('Inventario/Kardex', compact('productos','movimientos','productoSel'));
    }

    public function conteo()
    {
        $productos = Producto::where('activo',1)->orderBy('nombre')
            ->get(['id','codigo','nombre','stock_actual','ubicacion_almacen']);
        $ultimosConteos = DB::table('conteos_fisicos')
            ->join('users','conteos_fisicos.usuario_id','=','users.id')
            ->select('conteos_fisicos.*','users.name as usuario_nombre')
            ->orderByDesc('fecha_inicio')->limit(5)->get();

        return Inertia::render('Inventario/Conteo', compact('productos','ultimosConteos'));
    }

    public function registrarMovimiento(Request $request)
    {
        $request->validate([
            'producto_id' => 'required|exists:productos,id',
            'tipo'        => 'required|in:entrada,salida,ajuste',
            'cantidad'    => 'required|integer|min:1',
            'motivo'      => 'nullable|string|max:200',
        ]);

        $producto = Producto::lockForUpdate()->findOrFail($request->producto_id);
        $stockAnterior = $producto->stock_actual;

        $stockNuevo = match($request->tipo) {
            'entrada' => $stockAnterior + $request->cantidad,
            'salida'  => $stockAnterior - $request->cantidad,
            'ajuste'  => (int)$request->cantidad,
        };

        if ($stockNuevo < 0) {
            return back()->withErrors(['cantidad' => 'Stock insuficiente para registrar la salida.']);
        }

        DB::transaction(function () use ($request, $producto, $stockAnterior, $stockNuevo) {
            DB::table('inventario_movimientos')->insert([
                'producto_id'    => $producto->id,
                'tipo'           => $request->tipo,
                'cantidad'       => $request->cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo'    => $stockNuevo,
                'motivo'         => $request->motivo,
                'usuario_id'     => auth()->id(),
                'fecha_hora'     => now(),
            ]);
            $producto->update(['stock_actual' => $stockNuevo]);

            // Auto-alert for reorder
            if ($stockNuevo <= $producto->stock_reorden && $stockAnterior > $producto->stock_reorden) {
                DB::table('solicitudes_reposicion')->insert([
                    'producto_id'      => $producto->id,
                    'fecha_solicitud'  => now(),
                    'estado'           => 'pendiente',
                    'usuario_id'       => auth()->id(),
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ]);
            }
        });

        return back()->with('success', 'Movimiento registrado correctamente.');
    }

    public function guardarConteo(Request $request)
    {
        $request->validate([
            'items'         => 'required|array',
            'items.*.id'    => 'required|exists:productos,id',
            'items.*.fisica'=> 'required|integer|min:0',
            'observaciones' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request) {
            $conteoId = DB::table('conteos_fisicos')->insertGetId([
                'fecha_inicio'  => now(),
                'fecha_fin'     => now(),
                'estado'        => 'completado',
                'usuario_id'    => auth()->id(),
                'observaciones' => $request->observaciones,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $correctos = 0;
            $total     = count($request->items);

            foreach ($request->items as $item) {
                $producto = Producto::find($item['id']);
                if (!$producto) continue;

                $diferencia = $item['fisica'] - $producto->stock_actual;
                if ($item['fisica'] == $producto->stock_actual) $correctos++;

                DB::table('conteos_fisicos_detalle')->insert([
                    'conteo_id'        => $conteoId,
                    'producto_id'      => $producto->id,
                    'cantidad_sistema' => $producto->stock_actual,
                    'cantidad_fisica'  => $item['fisica'],
                    'diferencia'       => $diferencia,
                ]);

                if ($diferencia !== 0) {
                    DB::table('inventario_movimientos')->insert([
                        'producto_id'    => $producto->id,
                        'tipo'           => 'conteo_fisico',
                        'cantidad'       => abs($diferencia),
                        'stock_anterior' => $producto->stock_actual,
                        'stock_nuevo'    => $item['fisica'],
                        'motivo'         => 'Ajuste por conteo físico #' . $conteoId,
                        'usuario_id'     => auth()->id(),
                        'fecha_hora'     => now(),
                    ]);
                    $producto->update(['stock_actual' => $item['fisica']]);
                }
            }

            $exactitud = $total > 0 ? round(($correctos / $total) * 100, 2) : 0;
            DB::table('conteos_fisicos')->where('id', $conteoId)->update(['porcentaje_exactitud' => $exactitud]);
        });

        return back()->with('success', 'Conteo físico registrado. EI calculado.');
    }
}
