import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import type { Competencia } from "../types";
import { competenciasApi } from "../api";
import { competenciaDetailApi } from "../api/relations";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import { useRole } from "../hooks/useAppContext";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { RelationSection, RelationRow } from "../components/relations";
import { mockCompetencias, mockPuestoCompetencias, mockPuestos } from "../data/mockData";

const tipoBadge: Record<string, string> = {
  "Genérica":    "badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  "Técnica":     "badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Directiva":   "badge bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "Transversal": "badge bg-mint-100 text-mint-700 dark:bg-mint-900/30 dark:text-mint-400",
};

const NIVEL_LABELS: Record<number, string> = {
  0: "No evaluado", 1: "No competente", 2: "Nec. ayuda", 3: "Autónomo", 4: "Formador"
};

export default function CompetenciaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const compId = Number(id);
  const navigate = useNavigate();
  const { canEdit } = useRole();

  const mockComp = mockCompetencias.find(c => c.competenciaId === compId);
  const mockPuestosFallback = mockPuestoCompetencias
    .filter(pc => pc.competenciaId === compId && pc.activo)
    .map(pc => {
      const p = mockPuestos.find(p => p.puestoId === pc.puestoId);
      return p ? { puestoId: p.puestoId, codigoPuesto: p.codigoPuesto, puesto: p.puesto, area: p.area, nivelMinimo: pc.nivelMinimo, nivelConveniente: pc.nivelConveniente, requeridaYN: pc.requeridaYN, activo: pc.activo } : null;
    }).filter(Boolean);

  const compFetch    = useFetch(() => competenciasApi.getAll().then(list => list.find(c => c.competenciaId === compId) as Competencia), mockComp);
  const puestosFetch = useFetch(() => competenciaDetailApi.puestos(compId), mockPuestosFallback as any);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ competencia: "", comportamientoObservable: "", tipoCompetencia: "Genérica", tipoEvaluacion: "360°", activo: true });
  const { saving, error: saveError, run } = useSaving();
  const [comp, setComp] = useState<Competencia | null>(null);

  useEffect(() => {
    if (compFetch.data) {
      const c = compFetch.data as Competencia;
      setComp(c);
      setForm({ competencia: c.competencia, comportamientoObservable: c.comportamientoObservable, tipoCompetencia: c.tipoCompetencia, tipoEvaluacion: c.tipoEvaluacion, activo: c.activo });
    }
  }, [compFetch.data]);

  async function handleSave() {
    if (!comp) return;
    const ok = await run(async () => {
      await competenciasApi.update(comp.competenciaId, { ...form, codigoCompetencia: comp.codigoCompetencia });
      setComp(prev => prev ? { ...prev, ...form } : prev);
    });
    if (ok) setModalOpen(false);
  }

  const f = (field: keyof typeof form, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  if (compFetch.loading) return <LoadingSpinner />;
  if (!comp) return <ErrorState message="Competencia no encontrada" onRetry={compFetch.refetch} />;

  const puestos = (puestosFetch.data ?? []) as any[];

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft size={14} />Volver
      </button>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{comp.codigoCompetencia}</span>
              <span className={tipoBadge[comp.tipoCompetencia] ?? "badge-slate"}>{comp.tipoCompetencia}</span>
              <span className={comp.activo ? "badge-green" : "badge-slate"}>{comp.activo ? "Activo" : "Inactivo"}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{comp.competencia}</h1>
            {comp.comportamientoObservable && (
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">{comp.comportamientoObservable}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Tipo evaluación:</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{comp.tipoEvaluacion}</span>
            </div>
          </div>
          {canEdit && (
            <button className="btn-secondary flex-shrink-0" onClick={() => setModalOpen(true)}>
              <Pencil size={14} />Editar
            </button>
          )}
        </div>
      </div>

      <RelationSection title="Puestos que requieren esta competencia" count={puestos.length} empty="Ningún puesto asociado">
        {puestos.map((p: any) => (
          <RelationRow
            key={p.puestoId}
            code={p.codigoPuesto}
            label={p.puesto}
            sublabel={p.area}
            activo={p.activo}
            onNavigate={() => navigate(`/puestos/${p.puestoId}`)}
            badge={
              <div className="flex items-center gap-2">
                {p.requeridaYN && <span className="badge badge-red">Requerida</span>}
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Mín: <span className="font-semibold text-slate-600 dark:text-slate-300">{NIVEL_LABELS[p.nivelMinimo]}</span></p>
                  <p className="text-[10px] text-slate-400">Conv: <span className="font-semibold text-slate-600 dark:text-slate-300">{NIVEL_LABELS[p.nivelConveniente]}</span></p>
                </div>
              </div>
            }
          />
        ))}
      </RelationSection>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar competencia"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={13} className="animate-spin" />}Guardar cambios
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {saveError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveError}</p>}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <span className="text-xs text-slate-400">Código</span>
            <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{comp.codigoCompetencia}</span>
            <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Competencia *</label>
              <input className="input-base" value={form.competencia} onChange={e => f("competencia", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tipo competencia</label>
              <select className="input-base" value={form.tipoCompetencia} onChange={e => f("tipoCompetencia", e.target.value)}>
                <option value="Genérica">Genérica</option>
                <option value="Técnica">Técnica</option>
                <option value="Directiva">Directiva</option>
                <option value="Transversal">Transversal</option>
                <option value="Específica">Específica</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Comportamiento observable</label>
            <textarea className="input-base resize-none" rows={3} value={form.comportamientoObservable} onChange={e => f("comportamientoObservable", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tipo evaluación</label>
            <select className="input-base" value={form.tipoEvaluacion} onChange={e => f("tipoEvaluacion", e.target.value)}>
              <option value="360°">360°</option>
              <option value="Autoevaluación">Autoevaluación</option>
              <option value="Evaluación directa">Evaluación directa</option>
            </select>
          </div>
          <Toggle checked={form.activo} onChange={v => f("activo", v)} label="Activo" />
        </div>
      </Modal>
    </div>
  );
}