import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, PowerOff, Check, X, Loader2 } from "lucide-react";
import type { Tarea } from "../types";
import { tareasApi } from "../api";
import { mockTareas } from "../data/mockData";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import PageHeader from "../components/ui/PageHeader";
import { SearchBar, FilterTabs } from "../components/ui/SearchFilter";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { useRole } from "../hooks/useAppContext";
import CopiarDe from "../components/ui/CopiarDe";


type TareaForm = Omit<Tarea, "tareaId" | "codigoTarea">;

const criticidadConfig: Record<number, { label: string; cls: string }> = {
  0: { label: "—",       cls: "badge-slate" },
  1: { label: "Baja",    cls: "badge-slate" },
  2: { label: "Media",   cls: "badge-yellow" },
  3: { label: "Alta",    cls: "badge-red" },
  4: { label: "Crítica", cls: "badge bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
};

const EMPTY: TareaForm = {
  tarea: "", estrategico: false, dificilmenteAdquirible: false,
  problemasLegales: false, documentado: false, criticidad: 2, activo: true,
};

function BoolIcon({ value }: { value: boolean }) {
  return value ? <Check size={13} className="text-emerald-500" /> : <X size={13} className="text-slate-300 dark:text-slate-600" />;
}

export default function TareasPage() {
  const { canCreate, canEdit, canDeactivate } = useRole();
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useFetch(tareasApi.getAll, mockTareas);
  const { saving, error: saveError, run } = useSaving();
  const [data, setData] = useState<Tarea[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "activo" | "inactivo">("activo");
  const [filterCriticidad, setFilterCriticidad] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tarea | null>(null);
  const [form, setForm] = useState<TareaForm>(EMPTY);

  useEffect(() => { if (apiData) setData(apiData); }, [apiData]);

  const filtered = data.filter(t => {
    const matchSearch = t.tarea.toLowerCase().includes(search.toLowerCase())
      || t.codigoTarea.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || (filter === "activo" ? t.activo : !t.activo);
    const matchCrit = !filterCriticidad || t.criticidad.toString() === filterCriticidad;
    return matchSearch && matchFilter && matchCrit;
  });

  const counts = { todos: data.length, activo: data.filter(t => t.activo).length, inactivo: data.filter(t => !t.activo).length };

  function openNew() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(t: Tarea) {
    setEditing(t);
    setForm({ tarea: t.tarea, estrategico: t.estrategico, dificilmenteAdquirible: t.dificilmenteAdquirible, problemasLegales: t.problemasLegales, documentado: t.documentado, criticidad: t.criticidad, activo: t.activo });
    setModalOpen(true);
  }

  async function handleSave() {
    const ok = await run(async () => {
      if (editing) {
        await tareasApi.update(editing.tareaId, { ...form, codigoTarea: editing.codigoTarea });
        setData(d => d.map(t => t.tareaId === editing.tareaId ? { ...t, ...form } : t));
      } else {
        const res = await tareasApi.create({ ...form, codigoTarea: "" });
        const newId = res.data?.tareaId ?? Date.now();
        const newCodigo = res.data?.codigoTarea ?? "";
        setData(d => [...d, { tareaId: newId, codigoTarea: newCodigo, ...form }]);
      }
    });
    if (ok) setModalOpen(false);
  }

  async function toggleActivo(t: Tarea) {
    const newActivo = !t.activo;
    await run(() => tareasApi.setActivo(t.tareaId, newActivo));
    setData(d => d.map(x => x.tareaId === t.tareaId ? { ...x, activo: newActivo } : x));
  }

  const f = (field: keyof TareaForm, value: string | boolean | number) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Tareas"
        subtitle={`${counts.activo} activas · ${counts.inactivo} inactivas`}
        action={canCreate && (
          <button className="btn-primary" onClick={openNew}><Plus size={15} />Nueva tarea</button>
        )}
      />
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar tareas..." />
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
        <select className="input-base text-xs py-1.5 w-36" value={filterCriticidad} onChange={e => setFilterCriticidad(e.target.value)}>
          <option value="">Criticidad</option>
          <option value="4">Crítica</option>
          <option value="3">Alta</option>
          <option value="2">Media</option>
          <option value="1">Baja</option>
          <option value="0">Sin definir</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tarea</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estratégico</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Difícil</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Legal</th>
                <th className="text-center px-3 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Documentado</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Criticidad</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">No se encontraron tareas</td></tr>
              )}
              {filtered.map(t => {
                const crit = criticidadConfig[t.criticidad as number] ?? criticidadConfig[0];
                return (
                  <tr
  key={t.tareaId}
  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
  onClick={() => navigate(`/tareas/${t.tareaId}`)}
>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500 dark:text-slate-400">{t.codigoTarea}</span></td>
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200 max-w-xs">{t.tarea}</td>
                    <td className="px-3 py-3.5 text-center"><BoolIcon value={t.estrategico} /></td>
                    <td className="px-3 py-3.5 text-center"><BoolIcon value={t.dificilmenteAdquirible} /></td>
                    <td className="px-3 py-3.5 text-center"><BoolIcon value={t.problemasLegales} /></td>
                    <td className="px-3 py-3.5 text-center"><BoolIcon value={t.documentado} /></td>
                    <td className="px-5 py-3.5"><span className={crit.cls}>{crit.label}</span></td>
                    <td className="px-5 py-3.5"><span className={t.activo ? "badge-green" : "badge-slate"}>{t.activo ? "Activo" : "Inactivo"}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        {canEdit && <button className="btn-ghost" onClick={e => { e.stopPropagation(); openEdit(t); }}><Pencil size={13} /></button>}
                        {canDeactivate && (
                          <button className={`btn-ghost ${t.activo ? "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
                            onClick={e => { e.stopPropagation(); toggleActivo(t); }}><PowerOff size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar tarea" : "Nueva tarea"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Guardar cambios" : "Crear tarea"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
  <CopiarDe
    items={data.filter(t => t.activo)}
    getId={t => t.tareaId}
    getLabel={t => t.tarea}
    getSublabel={t => t.codigoTarea}
    placeholder="Buscar tarea..."
    onCopiar={t => setForm({
      tarea: t.tarea,
      estrategico: t.estrategico,
      dificilmenteAdquirible: t.dificilmenteAdquirible,
      problemasLegales: t.problemasLegales,
      documentado: t.documentado,
      criticidad: t.criticidad,
      activo: true,
    })}
  />
)}
          {saveError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveError}</p>}
          {editing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-xs text-slate-400">Código</span>
              <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{editing.codigoTarea}</span>
              <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tarea *</label>
              <textarea className="input-base resize-none" rows={3} value={form.tarea} onChange={e => f("tarea", e.target.value)} placeholder="Descripción de la tarea" />
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
          <div className="grid grid-cols-2 gap-3 pt-1">
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
