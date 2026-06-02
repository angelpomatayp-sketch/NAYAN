<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model {
    protected $table    = 'proveedores';
    protected $fillable = ['nombre','ruc','contacto','telefono','email','direccion','condiciones_pago','calificacion','activo'];
    protected $casts    = ['activo'=>'boolean','calificacion'=>'float'];
    public function ordenesCompra() { return $this->hasMany(OrdenCompra::class); }
}
