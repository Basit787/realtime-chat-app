import type { OkResponseDto } from "@app/common";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  health(): OkResponseDto {
    return { ok: true };
  }
}
