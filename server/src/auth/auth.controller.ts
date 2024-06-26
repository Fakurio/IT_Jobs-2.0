import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import RegisterRequestSchema, {
  RegisterRequestDto,
} from './dto/register-request.dto';
import { LocalAuthGuard } from './guards/local-auth';
import { IsAuthenticated } from './guards/is-authenticated';
import { Request, Response } from 'express';
import { ZodValidationPipe } from './pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Req() req: any) {
    return this.authService.login(req);
  }

  @UsePipes(new ZodValidationPipe(RegisterRequestSchema))
  @Post('/register')
  register(@Body() registerRequestDTO: RegisterRequestDto) {
    return this.authService.registerUser(registerRequestDTO);
  }

  @UseGuards(IsAuthenticated)
  @Get('/protected')
  hello() {
    return 'Hello World!!';
  }

  @UseGuards(IsAuthenticated)
  @Post('/logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(request, response);
  }
}
