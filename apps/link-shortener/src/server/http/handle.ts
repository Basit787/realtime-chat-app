import { ApiError } from "./api-error";
import { errorResponse } from "./error-response";

// Runs a handler and turns thrown ApiErrors (and anything unexpected) into JSON error responses
export async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error.status, error.message, error.details);
    console.error(error);
    return errorResponse(500, "Something went wrong on the server");
  }
}
