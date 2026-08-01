"use client";

import { Component, type ReactNode } from "react";
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

  componentDidCatch(error: unknown) {
    console.error("Error capturado por ErrorBoundary:", error);
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
