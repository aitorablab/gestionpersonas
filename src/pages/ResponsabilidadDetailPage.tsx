import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import type { Responsabilidad } from "../types";
import { responsabilidadesApi } from "../api";
import { responsabilidadDetailApi } from "../api/relations";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import { useRole } from "../hooks/useAppContext";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { RelationSection, RelationRow } from "../components/relations";
import { mockResponsabilidades, mockPersonaResponsabilidadesAsignadas, mockPersonas, mockPuestoResponsabilidades, mockPuestos } from "../data/mockData";

export default function ResponsabilidadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const respId = Number(id);
  const navigate = useNavigate();
  const { canEdit } = useRole();

  const mockResp = mockResponsabilidades.find(r => r.responsabilidadId === respId);

  const mockPersonasFallback = mockPersonaResponsabilidadesAsignadas
    .filter(pra => pra.responsabilidadId === respId && pra.activo)
    .map(pra => {
      const p = mockPersonas.find(p => p.personaId === pra.personaId);
      return p ? { personaId: p.personaId, codigoPersona: p.codigoPersona, nombreCompleto: p.nombreCompleto, alias: p.alias, esLider: p.esLider, activo: p.activo, motivoAsignacion: pra.motivoAsignacion } : null;
    }).filter(Boolean);

  const mockPuestosFallback = mockPuestoResponsabilidades
    .filter(pr => pr.responsabilidadId === respId && pr.activo)
    .map(pr => {
      const p = mockPuestos.find(p => p.puestoId === pr.puestoId);
      return p ? { puestoId: p.puestoId, codigoPuesto: p.codigoPuesto, puesto: p.puesto, area: p.area, activo: pr.activo } : null;
    }).filter(Boolean);

  const respFetch     = useFetch(() => responsabilidadesApi.getAll().then(list => list.find(r => r.responsabilidadId === respId) as Responsabilidad), mockResp);
  const personasFetch = useFetch(() => responsabilidadDetailApi.personas(respId), mockPersonasFallback as any);
  const puestosFetch  = useFetch(() => responsabilidadDetailApi.puestos(respId), mockPuestosFallback as any);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ responsabilidad: "", activo: true });
  const { saving, error: saveError, run } = useSaving();
  const [resp, setResp] = useState<Responsabilidad | null>(null);

  useEffect(() => {
    if (respFetch.data) {
      const r = respFetch.data as Responsabilidad;
      setResp(r);
      setForm({ responsabilidad: r.responsabilidad, activo: r.activo });
    }
  }, [respFetch.data]);

  async function handleSave() {
    if (!resp) return;
    const ok = await run(async () => {
      await responsabilidadesApi.update(resp.responsabilidadId, { ...form, codigoResponsabilidad: resp.codigoResponsabilidad });
      setResp(prev => prev ? { ...prev, ...form } : prev);
    });
    if (ok) setModalOpen(false);
  }

  if (respFetch.loading) return <LoadingSpinner />;
  if (!resp) return <ErrorState message="Responsabilidad no encontrada" onRetry={respFetch.refetch} />;

  const personas = (personasFetch.data ?? []) as any[];
  const puestos  = (puestosFetch.data ?? []) as any[];

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft size={14} />Volver
      </button>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{resp.codigoResponsabilidad}</span>
              <span className={resp.activo ? "badge-green" : "badge-slate"}>{resp.activo ? "Activo" : "Inactivo"}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resp.responsabilidad}</h1>
          </div>
          {canEdit && (
            <button className="btn-secondary flex-shrink-0" onClick={() => setModalOpen(true)}>
              <Pencil size={14} />Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RelationSection title="Personas con esta responsabilidad" count={personas.length} empty="Ninguna persona asignada">
          {personas.map((p: any) => (
            <RelationRow
              key={p.personaId}
              code={p.codigoPersona}
              label={p.nombreCompleto}
              sublabel={p.motivoAsignacion ?? undefined}
              activo={p.activo}
              onNavigate={() => navigate(`/personas/${p.personaId}`)}
            />
          ))}
        </RelationSection>

        <RelationSection title="Puestos con esta responsabilidad" count={puestos.length} empty="Ningún puesto asociado">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar responsabilidad"
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
            <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{resp.codigoResponsabilidad}</span>
            <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Responsabilidad *</label>
            <textarea className="input-base resize-none" rows={3} value={form.responsabilidad}
              onChange={e => setForm(p => ({ ...p, responsabilidad: e.target.value }))} />
          </div>
          <Toggle checked={form.activo} onChange={v => setForm(p => ({ ...p, activo: v }))} label="Activo" />
        </div>
      </Modal>
    </div>
  );
}