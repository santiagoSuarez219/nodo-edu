import type { Course, CourseAudience, CourseLevel } from "@/lib/courses/types";

const audienceLabels: Record<CourseAudience, string> = {
  "ingenieria-de-sistemas": "Ingeniería de sistemas",
  "ingenieria-electronica": "Ingeniería electrónica",
  "ciencia-de-datos": "Ciencia de datos",
};

const levelLabels: Record<CourseLevel, string> = {
  introductorio: "Introductorio",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

const levelStyles: Record<CourseLevel, string> = {
  introductorio:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermedio:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  avanzado:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <header className="border-b border-gray-200 dark:border-gray-700 pb-8">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium ${levelStyles[course.level]}`}
        >
          {levelLabels[course.level]}
        </span>
        {course.audience.map((a) => (
          <span
            key={a}
            className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
          >
            {audienceLabels[a]}
          </span>
        ))}
      </div>
      <h1 className="mt-4 text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">
        {course.title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600 dark:text-gray-300">
        {course.summary}
      </p>
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        {course.lessons.length}{" "}
        {course.lessons.length === 1 ? "clase disponible" : "clases disponibles"}
      </p>
    </header>
  );
}
