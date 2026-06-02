import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links, meta }) {
    if (!links && !meta) return null;
    const pages = links ?? meta?.links ?? [];
    if (pages.length <= 3) return null; // solo prev/next sin páginas

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <div className="text-xs text-gray-400">
                {meta?.from ?? ''}–{meta?.to ?? ''} de {meta?.total ?? ''} registros
            </div>
            <div className="flex items-center gap-1">
                {pages.map((link, i) => {
                    if (link.label === '&laquo; Previous' || link.label === '« Previous') {
                        return (
                            <Link key={i} href={link.url ?? '#'}
                                className={`p-1.5 rounded-lg transition-colors ${link.url ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-300 pointer-events-none'}`}>
                                <ChevronLeft size={15}/>
                            </Link>
                        );
                    }
                    if (link.label === 'Next &raquo;' || link.label === 'Next »') {
                        return (
                            <Link key={i} href={link.url ?? '#'}
                                className={`p-1.5 rounded-lg transition-colors ${link.url ? 'text-gray-500 hover:bg-gray-100' : 'text-gray-300 pointer-events-none'}`}>
                                <ChevronRight size={15}/>
                            </Link>
                        );
                    }
                    if (link.label === '...') {
                        return <span key={i} className="px-1 text-gray-300 text-xs">…</span>;
                    }
                    return (
                        <Link key={i} href={link.url ?? '#'}
                            className={`min-w-[28px] h-7 flex items-center justify-center rounded-lg text-xs font-medium transition-colors
                                ${link.active
                                    ? 'bg-blue-600 text-white'
                                    : link.url ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 pointer-events-none'
                                }`}>
                            {link.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
