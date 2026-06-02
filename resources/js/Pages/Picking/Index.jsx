import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import Pagination from "@/Components/Pagination";
import { DespachoEstadoBadge } from "@/Components/EstadoBadge";
import { Eye, Search } from "lucide-react";

export default function PickingIndex({ despachos, stats }) {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [buscar, setBuscar] = useState(params.get('buscar') ?? '');
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/picking', buscar ? { buscar } : {}, { preserveState: true, replace: true });
    };
    return (
        <AppLayout title="Picking Digital y Despacho">
            <Head title="Picking"/>
            <FlashMessage/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {[
                    {label:"Pendientes", value:stats?.pendientes??0, color:"text-amber-600"},
                    {label:"En Picking", value:stats?.en_picking??0, color:"text-blue-600"},
                    {label:"Despachados", value:stats?.despachados??0, color:"text-emerald-600"},
                    {label:"Tasa de Error", value:(stats?.tasa_error??0)+"%", color: (stats?.tasa_error??0)>3?"text-red-600":"text-gray-700"},
                ].map((s,i)=>(
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">Lista de Despachos</h2>
                    <form onSubmit={handleSearch} className="flex gap-1.5">
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input type="text" value={buscar} onChange={e=>setBuscar(e.target.value)}
                                placeholder="Buscar N° o cliente..."
                                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
                        </div>
                        <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                    </form>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">N° Despacho</th>
                                <th className="px-4 py-2.5 text-left">Pedido</th>
                                <th className="px-4 py-2.5 text-left">Cliente</th>
                                <th className="px-4 py-2.5 text-left">Ingreso Pedido</th>
                                <th className="px-4 py-2.5 text-left">Fecha Despacho</th>
                                <th className="px-4 py-2.5 text-right">Total</th>
                                <th className="px-4 py-2.5 text-center">Estado</th>
                                <th className="px-4 py-2.5 text-center">Error</th>
                                <th className="px-4 py-2.5 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despachos?.data?.map(d=>(
                                <tr key={d.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-semibold text-blue-600">{d.numero}</td>
                                    <td className="px-4 py-2.5 text-gray-600">{d.pedido_numero}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{d.cliente_nombre??"Mostrador"}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{d.fecha_entrada?.slice(0,16).replace('T',' ')??'—'}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{d.fecha_despacho?.slice(0,16).replace('T',' ')??'—'}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold">S/.{Number(d.total??0).toFixed(2)}</td>
                                    <td className="px-4 py-2.5 text-center"><DespachoEstadoBadge estado={d.estado}/></td>
                                    <td className="px-4 py-2.5 text-center">
                                        {d.tiene_error?<span className="text-red-600 text-xs font-semibold">✗ Error</span>
                                            :<span className="text-gray-300 text-xs">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <Link href={`/picking/${d.id}`} className="p-1.5 inline-flex text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Eye size={15}/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination links={despachos?.links} meta={despachos?.meta ?? despachos} />
                </div>
            </div>
        </AppLayout>
    );
}
