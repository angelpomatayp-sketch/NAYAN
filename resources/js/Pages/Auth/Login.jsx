import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '', password: '', remember: false,
    });
    const [showPwd, setShowPwd] = useState(false);
    const submit = (e) => { e.preventDefault(); post('/login'); };

    return (
        <>
            <Head title="Iniciar Sesión" />
            <div className="min-h-screen flex">

                {/* ── Panel izquierdo ── */}
                <div className="hidden lg:flex flex-col justify-center items-center w-[45%] bg-[#0a1628] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c] to-[#071020]" />
                    <div className="absolute w-[500px] h-[500px] rounded-full border border-white/[0.04] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute w-[700px] h-[700px] rounded-full border border-white/[0.025] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center text-center px-12">
                        <img src="/img/logo.jpg" alt="NAYAN"
                            className="w-24 h-24 rounded-3xl object-cover mb-8 shadow-2xl"
                            onError={e => e.target.style.display = 'none'} />
                        <h1 className="text-5xl font-black text-white tracking-widest mb-2">NAYAN</h1>
                        <p className="text-blue-400 text-sm tracking-[0.2em] uppercase mb-6">Mobile Accessories</p>
                        <div className="w-8 h-0.5 bg-blue-500/50 mb-6" />
                        <p className="text-blue-200/50 text-sm leading-relaxed max-w-xs">
                            Sistema de Gestión Logística
                        </p>
                    </div>
                </div>

                {/* ── Panel derecho ── */}
                <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
                    <div className="w-full max-w-sm">

                        {/* Logo móvil */}
                        <div className="flex lg:hidden justify-center mb-8">
                            <img src="/img/logo.jpg" alt="NAYAN"
                                className="w-16 h-16 rounded-2xl object-cover shadow"
                                onError={e => e.target.style.display = 'none'} />
                        </div>

                        {/* Formulario */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-4">
                            <h2 className="text-2xl font-black text-gray-900 mb-1">Bienvenido</h2>
                            <p className="text-gray-400 text-sm mb-7">Ingresa tus credenciales para continuar</p>

                            {errors.email && (
                                <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {errors.email}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Correo
                                    </label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input type="email" value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            placeholder="correo@nayan.com" required autoFocus
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                                                       bg-gray-50 focus:bg-white focus:outline-none focus:ring-2
                                                       focus:ring-blue-500 focus:border-transparent transition-all" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input type={showPwd ? 'text' : 'password'} value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            placeholder="••••••••" required
                                            className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm
                                                       bg-gray-50 focus:bg-white focus:outline-none focus:ring-2
                                                       focus:ring-blue-500 focus:border-transparent transition-all" />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                                            {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={processing}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold
                                               rounded-xl transition-colors text-sm disabled:opacity-60 mt-2">
                                    {processing ? 'Ingresando...' : 'Ingresar al Sistema'}
                                </button>
                            </form>
                        </div>


                    </div>
                </div>
            </div>
        </>
    );
}
