import { useState, useMemo } from "react";
import { analisisApi } from "../api";
import { mockMatrizRows } from "../data/mockData";
import { useFetch } from "../hooks/useFetch";
import PageHeader from "../components/ui/PageHeader";
import { LoadingSpinner, ErrorState } from "../components/ui/States";

// Nivel 0-4 → config visual
const NIVEL_CONFIG: Record<number, { label: string; short: string; bg: string; text: string; darkBg: string; darkText: string }> = {
  0: { label: "No evaluado", short: "—", bg: "bg-slate-100", text: "text-slate-400", darkBg: "dark:bg-slate-700", darkText: "dark:text-slate-500" },
  1: { label: "No competente", short: "1", bg: "bg-red-100", text: "text-red-600", darkBg: "dark:bg-red-900/30", darkText: "dark:text-red-400" },
  2: { label: "Necesita ayuda", short: "2", bg: "bg-amber-100", text: "text-amber-700", darkBg: "dark:bg-amber-900/30", darkText: "dark:text-amber-400" },
  3: { label: "Autónomo", short: "3", bg: "bg-emerald-100", text: "text-emerald-700", darkBg: "dark:bg-emerald-900/30", darkText: "dark:text-emerald-400" },
  4: { label: "Formador", short: "4", bg: "bg-blue-100", text: "text-blue-700", darkBg: "dark:bg-blue-900/30", darkText: "dark:text-blue-400" },
};

