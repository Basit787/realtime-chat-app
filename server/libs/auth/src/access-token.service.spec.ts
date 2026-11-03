import { Test, type TestingModule } from "@nestjs/testing";
import { AccessTokenService } from "./access-token.service.js";
import { KeysService } from "./keys.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AccessTokenService", () => {
  let accessTokens: AccessTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessTokenService, { provide: KeysService, useValue: {} }],
    }).compile();

    accessTokens = module.get<AccessTokenService>(AccessTokenService);
  });

  it("should be defined", () => {
    expect(accessTokens).toBeDefined();
  });
});
