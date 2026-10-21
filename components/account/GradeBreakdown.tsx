import { formatInstitutionalGrade } from "@/lib/grades/compute";
import type { GradeGroup, GradeItemWithScore, GradeSummary } from "@/lib/grades/types";
import { GradeSummaryBlock, formatWeightPercent } from "./GradeSummaryBlock";

interface Props {
  items: GradeItemWithScore[];
  groups: GradeGroup[];
  summary: GradeSummary;
  rowClassName?: string;
}

function ItemRow({
  item,
  className,
  showUnweighted,
}: {
  item: GradeItemWithScore;
  className: string;
  showUnweighted: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {item.name}
        {item.weight !== null ? (
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            {formatWeightPercent(item.weight)}
          </span>
        ) : (
          showUnweighted && (
            <span className="ml-2 text-xs text-amber-700 dark:text-amber-400">
              sin ponderar — no cuenta
            </span>
          )
        )}
      </span>
      <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white shrink-0">
        {item.score !== null ? item.score.toFixed(2) : "—"}
      </span>
    </div>
  );
}

// spec-059 D11/D14: ítems por corte, nota de corte en formato institucional
// (1 decimal, coma), con la marca "incompleto" cuando faltan notas.
export function GradeBreakdown({ items, groups, summary, rowClassName = "py-2.5" }: Props) {
  const groupSummaries = summary.groups;
  const ungrouped = items.filter((i) => !i.group_id || !groups.some((g) => g.id === i.group_id));

  return (
    <>
      <div className="flex flex-col gap-3">
        {groupSummaries.map((gs) => {
          const groupItems = items.filter((i) => i.group_id === gs.group_id);
          return (
            <section key={gs.group_id}>
              <div className="flex items-center justify-between gap-4 pb-1 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {gs.name} · {formatWeightPercent(gs.target_weight)}
                </h3>
                <span className="font-mono text-sm font-bold text-gray-900 dark:text-white shrink-0">
                  {gs.grade_institutional !== null
                    ? formatInstitutionalGrade(gs.grade_institutional)
                    : "—"}
                </span>
              </div>
              {gs.grade_institutional !== null && !gs.is_complete && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Incompleto — faltan notas en este corte.
                </p>
              )}
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {groupItems.map((item) => (
                  <ItemRow key={item.id} item={item} className={rowClassName} showUnweighted={summary.mode === "weighted"} />
                ))}
              </div>
            </section>
          );
        })}

        {ungrouped.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {ungrouped.map((item) => (
              <ItemRow key={item.id} item={item} className={rowClassName} showUnweighted={summary.mode === "weighted"} />
            ))}
          </div>
        )}
      </div>

      <GradeSummaryBlock summary={summary} />

      {groupSummaries.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          La nota de cada corte se redondea a un decimal; la definitiva de la plataforma
          institucional puede diferir en unas centésimas del acumulado.
        </p>
      )}
    </>
  );
}
