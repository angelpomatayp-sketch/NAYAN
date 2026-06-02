export default function StockBadge({ status }) {
    const map = {
        critico: 'bg-red-100 text-red-700 border border-red-200',
        bajo:    'bg-amber-100 text-amber-700 border border-amber-200',
        ok:      'bg-emerald-100 text-emerald-700 border border-emerald-200',
    };
    const labels = { critico: 'Crítico', bajo: 'Bajo', ok: 'OK' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? map.ok}`}>
            {labels[status] ?? status}
        </span>
    );
}
