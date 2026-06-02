const PEDIDO_ESTADOS = {
    registrado:     'bg-gray-100 text-gray-700',
    en_preparacion: 'bg-blue-100 text-blue-700',
    despachado:     'bg-indigo-100 text-indigo-700',
    entregado:      'bg-emerald-100 text-emerald-700',
    cancelado:      'bg-red-100 text-red-700',
};
const PEDIDO_LABELS = {
    registrado: 'Registrado', en_preparacion: 'En Preparación',
    despachado: 'Despachado', entregado: 'Entregado', cancelado: 'Cancelado',
};
const PRIORIDAD_ESTADOS = {
    baja:'bg-gray-100 text-gray-600', media:'bg-blue-100 text-blue-700',
    alta:'bg-amber-100 text-amber-700', urgente:'bg-red-100 text-red-700',
};

export function PedidoBadge({ estado }) {
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${PEDIDO_ESTADOS[estado] ?? 'bg-gray-100 text-gray-600'}`}>
            {PEDIDO_LABELS[estado] ?? estado}
        </span>
    );
}

export function PrioridadBadge({ prioridad }) {
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORIDAD_ESTADOS[prioridad] ?? 'bg-gray-100'}`}>
            {prioridad}
        </span>
    );
}

export function DespachoEstadoBadge({ estado }) {
    const map = {
        pendiente:'bg-gray-100 text-gray-600', en_picking:'bg-amber-100 text-amber-700',
        verificado:'bg-blue-100 text-blue-700', despachado:'bg-indigo-100 text-indigo-700',
        entregado:'bg-emerald-100 text-emerald-700',
    };
    const labels = {
        pendiente:'Pendiente', en_picking:'En Picking', verificado:'Verificado',
        despachado:'Despachado', entregado:'Entregado',
    };
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[estado] ?? 'bg-gray-100'}`}>
            {labels[estado] ?? estado}
        </span>
    );
}
