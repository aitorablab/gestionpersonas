import { useState, useEffect } from "react";
import { Plus, Pencil, PowerOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Responsabilidad } from "../types";
import { responsabilidadesApi } from "../api";
import { mockResponsabilidades } from "../data/mockData";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import PageHeader from "../components/ui/PageHeader";
import { SearchBar, FilterTabs } from "../components/ui/SearchFilter";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { useRole } from "../hooks/useAppContext";
import CopiarDe from "../components/ui/CopiarDe";


type ResponsabilidadForm = Omit<Responsabilidad, "responsabilidadId" | "codigoResponsabilidad">;

const EMPTY: ResponsabilidadForm = { responsabilidad: "", activo: true };

export default function ResponsabilidadesPage() {
  const { canCreate, canEdit, canDeactivate } = useRole();
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useFetch(responsabilidadesApi.getAll, mockResponsabilidades);
  const { saving, error: saveError, run } = useSaving();
  const [data, setData] = useState<Responsabilidad[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "activo" | "inactivo">("activo");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Responsabilidad | null>(null);
  const [form, setForm] = useState<ResponsabilidadForm>(EMPTY);

  useEffect(() => { if (apiData) setData(apiData); }, [apiData]);

  const filtered = data.filter(r => {
    const matchSearch = r.responsabilidad.toLowerCase().includes(search.toLowerCase())
      || r.codigoResponsabilidad.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || (filter === "activo" ? r.activo : !r.activo);
    return matchSearch && matchFilter;
  });

  const counts = { todos: data.length, activo: data.filter(r => r.activo).length, inactivo: data.filter(r => !r.activo).length };

  function openNew() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(r: Responsabilidad) {
    setEditing(r);
    setForm({ responsabilidad: r.responsabilidad, activo: r.activo });
    setModalOpen(true);
  }

  async function handleSave() {
    const ok = await run(async () => {
      if (editing) {
        await responsabilidadesApi.update(editing.responsabilidadId, { ...form, codigoResponsabilidad: editing.codigoResponsabilidad });
        setData(d => d.map(r => r.responsabilidadId === editing.responsabilidadId ? { ...r, ...form } : r));
      } else {
        const res = await responsabilidadesApi.create({ ...form, codigoResponsabilidad: "" });
        const newId = res.data?.responsabilidadId ?? Date.now();
        const newCodigo = res.data?.codigoResponsabilidad ?? "";
        setData(d => [...d, { responsabilidadId: newId, codigoResponsabilidad: newCodigo, ...form }]);
      }
    });
    if (ok) setModalOpen(false);
  }

  async function toggleActivo(r: Responsabilidad) {
    const newActivo = !r.activo;
    await run(() => responsabilidadesApi.setActivo(r.responsabilidadId, newActivo));
    setData(d => d.map(x => x.responsabilidadId === r.responsabilidadId ? { ...x, activo: newActivo } : x));
  }

  const f = (field: keyof ResponsabilidadForm, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Responsabilidades"
        subtitle={`${counts.activo} activas · ${counts.inactivo} inactivas`}
        action={canCreate && (
          <button className="btn-primary" onClick={openNew}><Plus size={15} />Nueva responsabilidad</button>
        )}
      />
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar responsabilidades..." />
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Responsabilidad</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">No se encontraron responsabilidades</td></tr>
              )}
              {filtered.map(r => (
                <tr
  key={r.responsabilidadId}
  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
  onClick={() => navigate(`/responsabilidades/${r.responsabilidadId}`)}>
                  <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500 dark:text-slate-400">{r.codigoResponsabilidad}</span></td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{r.responsabilidad}</td>
                  <td className="px-5 py-3.5"><span className={r.activo ? "badge-green" : "badge-slate"}>{r.activo ? "Activo" : "Inactivo"}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {canEdit && <button className="btn-ghost" onClick={e => { e.stopPropagation(); openEdit(r); }}
><Pencil size={13} /></button>}
                      {canDeactivate && (
                        <button className={`btn-ghost ${r.activo ? "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
                          onClick={e => { e.stopPropagation(); toggleActivo(r); }}><PowerOff size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar responsabilidad" : "Nueva responsabilidad"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Guardar cambios" : "Crear"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
  <CopiarDe
    items={data.filter(r => r.activo)}
    getId={r => r.responsabilidadId}
    getLabel={r => r.responsabilidad}
    getSublabel={r => r.codigoResponsabilidad}
    placeholder="Buscar responsabilidad..."
    onCopiar={r => setForm({
      responsabilidad: r.responsabilidad,
      activo: true,
    })}
  />
)}
          {saveError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveError}</p>}
          {editing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-xs text-slate-400">Código</span>
              <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{editing.codigoResponsabilidad}</span>
              <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Responsabilidad *</label>
            <textarea className="input-base resize-none" rows={3} value={form.responsabilidad} onChange={e => f("responsabilidad", e.target.value)} placeholder="Descripción de la responsabilidad..." />
          </div>
          <Toggle checked={form.activo} onChange={v => f("activo", v)} label="Activo" />
        </div>
      </Modal>
    </div>
  );
}
