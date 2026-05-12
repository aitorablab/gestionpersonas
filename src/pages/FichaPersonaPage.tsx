import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Crown, Briefcase, CheckSquare, ClipboardList,
  Award, ChevronRight, Loader2, ChevronDown, FileDown, Table2
} from "lucide-react";
import { personasApi } from "../api";
import { fichaPersonaApi } from "../api/relations";
import { useFetch } from "../hooks/useFetch";
import { SearchSelect } from "../components/relations";
import {
  mockPersonas, mockPersonaPuestos, mockPersonaTareasAsignadas,
  mockPersonaResponsabilidadesAsignadas, mockPuestoTareas,
  mockPuestoResponsabilidades, mockPuestoCompetencias, mockPuestos
} from "../data/mockData";

const NIVEL_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "No evaluado",   color: "text-slate-400" },
  1: { label: "No competente", color: "text-red-600 dark:text-red-400" },
  2: { label: "Nec. ayuda",    color: "text-amber-600 dark:text-amber-400" },
  3: { label: "Autónomo",      color: "text-emerald-600 dark:text-emerald-400" },
  4: { label: "Formador",      color: "text-blue-600 dark:text-blue-400" },
};

const CRIT_LABELS: Record<number, { label: string; cls: string }> = {
  0: { label: "—",       cls: "badge-slate" },
  1: { label: "Baja",    cls: "badge-slate" },
  2: { label: "Media",   cls: "badge-yellow" },
  3: { label: "Alta",    cls: "badge-red" },
  4: { label: "Crítica", cls: "badge bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
};

type SeccionKey = "puestos" | "tareas" | "responsabilidades" | "competencias" | "autonomia";

const SECCIONES: { key: SeccionKey; label: string; icon: React.ElementType }[] = [
  { key: "puestos",          label: "Puestos",          icon: Briefcase },
  { key: "tareas",           label: "Tareas",            icon: CheckSquare },
  { key: "responsabilidades",label: "Responsabilidades", icon: ClipboardList },
  { key: "competencias",     label: "Competencias",      icon: Award },
  { key: "autonomia",        label: "Autonomía",         icon: CheckSquare },
];

function SectionTitle({
  icon: Icon, title, count, collapsible, collapsed, onToggle
}: {
  icon: React.ElementType; title: string; count: number;
  collapsible?: boolean; collapsed?: boolean; onToggle?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 mb-3 ${collapsible ? "cursor-pointer select-none" : ""}`}
      onClick={collapsible ? onToggle : undefined}
    >
      <div className="w-7 h-7 rounded-lg bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center">
        <Icon size={14} className="text-mint-600 dark:text-mint-400" />
      </div>
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1">{title}</h2>
      <span className="badge badge-slate">{count}</span>
      {collapsible && (
        <ChevronDown size={15} className={`text-slate-400 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`} />
      )}
    </div>
  );
}

export default function FichaPersonaPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [ficha, setFicha] = useState<any>(null);
  const [loadingFicha, setLoadingFicha] = useState(false);
  const [nivelesCollapsed, setNivelesCollapsed] = useState(true);
  const [secciones, setSecciones] = useState<Record<SeccionKey, boolean>>({
    puestos: true, tareas: true, responsabilidades: true, competencias: true, autonomia: false,
  });

  const personasFetch = useFetch(personasApi.getAll, mockPersonas);
  const personas = personasFetch.data ?? [];

  useEffect(() => {
    if (!selectedId) { setFicha(null); return; }
    setLoadingFicha(true);
    setNivelesCollapsed(true);
    fichaPersonaApi.get(selectedId)
      .then(data => setFicha(data))
      .catch(() => {
        const persona = mockPersonas.find(p => p.personaId === selectedId);
        if (!persona) { setFicha(null); return; }
        setFicha({
          persona,
          puestos: mockPersonaPuestos.filter(p => p.personaId === selectedId && p.activo),
          tareasAsignadas: mockPersonaTareasAsignadas.filter(t => t.personaId === selectedId && t.activo),
          tareasPuesto: mockPuestoTareas
            .filter(pt => mockPersonaPuestos.some(pp => pp.personaId === selectedId && pp.puestoId === pt.puestoId && pp.activo))
            .map(pt => ({ ...pt, codigoPuesto: mockPuestos.find(p => p.puestoId === pt.puestoId)?.codigoPuesto ?? '' })),
          responsabilidadesAsignadas: mockPersonaResponsabilidadesAsignadas.filter(r => r.personaId === selectedId && r.activo),
          responsabilidadesPuesto: mockPuestoResponsabilidades
            .filter(pr => mockPersonaPuestos.some(pp => pp.personaId === selectedId && pp.puestoId === pr.puestoId && pp.activo))
            .map(pr => ({ ...pr, codigoPuesto: mockPuestos.find(p => p.puestoId === pr.puestoId)?.codigoPuesto ?? '' })),
          competencias: mockPuestoCompetencias
            .filter(pc => mockPersonaPuestos.some(pp => pp.personaId === selectedId && pp.puestoId === pc.puestoId && pp.activo))
            .map(pc => ({ ...pc, codigoPuesto: mockPuestos.find(p => p.puestoId === pc.puestoId)?.codigoPuesto ?? '' })),
          capacidades: [],
        });
      })
      .finally(() => setLoadingFicha(false));
  }, [selectedId]);

  function toggleSeccion(key: SeccionKey) {
    setSecciones(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // ─── Exportar PDF ────────────────────────────────────────
  async function exportarPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    const p = ficha.persona;

    doc.setFontSize(18); doc.setTextColor(15, 118, 110);
    doc.text("Ficha de Persona", 14, 18);
    doc.setFontSize(13); doc.setTextColor(30, 30, 30);
    doc.text(p.nombreCompleto, 14, 28);
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Código: ${p.codigoPersona}  |  Email: ${p.email ?? "—"}  |  Alias: ${p.alias ?? "—"}`, 14, 35);
    doc.text(`Líder: ${p.esLider ? "Sí" : "No"}  |  Estado: ${p.activo ? "Activo" : "Inactivo"}`, 14, 41);

    let y = 50;

    if (secciones.puestos && ficha.puestos.length > 0) {
      doc.setFontSize(11); doc.setTextColor(15, 118, 110);
      doc.text("Puestos", 14, y); y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Código", "Puesto", "Área"]],
        body: ficha.puestos.map((x: any) => [x.codigoPuesto, x.puesto, x.area ?? "—"]),
        styles: { fontSize: 8 }, headStyles: { fillColor: [15, 118, 110] },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    if (secciones.tareas) {
      const rows = [
        ...ficha.tareasAsignadas.map((t: any) => [t.codigoTarea, t.tarea, CRIT_LABELS[t.criticidad]?.label ?? "—", "Directa"]),
        ...ficha.tareasPuesto.map((t: any) => [t.codigoTarea, t.tarea, CRIT_LABELS[t.criticidad]?.label ?? "—", t.codigoPuesto]),
      ];
      if (rows.length > 0) {
        doc.setFontSize(11); doc.setTextColor(15, 118, 110);
        doc.text("Tareas", 14, y); y += 4;
        autoTable(doc, {
          startY: y,
          head: [["Código", "Tarea", "Criticidad", "Origen"]],
          body: rows,
          styles: { fontSize: 8 }, headStyles: { fillColor: [15, 118, 110] },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    if (secciones.responsabilidades) {
      const rows = [
        ...ficha.responsabilidadesAsignadas.map((r: any) => [r.codigoResponsabilidad, r.responsabilidad, "Directa"]),
        ...ficha.responsabilidadesPuesto.map((r: any) => [r.codigoResponsabilidad, r.responsabilidad, r.codigoPuesto]),
      ];
      if (rows.length > 0) {
        doc.setFontSize(11); doc.setTextColor(15, 118, 110);
        doc.text("Responsabilidades", 14, y); y += 4;
        autoTable(doc, {
          startY: y,
          head: [["Código", "Responsabilidad", "Origen"]],
          body: rows,
          styles: { fontSize: 8 }, headStyles: { fillColor: [15, 118, 110] },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }
    }

    if (secciones.competencias && ficha.competencias.length > 0) {
      doc.setFontSize(11); doc.setTextColor(15, 118, 110);
      doc.text("Competencias", 14, y); y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Código", "Competencia", "Tipo", "Requerida", "Puesto"]],
        body: ficha.competencias.map((c: any) => [c.codigoCompetencia, c.competencia, c.tipoCompetencia, c.requeridaYN ? "Sí" : "No", c.codigoPuesto]),
        styles: { fontSize: 8 }, headStyles: { fillColor: [15, 118, 110] },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    if (secciones.autonomia && ficha.capacidades.length > 0) {
      doc.setFontSize(11); doc.setTextColor(15, 118, 110);
      doc.text("Niveles de autonomía", 14, y); y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Código", "Tarea", "Criticidad", "Nivel"]],
        body: ficha.capacidades.map((c: any) => [c.codigoTarea, c.tarea, CRIT_LABELS[c.criticidad]?.label ?? "—", NIVEL_LABELS[c.nivelAutonomiaId]?.label ?? "—"]),
        styles: { fontSize: 8 }, headStyles: { fillColor: [15, 118, 110] },
      });
    }

    doc.save(`ficha_${p.codigoPersona}_${p.nombreCompleto.replace(/ /g, "_")}.pdf`);
  }

  // ─── Exportar Excel ──────────────────────────────────────
  async function exportarExcel() {
    const XLSX = await import("xlsx");
    const p = ficha.persona;
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ["Campo", "Valor"],
      ["Nombre", p.nombreCompleto], ["Código", p.codigoPersona],
      ["Email", p.email ?? "—"], ["Alias", p.alias ?? "—"],
      ["Líder", p.esLider ? "Sí" : "No"], ["Estado", p.activo ? "Activo" : "Inactivo"],
    ]), "Datos personales");

    if (secciones.puestos && ficha.puestos.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Código", "Puesto", "Área", "Misión"],
        ...ficha.puestos.map((x: any) => [x.codigoPuesto, x.puesto, x.area ?? "", x.mision ?? ""]),
      ]), "Puestos");
    }

    if (secciones.tareas) {
      const rows = [
        ...ficha.tareasAsignadas.map((t: any) => [t.codigoTarea, t.tarea, CRIT_LABELS[t.criticidad]?.label ?? "—", "Directa"]),
        ...ficha.tareasPuesto.map((t: any) => [t.codigoTarea, t.tarea, CRIT_LABELS[t.criticidad]?.label ?? "—", t.codigoPuesto]),
      ];
      if (rows.length > 0)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Código", "Tarea", "Criticidad", "Origen"], ...rows]), "Tareas");
    }

    if (secciones.responsabilidades) {
      const rows = [
        ...ficha.responsabilidadesAsignadas.map((r: any) => [r.codigoResponsabilidad, r.responsabilidad, "Directa"]),
        ...ficha.responsabilidadesPuesto.map((r: any) => [r.codigoResponsabilidad, r.responsabilidad, r.codigoPuesto]),
      ];
      if (rows.length > 0)
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Código", "Responsabilidad", "Origen"], ...rows]), "Responsabilidades");
    }

    if (secciones.competencias && ficha.competencias.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Código", "Competencia", "Tipo", "Requerida", "Puesto"],
        ...ficha.competencias.map((c: any) => [c.codigoCompetencia, c.competencia, c.tipoCompetencia, c.requeridaYN ? "Sí" : "No", c.codigoPuesto]),
      ]), "Competencias");
    }

    if (secciones.autonomia && ficha.capacidades.length > 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Código", "Tarea", "Criticidad", "Nivel autonomía", "Fecha"],
        ...ficha.capacidades.map((c: any) => [c.codigoTarea, c.tarea, CRIT_LABELS[c.criticidad]?.label ?? "—", NIVEL_LABELS[c.nivelAutonomiaId]?.label ?? "—", c.fechaEvaluacion ?? "—"]),
      ]), "Autonomía");
    }

    XLSX.writeFile(wb, `ficha_${p.codigoPersona}_${p.nombreCompleto.replace(/ /g, "_")}.xlsx`);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ficha de persona</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Selecciona una persona para ver su ficha completa</p>
      </div>

      {/* Barra superior: selector + secciones + exportar */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-6 flex-wrap">
          {/* Selector */}
          <div className="flex-shrink-0 min-w-[220px]">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Persona</label>
            <SearchSelect
              options={personas.filter(p => p.activo).map(p => ({ id: p.personaId, label: p.nombreCompleto, sublabel: p.codigoPersona }))}
              value={selectedId}
              onChange={setSelectedId}
              placeholder="Buscar persona..."
            />
          </div>

          {/* Checkboxes de secciones */}
          {ficha && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Secciones a exportar</label>
              <div className="flex flex-wrap gap-2">
                {SECCIONES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => toggleSeccion(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                      secciones[key]
                        ? "border-mint-500 bg-mint-50 text-mint-700 dark:bg-mint-900/20 dark:text-mint-400 dark:border-mint-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                      secciones[key]
                        ? "bg-mint-500 border-mint-500"
                        : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {secciones[key] && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones exportar */}
          {ficha && (
            <div className="flex items-end gap-2 flex-shrink-0">
              <button onClick={exportarPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors">
                <FileDown size={15} />PDF
              </button>
              <button onClick={exportarExcel}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors">
                <Table2 size={15} />Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedId && (
        <div className="card p-12 text-center">
          <User size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-slate-400">Selecciona una persona para ver su ficha</p>
        </div>
      )}

      {selectedId && loadingFicha && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-mint-500" />
        </div>
      )}

      {selectedId && !loadingFicha && ficha && (
        <div className="space-y-6">

          {/* Cabecera */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-mint-100 dark:bg-mint-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-mint-700 dark:text-mint-400">{ficha.persona.nombreCompleto.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{ficha.persona.nombreCompleto}</h2>
                  {ficha.persona.esLider && <span className="badge badge-yellow"><Crown size={10} className="mr-1" />Líder</span>}
                  <span className={ficha.persona.activo ? "badge-green" : "badge-slate"}>{ficha.persona.activo ? "Activo" : "Inactivo"}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 flex-wrap">
                  <span className="font-mono text-xs">{ficha.persona.codigoPersona}</span>
                  {ficha.persona.alias && <span>{ficha.persona.alias}</span>}
                  {ficha.persona.email && <span>{ficha.persona.email}</span>}
                </div>
              </div>
              <button onClick={() => navigate(`/personas/${selectedId}`)} className="btn-ghost flex-shrink-0">
                Ver ficha completa <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Puestos */}
          {secciones.puestos && (
            <div className="card p-5">
              <SectionTitle icon={Briefcase} title="Puestos" count={ficha.puestos.length} />
              {ficha.puestos.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Sin puestos asignados</p>
              ) : (
                <div className="space-y-1">
                  {ficha.puestos.map((p: any) => (
                    <button key={p.puestoId} onClick={() => navigate(`/puestos/${p.puestoId}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left">
                      <span className="font-mono text-[10px] text-slate-400 w-14">{p.codigoPuesto}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.puesto}</p>
                        <p className="text-xs text-slate-400">{p.area}</p>
                      </div>
                      <ChevronRight size={13} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tareas */}
          {secciones.tareas && (
            <div className="card p-5">
              <SectionTitle icon={CheckSquare} title="Tareas" count={ficha.tareasAsignadas.length + ficha.tareasPuesto.length} />
              {ficha.tareasAsignadas.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Asignadas directamente</p>
                  <div className="space-y-1">
                    {ficha.tareasAsignadas.map((t: any) => (
                      <div key={t.tareaId} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <span className="font-mono text-[10px] text-slate-400 w-14">{t.codigoTarea}</span>
                        <p className="flex-1 text-sm text-slate-800 dark:text-slate-200">{t.tarea}</p>
                        <span className={CRIT_LABELS[t.criticidad]?.cls ?? "badge-slate"}>{CRIT_LABELS[t.criticidad]?.label}</span>
                        <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Directa</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {ficha.tareasPuesto.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Del puesto</p>
                  <div className="space-y-1">
                    {ficha.tareasPuesto.map((t: any, i: number) => (
                      <div key={`${t.tareaId}-${i}`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <span className="font-mono text-[10px] text-slate-400 w-14">{t.codigoTarea}</span>
                        <p className="flex-1 text-sm text-slate-800 dark:text-slate-200">{t.tarea}</p>
                        <span className={CRIT_LABELS[t.criticidad]?.cls ?? "badge-slate"}>{CRIT_LABELS[t.criticidad]?.label}</span>
                        <span className="badge-slate text-[10px]">{t.codigoPuesto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {ficha.tareasAsignadas.length === 0 && ficha.tareasPuesto.length === 0 && (
                <p className="text-xs text-slate-400 py-2">Sin tareas</p>
              )}
            </div>
          )}

          {/* Responsabilidades */}
          {secciones.responsabilidades && (
            <div className="card p-5">
              <SectionTitle icon={ClipboardList} title="Responsabilidades" count={ficha.responsabilidadesAsignadas.length + ficha.responsabilidadesPuesto.length} />
              {ficha.responsabilidadesAsignadas.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Asignadas directamente</p>
                  <div className="space-y-1">
                    {ficha.responsabilidadesAsignadas.map((r: any) => (
                      <div key={r.responsabilidadId} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <span className="font-mono text-[10px] text-slate-400 w-14">{r.codigoResponsabilidad}</span>
                        <p className="flex-1 text-sm text-slate-800 dark:text-slate-200">{r.responsabilidad}</p>
                        <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Directa</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {ficha.responsabilidadesPuesto.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Del puesto</p>
                  <div className="space-y-1">
                    {ficha.responsabilidadesPuesto.map((r: any, i: number) => (
                      <div key={`${r.responsabilidadId}-${i}`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <span className="font-mono text-[10px] text-slate-400 w-14">{r.codigoResponsabilidad}</span>
                        <p className="flex-1 text-sm text-slate-800 dark:text-slate-200">{r.responsabilidad}</p>
                        <span className="badge-slate text-[10px]">{r.codigoPuesto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {ficha.responsabilidadesAsignadas.length === 0 && ficha.responsabilidadesPuesto.length === 0 && (
                <p className="text-xs text-slate-400 py-2">Sin responsabilidades</p>
              )}
            </div>
          )}

          {/* Competencias */}
          {secciones.competencias && (
            <div className="card p-5">
              <SectionTitle icon={Award} title="Competencias requeridas" count={ficha.competencias.length} />
              {ficha.competencias.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">Sin competencias</p>
              ) : (
                <div className="space-y-1">
                  {ficha.competencias.map((c: any, i: number) => (
                    <div key={`${c.competenciaId}-${i}`} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <span className="font-mono text-[10px] text-slate-400 w-14">{c.codigoCompetencia}</span>
                      <div className="flex-1">
                        <p className="text-sm text-slate-800 dark:text-slate-200">{c.competencia}</p>
                        <p className="text-[10px] text-slate-400">{c.tipoCompetencia}</p>
                      </div>
                      {c.requeridaYN && <span className="badge badge-red">Requerida</span>}
                      <span className="badge-slate text-[10px]">{c.codigoPuesto}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Autonomía — siempre visible en pantalla, contraíble */}
          {ficha.capacidades.length > 0 && (
            <div className="card p-5">
              <SectionTitle
                icon={CheckSquare} title="Niveles de autonomía evaluados"
                count={ficha.capacidades.length}
                collapsible collapsed={nivelesCollapsed}
                onToggle={() => setNivelesCollapsed(v => !v)}
              />
              {!nivelesCollapsed && (
                <div className="space-y-1 mt-1">
                  {ficha.capacidades.map((c: any) => {
                    const nivel = NIVEL_LABELS[c.nivelAutonomiaId] ?? NIVEL_LABELS[0];
                    return (
                      <div key={c.tareaId} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <span className="font-mono text-[10px] text-slate-400 w-14">{c.codigoTarea}</span>
                        <p className="flex-1 text-sm text-slate-800 dark:text-slate-200">{c.tarea}</p>
                        <span className={CRIT_LABELS[c.criticidad]?.cls ?? "badge-slate"}>{CRIT_LABELS[c.criticidad]?.label}</span>
                        <span className={`text-xs font-semibold ${nivel.color}`}>{nivel.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}