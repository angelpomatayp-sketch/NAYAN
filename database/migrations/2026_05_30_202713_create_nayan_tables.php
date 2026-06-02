<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Categorias
        Schema::create('categorias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        // Productos
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50)->unique();
            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();
            $table->foreignId('categoria_id')->nullable()->constrained('categorias')->nullOnDelete();
            $table->decimal('precio_compra', 10, 2)->default(0);
            $table->decimal('precio_venta', 10, 2)->default(0);
            $table->integer('stock_actual')->default(0);
            $table->integer('stock_minimo')->default(5);
            $table->integer('stock_reorden')->default(10);
            $table->string('ubicacion_almacen', 50)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Movimientos de Inventario (Kardex)
        Schema::create('inventario_movimientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos');
            $table->enum('tipo', ['entrada','salida','ajuste','conteo_fisico']);
            $table->integer('cantidad');
            $table->integer('stock_anterior');
            $table->integer('stock_nuevo');
            $table->string('motivo', 200)->nullable();
            $table->string('referencia', 100)->nullable();
            $table->foreignId('usuario_id')->constrained('users');
            $table->timestamp('fecha_hora')->useCurrent();
        });

        // Conteos Físicos
        Schema::create('conteos_fisicos', function (Blueprint $table) {
            $table->id();
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin')->nullable();
            $table->enum('estado', ['en_progreso','completado'])->default('en_progreso');
            $table->foreignId('usuario_id')->constrained('users');
            $table->decimal('porcentaje_exactitud', 5, 2)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        Schema::create('conteos_fisicos_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conteo_id')->constrained('conteos_fisicos')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->integer('cantidad_sistema');
            $table->integer('cantidad_fisica')->nullable();
            $table->integer('diferencia')->nullable();
        });

        // Proveedores
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 200);
            $table->string('ruc', 20)->nullable();
            $table->string('contacto', 100)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('direccion')->nullable();
            $table->string('condiciones_pago', 100)->nullable();
            $table->decimal('calificacion', 3, 2)->default(5.00);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Órdenes de Compra (Módulo 5)
        Schema::create('ordenes_compra', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('proveedor_id')->constrained('proveedores');
            $table->dateTime('fecha_emision')->useCurrent();
            $table->date('fecha_esperada')->nullable();
            $table->dateTime('fecha_recepcion')->nullable();
            $table->enum('estado', ['pendiente','enviada','recibida','cancelada'])->default('pendiente');
            $table->decimal('total', 10, 2)->default(0);
            $table->foreignId('usuario_id')->constrained('users');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        Schema::create('ordenes_compra_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_id')->constrained('ordenes_compra')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2)->default(0);
            $table->integer('cantidad_recibida')->default(0);
        });

        // Solicitudes de Reposición (para TPRI)
        Schema::create('solicitudes_reposicion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos');
            $table->dateTime('fecha_solicitud')->useCurrent();
            $table->dateTime('fecha_recepcion')->nullable();
            $table->foreignId('orden_compra_id')->nullable()->constrained('ordenes_compra')->nullOnDelete();
            $table->enum('estado', ['pendiente','en_proceso','recibido'])->default('pendiente');
            $table->foreignId('usuario_id')->constrained('users');
            $table->timestamps();
        });

        // Clientes
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 200);
            $table->string('documento', 20)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->text('direccion')->nullable();
            $table->string('zona', 50)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // Pedidos (Módulo 2)
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 20)->unique();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->dateTime('fecha_entrada')->useCurrent();
            $table->dateTime('fecha_despacho')->nullable();
            $table->dateTime('fecha_entrega')->nullable();
            $table->enum('estado', ['registrado','en_preparacion','despachado','entregado','cancelado'])->default('registrado');
            $table->string('tipo', 50)->default('minorista');
            $table->string('zona', 50)->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('descuento', 10, 2)->default(0);
            $table->decimal('total', 10, 2)->default(0);
            $table->foreignId('usuario_id')->constrained('users');
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        Schema::create('pedidos_detalle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
        });

        // Requerimientos Internos (Módulo 3 - TAFI)
        Schema::create('requerimientos', function (Blueprint $table) {
            $table->id();
            $table->string('area_origen', 50);
            $table->string('area_destino', 50);
            $table->string('tipo', 100)->nullable();
            $table->string('asunto', 200);
            $table->text('descripcion');
            $table->enum('prioridad', ['baja','media','alta','urgente'])->default('media');
            $table->enum('estado', ['pendiente','en_atencion','atendido'])->default('pendiente');
            $table->dateTime('fecha_envio')->useCurrent();
            $table->dateTime('fecha_atencion')->nullable();
            $table->foreignId('usuario_envio')->constrained('users');
            $table->foreignId('usuario_atencion')->nullable()->constrained('users')->nullOnDelete();
            $table->text('respuesta')->nullable();
            $table->timestamps();
        });

        // Despachos y Picking (Módulo 4)
        Schema::create('despachos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos');
            $table->string('numero', 20)->unique();
            $table->dateTime('fecha_picking_inicio')->nullable();
            $table->dateTime('fecha_picking_fin')->nullable();
            $table->enum('estado', ['pendiente','en_picking','verificado','despachado','entregado'])->default('pendiente');
            $table->foreignId('usuario_picking')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('costo_flete', 10, 2)->default(0);
            $table->decimal('costo_embalaje', 10, 2)->default(0);
            $table->decimal('costo_personal', 10, 2)->default(0);
            $table->decimal('costo_total', 10, 2)->default(0);
            $table->string('codigo_confirmacion', 20)->nullable();
            $table->boolean('tiene_error')->default(false);
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });

        Schema::create('picking_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('despacho_id')->constrained('despachos')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->integer('cantidad_solicitada');
            $table->integer('cantidad_pickeada')->default(0);
            $table->string('ubicacion', 50)->nullable();
            $table->enum('estado', ['pendiente','confirmado','error'])->default('pendiente');
            $table->boolean('tiene_error')->default(false);
            $table->enum('tipo_error', ['producto_incorrecto','cantidad_erronea','destino_equivocado','otro'])->nullable();
        });

        // Datos Financieros (para ROA, MN, CL/V en Dashboard)
        Schema::create('datos_financieros', function (Blueprint $table) {
            $table->id();
            $table->date('periodo')->unique();
            $table->decimal('utilidad_neta', 12, 2)->default(0);
            $table->decimal('ventas_netas', 12, 2)->default(0);
            $table->decimal('activos_totales', 12, 2)->default(0);
            $table->decimal('costos_logisticos', 12, 2)->default(0);
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('observaciones')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('datos_financieros');
        Schema::dropIfExists('picking_items');
        Schema::dropIfExists('despachos');
        Schema::dropIfExists('requerimientos');
        Schema::dropIfExists('pedidos_detalle');
        Schema::dropIfExists('pedidos');
        Schema::dropIfExists('clientes');
        Schema::dropIfExists('solicitudes_reposicion');
        Schema::dropIfExists('ordenes_compra_detalle');
        Schema::dropIfExists('ordenes_compra');
        Schema::dropIfExists('proveedores');
        Schema::dropIfExists('conteos_fisicos_detalle');
        Schema::dropIfExists('conteos_fisicos');
        Schema::dropIfExists('inventario_movimientos');
        Schema::dropIfExists('productos');
        Schema::dropIfExists('categorias');
    }
};
