import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessage from '@/Components/FlashMessage';
import { Search } from 'lucide-react';

export default function Conteo({ productos, ultimosConteos }) {
    const [items, setItems] = useState(
        productos?.map(p => ({ id: p.id, nombre: p.nombre, codigo: p.codigo, sistema: p.stock_actual, fisica: p.stock_actual, ubicacion: p.ubicacion_almacen })) ?? []
    );

    const { data, setData, post, processing } = useForm({ items: [], observaciones: '' });

    const updateFisica = (id, val) => {
        setItems(prev => prev.map(it => it.id === id ? {...it, fisica: Number(val)} : it));
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = { items: items.map(it => ({ id: it.id, fisica: it.fisica })), observaciones: data.observaciones };
        post('/inventario/conteo/guardar', { data: payload });
    };

    const [busqueda, setBusqueda] = useState('');
    const itemsFiltrados = busqueda
        ? items.filter(it => it.nombre.toLowerCase().includes(busqueda.toLowerCase()) || it.codigo.toLowerCase().includes(busqueda.toLowerCase()))
        : items;
    const diferencias = items.filter(it => it.fisica !== it.sistema);
    const exactitud   = items.length > 0 ? Math.round(((items.length - diferencias.length) / items.length) * 100) : 0;

    return (
        <AppLayout title="Conteo Físico de Inventario">
            <Head title="Conteo Físico" />
            <FlashMessage />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-700">Hoja de Conteo</h2>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">EI Estimado:</span>
                                <span className={`font-bold text-base ${exactitud>=95?'text-emerald-600':exactitud>=90?'text-amber-600':'text-red-600'}`}>
                                    {exactitud}%
                                </span>
                            </div>
                        </div>
                        <div className="px-4 py-2 border-b border-gray-100">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                                    placeholder="Buscar producto por código o nombre..."
                                    className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>
                        <form onSubmit={submit}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left">Código</th>
                                            <th className="px-4 py-2.5 text-left">Producto</th>
                                            <th className="px-4 py-2.5 text-center">Ubic.</th>
                                            <th className="px-4 py-2.5 text-center">Sistema</th>
                                            <th className="px-4 py-2.5 text-center">Físico</th>
                                            <th className="px-4 py-2.5 text-center">Dif.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itemsFiltrados.map(it => {
                                            const dif = it.fisica - it.sistema;
                                            return (
                                                <tr key={it.id} className={`border-t border-gray-50 ${dif!==0?'bg-amber-50/50':''}`}>
                                                    <td className="px-4 py-2"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{it.codigo}</code></td>
                                                    <td className="px-4 py-2 font-medium">{it.nombre}</td>
                                                    <td className="px-4 py-2 text-center text-xs text-gray-500">{it.ubicacion??'—'}</td>
                                                    <td className="px-4 py-2 text-center font-bold text-gray-600">{it.sistema}</td>
                                                    <td className="px-4 py-2 text-center">
                                                        <input type="number" min="0" value={it.fisica}
                                                            onChange={e => updateFisica(it.id, e.target.value)}
                                                            className="w-20 text-center border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        {dif !== 0 ? (
                                                            <span className={`font-bold ${dif>0?'text-emerald-600':'text-red-600'}`}>{dif>0?'+':''}{dif}</span>
                                                        ) : <span className="text-gray-300">—</span>}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones</label>
                                    <textarea value={data.observaciones} onChange={e => setData('observaciones', e.target.value)}
                                        rows={2} placeholder="Notas del conteo..."
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <button type="submit" disabled={processing}
                                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60">
                                    {processing ? 'Guardando...' : `Guardar Conteo (${diferencias.length} diferencias)`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Resumen del Conteo</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total productos</span>
                                <span className="font-bold">{items.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Con diferencias</span>
                                <span className={`font-bold ${diferencias.length>0?'text-amber-600':'text-emerald-600'}`}>{diferencias.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">EI estimado</span>
                                <span className={`font-bold text-lg ${exactitud>=95?'text-emerald-600':exactitud>=90?'text-amber-600':'text-red-600'}`}>{exactitud}%</span>
                            </div>
                        </div>
                        <div className="mt-3 text-xs text-gray-400">
                            Fórmula: (Correctos / Total) × 100<br/>
                            Meta: ≥95% (muy alto)
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700">Conteos Anteriores</h3>
                        </div>
                        {ultimosConteos?.map(c => (
                            <div key={c.id} className="px-4 py-2.5 border-t border-gray-50 flex justify-between text-xs">
                                <div>
                                    <div className="font-medium">{c.fecha_fin?.slice(0,10)}</div>
                                    <div className="text-gray-400">{c.usuario_nombre}</div>
                                </div>
                                <span className={`font-bold ${c.porcentaje_exactitud>=95?'text-emerald-600':c.porcentaje_exactitud>=90?'text-amber-600':'text-red-600'}`}>
                                    {c.porcentaje_exactitud}%
                                </span>
                            </div>
                        ))}
                        {ultimosConteos?.length === 0 && <div className="px-4 py-4 text-center text-xs text-gray-400">Sin conteos previos</div>}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
