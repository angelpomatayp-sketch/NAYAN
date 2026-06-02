<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Despacho extends Model {
    protected $fillable = ['pedido_id','numero','fecha_picking_inicio','fecha_picking_fin','estado','usuario_picking','costo_flete','costo_embalaje','costo_personal','costo_total','codigo_confirmacion','tiene_error','observaciones'];
    protected $casts = ['fecha_picking_inicio'=>'datetime','fecha_picking_fin'=>'datetime','tiene_error'=>'boolean'];
    public function pedido() { return $this->belongsTo(Pedido::class); }
    public function items() { return $this->hasMany(PickingItem::class); }
}
