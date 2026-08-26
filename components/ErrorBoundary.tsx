"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ErrorState";

interface ErrorBoundaryProps {
  children: ReactNode;
  title: string;
  description: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Boundary de React de clase (no hay equivalente en hooks): un fallo dentro
// de `children` degrada SOLO este recuadro, sin desmontar el resto de la
// página — a diferencia de un error.tsx de segmento, que se lleva puesto
// todo el layout. Pensado para componentes que se proyectan en clase
// (panel de asistencia docente, formulario de asistencia del estudiante).
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error);
    // Único punto que ve fallos aislados (panel de asistencia, formulario del
    // estudiante) que por diseño no escalan a ningún error.tsx (spec-052, D7).
    Sentry.captureException(error, {
      tags: { boundary: "component" },
      contexts: { react: { componentStack: errorInfo.componentStack } },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.title}
          description={this.props.description}
          onRetry={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
