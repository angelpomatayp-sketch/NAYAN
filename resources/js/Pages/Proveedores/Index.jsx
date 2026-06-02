import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessage from '@/Components/FlashMessage';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { Plus, Pencil, Trash2, Search, Star } from 'lucide-react';

const EMPTY = { nombre:'', ruc:'', contacto:'', telefono:'', email:'', direccion:'', condiciones_pago:'', calificacion:5.0 };

export default function ProveedoresIndex({ proveedores }) {
    const [modal, setModal]   = useState(null);
    const [sel, setSel]       = useState(null);
    const [busqueda, setBusq] = useState('');
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(EMPTY);

    const abrirCrear  = () => { reset(); clearErrors(); setModal('crear'); };
    const abrirEditar = (p) => { setSel(p); setData({ ...EMPTY, ...p }); clearErrors(); setModal('editar'); };
    const abrirDel    = (p) => { setSel(p); setModal('eliminar'); };
    const cerrar      = () => { setModal(null); setSel(null); };

    const submitCrear  = (e) => { e.preventDefault(); post('/proveedores', { onSuccess: cerrar }); };
    const submitEditar = (e) => { e.preventDefault(); router.put(`/proveedores/${sel.id}`, data, { onSuccess: cerrar }); };
    const confirmarDel = ()  => router.delete(`/proveedores/${sel.id}`, { onSuccess: cerrar });

    const lista = proveedores?.data ?? (Array.isArray(proveedores) ? proveedores : []);
    const filtrados = lista;
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/proveedores', busqueda ? { buscar: busqueda } : {}, { preserveState: true, replace: true });
    };

    const FormProveedor = ({ onSubmit, btnLabel }) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre / Razón Social *</label>
                    <input required value={data.nombre} onChange={e=>setData('nombre',e.target.value)} placeholder="Empresa proveedora"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    {errors.nombre && <p className="text-red-500 text-xs mt-0.5">{errors.nombre}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">RUC</label>
                    <input value={data.ruc} onChange={e=>setData('ruc',e.target.value)} placeholder="20123456789"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Persona de Contacto</label>
                    <input value={data.contacto} onChange={e=>setData('contacto',e.target.value)} placeholder="Nombre del contacto"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input value={data.telefono} onChange={e=>setData('telefono',e.target.value)} placeholder="987654321"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" value={data.email} onChange={e=>setData('email',e.target.value)} placeholder="ventas@proveedor.com"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Condiciones de Pago</label>
                    <select value={data.condiciones_pago} onChange={e=>setData('condiciones_pago',e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option>Contado</option><option>15 días</option><option>30 días</option>
                        <option>45 días</option><option>60 días</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Calificación (1-5)</label>
                    <input type="number" step="0.1" min="1" max="5" value={data.calificacion} onChange={e=>setData('calificacion',e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección</label>
                    <input value={data.direccion} onChange={e=>setData('direccion',e.target.value)} placeholder="Jr. Ejemplo 123, Lima"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
                <button type="button" onClick={cerrar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={processing} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                    {processing?'Guardando...':btnLabel}
                </button>
            </div>
        </form>
    );

    return (
        <AppLayout title="Proveedores">
            <Head title="Proveedores"/><FlashMessage/>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">Proveedores <span className="text-sm text-gray-400 font-normal">({filtrados.length})</span></h2>
                    <div className="flex gap-2">
                        <form onSubmit={handleSearch} className="flex gap-1.5">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" placeholder="Buscar nombre o RUC..." value={busqueda} onChange={e=>setBusq(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
                            </div>
                            <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                        </form>
                        <button onClick={abrirCrear} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            <Plus size={14}/> Nuevo Proveedor
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Nombre</th>
                                <th className="px-4 py-2.5 text-left">RUC</th>
                                <th className="px-4 py-2.5 text-left">Contacto</th>
                                <th className="px-4 py-2.5 text-left">Teléfono</th>
                                <th className="px-4 py-2.5 text-left">Cond. Pago</th>
                                <th className="px-4 py-2.5 text-center">Calificación</th>
                                <th className="px-4 py-2.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(p=>(
                                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-medium">{p.nombre}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.ruc??'—'}</td>
                                    <td className="px-4 py-2.5 text-xs">{p.contacto??'—'}</td>
                                    <td className="px-4 py-2.5 text-xs">{p.telefono??'—'}</td>
                                    <td className="px-4 py-2.5 text-xs">{p.condiciones_pago??'—'}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                                            <Star size={12} className="fill-amber-400 text-amber-400"/>{p.calificacion}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={()=>abrirEditar(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Pencil size={14}/></button>
                                            <button onClick={()=>abrirDel(p)}    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"  title="Eliminar"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtrados.length===0&&<tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Sin proveedores registrados</td></tr>}
                        </tbody>
                    </table>
                    <Pagination links={proveedores?.links} meta={proveedores?.meta ?? proveedores} />
                </div>
            </div>

            <Modal show={modal==='crear'}    onClose={cerrar} title="Nuevo Proveedor">
                <FormProveedor onSubmit={submitCrear} btnLabel="Crear Proveedor"/>
            </Modal>
            <Modal show={modal==='editar'}   onClose={cerrar} title={`Editar — ${sel?.nombre??''}`}>
                <FormProveedor onSubmit={submitEditar} btnLabel="Guardar Cambios"/>
            </Modal>
            <Modal show={modal==='eliminar'} onClose={cerrar} title="Confirmar Eliminación" size="sm">
                <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><Trash2 size={24} className="text-red-500"/></div>
                    <p className="text-gray-700 font-medium mb-1">¿Eliminar proveedor?</p>
                    <p className="text-sm text-gray-500 mb-5"><strong>{sel?.nombre}</strong> será desactivado.</p>
                    <div className="flex gap-3">
                        <button onClick={cerrar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                        <button onClick={confirmarDel} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Eliminar</button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
