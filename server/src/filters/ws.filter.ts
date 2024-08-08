import { Catch, ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Catch(WsException)
export class WSExceptionsFilter implements ExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const message = exception.message;
    const client = host.switchToWs().getClient();
    client.emit("exception", { message });
  }
}
