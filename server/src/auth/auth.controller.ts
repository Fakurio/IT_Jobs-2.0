import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import RegisterRequestSchema, {
  RegisterRequestDto,
} from "./dto/register-request.dto";
import { LocalAuthGuard } from "./guards/local-auth";
import { IsAuthenticated } from "./guards/is-authenticated";
import { Request, Response } from "express";
import { ZodValidationPipe } from "./pipes/zod-validation.pipe";
import { GenerateCsrfTokenInterceptor } from "./interceptors/generate-csrf-token.interceptor";
import { CheckCsrfTokenInterceptor } from "./interceptors/check-csrf-token.interceptor";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseInterceptors(GenerateCsrfTokenInterceptor)
  @UseGuards(LocalAuthGuard)
  @Post("/login")
  login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.status(200);
    return this.authService.login(req);
  }

  @UsePipes(new ZodValidationPipe(RegisterRequestSchema))
  @Post("/register")
  register(@Body() registerRequestDTO: RegisterRequestDto) {
    return this.authService.registerUser(registerRequestDTO);
  }

  @UseInterceptors(CheckCsrfTokenInterceptor)
  @UseGuards(IsAuthenticated)
  @Get("/protected")
  hello() {
    return "Hello World!!";
  }

  @UseGuards(IsAuthenticated)
  @Post("/logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.status(200);
    return this.authService.logout(request, response);
  }
}
