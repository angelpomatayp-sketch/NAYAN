import { Head, useForm, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import FlashMessage from "@/Components/FlashMessage";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { DespachoEstadoBadge } from "@/Components/EstadoBadge";

export default function PickingVer({ despacho, items }) {
    const [showCostos, setShowCostos] = useState(false);
    const { data: costData, setData: setCostData, post: postCostos, processing: costProc } = useForm({
        costo_flete:0, costo_embalaje:0, costo_personal:0
    });

    const iniciar = () => router.post(`/picking/${despacho?.id}/iniciar`);
    const confirmarItem = (itemId, tieneError, tipoError=null) => {
        const qty = document.getElementById(`qty_${itemId}`)?.value ?? items?.find(it=>it.id===itemId)?.cantidad_solicitada;
        router.patch(`/picking/item/${itemId}`, { cantidad_pickeada: qty, tiene_error: tieneError, tipo_error: tipoError });
    };
    const finalizar = (e) => {
        e.preventDefault();
        postCostos(`/picking/${despacho?.id}/finalizar`);
    };

    const allConfirmed = items?.length > 0 && items.every(it=>it.estado==="confirmado" && Number(it.cantidad_pickeada)===Number(it.cantidad_solicitada));

    return (
        <AppLayout title={`Despacho ${despacho?.numero}`}>
            <Head title="Picking"/>
            <FlashMessage/>
            <div className="mb-4 flex items-center gap-3">
                <a href="/picking" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={15}/> Volver</a>
                <h2 className="font-bold text-gray-800">{despacho?.numero}</h2>
                <DespachoEstadoBadge estado={despacho?.estado}/>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 space-y-3">
                    <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-gray-500 block text-xs">Pedido</span><strong>{despacho?.pedido_numero}</strong></div>
                        <div><span className="text-gray-500 block text-xs">Cliente</span><strong>{despacho?.cliente_nombre??"Mostrador"}</strong></div>
                        <div><span className="text-gray-500 block text-xs">Ingreso del pedido</span><strong>{despacho?.fecha_entrada?.slice(0,16).replace('T',' ')??'—'}</strong></div>
                        <div><span className="text-gray-500 block text-xs">Fecha despacho</span><strong>{despacho?.fecha_despacho?.slice(0,16).replace('T',' ')??'—'}</strong></div>
                    </div>
                    {despacho?.estado==="pendiente" && (
                        <button onClick={iniciar} className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                            ▶ Iniciar Picking
                        </button>
                    )}
                    <div className="space-y-2">
                        {items?.map(it => (
                            <div key={it.id} className={`bg-white rounded-xl border-2 p-4 ${it.estado==="confirmado"?"border-emerald-400":it.estado==="error"?"border-red-400":"border-gray-200"}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className="font-medium">{it.producto_nombre}</span>
                                        <span className="ml-2 text-xs text-gray-400">{it.codigo}</span>
                                    </div>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono">{it.ubicacion??""}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm"><span className="text-gray-500">Solicitado:</span> <strong>{it.cantidad_solicitada}</strong></div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-500">Pickeado:</span>
                                        <input id={`qty_${it.id}`} type="number" defaultValue={it.cantidad_pickeada||it.cantidad_solicitada} min="0" max={it.cantidad_solicitada}
                                            disabled={it.estado!=="pendiente"}
                                            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"/>
                                    </div>
                                    {it.estado==="pendiente" && despacho?.estado==="en_picking" && (
                                        <div className="flex gap-2 ml-auto">
                                            <button onClick={()=>confirmarItem(it.id,false)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs hover:bg-emerald-600">
                                                <CheckCircle size={13}/> OK
                                            </button>
                                            <button onClick={()=>confirmarItem(it.id,true,"cantidad_erronea")} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600">
                                                <XCircle size={13}/> Error
                                            </button>
                                        </div>
                                    )}
                                    {it.estado!=="pendiente" && (
                                        <span className={`ml-auto text-xs font-semibold ${it.estado==="confirmado"?"text-emerald-600":"text-red-600"}`}>
                                            {it.estado==="confirmado"?"✓ Confirmado":"✗ Error"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
                    <h3 className="font-semibold text-gray-700 mb-4">Finalizar Despacho</h3>
                    <div className="text-sm mb-4">
                        <div className="flex justify-between mb-1"><span className="text-gray-500">Ítems totales</span><strong>{items?.length??0}</strong></div>
                        <div className="flex justify-between mb-1"><span className="text-gray-500">Confirmados</span><strong className="text-emerald-600">{items?.filter(it=>it.estado==="confirmado").length??0}</strong></div>
                        <div className="flex justify-between"><span className="text-gray-500">Con error</span><strong className="text-red-500">{items?.filter(it=>it.estado==="error").length??0}</strong></div>
                    </div>
                    {allConfirmed && despacho?.estado==="en_picking" && (
                        <form onSubmit={finalizar} className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700">Costos Logísticos (S/.)</h4>
                            {[["costo_flete","Flete"],["costo_embalaje","Embalaje"],["costo_personal","Personal"]].map(([k,l])=>(
                                <div key={k}>
                                    <label className="block text-xs text-gray-600 mb-1">{l}</label>
                                    <input type="number" step="0.01" min="0" value={costData[k]} onChange={e=>setCostData(k,e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                </div>
                            ))}
                            <div className="pt-1 border-t text-sm flex justify-between font-semibold">
                                <span>Total CLP</span>
                                <span className="text-blue-600">S/.{(Number(costData.costo_flete)+Number(costData.costo_embalaje)+Number(costData.costo_personal)).toFixed(2)}</span>
                            </div>
                            <button type="submit" disabled={costProc}
                                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60">
                                {costProc?"Finalizando...":"✓ Finalizar Despacho"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
