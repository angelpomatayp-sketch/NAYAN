import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessage from '@/Components/FlashMessage';
import Modal from '@/Components/Modal';
import { PedidoBadge } from '@/Components/EstadoBadge';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function PedidosVer({ pedido }) {
    const { auth } = usePage().props;
    const puedeActualizarEstado = ['admin','vendedor','almacen','logistica'].includes(auth?.user?.rol);
    const puedePicking = ['admin','almacen','logistica'].includes(auth?.user?.rol);
    const puedeReclamar = ['admin','vendedor'].includes(auth?.user?.rol) && pedido?.estado === 'entregado';

    const [modalReclamo, setModalReclamo] = useState(false);
    const { data, setData, patch, processing } = useForm({ estado: pedido?.estado ?? '' });
    const { data: rData, setData: setRData, post: postReclamo, processing: rProc, reset: rReset, errors: rErrors } = useForm({
        pedido_id: pedido?.id,
        tipo: 'cantidad_incorrecta',
        descripcion: '',
        productos_afectados: pedido?.detalle?.map(d => ({
            producto_id: d.producto_id,
            nombre: d.producto?.nombre,
            cantidad: 0,
            precio_unitario: d.precio_unitario,
        })) ?? [],
    });

    const submitReclamo = (e) => {
        e.preventDefault();
        const afectados = rData.productos_afectados.filter(p => p.cantidad > 0);
        postReclamo('/reclamaciones', {
            data: { ...rData, productos_afectados: afectados },
            onSuccess: () => { setModalReclamo(false); rReset(); }
        });
    };

    const actualizarEstado = (e) => {
        e.preventDefault();
        patch(`/pedidos/${pedido?.id}/estado`);
    };

    const total = pedido?.detalle?.reduce((s, d) => s + d.subtotal, 0) ?? 0;

    return (
        <AppLayout title={`Pedido ${pedido?.numero}`}>
            <Head title={`Pedido ${pedido?.numero}`} />
            <FlashMessage />

            <div className="mb-4 flex items-center gap-3">
                <a href="/pedidos" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={15} /> Volver
                </a>
                <h2 className="font-bold text-gray-800">{pedido?.numero}</h2>
                <PedidoBadge estado={pedido?.estado} />
                {puedeReclamar && (
                    <button onClick={() => setModalReclamo(true)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100">
                        <AlertCircle size={13} /> Registrar Reclamo
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Información del Pedido</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div><span className="text-gray-500 block">N° Pedido</span><strong>{pedido?.numero}</strong></div>
                            <div><span className="text-gray-500 block">Cliente</span><strong>{pedido?.cliente?.nombre ?? 'Mostrador'}</strong></div>
                            <div><span className="text-gray-500 block">Tipo</span><strong className="capitalize">{pedido?.tipo}</strong></div>
                            <div><span className="text-gray-500 block">Fecha Entrada</span><strong>{pedido?.fecha_entrada?.slice(0,16).replace('T',' ')}</strong></div>
                            <div><span className="text-gray-500 block">Fecha Despacho</span><strong>{pedido?.fecha_despacho?.slice(0,16).replace('T',' ') ?? '—'}</strong></div>
                            <div><span className="text-gray-500 block">Zona</span><strong>{pedido?.zona ?? '—'}</strong></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-700 text-sm">Detalle de Productos</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2.5 text-left">Producto</th>
                                    <th className="px-4 py-2.5 text-center">Cant.</th>
                                    <th className="px-4 py-2.5 text-right">P. Unit.</th>
                                    <th className="px-4 py-2.5 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedido?.detalle?.map((d, i) => (
                                    <tr key={i} className="border-t border-gray-50">
                                        <td className="px-4 py-2.5">{d.producto?.nombre}</td>
                                        <td className="px-4 py-2.5 text-center font-bold">{d.cantidad}</td>
                                        <td className="px-4 py-2.5 text-right">S/.{d.precio_unitario}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold">S/.{d.subtotal}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t-2 border-gray-200">
                                    <td colSpan={3} className="px-4 py-2.5 text-right font-bold">TOTAL</td>
                                    <td className="px-4 py-2.5 text-right font-bold text-blue-600 text-base">
                                        S/.{Number(pedido?.total ?? 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="space-y-4">
                    {puedeActualizarEstado && (
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Actualizar Estado</h3>
                            <form onSubmit={actualizarEstado} className="space-y-3">
                                <select value={data.estado} onChange={e => setData('estado', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="registrado">Registrado</option>
                                    <option value="en_preparacion">En Preparación</option>
                                    <option value="despachado">Despachado</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                                <button type="submit" disabled={processing}
                                    className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                                    {processing ? 'Actualizando...' : 'Actualizar Estado'}
                                </button>
                            </form>
                        </div>
                    )}

                    {pedido?.despacho && (
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Despacho Asociado</h3>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">N° Despacho</span>
                                    {puedePicking ? (
                                        <a href={`/picking/${pedido.despacho.id}`} className="text-blue-600 font-semibold hover:underline">
                                            {pedido.despacho.numero}
                                        </a>
                                    ) : (
                                        <span className="font-semibold">{pedido.despacho.numero}</span>
                                    )}
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Estado</span>
                                    <span className="font-medium capitalize">{pedido.despacho.estado?.replace('_',' ')}</span>
                                </div>
                                {pedido.despacho.costo_total > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Costo Logístico</span>
                                        <span className="font-semibold">S/.{Number(pedido.despacho.costo_total).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Modal Reclamo */}
            <Modal show={modalReclamo} onClose={() => setModalReclamo(false)} title="Registrar Reclamo del Cliente" size="md">
                <form onSubmit={submitReclamo} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de reclamo</label>
                        <select value={rData.tipo} onChange={e => setRData('tipo', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                            <option value="cantidad_incorrecta">Cantidad incorrecta</option>
                            <option value="producto_incorrecto">Producto incorrecto</option>
                            <option value="mal_estado">Producto en mal estado</option>
                            <option value="no_entregado">No fue entregado</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción del reclamo</label>
                        <textarea value={rData.descripcion} onChange={e => setRData('descripcion', e.target.value)}
                            required rows={3} placeholder="Detalle lo que reportó el cliente..."
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"/>
                        {rErrors.descripcion && <p className="text-xs text-red-500 mt-1">{rErrors.descripcion}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Productos afectados (cantidad reclamada)</label>
                        <div className="space-y-2">
                            {rData.productos_afectados?.map((prod, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="flex-1 text-gray-700 truncate">{prod.nombre}</span>
                                    <span className="text-xs text-gray-400">S/.{prod.precio_unitario}</span>
                                    <input type="number" min="0" value={prod.cantidad}
                                        onChange={e => {
                                            const updated = [...rData.productos_afectados];
                                            updated[i] = { ...updated[i], cantidad: Number(e.target.value) };
                                            setRData('productos_afectados', updated);
                                        }}
                                        className="w-16 text-center border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"/>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-right text-sm font-semibold text-red-600">
                            Valor reclamo: S/.{rData.productos_afectados?.reduce((s,p) => s + (p.cantidad * p.precio_unitario), 0).toFixed(2)}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={() => setModalReclamo(false)}
                            className="flex-1 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={rProc}
                            className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
                            {rProc ? 'Registrando...' : 'Registrar Reclamo'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
