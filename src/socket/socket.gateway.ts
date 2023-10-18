import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "ws";
import { of } from "rxjs";

const data: string[] = [];

@WebSocketGateway({
  cors: {
    origin: "*"
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage("p")
  onPaintEvent(client: any, payload: string): void {
    if (data.length > 10000) {
      data.shift();
    }

    data.push(payload);
    this.server.clients.forEach((i) =>
      i.send(JSON.stringify({ event: "p", data: payload }))
    );
  }

  @SubscribeMessage("init")
  onCanvasInitEvent(): any {
    return of(data);
  }
}
