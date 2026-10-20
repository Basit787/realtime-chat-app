// Thrown by services; becomes `{ error, details? }` with the given status
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: Record<string, string[] | undefined>,
  ) {
    super(message);
  }
}
