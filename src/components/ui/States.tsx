import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-mint-500" />
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      {onRetry && (
        <button className="btn-secondary mt-1" onClick={onRetry}>
          <RefreshCw size={14} />
          Reintentar
        </button>
      )}
    </div>
  );
}
