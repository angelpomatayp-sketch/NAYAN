<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class OrdenCompra extends Model {
    protected $table    = 'ordenes_compra';
    protected $fillable = ['numero','proveedor_id','fecha_emision','fecha_esperada','fecha_recepcion','estado','total','usuario_id','observaciones'];
    protected $casts    = ['fecha_emision'=>'datetime','fecha_recepcion'=>'datetime'];
    public function proveedor() { return $this->belongsTo(Proveedor::class); }
    public function detalle()   { return $this->hasMany(OrdenCompraDetalle::class, 'orden_id'); }
    public function usuario()   { return $this->belongsTo(User::class, 'usuario_id'); }
}
