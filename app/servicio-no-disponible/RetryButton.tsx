"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ErrorState";

// `ErrorState.onRetry` es una función, así que no puede pasarse desde el
// Server Component de la página (page.tsx) — cruza el límite server/client
// como cualquier otro prop de función. Este componente es quien posee el
// callback y por eso es quien renderiza `ErrorState`, siguiendo el mismo
// patrón que `app/error.tsx`/`app/global-error.tsx` (ambos "use client").
interface Props {
  fallbackPath?: string;
}

export function ServiceUnavailableCard({ fallbackPath }: Props) {
  const router = useRouter();

  return (
    <ErrorState
      title="No pudimos verificar tu sesión"
      description="El servicio de autenticación no está respondiendo. Tu sesión sigue activa — esto no es un problema con tu usuario ni tu contraseña. Intenta de nuevo en unos segundos."
      retryLabel="Reintentar"
      onRetry={() => {
        // Si conocemos la ruta original (?from=), navegar ahí — vuelve a
        // pasar por el middleware y por requireUser()/requireAnyRole() de
        // esa página. Sin `from`, refrescar esta misma página basta.
        if (fallbackPath) router.push(fallbackPath);
        else router.refresh();
      }}
    />
  );
}
