import { useState, useMemo } from "react";
import { Search, X, ChevronDown, ChevronRight } from "lucide-react";

// ─── NivelBadge ─────────────────────────────────────────────
const NIVEL_CFG: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  0: { label: "No evaluado",   bg: "bg-slate-100 dark:bg-slate-700",        text: "text-slate-500 dark:text-slate-400",   dot: "bg-slate-400" },
  1: { label: "No competente", bg: "bg-red-100 dark:bg-red-900/30",         text: "text-red-700 dark:text-red-400",       dot: "bg-red-500" },
  2: { label: "Nec. ayuda",    bg: "bg-amber-100 dark:bg-amber-900/30",     text: "text-amber-700 dark:text-amber-400",   dot: "bg-amber-500" },
  3: { label: "Autónomo",      bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  4: { label: "Formador",      bg: "bg-blue-100 dark:bg-blue-900/30",       text: "text-blue-700 dark:text-blue-400",     dot: "bg-blue-500" },
};

export function NivelBadge({ nivel }: { nivel: number }) {
  const cfg = NIVEL_CFG[nivel] ?? NIVEL_CFG[0];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function NivelSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Object.entries(NIVEL_CFG).map(([n, cfg]) => {
        const num = Number(n);
        return (
          <button
            key={n}
            onClick={() => onChange(num)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border-2 transition-all ${
              value === num
                ? `${cfg.bg} ${cfg.text} border-current`
                : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
            }`}
          >
            {num} – {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── CriticidadBadge ────────────────────────────────────────
const CRIT_CFG: Record<number, { label: string; cls: string }> = {
  0: { label: "—",       cls: "badge-slate" },
  1: { label: "Baja",    cls: "badge-slate" },
  2: { label: "Media",   cls: "badge-yellow" },
  3: { label: "Alta",    cls: "badge-red" },
  4: { label: "Crítica", cls: "badge bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
};

export function CriticidadBadge({ nivel }: { nivel: number }) {
  const cfg = CRIT_CFG[nivel] ?? CRIT_CFG[0];
  return <span className={cfg.cls}>{cfg.label}</span>;
}

// ─── SearchSelect ───────────────────────────────────────────
interface SearchSelectOption {
  id: number;
  label: string;
  sublabel?: string;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  excluded?: number[];
}

export function SearchSelect({ options, value, onChange, placeholder = "Buscar...", excluded = [] }: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() =>
    options.filter(o =>
      !excluded.includes(o.id) &&
      o.label.toLowerCase().includes(q.toLowerCase())
    ), [options, q, excluded]);

  const selected = options.find(o => o.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="input-base flex items-center justify-between gap-2 text-left"
      >
        <span className={selected ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 rounded-lg border-0 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-xs text-slate-400 text-center">Sin resultados</p>
            ) : (
              filtered.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(o.id); setOpen(false); setQ(""); }}
                  className={`w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    value === o.id ? "bg-mint-50 dark:bg-mint-900/20" : ""
                  }`}
                >
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{o.label}</p>
                  {o.sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{o.sublabel}</p>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RelationRow ────────────────────────────────────────────
interface RelationRowProps {
  code?: string;
  label: string;
  sublabel?: string;
  badge?: React.ReactNode;
  activo: boolean;
  onDesactivar?: () => void;
  extra?: React.ReactNode;
  canEdit?: boolean;
  onNavigate?: () => void;
}

export function RelationRow({
  code, label, sublabel, badge, activo, onDesactivar, extra, canEdit = true, onNavigate
}: RelationRowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        activo
          ? "hover:bg-slate-50 dark:hover:bg-slate-700/30"
          : "opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700/20"
      } ${onNavigate ? "cursor-pointer" : ""}`}
      onClick={onNavigate}
    >
      {code && (
        <span className="font-mono text-[10px] text-slate-400 w-14 flex-shrink-0">{code}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{label}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5 truncate">{sublabel}</p>}
      </div>
      {badge && <div className="flex-shrink-0">{badge}</div>}
      {extra && <div className="flex-shrink-0">{extra}</div>}
      {!activo && <span className="badge-slate text-[10px]">Inactivo</span>}
      {onNavigate && activo && (
        <ChevronRight size={14} className="flex-shrink-0 text-slate-300 dark:text-slate-600" />
      )}
      {canEdit && onDesactivar && activo && (
        <button
          onClick={e => { e.stopPropagation(); onDesactivar(); }}
          className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Quitar"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

// ─── RelationSection ────────────────────────────────────────
interface RelationSectionProps {
  title: string;
  count: number;
  action?: React.ReactNode;
  children: React.ReactNode;
  empty?: string;
}

export function RelationSection({ title, count, action, children, empty = "Sin elementos" }: RelationSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
          <span className="badge badge-slate">{count}</span>
        </div>
        {action}
      </div>
      <div className="card divide-y divide-slate-50 dark:divide-slate-700/50">
        {count === 0 ? (
          <p className="px-4 py-6 text-xs text-slate-400 text-center">{empty}</p>
        ) : children}
      </div>
    </div>
  );
}

// ─── TabBar ─────────────────────────────────────────────────
interface Tab { key: string; label: string; count?: number }

interface TabBarProps {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <div className="flex gap-1 border-b border-slate-100 dark:border-slate-700 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === tab.key
              ? "text-mint-600 dark:text-mint-400 border-mint-500"
              : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              active === tab.key
                ? "bg-mint-100 text-mint-700 dark:bg-mint-900/30 dark:text-mint-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}