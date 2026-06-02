@extends('pdf.layout')

@section('contenido')

{{-- Stats --}}
<div class="info-grid">
  <div class="info-row">
    <div class="info-cell">
      <div class="info-label">Total Productos</div>
      <div class="info-value">{{ $stats['total'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Stock Crítico</div>
      <div class="info-value" style="color:#dc2626;">{{ $stats['critico'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Stock Bajo</div>
      <div class="info-value" style="color:#d97706;">{{ $stats['bajo'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Valor Inventario</div>
      <div class="info-value" style="color:#16a34a;">S/. {{ number_format($stats['valor'], 0, '.', ',') }}</div>
    </div>
  </div>
</div>

<div class="section-title">Listado de Inventario ({{ count($productos) }} productos)</div>

<table>
  <thead>
    <tr>
      <th>Código</th>
      <th>Producto</th>
      <th>Categoría</th>
      <th class="center">Stock</th>
      <th class="center">Mínimo</th>
      <th class="center">Reorden</th>
      <th class="right">P. Compra</th>
      <th class="right">P. Venta</th>
      <th class="center">Ubic.</th>
      <th class="center">Estado</th>
    </tr>
  </thead>
  <tbody>
    @foreach($productos as $p)
    @php
      $estado = $p->stock_actual <= $p->stock_minimo ? 'critico'
              : ($p->stock_actual <= $p->stock_reorden ? 'bajo' : 'ok');
    @endphp
    <tr>
      <td class="mono">{{ $p->codigo }}</td>
      <td><strong>{{ $p->nombre }}</strong></td>
      <td style="font-size:7.5pt;color:#64748b;">{{ $p->categoria?->nombre ?? '—' }}</td>
      <td class="center"><strong>{{ $p->stock_actual }}</strong></td>
      <td class="center" style="color:#64748b;">{{ $p->stock_minimo }}</td>
      <td class="center" style="color:#64748b;">{{ $p->stock_reorden }}</td>
      <td class="right">S/. {{ number_format($p->precio_compra, 2) }}</td>
      <td class="right" style="font-weight:700;">S/. {{ number_format($p->precio_venta, 2) }}</td>
      <td class="center mono">{{ $p->ubicacion_almacen ?? '—' }}</td>
      <td class="center">
        @if($estado === 'critico')
          <span class="badge badge-red">Crítico</span>
        @elseif($estado === 'bajo')
          <span class="badge badge-yellow">Bajo</span>
        @else
          <span class="badge badge-green">OK</span>
        @endif
      </td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr>
      <td colspan="7" class="right"><strong>VALOR TOTAL INVENTARIO:</strong></td>
      <td class="right" colspan="3" style="color:#1565C0;font-size:10pt;">
        <strong>S/. {{ number_format($productos->sum(fn($p) => $p->stock_actual * $p->precio_compra), 2) }}</strong>
      </td>
    </tr>
  </tfoot>
</table>

@if($alertas->count() > 0)
<div class="section-title" style="color:#dc2626;">⚠ Alertas de Reposición ({{ $alertas->count() }} productos)</div>
<table>
  <thead>
    <tr><th>Código</th><th>Producto</th><th class="center">Stock Actual</th><th class="center">Stock Mínimo</th><th class="center">Déficit</th><th class="center">Urgencia</th></tr>
  </thead>
  <tbody>
    @foreach($alertas as $a)
    <tr>
      <td class="mono">{{ $a->codigo }}</td>
      <td>{{ $a->nombre }}</td>
      <td class="center"><strong style="color:#dc2626;">{{ $a->stock_actual }}</strong></td>
      <td class="center">{{ $a->stock_minimo }}</td>
      <td class="center"><strong>{{ $a->stock_minimo - $a->stock_actual }}</strong></td>
      <td class="center">
        @if($a->stock_actual <= $a->stock_minimo)
          <span class="badge badge-red">¡Urgente!</span>
        @else
          <span class="badge badge-yellow">Próximo</span>
        @endif
      </td>
    </tr>
    @endforeach
  </tbody>
</table>
@endif

@endsection
