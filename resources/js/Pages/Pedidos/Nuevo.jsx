import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import { Plus, Trash2, Search } from "lucide-react";

export default function PedidosNuevo({ clientes, productos }) {
    const [buscar, setBuscar] = useState("");
    const { data, setData, post, processing, errors } = useForm({
        cliente_id:"", tipo:"minorista", zona:"", descuento:0, observaciones:"", items:[]
    });

    const addItem = (prod) => {
        if (data.items.find(it=>it.producto_id===prod.id)) return;
        setData('items', [...data.items, {producto_id:prod.id,nombre:prod.nombre,precio:prod.precio_venta,cantidad:1,max:prod.stock_actual}]);
        setBuscar("");
    };
    const removeItem = (id) => setData('items', data.items.filter(it=>it.producto_id!==id));
    const updateCant = (id,val) => setData('items', data.items.map(it=>it.producto_id===id?{...it,cantidad:Math.min(Number(val),it.max)}:it));
    const updatePrecio = (id,val) => setData('items', data.items.map(it=>it.producto_id===id?{...it,precio:Number(val)}:it));
    const subtotal = data.items.reduce((s,it)=>s+(it.precio*it.cantidad),0);
    const total = Math.max(subtotal - Number(data.descuento||0), 0);
    const prodFiltrados = productos?.filter(p=>p.nombre.toLowerCase().includes(buscar.toLowerCase())||p.codigo.toLowerCase().includes(buscar.toLowerCase())).slice(0,8)??[];
    const submit = (e) => {
        e.preventDefault();
        post("/pedidos");
    };
    return (
        <AppLayout title="Nuevo Pedido">
            <Head title="Nuevo Pedido"/>
            <FlashMessage/>
            <form onSubmit={submit}>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente</label>
                                <select value={data.cliente_id} onChange={e=>setData("cliente_id",e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Mostrador (sin cliente)</option>
                                    {clientes?.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
                                <select value={data.tipo} onChange={e=>setData("tipo",e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="minorista">Minorista</option>
                                    <option value="mayorista">Mayorista</option>
                                    <option value="distribuidor">Distribuidor</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Zona</label>
                                <input type="text" value={data.zona} onChange={e=>setData("zona",e.target.value)}
                                    placeholder="Lima Norte, Sur..."
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="font-semibold text-gray-700 mb-3">Agregar Productos</h3>
                            <div className="relative mb-3">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" value={buscar} onChange={e=>setBuscar(e.target.value)} placeholder="Buscar producto por código o nombre..."
                                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            {buscar && prodFiltrados.length>0 && (
                                <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
                                    {prodFiltrados.map(p=>(
                                        <button key={p.id} type="button" onClick={()=>addItem(p)}
                                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 text-left border-t border-gray-100 first:border-t-0 text-sm">
                                            <span><span className="font-mono text-xs bg-gray-100 px-1 rounded mr-2">{p.codigo}</span>{p.nombre}</span>
                                            <span className="text-emerald-600 font-semibold">S/.{p.precio_venta} <span className="text-gray-400 text-xs">({p.stock_actual} disp.)</span></span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Producto</th>
                                        <th className="px-3 py-2 text-center">Cant.</th>
                                        <th className="px-3 py-2 text-right">Precio</th>
                                        <th className="px-3 py-2 text-right">Subtotal</th>
                                        <th className="px-3 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map(it=>(
                                        <tr key={it.producto_id} className="border-t border-gray-50">
                                            <td className="px-3 py-2 font-medium">{it.nombre}</td>
                                            <td className="px-3 py-2 text-center">
                                                <input type="number" min="1" max={it.max} value={it.cantidad} onChange={e=>updateCant(it.producto_id,e.target.value)}
                                                    className="w-16 text-center border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <input type="number" step="0.01" min="0" value={it.precio} onChange={e=>updatePrecio(it.producto_id,e.target.value)}
                                                    className="w-24 text-right border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold">S/.{(it.precio*it.cantidad).toFixed(2)}</td>
                                            <td className="px-3 py-2"><button type="button" onClick={()=>removeItem(it.producto_id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></td>
                                        </tr>
                                    ))}
                                    {data.items.length===0 && <tr><td colSpan={5} className="text-center py-4 text-gray-400 text-xs">Busque y agregue productos arriba</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
                        <h3 className="font-semibold text-gray-700 mb-4">Resumen del Pedido</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">S/.{subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Descuento</span>
                                <input type="number" step="0.01" min="0" max={subtotal} value={data.descuento} onChange={e=>setData("descuento",Math.min(Number(e.target.value),subtotal))}
                                    className="w-24 text-right border border-gray-300 rounded-lg py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div className="flex justify-between border-t pt-3 text-base">
                                <span className="font-bold">TOTAL</span>
                                <span className="font-bold text-blue-600">S/.{total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Observaciones</label>
                            <textarea value={data.observaciones} onChange={e=>setData("observaciones",e.target.value)} rows={3}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <button type="submit" disabled={processing||data.items.length===0}
                            className="w-full mt-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60">
                            {processing?"Registrando...":"Registrar Pedido"}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
