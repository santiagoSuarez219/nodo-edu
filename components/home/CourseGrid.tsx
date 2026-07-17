import type { Course } from "@/lib/courses";
import { HomeCourseCard } from "./HomeCourseCard";

interface CourseGridProps {
  courses: Course[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <HomeCourseCard key={course.slug} course={course} />
      ))}
    </div>
  );
}
