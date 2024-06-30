import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["x-csrf-token"],
  });
  // app.useStaticAssets(join(__dirname, "..", "logos"), {
  //   prefix: "/logo/",
  // });
  await app.listen(3000);
}
bootstrap();
