<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model {
    protected $table    = 'clientes';
    protected $fillable = ['nombre','documento','telefono','email','direccion','zona','activo'];
    protected $casts    = ['activo'=>'boolean'];
    public function pedidos() { return $this->hasMany(Pedido::class); }
}
