import { Head, useForm, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import Pagination from "@/Components/Pagination";
import { PrioridadBadge } from "@/Components/EstadoBadge";
import { Search } from "lucide-react";
import { Send, MessageSquare } from "lucide-react";


const ROL_AREA = {
    vendedor:  "Ventas",
    almacen:   "Almacén",
    logistica: "Logística",
    gerente:   "Gerencia",
    admin:     null, // libre
};

export default function IntegracionIndex({ requerimientos, stats, areas }) {
    const { auth } = usePage().props;
    const rol = auth?.user?.rol;
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [buscar, setBuscar] = useState(params.get('buscar') ?? '');
    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/integracion', buscar ? { buscar } : {}, { preserveState: true, replace: true });
    };
    const areaFija = ROL_AREA[rol] ?? null;

    const [showForm, setShowForm] = useState(false);
    const [atendiendo, setAtendiendo] = useState(null);
    const { data, setData, post, patch, processing, reset } = useForm({
        area_origen: areaFija ?? "Ventas", area_destino:"Almacén", tipo:"", asunto:"", descripcion:"", prioridad:"media"
    });
    const { data: respData, setData: setRespData, patch: patchResp, processing: respProcessing, reset: resetResp } = useForm({ respuesta:"", estado:"atendido" });

    const enviar = (e) => { e.preventDefault(); post("/integracion", { onSuccess:()=>{ setShowForm(false); reset(); } }); };
    const atender = (e) => { e.preventDefault(); patchResp(`/integracion/${atendiendo}`, { onSuccess:()=>{ setAtendiendo(null); resetResp(); } }); };
    const estadoColor = { pendiente:"bg-amber-100 text-amber-700", en_atencion:"bg-blue-100 text-blue-700", atendido:"bg-emerald-100 text-emerald-700" };

    return (
        <AppLayout title="Integración Operativa">
            <Head title="Integración Operativa"/>
            <FlashMessage/>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                {[
                    {label:"Pendientes", value:stats?.pendientes??0, color:"text-amber-600"},
                    {label:"En Atención", value:stats?.en_atencion??0, color:"text-blue-600"},
                    {label:"Atendidos", value:stats?.atendidos??0, color:"text-emerald-600"},
                    {label:"TAFI Promedio", value:stats?.tafi?(stats.tafi+" min"):"—", color:"text-gray-700"},
                ].map((s,i)=>(
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">Requerimientos Inter-Área</h2>
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="flex gap-1.5">
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                                <input type="text" value={buscar} onChange={e=>setBuscar(e.target.value)}
                                    placeholder="Buscar asunto o área..."
                                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"/>
                            </div>
                            <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">Buscar</button>
                        </form>
                        <button onClick={()=>setShowForm(!showForm)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                            <Send size={13}/> Nuevo Requerimiento
                        </button>
                    </div>
                </div>
                {showForm && (
                    <form onSubmit={enviar} className="px-5 py-4 border-b border-gray-100 bg-blue-50/30 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Área Origen</label>
                                {areaFija ? (
                                    <div className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-600 font-medium">
                                        {areaFija}
                                    </div>
                                ) : (
                                    <select value={data.area_origen} onChange={e=>setData("area_origen",e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        {areas?.map(a=><option key={a}>{a}</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Área Destino</label>
                                <select value={data.area_destino} onChange={e=>setData("area_destino",e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {areas?.map(a=><option key={a}>{a}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo</label>
                                <input type="text" value={data.tipo} onChange={e=>setData("tipo",e.target.value)} placeholder="Stock, Despacho, Info..."
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Prioridad</label>
                                <select value={data.prioridad} onChange={e=>setData("prioridad",e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="baja">Baja</option><option value="media">Media</option>
                                    <option value="alta">Alta</option><option value="urgente">Urgente</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Asunto</label>
                                <input type="text" value={data.asunto} onChange={e=>setData("asunto",e.target.value)} required placeholder="Asunto del requerimiento"
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                                <textarea value={data.descripcion} onChange={e=>setData("descripcion",e.target.value)} required rows={2}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <button type="submit" disabled={processing}
                                className="self-end px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                                {processing?"Enviando...":"Enviar"}
                            </button>
                        </div>
                    </form>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Asunto</th>
                                <th className="px-4 py-2.5 text-center">Origen → Destino</th>
                                <th className="px-4 py-2.5 text-center">Prioridad</th>
                                <th className="px-4 py-2.5 text-left">Enviado</th>
                                <th className="px-4 py-2.5 text-center">Estado</th>
                                <th className="px-4 py-2.5 text-center">TAFI</th>
                                <th className="px-4 py-2.5 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requerimientos?.data?.map(r => {
                                const tafi = r.fecha_atencion ? Math.round((new Date(r.fecha_atencion)-new Date(r.fecha_envio))/60000) : null;
                                return (
                                    <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50">
                                        <td className="px-4 py-2.5">
                                            <div className="font-medium">{r.asunto}</div>
                                            <div className="text-xs text-gray-400">{r.remitente_nombre}</div>
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-xs">
                                            <span className="text-gray-600">{r.area_origen}</span>
                                            <span className="text-gray-400 mx-1">→</span>
                                            <span className="text-blue-600">{r.area_destino}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center"><PrioridadBadge prioridad={r.prioridad}/></td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500">{r.fecha_envio?.slice(0,16).replace("T"," ")}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[r.estado]??"bg-gray-100"}`}>
                                                {r.estado?.replace("_"," ")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-xs font-mono">{tafi!=null?tafi+"min":"—"}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            {r.estado!=="atendido" && (
                                                <button onClick={()=>setAtendiendo(r.id)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <MessageSquare size={15}/>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <Pagination links={requerimientos?.links} meta={requerimientos?.meta ?? requerimientos} />
                </div>
            </div>
            {atendiendo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
                        <h3 className="font-semibold text-gray-800 mb-4">Responder Requerimiento</h3>
                        <form onSubmit={atender} className="space-y-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                                <select value={respData.estado} onChange={e=>setRespData("estado",e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="en_atencion">En Atención</option>
                                    <option value="atendido">Atendido</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Respuesta</label>
                                <textarea value={respData.respuesta} onChange={e=>setRespData("respuesta",e.target.value)} required rows={3}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={()=>setAtendiendo(null)} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50">Cancelar</button>
                                <button type="submit" disabled={respProcessing} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                                    {respProcessing?"Guardando...":"Guardar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
