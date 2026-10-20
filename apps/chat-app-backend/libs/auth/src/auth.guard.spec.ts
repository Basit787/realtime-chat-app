import { Test, type TestingModule } from "@nestjs/testing";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";
import { Reflector } from "@nestjs/core";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AuthGuard", () => {
  let authGuard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, Reflector, { provide: AuthService, useValue: {} }],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
  });

  it("should be defined", () => {
    expect(authGuard).toBeDefined();
  });
});
