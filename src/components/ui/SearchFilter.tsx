import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Buscar..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-9 w-64"
      />
    </div>
  );
}

type FilterValue = "todos" | "activo" | "inactivo";

interface FilterTabsProps {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
  counts?: { todos: number; activo: number; inactivo: number };
}

export function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  const tabs: { key: FilterValue; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "activo", label: "Activos" },
    { key: "inactivo", label: "Inactivos" },
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
            value === tab.key
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {tab.label}
          {counts && (
            <span className="ml-1.5 opacity-60">{counts[tab.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
