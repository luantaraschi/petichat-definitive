import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json({ code, message, details }, { status });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error("[API Error]", error);

  if (error instanceof ZodError) {
    return apiError(
      "VALIDATION_ERROR",
      "Dados inválidos",
      400,
      error.issues
    );
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "UNAUTHORIZED":
        return apiError("UNAUTHORIZED", "Autenticação necessária", 401);
      case "FORBIDDEN":
        return apiError("FORBIDDEN", "Acesso negado", 403);
      case "NOT_FOUND":
        return apiError("NOT_FOUND", "Recurso não encontrado", 404);
      default:
        break;
    }
  }

  return apiError("INTERNAL_ERROR", "Ocorreu um erro inesperado", 500);
}
