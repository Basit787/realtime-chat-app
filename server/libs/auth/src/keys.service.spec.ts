import { Test, type TestingModule } from "@nestjs/testing";
import { appConfig } from "@app/common";
import { SigningKeyRepository } from "@app/db";
import { KeysService } from "./keys.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("KeysService", () => {
  let instance: KeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeysService,
        { provide: SigningKeyRepository, useValue: {} },
        { provide: appConfig.KEY, useValue: {} },
      ],
    }).compile();

    instance = module.get<KeysService>(KeysService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
