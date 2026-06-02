import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Pagination from '@/Components/Pagination';
import { Download, Search } from 'lucide-react';

export default function Kardex({ productos, movimientos, productoSel }) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [prodId, setProdId] = useState(productoSel?.id ?? '');
    const [buscarMov, setBuscarMov] = useState(params.get('buscar') ?? '');

    const buscar = () => router.get('/inventario/kardex', { producto: prodId });
    const handleSearchMov = (e) => {
        e.preventDefault();
        router.get('/inventario/kardex', { producto: prodId, buscar: buscarMov }, { preserveState: true, replace: true });
    };

    const movData = movimientos?.data ?? movimientos ?? [];
    const exportCSV = () => {
        const rows = [['#','Fecha','Tipo','Cantidad','Stock Anterior','Stock Nuevo','Motivo','Referencia','Usuario']];
        movData?.forEach((m, i) => {
            rows.push([movData.length - i, m.fecha_hora, m.tipo, m.cantidad, m.stock_anterior, m.stock_nuevo, m.motivo??'—', m.referencia??'—', m.usuario_nombre]);
        });
        const csv = '﻿' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
        a.download = `kardex_${productoSel?.codigo ?? 'export'}.csv`;
        a.click();
    };

    const tipoColor = { entrada:'bg-emerald-100 text-emerald-700', salida:'bg-red-100 text-red-700', ajuste:'bg-amber-100 text-amber-700', conteo_fisico:'bg-blue-100 text-blue-700' };

    return (
        <AppLayout title="Kardex de Inventario">
            <Head title="Kardex" />
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[240px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Producto</label>
                        <select value={prodId} onChange={e=>setProdId(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">— Seleccione producto —</option>
                            {productos?.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
                        </select>
                    </div>
                    <button onClick={buscar} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                        Ver Kardex
                    </button>
                </div>
            </div>

            {productoSel && (
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-gray-500">Código:</span> <strong>{productoSel.codigo}</strong></div>
                    <div><span className="text-gray-500">Nombre:</span> <strong>{productoSel.nombre}</strong></div>
                    <div><span className="text-gray-500">Stock:</span> <strong className="text-blue-600">{productoSel.stock_actual}</strong></div>
                    <div className="flex justify-end">
                        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-600 rounded-lg text-xs hover:bg-emerald-50">
                            <Download size={14} /> Exportar CSV
                        </button>
                    </div>
                </div>
            )}

            {movData?.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <form onSubmit={handleSearchMov} className="flex gap-2 max-w-sm">
                            <div className="relative flex-1">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" value={buscarMov} onChange={e=>setBuscarMov(e.target.value)}
                                    placeholder="Buscar por tipo o motivo..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                        </form>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2.5 text-left">#</th>
                                    <th className="px-4 py-2.5 text-left">Fecha y Hora</th>
                                    <th className="px-4 py-2.5 text-left">Tipo</th>
                                    <th className="px-4 py-2.5 text-right">Cantidad</th>
                                    <th className="px-4 py-2.5 text-right">Ant.</th>
                                    <th className="px-4 py-2.5 text-right">Nuevo</th>
                                    <th className="px-4 py-2.5 text-left">Motivo</th>
                                    <th className="px-4 py-2.5 text-left">Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movData.map((m, i) => (
                                    <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-2.5 text-gray-400">{movData.length - i}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-600">{m.fecha_hora?.replace('T',' ').slice(0,16)}</td>
                                        <td className="px-4 py-2.5">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoColor[m.tipo]??'bg-gray-100'}`}>
                                                {m.tipo?.replace('_',' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-semibold">
                                            <span className={m.tipo==='salida'?'text-red-600':m.tipo==='entrada'?'text-emerald-600':'text-amber-600'}>
                                                {m.tipo==='salida'?'-':m.tipo==='entrada'?'+':''}{m.cantidad}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-gray-400">{m.stock_anterior}</td>
                                        <td className="px-4 py-2.5 text-right font-bold">{m.stock_nuevo}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[180px] truncate">{m.motivo??'—'}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500">{m.usuario_nombre}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={movimientos?.links} meta={movimientos?.meta ?? movimientos} />
                </div>
            ) : productoSel ? (
                <div className="bg-white rounded-xl p-10 text-center text-gray-400">Sin movimientos registrados</div>
            ) : (
                <div className="bg-white rounded-xl p-10 text-center text-gray-400">Seleccione un producto para ver su kardex</div>
            )}
        </AppLayout>
    );
}
