import type { Persona, Puesto, Responsabilidad, Tarea, Competencia } from "../types";
import type { MatrizRow, RiesgoCobertura } from "../types";
import type {
  PersonaPuesto, PersonaTareaAsignada, PersonaResponsabilidadAsignada,
  PuestoTarea, PuestoResponsabilidad, PuestoCompetencia
} from "../types/relations";

// ─── PERSONAS ───────────────────────────────────────────────
export const mockPersonas: Persona[] = [
  { personaId: 1, codigoPersona: "PE001", nombreCompleto: "Ana García López", alias: "Ana G.", email: "ana.garcia@empresa.com", esLider: true, activo: true },
  { personaId: 2, codigoPersona: "PE002", nombreCompleto: "Carlos Martínez Ruiz", alias: "Carlos M.", email: "carlos.martinez@empresa.com", esLider: false, activo: true },
  { personaId: 3, codigoPersona: "PE003", nombreCompleto: "Laura Fernández Sanz", alias: "Laura F.", email: "laura.fernandez@empresa.com", esLider: false, activo: true },
  { personaId: 4, codigoPersona: "PE004", nombreCompleto: "Miguel Torres Vega", alias: "Miguel T.", email: "miguel.torres@empresa.com", esLider: true, activo: true },
  { personaId: 5, codigoPersona: "PE005", nombreCompleto: "Sofía Rodríguez Pla", alias: "Sofía R.", email: "sofia.rodriguez@empresa.com", esLider: false, activo: false },
  { personaId: 6, codigoPersona: "PE006", nombreCompleto: "Javier López Nieto", alias: "Javier L.", email: "javier.lopez@empresa.com", esLider: false, activo: true },
  { personaId: 7, codigoPersona: "PE007", nombreCompleto: "Elena Martín Cano", alias: "Elena M.", email: "elena.martin@empresa.com", esLider: false, activo: true },
  { personaId: 8, codigoPersona: "PE008", nombreCompleto: "Roberto Sánchez Gil", alias: "Roberto S.", email: "roberto.sanchez@empresa.com", esLider: false, activo: true },
  { personaId: 9, codigoPersona: "PE009", nombreCompleto: "Patricia Molina Vera", alias: "Patricia M.", email: "patricia.molina@empresa.com", esLider: true, activo: true },
  { personaId: 10, codigoPersona: "PE010", nombreCompleto: "Diego Herrera Ruiz", alias: "Diego H.", email: "diego.herrera@empresa.com", esLider: false, activo: true },
  { personaId: 11, codigoPersona: "PE011", nombreCompleto: "Lucía Navarro Peña", alias: "Lucía N.", email: "lucia.navarro@empresa.com", esLider: false, activo: true },
  { personaId: 12, codigoPersona: "PE012", nombreCompleto: "Andrés Castillo Mora", alias: "Andrés C.", email: "andres.castillo@empresa.com", esLider: false, activo: false },
];

