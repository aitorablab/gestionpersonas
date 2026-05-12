import client from "./client";
import type {
  PersonaPuesto, PersonaTareaAsignada, PersonaResponsabilidadAsignada,
  PersonaCapacidad, PuestoTarea, PuestoResponsabilidad, PuestoCompetencia
} from "../types/relations";

// ─── Persona ↔ Puestos ──────────────────────────────────────
export const personaPuestosApi = {
  getAll: (personaId: number) =>
    client.get<PersonaPuesto[]>(`/personas/${personaId}/puestos`).then(r => r.data),
  add: (personaId: number, dto: { puestoId: number; fechaInicio?: string | null; fechaFin?: string | null; observaciones?: string | null }) =>
    client.post(`/personas/${personaId}/puestos`, dto),
  desactivar: (personaId: number, relacionId: number) =>
    client.patch(`/personas/${personaId}/puestos/${relacionId}/desactivar`, {}),
};

// ─── Persona ↔ Tareas Asignadas ─────────────────────────────
export const personaTareasApi = {
  getAll: (personaId: number) =>
    client.get<PersonaTareaAsignada[]>(`/personas/${personaId}/tareas-asignadas`).then(r => r.data),
  add: (personaId: number, dto: { tareaId: number; motivoAsignacion?: string | null; fechaInicio?: string | null; fechaFin?: string | null; observaciones?: string | null }) =>
    client.post(`/personas/${personaId}/tareas-asignadas`, dto),
  desactivar: (personaId: number, relacionId: number) =>
    client.patch(`/personas/${personaId}/tareas-asignadas/${relacionId}/desactivar`, {}),
};

// ─── Persona ↔ Responsabilidades Asignadas ──────────────────
export const personaResponsabilidadesApi = {
  getAll: (personaId: number) =>
    client.get<PersonaResponsabilidadAsignada[]>(`/personas/${personaId}/responsabilidades-asignadas`).then(r => r.data),
  add: (personaId: number, dto: { responsabilidadId: number; motivoAsignacion?: string | null; fechaInicio?: string | null; observaciones?: string | null }) =>
    client.post(`/personas/${personaId}/responsabilidades-asignadas`, dto),
  desactivar: (personaId: number, relacionId: number) =>
    client.patch(`/personas/${personaId}/responsabilidades-asignadas/${relacionId}/desactivar`, {}),
};

// ─── Persona ↔ Capacidades ──────────────────────────────────
export const personaCapacidadesApi = {
  getAll: (personaId: number) =>
    client.get<PersonaCapacidad[]>(`/personas/${personaId}/capacidades`).then(r => r.data),
  upsert: (personaId: number, tareaId: number, dto: { nivelAutonomiaId: number; fechaEvaluacion?: string | null; observaciones?: string | null }) =>
    client.put(`/personas/${personaId}/capacidades/${tareaId}`, dto),
};

// ─── Puesto ↔ Tareas ────────────────────────────────────────
export const puestoTareasApi = {
  getAll: (puestoId: number) =>
    client.get<PuestoTarea[]>(`/puestos/${puestoId}/tareas`).then(r => r.data),
  add: (puestoId: number, tareaId: number) =>
    client.post(`/puestos/${puestoId}/tareas`, { relacionadoId: tareaId }),
  desactivar: (puestoId: number, relacionId: number) =>
    client.patch(`/puestos/${puestoId}/tareas/${relacionId}/desactivar`, {}),
};

// ─── Puesto ↔ Responsabilidades ─────────────────────────────
export const puestoResponsabilidadesApi = {
  getAll: (puestoId: number) =>
    client.get<PuestoResponsabilidad[]>(`/puestos/${puestoId}/responsabilidades`).then(r => r.data),
  add: (puestoId: number, responsabilidadId: number) =>
    client.post(`/puestos/${puestoId}/responsabilidades`, { relacionadoId: responsabilidadId }),
  desactivar: (puestoId: number, relacionId: number) =>
    client.patch(`/puestos/${puestoId}/responsabilidades/${relacionId}/desactivar`, {}),
};

// ─── Puesto ↔ Competencias ──────────────────────────────────
export const puestoCompetenciasApi = {
  getAll: (puestoId: number) =>
    client.get<PuestoCompetencia[]>(`/puestos/${puestoId}/competencias`).then(r => r.data),
  add: (puestoId: number, dto: { competenciaId: number; nivelMinimo: number; nivelConveniente: number; requeridaYN: boolean }) =>
    client.post(`/puestos/${puestoId}/competencias`, dto),
  update: (puestoId: number, relacionId: number, dto: { competenciaId: number; nivelMinimo: number; nivelConveniente: number; requeridaYN: boolean }) =>
    client.put(`/puestos/${puestoId}/competencias/${relacionId}`, dto),
  desactivar: (puestoId: number, relacionId: number) =>
    client.patch(`/puestos/${puestoId}/competencias/${relacionId}/desactivar`, {}),
};

// ─── Relaciones inversas ─────────────────────────────────────
export const tareaDetailApi = {
  get:      (id: number) => client.get(`/tareas/${id}`).then(r => r.data),
  personas: (id: number) => client.get(`/tareas/${id}/personas`).then(r => r.data),
  puestos:  (id: number) => client.get(`/tareas/${id}/puestos`).then(r => r.data),
};

export const responsabilidadDetailApi = {
  get:      (id: number) => client.get(`/responsabilidades/${id}`).then(r => r.data),
  personas: (id: number) => client.get(`/responsabilidades/${id}/personas`).then(r => r.data),
  puestos:  (id: number) => client.get(`/responsabilidades/${id}/puestos`).then(r => r.data),
};

export const competenciaDetailApi = {
  get:     (id: number) => client.get(`/competencias/${id}`).then(r => r.data),
  puestos: (id: number) => client.get(`/competencias/${id}/puestos`).then(r => r.data),
};

export const fichaPersonaApi = {
  get: (id: number) => client.get(`/personas/${id}/ficha`).then(r => r.data),
};