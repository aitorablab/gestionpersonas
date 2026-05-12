import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, PowerOff, Loader2 } from "lucide-react";
import type { Competencia } from "../types";
import { competenciasApi } from "../api";
import { mockCompetencias } from "../data/mockData";
import { useFetch } from "../hooks/useFetch";
import { useSaving } from "../hooks/useSaving";
import PageHeader from "../components/ui/PageHeader";
import { SearchBar, FilterTabs } from "../components/ui/SearchFilter";
import Modal from "../components/ui/Modal";
import Toggle from "../components/ui/Toggle";
import { LoadingSpinner, ErrorState } from "../components/ui/States";
import { useRole } from "../hooks/useAppContext";
import CopiarDe from "../components/ui/CopiarDe";


type CompetenciaForm = Omit<Competencia, "competenciaId" | "codigoCompetencia">;

const EMPTY: CompetenciaForm = {
  competencia: "", comportamientoObservable: "",
  tipoCompetencia: "Genérica", tipoEvaluacion: "360°", activo: true,
};

function tipoBadge(tipo: string): string {
  const map: Record<string, string> = {
    "Genérica":    "badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    "Técnica":     "badge bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Directiva":   "badge bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    "Transversal": "badge bg-mint-100 text-mint-700 dark:bg-mint-900/30 dark:text-mint-400",
    "Específica":  "badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return map[tipo] ?? "badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

export default function CompetenciasPage() {
  const { canCreate, canEdit, canDeactivate } = useRole();
  const navigate = useNavigate();
  const { data: apiData, loading, error, refetch } = useFetch(competenciasApi.getAll, mockCompetencias);
  const { saving, error: saveError, run } = useSaving();
  const [data, setData] = useState<Competencia[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "activo" | "inactivo">("activo");
  const [filterTipo, setFilterTipo] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Competencia | null>(null);
  const [form, setForm] = useState<CompetenciaForm>(EMPTY);

  useEffect(() => { if (apiData) setData(apiData); }, [apiData]);

  const tiposUnicos = Array.from(new Set(data.map(c => c.tipoCompetencia))).filter(Boolean).sort();

  const filtered = data.filter(c => {
    const matchSearch = c.competencia.toLowerCase().includes(search.toLowerCase())
      || c.codigoCompetencia.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "todos" || (filter === "activo" ? c.activo : !c.activo);
    const matchTipo = !filterTipo || c.tipoCompetencia === filterTipo;
    return matchSearch && matchFilter && matchTipo;
  });

  const counts = { todos: data.length, activo: data.filter(c => c.activo).length, inactivo: data.filter(c => !c.activo).length };

  function openNew() { setEditing(null); setForm(EMPTY); setModalOpen(true); }
  function openEdit(c: Competencia) {
    setEditing(c);
    setForm({ competencia: c.competencia, comportamientoObservable: c.comportamientoObservable, tipoCompetencia: c.tipoCompetencia, tipoEvaluacion: c.tipoEvaluacion, activo: c.activo });
    setModalOpen(true);
  }

  async function handleSave() {
    const ok = await run(async () => {
      if (editing) {
        await competenciasApi.update(editing.competenciaId, { ...form, codigoCompetencia: editing.codigoCompetencia });
        setData(d => d.map(c => c.competenciaId === editing.competenciaId ? { ...c, ...form } : c));
      } else {
        const res = await competenciasApi.create({ ...form, codigoCompetencia: "" });
        const newId = res.data?.competenciaId ?? Date.now();
        const newCodigo = res.data?.codigoCompetencia ?? "";
        setData(d => [...d, { competenciaId: newId, codigoCompetencia: newCodigo, ...form }]);
      }
    });
    if (ok) setModalOpen(false);
  }

  async function toggleActivo(c: Competencia) {
    const newActivo = !c.activo;
    await run(() => competenciasApi.setActivo(c.competenciaId, newActivo));
    setData(d => d.map(x => x.competenciaId === c.competenciaId ? { ...x, activo: newActivo } : x));
  }

  const f = (field: keyof CompetenciaForm, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  return (
    <div>
      <PageHeader
        title="Competencias"
        subtitle={`${counts.activo} activas · ${counts.inactivo} inactivas`}
        action={canCreate && (
          <button className="btn-primary" onClick={openNew}><Plus size={15} />Nueva competencia</button>
        )}
      />
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar competencias..." />
        <FilterTabs value={filter} onChange={setFilter} counts={counts} />
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setFilterTipo("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterTipo ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-800" : "bg-slate-100 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400"}`}>
            Todos
          </button>
          {tiposUnicos.map(tipo => (
            <button key={tipo} onClick={() => setFilterTipo(filterTipo === tipo ? "" : tipo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterTipo === tipo ? "ring-2 ring-offset-1 ring-slate-400 " + tipoBadge(tipo) : tipoBadge(tipo) + " opacity-70 hover:opacity-100"}`}>
              {tipo}
            </button>
          ))}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Código</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Competencia</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Evaluación</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No se encontraron competencias</td></tr>
              )}
              {filtered.map(c => (
                <tr
  key={c.competenciaId}
  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
  onClick={() => navigate(`/competencias/${c.competenciaId}`)}
>
                  <td className="px-5 py-3.5"><span className="font-mono text-xs text-slate-500 dark:text-slate-400">{c.codigoCompetencia}</span></td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{c.competencia}</p>
                    {c.comportamientoObservable && <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{c.comportamientoObservable}</p>}
                  </td>
                  <td className="px-5 py-3.5"><span className={tipoBadge(c.tipoCompetencia)}>{c.tipoCompetencia}</span></td>
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{c.tipoEvaluacion}</td>
                  <td className="px-5 py-3.5"><span className={c.activo ? "badge-green" : "badge-slate"}>{c.activo ? "Activo" : "Inactivo"}</span></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      {canEdit && <button className="btn-ghost" onClick={e => { e.stopPropagation(); openEdit(c); }}><Pencil size={13} /></button>}
                      {canDeactivate && (
                        <button className={`btn-ghost ${c.activo ? "text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" : "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"}`}
                          onClick={e => { e.stopPropagation(); toggleActivo(c); }}
><PowerOff size={13} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar competencia" : "Nueva competencia"}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Guardar cambios" : "Crear competencia"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
  <CopiarDe
    items={data.filter(c => c.activo)}
    getId={c => c.competenciaId}
    getLabel={c => c.competencia}
    getSublabel={c => c.tipoCompetencia}
    placeholder="Buscar competencia..."
    onCopiar={c => setForm({
      competencia: c.competencia,
      comportamientoObservable: c.comportamientoObservable,
      tipoCompetencia: c.tipoCompetencia,
      tipoEvaluacion: c.tipoEvaluacion,
      activo: true,
    })}
  />
)}

          {saveError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{saveError}</p>}
          {editing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-xs text-slate-400">Código</span>
              <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300">{editing.codigoCompetencia}</span>
              <span className="ml-auto text-[10px] text-slate-400">Generado automáticamente</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Competencia *</label>
              <input className="input-base" value={form.competencia} onChange={e => f("competencia", e.target.value)} placeholder="Nombre de la competencia" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tipo competencia</label>
              <select className="input-base" value={form.tipoCompetencia} onChange={e => f("tipoCompetencia", e.target.value)}>
                {tiposUnicos.length > 0
                  ? tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)
                  : <>
                      <option value="Genérica">Genérica</option>
                      <option value="Técnica">Técnica</option>
                      <option value="Directiva">Directiva</option>
                      <option value="Transversal">Transversal</option>
                      <option value="Específica">Específica</option>
                    </>
                }
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Comportamiento observable</label>
            <textarea className="input-base resize-none" rows={3} value={form.comportamientoObservable} onChange={e => f("comportamientoObservable", e.target.value)} placeholder="Descripción del comportamiento..." />
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