// ─── PUESTOS ────────────────────────────────────────────────
export const mockPuestos: Puesto[] = [
  { puestoId: 1, codigoPuesto: "PU001", puesto: "Técnico de Producción", area: "Producción", divisionFuncional: "Operaciones", grupoConvenio: "Grupo A", mision: "Garantizar la producción eficiente de los productos.", reportaAPuestoId: 3, activo: true },
  { puestoId: 2, codigoPuesto: "PU002", puesto: "Responsable de Calidad", area: "Calidad", divisionFuncional: "Control", grupoConvenio: "Grupo B", mision: "Asegurar el cumplimiento de los estándares de calidad.", reportaAPuestoId: 5, activo: true },
  { puestoId: 3, codigoPuesto: "PU003", puesto: "Jefe de Producción", area: "Producción", divisionFuncional: "Operaciones", grupoConvenio: "Grupo B", mision: "Supervisar y coordinar todas las actividades de producción.", reportaAPuestoId: null, activo: true },
  { puestoId: 4, codigoPuesto: "PU004", puesto: "Técnico de Laboratorio", area: "I+D", divisionFuncional: "Investigación", grupoConvenio: "Grupo C", mision: "Realizar ensayos y análisis en laboratorio.", reportaAPuestoId: 2, activo: false },
  { puestoId: 5, codigoPuesto: "PU005", puesto: "Director de Operaciones", area: "Dirección", divisionFuncional: "Dirección General", grupoConvenio: "Grupo D", mision: "Liderar y optimizar todas las operaciones de la empresa.", reportaAPuestoId: null, activo: true },
  { puestoId: 6, codigoPuesto: "PU006", puesto: "Jefe de Almacén", area: "Logística", divisionFuncional: "Supply Chain", grupoConvenio: "Grupo B", mision: "Gestionar la recepción, almacenamiento y expedición.", reportaAPuestoId: 5, activo: true },
  { puestoId: 7, codigoPuesto: "PU007", puesto: "Operario de Línea", area: "Producción", divisionFuncional: "Operaciones", grupoConvenio: "Grupo A", mision: "Ejecutar los procesos de fabricación asignados.", reportaAPuestoId: 3, activo: true },
  { puestoId: 8, codigoPuesto: "PU008", puesto: "Técnico de Mantenimiento", area: "Mantenimiento", divisionFuncional: "Operaciones", grupoConvenio: "Grupo A", mision: "Mantener en óptimas condiciones los equipos e instalaciones.", reportaAPuestoId: 3, activo: true },
];

// ─── RESPONSABILIDADES ──────────────────────────────────────
export const mockResponsabilidades: Responsabilidad[] = [
  { responsabilidadId: 1, codigoResponsabilidad: "RE001", responsabilidad: "Control de calidad del producto final", activo: true },
  { responsabilidadId: 2, codigoResponsabilidad: "RE002", responsabilidad: "Mantenimiento preventivo de maquinaria", activo: true },
  { responsabilidadId: 3, codigoResponsabilidad: "RE003", responsabilidad: "Gestión de inventario y stock", activo: true },
  { responsabilidadId: 4, codigoResponsabilidad: "RE004", responsabilidad: "Formación de personal de nueva incorporación", activo: false },
  { responsabilidadId: 5, codigoResponsabilidad: "RE005", responsabilidad: "Auditoría interna de procesos", activo: true },
  { responsabilidadId: 6, codigoResponsabilidad: "RE006", responsabilidad: "Gestión de residuos y sostenibilidad", activo: true },
  { responsabilidadId: 7, codigoResponsabilidad: "RE007", responsabilidad: "Coordinación con proveedores externos", activo: true },
  { responsabilidadId: 8, codigoResponsabilidad: "RE008", responsabilidad: "Elaboración de informes de producción diarios", activo: true },
  { responsabilidadId: 9, codigoResponsabilidad: "RE009", responsabilidad: "Supervisión de EPIs y seguridad laboral", activo: true },
  { responsabilidadId: 10, codigoResponsabilidad: "RE010", responsabilidad: "Gestión documental de procedimientos", activo: true },
];

