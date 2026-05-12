import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Crown, Loader2 } from "lucide-react";
import type { Persona } from "../types";
import type { PersonaPuesto, PersonaTareaAsignada, PersonaResponsabilidadAsignada } from "../types/relations";
import { personasApi, puestosApi, tareasApi, responsabilidadesApi } from "../api";
import { personaPuestosApi, personaTareasApi, personaResponsabilidadesApi } from "../api/relations";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import { useRole } from "../hooks/useAppContext";
import Modal from "../components/ui/Modal";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { TabBar, RelationSection, RelationRow, SearchSelect, CriticidadBadge } from "../components/relations";
import {
  mockPersonas, mockPuestos, mockTareas, mockResponsabilidades,
  mockPersonaPuestos, mockPersonaTareasAsignadas, mockPersonaResponsabilidadesAsignadas
} from "../data/mockData";

type Tab = "puestos" | "tareas" | "responsabilidades";

export default function PersonaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const personaId = Number(id);
  const navigate = useNavigate();
  const { canCreate, canDeactivate } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>("puestos");

  const personaFetch = useFetch(
    () => personasApi.getAll().then(list => list.find(p => p.personaId === personaId) as Persona),
    mockPersonas.find(p => p.personaId === personaId)
  );
  const puestosFetch = useFetch(
    () => personaPuestosApi.getAll(personaId),
    mockPersonaPuestos.filter(p => p.personaId === personaId)
  );
  const tareasFetch = useFetch(
    () => personaTareasApi.getAll(personaId),
    mockPersonaTareasAsignadas.filter(t => t.personaId === personaId)
  );
  const respFetch = useFetch(
    () => personaResponsabilidadesApi.getAll(personaId),
    mockPersonaResponsabilidadesAsignadas.filter(r => r.personaId === personaId)
  );

  const allPuestos = useFetch(puestosApi.getAll, mockPuestos);
  const allTareas = useFetch(tareasApi.getAll, mockTareas);
  const allResp = useFetch(responsabilidadesApi.getAll, mockResponsabilidades);

  const [puestos, setPuestos] = useState<PersonaPuesto[]>([]);
  const [tareas, setTareas] = useState<PersonaTareaAsignada[]>([]);
  const [responsabilidades, setResponsabilidades] = useState<PersonaResponsabilidadAsignada[]>([]);

  useEffect(() => { if (puestosFetch.data) setPuestos(puestosFetch.data); }, [puestosFetch.data]);
  useEffect(() => { if (tareasFetch.data) setTareas(tareasFetch.data); }, [tareasFetch.data]);
  useEffect(() => { if (respFetch.data) setResponsabilidades(respFetch.data); }, [respFetch.data]);

  const [modalPuesto, setModalPuesto] = useState(false);
  const [selPuesto, setSelPuesto] = useState<number | null>(null);
  const [obsPuesto, setObsPuesto] = useState("");
  const savePuesto = useSaving();

  async function addPuesto() {
    if (!selPuesto) return;
    const ok = await savePuesto.run(async () => {
      const res = await personaPuestosApi.add(personaId, { puestoId: selPuesto, observaciones: obsPuesto || null, fechaInicio: null, fechaFin: null });
      const puesto = allPuestos.data?.find(p => p.puestoId === selPuesto);
      if (puesto) {
        setPuestos(prev => [...prev, {
          personaPuestoId: res.data?.personaPuestoId ?? Date.now(),
          personaId, puestoId: selPuesto,
          codigoPuesto: puesto.codigoPuesto, puesto: puesto.puesto, area: puesto.area,
          fechaInicio: null, fechaFin: null, activo: true, observaciones: obsPuesto || null,
        }]);
      }
    });
    if (ok) { setModalPuesto(false); setSelPuesto(null); setObsPuesto(""); }
  }

  async function desactivarPuesto(relacionId: number) {
    await savePuesto.run(() => personaPuestosApi.desactivar(personaId, relacionId));
    setPuestos(prev => prev.map(p => p.personaPuestoId === relacionId ? { ...p, activo: false } : p));
  }

  const [modalTarea, setModalTarea] = useState(false);
  const [selTarea, setSelTarea] = useState<number | null>(null);
  const [motivoTarea, setMotivoTarea] = useState("");
  const saveTarea = useSaving();

  async function addTarea() {
    if (!selTarea) return;
    const ok = await saveTarea.run(async () => {
      const res = await personaTareasApi.add(personaId, { tareaId: selTarea, motivoAsignacion: motivoTarea || null, fechaInicio: null, fechaFin: null, observaciones: null });
      const t = allTareas.data?.find(t => t.tareaId === selTarea);
      if (t) {
        setTareas(prev => [...prev, {
          personaTareaAsignadaId: res.data?.personaTareaAsignadaId ?? Date.now(),
          personaId, tareaId: selTarea,
          codigoTarea: t.codigoTarea, tarea: t.tarea, criticidad: t.criticidad,
          motivoAsignacion: motivoTarea || null,
          fechaInicio: null, fechaFin: null, activo: true, observaciones: null,
        }]);
      }
    });
    if (ok) { setModalTarea(false); setSelTarea(null); setMotivoTarea(""); }
  }

  async function desactivarTarea(relacionId: number) {
    await saveTarea.run(() => personaTareasApi.desactivar(personaId, relacionId));
    setTareas(prev => prev.map(t => t.personaTareaAsignadaId === relacionId ? { ...t, activo: false } : t));
  }

  const [modalResp, setModalResp] = useState(false);
  const [selResp, setSelResp] = useState<number | null>(null);
  const [motivoResp, setMotivoResp] = useState("");
  const saveResp = useSaving();

  async function addResp() {
    if (!selResp) return;
    const ok = await saveResp.run(async () => {
      const res = await personaResponsabilidadesApi.add(personaId, { responsabilidadId: selResp, motivoAsignacion: motivoResp || null, fechaInicio: null, observaciones: null });
      const r = allResp.data?.find(r => r.responsabilidadId === selResp);
      if (r) {
        setResponsabilidades(prev => [...prev, {
          personaResponsabilidadAsignadaId: res.data?.personaResponsabilidadAsignadaId ?? Date.now(),
          personaId, responsabilidadId: selResp,
          codigoResponsabilidad: r.codigoResponsabilidad, responsabilidad: r.responsabilidad,
          motivoAsignacion: motivoResp || null,
          fechaInicio: null, fechaFin: null, activo: true, observaciones: null,
        }]);
      }
    });
    if (ok) { setModalResp(false); setSelResp(null); setMotivoResp(""); }
  }

  async function desactivarResp(relacionId: number) {
    await saveResp.run(() => personaResponsabilidadesApi.desactivar(personaId, relacionId));
    setResponsabilidades(prev => prev.map(r => r.personaResponsabilidadAsignadaId === relacionId ? { ...r, activo: false } : r));
  }

  if (personaFetch.loading) return <LoadingSpinner />;
  if (personaFetch.error || !personaFetch.data) return <ErrorState message="Persona no encontrada" onRetry={personaFetch.refetch} />;

  const persona = personaFetch.data as Persona;
  const puestosActivos = puestos.filter(p => p.activo);
  const tareasActivas = tareas.filter(t => t.activo);
  const respActivas = responsabilidades.filter(r => r.activo);

  const tabs = [
    { key: "puestos", label: "Puestos", count: puestosActivos.length },
    { key: "tareas", label: "Tareas específicas", count: tareasActivas.length },
    { key: "responsabilidades", label: "Responsabilidades", count: respActivas.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate("/personas")} className="btn-ghost mb-4 -ml-2">
          <ArrowLeft size={14} />Volver a personas
        </button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-mint-700 dark:text-mint-400">{persona.nombreCompleto.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{persona.nombreCompleto}</h1>
              {persona.esLider && <span className="badge badge-yellow"><Crown size={10} className="mr-1" />Líder</span>}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-xs text-slate-400">{persona.codigoPersona}</span>
              {persona.alias && <span className="text-sm text-slate-500">{persona.alias}</span>}
              {persona.email && <span className="text-sm text-slate-500">{persona.email}</span>}
              <span className={persona.activo ? "badge-green" : "badge-slate"}>{persona.activo ? "Activo" : "Inactivo"}</span>
            </div>
          </div>
        </div>
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={k => setActiveTab(k as Tab)} />

      {activeTab === "puestos" && (
        <RelationSection title="Puestos asignados" count={puestos.length} empty="Esta persona no tiene puestos asignados"
          action={canCreate && (
            <button className="btn-primary" onClick={() => setModalPuesto(true)}><Plus size={13} />Añadir puesto</button>
          )}
        >
          {puestos.map(p => (
            <RelationRow
              key={p.personaPuestoId}
              code={p.codigoPuesto} label={p.puesto} sublabel={p.area}
              activo={p.activo} canEdit={canDeactivate}
              onDesactivar={() => desactivarPuesto(p.personaPuestoId)}
              onNavigate={() => navigate(`/puestos/${p.puestoId}`)}
            />
          ))}
        </RelationSection>
      )}

      {activeTab === "tareas" && (
        <RelationSection title="Tareas asignadas directamente" count={tareas.length} empty="Sin tareas específicas asignadas"
          action={canCreate && (
            <button className="btn-primary" onClick={() => setModalTarea(true)}><Plus size={13} />Añadir tarea</button>
          )}
        >
          {tareas.map(t => (
            <RelationRow
              key={t.personaTareaAsignadaId}
              code={t.codigoTarea} label={t.tarea} sublabel={t.motivoAsignacion ?? undefined}
              badge={<CriticidadBadge nivel={t.criticidad} />}
              activo={t.activo} canEdit={canDeactivate}
              onDesactivar={() => desactivarTarea(t.personaTareaAsignadaId)}
              onNavigate={() => navigate(`/tareas/${t.tareaId}`)}
            />
          ))}
        </RelationSection>
      )}

      {activeTab === "responsabilidades" && (
        <RelationSection title="Responsabilidades asignadas directamente" count={responsabilidades.length} empty="Sin responsabilidades específicas asignadas"
          action={canCreate && (
            <button className="btn-primary" onClick={() => setModalResp(true)}><Plus size={13} />Añadir responsabilidad</button>
          )}
        >
          {responsabilidades.map(r => (
            <RelationRow
              key={r.personaResponsabilidadAsignadaId}
              code={r.codigoResponsabilidad} label={r.responsabilidad} sublabel={r.motivoAsignacion ?? undefined}
              activo={r.activo} canEdit={canDeactivate}
              onDesactivar={() => desactivarResp(r.personaResponsabilidadAsignadaId)}
              onNavigate={() => navigate(`/responsabilidades/${r.responsabilidadId}`)}
            />
          ))}
        </RelationSection>
      )}

      <Modal open={modalPuesto} onClose={() => setModalPuesto(false)} title="Añadir puesto"
        footer={<><button className="btn-secondary" onClick={() => setModalPuesto(false)}>Cancelar</button><button className="btn-primary" onClick={addPuesto} disabled={!selPuesto || savePuesto.saving}>{savePuesto.saving && <Loader2 size={13} className="animate-spin" />}Añadir</button></>}
      >
        <div className="space-y-4">
          {savePuesto.error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{savePuesto.error}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Puesto *</label>
            <SearchSelect options={(allPuestos.data ?? []).filter(p => p.activo).map(p => ({ id: p.puestoId, label: p.puesto, sublabel: p.area }))} value={selPuesto} onChange={setSelPuesto} placeholder="Buscar puesto..." excluded={puestosActivos.map(p => p.puestoId)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Observaciones</label>
            <textarea className="input-base resize-none" rows={2} value={obsPuesto} onChange={e => setObsPuesto(e.target.value)} placeholder="Opcional..." />
          </div>
        </div>
      </Modal>

      <Modal open={modalTarea} onClose={() => setModalTarea(false)} title="Añadir tarea específica"
        footer={<><button className="btn-secondary" onClick={() => setModalTarea(false)}>Cancelar</button><button className="btn-primary" onClick={addTarea} disabled={!selTarea || saveTarea.saving}>{saveTarea.saving && <Loader2 size={13} className="animate-spin" />}Añadir</button></>}
      >
        <div className="space-y-4">
          {saveTarea.error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveTarea.error}</p>}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs text-amber-700 dark:text-amber-400">Estas son tareas asignadas <strong>directamente</strong> a la persona, independientes de su puesto.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tarea *</label>
            <SearchSelect options={(allTareas.data ?? []).filter(t => t.activo).map(t => ({ id: t.tareaId, label: t.tarea, sublabel: t.codigoTarea }))} value={selTarea} onChange={setSelTarea} placeholder="Buscar tarea..." excluded={tareasActivas.map(t => t.tareaId)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Motivo de asignación</label>
            <textarea className="input-base resize-none" rows={2} value={motivoTarea} onChange={e => setMotivoTarea(e.target.value)} placeholder="Por qué se asigna esta tarea..." />
          </div>
        </div>
      </Modal>

      <Modal open={modalResp} onClose={() => setModalResp(false)} title="Añadir responsabilidad específica"
        footer={<><button className="btn-secondary" onClick={() => setModalResp(false)}>Cancelar</button><button className="btn-primary" onClick={addResp} disabled={!selResp || saveResp.saving}>{saveResp.saving && <Loader2 size={13} className="animate-spin" />}Añadir</button></>}
      >
        <div className="space-y-4">
          {saveResp.error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveResp.error}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Responsabilidad *</label>
            <SearchSelect options={(allResp.data ?? []).filter(r => r.activo).map(r => ({ id: r.responsabilidadId, label: r.responsabilidad, sublabel: r.codigoResponsabilidad }))} value={selResp} onChange={setSelResp} placeholder="Buscar responsabilidad..." excluded={respActivas.map(r => r.responsabilidadId)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Motivo</label>
            <textarea className="input-base resize-none" rows={2} value={motivoResp} onChange={e => setMotivoResp(e.target.value)} placeholder="Motivo de asignación..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}