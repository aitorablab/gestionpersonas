// ─── Personas ───────────────────────────────────────────────
export interface Persona {
  personaId: number;
  codigoPersona: string;
  nombreCompleto: string;
  alias: string;
  email: string;
  esLider: boolean;
  activo: boolean;
}

// ─── Puestos ────────────────────────────────────────────────
export interface Puesto {
  puestoId: number;
  codigoPuesto: string;
  puesto: string;
  area: string;
  divisionFuncional: string;
  grupoConvenio: string;
  mision: string;
  reportaAPuestoId: number | null;
  activo: boolean;
}

// ─── Responsabilidades ──────────────────────────────────────
export interface Responsabilidad {
  responsabilidadId: number;
  codigoResponsabilidad: string;
  responsabilidad: string;
  activo: boolean;
}

// ─── Tareas ─────────────────────────────────────────────────
export interface Tarea {
  tareaId: number;
  codigoTarea: string;
  tarea: string;
  estrategico: boolean;
  dificilmenteAdquirible: boolean;
  problemasLegales: boolean;
  documentado: boolean;
  criticidad: number; // API devuelve número 0-4
  activo: boolean;
}

// ─── Competencias ───────────────────────────────────────────
export interface Competencia {
  competenciaId: number;
  codigoCompetencia: string;
  competencia: string;
  comportamientoObservable: string;
  tipoCompetencia: string;
  tipoEvaluacion: string;
  activo: boolean;
}

// ─── Matriz Polivalencia — API devuelve array plano ──────────
export interface MatrizRow {
  personaId: number;
  codigoPersona: string;
  nombreCompleto: string;
  tareaId: number;
  codigoTarea: string;
  tarea: string;
  criticidad: number;
  nivelAutonomiaId: number;
  nivelAutonomia: string;
  fechaEvaluacion: string | null;
  observaciones: string | null;
  activo: boolean;
}

// ─── Riesgo Cobertura — API real ─────────────────────────────
export interface RiesgoCobertura {
  tareaId: number;
  codigoTarea: string;
  tarea: string;
  criticidad: number;
  noCompetentes: number;
  necesitanAyuda: number;
  autonomos: number;
  formadores: number;
  riesgoCobertura: string; // "Crítico", "Alto", "Medio", "Bajo"
}

// ─── Roles ──────────────────────────────────────────────────
export type Rol = "Admin" | "Editor" | "Lector";
