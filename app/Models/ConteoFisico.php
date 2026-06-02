<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ConteoFisico extends Model {
    protected $table    = 'conteos_fisicos';
    protected $fillable = ['fecha_inicio','fecha_fin','estado','usuario_id','porcentaje_exactitud','observaciones'];
    protected $casts    = ['fecha_inicio'=>'datetime','fecha_fin'=>'datetime'];
    public function detalle() { return $this->hasMany(ConteoFisicoDetalle::class, 'conteo_id'); }
}
