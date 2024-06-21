import { Body, Controller, Get, Post, Req, Res, Session, UseGuards } from "@nestjs/common";
import { Session as ExpressSession } from 'express-session';
import { AuthService } from "./auth.service";
import { LoginRequestDto } from "./dto/login-request.dto";
import { RegisterRequestDto } from "./dto/register-request.dto";
import { LocalAuthGuard } from "./guards/local-auth";
import { IsAuthenticated } from "./guards/is-authenticated";
import { Request, Response } from "express";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login() {
    return {
      message: "Logged in",
    }
  }

  @Post("/register")
  register(@Body() registerRequestDTO: RegisterRequestDto) {
    return this.authService.registerUser(registerRequestDTO);
  }

  @UseGuards(IsAuthenticated)
  @Get("/protected")
  hello() {
    return "Hello World!!"
  }

  @UseGuards(IsAuthenticated)
  @Post('/logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(request, response)
  }
}
