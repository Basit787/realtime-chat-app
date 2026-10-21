import { appConfig } from "@app/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: appConfig.KEY,
          useValue: { auth: { jwksUrl: "http://localhost:3001/.well-known/jwks.json", issuer: "", audience: "" } },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });
});
