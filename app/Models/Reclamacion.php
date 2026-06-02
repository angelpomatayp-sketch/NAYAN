<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reclamacion extends Model
{
    protected $table = 'reclamaciones';
    protected $fillable = ['pedido_id','usuario_id','tipo','descripcion','productos_afectados','valor_reclamo','estado','fecha_reclamo'];
    protected $casts = ['productos_afectados' => 'array', 'fecha_reclamo' => 'datetime'];

    public function pedido()  { return $this->belongsTo(Pedido::class); }
    public function usuario() { return $this->belongsTo(User::class, 'usuario_id'); }

    public static function tipoLabel(string $tipo): string
    {
        return match($tipo) {
            'mal_estado'          => 'Producto en mal estado',
            'cantidad_incorrecta' => 'Cantidad incorrecta',
            'producto_incorrecto' => 'Producto incorrecto',
            'no_entregado'        => 'No fue entregado',
            'otro'                => 'Otro',
            default               => $tipo,
        };
    }
}
