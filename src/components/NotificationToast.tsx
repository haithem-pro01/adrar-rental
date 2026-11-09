import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useAuth();

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isWarning = notification.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800'
            : isWarning
            ? 'bg-amber-950/90 text-amber-100 border-amber-800'
            : 'bg-rose-950/90 text-rose-100 border-rose-800'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
          {!isSuccess && !isWarning && <Info className="w-5 h-5 text-rose-400" />}
        </div>
        <div className="flex-1 text-sm font-medium leading-relaxed">
          {notification.message}
        </div>
        <button
          onClick={clearNotification}
          className="shrink-0 text-white/60 hover:text-white transition-colors"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
