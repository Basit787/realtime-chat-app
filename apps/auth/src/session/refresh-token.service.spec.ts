import { appConfig } from "@app/common";
import { RefreshTokenRepository } from "@app/db";
import { Test, type TestingModule } from "@nestjs/testing";
import { RefreshTokenService } from "./refresh-token.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("RefreshTokenService", () => {
  let instance: RefreshTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: RefreshTokenRepository, useValue: {} },
        { provide: appConfig.KEY, useValue: {} },
      ],
    }).compile();

    instance = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
