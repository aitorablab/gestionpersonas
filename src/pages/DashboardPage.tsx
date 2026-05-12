import { useMemo } from "react";
import {
  Users, Briefcase, CheckSquare, Award, ClipboardList,
  AlertTriangle, TrendingDown, Grid3x3, ShieldAlert, Activity
} from "lucide-react";
import { personasApi, puestosApi, tareasApi, competenciasApi, responsabilidadesApi } from "../api";
import { analisisApi } from "../api";
import { useFetch } from "../hooks/useFetch";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { useNavigate } from "react-router-dom";
import {
  mockPersonas, mockPuestos, mockTareas, mockCompetencias,
  mockResponsabilidades, mockMatrizRows, mockRiesgoCobertura
} from "../data/mockData";

function KPICard({
  label, value, icon: Icon, color, sub, onClick
}: {
  label: string; value: number | string; icon: React.ElementType;
  color: string; sub?: string; onClick?: () => void;
}) {
  return (
    <div
      className={`card p-5 flex items-start gap-4 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} strokeWidth={2} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

const riskColor: Record<string, string> = {
  "Crítico": "badge bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  "Alto":    "badge-red",
  "Medio":   "badge-yellow",
  "Bajo":    "badge-green",
  "Sin riesgo": "badge-green",
};

const riskBar: Record<string, string> = {
  "Crítico": "bg-red-500", "Alto": "bg-red-400",
  "Medio": "bg-amber-400", "Bajo": "bg-emerald-500", "Sin riesgo": "bg-emerald-400",
};

const criticidadColor: Record<number, string> = {
  0: "badge-slate", 1: "badge-slate", 2: "badge-yellow", 3: "badge-red",
  4: "badge bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};
const criticidadLabel: Record<number, string> = {
  0: "—", 1: "Baja", 2: "Media", 3: "Alta", 4: "Crítica",
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const personas     = useFetch(personasApi.getAll, mockPersonas);
  const puestos      = useFetch(puestosApi.getAll, mockPuestos);
  const tareas       = useFetch(tareasApi.getAll, mockTareas);
  const competencias = useFetch(competenciasApi.getAll, mockCompetencias);
  const responsabilidades = useFetch(responsabilidadesApi.getAll, mockResponsabilidades);
  const matriz       = useFetch(analisisApi.getMatriz, mockMatrizRows);
  const riesgo       = useFetch(analisisApi.getRiesgo, mockRiesgoCobertura);

  const isLoading = [personas, puestos, tareas, competencias, responsabilidades, matriz, riesgo].some(f => f.loading);
  const hasError  = [personas, puestos, tareas, competencias, responsabilidades].some(f => f.error);

  // ─── Datos activos ────────────────────────────────────────
  const personasActivas     = useMemo(() => (personas.data ?? []).filter(p => p.activo), [personas.data]);
  const puestosActivos      = useMemo(() => (puestos.data ?? []).filter(p => p.activo), [puestos.data]);
  const tareasActivas       = useMemo(() => (tareas.data ?? []).filter(t => t.activo), [tareas.data]);
  const competenciasActivas = useMemo(() => (competencias.data ?? []).filter(c => c.activo), [competencias.data]);
  const respActivas         = useMemo(() => (responsabilidades.data ?? []).filter(r => r.activo), [responsabilidades.data]);
  const riesgoData          = useMemo(() => riesgo.data ?? [], [riesgo.data]);
  const matrizRows          = useMemo(() => matriz.data ?? [], [matriz.data]);

  // ─── KPI: Tareas sin criticidad definida ─────────────────
  const tareasSinCriticidad = useMemo(
    () => tareasActivas.filter(t => !t.criticidad || t.criticidad === 0).length,
    [tareasActivas]
  );

  // ─── KPI: Resumen riesgo ─────────────────────────────────
  const riesgoResumen = useMemo(() => ({
    critico:   riesgoData.filter(r => r.riesgoCobertura === "Crítico").length,
    alto:      riesgoData.filter(r => r.riesgoCobertura === "Alto").length,
    medio:     riesgoData.filter(r => r.riesgoCobertura === "Medio").length,
    bajo:      riesgoData.filter(r => r.riesgoCobertura === "Bajo" || r.riesgoCobertura === "Sin riesgo").length,
  }), [riesgoData]);

  // ─── KPI: % celdas sin evaluar ───────────────────────────
  const porcentajeSinEvaluar = useMemo(() => {
    const nPersonas = personasActivas.length;
    const nTareas   = tareasActivas.length;
    const totalCeldas = nPersonas * nTareas;
    if (totalCeldas === 0) return 0;
    const evaluadas = matrizRows.filter(r => r.nivelAutonomiaId > 0).length;
    const sinEvaluar = totalCeldas - evaluadas;
    return Math.round((sinEvaluar / totalCeldas) * 100);
  }, [personasActivas, tareasActivas, matrizRows]);

  // ─── KPI: Tareas con solo 1 persona en nivel ≥ 2 ────────
  const tareasConBajaCobertura = useMemo(() => {
    return tareasActivas.filter(tarea => {
      const personasConNivel = matrizRows.filter(
        r => r.tareaId === tarea.tareaId && r.nivelAutonomiaId >= 2
      ).length;
      return personasConNivel === 1;
    }).length;
  }, [tareasActivas, matrizRows]);

  // ─── Tareas con riesgo alto/crítico ──────────────────────
  const tareasRiesgoAlto = useMemo(
    () => riesgoData.filter(r => r.riesgoCobertura === "Crítico" || r.riesgoCobertura === "Alto"),
    [riesgoData]
  );

  function calcPct(r: typeof riesgoData[0]) {
    const total = (r.noCompetentes ?? 0) + (r.necesitanAyuda ?? 0) + (r.autonomos ?? 0) + (r.formadores ?? 0);
    if (total === 0) return 0;
    return Math.round(((r.autonomos + r.formadores) / total) * 100);
  }

  if (isLoading) return <LoadingSpinner />;
  if (hasError)  return <ErrorState message="Error al cargar el dashboard" onRetry={() => {
    personas.refetch(); puestos.refetch(); tareas.refetch();
    competencias.refetch(); responsabilidades.refetch(); matriz.refetch(); riesgo.refetch();
  }} />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Visión general del estado de personas y polivalencia</p>
      </div>

      {/* ── Fila 1: KPIs maestros ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KPICard label="Personas activas"      value={personasActivas.length}     icon={Users}        color="bg-mint-500"    sub={`${(personas.data ?? []).length} en total`}        onClick={() => navigate("/personas")} />
        <KPICard label="Puestos activos"        value={puestosActivos.length}      icon={Briefcase}    color="bg-blue-500"    sub={`${(puestos.data ?? []).length} en total`}          onClick={() => navigate("/puestos")} />
        <KPICard label="Tareas activas"         value={tareasActivas.length}       icon={CheckSquare}  color="bg-violet-500"  sub={`${(tareas.data ?? []).length} en total`}           onClick={() => navigate("/tareas")} />
        <KPICard label="Competencias"           value={competenciasActivas.length} icon={Award}        color="bg-orange-500"  sub={`${(competencias.data ?? []).length} en total`}     onClick={() => navigate("/competencias")} />
        <KPICard label="Responsabilidades"      value={respActivas.length}         icon={ClipboardList} color="bg-teal-500"   sub={`${(responsabilidades.data ?? []).length} en total`} onClick={() => navigate("/responsabilidades")} />
      </div>

      {/* ── Fila 2: KPIs análisis ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Tareas sin criticidad"
          value={tareasSinCriticidad}
          icon={Activity}
          color={tareasSinCriticidad > 0 ? "bg-amber-500" : "bg-slate-400"}
          sub="Criticidad no definida"
          onClick={() => navigate("/tareas")}
        />
        <KPICard
          label="Celdas sin evaluar"
          value={`${porcentajeSinEvaluar}%`}
          icon={Grid3x3}
          color={porcentajeSinEvaluar > 50 ? "bg-red-500" : porcentajeSinEvaluar > 20 ? "bg-amber-500" : "bg-emerald-500"}
          sub="De la matriz de polivalencia"
          onClick={() => navigate("/polivalencia")}
        />
        <KPICard
          label="Tareas de alta exposición"
          value={tareasConBajaCobertura}
          icon={ShieldAlert}
          color={tareasConBajaCobertura > 0 ? "bg-red-500" : "bg-emerald-500"}
          sub="Solo 1 persona en nivel ≥ 2"
          onClick={() => navigate("/riesgo")}
        />
        {/* Riesgo de cobertura — resumen 4 niveles */}
        <div className="card p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/riesgo")}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-11 h-11 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Riesgo cobertura</p>
              <p className="text-xs text-slate-400">{riesgoData.length} tareas analizadas</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Crítico", count: riesgoResumen.critico, cls: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
              { label: "Alto",    count: riesgoResumen.alto,    cls: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" },
              { label: "Medio",   count: riesgoResumen.medio,   cls: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" },
              { label: "Bajo",    count: riesgoResumen.bajo,    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" },
            ].map(({ label, count, cls }) => (
              <div key={label} className={`rounded-lg px-2 py-1.5 flex items-center justify-between ${cls}`}>
                <span className="text-xs font-medium">{label}</span>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fila 3: Tareas con riesgo alto/crítico + cobertura ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Tareas con riesgo alto o crítico */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tareas con riesgo alto o crítico</h2>
            <span className="ml-auto badge badge-red">{tareasRiesgoAlto.length}</span>
          </div>
          {tareasRiesgoAlto.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Sin riesgos detectados</p>
          ) : (
            <div className="space-y-2">
              {tareasRiesgoAlto.map(r => (
                <div key={r.tareaId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.tarea}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.codigoTarea} · {criticidadLabel[r.criticidad as number] ?? "—"}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">{calcPct(r)}%</p>
                    <p className="text-[10px] text-slate-400">{r.autonomos + r.formadores}/{(r.noCompetentes + r.necesitanAyuda + r.autonomos + r.formadores)} cubiertas</p>
                  </div>
                  <span className={riskColor[r.riesgoCobertura] ?? "badge-slate"}>{r.riesgoCobertura}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cobertura visual */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-violet-500" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Cobertura por tarea</h2>
          </div>
          {riesgoData.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Sin datos de cobertura</p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {[...riesgoData].sort((a, b) => calcPct(a) - calcPct(b)).map(r => {
                const pct = calcPct(r);
                const bar = riskBar[r.riesgoCobertura] ?? "bg-slate-300";
                const textColor = pct >= 75 ? "text-emerald-600 dark:text-emerald-400"
                  : pct >= 50 ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400";
                return (
                  <div key={r.tareaId} className="flex items-center gap-3">
                    <div className="w-36 flex-shrink-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{r.tarea}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.codigoTarea}</p>
                    </div>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-500 ${bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`w-10 text-right text-xs font-semibold flex-shrink-0 ${textColor}`}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}