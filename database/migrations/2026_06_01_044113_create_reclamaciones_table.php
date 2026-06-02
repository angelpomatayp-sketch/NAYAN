<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reclamaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('users');
            $table->enum('tipo', ['mal_estado','cantidad_incorrecta','producto_incorrecto','no_entregado','otro']);
            $table->text('descripcion');
            $table->json('productos_afectados')->nullable();
            $table->decimal('valor_reclamo', 10, 2)->default(0);
            $table->enum('estado', ['pendiente','en_revision','resuelto'])->default('pendiente');
            $table->dateTime('fecha_reclamo')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reclamaciones');
    }
};
