import client from "./client";
import type {
  Persona, Puesto, Responsabilidad, Tarea,
  Competencia, MatrizRow, RiesgoCobertura
} from "../types";

// ─── Personas ───────────────────────────────────────────────
export const personasApi = {
  getAll:     () => client.get<Persona[]>("/personas").then(r => r.data),
  create:     (dto: Omit<Persona, "personaId">) => client.post("/personas", dto),
  update:     (id: number, dto: Omit<Persona, "personaId">) => client.put(`/personas/${id}`, dto),
  setActivo:  (id: number, activo: boolean) => client.patch(`/personas/${id}/activo`, { activo }),
};

// ─── Puestos ────────────────────────────────────────────────
export const puestosApi = {
  getAll:     () => client.get<Puesto[]>("/puestos").then(r => r.data),
  create:     (dto: Omit<Puesto, "puestoId">) => client.post("/puestos", dto),
  update:     (id: number, dto: Omit<Puesto, "puestoId">) => client.put(`/puestos/${id}`, dto),
  setActivo:  (id: number, activo: boolean) => client.patch(`/puestos/${id}/activo`, { activo }),
};

// ─── Responsabilidades ──────────────────────────────────────
export const responsabilidadesApi = {
  getAll:     () => client.get<Responsabilidad[]>("/responsabilidades").then(r => r.data),
  create:     (dto: Omit<Responsabilidad, "responsabilidadId">) => client.post("/responsabilidades", dto),
  update:     (id: number, dto: Omit<Responsabilidad, "responsabilidadId">) => client.put(`/responsabilidades/${id}`, dto),
  setActivo:  (id: number, activo: boolean) => client.patch(`/responsabilidades/${id}/activo`, { activo }),
};

// ─── Tareas ─────────────────────────────────────────────────
export const tareasApi = {
  getAll:     () => client.get<Tarea[]>("/tareas").then(r => r.data),
  create:     (dto: Omit<Tarea, "tareaId">) => client.post("/tareas", dto),
  update:     (id: number, dto: Omit<Tarea, "tareaId">) => client.put(`/tareas/${id}`, dto),
  setActivo:  (id: number, activo: boolean) => client.patch(`/tareas/${id}/activo`, { activo }),
};

// ─── Competencias ───────────────────────────────────────────
export const competenciasApi = {
  getAll:     () => client.get<Competencia[]>("/competencias").then(r => r.data),
  create:     (dto: Omit<Competencia, "competenciaId">) => client.post("/competencias", dto),
  update:     (id: number, dto: Omit<Competencia, "competenciaId">) => client.put(`/competencias/${id}`, dto),
  setActivo:  (id: number, activo: boolean) => client.patch(`/competencias/${id}/activo`, { activo }),
};

// ─── Análisis (solo lectura) ─────────────────────────────────
export const analisisApi = {
  getMatriz:  () => client.get<MatrizRow[]>("/matriz-polivalencia").then(r => r.data),
  getRiesgo:  () => client.get<RiesgoCobertura[]>("/riesgo-polivalencia").then(r => r.data),
};
