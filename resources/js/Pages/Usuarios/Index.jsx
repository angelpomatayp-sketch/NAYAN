import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessage from '@/Components/FlashMessage';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { Plus, Pencil, Trash2, Search, KeyRound } from 'lucide-react';

const ROL_COLOR = {
    admin:     'bg-purple-100 text-purple-700',
    gerente:   'bg-blue-100 text-blue-700',
    vendedor:  'bg-green-100 text-green-700',
    almacen:   'bg-orange-100 text-orange-700',
    logistica: 'bg-yellow-100 text-yellow-700',
};

const ROLES = ['admin', 'gerente', 'vendedor', 'almacen', 'logistica'];

export default function UsuariosIndex({ usuarios }) {
    const { auth } = usePage().props;
    const [modal, setModal]   = useState(null);
    const [sel, setSel]       = useState(null);
    const [busqueda, setBusq] = useState('');
    const [rolFiltro, setRolFiltro] = useState('');

    const fCrear  = useForm({ name: '', email: '', password: '', rol: '' });
    const fEditar = useForm({ name: '', email: '', rol: '', activo: true });
    const fPwd    = useForm({ password: '' });

    const cerrar = () => { setModal(null); setSel(null); };

    const abrirCrear = () => {
        fCrear.reset(); fCrear.clearErrors(); setModal('crear');
    };
    const abrirEditar = (u) => {
        setSel(u);
        fEditar.setData({ name: u.name, email: u.email, rol: u.rol, activo: !!u.activo });
        fEditar.clearErrors();
        setModal('editar');
    };
    const abrirReset = (u) => { setSel(u); fPwd.reset(); fPwd.clearErrors(); setModal('reset'); };
    const abrirDel   = (u) => { setSel(u); setModal('eliminar'); };

    const submitCrear  = (e) => { e.preventDefault(); fCrear.post('/usuarios', { onSuccess: cerrar }); };
    const submitEditar = (e) => { e.preventDefault(); router.put(`/usuarios/${sel.id}`, fEditar.data, { onSuccess: cerrar }); };
    const submitReset  = (e) => { e.preventDefault(); router.patch(`/usuarios/${sel.id}/reset-password`, fPwd.data, { onSuccess: cerrar }); };
    const confirmarDel = ()  => router.delete(`/usuarios/${sel.id}`, { onSuccess: cerrar });

    const lista = usuarios?.data ?? (Array.isArray(usuarios) ? usuarios : []);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = {};
        if (busqueda) params.buscar = busqueda;
        if (rolFiltro) params.rol = rolFiltro;
        router.get('/usuarios', params, { preserveState: true, replace: true });
    };

    const InputClass = "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <AppLayout title="Gestión de Usuarios">
            <Head title="Usuarios"/><FlashMessage/>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">
                        Usuarios <span className="text-sm text-gray-400 font-normal">({lista.length})</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        <form onSubmit={handleSearch} className="flex gap-1.5">
                            <div className="relative">
                                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" placeholder="Buscar nombre o email..." value={busqueda}
                                    onChange={e => setBusq(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"/>
                            </div>
                            <select value={rolFiltro} onChange={e => setRolFiltro(e.target.value)}
                                className="border border-gray-300 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Todos los roles</option>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                        </form>
                        <button onClick={abrirCrear}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            <Plus size={14}/> Nuevo Usuario
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Nombre</th>
                                <th className="px-4 py-2.5 text-left">Email</th>
                                <th className="px-4 py-2.5 text-left">Rol</th>
                                <th className="px-4 py-2.5 text-center">Estado</th>
                                <th className="px-4 py-2.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lista.map(u => (
                                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                {u.name?.[0]?.toUpperCase()}
                                            </div>
                                            {u.name}
                                            {u.id === auth?.user?.id && (
                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">Tú</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{u.email}</td>
                                    <td className="px-4 py-2.5">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROL_COLOR[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => abrirEditar(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Pencil size={14}/></button>
                                            <button onClick={() => abrirReset(u)}  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg" title="Restablecer contraseña"><KeyRound size={14}/></button>
                                            {u.id !== auth?.user?.id && (
                                                <button onClick={() => abrirDel(u)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Desactivar"><Trash2 size={14}/></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {lista.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">Sin usuarios registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                    <Pagination links={usuarios?.links} meta={usuarios?.meta ?? usuarios}/>
                </div>
            </div>

            {/* Modal: Crear */}
            <Modal show={modal === 'crear'} onClose={cerrar} title="Nuevo Usuario">
                <form onSubmit={submitCrear} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre completo *</label>
                            <input required value={fCrear.data.name} onChange={e => fCrear.setData('name', e.target.value)}
                                placeholder="Juan Pérez" className={InputClass}/>
                            {fCrear.errors.name && <p className="text-red-500 text-xs mt-0.5">{fCrear.errors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Correo electrónico *</label>
                            <input type="email" required value={fCrear.data.email} onChange={e => fCrear.setData('email', e.target.value)}
                                placeholder="usuario@nayan.com" className={InputClass}/>
                            {fCrear.errors.email && <p className="text-red-500 text-xs mt-0.5">{fCrear.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña *</label>
                            <input type="password" required value={fCrear.data.password} onChange={e => fCrear.setData('password', e.target.value)}
                                placeholder="Mínimo 8 caracteres" className={InputClass}/>
                            {fCrear.errors.password && <p className="text-red-500 text-xs mt-0.5">{fCrear.errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Rol *</label>
                            <select required value={fCrear.data.rol} onChange={e => fCrear.setData('rol', e.target.value)} className={InputClass}>
                                <option value="">Seleccionar...</option>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {fCrear.errors.rol && <p className="text-red-500 text-xs mt-0.5">{fCrear.errors.rol}</p>}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={cerrar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={fCrear.processing} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                            {fCrear.processing ? 'Guardando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Editar */}
            <Modal show={modal === 'editar'} onClose={cerrar} title={`Editar — ${sel?.name ?? ''}`}>
                <form onSubmit={submitEditar} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre completo *</label>
                            <input required value={fEditar.data.name} onChange={e => fEditar.setData('name', e.target.value)} className={InputClass}/>
                            {fEditar.errors.name && <p className="text-red-500 text-xs mt-0.5">{fEditar.errors.name}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Correo electrónico *</label>
                            <input type="email" required value={fEditar.data.email} onChange={e => fEditar.setData('email', e.target.value)} className={InputClass}/>
                            {fEditar.errors.email && <p className="text-red-500 text-xs mt-0.5">{fEditar.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Rol *</label>
                            <select required value={fEditar.data.rol} onChange={e => fEditar.setData('rol', e.target.value)} className={InputClass}>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {fEditar.errors.rol && <p className="text-red-500 text-xs mt-0.5">{fEditar.errors.rol}</p>}
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">Estado</label>
                            <label className={`flex items-center gap-2 ${sel?.id === auth?.user?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only" checked={fEditar.data.activo}
                                        onChange={e => fEditar.setData('activo', e.target.checked)}
                                        disabled={sel?.id === auth?.user?.id}/>
                                    <div className={`w-10 h-5 rounded-full transition-colors ${fEditar.data.activo ? 'bg-emerald-500' : 'bg-gray-300'}`}/>
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${fEditar.data.activo ? 'translate-x-5' : 'translate-x-0'}`}/>
                                </div>
                                <span className="text-sm text-gray-600">{fEditar.data.activo ? 'Activo' : 'Inactivo'}</span>
                            </label>
                            {sel?.id === auth?.user?.id && (
                                <p className="text-[11px] text-gray-400 mt-1">No puedes desactivarte a ti mismo</p>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={cerrar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={fEditar.processing} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                            {fEditar.processing ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Restablecer contraseña */}
            <Modal show={modal === 'reset'} onClose={cerrar} title={`Restablecer contraseña`} size="sm">
                <form onSubmit={submitReset} className="space-y-4">
                    <p className="text-sm text-gray-500">Nueva contraseña para <strong>{sel?.name}</strong>.</p>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Nueva contraseña *</label>
                        <input type="password" required value={fPwd.data.password} onChange={e => fPwd.setData('password', e.target.value)}
                            placeholder="Mínimo 8 caracteres" className={InputClass}/>
                        {fPwd.errors.password && <p className="text-red-500 text-xs mt-0.5">{fPwd.errors.password}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={cerrar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                        <button type="submit" disabled={fPwd.processing} className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-60">
                            {fPwd.processing ? 'Actualizando...' : 'Restablecer'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Desactivar */}
            <Modal show={modal === 'eliminar'} onClose={cerrar} title="Confirmar Desactivación" size="sm">
                <div className="text-center py-2">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <Trash2 size={24} className="text-red-500"/>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">¿Desactivar usuario?</p>
                    <p className="text-sm text-gray-500 mb-5"><strong>{sel?.name}</strong> no podrá iniciar sesión.</p>
                    <div className="flex gap-3">
                        <button onClick={cerrar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                        <button onClick={confirmarDel} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700">Desactivar</button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
