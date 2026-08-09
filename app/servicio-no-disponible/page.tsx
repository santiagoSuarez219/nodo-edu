import type { Metadata } from "next";
import { ServiceUnavailableCard } from "./RetryButton";

// spec-046: destino de la Capa 2 (lib/auth/session.ts → requireUser /
// requireRole / requireAnyRole) cuando Supabase Auth no se pudo verificar.
// A diferencia del 503 inline del middleware (lib/auth/service-unavailable-page.ts),
// esta es una página React normal — con layout, navbar (oculta si el propio
// layout no puede resolver el perfil) y tipografía JetBrains Mono — porque
// para cuando el Server Component llega aquí, la petición ya cruzó el
// middleware con éxito o quedó exenta.
//
// force-dynamic + noindex: nunca debe cachearse ni indexarse — es un estado
// transitorio de infraestructura, no contenido.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Servicio no disponible",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function ServiceUnavailablePage({ searchParams }: Props) {
  const { from } = await searchParams;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <ServiceUnavailableCard fallbackPath={from} />
      </div>
    </div>
  );
}
