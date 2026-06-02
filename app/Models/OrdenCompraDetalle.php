<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrdenCompraDetalle extends Model
{
    protected $table = 'ordenes_compra_detalle';
    public $timestamps = false;
    protected $fillable = ['orden_id','producto_id','cantidad','precio_unitario','cantidad_recibida'];

    public function orden() { return $this->belongsTo(OrdenCompra::class, 'orden_id'); }
    public function producto() { return $this->belongsTo(Producto::class); }
}
