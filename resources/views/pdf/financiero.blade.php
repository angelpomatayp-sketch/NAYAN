@extends('pdf.layout')

@section('contenido')

@if($finActual)
<div class="info-grid">
  <div class="info-row">
    <div class="info-cell">
      <div class="info-label">Período más reciente</div>
      <div class="info-value">{{ \Carbon\Carbon::parse($finActual->periodo)->format('M Y') }}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">ROA</div>
      <div class="info-value" style="color:{{ $kpis['roa'] >= 4 ? '#16a34a' : ($kpis['roa'] >= 2 ? '#d97706' : '#dc2626') }};">{{ $kpis['roa'] }}%</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Margen Neto</div>
      <div class="info-value" style="color:{{ $kpis['mn'] >= 10 ? '#16a34a' : ($kpis['mn'] >= 6 ? '#d97706' : '#dc2626') }};">{{ $kpis['mn'] }}%</div>
    </div>
    <div class="info-cell">
      <div class="info-label">CL / Ventas</div>
      <div class="info-value" style="color:{{ $kpis['clv'] < 8 ? '#16a34a' : ($kpis['clv'] < 12 ? '#d97706' : '#dc2626') }};">{{ $kpis['clv'] }}%</div>
    </div>
  </div>
</div>
@endif

<div class="section-title">Evolución Financiera Histórica</div>

<table>
  <thead>
    <tr>
      <th>Período</th>
      <th class="right">Ventas Netas</th>
      <th class="right">Utilidad Neta</th>
      <th class="right">Activos Totales</th>
      <th class="right">Costos Logísticos</th>
      <th class="center">ROA (%)</th>
      <th class="center">MN (%)</th>
      <th class="center">CL/V (%)</th>
    </tr>
  </thead>
  <tbody>
    @foreach($historial as $r)
    @php
      $roa = $r->activos_totales > 0 ? round($r->utilidad_neta/$r->activos_totales*100,2) : 0;
      $mn  = $r->ventas_netas > 0 ? round($r->utilidad_neta/$r->ventas_netas*100,2) : 0;
      $clv = $r->ventas_netas > 0 ? round($r->costos_logisticos/$r->ventas_netas*100,2) : 0;
    @endphp
    <tr>
      <td class="mono"><strong>{{ \Carbon\Carbon::parse($r->periodo)->format('M Y') }}</strong></td>
      <td class="right">S/. {{ number_format($r->ventas_netas, 0, '.', ',') }}</td>
      <td class="right">S/. {{ number_format($r->utilidad_neta, 0, '.', ',') }}</td>
      <td class="right">S/. {{ number_format($r->activos_totales, 0, '.', ',') }}</td>
      <td class="right">S/. {{ number_format($r->costos_logisticos, 0, '.', ',') }}</td>
      <td class="center">
        <strong style="color:{{ $roa >= 4 ? '#16a34a' : ($roa >= 2 ? '#d97706' : '#dc2626') }};">{{ $roa }}%</strong>
      </td>
      <td class="center">
        <strong style="color:{{ $mn >= 10 ? '#16a34a' : ($mn >= 6 ? '#d97706' : '#dc2626') }};">{{ $mn }}%</strong>
      </td>
      <td class="center">
        <strong style="color:{{ $clv < 8 ? '#16a34a' : ($clv < 12 ? '#d97706' : '#dc2626') }};">{{ $clv }}%</strong>
      </td>
    </tr>
    @endforeach
  </tbody>
</table>

<div class="section-title">Referencia de Criterios de Evaluación</div>
<table style="width:100%;font-size:8pt;">
  <thead>
    <tr>
      <th>Indicador</th>
      <th class="center">Muy Alto</th>
      <th class="center">Alto</th>
      <th class="center">Medio</th>
      <th class="center">Bajo</th>
      <th class="center">Muy Bajo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>ROA (%)</strong></td>
      <td class="center"><span class="badge badge-green">≥ 15%</span></td>
      <td class="center">10 – 14%</td>
      <td class="center">6 – 9%</td>
      <td class="center">2 – 5%</td>
      <td class="center"><span class="badge badge-red">&lt; 2%</span></td>
    </tr>
    <tr>
      <td><strong>Margen Neto (%)</strong></td>
      <td class="center"><span class="badge badge-green">≥ 13%</span></td>
      <td class="center">9.1 – 12%</td>
      <td class="center">5.1 – 9%</td>
      <td class="center">3 – 5%</td>
      <td class="center"><span class="badge badge-red">&lt; 3%</span></td>
    </tr>
    <tr>
      <td><strong>CL / Ventas (%)</strong></td>
      <td class="center"><span class="badge badge-green">&lt; 8%</span></td>
      <td class="center">8 – 12%</td>
      <td class="center">12.1 – 16%</td>
      <td class="center">16.1 – 20%</td>
      <td class="center"><span class="badge badge-red">&gt; 20%</span></td>
    </tr>
  </tbody>
</table>

@endsection
