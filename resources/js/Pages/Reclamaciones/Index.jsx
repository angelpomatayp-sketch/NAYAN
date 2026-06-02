import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import { AlertCircle } from "lucide-react";

const TIPO_LABEL = {
    mal_estado:           'Mal estado',
    cantidad_incorrecta:  'Cantidad incorrecta',
    producto_incorrecto:  'Producto incorrecto',
    no_entregado:         'No entregado',
    otro:                 'Otro',
};

const ESTADO_COLOR = {
    pendiente:   'bg-amber-100 text-amber-700',
    en_revision: 'bg-blue-100 text-blue-700',
    resuelto:    'bg-emerald-100 text-emerald-700',
};

export default function ReclamacionesIndex({ reclamaciones, stats }) {
    return (
        <AppLayout title="Reclamos de Clientes">
            <Head title="Reclamos"/>
            <FlashMessage/>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {[
                    { label: 'Total reclamos',   value: stats?.total ?? 0,                           color: 'text-red-600' },
                    { label: 'Pendientes',        value: stats?.pendientes ?? 0,                      color: 'text-amber-600' },
                    { label: 'Valor reclamado',   value: 'S/.' + Number(stats?.valor_total ?? 0).toFixed(2), color: 'text-red-700' },
                    { label: 'TRC (% entregas)',  value: (stats?.trc ?? 0) + '%',                     color: 'text-gray-700' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <AlertCircle size={15} className="text-red-500"/>
                    <h2 className="font-semibold text-gray-700">Historial de Reclamos</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Pedido</th>
                                <th className="px-4 py-2.5 text-left">Cliente</th>
                                <th className="px-4 py-2.5 text-left">Tipo</th>
                                <th className="px-4 py-2.5 text-left">Descripción</th>
                                <th className="px-4 py-2.5 text-right">Valor</th>
                                <th className="px-4 py-2.5 text-center">Estado</th>
                                <th className="px-4 py-2.5 text-left">Fecha</th>
                                <th className="px-4 py-2.5 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reclamaciones?.data?.map(r => (
                                <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-semibold text-blue-600">
                                        <a href={`/pedidos/${r.pedido_id}`} className="hover:underline">{r.pedido_numero}</a>
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-600">{r.cliente_nombre ?? 'Mostrador'}</td>
                                    <td className="px-4 py-2.5">
                                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                            {TIPO_LABEL[r.tipo] ?? r.tipo}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{r.descripcion}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold text-red-600">
                                        {Number(r.valor_reclamo) > 0 ? `S/.${Number(r.valor_reclamo).toFixed(2)}` : '—'}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[r.estado] ?? 'bg-gray-100'}`}>
                                            {r.estado?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">
                                        {r.fecha_reclamo?.slice(0, 16).replace('T', ' ')}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        {r.estado !== 'resuelto' && <EstadoSelect id={r.id} estadoActual={r.estado} />}
                                    </td>
                                </tr>
                            ))}
                            {!reclamaciones?.data?.length && (
                                <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-xs">Sin reclamos registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}

function EstadoSelect({ id, estadoActual }) {
    const { data, setData, patch, processing } = useForm({ estado: estadoActual });
    return (
        <select value={data.estado} onChange={e => { setData('estado', e.target.value); patch(`/reclamaciones/${id}`); }}
            disabled={processing}
            className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50">
            <option value="pendiente">Pendiente</option>
            <option value="en_revision">En revisión</option>
            <option value="resuelto">Resuelto</option>
        </select>
    );
}
