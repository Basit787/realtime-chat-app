import { Injectable } from "@nestjs/common";
import type { OkResponseDto } from "./account/dto/account.dto.js";

@Injectable()
export class AppService {
  health(): OkResponseDto {
    return { ok: true };
  }
}
