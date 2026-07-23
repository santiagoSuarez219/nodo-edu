import type { ResearchGroup } from "../types";

export const RESEARCH_GROUP: ResearchGroup = {
  name: "Grupo de Investigación de Máquinas Inteligentes y Reconocimiento de Patrones (MIRP)",
  desc: "El Grupo de Investigación de Máquinas Inteligentes y Reconocimiento de Patrones (MIRP) se dedica a la investigación de alto nivel en inteligencia artificial, reconocimiento de patrones y sistemas inteligentes. Su objetivo es desarrollar soluciones innovadoras que contribuyan al desarrollo tecnológico y científico del país, además de promover la formación de talento humano altamente calificado en estas áreas en las diferentes etapas de la educación superior: tecnología, pregrado y posgrado.",
  leader: {
    name: "Leonardo Duque Muñoz",
    initial: "L",
    email: "leonardoduque@itm.edu.co",
    phone: "",
  },
  lines: [
    {
      title: "Aprendizaje de máquinas",
      desc: "Desarrollar y aplicar metodologías basadas en algoritmos de aprendizaje de máquinas para la solución de problemas como tareas multietiqueta, desbalance de clases, agrupamiento de datos no etiquetados, transferencia de aprendizaje y aprendizaje sobre datos no estructurados. Incluyendo formulación y ejecución de proyectos de investigación y formación en investigación a diferentes niveles de educación superior.",
      leader: "Andrés Felipe Giraldo Forero",
      researchers: ["A. Giraldo"],
      projects: [
        "Procesamiento de lenguaje natural para análisis de historias clínicas",
        "Análisis de señales bioacústicas para caracterización de ecosistemas silvestres",
      ],
    },
    {
      title: "Procesamiento de datos de alta dimensión",
      desc: "Aplicar tecnologías especializadas para el procesamiento de conjuntos de datos de alto volumen, complejidad, variabilidad y velocidad de crecimiento. Se utilizan análisis de datos estadísticos convencionales y técnicas de inteligencia artificial.",
      leader: "Leonardo Duque Muñoz",
      researchers: [
        "G. Díaz",
        "H. Fandiño",
        "L. Duque",
        "K. Osorno",
        "J. Briñez",
        "R. Ceballos",
      ],
      projects: [
        "Análisis de señales fisiológicas para caracterización de enfermedades",
        "Análisis de imágenes médicas para apoyo al diagnóstico clínico",
        "Análisis de imágenes geoespaciales y multiespectrales para caracterización del suelo en el agro",
        "Procesamiento de lenguaje natural para apoyo a la toma de decisiones en educación, salud y agro",
        "Desarrollo de soluciones de software basadas en IA para promover educación, salud y adopción de tecnologías de información y comunicación en el agro",
      ],
    },
    {
      title: "Sistemas de recomendación y recuperación de información",
      desc: "Desarrollar técnicas de recomendación y recuperación de información basadas en las características y preferencias de los usuarios, con el fin de entregar información útil para la toma de decisiones.",
      leader: "Paula Andrea Rodríguez Marín",
      researchers: ["A. Castro", "D. Nieto", "P. Rodríguez", "L. Vega"],
      projects: [
        "Análisis de señales bioacústicas para caracterización de ecosistemas silvestres",
        "Analítica de datos para la reducción de la deserción estudiantil en educación superior",
      ],
    },
  ],
  seedbeds: [
    {
      name: "Semillero de Inteligencia Artificial",
      leader: "Daniel Alexis Nieto Mora",
      days: "Viernes 10:00 AM - 12:00 PM",
      room: "Bloque O - Salón O5",
    },
    {
      name: "Semillero DATA+STEM",
      leader: "Laura Stella Vega Escobar",
      days: "",
      room: "",
    },
    {
      name: "Semillero de Investigación en Tratamiento y Análisis de Imágenes Médicas (SITAIM)",
      leader: "Kevin Osorno Castillo",
      days: "Martes",
      room: "Oficina K102 - 2:00 PM - 4:00 PM",
    },
  ],
  opportunities: [
    {
      tag: "Una vez al año",
      title: "Jóvenes Investigadores",
      desc: "Vinculación de estudiantes de cualquier semestre a proyectos activos del grupo, con apoyo económico.",
    },
    {
      tag: "Todo el año",
      title: "Jóvenes Talento",
      desc: "Vinculación de estudiantes de cualquier semestre a proyectos de Minciencias del grupo, con apoyo económico.",
    },
    {
      tag: "Todo el año",
      title: "Auxiliar de investigación",
      desc: "Apoyo en tareas de recolección, procesamiento y análisis de datos de los proyectos en curso.",
    },
  ],
};
