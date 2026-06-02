@extends('pdf.layout')

@section('contenido')

{{-- KPI Cards --}}
<div class="section-title">Indicadores de Gestión Logística — Variable Activa</div>

<table style="margin-bottom:10px;">
  <thead>
    <tr>
      <th>KPI</th>
      <th>Dimensión</th>
      <th class="center">Valor</th>
      <th class="center">Unidad</th>
      <th class="center">Meta</th>
      <th class="center">Nivel</th>
      <th>Fórmula</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>TPRI</strong></td>
      <td>D1 · Planificación Digital</td>
      <td class="center"><strong>{{ $kpis['tpri'] ?? '—' }}</strong></td>
      <td class="center">días</td>
      <td class="center">≤ 7 días</td>
      <td class="center">
        @php $sem = $kpis['sem_tpri'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">AVG(DATEDIFF(recepcion, solicitud))</td>
    </tr>
    <tr>
      <td><strong>TAFI</strong></td>
      <td>D2 · Integración Operativa</td>
      <td class="center"><strong>{{ $kpis['tafi'] ?? '—' }}</strong></td>
      <td class="center">min</td>
      <td class="center">≤ 15 min</td>
      <td class="center">
        @php $sem = $kpis['sem_tafi'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">AVG(TIMEDIFF(atencion, envio))</td>
    </tr>
    <tr>
      <td><strong>TPPP</strong></td>
      <td>D3 · Ejecución Automatizada</td>
      <td class="center"><strong>{{ $kpis['tppp'] ?? '—' }}</strong></td>
      <td class="center">horas</td>
      <td class="center">≤ 5 h</td>
      <td class="center">
        @php $sem = $kpis['sem_tppp'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">AVG(HOUR(despacho - entrada))</td>
    </tr>
    <tr>
      <td><strong>EI</strong></td>
      <td>D4 · Trazabilidad Tiempo Real</td>
      <td class="center"><strong>{{ $kpis['ei'] ? $kpis['ei'].'%' : '—' }}</strong></td>
      <td class="center">%</td>
      <td class="center">≥ 95%</td>
      <td class="center">
        @php $sem = $kpis['sem_ei'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">(Correctos / Total) × 100</td>
    </tr>
    <tr>
      <td><strong>PEPD</strong></td>
      <td>D5a · Control Logístico</td>
      <td class="center"><strong>{{ isset($kpis['pepd']) ? $kpis['pepd'].'%' : '—' }}</strong></td>
      <td class="center">%</td>
      <td class="center">&lt; 1%</td>
      <td class="center">
        @php $sem = $kpis['sem_pepd'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">(Errores / Total Despachados) × 100</td>
    </tr>
    <tr>
      <td><strong>CLP</strong></td>
      <td>D5b · Control Logístico</td>
      <td class="center"><strong>{{ $kpis['clp'] ? 'S/.'.$kpis['clp'] : '—' }}</strong></td>
      <td class="center">S/.</td>
      <td class="center">≤ S/.10</td>
      <td class="center">
        @php $sem = $kpis['sem_clp'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">AVG(flete + embalaje + personal)</td>
    </tr>
    <tr>
      <td><strong>TRC</strong></td>
      <td>D6 · Reclamos de Cliente</td>
      <td class="center"><strong>{{ isset($kpis['trc']) ? $kpis['trc'].'%' : '—' }}</strong></td>
      <td class="center">%</td>
      <td class="center">&lt; 2%</td>
      <td class="center">
        @php $sem = $kpis['sem_trc'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">(Pedidos con reclamo / Total entregados) × 100</td>
    </tr>
  </tbody>
</table>

<div class="section-title">Indicadores de Rentabilidad — Variable Atributo</div>

<table>
  <thead>
    <tr>
      <th>KPI</th>
      <th>Dimensión</th>
      <th class="center">Valor</th>
      <th class="center">Meta</th>
      <th class="center">Nivel</th>
      <th>Fórmula</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>ROA</strong></td>
      <td>Rentabilidad Financiera</td>
      <td class="center"><strong>{{ $kpis['roa'] ? $kpis['roa'].'%' : '—' }}</strong></td>
      <td class="center">≥ 4%</td>
      <td class="center">
        @php $sem = $kpis['sem_roa'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">(Utilidad neta / Activos totales) × 100</td>
    </tr>
    <tr>
      <td><strong>Margen Neto</strong></td>
      <td>Rentabilidad Económica</td>
      <td class="center"><strong>{{ $kpis['mn'] ? $kpis['mn'].'%' : '—' }}</strong></td>
      <td class="center">≥ 10%</td>
      <td class="center">
        @php $sem = $kpis['sem_mn'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">(Utilidad neta / Ventas netas) × 100</td>
    </tr>
    <tr>
      <td><strong>CL/Ventas</strong></td>
      <td>Rentabilidad Logística</td>
      <td class="center"><strong>{{ $kpis['clv'] ? $kpis['clv'].'%' : '—' }}</strong></td>
      <td class="center">&lt; 8%</td>
      <td class="center">
        @php $sem = $kpis['sem_clv'] ?? 'gris' @endphp
        <span class="badge badge-{{ $sem === 'verde' ? 'green' : ($sem === 'amarillo' ? 'yellow' : ($sem === 'gris' ? 'gray' : 'red')) }}">
          {{ $sem === 'verde' ? '✓ En meta' : ($sem === 'amarillo' ? '⚠ Alerta' : ($sem === 'gris' ? '— Sin datos' : '✗ Fuera')) }}
        </span>
      </td>
      <td style="font-size:7pt;color:#64748b;">(Costos logísticos / Ventas totales) × 100</td>
    </tr>
  </tbody>
</table>

@if(!empty($histFinanciero))
<div class="section-title">Evolución Histórica de Rentabilidad</div>
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
    @foreach($histFinanciero as $r)
    <tr>
      <td class="mono">{{ \Carbon\Carbon::parse($r->periodo)->format('M Y') }}</td>
      <td class="right">S/. {{ number_format($r->ventas_netas, 0, '.', ',') }}</td>
      <td class="right">S/. {{ number_format($r->utilidad_neta, 0, '.', ',') }}</td>
      <td class="right">S/. {{ number_format($r->activos_totales, 0, '.', ',') }}</td>
      <td class="right">S/. {{ number_format($r->costos_logisticos, 0, '.', ',') }}</td>
      <td class="center"><strong>{{ $r->activos_totales > 0 ? round($r->utilidad_neta/$r->activos_totales*100,2) : 0 }}%</strong></td>
      <td class="center"><strong>{{ $r->ventas_netas > 0 ? round($r->utilidad_neta/$r->ventas_netas*100,2) : 0 }}%</strong></td>
      <td class="center"><strong>{{ $r->ventas_netas > 0 ? round($r->costos_logisticos/$r->ventas_netas*100,2) : 0 }}%</strong></td>
    </tr>
    @endforeach
  </tbody>
</table>
@endif

@endsection