const CRITICIDAD_LABEL: Record<number, { label: string; cls: string }> = {
  0: { label: "—", cls: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400" },
  1: { label: "Baja", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400" },
  2: { label: "Media", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  3: { label: "Alta", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  4: { label: "Crítica", cls: "bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
};

export default function PolivalenciaPage() {
  const { data: rows, loading, error, refetch } = useFetch(analisisApi.getMatriz, mockMatrizRows);

  const [filterPersonaId, setFilterPersonaId] = useState<string>("");
  const [filterTareaId, setFilterTareaId] = useState<string>("");
  const [filterCriticidad, setFilterCriticidad] = useState<string>("");
  const [filterNivel, setFilterNivel] = useState<string>("");

  // Derivar personas y tareas únicas del array plano
  const personas = useMemo(() => {
    if (!rows) return [];
    const map = new Map<number, { personaId: number; nombreCompleto: string; alias: string }>();
    rows.forEach(r => {
      if (!map.has(r.personaId)) map.set(r.personaId, { personaId: r.personaId, nombreCompleto: r.nombreCompleto, alias: r.codigoPersona });
    });
    return Array.from(map.values()).sort((a, b) => a.personaId - b.personaId);
  }, [rows]);

  const tareas = useMemo(() => {
    if (!rows) return [];
    const map = new Map<number, { tareaId: number; codigoTarea: string; tarea: string; criticidad: number }>();
    rows.forEach(r => {
      if (!map.has(r.tareaId)) map.set(r.tareaId, { tareaId: r.tareaId, codigoTarea: r.codigoTarea, tarea: r.tarea, criticidad: r.criticidad });
    });
    return Array.from(map.values()).sort((a, b) => a.tareaId - b.tareaId);
  }, [rows]);

  // Lookup rápido: personaId+tareaId → nivelAutonomiaId
  const nivelMap = useMemo(() => {
    const m = new Map<string, number>();
    rows?.forEach(r => m.set(`${r.personaId}-${r.tareaId}`, r.nivelAutonomiaId));
    return m;
  }, [rows]);

  const personasFiltradas = useMemo(() =>
    personas.filter(p => !filterPersonaId || p.personaId.toString() === filterPersonaId),
    [personas, filterPersonaId]
  );

  const tareasFiltradas = useMemo(() =>
    tareas.filter(t =>
      (!filterTareaId || t.tareaId.toString() === filterTareaId) &&
      (!filterCriticidad || t.criticidad.toString() === filterCriticidad)
    ),
    [tareas, filterTareaId, filterCriticidad]
  );

  function getNivel(personaId: number, tareaId: number): number {
    return nivelMap.get(`${personaId}-${tareaId}`) ?? 0;
  }

  const matchNivel = (nivel: number) => !filterNivel || nivel.toString() === filterNivel;

  const limpiarFiltros = () => { setFilterPersonaId(""); setFilterTareaId(""); setFilterCriticidad(""); setFilterNivel(""); };
  const hayFiltros = filterPersonaId || filterTareaId || filterCriticidad || filterNivel;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Matriz de polivalencia"
        subtitle={`${personasFiltradas.length} personas · ${tareasFiltradas.length} tareas`}
      />

      {/* Leyenda */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {Object.entries(NIVEL_CONFIG).map(([nivel, cfg]) => (
          <div key={nivel} className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cfg.bg} ${cfg.darkBg}`}>
              <span className={`text-[11px] font-bold ${cfg.text} ${cfg.darkText}`}>{cfg.short}</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6 flex items-end gap-4 flex-wrap">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Persona</label>
          <select className="input-base text-xs py-1.5 min-w-[160px]" value={filterPersonaId} onChange={e => setFilterPersonaId(e.target.value)}>
            <option value="">Todas</option>
            {personas.map(p => <option key={p.personaId} value={p.personaId}>{p.nombreCompleto}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Tarea</label>
          <select className="input-base text-xs py-1.5 min-w-[160px]" value={filterTareaId} onChange={e => setFilterTareaId(e.target.value)}>
            <option value="">Todas</option>
            {tareas.map(t => <option key={t.tareaId} value={t.tareaId}>{t.codigoTarea} – {t.tarea.slice(0, 40)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Criticidad</label>
          <select className="input-base text-xs py-1.5" value={filterCriticidad} onChange={e => setFilterCriticidad(e.target.value)}>
            <option value="">Todas</option>
            <option value="4">4 – Crítica</option>
            <option value="3">3 – Alta</option>
            <option value="2">2 – Media</option>
            <option value="1">1 – Baja</option>
            <option value="0">0 – Sin definir</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Nivel autonomía</label>
          <select className="input-base text-xs py-1.5" value={filterNivel} onChange={e => setFilterNivel(e.target.value)}>
            <option value="">Todos</option>
            <option value="0">0 – No evaluado</option>
            <option value="1">1 – No competente</option>
            <option value="2">2 – Necesita ayuda</option>
            <option value="3">3 – Autónomo</option>
            <option value="4">4 – Formador</option>
          </select>
        </div>
        {hayFiltros && (
          <button className="btn-ghost" onClick={limpiarFiltros}>Limpiar filtros</button>
        )}
      </div>

      {/* Matriz */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                {/* Esquina */}
                <th className="sticky left-0 z-10 bg-white dark:bg-slate-800 min-w-[200px] px-4 py-3 border-b border-r border-slate-100 dark:border-slate-700" />
                {tareasFiltradas.map(t => {
                  const crit = CRITICIDAD_LABEL[t.criticidad] ?? CRITICIDAD_LABEL[0];
                  return (
                    <th key={t.tareaId} className="px-2 py-3 border-b border-r border-slate-100 dark:border-slate-700 min-w-[72px] align-bottom">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono text-[10px] text-slate-400">{t.codigoTarea}</span>
                        <span
                          className="font-semibold text-slate-700 dark:text-slate-300 leading-tight"
                          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: 110, overflow: "hidden" }}
                          title={t.tarea}
                        >
                          {t.tarea}
                        </span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${crit.cls}`}>
                          {crit.label}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {personasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={tareasFiltradas.length + 1} className="text-center py-12 text-slate-400 text-sm">
                    No hay datos para los filtros seleccionados
                  </td>
                </tr>
              )}
              {personasFiltradas.map(p => (
                <tr key={p.personaId} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors group">
                  {/* Cabecera fila */}
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/20 px-4 py-3 border-b border-r border-slate-100 dark:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-mint-700 dark:text-mint-400">
                          {p.nombreCompleto.charAt(0)}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{p.nombreCompleto}</p>
                    </div>
                  </td>
                  {/* Celdas */}
                  {tareasFiltradas.map(t => {
                    const nivel = getNivel(p.personaId, t.tareaId);
                    const cfg = NIVEL_CONFIG[nivel] ?? NIVEL_CONFIG[0];
                    const visible = matchNivel(nivel);
                    return (
                      <td key={t.tareaId} className="px-1.5 py-2 border-b border-r border-slate-100 dark:border-slate-700 text-center">
                        <div
                          className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                            visible
                              ? `${cfg.bg} ${cfg.text} ${cfg.darkBg} ${cfg.darkText}`
                              : "bg-slate-50 text-slate-200 dark:bg-slate-800 dark:text-slate-700"
                          }`}
                          title={`${p.nombreCompleto} · ${t.tarea}: ${cfg.label}`}
                        >
                          {cfg.short}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
