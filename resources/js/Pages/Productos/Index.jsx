import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessage from '@/Components/FlashMessage';
import Pagination from '@/Components/Pagination';
import StockBadge from '@/Components/StockBadge';
import Modal from '@/Components/Modal';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const EMPTY = {
    codigo: '', nombre: '', descripcion: '', categoria_id: '',
    precio_compra: 0, precio_venta: 0, stock_actual: 0,
    stock_minimo: 5, stock_reorden: 10, ubicacion_almacen: '',
};

export default function ProductosIndex({ productos, categorias }) {
    const [modal, setModal]         = useState(null); // 'crear' | 'editar' | 'eliminar'
    const [prodSel, setProdSel]     = useState(null);
    const [busqueda, setBusqueda]   = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm(EMPTY);

    const abrirCrear = () => {
        reset(); clearErrors();
        setModal('crear');
    };

    const abrirEditar = (p) => {
        setProdSel(p);
        setData({ ...EMPTY, ...p, categoria_id: p.categoria_id ?? '' });
        clearErrors();
        setModal('editar');
    };

    const abrirEliminar = (p) => {
        setProdSel(p);
        setModal('eliminar');
    };

    const cerrar = () => { setModal(null); setProdSel(null); };

    const submitCrear = (e) => {
        e.preventDefault();
        post('/productos', { onSuccess: cerrar });
    };

    const submitEditar = (e) => {
        e.preventDefault();
        router.put(`/productos/${prodSel.id}`, data, { onSuccess: cerrar });
    };

    const confirmarEliminar = () => {
        router.delete(`/productos/${prodSel.id}`, { onSuccess: cerrar });
    };

    const campos = [
        { key: 'codigo',            label: 'Código *',         type: 'text',   col: 1, placeholder: 'PRO-016' },
        { key: 'nombre',            label: 'Nombre *',         type: 'text',   col: 2, placeholder: 'Nombre del producto' },
        { key: 'precio_compra',     label: 'P. Compra (S/.)',  type: 'number', col: 1 },
        { key: 'precio_venta',      label: 'P. Venta (S/.)',   type: 'number', col: 1 },
        { key: 'stock_actual',      label: 'Stock Actual',     type: 'number', col: 1 },
        { key: 'stock_minimo',      label: 'Stock Mínimo',     type: 'number', col: 1 },
        { key: 'stock_reorden',     label: 'Punto Reorden',    type: 'number', col: 1 },
        { key: 'ubicacion_almacen', label: 'Ubicación',        type: 'text',   col: 1, placeholder: 'A-01' },
    ];

    const filtrados = productos?.data ?? (Array.isArray(productos) ? productos : []);
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/productos', busqueda ? { buscar: busqueda } : {}, { preserveState: true, replace: true });
    };

    const FormProducto = ({ onSubmit, btnLabel }) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {campos.map(c => (
                    <div key={c.key} className={c.col === 2 ? 'col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">{c.label}</label>
                        <input
                            type={c.type}
                            step={c.type === 'number' ? '0.01' : undefined}
                            min={c.type === 'number' ? '0' : undefined}
                            value={data[c.key]}
                            onChange={e => setData(c.key, e.target.value)}
                            placeholder={c.placeholder}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors[c.key] && <p className="text-red-500 text-xs mt-0.5">{errors[c.key]}</p>}
                    </div>
                ))}
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
                    <select
                        value={data.categoria_id}
                        onChange={e => setData('categoria_id', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Sin categoría</option>
                        {categorias?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                    <textarea
                        value={data.descripcion}
                        onChange={e => setData('descripcion', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrar}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
                    Cancelar
                </button>
                <button type="submit" disabled={processing}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                    {processing ? 'Guardando...' : btnLabel}
                </button>
            </div>
        </form>
    );

    return (
        <AppLayout title="Catálogo de Productos">
            <Head title="Productos" />
            <FlashMessage />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">
                        Productos <span className="text-sm text-gray-400 font-normal">({filtrados.length})</span>
                    </h2>
                    <div className="flex gap-2">
                        <form onSubmit={handleSearch} className="flex gap-1.5">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Buscar código o nombre..." value={busqueda}
                                    onChange={e => setBusqueda(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
                            </div>
                            <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                        </form>
                        <button onClick={abrirCrear}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            <Plus size={14} /> Nuevo Producto
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Código</th>
                                <th className="px-4 py-2.5 text-left">Nombre</th>
                                <th className="px-4 py-2.5 text-left">Categoría</th>
                                <th className="px-4 py-2.5 text-right">P.Compra</th>
                                <th className="px-4 py-2.5 text-right">P.Venta</th>
                                <th className="px-4 py-2.5 text-center">Stock</th>
                                <th className="px-4 py-2.5 text-center">Ubic.</th>
                                <th className="px-4 py-2.5 text-center">Estado</th>
                                <th className="px-4 py-2.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(p => (
                                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5">
                                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{p.codigo}</code>
                                    </td>
                                    <td className="px-4 py-2.5 font-medium text-gray-800">{p.nombre}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.categoria_nombre ?? '—'}</td>
                                    <td className="px-4 py-2.5 text-right text-gray-600">S/.{p.precio_compra}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold">S/.{p.precio_venta}</td>
                                    <td className="px-4 py-2.5 text-center font-bold">{p.stock_actual}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <code className="text-xs">{p.ubicacion_almacen ?? '—'}</code>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <StockBadge status={p.stock_status} />
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => abrirEditar(p)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar">
                                                <Pencil size={14} />
                                            </button>
                                            <button onClick={() => abrirEliminar(p)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtrados.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-gray-400 text-sm">
                                        {busqueda ? `Sin resultados para "${busqueda}"` : 'Sin productos registrados'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination links={productos?.links} meta={productos?.meta ?? productos} />
                </div>
            </div>

            {/* Modal Crear */}
            <Modal show={modal === 'crear'} onClose={cerrar} title="Nuevo Producto" size="lg">
                <FormProducto onSubmit={submitCrear} btnLabel="Crear Producto" />
            </Modal>

            {/* Modal Editar */}
            <Modal show={modal === 'editar'} onClose={cerrar} title={`Editar — ${prodSel?.nombre ?? ''}`} size="lg">
                <FormProducto onSubmit={submitEditar} btnLabel="Guardar Cambios" />
            </Modal>

            {/* Modal Eliminar */}
            <Modal show={modal === 'eliminar'} onClose={cerrar} title="Confirmar Eliminación" size="sm">
                <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <Trash2 size={24} className="text-red-500" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">¿Eliminar producto?</p>
                    <p className="text-sm text-gray-500 mb-5">
                        <strong>{prodSel?.nombre}</strong> será desactivado del sistema.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={cerrar}
                            className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button onClick={confirmarEliminar}
                            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
