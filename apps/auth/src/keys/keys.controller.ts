import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { JSONWebKeySet } from "jose";
import { KeysService } from "./keys.service.js";

@ApiTags("Keys")
@Controller(".well-known")
export class KeysController {
  constructor(private readonly keysService: KeysService) {}

  // Public keys other services verify access tokens with
  @Get("jwks.json")
  @ApiOkResponse({ description: "JSON Web Key Set" })
  jwks(): Promise<JSONWebKeySet> {
    return this.keysService.jwks();
  }
}
