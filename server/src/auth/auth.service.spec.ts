import { Test, type TestingModule } from "@nestjs/testing";
import { AUTH } from "./auth.factory.js";
import { AuthService } from "./auth.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AuthService", () => {
  let instance: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: AUTH, useValue: {} }],
    }).compile();

    instance = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
