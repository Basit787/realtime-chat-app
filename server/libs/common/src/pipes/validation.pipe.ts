import { BadRequestException, ValidationPipe, type ValidationError } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

const fieldErrors = (errors: ValidationError[]) =>
  Object.fromEntries(errors.map((e) => [e.property, Object.values(e.constraints ?? {})]));

const options = { whitelist: true, transform: true } as const;

// REST: 400 with `{ error, details: { field: [messages] } }`, the same shape as the old zod validation
export const httpValidationPipe = () =>
  new ValidationPipe({
    ...options,
    exceptionFactory: (errors) => new BadRequestException({ error: "Invalid request", details: fieldErrors(errors) }),
  });

// Socket events: invalid payloads are rejected with an "exception" event and otherwise ignored
export const wsValidationPipe = () =>
  new ValidationPipe({ ...options, exceptionFactory: () => new WsException("Invalid payload") });
