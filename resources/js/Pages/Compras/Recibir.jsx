import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";

export default function ComprasRecibir({ orden, items }) {
    const { data, setData, post, processing } = useForm({ items: items?.map(it=>({detalle_id:it.id,producto_id:it.producto_id,cantidad_recibida:it.cantidad}))??[], observaciones:"" });
    const updateQty = (i,val) => {
        const newItems = [...data.items];
        newItems[i] = {...newItems[i], cantidad_recibida: Number(val)};
        setData("items", newItems);
    };
    const submit = (e) => { e.preventDefault(); post(`/compras/${orden?.id}/recibir`); };
    return (
        <AppLayout title={`Recibir OC ${orden?.numero}`}>
            <Head title="Recibir OC"/>
            <FlashMessage/>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-6 text-sm">
                <div><span className="text-gray-500">N° OC:</span> <strong>{orden?.numero}</strong></div>
                <div><span className="text-gray-500">Proveedor:</span> <strong>{orden?.proveedor_nombre}</strong></div>
                <div><span className="text-gray-500">F. Emisión:</span> <strong>{orden?.fecha_emision?.slice(0,10)}</strong></div>
            </div>
            <form onSubmit={submit}>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Producto</th>
                                <th className="px-4 py-2.5 text-center">Solicitado</th>
                                <th className="px-4 py-2.5 text-center">Stock Actual</th>
                                <th className="px-4 py-2.5 text-center">Cantidad Recibida</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items?.map((it,i)=>(
                                <tr key={it.id} className="border-t border-gray-50">
                                    <td className="px-4 py-2.5 font-medium">{it.producto_nombre}</td>
                                    <td className="px-4 py-2.5 text-center font-bold">{it.cantidad}</td>
                                    <td className="px-4 py-2.5 text-center text-gray-500">{it.stock_actual}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <input type="number" min="0" max={it.cantidad} value={data.items[i]?.cantidad_recibida??it.cantidad}
                                            onChange={e=>updateQty(i,e.target.value)}
                                            className="w-20 text-center border border-gray-300 rounded-lg py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button type="submit" disabled={processing}
                    className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60">
                    {processing?"Procesando...":"✓ Confirmar Recepción y Actualizar Inventario"}
                </button>
            </form>
        </AppLayout>
    );
}