// ─── TAREAS ─────────────────────────────────────────────────
// criticidad: 0=sin definir, 1=baja, 2=media, 3=alta, 4=crítica
export const mockTareas: Tarea[] = [
  { tareaId: 1, codigoTarea: "TA001", tarea: "Calibración de equipos de medición", estrategico: true, dificilmenteAdquirible: true, problemasLegales: false, documentado: true, criticidad: 3, activo: true },
  { tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", estrategico: false, dificilmenteAdquirible: false, problemasLegales: false, documentado: true, criticidad: 2, activo: true },
  { tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", estrategico: true, dificilmenteAdquirible: true, problemasLegales: true, documentado: true, criticidad: 4, activo: true },
  { tareaId: 4, codigoTarea: "TA004", tarea: "Gestión de pedidos a proveedor", estrategico: false, dificilmenteAdquirible: false, problemasLegales: false, documentado: false, criticidad: 1, activo: true },
  { tareaId: 5, codigoTarea: "TA005", tarea: "Limpieza CIP de reactores", estrategico: false, dificilmenteAdquirible: false, problemasLegales: true, documentado: true, criticidad: 2, activo: true },
  { tareaId: 6, codigoTarea: "TA006", tarea: "Elaboración de informes de desviaciones", estrategico: true, dificilmenteAdquirible: false, problemasLegales: true, documentado: true, criticidad: 3, activo: false },
  { tareaId: 7, codigoTarea: "TA007", tarea: "Control de temperaturas de almacenamiento", estrategico: false, dificilmenteAdquirible: false, problemasLegales: true, documentado: true, criticidad: 2, activo: true },
  { tareaId: 8, codigoTarea: "TA008", tarea: "Mantenimiento correctivo de equipos", estrategico: false, dificilmenteAdquirible: true, problemasLegales: false, documentado: true, criticidad: 3, activo: true },
  { tareaId: 9, codigoTarea: "TA009", tarea: "Verificación de materias primas", estrategico: true, dificilmenteAdquirible: false, problemasLegales: true, documentado: true, criticidad: 3, activo: true },
  { tareaId: 10, codigoTarea: "TA010", tarea: "Registro de lotes de producción", estrategico: false, dificilmenteAdquirible: false, problemasLegales: true, documentado: true, criticidad: 2, activo: true },
  { tareaId: 11, codigoTarea: "TA011", tarea: "Gestión de residuos peligrosos", estrategico: false, dificilmenteAdquirible: false, problemasLegales: true, documentado: true, criticidad: 3, activo: true },
  { tareaId: 12, codigoTarea: "TA012", tarea: "Arranque y paro de línea de producción", estrategico: false, dificilmenteAdquirible: true, problemasLegales: false, documentado: true, criticidad: 4, activo: true },
];

// ─── COMPETENCIAS ───────────────────────────────────────────
export const mockCompetencias: Competencia[] = [
  { competenciaId: 1, codigoCompetencia: "CO001", competencia: "Orientación a resultados", comportamientoObservable: "Establece objetivos claros y actúa con foco en su consecución.", tipoCompetencia: "Genérica", tipoEvaluacion: "360°", activo: true },
  { competenciaId: 2, codigoCompetencia: "CO002", competencia: "Trabajo en equipo", comportamientoObservable: "Colabora activamente con sus compañeros para alcanzar metas comunes.", tipoCompetencia: "Genérica", tipoEvaluacion: "Autoevaluación", activo: true },
  { competenciaId: 3, codigoCompetencia: "CO003", competencia: "Conocimiento técnico de procesos", comportamientoObservable: "Demuestra dominio de los procedimientos técnicos de su área.", tipoCompetencia: "Técnica", tipoEvaluacion: "Evaluación directa", activo: true },
  { competenciaId: 4, codigoCompetencia: "CO004", competencia: "Gestión del cambio", comportamientoObservable: "Adapta su comportamiento ante nuevas circunstancias con actitud positiva.", tipoCompetencia: "Directiva", tipoEvaluacion: "360°", activo: false },
  { competenciaId: 5, codigoCompetencia: "CO005", competencia: "Comunicación efectiva", comportamientoObservable: "Transmite información de forma clara y escucha activamente.", tipoCompetencia: "Genérica", tipoEvaluacion: "Autoevaluación", activo: true },
  { competenciaId: 6, codigoCompetencia: "CO006", competencia: "Seguridad y prevención de riesgos", comportamientoObservable: "Identifica y actúa proactivamente ante situaciones de riesgo.", tipoCompetencia: "Técnica", tipoEvaluacion: "Evaluación directa", activo: true },
  { competenciaId: 7, codigoCompetencia: "CO007", competencia: "Planificación y organización", comportamientoObservable: "Organiza su trabajo de forma eficiente priorizando tareas clave.", tipoCompetencia: "Directiva", tipoEvaluacion: "360°", activo: true },
  { competenciaId: 8, codigoCompetencia: "CO008", competencia: "Resolución de problemas", comportamientoObservable: "Analiza situaciones complejas y propone soluciones efectivas.", tipoCompetencia: "Genérica", tipoEvaluacion: "Autoevaluación", activo: true },
];

// ─── RELACIONES PERSONA ↔ PUESTOS ───────────────────────────
export const mockPersonaPuestos: PersonaPuesto[] = [
  { personaPuestoId: 1, personaId: 1, puestoId: 1, codigoPuesto: "PU001", puesto: "Técnico de Producción", area: "Producción", fechaInicio: "2022-01-10", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 2, personaId: 2, puestoId: 7, codigoPuesto: "PU007", puesto: "Operario de Línea", area: "Producción", fechaInicio: "2021-06-01", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 3, personaId: 3, puestoId: 2, codigoPuesto: "PU002", puesto: "Responsable de Calidad", area: "Calidad", fechaInicio: "2020-03-15", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 4, personaId: 4, puestoId: 3, codigoPuesto: "PU003", puesto: "Jefe de Producción", area: "Producción", fechaInicio: "2019-09-01", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 5, personaId: 6, puestoId: 8, codigoPuesto: "PU008", puesto: "Técnico de Mantenimiento", area: "Mantenimiento", fechaInicio: "2022-07-01", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 6, personaId: 7, puestoId: 7, codigoPuesto: "PU007", puesto: "Operario de Línea", area: "Producción", fechaInicio: "2023-01-10", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 7, personaId: 8, puestoId: 6, codigoPuesto: "PU006", puesto: "Jefe de Almacén", area: "Logística", fechaInicio: "2021-11-01", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 8, personaId: 9, puestoId: 5, codigoPuesto: "PU005", puesto: "Director de Operaciones", area: "Dirección", fechaInicio: "2018-05-01", fechaFin: null, activo: true, observaciones: null },
  { personaPuestoId: 9, personaId: 1, puestoId: 8, codigoPuesto: "PU008", puesto: "Técnico de Mantenimiento", area: "Mantenimiento", fechaInicio: "2021-01-01", fechaFin: "2022-01-09", activo: false, observaciones: "Cambio de puesto" },
];

// ─── RELACIONES PERSONA ↔ TAREAS ASIGNADAS ──────────────────
export const mockPersonaTareasAsignadas: PersonaTareaAsignada[] = [
  { personaTareaAsignadaId: 1, personaId: 1, tareaId: 11, codigoTarea: "TA011", tarea: "Gestión de residuos peligrosos", criticidad: 3, motivoAsignacion: "Certificación específica obtenida", fechaInicio: "2023-03-01", fechaFin: null, activo: true, observaciones: null },
  { personaTareaAsignadaId: 2, personaId: 2, tareaId: 9, codigoTarea: "TA009", tarea: "Verificación de materias primas", criticidad: 3, motivoAsignacion: "Cobertura temporal baja de personal", fechaInicio: "2023-06-15", fechaFin: null, activo: true, observaciones: "Revisión trimestral" },
  { personaTareaAsignadaId: 3, personaId: 6, tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", criticidad: 4, motivoAsignacion: "Formación adicional completada", fechaInicio: "2022-11-01", fechaFin: null, activo: true, observaciones: null },
];

// ─── RELACIONES PERSONA ↔ RESPONSABILIDADES ASIGNADAS ───────
export const mockPersonaResponsabilidadesAsignadas: PersonaResponsabilidadAsignada[] = [
  { personaResponsabilidadAsignadaId: 1, personaId: 1, responsabilidadId: 9, codigoResponsabilidad: "RE009", responsabilidad: "Supervisión de EPIs y seguridad laboral", motivoAsignacion: "Delegación del responsable de área", fechaInicio: "2023-01-01", fechaFin: null, activo: true, observaciones: null },
  { personaResponsabilidadAsignadaId: 2, personaId: 4, responsabilidadId: 8, codigoResponsabilidad: "RE008", responsabilidad: "Elaboración de informes de producción diarios", motivoAsignacion: "Responsabilidad inherente al puesto de jefatura", fechaInicio: "2019-09-01", fechaFin: null, activo: true, observaciones: null },
  { personaResponsabilidadAsignadaId: 3, personaId: 9, responsabilidadId: 5, codigoResponsabilidad: "RE005", responsabilidad: "Auditoría interna de procesos", motivoAsignacion: "Responsabilidad de dirección", fechaInicio: "2020-01-01", fechaFin: null, activo: true, observaciones: null },
];

// ─── RELACIONES PUESTO ↔ TAREAS ─────────────────────────────
export const mockPuestoTareas: PuestoTarea[] = [
  { puestoTareaId: 1, puestoId: 1, tareaId: 1, codigoTarea: "TA001", tarea: "Calibración de equipos de medición", criticidad: 3, estrategico: true, dificilmenteAdquirible: true, activo: true },
  { puestoTareaId: 2, puestoId: 1, tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", criticidad: 2, estrategico: false, dificilmenteAdquirible: false, activo: true },
  { puestoTareaId: 3, puestoId: 1, tareaId: 10, codigoTarea: "TA010", tarea: "Registro de lotes de producción", criticidad: 2, estrategico: false, dificilmenteAdquirible: false, activo: true },
  { puestoTareaId: 4, puestoId: 2, tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", criticidad: 4, estrategico: true, dificilmenteAdquirible: true, activo: true },
  { puestoTareaId: 5, puestoId: 2, tareaId: 9, codigoTarea: "TA009", tarea: "Verificación de materias primas", criticidad: 3, estrategico: true, dificilmenteAdquirible: false, activo: true },
  { puestoTareaId: 6, puestoId: 3, tareaId: 12, codigoTarea: "TA012", tarea: "Arranque y paro de línea de producción", criticidad: 4, estrategico: false, dificilmenteAdquirible: true, activo: true },
  { puestoTareaId: 7, puestoId: 6, tareaId: 7, codigoTarea: "TA007", tarea: "Control de temperaturas de almacenamiento", criticidad: 2, estrategico: false, dificilmenteAdquirible: false, activo: true },
  { puestoTareaId: 8, puestoId: 6, tareaId: 4, codigoTarea: "TA004", tarea: "Gestión de pedidos a proveedor", criticidad: 1, estrategico: false, dificilmenteAdquirible: false, activo: true },
  { puestoTareaId: 9, puestoId: 7, tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", criticidad: 2, estrategico: false, dificilmenteAdquirible: false, activo: true },
  { puestoTareaId: 10, puestoId: 7, tareaId: 5, codigoTarea: "TA005", tarea: "Limpieza CIP de reactores", criticidad: 2, estrategico: false, dificilmenteAdquirible: false, activo: true },
  { puestoTareaId: 11, puestoId: 8, tareaId: 8, codigoTarea: "TA008", tarea: "Mantenimiento correctivo de equipos", criticidad: 3, estrategico: false, dificilmenteAdquirible: true, activo: true },
];

// ─── RELACIONES PUESTO ↔ RESPONSABILIDADES ──────────────────
export const mockPuestoResponsabilidades: PuestoResponsabilidad[] = [
  { puestoResponsabilidadId: 1, puestoId: 1, responsabilidadId: 1, codigoResponsabilidad: "RE001", responsabilidad: "Control de calidad del producto final", activo: true },
  { puestoResponsabilidadId: 2, puestoId: 1, responsabilidadId: 8, codigoResponsabilidad: "RE008", responsabilidad: "Elaboración de informes de producción diarios", activo: true },
  { puestoResponsabilidadId: 3, puestoId: 2, responsabilidadId: 1, codigoResponsabilidad: "RE001", responsabilidad: "Control de calidad del producto final", activo: true },
  { puestoResponsabilidadId: 4, puestoId: 2, responsabilidadId: 5, codigoResponsabilidad: "RE005", responsabilidad: "Auditoría interna de procesos", activo: true },
  { puestoResponsabilidadId: 5, puestoId: 3, responsabilidadId: 8, codigoResponsabilidad: "RE008", responsabilidad: "Elaboración de informes de producción diarios", activo: true },
  { puestoResponsabilidadId: 6, puestoId: 6, responsabilidadId: 3, codigoResponsabilidad: "RE003", responsabilidad: "Gestión de inventario y stock", activo: true },
  { puestoResponsabilidadId: 7, puestoId: 8, responsabilidadId: 2, codigoResponsabilidad: "RE002", responsabilidad: "Mantenimiento preventivo de maquinaria", activo: true },
  { puestoResponsabilidadId: 8, puestoId: 8, responsabilidadId: 9, codigoResponsabilidad: "RE009", responsabilidad: "Supervisión de EPIs y seguridad laboral", activo: true },
];

// ─── RELACIONES PUESTO ↔ COMPETENCIAS ───────────────────────
export const mockPuestoCompetencias: PuestoCompetencia[] = [
  { puestoCompetenciaId: 1, puestoId: 1, competenciaId: 3, codigoCompetencia: "CO003", competencia: "Conocimiento técnico de procesos", tipoCompetencia: "Técnica", nivelMinimo: 2, nivelConveniente: 3, requeridaYN: true, activo: true },
  { puestoCompetenciaId: 2, puestoId: 1, competenciaId: 6, codigoCompetencia: "CO006", competencia: "Seguridad y prevención de riesgos", tipoCompetencia: "Técnica", nivelMinimo: 2, nivelConveniente: 3, requeridaYN: true, activo: true },
  { puestoCompetenciaId: 3, puestoId: 2, competenciaId: 3, codigoCompetencia: "CO003", competencia: "Conocimiento técnico de procesos", tipoCompetencia: "Técnica", nivelMinimo: 3, nivelConveniente: 4, requeridaYN: true, activo: true },
  { puestoCompetenciaId: 4, puestoId: 2, competenciaId: 8, codigoCompetencia: "CO008", competencia: "Resolución de problemas", tipoCompetencia: "Genérica", nivelMinimo: 2, nivelConveniente: 3, requeridaYN: false, activo: true },
  { puestoCompetenciaId: 5, puestoId: 3, competenciaId: 7, codigoCompetencia: "CO007", competencia: "Planificación y organización", tipoCompetencia: "Directiva", nivelMinimo: 3, nivelConveniente: 4, requeridaYN: true, activo: true },
  { puestoCompetenciaId: 6, puestoId: 3, competenciaId: 1, codigoCompetencia: "CO001", competencia: "Orientación a resultados", tipoCompetencia: "Genérica", nivelMinimo: 3, nivelConveniente: 4, requeridaYN: true, activo: true },
  { puestoCompetenciaId: 7, puestoId: 5, competenciaId: 7, codigoCompetencia: "CO007", competencia: "Planificación y organización", tipoCompetencia: "Directiva", nivelMinimo: 4, nivelConveniente: 4, requeridaYN: true, activo: true },
  { puestoCompetenciaId: 8, puestoId: 8, competenciaId: 6, codigoCompetencia: "CO006", competencia: "Seguridad y prevención de riesgos", tipoCompetencia: "Técnica", nivelMinimo: 3, nivelConveniente: 4, requeridaYN: true, activo: true },
];

// ─── MATRIZ POLIVALENCIA (array plano — formato real API) ────
export const mockMatrizRows: MatrizRow[] = [
  { personaId: 1, codigoPersona: "PE001", nombreCompleto: "Ana García López", tareaId: 1, codigoTarea: "TA001", tarea: "Calibración de equipos de medición", criticidad: 3, nivelAutonomiaId: 4, nivelAutonomia: "Formador", fechaEvaluacion: "2024-01-15", observaciones: null, activo: true },
  { personaId: 1, codigoPersona: "PE001", nombreCompleto: "Ana García López", tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", criticidad: 2, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-01-15", observaciones: null, activo: true },
  { personaId: 1, codigoPersona: "PE001", nombreCompleto: "Ana García López", tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", criticidad: 4, nivelAutonomiaId: 4, nivelAutonomia: "Formador", fechaEvaluacion: "2024-01-15", observaciones: null, activo: true },
  { personaId: 1, codigoPersona: "PE001", nombreCompleto: "Ana García López", tareaId: 5, codigoTarea: "TA005", tarea: "Limpieza CIP de reactores", criticidad: 2, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-01-15", observaciones: null, activo: true },
  { personaId: 1, codigoPersona: "PE001", nombreCompleto: "Ana García López", tareaId: 8, codigoTarea: "TA008", tarea: "Mantenimiento correctivo de equipos", criticidad: 3, nivelAutonomiaId: 2, nivelAutonomia: "Necesita ayuda", fechaEvaluacion: "2024-01-15", observaciones: null, activo: true },
  { personaId: 2, codigoPersona: "PE002", nombreCompleto: "Carlos Martínez Ruiz", tareaId: 1, codigoTarea: "TA001", tarea: "Calibración de equipos de medición", criticidad: 3, nivelAutonomiaId: 2, nivelAutonomia: "Necesita ayuda", fechaEvaluacion: "2024-02-01", observaciones: null, activo: true },
  { personaId: 2, codigoPersona: "PE002", nombreCompleto: "Carlos Martínez Ruiz", tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", criticidad: 2, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-02-01", observaciones: null, activo: true },
  { personaId: 2, codigoPersona: "PE002", nombreCompleto: "Carlos Martínez Ruiz", tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", criticidad: 4, nivelAutonomiaId: 1, nivelAutonomia: "No competente", fechaEvaluacion: "2024-02-01", observaciones: null, activo: true },
  { personaId: 2, codigoPersona: "PE002", nombreCompleto: "Carlos Martínez Ruiz", tareaId: 5, codigoTarea: "TA005", tarea: "Limpieza CIP de reactores", criticidad: 2, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-02-01", observaciones: null, activo: true },
  { personaId: 3, codigoPersona: "PE003", nombreCompleto: "Laura Fernández Sanz", tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", criticidad: 4, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-01-20", observaciones: null, activo: true },
  { personaId: 3, codigoPersona: "PE003", nombreCompleto: "Laura Fernández Sanz", tareaId: 9, codigoTarea: "TA009", tarea: "Verificación de materias primas", criticidad: 3, nivelAutonomiaId: 4, nivelAutonomia: "Formador", fechaEvaluacion: "2024-01-20", observaciones: null, activo: true },
  { personaId: 3, codigoPersona: "PE003", nombreCompleto: "Laura Fernández Sanz", tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", criticidad: 2, nivelAutonomiaId: 2, nivelAutonomia: "Necesita ayuda", fechaEvaluacion: "2024-01-20", observaciones: null, activo: true },
  { personaId: 4, codigoPersona: "PE004", nombreCompleto: "Miguel Torres Vega", tareaId: 12, codigoTarea: "TA012", tarea: "Arranque y paro de línea de producción", criticidad: 4, nivelAutonomiaId: 4, nivelAutonomia: "Formador", fechaEvaluacion: "2023-11-10", observaciones: null, activo: true },
  { personaId: 4, codigoPersona: "PE004", nombreCompleto: "Miguel Torres Vega", tareaId: 1, codigoTarea: "TA001", tarea: "Calibración de equipos de medición", criticidad: 3, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2023-11-10", observaciones: null, activo: true },
  { personaId: 4, codigoPersona: "PE004", nombreCompleto: "Miguel Torres Vega", tareaId: 5, codigoTarea: "TA005", tarea: "Limpieza CIP de reactores", criticidad: 2, nivelAutonomiaId: 4, nivelAutonomia: "Formador", fechaEvaluacion: "2023-11-10", observaciones: null, activo: true },
  { personaId: 6, codigoPersona: "PE006", nombreCompleto: "Javier López Nieto", tareaId: 8, codigoTarea: "TA008", tarea: "Mantenimiento correctivo de equipos", criticidad: 3, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-03-01", observaciones: null, activo: true },
  { personaId: 6, codigoPersona: "PE006", nombreCompleto: "Javier López Nieto", tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", criticidad: 4, nivelAutonomiaId: 0, nivelAutonomia: "No evaluado", fechaEvaluacion: null, observaciones: null, activo: true },
  { personaId: 7, codigoPersona: "PE007", nombreCompleto: "Elena Martín Cano", tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", criticidad: 2, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-02-15", observaciones: null, activo: true },
  { personaId: 7, codigoPersona: "PE007", nombreCompleto: "Elena Martín Cano", tareaId: 5, codigoTarea: "TA005", tarea: "Limpieza CIP de reactores", criticidad: 2, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-02-15", observaciones: null, activo: true },
  { personaId: 8, codigoPersona: "PE008", nombreCompleto: "Roberto Sánchez Gil", tareaId: 7, codigoTarea: "TA007", tarea: "Control de temperaturas de almacenamiento", criticidad: 2, nivelAutonomiaId: 4, nivelAutonomia: "Formador", fechaEvaluacion: "2024-01-08", observaciones: null, activo: true },
  { personaId: 8, codigoPersona: "PE008", nombreCompleto: "Roberto Sánchez Gil", tareaId: 4, codigoTarea: "TA004", tarea: "Gestión de pedidos a proveedor", criticidad: 1, nivelAutonomiaId: 3, nivelAutonomia: "Autónomo", fechaEvaluacion: "2024-01-08", observaciones: null, activo: true },
];

// ─── RIESGO COBERTURA (formato real API) ────────────────────
export const mockRiesgoCobertura: RiesgoCobertura[] = [
  { tareaId: 3, codigoTarea: "TA003", tarea: "Análisis microbiológico", criticidad: 4, noCompetentes: 1, necesitanAyuda: 0, autonomos: 2, formadores: 1, riesgoCobertura: "Alto" },
  { tareaId: 12, codigoTarea: "TA012", tarea: "Arranque y paro de línea de producción", criticidad: 4, noCompetentes: 0, necesitanAyuda: 0, autonomos: 0, formadores: 1, riesgoCobertura: "Crítico" },
  { tareaId: 1, codigoTarea: "TA001", tarea: "Calibración de equipos de medición", criticidad: 3, noCompetentes: 0, necesitanAyuda: 1, autonomos: 2, formadores: 1, riesgoCobertura: "Medio" },
  { tareaId: 8, codigoTarea: "TA008", tarea: "Mantenimiento correctivo de equipos", criticidad: 3, noCompetentes: 0, necesitanAyuda: 1, autonomos: 1, formadores: 0, riesgoCobertura: "Alto" },
  { tareaId: 9, codigoTarea: "TA009", tarea: "Verificación de materias primas", criticidad: 3, noCompetentes: 0, necesitanAyuda: 0, autonomos: 1, formadores: 1, riesgoCobertura: "Medio" },
  { tareaId: 2, codigoTarea: "TA002", tarea: "Llenado y etiquetado de producto", criticidad: 2, noCompetentes: 0, necesitanAyuda: 1, autonomos: 4, formadores: 0, riesgoCobertura: "Bajo" },
  { tareaId: 5, codigoTarea: "TA005", tarea: "Limpieza CIP de reactores", criticidad: 2, noCompetentes: 0, necesitanAyuda: 0, autonomos: 3, formadores: 1, riesgoCobertura: "Bajo" },
  { tareaId: 7, codigoTarea: "TA007", tarea: "Control de temperaturas de almacenamiento", criticidad: 2, noCompetentes: 0, necesitanAyuda: 0, autonomos: 1, formadores: 1, riesgoCobertura: "Medio" },
  { tareaId: 4, codigoTarea: "TA004", tarea: "Gestión de pedidos a proveedor", criticidad: 1, noCompetentes: 0, necesitanAyuda: 0, autonomos: 2, formadores: 0, riesgoCobertura: "Bajo" },
];