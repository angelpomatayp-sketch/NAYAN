import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import Modal from "@/Components/Modal";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function CategoriasIndex({ categorias }) {
    const [modal, setModal] = useState(null); // null | 'crear' | 'editar'
    const [editando, setEditando] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({ nombre: "", descripcion: "" });
    const { data: editData, setData: setEditData, patch, processing: editProcessing, reset: resetEdit, errors: editErrors } = useForm({ nombre: "", descripcion: "" });

    const abrirCrear = () => { reset(); setModal('crear'); };
    const cerrarModal = () => { setModal(null); setEditando(null); reset(); resetEdit(); };

    const submit = (e) => {
        e.preventDefault();
        post("/categorias", { onSuccess: () => cerrarModal() });
    };

    const abrirEditar = (cat) => {
        setEditando(cat);
        setEditData("nombre", cat.nombre);
        setEditData("descripcion", cat.descripcion ?? "");
        setModal('editar');
    };

    const guardarEdicion = (e) => {
        e.preventDefault();
        patch(`/categorias/${editando.id}`, { onSuccess: () => cerrarModal() });
    };

    return (
        <AppLayout title="Categorías">
            <Head title="Categorías" />
            <FlashMessage />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">
                        Categorías registradas
                        <span className="ml-2 text-xs font-normal text-gray-400">({categorias?.length ?? 0})</span>
                    </h2>
                    <button onClick={abrirCrear}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                        <Plus size={13} /> Nueva Categoría
                    </button>
                </div>

                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="px-5 py-2.5 text-left">Nombre</th>
                            <th className="px-5 py-2.5 text-left">Descripción</th>
                            <th className="px-5 py-2.5 text-center">Productos</th>
                            <th className="px-5 py-2.5 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias?.map(cat => (
                            <tr key={cat.id} className="border-t border-gray-50 hover:bg-gray-50">
                                <td className="px-5 py-3 font-medium text-gray-800">{cat.nombre}</td>
                                <td className="px-5 py-3 text-gray-500">
                                    {cat.descripcion || <span className="text-gray-300 italic">—</span>}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                                        ${cat.productos_count > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {cat.productos_count}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => abrirEditar(cat)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                                            <Pencil size={14} />
                                        </button>
                                        <DeleteButton id={cat.id} disabled={cat.productos_count > 0} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {categorias?.length === 0 && (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-xs">
                                No hay categorías registradas
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Crear */}
            <Modal show={modal === 'crear'} onClose={cerrarModal} title="Nueva Categoría" size="sm">
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                        <input type="text" value={data.nombre} onChange={e => setData("nombre", e.target.value)}
                            placeholder="Ej: Fundas, Cargadores..." autoFocus
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <textarea value={data.descripcion} onChange={e => setData("descripcion", e.target.value)}
                            rows={2} placeholder="Descripción breve (opcional)"
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={cerrarModal}
                            className="flex-1 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                            {processing ? "Guardando..." : "Crear Categoría"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Editar */}
            <Modal show={modal === 'editar'} onClose={cerrarModal} title="Editar Categoría" size="sm">
                <form onSubmit={guardarEdicion} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
                        <input type="text" value={editData.nombre} onChange={e => setEditData("nombre", e.target.value)}
                            autoFocus
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {editErrors.nombre && <p className="text-xs text-red-500 mt-1">{editErrors.nombre}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
                        <textarea value={editData.descripcion} onChange={e => setEditData("descripcion", e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={cerrarModal}
                            className="flex-1 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={editProcessing}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                            {editProcessing ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}

function DeleteButton({ id, disabled }) {
    const { delete: destroy, processing } = useForm();
    return (
        <button
            onClick={() => { if (confirm("¿Eliminar esta categoría?")) destroy(`/categorias/${id}`); }}
            disabled={disabled || processing}
            title={disabled ? "Tiene productos asociados" : "Eliminar"}
            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed">
            <Trash2 size={14} />
        </button>
    );
}
