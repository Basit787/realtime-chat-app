import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC = "isPublic";

// Opts a route out of the global AuthGuard; every other route requires a bearer token
export const Public = () => SetMetadata(IS_PUBLIC, true);
