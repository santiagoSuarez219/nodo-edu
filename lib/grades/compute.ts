// spec-059 D6: único cálculo de la nota a la fecha. Sin imports de servidor:
// lo usan las consultas de lib/ y GradesTable (cliente).
//
// Aritmética entera para no arrastrar error de coma flotante: pesos en
// milésimas (0.2 → 200) y notas en centésimas (4.0 → 400).

export interface GradeComputeItem {
  id: string;
  weight: number | null;
  group_id: string | null;
}

export interface GradeComputeGroup {
  id: string;
  name: string;
  order_index: number;
  target_weight: number;
}

export interface GradeGroupSummary {
  group_id: string;
  name: string;
  order_index: number;
  target_weight: number;
  items_weight: number;
  weight_mismatch: boolean;
  weight_graded: number;
  grade: number | null;
  grade_institutional: number | null;
  is_complete: boolean;
}

export interface GradeSummary {
  mode: "weighted" | "unweighted";
  accumulated: number | null;
  projected: number | null;
  weight_defined: number;
  weight_graded: number;
  unweighted_item_count: number;
  groups: GradeGroupSummary[];
}

const toMillis = (weight: number) => Math.round(weight * 1000);
const toCents = (score: number) => Math.round(score * 100);

// Redondeo mitad hacia arriba de n/d (n, d enteros ≥ 0), igual que
// `round(numeric, k)` de Postgres.
function divRoundHalfUp(n: number, d: number): number {
  return Math.floor((2 * n + d) / (2 * d));
}

export function computeGradeSummary(
  items: GradeComputeItem[],
  groups: GradeComputeGroup[],
  scores: Record<string, number | null> | Map<string, number | null>
): GradeSummary {
  const scoreOf = (id: string): number | null =>
    (scores instanceof Map ? scores.get(id) : scores[id]) ?? null;

  const weighted = items.filter((i) => i.weight !== null);

  // D4: ningún ítem ponderado → promedio simple de lo registrado.
  if (weighted.length === 0) {
    const cents = items
      .map((i) => scoreOf(i.id))
      .filter((s): s is number => s !== null)
      .map(toCents);
    const sum = cents.reduce((acc, s) => acc + s, 0);
    return {
      mode: "unweighted",
      accumulated: null,
      projected: cents.length ? divRoundHalfUp(sum, cents.length) / 100 : null,
      weight_defined: 0,
      weight_graded: 0,
      unweighted_item_count: items.length,
      groups: groups
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((g) => ({
          group_id: g.id,
          name: g.name,
          order_index: g.order_index,
          target_weight: g.target_weight,
          items_weight: 0,
          weight_mismatch: toMillis(g.target_weight) !== 0,
          weight_graded: 0,
          grade: null,
          grade_institutional: null,
          is_complete: false,
        })),
    };
  }

  let weightDefined = 0;
  let weightGraded = 0;
  let numerator = 0;

  const perGroup = new Map<
    string,
    { itemsWeight: number; gradedWeight: number; num: number; pending: number }
  >();
  for (const g of groups) {
    perGroup.set(g.id, { itemsWeight: 0, gradedWeight: 0, num: 0, pending: 0 });
  }

  for (const item of weighted) {
    const w = toMillis(item.weight as number);
    const score = scoreOf(item.id);
    const bucket = item.group_id ? perGroup.get(item.group_id) : undefined;

    weightDefined += w;
    if (bucket) bucket.itemsWeight += w;

    if (score === null) {
      if (bucket) bucket.pending += 1;
      continue;
    }
    const contribution = toCents(score) * w;
    weightGraded += w;
    numerator += contribution;
    if (bucket) {
      bucket.gradedWeight += w;
      bucket.num += contribution;
    }
  }

  const groupSummaries: GradeGroupSummary[] = groups
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((g) => {
      const b = perGroup.get(g.id)!;
      const hasGrade = b.gradedWeight > 0;
      return {
        group_id: g.id,
        name: g.name,
        order_index: g.order_index,
        target_weight: g.target_weight,
        items_weight: b.itemsWeight / 1000,
        weight_mismatch: b.itemsWeight !== toMillis(g.target_weight),
        weight_graded: b.gradedWeight / 1000,
        grade: hasGrade ? divRoundHalfUp(b.num, b.gradedWeight) / 100 : null,
        // D14: 1 decimal desde el cociente exacto, nunca desde la nota de 2.
        grade_institutional: hasGrade
          ? divRoundHalfUp(b.num, b.gradedWeight * 10) / 10
          : null,
        is_complete: hasGrade && b.pending === 0,
      };
    });

  return {
    mode: "weighted",
    accumulated:
      weightGraded > 0 ? divRoundHalfUp(numerator, 1000) / 100 : null,
    projected:
      weightGraded > 0 ? divRoundHalfUp(numerator, weightGraded) / 100 : null,
    weight_defined: weightDefined / 1000,
    weight_graded: weightGraded / 1000,
    unweighted_item_count: items.length - weighted.length,
    groups: groupSummaries,
  };
}

// D14: 1 decimal y coma, sin Intl (no depender del locale del navegador).
export function formatInstitutionalGrade(value: number | null): string {
  if (value === null) return "";
  return (Math.round(value * 10) / 10).toFixed(1).replace(".", ",");
}
