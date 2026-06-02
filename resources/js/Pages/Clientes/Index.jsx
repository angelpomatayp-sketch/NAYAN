import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessage from '@/Components/FlashMessage';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

const EMPTY = { nombre: '', documento: '', telefono: '', email: '', direccion: '', zona: '' };

export default function ClientesIndex({ clientes }) {
    const [modal, setModal]   = useState(null);
    const [sel, setSel]       = useState(null);
    const [busqueda, setBusq] = useState('');
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(EMPTY);

    const abrirCrear  = () => { reset(); clearErrors(); setModal('crear'); };
    const abrirEditar = (c) => { setSel(c); setData({ ...EMPTY, ...c }); clearErrors(); setModal('editar'); };
    const abrirDel    = (c) => { setSel(c); setModal('eliminar'); };
    const cerrar      = () => { setModal(null); setSel(null); };

    const submitCrear  = (e) => { e.preventDefault(); post('/clientes', { onSuccess: cerrar }); };
    const submitEditar = (e) => { e.preventDefault(); router.put(`/clientes/${sel.id}`, data, { onSuccess: cerrar }); };
    const confirmarDel = ()  => router.delete(`/clientes/${sel.id}`, { onSuccess: cerrar });

    const lista = clientes?.data ?? (Array.isArray(clientes) ? clientes : []);
    const filtrados = lista;
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/clientes', busqueda ? { buscar: busqueda } : {}, { preserveState: true, replace: true });
    };

    const FormCliente = ({ onSubmit, btnLabel }) => (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre / Razón Social *</label>
                    <input required value={data.nombre} onChange={e=>setData('nombre',e.target.value)} placeholder="Empresa o nombre completo"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    {errors.nombre && <p className="text-red-500 text-xs mt-0.5">{errors.nombre}</p>}
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">RUC / DNI</label>
                    <input value={data.documento} onChange={e=>setData('documento',e.target.value)} placeholder="20123456789"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input value={data.telefono} onChange={e=>setData('telefono',e.target.value)} placeholder="987654321"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
                    <input type="email" value={data.email} onChange={e=>setData('email',e.target.value)} placeholder="contacto@empresa.com"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Zona</label>
                    <select value={data.zona} onChange={e=>setData('zona',e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option>Lima Norte</option><option>Lima Centro</option><option>Lima Sur</option>
                        <option>Lima Este</option><option>Callao</option><option>Provincias</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dirección</label>
                    <input value={data.direccion} onChange={e=>setData('direccion',e.target.value)} placeholder="Av. Ejemplo 123, Distrito"
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
        <AppLayout title="Clientes">
            <Head title="Clientes"/><FlashMessage/>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">Clientes <span className="text-sm text-gray-400 font-normal">({filtrados.length})</span></h2>
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
                            <Plus size={14}/> Nuevo Cliente
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Nombre</th>
                                <th className="px-4 py-2.5 text-left">Documento</th>
                                <th className="px-4 py-2.5 text-left">Teléfono</th>
                                <th className="px-4 py-2.5 text-left">Email</th>
                                <th className="px-4 py-2.5 text-left">Zona</th>
                                <th className="px-4 py-2.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(c=>(
                                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-medium">{c.nombre}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{c.documento??'—'}</td>
                                    <td className="px-4 py-2.5 text-xs">{c.telefono??'—'}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{c.email??'—'}</td>
                                    <td className="px-4 py-2.5">{c.zona&&<span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{c.zona}</span>}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={()=>abrirEditar(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Pencil size={14}/></button>
                                            <button onClick={()=>abrirDel(c)}    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"  title="Eliminar"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtrados.length===0&&<tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Sin clientes registrados</td></tr>}
                        </tbody>
                    </table>
                    <Pagination links={clientes?.links} meta={clientes?.meta ?? clientes} />
                </div>
            </div>

            <Modal show={modal==='crear'}    onClose={cerrar} title="Nuevo Cliente">
                <FormCliente onSubmit={submitCrear} btnLabel="Crear Cliente"/>
            </Modal>
            <Modal show={modal==='editar'}   onClose={cerrar} title={`Editar — ${sel?.nombre??''}`}>
                <FormCliente onSubmit={submitEditar} btnLabel="Guardar Cambios"/>
            </Modal>
            <Modal show={modal==='eliminar'} onClose={cerrar} title="Confirmar Eliminación" size="sm">
                <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3"><Trash2 size={24} className="text-red-500"/></div>
                    <p className="text-gray-700 font-medium mb-1">¿Eliminar cliente?</p>
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
