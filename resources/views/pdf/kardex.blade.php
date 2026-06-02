@extends('pdf.layout')

@section('contenido')

<div class="info-grid">
  <div class="info-row">
    <div class="info-cell">
      <div class="info-label">Total Movimientos</div>
      <div class="info-value">{{ $stats['total'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Entradas</div>
      <div class="info-value" style="color:#16a34a;">{{ $stats['entradas'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Salidas</div>
      <div class="info-value" style="color:#dc2626;">{{ $stats['salidas'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Ajustes / Conteos</div>
      <div class="info-value" style="color:#d97706;">{{ $stats['ajustes'] }}</div>
    </div>
  </div>
</div>

<div class="section-title">Movimientos de Inventario (últimos {{ count($movimientos) }} registros)</div>

<table>
  <thead>
    <tr>
      <th>Fecha / Hora</th>
      <th>Código</th>
      <th>Producto</th>
      <th>Tipo</th>
      <th style="text-align:right;">Cantidad</th>
      <th style="text-align:right;">Stock Anterior</th>
      <th style="text-align:right;">Stock Nuevo</th>
      <th>Motivo / Referencia</th>
      <th>Usuario</th>
    </tr>
  </thead>
  <tbody>
    @foreach($movimientos as $m)
    <tr>
      <td>{{ \Carbon\Carbon::parse($m->fecha_hora)->format('d/m/Y H:i') }}</td>
      <td style="font-family:monospace;font-size:8pt;">{{ $m->producto_codigo }}</td>
      <td>{{ $m->producto_nombre }}</td>
      <td style="text-align:center;">
        @if($m->tipo === 'entrada')
          <span style="color:#16a34a;font-weight:700;">↑ Entrada</span>
        @elseif($m->tipo === 'salida')
          <span style="color:#dc2626;font-weight:700;">↓ Salida</span>
        @else
          <span style="color:#d97706;font-weight:700;">⇄ {{ ucfirst($m->tipo) }}</span>
        @endif
      </td>
      <td style="text-align:right;font-weight:700;
        @if($m->tipo==='entrada') color:#16a34a;
        @elseif($m->tipo==='salida') color:#dc2626;
        @else color:#d97706; @endif">
        {{ $m->tipo === 'salida' ? '-' : '+' }}{{ $m->cantidad }}
      </td>
      <td style="text-align:right;">{{ $m->stock_anterior }}</td>
      <td style="text-align:right;font-weight:700;">{{ $m->stock_nuevo }}</td>
      <td style="font-size:8pt;">{{ $m->motivo ?? $m->referencia ?? '—' }}</td>
      <td style="font-size:8pt;">{{ $m->usuario_nombre }}</td>
    </tr>
    @endforeach
  </tbody>
</table>

@endsection
