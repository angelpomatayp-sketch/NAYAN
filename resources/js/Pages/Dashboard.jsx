import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import KpiCard from '@/Components/KpiCard';
import FlashMessage from '@/Components/FlashMessage';
import { PedidoBadge } from '@/Components/EstadoBadge';
import {
    Clock, Activity, Zap, Warehouse, AlertTriangle,
    DollarSign, TrendingUp, Percent, Truck,
    ShoppingCart, Package, Bell
} from 'lucide-react';
import { useEffect, useRef } from 'react';

// Simple semaphore logic
function semaforo(val, verde, amarillo, mayorMejor = false) {
    if (!val && val !== 0) return 'sin_datos';
    if (mayorMejor) {
        if (val >= verde) return 'verde';
        if (val >= amarillo) return 'amarillo';
        return 'rojo';
    }
    if (val <= verde) return 'verde';
    if (val <= amarillo) return 'amarillo';
    return 'rojo';
}

function formatMoney(n) {
    return 'S/. ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 0 });
}

export default function Dashboard({
    tpri, tafi, tppp, ei, pepd, clp, roa, mn, clv,
    totalPedidosMes, pendientesDespacho, stockCritico, reqPendientes,
    ultimosPedidos, ventasMes, histFinanciero, alertasStock,
}) {
    const chartVentasRef    = useRef(null);
    const chartFinancRef    = useRef(null);
    const chartVentasInst   = useRef(null);
    const chartFinancInst   = useRef(null);

    useEffect(() => {
        // Load Chart.js dynamically
        import('chart.js/auto').then(({ default: Chart }) => {
            // Ventas chart
            if (chartVentasRef.current) {
                chartVentasInst.current?.destroy();
                chartVentasInst.current = new Chart(chartVentasRef.current, {
                    type: 'bar',
                    data: {
                        labels: ventasMes?.map(v => v.mes) ?? [],
                        datasets: [
                            {
                                label: 'Ventas (S/.)',
                                data: ventasMes?.map(v => v.total_ventas) ?? [],
                                backgroundColor: 'rgba(37,99,235,.75)',
                                borderRadius: 6, yAxisID: 'y',
                            },
                            {
                                label: 'N° Pedidos',
                                data: ventasMes?.map(v => v.num_pedidos) ?? [],
                                type: 'line',
                                borderColor: '#f59e0b',
                                backgroundColor: 'transparent',
                                pointRadius: 5, tension: 0.4, yAxisID: 'y1',
                            },
                        ],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
                        scales: {
                            y:  { beginAtZero: true, ticks: { callback: v => 'S/'+v.toLocaleString(), font:{size:10} }, grid:{color:'#f3f4f6'} },
                            y1: { position: 'right', beginAtZero: true, ticks: { font:{size:10} }, grid:{display:false} },
                            x:  { ticks: { font:{size:10} }, grid:{display:false} },
                        },
                    },
                });
            }

            // Financiero chart
            if (chartFinancRef.current) {
                chartFinancInst.current?.destroy();
                chartFinancInst.current = new Chart(chartFinancRef.current, {
                    type: 'line',
                    data: {
                        labels: histFinanciero?.map(r => r.periodo?.slice(0,7)) ?? [],
                        datasets: [
                            { label:'ROA (%)', data: histFinanciero?.map(r=>r.roa)??[], borderColor:'#2563eb', backgroundColor:'rgba(37,99,235,.1)', tension:.4, fill:true, pointRadius:4 },
                            { label:'MN (%)',  data: histFinanciero?.map(r=>r.mn)??[],  borderColor:'#10b981', backgroundColor:'rgba(16,185,129,.1)', tension:.4, fill:true, pointRadius:4 },
                            { label:'CL/V (%)',data: histFinanciero?.map(r=>r.clv)??[], borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.1)',  tension:.4, fill:true, pointRadius:4 },
                        ],
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        interaction: { intersect: false, mode: 'index' },
                        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font:{size:11} } } },
                        scales: {
                            y: { beginAtZero: true, ticks: { callback: v=>v+'%', font:{size:10} }, grid:{color:'#f3f4f6'} },
                            x: { ticks: { font:{size:10} }, grid:{display:false} },
                        },
                    },
                });
            }
        });

        return () => {
            chartVentasInst.current?.destroy();
            chartFinancInst.current?.destroy();
        };
    }, [ventasMes, histFinanciero]);

    const kpisGestion = [
        { key:'tpri', label:'TPRI (D1)', value: tpri ? tpri+'d' : null, sub:'Reposición Inventario', icon:Clock, sem: semaforo(tpri,7,10), meta:'≤7 días' },
        { key:'tafi', label:'TAFI (D2)', value: tafi ? tafi+'min': null, sub:'Flujo de Información',  icon:Activity, sem: semaforo(tafi,15,29), meta:'≤15 min' },
        { key:'tppp', label:'TPPP (D3)', value: tppp ? Math.round(tppp)+'min': null, sub:'Procesam. Pedido', icon:Zap, sem: semaforo(tppp,30,45), meta:'≤30 min' },
        { key:'ei',   label:'EI (D4)',   value: ei   ? ei+'%': null,    sub:'Exactitud Inventario',   icon:Warehouse, sem: semaforo(ei,95,90,true), meta:'≥95%' },
        { key:'pepd', label:'PEPD (D5a)',value: pepd !== null ? pepd+'%': null, sub:'Errores Picking', icon:AlertTriangle, sem: semaforo(pepd,1,3), meta:'<1%' },
        { key:'clp',  label:'CLP (D5b)', value: clp  ? 'S/'+Number(clp).toFixed(0): null, sub:'Costo Log. x Pedido', icon:DollarSign, sem: semaforo(clp,10,20), meta:'≤S/.10' },
    ];

    const kpisRent = [
        { label:'ROA', value: roa ? roa+'%': null, sub:'Rentabilidad / Activos', icon:TrendingUp, sem: semaforo(roa,10,6,true), meta:'≥10%' },
        { label:'Margen Neto', value: mn ? mn+'%': null, sub:'Utilidad / Ventas', icon:Percent, sem: semaforo(mn,9,5,true), meta:'≥9%' },
        { label:'CL/Ventas', value: clv ? clv+'%': null, sub:'Costo Log. / Ventas', icon:Truck, sem: semaforo(clv,8,12), meta:'<8%' },
    ];

    return (
        <AppLayout title="Dashboard Gerencial">
            <Head title="Dashboard" />
            <FlashMessage />

            {/* ── KPIs Logística ───────────────────────────── */}
            <div className="mb-2">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Indicadores de Gestión Logística
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                    {kpisGestion.map(k => (
                        <KpiCard key={k.key} label={k.label} value={k.value} sub={k.sub}
                            semaforo={k.sem} icon={k.icon} meta={k.meta} />
                    ))}
                </div>
            </div>

            {/* ── KPIs Rentabilidad ─────────────────────────── */}
            <div className="mb-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-4">
                    Indicadores de Rentabilidad
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {kpisRent.map((k,i) => (
                        <KpiCard key={i} label={k.label} value={k.value} sub={k.sub}
                            semaforo={k.sem} icon={k.icon} meta={k.meta} />
                    ))}
                </div>
            </div>

            {/* ── Stats rápidos ─────────────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                {[
                    { icon: ShoppingCart, color:'bg-blue-100 text-blue-700', value: totalPedidosMes,    label: 'Pedidos este mes' },
                    { icon: Truck,        color:'bg-amber-100 text-amber-700', value: pendientesDespacho, label: 'Despachos pendientes' },
                    { icon: Package,      color:'bg-red-100 text-red-700',    value: stockCritico,       label: 'Stock crítico' },
                    { icon: Bell,         color:'bg-emerald-100 text-emerald-700', value: reqPendientes,  label: 'Requerimientos pend.' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color} flex-shrink-0`}>
                            <s.icon size={22} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-800">{s.value ?? 0}</div>
                            <div className="text-xs text-gray-500">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Gráficos ─────────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-700 text-sm">Evolución de Rentabilidad</h3>
                        <Link href="/reportes" className="text-xs text-blue-600 hover:underline">Ver reportes →</Link>
                    </div>
                    <div style={{height:'240px'}}>
                        <canvas ref={chartFinancRef} />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-700 text-sm">Pedidos por Mes (6 meses)</h3>
                        <Link href="/pedidos" className="text-xs text-blue-600 hover:underline">Ver pedidos →</Link>
                    </div>
                    <div style={{height:'240px'}}>
                        <canvas ref={chartVentasRef} />
                    </div>
                </div>
            </div>

            {/* ── Últimos pedidos + Alertas stock ─────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
                <div className="xl:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-700 text-sm">Últimos Pedidos</h3>
                        <Link href="/pedidos/nuevo" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                            + Nuevo
                        </Link>
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <th className="px-4 py-2 text-left font-semibold">Pedido</th>
                                <th className="px-4 py-2 text-left font-semibold">Cliente</th>
                                <th className="px-4 py-2 text-left font-semibold">Estado</th>
                                <th className="px-4 py-2 text-right font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ultimosPedidos?.length > 0 ? ultimosPedidos.map((p, i) => (
                                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5">
                                        <Link href={`/pedidos/${p.id}`} className="text-blue-600 font-semibold hover:underline">
                                            {p.numero}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-600 text-xs">{p.cliente_nombre ?? 'Mostrador'}</td>
                                    <td className="px-4 py-2.5"><PedidoBadge estado={p.estado} /></td>
                                    <td className="px-4 py-2.5 text-right font-semibold text-gray-700">{formatMoney(p.total)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400 text-xs">Sin pedidos registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="xl:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                            <AlertTriangle size={15} className="text-amber-500" />
                            Alertas de Stock
                        </h3>
                        <Link href="/inventario" className="text-xs text-blue-600 hover:underline">Ver todo</Link>
                    </div>
                    <div>
                        {alertasStock?.length > 0 ? alertasStock.map((a, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50">
                                <div>
                                    <div className="text-sm font-medium text-gray-700">{a.nombre}</div>
                                    <div className="text-xs text-gray-400">Stock: {a.stock_actual} / Min: {a.stock_minimo}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    a.stock_actual <= a.stock_minimo
                                        ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {a.stock_actual <= a.stock_minimo ? '¡Crítico!' : 'Bajo'}
                                </span>
                            </div>
                        )) : (
                            <div className="px-4 py-6 text-center text-gray-400 text-xs">
                                ✓ Sin alertas de stock
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
