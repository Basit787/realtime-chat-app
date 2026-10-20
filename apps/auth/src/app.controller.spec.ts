import { Test, type TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

// Dependencies are mocked: this checks the class is wired for injection, not its behaviour
describe("AppController", () => {
  let instance: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: {} }],
    }).compile();

    instance = module.get<AppController>(AppController);
  });

  it("should be defined", () => {
    expect(instance).toBeDefined();
  });
});
