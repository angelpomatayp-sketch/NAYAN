import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessage from '@/Components/FlashMessage';
import Pagination from '@/Components/Pagination';
import StockBadge from '@/Components/StockBadge';
import { Plus, History, ClipboardCheck, Search, ArrowUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function InventarioIndex({ productos, categorias, stats }) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [busqueda, setBusqueda]         = useState(params.get('buscar') ?? '');
    const [filtroCategoria, setFiltroCategoria] = useState(params.get('categoria') ?? '');
    const [filtroEstado, setFiltroEstado]       = useState(params.get('estado') ?? '');
    const [modalProd, setModalProd] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        producto_id: '', tipo: 'entrada', cantidad: '', motivo: '',
    });

    const productosFiltrados = productos?.data ?? [];

    const aplicarFiltros = (campo, valor) => {
        const filtros = {
            buscar: campo === 'buscar' ? valor : busqueda,
            categoria: campo === 'categoria' ? valor : filtroCategoria,
            estado: campo === 'estado' ? valor : filtroEstado,
        };
        Object.keys(filtros).forEach(k => { if (!filtros[k]) delete filtros[k]; });
        router.get('/inventario', filtros, { preserveState: true, replace: true });
    };

    const handleSearch = (e) => { e.preventDefault(); aplicarFiltros('buscar', busqueda); };

    const abrirMovimiento = (prod) => {
        setModalProd(prod);
        setData({ producto_id: prod.id, tipo: 'entrada', cantidad: '', motivo: '' });
    };

    const submitMovimiento = (e) => {
        e.preventDefault();
        post('/inventario/movimiento', {
            onSuccess: () => { setModalProd(null); reset(); },
        });
    };

    return (
        <AppLayout title="Gestión de Inventarios">
            <Head title="Inventario" />
            <FlashMessage />

            {/* Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {[
                    { label:'Total Productos', value: stats?.total ?? 0, color:'text-blue-600', bg:'bg-blue-50' },
                    { label:'Stock Crítico',   value: stats?.critico ?? 0, color:'text-red-600', bg:'bg-red-50' },
                    { label:'Stock Bajo',      value: stats?.bajo ?? 0, color:'text-amber-600', bg:'bg-amber-50' },
                    { label:'Valor Inventario',value: 'S/.'+Number(stats?.valor_inventario??0).toLocaleString('es-PE',{minimumFractionDigits:0}), color:'text-emerald-600', bg:'bg-emerald-50' },
                ].map((s,i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            <div>
                <div>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                            <h2 className="font-semibold text-gray-700">Inventario de Productos</h2>
                            <div className="flex gap-2 flex-wrap">
                                <Link href="/inventario/kardex" className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                                    <History size={14} /> Kardex
                                </Link>
                                <Link href="/inventario/conteo" className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50">
                                    <ClipboardCheck size={14} /> Conteo Físico
                                </Link>
                                <Link href="/productos" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    <Plus size={14} /> Producto
                                </Link>
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="px-4 py-2.5 border-b border-gray-100 flex flex-wrap gap-2">
                            <form onSubmit={handleSearch} className="relative flex-1 min-w-[180px] flex gap-2">
                                <div className="relative flex-1">
                                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Buscar código o nombre..."
                                        value={busqueda} onChange={e => setBusqueda(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                </div>
                                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">Buscar</button>
                            </form>
                            <select value={filtroCategoria} onChange={e=>{ setFiltroCategoria(e.target.value); aplicarFiltros('categoria', e.target.value); }}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todas las categorías</option>
                                {categorias?.map(c => <option key={c.id} value={String(c.id)}>{c.nombre}</option>)}
                            </select>
                            <select value={filtroEstado} onChange={e=>{ setFiltroEstado(e.target.value); aplicarFiltros('estado', e.target.value); }}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los estados</option>
                                <option value="critico">Crítico</option>
                                <option value="bajo">Bajo</option>
                                <option value="ok">OK</option>
                            </select>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-2.5 text-left font-semibold">Código</th>
                                        <th className="px-4 py-2.5 text-left font-semibold">Producto</th>
                                        <th className="px-4 py-2.5 text-left font-semibold">Categoría</th>
                                        <th className="px-4 py-2.5 text-center font-semibold">Stock</th>
                                        <th className="px-4 py-2.5 text-right font-semibold">P. Venta</th>
                                        <th className="px-4 py-2.5 text-center font-semibold">Ubic.</th>
                                        <th className="px-4 py-2.5 text-center font-semibold">Estado</th>
                                        <th className="px-4 py-2.5 text-center font-semibold">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productosFiltrados.map(p => (
                                        <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                                            <td className="px-4 py-2.5">
                                                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.codigo}</code>
                                            </td>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">{p.nombre}</td>
                                            <td className="px-4 py-2.5 text-gray-500 text-xs">{p.categoria_nombre ?? '—'}</td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className="font-bold">{p.stock_actual}</span>
                                                <span className="text-xs text-gray-400 block">min:{p.stock_minimo}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                                                S/.{p.precio_venta}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <code className="text-xs">{p.ubicacion_almacen ?? '—'}</code>
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <StockBadge status={p.stock_status} />
                                            </td>
                                            <td className="px-4 py-2.5 text-center">
                                                <button onClick={() => abrirMovimiento(p)}
                                                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                                                    <ArrowUpDown size={15} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {productosFiltrados.length === 0 && (
                                        <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">Sin productos encontrados</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination links={productos?.links} meta={productos?.meta ?? productos} />
                    </div>
                </div>

            </div>

            {/* Modal Movimiento */}
            {modalProd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800">Registrar Movimiento</h3>
                            <button onClick={() => setModalProd(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                        </div>
                        <form onSubmit={submitMovimiento} className="p-5 space-y-4">
                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-1">Producto</div>
                                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-semibold">{modalProd.nombre}</div>
                                <div className="text-xs text-gray-400 mt-1">Stock actual: <strong>{modalProd.stock_actual}</strong></div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                                <select value={data.tipo} onChange={e=>setData('tipo',e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="entrada">Entrada (ingreso)</option>
                                    <option value="salida">Salida (egreso)</option>
                                    <option value="ajuste">Ajuste de inventario</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cantidad</label>
                                <input type="number" min="1" value={data.cantidad} onChange={e=>setData('cantidad',e.target.value)}
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {errors.cantidad && <div className="text-red-500 text-xs mt-1">{errors.cantidad}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo</label>
                                <input type="text" value={data.motivo} onChange={e=>setData('motivo',e.target.value)}
                                    placeholder="Descripción del movimiento"
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalProd(null)}
                                    className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={processing}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                                    {processing ? 'Guardando...' : 'Registrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
