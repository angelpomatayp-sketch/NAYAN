<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Requerimiento extends Model {
    protected $fillable = ['area_origen','area_destino','tipo','asunto','descripcion','prioridad','estado','fecha_envio','fecha_atencion','usuario_envio','usuario_atencion','respuesta'];
    protected $casts = ['fecha_envio'=>'datetime','fecha_atencion'=>'datetime'];
    public function remitente() { return $this->belongsTo(User::class, 'usuario_envio'); }
    public function atencion() { return $this->belongsTo(User::class, 'usuario_atencion'); }
}
