<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConteoFisicoDetalle extends Model
{
    protected $table = 'conteos_fisicos_detalle';
    public $timestamps = false;
    protected $fillable = ['conteo_id','producto_id','cantidad_sistema','cantidad_fisica','diferencia'];

    public function conteo() { return $this->belongsTo(ConteoFisico::class, 'conteo_id'); }
    public function producto() { return $this->belongsTo(Producto::class); }
}
