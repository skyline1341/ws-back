import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "ws";
import { of } from "rxjs";
import { CanvasService } from "./services/canvas.service";

const INIT_MESSAGE_KEY = "init";
const PAINT_MESSAGE_KEY = "p";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class SocketGateway {
  @WebSocketServer()
  private server: Server;

  private data: string[] = [];

  constructor(
    private canvasService: CanvasService
  ) {
  }

  @SubscribeMessage(PAINT_MESSAGE_KEY)
  public onPaintEvent(client: any, payload: string): void {
    if (this.data.length > 100) {
      this.savePointsToCanvas(this.data);
      this.data = [];
    }

    this.data.push(payload);
    this.server.clients.forEach((i) =>
      i.send(JSON.stringify({ event: PAINT_MESSAGE_KEY, data: payload }))
    );
  }

  @SubscribeMessage(INIT_MESSAGE_KEY)
  public onCanvasInitEvent(): any {
    return of({
      event: INIT_MESSAGE_KEY, data: {
        bg: this.canvasService.getCanvasFileBinaryLike(),
        data: this.data
      }
    });
  }

  private savePointsToCanvas(pointsData: string[]): void {
    this.canvasService.generateCanvas(pointsData);
  }

}
