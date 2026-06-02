<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\IntegracionController;
use App\Http\Controllers\PickingController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ReclamacionController;
use App\Http\Controllers\UsuarioController;

// ── Auth ────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/',      [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login',[AuthController::class, 'login'])->name('login.post');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Ruta home: redirige al módulo correspondiente según rol
    Route::get('/home', [AuthController::class, 'home'])->name('home');

    // ── Dashboard — admin, gerente ─────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('rol:admin,gerente')
        ->name('dashboard');

    // ── Módulo 1: Inventario ───────────────────────────────
    Route::prefix('inventario')->name('inventario.')->group(function () {
        // Ver: admin, gerente, almacen, logistica
        Route::get('/',       [InventarioController::class, 'index'])
            ->middleware('rol:admin,gerente,almacen,logistica')->name('index');
        Route::get('/kardex', [InventarioController::class, 'kardex'])
            ->middleware('rol:admin,gerente,almacen,logistica')->name('kardex');
        // Modificar: solo admin y almacen
        Route::get('/conteo',           [InventarioController::class, 'conteo'])
            ->middleware('rol:admin,almacen')->name('conteo');
        Route::post('/movimiento',      [InventarioController::class, 'registrarMovimiento'])
            ->middleware('rol:admin,almacen')->name('movimiento');
        Route::post('/conteo/guardar',  [InventarioController::class, 'guardarConteo'])
            ->middleware('rol:admin,almacen')->name('conteo.guardar');
    });

    // ── Módulo 2: Pedidos ──────────────────────────────────
    Route::prefix('pedidos')->name('pedidos.')->group(function () {
        Route::get('/',         [PedidoController::class, 'index'])->name('index');
        // Rutas estáticas primero para evitar conflicto con /{pedido}
        Route::get('/nuevo',    [PedidoController::class, 'create'])
            ->middleware('rol:admin,vendedor')->name('create');
        Route::post('/',        [PedidoController::class, 'store'])
            ->middleware('rol:admin,vendedor')->name('store');
        Route::get('/{pedido}', [PedidoController::class, 'show'])->name('show');
        Route::patch('/{pedido}/estado', [PedidoController::class, 'actualizarEstado'])
            ->middleware('rol:admin,vendedor,almacen,logistica')->name('estado');
    });

    // ── Módulo 3: Integración Operativa — todos ───────────
    Route::prefix('integracion')->name('integracion.')->group(function () {
        Route::get('/',       [IntegracionController::class, 'index'])->name('index');
        Route::post('/',      [IntegracionController::class, 'store'])->name('store');
        Route::patch('/{id}', [IntegracionController::class, 'atender'])->name('atender');
    });

    // ── Módulo 4: Picking — admin, almacen, logistica ─────
    Route::prefix('picking')->name('picking.')->middleware('rol:admin,almacen,logistica')->group(function () {
        Route::get('/',                [PickingController::class, 'index'])->name('index');
        Route::get('/{id}',            [PickingController::class, 'show'])->name('show');
        Route::post('/{id}/iniciar',   [PickingController::class, 'iniciarPicking'])->name('iniciar');
        Route::patch('/item/{itemId}', [PickingController::class, 'confirmarItem'])->name('item');
        Route::post('/{id}/finalizar', [PickingController::class, 'finalizarDespacho'])->name('finalizar');
    });

    // ── Módulo 5: Compras ─────────────────────────────────
    Route::prefix('compras')->name('compras.')->group(function () {
        // Ver lista: admin, gerente, almacen, logistica
        Route::get('/', [CompraController::class, 'index'])
            ->middleware('rol:admin,gerente,almacen,logistica')->name('index');
        // Crear OC: admin, almacen, logistica
        Route::get('/nueva',           [CompraController::class, 'create'])
            ->middleware('rol:admin,almacen,logistica')->name('create');
        Route::post('/',               [CompraController::class, 'store'])
            ->middleware('rol:admin,almacen,logistica')->name('store');
        // Recibir mercadería: admin, almacen, logistica
        Route::get('/{id}/recibir',    [CompraController::class, 'recibir'])
            ->middleware('rol:admin,almacen,logistica')->name('recibir');
        Route::post('/{id}/recibir',   [CompraController::class, 'procesarRecepcion'])
            ->middleware('rol:admin,almacen,logistica')->name('recepcion');
    });

    // ── Catálogos ─────────────────────────────────────────
    // Categorías: solo admin
    Route::resource('categorias', CategoriaController::class)
        ->only(['index','store','update','destroy'])
        ->middleware('rol:admin');

    // Productos: solo admin
    Route::resource('productos', ProductoController::class)
        ->only(['index','store','update','destroy'])
        ->middleware('rol:admin');
    Route::get('/productos/buscar', [ProductoController::class,'buscar'])
        ->middleware('rol:admin,vendedor')->name('productos.buscar');

    // Clientes: admin y vendedor
    Route::resource('clientes', ClienteController::class)
        ->only(['index','store','update','destroy'])
        ->middleware('rol:admin,vendedor');

    // Proveedores: admin y almacen
    Route::resource('proveedores', ProveedorController::class)
        ->only(['index','store','update','destroy'])
        ->middleware('rol:admin,almacen');

    // ── Reclamaciones — admin, gerente, vendedor ──────────
    Route::middleware('rol:admin,gerente,vendedor')->group(function () {
        Route::get('/reclamaciones', [ReclamacionController::class, 'index'])->name('reclamaciones.index');
        Route::patch('/reclamaciones/{reclamacion}', [ReclamacionController::class, 'update'])->name('reclamaciones.update');
    });
    Route::post('/reclamaciones', [ReclamacionController::class, 'store'])
        ->middleware('rol:admin,vendedor')->name('reclamaciones.store');

    // ── Usuarios — solo admin ─────────────────────────────
    Route::resource('usuarios', UsuarioController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->middleware('rol:admin');
    Route::patch('/usuarios/{usuario}/reset-password', [UsuarioController::class, 'resetPassword'])
        ->middleware('rol:admin')
        ->name('usuarios.reset-password');

    // ── Reportes — admin, gerente ─────────────────────────
    Route::middleware('rol:admin,gerente')->group(function () {
        Route::get('/reportes',              [ReporteController::class, 'index'])->name('reportes.index');
        Route::get('/reportes/exportar',     [ReporteController::class, 'exportar'])->name('reportes.exportar');
        Route::get('/reportes/exportar-pdf', [ReporteController::class, 'exportarPDF'])->name('reportes.pdf');
    });
});
