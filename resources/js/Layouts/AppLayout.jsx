import { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Boxes, ShoppingCart, Network,
    Truck, FileText, PackageSearch, Users, Building2,
    BarChart3, LogOut, Menu, X, Bell, ChevronRight, Tag, AlertCircle, UserCog
} from 'lucide-react';

const NAV_ITEMS = [
    { label: 'PRINCIPAL', type: 'section', roles: ['admin','gerente'] },
    { label: 'Dashboard Gerencial', href: '/dashboard', icon: LayoutDashboard, roles: ['admin','gerente'] },
    { label: 'MÓDULOS', type: 'section', roles: ['admin','gerente','vendedor','almacen','logistica'] },
    { label: 'Gestión de Inventarios', href: '/inventario', icon: Boxes,        roles: ['admin','gerente','almacen','logistica'] },
    { label: 'Pedidos y Ventas',        href: '/pedidos',    icon: ShoppingCart, roles: ['admin','gerente','vendedor','almacen','logistica'] },
    { label: 'Integración Operativa',   href: '/integracion',icon: Network,      roles: ['admin','gerente','vendedor','almacen','logistica'] },
    { label: 'Picking y Despacho',      href: '/picking',    icon: Truck,        roles: ['admin','almacen','logistica'] },
    { label: 'Compras y Abastecimiento',href: '/compras',    icon: FileText,     roles: ['admin','gerente','almacen','logistica'] },
    { label: 'CATÁLOGOS', type: 'section', roles: ['admin','vendedor','almacen'] },
    { label: 'Categorías',  href: '/categorias',  icon: Tag,           roles: ['admin'] },
    { label: 'Productos',   href: '/productos',   icon: PackageSearch, roles: ['admin'] },
    { label: 'Clientes',    href: '/clientes',    icon: Users,         roles: ['admin','vendedor'] },
    { label: 'Proveedores', href: '/proveedores', icon: Building2,     roles: ['admin','almacen'] },
    { label: 'ADMINISTRACIÓN', type: 'section', roles: ['admin'] },
    { label: 'Gestión de Usuarios', href: '/usuarios', icon: UserCog, roles: ['admin'] },
    { label: 'ANÁLISIS', type: 'section', roles: ['admin','gerente','vendedor'] },
    { label: 'Reclamos de Clientes', href: '/reclamaciones', icon: AlertCircle, roles: ['admin','gerente','vendedor'] },
    { label: 'Reportes y Exportar',  href: '/reportes',      icon: BarChart3,   roles: ['admin','gerente'] },
];

const PRIORIDAD_COLOR = {
    urgente: 'bg-red-100 text-red-700',
    alta:    'bg-orange-100 text-orange-700',
    media:   'bg-blue-100 text-blue-700',
    baja:    'bg-gray-100 text-gray-500',
};

