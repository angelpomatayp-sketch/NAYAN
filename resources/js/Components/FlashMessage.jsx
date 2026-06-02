import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setVisible(true);
            const t = setTimeout(() => setVisible(false), 4000);
            return () => clearTimeout(t);
        }
    }, [flash]);

    if (!visible || (!flash?.success && !flash?.error)) return null;

    const isSuccess = !!flash.success;
    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm
            ${isSuccess ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
        >
            {isSuccess ? <CheckCircle size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-red-500" />}
            <span className="flex-1">{flash.success || flash.error}</span>
            <button onClick={() => setVisible(false)} className="text-current opacity-50 hover:opacity-100">
                <X size={14} />
            </button>
        </div>
    );
}
