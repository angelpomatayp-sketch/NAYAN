import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import Pagination from "@/Components/Pagination";
import { PedidoBadge } from "@/Components/EstadoBadge";
import { Plus, Eye, Search } from "lucide-react";

export default function PedidosIndex({ pedidos, stats }) {
    const { auth } = usePage().props;
    const puedeCrear = ['admin','vendedor'].includes(auth?.user?.rol);
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [buscar, setBuscar] = useState(params.get('buscar') ?? '');
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/pedidos', buscar ? { buscar } : {}, { preserveState: true, replace: true });
    };
    const formatMoney = n => "S/. " + Number(n||0).toLocaleString("es-PE",{minimumFractionDigits:0});
    return (
        <AppLayout title="Pedidos y Ventas">
            <Head title="Pedidos" />
            <FlashMessage />
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {[
                    {label:"Pedidos este mes", value: stats?.total_mes??0, color:"text-blue-600"},
                    {label:"Pendientes",        value: stats?.pendientes??0, color:"text-amber-600"},
                    {label:"Despachados hoy",   value: stats?.despachados??0, color:"text-indigo-600"},
                    {label:"Ventas del mes",    value: formatMoney(stats?.ventas_mes), color:"text-emerald-600"},
                ].map((s,i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">Lista de Pedidos</h2>
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="flex gap-1.5">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" value={buscar} onChange={e=>setBuscar(e.target.value)}
                                    placeholder="Buscar N° o cliente..."
                                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
                            </div>
                            <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                        </form>
                        {puedeCrear && (
                            <Link href="/pedidos/nuevo" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                                <Plus size={14}/> Nuevo Pedido
                            </Link>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">N° Pedido</th>
                                <th className="px-4 py-2.5 text-left">Cliente</th>
                                <th className="px-4 py-2.5 text-left">Fecha Entrada</th>
                                <th className="px-4 py-2.5 text-left">Fecha Despacho</th>
                                <th className="px-4 py-2.5 text-center">Estado</th>
                                <th className="px-4 py-2.5 text-right">Total</th>
                                <th className="px-4 py-2.5 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos?.data?.map(p => (
                                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-semibold text-blue-600">{p.numero}</td>
                                    <td className="px-4 py-2.5 text-gray-600">{p.cliente_nombre??"Mostrador"}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.fecha_entrada?.slice(0,16).replace("T"," ")}</td>
                                    <td className="px-4 py-2.5 text-xs text-gray-500">{p.fecha_despacho?.slice(0,16).replace("T"," ")??"—"}</td>
                                    <td className="px-4 py-2.5 text-center"><PedidoBadge estado={p.estado}/></td>
                                    <td className="px-4 py-2.5 text-right font-semibold">{formatMoney(p.total)}</td>
                                    <td className="px-4 py-2.5 text-center">
                                        <Link href={`/pedidos/${p.id}`} className="p-1.5 inline-flex text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Eye size={15}/>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {!pedidos?.data?.length && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Sin pedidos</td></tr>}
                        </tbody>
                    </table>
                    <Pagination links={pedidos?.links} meta={pedidos?.meta ?? pedidos} />
                </div>
            </div>
        </AppLayout>
    );
}
