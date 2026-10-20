import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { AppService } from "./app.service.js";
import { OkResponseDto } from "./account/dto/account.dto.js";

@ApiTags("Health")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOkResponse({ type: OkResponseDto })
  health(): OkResponseDto {
    return this.appService.health();
  }
}
