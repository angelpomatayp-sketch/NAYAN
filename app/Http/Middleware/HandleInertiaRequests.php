<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $notificaciones = [];
        $notifCount     = 0;

        if ($request->user()) {
            $areaMap = [
                'admin'     => null,
                'gerente'   => 'Gerencia',
                'vendedor'  => 'Ventas',
                'almacen'   => 'Almacén',
                'logistica' => 'Logística',
            ];
            $area = $areaMap[$request->user()->rol] ?? null;

            $query = \Illuminate\Support\Facades\DB::table('requerimientos')
                ->join('users', 'requerimientos.usuario_envio', '=', 'users.id')
                ->select('requerimientos.id', 'requerimientos.asunto',
                         'requerimientos.prioridad', 'requerimientos.area_origen',
                         'requerimientos.fecha_envio', 'users.name as remitente')
                ->where('requerimientos.estado', 'pendiente')
                ->orderByRaw("FIELD(requerimientos.prioridad,'urgente','alta','media','baja')")
                ->orderByDesc('requerimientos.fecha_envio');

            if ($area) {
                $query->where('requerimientos.area_destino', $area);
            }

            $notificaciones = $query->limit(8)->get();
            $notifCount     = $area
                ? \Illuminate\Support\Facades\DB::table('requerimientos')
                    ->where('estado', 'pendiente')
                    ->where('area_destino', $area)
                    ->count()
                : \Illuminate\Support\Facades\DB::table('requerimientos')
                    ->where('estado', 'pendiente')
                    ->count();

            // Alertas de stock (solo para roles que gestionan inventario)
            $stockAlertas = [];
            if (in_array($request->user()->rol, ['admin','almacen','logistica','gerente'])) {
                $stockAlertas = \Illuminate\Support\Facades\DB::table('productos')
                    ->where('activo', 1)
                    ->whereRaw('stock_actual <= stock_reorden')
                    ->orderByRaw('stock_actual - stock_minimo ASC')
                    ->limit(5)
                    ->get(['id','nombre','codigo','stock_actual','stock_minimo','stock_reorden']);
                $notifCount += $stockAlertas->count();
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'    => $request->user()->id,
                    'name'  => $request->user()->name,
                    'email' => $request->user()->email,
                    'rol'   => $request->user()->rol,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'notificaciones' => $notificaciones,
            'stockAlertas'   => $stockAlertas ?? [],
            'notifCount'     => $notifCount,
        ];
    }
}
