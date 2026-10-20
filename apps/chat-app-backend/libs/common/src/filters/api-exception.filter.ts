import { HttpError, type ApiErrorResponse } from "backend-common";
import { Catch, HttpException, HttpStatus, Logger, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

type HttpExceptionBody = { message?: string | string[]; error?: string; details?: ApiErrorResponse["details"] };

// Keeps the `{ error, details? }` error body both clients read, instead of Nest's default shape
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== "http") return;
    const { httpAdapter } = this.adapterHost;
    const response: unknown = host.switchToHttp().getResponse();
    if (httpAdapter.isHeadersSent(response)) return;

    const { status, body } = this.toReply(exception);
    httpAdapter.reply(response, body, status);
  }

  private toReply(exception: unknown): { status: number; body: ApiErrorResponse } {
    if (exception instanceof HttpError) {
      return { status: exception.statusCode, body: this.body(exception.message, exception.details) };
    }
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === "string") return { status: exception.getStatus(), body: this.body(response) };
      const { message, error, details } = response as HttpExceptionBody;
      // Our own exceptions carry `error`; Nest's built-ins put the text in `message`
      const text =
        details || !message ? (error ?? exception.message) : Array.isArray(message) ? message.join(", ") : message;
      return { status: exception.getStatus(), body: this.body(text, details) };
    }
    this.logger.error(exception instanceof Error ? (exception.stack ?? exception.message) : String(exception));
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, body: this.body("Internal server error") };
  }

  private body(error: string, details?: ApiErrorResponse["details"]): ApiErrorResponse {
    return details ? { error, details } : { error };
  }
}
