// ─── Persona ↔ Puestos ──────────────────────────────────────
export interface PersonaPuesto {
  personaPuestoId: number;
  personaId: number;
  puestoId: number;
  codigoPuesto: string;
  puesto: string;
  area: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  observaciones: string | null;
}

// ─── Persona ↔ Tareas Asignadas ─────────────────────────────
export interface PersonaTareaAsignada {
  personaTareaAsignadaId: number;
  personaId: number;
  tareaId: number;
  codigoTarea: string;
  tarea: string;
  criticidad: number;
  motivoAsignacion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  observaciones: string | null;
}

// ─── Persona ↔ Responsabilidades Asignadas ──────────────────
export interface PersonaResponsabilidadAsignada {
  personaResponsabilidadAsignadaId: number;
  personaId: number;
  responsabilidadId: number;
  codigoResponsabilidad: string;
  responsabilidad: string;
  motivoAsignacion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  observaciones: string | null;
}

// ─── Persona ↔ Capacidad ────────────────────────────────────
export interface PersonaCapacidad {
  personaTareaCapacidadId: number;
  personaId: number;
  tareaId: number;
  codigoTarea: string;
  tarea: string;
  criticidad: number;
  nivelAutonomiaId: number;
  fechaEvaluacion: string | null;
  observaciones: string | null;
  activo: boolean;
}

// ─── Puesto ↔ Tareas ────────────────────────────────────────
export interface PuestoTarea {
  puestoTareaId: number;
  puestoId: number;
  tareaId: number;
  codigoTarea: string;
  tarea: string;
  criticidad: number;
  estrategico: boolean;
  dificilmenteAdquirible: boolean;
  activo: boolean;
}

// ─── Puesto ↔ Responsabilidades ─────────────────────────────
export interface PuestoResponsabilidad {
  puestoResponsabilidadId: number;
  puestoId: number;
  responsabilidadId: number;
  codigoResponsabilidad: string;
  responsabilidad: string;
  activo: boolean;
}

// ─── Puesto ↔ Competencias ──────────────────────────────────
export interface PuestoCompetencia {
  puestoCompetenciaId: number;
  puestoId: number;
  competenciaId: number;
  codigoCompetencia: string;
  competencia: string;
  tipoCompetencia: string;
  nivelMinimo: number;
  nivelConveniente: number;
  requeridaYN: boolean;
  activo: boolean;
}