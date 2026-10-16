/** Body of every error reply (see `errorHandler`); the client reads it in `getResponseMessage`. */
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[] | undefined>;
}
