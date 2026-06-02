import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import Pagination from "@/Components/Pagination";
import { Plus, PackageOpen, Search } from "lucide-react";

export default function ComprasIndex({ ordenes, stats }) {
    const estadoColor = { pendiente:"bg-amber-100 text-amber-700", enviada:"bg-blue-100 text-blue-700", recibida:"bg-emerald-100 text-emerald-700", cancelada:"bg-red-100 text-red-700" };
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [buscar, setBuscar] = useState(params.get('buscar') ?? '');
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/compras', buscar ? { buscar } : {}, { preserveState: true, replace: true });
    };
    return (
        <AppLayout title="Compras y Abastecimiento">
            <Head title="Compras"/>
            <FlashMessage/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {[
                    {label:"OC Pendientes", value:stats?.pendientes??0, color:"text-amber-600"},
                    {label:"OC Enviadas", value:stats?.enviadas??0, color:"text-blue-600"},
                    {label:"Recibidas este mes", value:stats?.recibidas_mes??0, color:"text-emerald-600"},
                    {label:"TPRI Promedio", value:(stats?.tpri??0)>0?(stats?.tpri+" días"):"—", color:"text-gray-700"},
                ].map((s,i)=>(
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">Órdenes de Compra</h2>
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="flex gap-1.5">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" value={buscar} onChange={e=>setBuscar(e.target.value)}
                                    placeholder="Buscar N° o proveedor..."
                                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
                            </div>
                            <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                        </form>
                        <Link href="/compras/nueva" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            <Plus size={14}/> Nueva OC
                        </Link>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">N° OC</th>
                                <th className="px-4 py-2.5 text-left">Proveedor</th>
                                <th className="px-4 py-2.5 text-left">F. Emisión</th>
                                <th className="px-4 py-2.5 text-left">F. Esperada</th>
                                <th className="px-4 py-2.5 text-left">F. Recepción</th>
                                <th className="px-4 py-2.5 text-right">Total</th>
                                <th className="px-4 py-2.5 text-center">Estado</th>
                                <th className="px-4 py-2.5 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordenes?.data?.map(o=>(
                                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-semibold text-blue-600">{o.numero}</td>
                                    <td className="px-4 py-2.5">{o.proveedor_nombre}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{o.fecha_emision?.slice(0,16).replace('T',' ')}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{o.fecha_esperada??"—"}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{o.fecha_recepcion?.slice(0,16).replace('T',' ')??"—"}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold">S/.{Number(o.total||0).toFixed(2)}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[o.estado]??"bg-gray-100"}`}>{o.estado}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        {(o.estado==="pendiente"||o.estado==="enviada") && (
                                            <Link href={`/compras/${o.id}/recibir`} className="flex items-center gap-1 text-xs text-emerald-600 hover:underline justify-center">
                                                <PackageOpen size={13}/> Recibir
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination links={ordenes?.links} meta={ordenes?.meta ?? ordenes} />
                </div>
            </div>
        </AppLayout>
    );
}
