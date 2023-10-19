import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { CanvasService } from "./services/canvas.service";

@Module({
  providers: [
    SocketGateway,
    CanvasService
  ]
})
export class SocketModule {
}