export default function AppLayout({ children, title }) {
    const { auth, notificaciones, stockAlertas, notifCount } = usePage().props;
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef(null);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const rol = auth?.user?.rol;
    const navItems = NAV_ITEMS.filter(item => !item.roles || item.roles.includes(rol));

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isActive = (href) => {
        if (href === '/dashboard') return currentPath === '/dashboard';
        return currentPath.startsWith(href);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Overlay mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#0a1628]
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-[70px]' : 'w-[260px]'}
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 min-h-[64px]">
                    <img
                        src="/img/logo.jpg"
                        alt="NAYAN"
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-600 flex-shrink-0"
                        onError={(e) => {
                            e.target.style.display='none';
                        }}
                    />
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-bold text-base tracking-wider">NAYAN</div>
                            <div className="text-[#a8b8d8] text-xs truncate">Mobile Accessories</div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex text-[#a8b8d8] hover:text-white transition-colors p-1 flex-shrink-0"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
                    </button>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-[#a8b8d8] hover:text-white p-1 ml-auto"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
                    {navItems.map((item, i) => {
                        if (item.type === 'section') {
                            if (collapsed) return null;
                            return (
                                <div key={i} className="px-4 pt-3 pb-1">
                                    <span className="text-[#a8b8d8]/50 text-[10px] font-bold tracking-[1.5px] uppercase">
                                        {item.label}
                                    </span>
                                </div>
                            );
                        }
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm
                                    transition-all duration-200 no-underline group
                                    ${active
                                        ? 'bg-blue-600/20 text-white border-l-2 border-blue-500 rounded-l-none ml-0 pl-3.5'
                                        : 'text-[#a8b8d8] hover:bg-white/10 hover:text-white'
                                    }
                                    ${collapsed ? 'justify-center' : ''}
                                `}
                                title={collapsed ? item.label : ''}
                            >
                                <Icon size={18} className="flex-shrink-0" />
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="px-3 py-3 border-t border-white/10">
                    <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {auth?.user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <div className="text-white text-xs font-semibold truncate">{auth?.user?.name}</div>
                                <div className="text-[#a8b8d8] text-[10px] capitalize">{auth?.user?.rol}</div>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                className="text-[#a8b8d8] hover:text-red-400 transition-colors p-1"
                                title="Cerrar sesión"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className={`flex flex-col flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-[70px]' : 'lg:ml-[260px]'}`}>
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                        >
                            <Menu size={20} />
                        </button>
                        {title && (
                            <h1 className="text-base font-semibold text-gray-800">{title}</h1>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 hidden sm:block">
                            {new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' })}
                        </span>
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setShowNotif(v => !v)}
                                className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                            >
                                <Bell size={18} />
                                {notifCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                                        {notifCount > 9 ? '9+' : notifCount}
                                    </span>
                                )}
                            </button>

                            {showNotif && (
                                <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <span className="text-sm font-semibold text-gray-700">Requerimientos Pendientes</span>
                                        {notifCount > 0 && (
                                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{notifCount}</span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {/* Alertas de stock */}
                                        {stockAlertas?.length > 0 && (
                                            <>
                                                <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Stock bajo</span>
                                                </div>
                                                {stockAlertas.map(p => (
                                                    <Link key={p.id} href="/inventario"
                                                        onClick={() => setShowNotif(false)}
                                                        className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 hover:bg-amber-50 transition-colors">
                                                        <div>
                                                            <div className="text-xs font-medium text-gray-800 truncate max-w-[180px]">{p.nombre}</div>
                                                            <div className="text-[11px] text-gray-400 mt-0.5">Stock: <span className={p.stock_actual <= p.stock_minimo ? 'text-red-500 font-bold' : 'text-amber-500 font-bold'}>{p.stock_actual}</span> / mín: {p.stock_minimo}</div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${p.stock_actual <= p.stock_minimo ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                            {p.stock_actual <= p.stock_minimo ? 'Crítico' : 'Bajo'}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </>
                                        )}

                                        {/* Requerimientos pendientes */}
                                        {notificaciones?.length > 0 && (
                                            <>
                                                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Requerimientos</span>
                                                </div>
                                                {notificaciones.map(n => (
                                                    <Link key={n.id} href="/integracion"
                                                        onClick={() => setShowNotif(false)}
                                                        className="flex flex-col px-4 py-2.5 border-b border-gray-50 hover:bg-blue-50 transition-colors">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-medium text-gray-800 truncate">{n.asunto}</span>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${PRIORIDAD_COLOR[n.prioridad] ?? 'bg-gray-100'}`}>
                                                                {n.prioridad}
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 mt-0.5">{n.area_origen} · {n.remitente}</div>
                                                    </Link>
                                                ))}
                                            </>
                                        )}

                                        {!stockAlertas?.length && !notificaciones?.length && (
                                            <div className="py-8 text-center text-sm text-gray-400">Sin notificaciones pendientes</div>
                                        )}
                                    </div>
                                    <Link href="/inventario" onClick={() => setShowNotif(false)}
                                        className="block text-center py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 border-t border-gray-100">
                                        Ver inventario →
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                {auth?.user?.name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">{auth?.user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
