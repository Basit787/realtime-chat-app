import { Test, type TestingModule } from "@nestjs/testing";
import { appConfig } from "@app/common";
import { AuthController } from "./auth.controller.js";
import { AUTH } from "./auth.factory.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AuthController", () => {
  let instance: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AUTH, useValue: {} },
        { provide: appConfig.KEY, useValue: {} },
      ],
    }).compile();

    instance = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
