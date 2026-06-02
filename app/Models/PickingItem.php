<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickingItem extends Model
{
    protected $table = 'picking_items';
    public $timestamps = false;
    protected $fillable = ['despacho_id','producto_id','cantidad_solicitada','cantidad_pickeada','ubicacion','estado','tiene_error','tipo_error'];
    protected $casts = ['tiene_error' => 'boolean'];

    public function despacho() { return $this->belongsTo(Despacho::class); }
    public function producto() { return $this->belongsTo(Producto::class); }
}
