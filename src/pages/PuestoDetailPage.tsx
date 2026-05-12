import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2, Pencil } from "lucide-react";
import type { Puesto } from "../types";
import type { PuestoTarea, PuestoResponsabilidad, PuestoCompetencia } from "../types/relations";
import { puestosApi, tareasApi, responsabilidadesApi, competenciasApi } from "../api";
import { puestoTareasApi, puestoResponsabilidadesApi, puestoCompetenciasApi } from "../api/relations";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import { useRole } from "../hooks/useAppContext";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { TabBar, RelationSection, RelationRow, SearchSelect, CriticidadBadge, NivelSelector } from "../components/relations";
import {
  mockPuestos, mockTareas, mockResponsabilidades, mockCompetencias,
  mockPuestoTareas, mockPuestoResponsabilidades, mockPuestoCompetencias
} from "../data/mockData";

type Tab = "tareas" | "responsabilidades" | "competencias";

export default function PuestoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const puestoId = Number(id);
  const navigate = useNavigate();
  const { canCreate, canEdit, canDeactivate } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>("tareas");

  const puestoFetch = useFetch(
    () => puestosApi.getAll().then(list => list.find(p => p.puestoId === puestoId) as Puesto),
    mockPuestos.find(p => p.puestoId === puestoId)
  );
  const tareasFetch = useFetch(
    () => puestoTareasApi.getAll(puestoId),
    mockPuestoTareas.filter(t => t.puestoId === puestoId)
  );
  const respFetch = useFetch(
    () => puestoResponsabilidadesApi.getAll(puestoId),
    mockPuestoResponsabilidades.filter(r => r.puestoId === puestoId)
  );
  const compFetch = useFetch(
    () => puestoCompetenciasApi.getAll(puestoId),
    mockPuestoCompetencias.filter(c => c.puestoId === puestoId)
  );

  const allTareas = useFetch(tareasApi.getAll, mockTareas);
  const allResp = useFetch(responsabilidadesApi.getAll, mockResponsabilidades);
  const allComp = useFetch(competenciasApi.getAll, mockCompetencias);

  const [tareas, setTareas] = useState<PuestoTarea[]>([]);
  const [responsabilidades, setResponsabilidades] = useState<PuestoResponsabilidad[]>([]);
  const [competencias, setCompetencias] = useState<PuestoCompetencia[]>([]);

  useEffect(() => { if (tareasFetch.data) setTareas(tareasFetch.data); }, [tareasFetch.data]);
  useEffect(() => { if (respFetch.data) setResponsabilidades(respFetch.data); }, [respFetch.data]);
  useEffect(() => { if (compFetch.data) setCompetencias(compFetch.data); }, [compFetch.data]);

  const [modalTarea, setModalTarea] = useState(false);
  const [selTarea, setSelTarea] = useState<number | null>(null);
  const saveTarea = useSaving();

  async function addTarea() {
    if (!selTarea) return;
    const ok = await saveTarea.run(async () => {
      const res = await puestoTareasApi.add(puestoId, selTarea);
      const t = allTareas.data?.find(t => t.tareaId === selTarea);
      if (t) {
        setTareas(prev => [...prev, {
          puestoTareaId: res.data?.puestoTareaId ?? Date.now(),
          puestoId, tareaId: selTarea,
          codigoTarea: t.codigoTarea, tarea: t.tarea, criticidad: t.criticidad,
          estrategico: t.estrategico, dificilmenteAdquirible: t.dificilmenteAdquirible, activo: true,
        }]);
      }
    });
    if (ok) { setModalTarea(false); setSelTarea(null); }
  }

  async function desactivarTarea(relacionId: number) {
    await saveTarea.run(() => puestoTareasApi.desactivar(puestoId, relacionId));
    setTareas(prev => prev.map(t => t.puestoTareaId === relacionId ? { ...t, activo: false } : t));
  }

  const [modalResp, setModalResp] = useState(false);
  const [selResp, setSelResp] = useState<number | null>(null);
  const saveResp = useSaving();

  async function addResp() {
    if (!selResp) return;
    const ok = await saveResp.run(async () => {
      const res = await puestoResponsabilidadesApi.add(puestoId, selResp);
      const r = allResp.data?.find(r => r.responsabilidadId === selResp);
      if (r) {
        setResponsabilidades(prev => [...prev, {
          puestoResponsabilidadId: res.data?.puestoResponsabilidadId ?? Date.now(),
          puestoId, responsabilidadId: selResp,
          codigoResponsabilidad: r.codigoResponsabilidad,
          responsabilidad: r.responsabilidad, activo: true,
        }]);
      }
    });
    if (ok) { setModalResp(false); setSelResp(null); }
  }

  async function desactivarResp(relacionId: number) {
    await saveResp.run(() => puestoResponsabilidadesApi.desactivar(puestoId, relacionId));
    setResponsabilidades(prev => prev.map(r => r.puestoResponsabilidadId === relacionId ? { ...r, activo: false } : r));
  }

  const [modalComp, setModalComp] = useState(false);
  const [editComp, setEditComp] = useState<PuestoCompetencia | null>(null);
  const [selComp, setSelComp] = useState<number | null>(null);
  const [nivelMin, setNivelMin] = useState(2);
  const [nivelConv, setNivelConv] = useState(3);
  const [requerida, setRequerida] = useState(true);
  const saveComp = useSaving();

  function openAddComp() { setEditComp(null); setSelComp(null); setNivelMin(2); setNivelConv(3); setRequerida(true); setModalComp(true); }
  function openEditComp(c: PuestoCompetencia) {
    setEditComp(c); setSelComp(c.competenciaId);
    setNivelMin(c.nivelMinimo); setNivelConv(c.nivelConveniente); setRequerida(c.requeridaYN);
    setModalComp(true);
  }

  async function saveCompetencia() {
    if (!selComp) return;
    const dto = { competenciaId: selComp, nivelMinimo: nivelMin, nivelConveniente: nivelConv, requeridaYN: requerida };
    const ok = await saveComp.run(async () => {
      if (editComp) {
        await puestoCompetenciasApi.update(puestoId, editComp.puestoCompetenciaId, dto);
        setCompetencias(prev => prev.map(c => c.puestoCompetenciaId === editComp.puestoCompetenciaId
          ? { ...c, nivelMinimo: nivelMin, nivelConveniente: nivelConv, requeridaYN: requerida } : c));
      } else {
        const res = await puestoCompetenciasApi.add(puestoId, dto);
        const comp = allComp.data?.find(c => c.competenciaId === selComp);
        if (comp) {
          setCompetencias(prev => [...prev, {
            puestoCompetenciaId: res.data?.puestoCompetenciaId ?? Date.now(),
            puestoId, competenciaId: selComp,
            codigoCompetencia: comp.codigoCompetencia, competencia: comp.competencia,
            tipoCompetencia: comp.tipoCompetencia,
            nivelMinimo: nivelMin, nivelConveniente: nivelConv, requeridaYN: requerida, activo: true,
          }]);
        }
      }
    });
    if (ok) { setModalComp(false); setEditComp(null); setSelComp(null); }
  }

  async function desactivarComp(relacionId: number) {
    await saveComp.run(() => puestoCompetenciasApi.desactivar(puestoId, relacionId));
    setCompetencias(prev => prev.map(c => c.puestoCompetenciaId === relacionId ? { ...c, activo: false } : c));
  }

  if (puestoFetch.loading) return <LoadingSpinner />;
  if (puestoFetch.error || !puestoFetch.data) return <ErrorState message="Puesto no encontrado" onRetry={puestoFetch.refetch} />;

  const puesto = puestoFetch.data as Puesto;
  const tareasActivas = tareas.filter(t => t.activo);
  const respActivas = responsabilidades.filter(r => r.activo);
  const compActivas = competencias.filter(c => c.activo);

  const tabs = [
    { key: "tareas", label: "Tareas", count: tareasActivas.length },
    { key: "responsabilidades", label: "Responsabilidades", count: respActivas.length },
    { key: "competencias", label: "Competencias", count: compActivas.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => navigate("/puestos")} className="btn-ghost mb-4 -ml-2">
          <ArrowLeft size={14} />Volver a puestos
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{puesto.codigoPuesto}</span>
            <span className={puesto.activo ? "badge-green" : "badge-slate"}>{puesto.activo ? "Activo" : "Inactivo"}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{puesto.puesto}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
            {puesto.area && <span>{puesto.area}</span>}
            {puesto.divisionFuncional && <><span className="text-slate-300">·</span><span>{puesto.divisionFuncional}</span></>}
            {puesto.grupoConvenio && <><span className="text-slate-300">·</span><span>{puesto.grupoConvenio}</span></>}
          </div>
          {puesto.mision && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">{puesto.mision}</p>}
        </div>
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={k => setActiveTab(k as Tab)} />

      {activeTab === "tareas" && (
        <RelationSection title="Tareas del puesto" count={tareas.length} empty="Sin tareas asociadas"
          action={canCreate && (
            <button className="btn-primary" onClick={() => setModalTarea(true)}><Plus size={13} />Añadir tarea</button>
          )}
        >
          {tareas.map(t => (
            <RelationRow
              key={t.puestoTareaId}
              code={t.codigoTarea} label={t.tarea}
              badge={<CriticidadBadge nivel={t.criticidad} />}
              activo={t.activo} canEdit={canDeactivate}
              onDesactivar={() => desactivarTarea(t.puestoTareaId)}
              onNavigate={() => navigate(`/tareas/${t.tareaId}`)}
            />
          ))}
        </RelationSection>
      )}

      {activeTab === "responsabilidades" && (
        <RelationSection title="Responsabilidades del puesto" count={responsabilidades.length} empty="Sin responsabilidades asociadas"
          action={canCreate && (
            <button className="btn-primary" onClick={() => setModalResp(true)}><Plus size={13} />Añadir responsabilidad</button>
          )}
        >
          {responsabilidades.map(r => (
            <RelationRow
              key={r.puestoResponsabilidadId}
              code={r.codigoResponsabilidad} label={r.responsabilidad}
              activo={r.activo} canEdit={canDeactivate}
              onDesactivar={() => desactivarResp(r.puestoResponsabilidadId)}
              onNavigate={() => navigate(`/responsabilidades/${r.responsabilidadId}`)}
            />
          ))}
        </RelationSection>
      )}

      {activeTab === "competencias" && (
        <RelationSection title="Competencias requeridas" count={competencias.length} empty="Sin competencias asociadas"
          action={canCreate && (
            <button className="btn-primary" onClick={openAddComp}><Plus size={13} />Añadir competencia</button>
          )}
        >
          {competencias.map(c => (
            <RelationRow
              key={c.puestoCompetenciaId}
              code={c.codigoCompetencia} label={c.competencia} sublabel={c.tipoCompetencia}
              activo={c.activo} canEdit={canDeactivate}
              onDesactivar={() => desactivarComp(c.puestoCompetenciaId)}
              onNavigate={() => navigate(`/competencias/${c.competenciaId}`)}
              badge={
                <div className="flex items-center gap-2">
                  {c.requeridaYN && <span className="badge badge-red">Requerida</span>}
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Mín: <span className="font-semibold text-slate-600 dark:text-slate-300">{c.nivelMinimo}</span></p>
                    <p className="text-[10px] text-slate-400">Conv: <span className="font-semibold text-slate-600 dark:text-slate-300">{c.nivelConveniente}</span></p>
                  </div>
                </div>
              }
              extra={canEdit && c.activo ? (
                <button className="btn-ghost" onClick={e => { e.stopPropagation(); openEditComp(c); }}><Pencil size={12} /></button>
              ) : undefined}
            />
          ))}
        </RelationSection>
      )}

      <Modal open={modalTarea} onClose={() => setModalTarea(false)} title="Añadir tarea al puesto"
        footer={<><button className="btn-secondary" onClick={() => setModalTarea(false)}>Cancelar</button><button className="btn-primary" onClick={addTarea} disabled={!selTarea || saveTarea.saving}>{saveTarea.saving && <Loader2 size={13} className="animate-spin" />}Añadir</button></>}
      >
        <div className="space-y-4">
          {saveTarea.error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveTarea.error}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tarea *</label>
            <SearchSelect options={(allTareas.data ?? []).filter(t => t.activo).map(t => ({ id: t.tareaId, label: t.tarea, sublabel: t.codigoTarea }))} value={selTarea} onChange={setSelTarea} placeholder="Buscar tarea..." excluded={tareasActivas.map(t => t.tareaId)} />
          </div>
        </div>
      </Modal>

      <Modal open={modalResp} onClose={() => setModalResp(false)} title="Añadir responsabilidad al puesto"
        footer={<><button className="btn-secondary" onClick={() => setModalResp(false)}>Cancelar</button><button className="btn-primary" onClick={addResp} disabled={!selResp || saveResp.saving}>{saveResp.saving && <Loader2 size={13} className="animate-spin" />}Añadir</button></>}
      >
        <div className="space-y-4">
          {saveResp.error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveResp.error}</p>}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Responsabilidad *</label>
            <SearchSelect options={(allResp.data ?? []).filter(r => r.activo).map(r => ({ id: r.responsabilidadId, label: r.responsabilidad, sublabel: r.codigoResponsabilidad }))} value={selResp} onChange={setSelResp} placeholder="Buscar responsabilidad..." excluded={respActivas.map(r => r.responsabilidadId)} />
          </div>
        </div>
      </Modal>

      <Modal open={modalComp} onClose={() => setModalComp(false)} title={editComp ? "Editar competencia" : "Añadir competencia al puesto"}
        footer={<><button className="btn-secondary" onClick={() => setModalComp(false)}>Cancelar</button><button className="btn-primary" onClick={saveCompetencia} disabled={!selComp || saveComp.saving}>{saveComp.saving && <Loader2 size={13} className="animate-spin" />}{editComp ? "Guardar" : "Añadir"}</button></>}
      >
        <div className="space-y-5">
          {saveComp.error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveComp.error}</p>}
          {!editComp && (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Competencia *</label>
              <SearchSelect options={(allComp.data ?? []).filter(c => c.activo).map(c => ({ id: c.competenciaId, label: c.competencia, sublabel: c.tipoCompetencia }))} value={selComp} onChange={setSelComp} placeholder="Buscar competencia..." excluded={compActivas.map(c => c.competenciaId)} />
            </div>
          )}
          {editComp && (
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{editComp.competencia}</p>
              <p className="text-[10px] text-slate-400">{editComp.tipoCompetencia}</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Nivel mínimo</label>
            <NivelSelector value={nivelMin} onChange={setNivelMin} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Nivel conveniente</label>
            <NivelSelector value={nivelConv} onChange={setNivelConv} />
          </div>
          <Toggle checked={requerida} onChange={setRequerida} label="Competencia requerida para el puesto" />
        </div>
      </Modal>
    </div>
  );
}