import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, Pencil, PowerOff, Crown, Loader2 } from "lucide-react";
import type { Persona } from "../types";
import { personasApi } from "../api";
import { mockPersonas } from "../data/mockData";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import PageHeader from "../components/ui/PageHeader";
import { SearchBar, FilterTabs } from "../components/ui/SearchFilter";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { useRole } from "../hooks/useAppContext";

type PersonaForm = Omit<Persona, "personaId" | "codigoPersona">;

const EMPTY: PersonaForm = {
  nombreCompleto: "", alias: "", email: "", esLider: false, activo: true,
};

export default function PersonasPage() {
  const { canCreate, canEdit, canDeactivate } = useRole();
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useFetch(personasApi.getAll, mockPersonas);
  const { saving, error: saveError, run } = useSaving();
  const [data, setData] = useState<Persona[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "activo" | "inactivo">("activo");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Persona | null>(null);
  const [form, setForm] = useState<PersonaForm>(EMPTY);

  useEffect(() => { if (apiData) setData(apiData); }, [apiData]);

  const filtered = data.filter(p => {
    const matchSearch = p.nombreCompleto.toLowerCase().includes(search.toLowerCase())
      || p.codigoPersona.toLowerCase().includes(search.toLowerCase())
      || p.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || (filter === "activo" ? p.activo : !p.activo);
    return matchSearch && matchFilter;
  });

  const counts = { todos: data.length, activo: data.filter(p => p.activo).length, inactivo: data.filter(p => !p.activo).length };

  function openNew() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(e: React.MouseEvent, p: Persona) {
    e.stopPropagation();
    setEditing(p);
    setForm({ nombreCompleto: p.nombreCompleto, alias: p.alias, email: p.email, esLider: p.esLider, activo: p.activo });
    setModalOpen(true);
  }

  async function handleSave() {
    const ok = await run(async () => {
      if (editing) {
        await personasApi.update(editing.personaId, { ...form, codigoPersona: editing.codigoPersona });
        setData(d => d.map(p => p.personaId === editing.personaId ? { ...p, ...form } : p));
      } else {
        const res = await personasApi.create({ ...form, codigoPersona: "" });
        const newId = res.data?.personaId ?? Date.now();
        const newCodigo = res.data?.codigoPersona ?? "";
        setData(d => [...d, { personaId: newId, codigoPersona: newCodigo, ...form }]);
      }
    });
    if (ok) setModalOpen(false);
  }

  async function toggleActivo(e: React.MouseEvent, p: Persona) {
    e.stopPropagation();
    const newActivo = !p.activo;
    await run(() => personasApi.setActivo(p.personaId, newActivo));
    setData(d => d.map(x => x.personaId === p.personaId ? { ...x, activo: newActivo } : x));
  }

  const f = (field: keyof PersonaForm, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Personas"
        subtitle={`${counts.activo} activas · ${counts.inactivo} inactivas`}
        action={canCreate && (
          <button className="btn-primary" onClick={openNew}><Plus size={15} />Nueva persona</button>
        )}
      />
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar personas..." />
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nombre</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Alias</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Líder</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No se encontraron personas</td></tr>
              )}
              {filtered.map(p => (
                <tr
                  key={p.personaId}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/personas/${p.personaId}`)}
                >
                  <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500 dark:text-slate-400">{p.codigoPersona}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-mint-700 dark:text-mint-400">{p.nombreCompleto.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{p.nombreCompleto}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{p.email}</td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{p.alias}</td>
                  <td className="px-5 py-3.5">{p.esLider && <span className="badge badge-yellow"><Crown size={10} className="mr-1" />Líder</span>}</td>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar persona" : "Nueva persona"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Guardar cambios" : "Crear persona"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {saveError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveError}</p>}
          {editing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-xs text-slate-400">Código</span>
              <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{editing.codigoPersona}</span>
              <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Nombre completo *</label>
            <input className="input-base" value={form.nombreCompleto} onChange={e => f("nombreCompleto", e.target.value)} placeholder="Nombre y apellidos" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Alias</label>
              <input className="input-base" value={form.alias} onChange={e => f("alias", e.target.value)} placeholder="Nombre corto" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
              <input className="input-base" type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="correo@empresa.com" />
            </div>
          </div>
          <div className="flex items-center gap-6 pt-1">
            <Toggle checked={form.esLider} onChange={v => f("esLider", v)} label="Es líder" />
            <Toggle checked={form.activo} onChange={v => f("activo", v)} label="Activo" />
          </div>
        </div>
      </Modal>
    </div>
  );
}