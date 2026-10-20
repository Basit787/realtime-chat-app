import { BadRequestException, ValidationPipe, type ValidationError } from "@nestjs/common";

const fieldErrors = (errors: ValidationError[]) =>
  Object.fromEntries(errors.map((e) => [e.property, Object.values(e.constraints ?? {})]));

// 400 with `{ error, details: { field: [messages] } }`, the same shape as the chat API
export const httpValidationPipe = () =>
  new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => new BadRequestException({ error: "Invalid request", details: fieldErrors(errors) }),
  });
