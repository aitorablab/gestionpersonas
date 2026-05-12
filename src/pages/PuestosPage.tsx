import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Pencil, PowerOff, Loader2 } from "lucide-react";
import type { Puesto } from "../types";
import { puestosApi } from "../api";
import { mockPuestos } from "../data/mockData";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import PageHeader from "../components/ui/PageHeader";
import { SearchBar, FilterTabs } from "../components/ui/SearchFilter";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { useRole } from "../hooks/useAppContext";
import CopiarDe from "../components/ui/CopiarDe";


type PuestoForm = Omit<Puesto, "puestoId" | "codigoPuesto">;

const EMPTY: PuestoForm = {
  puesto: "", area: "", divisionFuncional: "", grupoConvenio: "", mision: "", reportaAPuestoId: null, activo: true,
};

export default function PuestosPage() {
  const { canCreate, canEdit, canDeactivate } = useRole();
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useFetch(puestosApi.getAll, mockPuestos);
  const { saving, error: saveError, run } = useSaving();
  const [data, setData] = useState<Puesto[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "activo" | "inactivo">("activo");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Puesto | null>(null);
  const [form, setForm] = useState<PuestoForm>(EMPTY);

  useEffect(() => { if (apiData) setData(apiData); }, [apiData]);

  function nombreReporta(id: number | null) {
    if (!id) return "—";
    return data.find(p => p.puestoId === id)?.puesto ?? "—";
  }

  const filtered = data.filter(p => {
    const matchSearch = p.puesto.toLowerCase().includes(search.toLowerCase())
      || p.codigoPuesto.toLowerCase().includes(search.toLowerCase())
      || p.area.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || (filter === "activo" ? p.activo : !p.activo);
    return matchSearch && matchFilter;
  });

  const counts = { todos: data.length, activo: data.filter(p => p.activo).length, inactivo: data.filter(p => !p.activo).length };
  const puestosParaReporta = data.filter(p => p.activo && p.puestoId !== editing?.puestoId);

  function openNew() { setEditing(null); setForm(EMPTY); setModalOpen(true); }

  function openEdit(e: React.MouseEvent, p: Puesto) {
    e.stopPropagation();
    setEditing(p);
    setForm({ puesto: p.puesto, area: p.area, divisionFuncional: p.divisionFuncional, grupoConvenio: p.grupoConvenio, mision: p.mision, reportaAPuestoId: p.reportaAPuestoId, activo: p.activo });
    setModalOpen(true);
  }

  async function handleSave() {
    const ok = await run(async () => {
      if (editing) {
        await puestosApi.update(editing.puestoId, { ...form, codigoPuesto: editing.codigoPuesto });
        setData(d => d.map(p => p.puestoId === editing.puestoId ? { ...p, ...form } : p));
      } else {
        const res = await puestosApi.create({ ...form, codigoPuesto: "" });
        const newId = res.data?.puestoId ?? Date.now();
        const newCodigo = res.data?.codigoPuesto ?? "";
        setData(d => [...d, { puestoId: newId, codigoPuesto: newCodigo, ...form }]);
      }
    });
    if (ok) setModalOpen(false);
  }

  async function toggleActivo(e: React.MouseEvent, p: Puesto) {
    e.stopPropagation();
    const newActivo = !p.activo;
    await run(() => puestosApi.setActivo(p.puestoId, newActivo));
    setData(d => d.map(x => x.puestoId === p.puestoId ? { ...x, activo: newActivo } : x));
  }

  const f = (field: keyof PuestoForm, value: string | boolean | number | null) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Puestos"
        subtitle={`${counts.activo} activos · ${counts.inactivo} inactivos`}
        action={canCreate && (
          <button className="btn-primary" onClick={openNew}><Plus size={15} />Nuevo puesto</button>
        )}
      />
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar puestos..." />
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Puesto</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Área</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Reporta a</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No se encontraron puestos</td></tr>
              )}
              {filtered.map(p => (
                <tr
                  key={p.puestoId}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/puestos/${p.puestoId}`)}
                >
                  <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500 dark:text-slate-400">{p.codigoPuesto}</span></td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">{p.puesto}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{p.area}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{nombreReporta(p.reportaAPuestoId)}</td>
                  <td className="px-5 py-3.5"><span className={p.activo ? "badge-green" : "badge-slate"}>{p.activo ? "Activo" : "Inactivo"}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {canEdit && (
                        <button className="btn-ghost" onClick={e => openEdit(e, p)}>
                          <Pencil size={13} />
                        </button>
                      )}
                      {canDeactivate && (
                        <button
                          className={`btn-ghost ${p.activo ? "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
                          onClick={e => toggleActivo(e, p)}
                        >
                          <PowerOff size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar puesto" : "Nuevo puesto"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Guardar cambios" : "Crear puesto"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
  <CopiarDe
    items={data.filter(p => p.activo)}
    getId={p => p.puestoId}
    getLabel={p => p.puesto}
    getSublabel={p => p.area}
    placeholder="Buscar puesto..."
    onCopiar={p => setForm({
      puesto: p.puesto,
      area: p.area,
      divisionFuncional: p.divisionFuncional,
      grupoConvenio: p.grupoConvenio,
      mision: p.mision,
      reportaAPuestoId: p.reportaAPuestoId,
      activo: true,
    })}
  />
)}
          {saveError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveError}</p>}
          {editing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-xs text-slate-400">Código</span>
              <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{editing.codigoPuesto}</span>
              <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Puesto *</label>
              <input className="input-base" value={form.puesto} onChange={e => f("puesto", e.target.value)} placeholder="Nombre del puesto" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Área</label>
              <input className="input-base" value={form.area} onChange={e => f("area", e.target.value)} placeholder="Producción, Comercial..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">División funcional</label>
              <input className="input-base" value={form.divisionFuncional} onChange={e => f("divisionFuncional", e.target.value)} placeholder="Operaciones..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Grupo convenio</label>
              <input className="input-base" value={form.grupoConvenio} onChange={e => f("grupoConvenio", e.target.value)} placeholder="Grupo A, B..." />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Reporta a</label>
            <select className="input-base" value={form.reportaAPuestoId ?? ""}
              onChange={e => f("reportaAPuestoId", e.target.value ? Number(e.target.value) : null)}>
              <option value="">— Sin reporte —</option>
              {puestosParaReporta.map(p => (
                <option key={p.puestoId} value={p.puestoId}>{p.puesto}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Misión</label>
            <textarea className="input-base resize-none" rows={3} value={form.mision} onChange={e => f("mision", e.target.value)} placeholder="Descripción de la misión del puesto..." />
          </div>
          <Toggle checked={form.activo} onChange={v => f("activo", v)} label="Activo" />
        </div>
      </Modal>
    </div>
  );
}