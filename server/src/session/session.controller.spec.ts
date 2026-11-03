import { Test, type TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth/auth.service.js";
import { SessionGuard } from "../auth/session.guard.js";
import { RefreshTokenService } from "./refresh-token.service.js";
import { SessionController } from "./session.controller.js";
import { SessionService } from "./session.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("SessionController", () => {
  let instance: SessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        { provide: SessionService, useValue: {} },
        { provide: AuthService, useValue: {} },
        { provide: SessionGuard, useValue: {} },
        { provide: RefreshTokenService, useValue: {} },
      ],
    }).compile();

    instance = module.get<SessionController>(SessionController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
