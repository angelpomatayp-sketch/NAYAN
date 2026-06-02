<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DatoFinanciero extends Model {
    protected $table    = 'datos_financieros';
    protected $fillable = ['periodo','utilidad_neta','ventas_netas','activos_totales','costos_logisticos','usuario_id','observaciones'];
    protected $casts    = ['periodo'=>'date'];
}
