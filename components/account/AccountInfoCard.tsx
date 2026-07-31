import type { Profile } from "@/lib/students/types";

interface Props {
  email: string;
  profile: Profile;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function AccountInfoCard({ email, profile }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[var(--radius-base)] px-6 py-5">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Información de cuenta
      </h2>

      <dl className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-0 sm:items-center">
          <dt className="text-sm font-semibold text-gray-700 dark:text-gray-300 sm:w-36 shrink-0">
            Correo
          </dt>
          <dd className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {email}
          </dd>
        </div>

        <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-0 sm:items-center">
          <dt className="text-sm font-semibold text-gray-700 dark:text-gray-300 sm:w-36 shrink-0">
            Miembro desde
          </dt>
          <dd className="text-sm text-gray-500 dark:text-gray-400">
            {formatDate(profile.created_at)}
          </dd>
        </div>

        {profile.github_username && (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-0 sm:items-center">
            <dt className="text-sm font-semibold text-gray-700 dark:text-gray-300 sm:w-36 shrink-0">
              GitHub
            </dt>
            <dd className="text-sm truncate">
              <a
                href={`https://github.com/${profile.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 dark:text-blue-400 hover:underline"
              >
                {profile.github_username}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
