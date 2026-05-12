import { useState } from "react";
import { Copy } from "lucide-react";
import { SearchSelect } from "../relations";

interface CopiarDeProps<T> {
  items: T[];
  getId: (item: T) => number;
  getLabel: (item: T) => string;
  getSublabel?: (item: T) => string;
  onCopiar: (item: T) => void;
  placeholder?: string;
}

export default function CopiarDe<T>({ items, getId, getLabel, getSublabel, onCopiar, placeholder = "Buscar..." }: CopiarDeProps<T>) {
  const [open, setOpen] = useState(false);
  const [selId, setSelId] = useState<number | null>(null);

  function handleCopiar() {
    const item = items.find(i => getId(i) === selId);
    if (item) { onCopiar(item); setSelId(null); setOpen(false); }
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-mint-600 dark:hover:text-mint-400 transition-colors"
      >
        <Copy size={12} />
        Copiar datos de uno existente
      </button>

      {open && (
        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 space-y-2">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
            Selecciona el elemento a copiar — los campos se rellenarán automáticamente
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <SearchSelect
                options={items.map(i => ({
                  id: getId(i),
                  label: getLabel(i),
                  sublabel: getSublabel ? getSublabel(i) : undefined,
                }))}
                value={selId}
                onChange={setSelId}
                placeholder={placeholder}
              />
            </div>
            <button
              type="button"
              onClick={handleCopiar}
              disabled={!selId}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}