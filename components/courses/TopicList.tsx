import type { Topic } from "@/lib/courses/types";

interface TopicListProps {
  topics: Topic[];
}

export function TopicList({ topics }: TopicListProps) {
  if (topics.length === 0) return null;

  return (
    <ul className="mt-4 space-y-2">
      {topics.map((topic, idx) => (
        <li
          key={`${idx}-${topic.title}`}
          className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
        >
          <span
            aria-hidden
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700 dark:bg-blue-400"
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {topic.title}
            </p>
            {topic.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {topic.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
