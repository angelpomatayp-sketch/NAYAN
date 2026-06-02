/**
 * KpiCard - Tarjeta de indicador de desempeño con semáforo
 * semaforo: 'verde' | 'amarillo' | 'rojo' | 'azul' | 'sin_datos'
 */
const COLORS = {
    verde:     'from-emerald-500 to-green-600',
    amarillo:  'from-amber-500 to-orange-500',
    rojo:      'from-red-500 to-rose-600',
    azul:      'from-blue-600 to-blue-700',
    sin_datos: 'from-gray-400 to-gray-500',
};

export default function KpiCard({ label, value, sub, semaforo = 'sin_datos', icon: Icon, meta }) {
    const gradient = COLORS[semaforo] ?? COLORS.sin_datos;
    return (
        <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white overflow-hidden`}>
            {/* background decoration */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 right-2 w-24 h-24 rounded-full bg-white/5" />

            {Icon && (
                <div className="absolute top-3 right-3 opacity-20">
                    <Icon size={32} />
                </div>
            )}

            <div className="relative z-10">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">{label}</div>
                <div className="text-3xl font-black leading-none mb-1">
                    {value ?? <span className="text-xl opacity-60">—</span>}
                </div>
                {sub && <div className="text-[11px] opacity-75 mt-1">{sub}</div>}
                {meta && (
                    <div className="text-[10px] opacity-60 mt-2 flex items-center gap-1">
                        <span>Meta: {meta}</span>
                        <span className="ml-1">
                            {semaforo === 'verde' ? '✓' : semaforo === 'amarillo' ? '⚠' : semaforo === 'rojo' ? '✗' : '—'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
