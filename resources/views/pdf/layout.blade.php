<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9pt; color: #1a1a2e; background: #fff; }

  /* ── HEADER ──────────────────────────────────────────── */
  .header {
    background: #0a1628;
    color: white;
    padding: 16px 32px;
    display: table;
    width: 100%;
  }
  .header-left  { display: table-cell; vertical-align: middle; width: 60%; }
  .header-right { display: table-cell; vertical-align: middle; text-align: right; width: 40%; }

  /* Logo mark */
  .logo-wrap { display: table; }
  .logo-img  { display: table-cell; vertical-align: middle; width: 56px; }
  .logo-img img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; }
  .logo-text { display: table-cell; vertical-align: middle; padding-left: 12px; }
  .logo-name  { font-size: 18pt; font-weight: 900; color: #ffffff; letter-spacing: 2px; line-height: 1; }
  .logo-sub   { font-size: 8pt; color: #7eb3e8; margin-top: 3px; letter-spacing: 0.5px; }

  .header-meta      { color: #a8c0e0; font-size: 8pt; line-height: 1.6; }
  .header-meta-title{ color: #ffffff; font-size: 9pt; font-weight: 700; margin-bottom: 2px; }

  /* ── ACCENT BAR ─────────────────────────────────────── */
  .accent-bar { height: 5px; background: #1565C0; margin-bottom: 0; }
  .accent-bar-thin { height: 2px; background: #42a5f5; margin-bottom: 20px; }

  /* ── REPORT TITLE BLOCK ─────────────────────────────── */
  .report-header {
    padding: 14px 32px 12px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 16px;
  }
  .report-title  { font-size: 13pt; font-weight: 700; color: #0a1628; }
  .report-period { font-size: 8pt; color: #64748b; margin-top: 3px; }

  /* ── CONTENT WRAPPER ────────────────────────────────── */
  .content { padding: 0 32px 24px; }

  /* ── KPI GRID ───────────────────────────────────────── */
  .kpi-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 6px; margin-bottom: 16px; }
  .kpi-row  { display: table-row; }
  .kpi-cell { display: table-cell; width: 16.6%; }
  .kpi-box  { padding: 10px 12px; border-radius: 8px; color: white; }
  .kpi-box.verde    { background: #16a34a; }
  .kpi-box.amarillo { background: #d97706; }
  .kpi-box.rojo     { background: #dc2626; }
  .kpi-box.gris     { background: #64748b; }
  .kpi-label { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; opacity: 0.85; }
  .kpi-value { font-size: 16pt; font-weight: 900; line-height: 1.1; margin: 3px 0; }
  .kpi-sub   { font-size: 7pt; opacity: 0.85; }
  .kpi-meta  { font-size: 6.5pt; opacity: 0.75; margin-top: 2px; }

  /* ── TABLES ─────────────────────────────────────────── */
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 8pt; }
  thead th {
    background: #0a1628; color: white;
    padding: 7px 10px; text-align: left;
    font-weight: 700; font-size: 7.5pt;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  thead th.right  { text-align: right; }
  thead th.center { text-align: center; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
  tbody td.right  { text-align: right; font-weight: 600; }
  tbody td.center { text-align: center; }
  tbody td.mono   { font-family: monospace; font-size: 7.5pt; }
  tfoot td { padding: 7px 10px; background: #f0f4f8; font-weight: 700; border-top: 2px solid #1565C0; }
  tfoot td.right { text-align: right; }

  /* ── BADGES ─────────────────────────────────────────── */
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 7pt; font-weight: 700; }
  .badge-red    { background: #fee2e2; color: #991b1b; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-green  { background: #dcfce7; color: #166534; }
  .badge-blue   { background: #dbeafe; color: #1e40af; }
  .badge-gray   { background: #f1f5f9; color: #475569; }
  .badge-indigo { background: #e0e7ff; color: #3730a3; }

  /* ── SEMAFORO ───────────────────────────────────────── */
  .sem-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
  .sem-verde    .sem-dot { background: #16a34a; }
  .sem-amarillo .sem-dot { background: #d97706; }
  .sem-rojo     .sem-dot { background: #dc2626; }

  /* ── SECTION TITLE ──────────────────────────────────── */
  .section-title {
    font-size: 9pt; font-weight: 700; color: #0a1628;
    text-transform: uppercase; letter-spacing: 0.5px;
    padding: 6px 0 5px;
    border-bottom: 2px solid #1565C0;
    margin-bottom: 10px;
  }

  /* ── INFO BOXES ─────────────────────────────────────── */
  .info-grid { display: table; width: 100%; margin-bottom: 14px; border-collapse: separate; border-spacing: 6px; }
  .info-row  { display: table-row; }
  .info-cell {
    display: table-cell; width: 25%;
    padding: 8px 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
  }
  .info-label { font-size: 7pt; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .info-value { font-size: 10pt; font-weight: 700; color: #0a1628; margin-top: 2px; }

  /* ── FOOTER ─────────────────────────────────────────── */
  .footer {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: #f8fafc;
    border-top: 2px solid #1565C0;
    padding: 6px 32px;
    display: table; width: 100%;
  }
  .footer-left  { display: table-cell; text-align: left;  font-size: 7pt; color: #64748b; vertical-align: middle; }
  .footer-right { display: table-cell; text-align: right; font-size: 7pt; color: #64748b; vertical-align: middle; }
</style>
</head>
<body>

@php
    $logoPath = public_path('img/logo.jpg');
    $logoSrc  = file_exists($logoPath)
        ? 'data:image/jpeg;base64,' . base64_encode(file_get_contents($logoPath))
        : null;
@endphp

<!-- HEADER -->
<div class="header">
  <div class="header-left">
    <div class="logo-wrap">
      @if($logoSrc)
      <div class="logo-img">
        <img src="{{ $logoSrc }}" alt="NAYAN"/>
      </div>
      @endif
      <div class="logo-text">
        <div class="logo-name">NAYAN</div>
        <div class="logo-sub">Mobile Accessories</div>
      </div>
    </div>
  </div>
  <div class="header-right">
    <div class="header-meta">
      <div class="header-meta-title">Sistema de Gestión Logística</div>
      <div>{{ now()->format('d/m/Y \a \l\a\s H:i') }}</div>
      <div>Usuario: {{ $usuario ?? 'Administrador' }}</div>
    </div>
  </div>
</div>
<div class="accent-bar"></div>
<div class="accent-bar-thin"></div>

<!-- REPORT TITLE -->
<div class="report-header">
  <div class="report-title">{{ $titulo ?? 'Reporte' }}</div>
  <div class="report-period">Generado el {{ now()->format('d/m/Y \a \l\a\s H:i') }} &nbsp;|&nbsp; Período: {{ $periodo ?? 'Acumulado' }}</div>
</div>

<!-- CONTENT -->
<div class="content">
  @yield('contenido')
</div>

<!-- FOOTER -->
<div class="footer">
  <div class="footer-left">NAYAN Mobile Accessories — Sistema de Gestión Logística v1.0</div>
  <div class="footer-right">{{ $titulo ?? '' }} &nbsp;|&nbsp; Documento Confidencial</div>
</div>

</body>
</html>
