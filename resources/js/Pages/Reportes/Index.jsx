import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import KpiCard from "@/Components/KpiCard";
import { Download, FileText, Clock, Activity, Zap, Warehouse, AlertTriangle, DollarSign, TrendingUp, Percent, Truck } from "lucide-react";

function sem(v,verde,amarillo,mayor=false) {
    if(!v&&v!==0) return "sin_datos";
    if(mayor) { if(v>=verde) return "verde"; if(v>=amarillo) return "amarillo"; return "rojo"; }
    if(v<=verde) return "verde"; if(v<=amarillo) return "amarillo"; return "rojo";
}

export default function ReportesIndex({ kpis, histFinanciero }) {
    const exportarExcel = (tipo) => window.location.href = `/reportes/exportar?tipo=${tipo}`;
    const exportarPDF = (tipo) => window.location.href = `/reportes/exportar-pdf?tipo=${tipo}`;
    const kpiList = [
        {label:"TPRI (D1)", value:kpis?.tpri?(kpis.tpri+"d"):null, sub:"Reposición Inventario", icon:Clock, semaforo:sem(kpis?.tpri,7,15), meta:"≤7 días"},
        {label:"TAFI (D2)", value:kpis?.tafi?(kpis.tafi+"min"):null, sub:"Flujo Información", icon:Activity, semaforo:sem(kpis?.tafi,15,29), meta:"≤15 min"},
        {label:"TPPP (D3)", value:kpis?.tppp?(kpis.tppp+"h"):null, sub:"Procesam. Pedido", icon:Zap, semaforo:sem(kpis?.tppp,5,15), meta:"≤5 h"},
        {label:"EI (D4)",   value:kpis?.ei?(kpis.ei+"%"):null, sub:"Exactitud Inventario", icon:Warehouse, semaforo:sem(kpis?.ei,95,90,true), meta:"≥95%"},
        {label:"PEPD (D5a)",value:kpis?.pepd!=null?(kpis.pepd+"%"):null, sub:"Errores Picking", icon:AlertTriangle, semaforo:sem(kpis?.pepd,1,3), meta:"<1%"},
        {label:"CLP (D5b)", value:kpis?.clp?("S/."+kpis.clp):null, sub:"Costo Log. x Pedido", icon:DollarSign, semaforo:sem(kpis?.clp,10,20), meta:"≤S/.10"},
        {label:"ROA",       value:kpis?.roa?(kpis.roa+"%"):null, sub:"Rentabilidad/Activos", icon:TrendingUp, semaforo:sem(kpis?.roa,4,2,true), meta:"≥4%"},
        {label:"Margen Neto",value:kpis?.mn?(kpis.mn+"%"):null, sub:"Utilidad/Ventas", icon:Percent, semaforo:sem(kpis?.mn,10,6,true), meta:"≥10%"},
        {label:"CL/Ventas", value:kpis?.clv?(kpis.clv+"%"):null, sub:"Costo Log./Ventas", icon:Truck, semaforo:sem(kpis?.clv,8,12), meta:"<8%"},
    ];
    return (
        <AppLayout title="Reportes y Exportar">
            <Head title="Reportes"/>
            <div className="mb-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resumen de KPIs</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                    {kpiList.map((k,i)=><KpiCard key={i} {...k}/>)}
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
                <h2 className="font-semibold text-gray-700 mb-4">Exportar Reportes</h2>

                {/* Reportes disponibles */}
                {[
                    { tipo:"inventario",  label:"Inventario",           excelColor:"bg-blue-600",   pdfColor:"bg-blue-800",    tienePDF:true,  tieneExcel:true  },
                    { tipo:"pedidos",     label:"Pedidos / Ventas",     excelColor:"bg-indigo-600", pdfColor:"bg-indigo-800",  tienePDF:true,  tieneExcel:true  },
                    { tipo:"kpis",        label:"KPIs del Sistema",     excelColor:"bg-emerald-600",pdfColor:"bg-emerald-800", tienePDF:true,  tieneExcel:true  },
                    { tipo:"financiero",  label:"Datos Financieros",    excelColor:"bg-purple-600", pdfColor:"bg-purple-800",  tienePDF:true,  tieneExcel:true  },
                    { tipo:"kardex",      label:"Kardex de Movimientos",excelColor:"bg-gray-400",   pdfColor:"bg-gray-700",    tienePDF:true,  tieneExcel:false },
                ].map(({ tipo, label, excelColor, pdfColor, tienePDF, tieneExcel }) => (
                    <div key={tipo} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="font-medium text-sm text-gray-700 w-52">{label}</div>
                        <div className="flex gap-2">
                            {tieneExcel && (
                                <button
                                    onClick={() => exportarExcel(tipo)}
                                    className={`flex items-center gap-1.5 ${excelColor} text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity`}
                                >
                                    <Download size={13}/> Excel
                                </button>
                            )}
                            {tienePDF && (
                                <button
                                    onClick={() => exportarPDF(tipo)}
                                    className={`flex items-center gap-1.5 ${pdfColor} text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity`}
                                >
                                    <FileText size={13}/> PDF
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                <p className="text-xs text-gray-400 mt-3">
                    Excel (.xlsx): compatible con Excel y SPSS v26 &nbsp;|&nbsp;
                    PDF: reporte ejecutivo con semáforos para impresión
                </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-700">Histórico Financiero</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2.5 text-left">Período</th>
                                <th className="px-4 py-2.5 text-right">Ventas</th>
                                <th className="px-4 py-2.5 text-right">Utilidad</th>
                                <th className="px-4 py-2.5 text-right">ROA (%)</th>
                                <th className="px-4 py-2.5 text-right">MN (%)</th>
                                <th className="px-4 py-2.5 text-right">CL/V (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {histFinanciero?.map((r,i)=>(
                                <tr key={i} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-2.5 font-medium">{r.periodo}</td>
                                    <td className="px-4 py-2.5 text-right">S/.{Number(r.ventas).toLocaleString("es-PE")}</td>
                                    <td className="px-4 py-2.5 text-right">S/.{Number(r.utilidad).toLocaleString("es-PE")}</td>
                                    <td className="px-4 py-2.5 text-right font-semibold">{r.roa}%</td>
                                    <td className="px-4 py-2.5 text-right font-semibold">{r.mn}%</td>
                                    <td className="px-4 py-2.5 text-right font-semibold">{r.clv}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
