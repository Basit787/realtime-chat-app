import { Test, type TestingModule } from "@nestjs/testing";
import { appConfig, StorageService } from "@app/common";
import { AccountService } from "./account.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AccountService", () => {
  let instance: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService, { provide: StorageService, useValue: {} }, { provide: appConfig.KEY, useValue: {} }],
    }).compile();

    instance = module.get<AccountService>(AccountService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
