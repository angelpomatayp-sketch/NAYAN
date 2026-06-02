<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model {
    protected $fillable = ['codigo','nombre','descripcion','categoria_id','precio_compra','precio_venta','stock_actual','stock_minimo','stock_reorden','ubicacion_almacen','activo'];
    protected $casts = ['activo'=>'boolean','precio_compra'=>'float','precio_venta'=>'float'];
    public function categoria() { return $this->belongsTo(Categoria::class); }
    public function movimientos() { return $this->hasMany(InventarioMovimiento::class); }
    public function getStockStatusAttribute(): string {
        if ($this->stock_actual <= $this->stock_minimo) return 'critico';
        if ($this->stock_actual <= $this->stock_reorden) return 'bajo';
        return 'ok';
    }
}
