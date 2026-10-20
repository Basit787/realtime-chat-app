import { Test, type TestingModule } from "@nestjs/testing";
import { StorageService } from "@app/common";
import { AuthService } from "../auth/auth.service.js";
import { SessionGuard } from "../auth/session.guard.js";
import { AccountController } from "./account.controller.js";
import { AccountService } from "./account.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AccountController", () => {
  let instance: AccountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: AccountService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: StorageService, useValue: {} },
        { provide: SessionGuard, useValue: {} },
      ],
    }).compile();

    instance = module.get<AccountController>(AccountController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
