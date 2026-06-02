@extends('pdf.layout')

@section('contenido')

<div class="info-grid">
  <div class="info-row">
    <div class="info-cell">
      <div class="info-label">Total Pedidos</div>
      <div class="info-value">{{ $stats['total'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Entregados</div>
      <div class="info-value" style="color:#16a34a;">{{ $stats['entregados'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Pendientes</div>
      <div class="info-value" style="color:#d97706;">{{ $stats['pendientes'] }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Ventas Totales</div>
      <div class="info-value" style="color:#1565C0;">S/. {{ number_format($stats['ventas'], 0, '.', ',') }}</div>
    </div>
  </div>
</div>

<div class="section-title">Registro de Pedidos — Período: {{ $periodo }}</div>

<table>
  <thead>
    <tr>
      <th>N° Pedido</th>
      <th>Cliente</th>
      <th>Tipo</th>
      <th>Zona</th>
      <th>Fecha Entrada</th>
      <th>Fecha Despacho</th>
      <th class="center">TPPP (h)</th>
      <th class="center">Estado</th>
      <th class="right">Total</th>
    </tr>
  </thead>
  <tbody>
    @foreach($pedidos as $p)
    @php
      $tppp = null;
      if ($p->fecha_despacho && $p->fecha_entrada) {
        $tppp = round((\Carbon\Carbon::parse($p->fecha_despacho)->diffInMinutes(\Carbon\Carbon::parse($p->fecha_entrada))) / 60, 1);
      }
      $estadoClass = match($p->estado) {
        'entregado'      => 'badge-green',
        'despachado'     => 'badge-indigo',
        'en_preparacion' => 'badge-blue',
        'cancelado'      => 'badge-red',
        default          => 'badge-gray',
      };
      $estadoLabel = match($p->estado) {
        'registrado'     => 'Registrado',
        'en_preparacion' => 'En Prep.',
        'despachado'     => 'Despachado',
        'entregado'      => 'Entregado',
        'cancelado'      => 'Cancelado',
        default          => $p->estado,
      };
    @endphp
    <tr>
      <td class="mono"><strong>{{ $p->numero }}</strong></td>
      <td>{{ $p->cliente_nombre ?? 'Mostrador' }}</td>
      <td style="font-size:7.5pt;color:#64748b;">{{ ucfirst($p->tipo) }}</td>
      <td style="font-size:7.5pt;color:#64748b;">{{ $p->zona ?? '—' }}</td>
      <td class="mono" style="font-size:7.5pt;">{{ \Carbon\Carbon::parse($p->fecha_entrada)->format('d/m/Y H:i') }}</td>
      <td class="mono" style="font-size:7.5pt;">{{ $p->fecha_despacho ? \Carbon\Carbon::parse($p->fecha_despacho)->format('d/m/Y H:i') : '—' }}</td>
      <td class="center">
        @if($tppp !== null)
          <strong {{ $tppp <= 5 ? 'style=color:#16a34a' : ($tppp <= 15 ? 'style=color:#d97706' : 'style=color:#dc2626') }}>{{ $tppp }}h</strong>
        @else
          <span style="color:#94a3b8;">—</span>
        @endif
      </td>
      <td class="center"><span class="badge {{ $estadoClass }}">{{ $estadoLabel }}</span></td>
      <td class="right"><strong>S/. {{ number_format($p->total, 2) }}</strong></td>
    </tr>
    @endforeach
  </tbody>
  <tfoot>
    <tr>
      <td colspan="8" class="right"><strong>TOTAL VENTAS:</strong></td>
      <td class="right" style="color:#1565C0;font-size:10pt;"><strong>S/. {{ number_format($pedidos->sum('total'), 2) }}</strong></td>
    </tr>
  </tfoot>
</table>

<div class="section-title">TPPP — Tiempo Promedio de Procesamiento de Pedido</div>
@php
  $pedidosDespachados = $pedidos->filter(fn($p) => $p->fecha_despacho);
  $tpppPromedio = $pedidosDespachados->count() > 0
    ? round($pedidosDespachados->avg(fn($p) =>
        \Carbon\Carbon::parse($p->fecha_despacho)->diffInMinutes(\Carbon\Carbon::parse($p->fecha_entrada)) / 60
      ), 1)
    : null;
@endphp
<table style="width:50%;">
  <tbody>
    <tr><td style="padding:5px 8px;color:#64748b;">Pedidos analizados</td><td class="right"><strong>{{ $pedidosDespachados->count() }}</strong></td></tr>
    <tr><td style="padding:5px 8px;color:#64748b;">TPPP Promedio</td>
      <td class="right">
        @if($tpppPromedio !== null)
          <strong {{ $tpppPromedio <= 5 ? 'style=color:#16a34a' : ($tpppPromedio <= 15 ? 'style=color:#d97706' : 'style=color:#dc2626') }}>{{ $tpppPromedio }} horas</strong>
        @else
          <span>— Sin datos</span>
        @endif
      </td>
    </tr>
    <tr><td style="padding:5px 8px;color:#64748b;">Meta</td><td class="right">≤ 5 horas (Nivel Muy Alto)</td></tr>
    <tr><td style="padding:5px 8px;color:#64748b;">Fórmula</td><td class="right" style="font-size:7.5pt;font-family:monospace;">AVG(HOUR(fecha_despacho - fecha_entrada))</td></tr>
  </tbody>
</table>

@endsection
