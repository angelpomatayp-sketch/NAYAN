<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use App\Models\PedidoDetalle;

class Pedido extends Model {
    protected $fillable = ['numero','cliente_id','fecha_entrada','fecha_despacho','fecha_entrega','estado','tipo','zona','subtotal','descuento','total','usuario_id','observaciones'];
    protected $casts = ['fecha_entrada'=>'datetime','fecha_despacho'=>'datetime','fecha_entrega'=>'datetime'];
    public function cliente() { return $this->belongsTo(Cliente::class); }
    public function usuario() { return $this->belongsTo(User::class, 'usuario_id'); }
    public function detalle() { return $this->hasMany(PedidoDetalle::class); }
    public function despacho() { return $this->hasOne(Despacho::class); }
}
