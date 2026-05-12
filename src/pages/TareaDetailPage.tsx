import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Pencil, Loader2 } from "lucide-react";
import type { Tarea } from "../types";
import { tareasApi } from "../api";
import { tareaDetailApi } from "../api/relations";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import { useRole } from "../hooks/useAppContext";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { RelationSection, RelationRow, CriticidadBadge } from "../components/relations";
import { mockTareas, mockPuestoTareas, mockPuestos, mockMatrizRows, mockPersonaTareasAsignadas, mockPersonas } from "../data/mockData";

const criticidadConfig: Record<number, { label: string; cls: string }> = {
  0: { label: "—",       cls: "badge-slate" },
  1: { label: "Baja",    cls: "badge-slate" },
  2: { label: "Media",   cls: "badge-yellow" },
  3: { label: "Alta",    cls: "badge-red" },
  4: { label: "Crítica", cls: "badge bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
};

function BoolChip({ value, label }: { value: boolean; label: string }) {
  return value ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <Check size={10} />{label}
    </span>
  ) : null;
}

export default function TareaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tareaId = Number(id);
  const navigate = useNavigate();
  const { canEdit } = useRole();

  // ─── Fallbacks mock correctos ─────────────────────────────
  const mockTarea = mockTareas.find(t => t.tareaId === tareaId);

  // Personas que tienen esta tarea: por asignación directa O por capacidad
  const mockPersonasFallback = (() => {
    const porAsignacion = mockPersonaTareasAsignadas
      .filter(pta => pta.tareaId === tareaId && pta.activo)
      .map(pta => {
        const p = mockPersonas.find(p => p.personaId === pta.personaId);
        return p ? { personaId: p.personaId, codigoPersona: p.codigoPersona, nombreCompleto: p.nombreCompleto, alias: p.alias, esLider: p.esLider, activo: p.activo, origen: 'asignada' } : null;
      }).filter(Boolean);

    const porCapacidad = mockMatrizRows
      .filter(r => r.tareaId === tareaId)
      .map(r => {
        const p = mockPersonas.find(p => p.personaId === r.personaId);
        return p ? { personaId: p.personaId, codigoPersona: p.codigoPersona, nombreCompleto: p.nombreCompleto, alias: p.alias, esLider: p.esLider, activo: p.activo, origen: 'capacidad' } : null;
      }).filter(Boolean);

    // Unir sin duplicados por personaId
    const todos = [...porAsignacion];
    porCapacidad.forEach(pc => {
      if (pc && !todos.find(t => t && t.personaId === pc.personaId)) todos.push(pc);
    });
    return todos;
  })();

  const mockPuestosFallback = mockPuestoTareas
    .filter(pt => pt.tareaId === tareaId && pt.activo)
    .map(pt => {
      const p = mockPuestos.find(p => p.puestoId === pt.puestoId);
      return p ? { puestoId: p.puestoId, codigoPuesto: p.codigoPuesto, puesto: p.puesto, area: p.area, activo: pt.activo } : null;
    }).filter(Boolean);

  const tareaFetch    = useFetch(() => tareasApi.getAll().then(list => list.find(t => t.tareaId === tareaId) as Tarea), mockTarea);
  const personasFetch = useFetch(() => tareaDetailApi.personas(tareaId), mockPersonasFallback as any);
  const puestosFetch  = useFetch(() => tareaDetailApi.puestos(tareaId), mockPuestosFallback as any);

  // ─── Modal edición ────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Tarea, "tareaId" | "codigoTarea">>({
    tarea: "", estrategico: false, dificilmenteAdquirible: false,
    problemasLegales: false, documentado: false, criticidad: 2, activo: true,
  });
  const { saving, error: saveError, run } = useSaving();
  const [tarea, setTarea] = useState<Tarea | null>(null);

  useEffect(() => {
    if (tareaFetch.data) {
      const t = tareaFetch.data as Tarea;
      setTarea(t);
      setForm({ tarea: t.tarea, estrategico: t.estrategico, dificilmenteAdquirible: t.dificilmenteAdquirible, problemasLegales: t.problemasLegales, documentado: t.documentado, criticidad: t.criticidad, activo: t.activo });
    }
  }, [tareaFetch.data]);

  async function handleSave() {
    if (!tarea) return;
    const ok = await run(async () => {
      await tareasApi.update(tarea.tareaId, { ...form, codigoTarea: tarea.codigoTarea });
      setTarea(prev => prev ? { ...prev, ...form } : prev);
    });
    if (ok) setModalOpen(false);
  }

  const f = (field: keyof typeof form, value: string | boolean | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  if (tareaFetch.loading) return <LoadingSpinner />;
  if (!tarea) return <ErrorState message="Tarea no encontrada" onRetry={tareaFetch.refetch} />;

  const personas = (personasFetch.data ?? []) as any[];
  const puestos  = (puestosFetch.data ?? []) as any[];
  const crit = criticidadConfig[tarea.criticidad as number] ?? criticidadConfig[0];

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft size={14} />Volver
      </button>

      {/* Cabecera */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{tarea.codigoTarea}</span>
              <span className={crit.cls}>{crit.label}</span>
              <span className={tarea.activo ? "badge-green" : "badge-slate"}>{tarea.activo ? "Activo" : "Inactivo"}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{tarea.tarea}</h1>
            <div className="flex flex-wrap gap-2">
              <BoolChip value={tarea.estrategico} label="Estratégico" />
              <BoolChip value={tarea.dificilmenteAdquirible} label="Difícilmente adquirible" />
              <BoolChip value={tarea.problemasLegales} label="Problemas legales" />
              <BoolChip value={tarea.documentado} label="Documentado" />
            </div>
          </div>
          {canEdit && (
            <button className="btn-secondary flex-shrink-0" onClick={() => setModalOpen(true)}>
              <Pencil size={14} />Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RelationSection title="Personas con esta tarea" count={personas.length} empty="Ninguna persona asignada">
          {personas.map((p: any) => (
            <RelationRow
              key={`${p.personaId}-${p.origen}`}
              code={p.codigoPersona}
              label={p.nombreCompleto}
              sublabel={p.origen === 'asignada' ? 'Asignación directa' : 'Por capacidad'}
              activo={p.activo}
              onNavigate={() => navigate(`/personas/${p.personaId}`)}
            />
          ))}
        </RelationSection>

        <RelationSection title="Puestos que incluyen esta tarea" count={puestos.length} empty="Ningún puesto asociado">
          {puestos.map((p: any) => (
            <RelationRow
              key={p.puestoId}
              code={p.codigoPuesto}
              label={p.puesto}
              sublabel={p.area}
              activo={p.activo}
              onNavigate={() => navigate(`/puestos/${p.puestoId}`)}
            />
          ))}
        </RelationSection>
      </div>

      {/* Modal edición */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar tarea"
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
            <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{tarea.codigoTarea}</span>
            <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tarea *</label>
              <textarea className="input-base resize-none" rows={3} value={form.tarea} onChange={e => f("tarea", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Criticidad</label>
              <select className="input-base" value={form.criticidad} onChange={e => f("criticidad", Number(e.target.value))}>
                <option value={4}>4 – Crítica</option>
                <option value={3}>3 – Alta</option>
                <option value={2}>2 – Media</option>
                <option value={1}>1 – Baja</option>
                <option value={0}>0 – Sin definir</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Toggle checked={form.estrategico} onChange={v => f("estrategico", v)} label="Estratégico" />
            <Toggle checked={form.dificilmenteAdquirible} onChange={v => f("dificilmenteAdquirible", v)} label="Difícilmente adquirible" />
            <Toggle checked={form.problemasLegales} onChange={v => f("problemasLegales", v)} label="Problemas legales" />
            <Toggle checked={form.documentado} onChange={v => f("documentado", v)} label="Documentado" />
            <Toggle checked={form.activo} onChange={v => f("activo", v)} label="Activo" />
          </div>
        </div>
      </Modal>
    </div>
  );
}