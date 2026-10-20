// Body of every error reply; the clients read `error`
export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[] | undefined>;
}
