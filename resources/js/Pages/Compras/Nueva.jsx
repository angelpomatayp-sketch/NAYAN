import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import { Plus, Trash2, AlertTriangle, PackagePlus } from "lucide-react";

export default function ComprasNueva({ proveedores, productos, productoPresel, productosAlerta }) {
    const { data, setData, post, processing } = useForm({
        proveedor_id: "", fecha_esperada: "", observaciones: "",
        items: productoPresel
            ? [{ producto_id: productoPresel.id, nombre: productoPresel.nombre, cantidad: 1, precio_unitario: productoPresel.precio_compra }]
            : []
    });

    const addItem = () => setData('items', [...data.items, { producto_id: "", nombre: "", cantidad: 1, precio_unitario: 0 }]);
    const removeItem = (i) => setData('items', data.items.filter((_, idx) => idx !== i));
    const updateItem = (i, field, val) => setData('items', data.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

    const selectProducto = (i, pid) => {
        const p = productos?.find(p => String(p.id) === pid);
        if (p) setData('items', data.items.map((it, idx) => idx === i
            ? { ...it, producto_id: p.id, nombre: p.nombre, precio_unitario: p.precio_compra }
            : it
        ));
    };

    const agregarSugerido = (prod) => {
        if (data.items.find(it => it.producto_id === prod.id)) return;
        setData('items', [...data.items, {
            producto_id: prod.id,
            nombre: prod.nombre,
            cantidad: prod.stock_reorden - prod.stock_actual,
            precio_unitario: prod.precio_compra
        }]);
    };

    const total = data.items.reduce((s, it) => s + (Number(it.precio_unitario) || 0) * (Number(it.cantidad) || 0), 0);

    const submit = (e) => {
        e.preventDefault();
        post("/compras");
    };

    return (
        <AppLayout title="Nueva Orden de Compra">
            <Head title="Nueva OC" />
            <FlashMessage />
            <form onSubmit={submit}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 space-y-4">

                        {/* Proveedor y fecha */}
                        <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Proveedor</label>
                                <select value={data.proveedor_id} onChange={e => setData("proveedor_id", e.target.value)} required
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">— Seleccione proveedor —</option>
                                    {proveedores?.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.condiciones_pago})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Fecha Esperada</label>
                                <input type="date" value={data.fecha_esperada} onChange={e => setData("fecha_esperada", e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>

                        {/* Sugerencias de reposición */}
                        {productosAlerta?.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle size={15} className="text-amber-500" />
                                    <span className="text-sm font-semibold text-amber-700">
                                        {productosAlerta.length} producto{productosAlerta.length > 1 ? 's' : ''} con stock bajo — sugeridos para reposición
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {productosAlerta.map(prod => {
                                        const yaAgregado = data.items.some(it => it.producto_id === prod.id);
                                        return (
                                            <div key={prod.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-gray-700 truncate">{prod.nombre}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        Stock: <span className="text-red-500 font-semibold">{prod.stock_actual}</span>
                                                        <span className="mx-1 text-gray-300">|</span>
                                                        Reorden: {prod.stock_reorden}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => agregarSugerido(prod)} disabled={yaAgregado}
                                                    className={`ml-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors
                                                        ${yaAgregado
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                                                    <PackagePlus size={12} />
                                                    {yaAgregado ? 'Agregado' : 'Agregar'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Tabla de productos */}
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-700">Productos a Comprar</h3>
                                <button type="button" onClick={addItem}
                                    className="flex items-center gap-1 px-3 py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50">
                                    <Plus size={13} /> Agregar otro producto
                                </button>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Producto</th>
                                        <th className="px-3 py-2 text-center">Cantidad</th>
                                        <th className="px-3 py-2 text-right">P. Compra</th>
                                        <th className="px-3 py-2 text-right">Subtotal</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((it, i) => (
                                        <tr key={i} className="border-t border-gray-50">
                                            <td className="px-3 py-2">
                                                <select value={it.producto_id} onChange={e => selectProducto(i, e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">Seleccionar...</option>
                                                    {productos?.map(p => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <input type="number" min="1" value={it.cantidad} onChange={e => updateItem(i, "cantidad", e.target.value)}
                                                    className="w-16 text-center border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <input type="number" step="0.01" min="0" value={it.precio_unitario} onChange={e => updateItem(i, "precio_unitario", e.target.value)}
                                                    className="w-24 text-right border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold">S/.{(Number(it.precio_unitario) * Number(it.cantidad)).toFixed(2)}</td>
                                            <td className="px-3 py-2">
                                                <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.items.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-4 text-gray-400 text-xs">
                                            Use las sugerencias de arriba o "Agregar otro producto"
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
                        <h3 className="font-semibold text-gray-700 mb-4">Resumen</h3>
                        <div className="text-sm space-y-2 mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total ítems</span>
                                <strong>{data.items.length}</strong>
                            </div>
                            <div className="flex justify-between border-t pt-2 text-base">
                                <span className="font-bold">Total OC</span>
                                <span className="font-bold text-blue-600">S/.{total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones</label>
                            <textarea value={data.observaciones} onChange={e => setData("observaciones", e.target.value)} rows={3}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button type="submit" disabled={processing || data.items.length === 0 || !data.proveedor_id}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60">
                            {processing ? "Creando..." : "Crear Orden de Compra"}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
