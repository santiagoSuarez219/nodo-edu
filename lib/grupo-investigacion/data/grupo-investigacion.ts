import type { ResearchGroup } from "../types";

export const RESEARCH_GROUP: ResearchGroup = {
  name: "Grupo de Investigación en Ciencia de Datos e Inteligencia Artificial",
  desc: "Investigamos métodos de aprendizaje automático, cómputo de alto rendimiento y sus aplicaciones en problemas científicos y sociales, con foco en resultados reproducibles y transferencia al aula.",
  leader: {
    name: "[Nombre del líder]",
    initial: "N",
    email: "grupo.investigacion@nodo.edu",
    phone: "+57 (000) 000 0000",
  },
  lines: [
    {
      title: "Aprendizaje automático aplicado",
      desc: "Modelos predictivos y de clasificación aplicados a problemas de salud, educación y ciudades.",
      leader: "[Nombre docente]",
      researchers: ["A. Gómez", "L. Ramírez", "D. Torres"],
      projects: [
        "Predicción de deserción estudiantil",
        "Clasificación de imágenes satelitales",
      ],
    },
    {
      title: "Cómputo científico y simulación",
      desc: "Métodos numéricos y simulación de sistemas físicos y biológicos de gran escala.",
      leader: "[Nombre docente]",
      researchers: ["M. Duarte", "S. Peña"],
      projects: [
        "Simulación de dinámica de fluidos",
        "Modelado epidemiológico",
      ],
    },
    {
      title: "Sistemas inteligentes y datos",
      desc: "Arquitecturas de datos, procesamiento distribuido y sistemas de recomendación.",
      leader: "[Nombre docente]",
      researchers: ["J. Ortiz", "C. Vargas", "R. Salas"],
      projects: [
        "Motor de recomendación de cursos",
        "Pipeline de datos abiertos",
      ],
    },
  ],
  seedbeds: [
    {
      name: "Semillero de IA Aplicada",
      leader: "[Nombre]",
      days: "Martes y jueves",
      room: "Aula 302",
    },
    {
      name: "Semillero de Cómputo Científico",
      leader: "[Nombre]",
      days: "Miércoles",
      room: "Lab. 4",
    },
    {
      name: "Semillero de Datos y Sistemas",
      leader: "[Nombre]",
      days: "Viernes",
      room: "Aula 210",
    },
  ],
  opportunities: [
    {
      tag: "Convocatoria abierta",
      title: "Jóvenes Investigadores",
      desc: "Vinculación de estudiantes de últimos semestres a proyectos activos del grupo, con apoyo económico.",
    },
    {
      tag: "Todo el año",
      title: "Jóvenes Talento",
      desc: "Programa para estudiantes de primeros semestres con alto desempeño académico interesados en investigación.",
    },
    {
      tag: "Semestral",
      title: "Auxiliar de investigación",
      desc: "Apoyo en tareas de recolección, procesamiento y análisis de datos de los proyectos en curso.",
    },
  ],
};
