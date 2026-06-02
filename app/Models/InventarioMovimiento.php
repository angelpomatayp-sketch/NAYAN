<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class InventarioMovimiento extends Model {
    protected $table      = 'inventario_movimientos';
    public    $timestamps = false;
    protected $fillable   = ['producto_id','tipo','cantidad','stock_anterior','stock_nuevo','motivo','referencia','usuario_id','fecha_hora'];
    protected $casts      = ['fecha_hora'=>'datetime'];
    public function producto() { return $this->belongsTo(Producto::class); }
    public function usuario()  { return $this->belongsTo(User::class, 'usuario_id'); }
}
