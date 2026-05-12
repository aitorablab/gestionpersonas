import { analisisApi } from "../api";
import { mockRiesgoCobertura } from "../data/mockData";
import { useFetch } from "../hooks/useFetch";
import type { RiesgoCobertura } from "../types";
import PageHeader from "../components/ui/PageHeader";
import { LoadingSpinner, ErrorState } from "../components/ui/States";

// La API devuelve strings como "Crítico", "Alto", "Medio", "Bajo", "Sin riesgo"
const riskConfig: Record<string, { badge: string; bar: string; text: string }> = {
  "Crítico": { badge: "badge bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300", bar: "bg-red-500", text: "text-red-700 dark:text-red-400" },
  "Alto":    { badge: "badge-red",    bar: "bg-red-400",     text: "text-red-600 dark:text-red-400" },
  "Medio":   { badge: "badge-yellow", bar: "bg-amber-400",   text: "text-amber-600 dark:text-amber-400" },
  "Bajo":    { badge: "badge-green",  bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  "Sin riesgo": { badge: "badge-green", bar: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400" },
};

const DEFAULT_RISK = { badge: "badge-slate", bar: "bg-slate-300", text: "text-slate-500" };

const criticidadLabel: Record<number, { label: string; cls: string }> = {
  0: { label: "—",        cls: "badge-slate" },
  1: { label: "Baja",     cls: "badge-slate" },
  2: { label: "Media",    cls: "badge-yellow" },
  3: { label: "Alta",     cls: "badge-red" },
  4: { label: "Crítica",  cls: "badge bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
};

function calcPorcentaje(r: RiesgoCobertura): number {
  const total = r.noCompetentes + r.necesitanAyuda + r.autonomos + r.formadores;
  if (total === 0) return 0;
  return Math.round(((r.autonomos + r.formadores) / total) * 100);
}

function ResumenCard({ label, count, border, text, bg }: { label: string; count: number; border: string; text: string; bg: string }) {
  return (
    <div className={`rounded-2xl border p-5 ${border} ${bg}`}>
      <p className={`text-3xl font-bold ${text}`}>{count}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function RiesgoCoberturaPage() {
  const { data, loading, error, refetch } = useFetch(analisisApi.getRiesgo, mockRiesgoCobertura);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const riesgo = data ?? [];
  const sorted = [...riesgo].sort((a, b) => calcPorcentaje(a) - calcPorcentaje(b));

  const criticos = riesgo.filter(r => r.riesgoCobertura === "Crítico").length;
  const altos    = riesgo.filter(r => r.riesgoCobertura === "Alto").length;
  const medios   = riesgo.filter(r => r.riesgoCobertura === "Medio").length;
  const bajos    = riesgo.filter(r => r.riesgoCobertura === "Bajo" || r.riesgoCobertura === "Sin riesgo").length;

  return (
    <div>
      <PageHeader
        title="Riesgo de cobertura"
        subtitle="Análisis de cobertura por tarea basado en niveles de autonomía"
      />

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ResumenCard label="Crítico" count={criticos}
          border="border-red-300 dark:border-red-900/50" text="text-red-700 dark:text-red-400" bg="bg-red-50 dark:bg-red-900/10" />
        <ResumenCard label="Alto" count={altos}
          border="border-red-200 dark:border-red-900/30" text="text-red-600 dark:text-red-400" bg="bg-red-50/50 dark:bg-red-900/5" />
        <ResumenCard label="Medio" count={medios}
          border="border-amber-200 dark:border-amber-900/50" text="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/10" />
        <ResumenCard label="Bajo / Sin riesgo" count={bajos}
          border="border-emerald-200 dark:border-emerald-900/50" text="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/10" />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tarea</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Crit.</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">No comp.</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nec. ayuda</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Autónomo</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Formador</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cobertura</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {sorted.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No hay datos de riesgo disponibles</td></tr>
              )}
              {sorted.map(r => {
                const rc = riskConfig[r.riesgoCobertura] ?? DEFAULT_RISK;
                const crit = criticidadLabel[r.criticidad] ?? criticidadLabel[0];
                const pct = calcPorcentaje(r);
                return (
                  <tr key={r.tareaId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200 max-w-xs">{r.tarea}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{r.codigoTarea}</p>
                    </td>
                    <td className="px-5 py-3.5"><span className={crit.cls}>{crit.label}</span></td>
                    <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400 font-medium">{r.noCompetentes}</td>
                    <td className="px-4 py-3.5 text-center text-slate-600 dark:text-slate-400 font-medium">{r.necesitanAyuda}</td>
                    <td className="px-4 py-3.5 text-center text-emerald-600 dark:text-emerald-400 font-medium">{r.autonomos}</td>
                    <td className="px-4 py-3.5 text-center text-blue-600 dark:text-blue-400 font-medium">{r.formadores}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 flex-shrink-0">
                          <div className={`h-1.5 rounded-full ${rc.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${rc.text}`}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span className={rc.badge}>{r.riesgoCobertura}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico barras */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-5">Cobertura visual (autónomos + formadores)</h2>
        <div className="space-y-3">
          {sorted.map(r => {
            const rc = riskConfig[r.riesgoCobertura] ?? DEFAULT_RISK;
            const pct = calcPorcentaje(r);
            return (
              <div key={r.tareaId} className="flex items-center gap-3">
                <div className="w-44 flex-shrink-0 text-right">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" title={r.tarea}>{r.tarea}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{r.codigoTarea}</p>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-700 ${rc.bar}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="w-10 text-right flex-shrink-0">
                  <span className={`text-xs font-bold ${rc.text}`}>{pct}%</span>
                </div>
                <span className={`flex-shrink-0 w-20 text-center ${rc.badge}`}>{r.riesgoCobertura}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
