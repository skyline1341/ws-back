import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "ws";
import { of } from "rxjs";
import { Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage } from "canvas";
import * as fs from "fs";

let data: string[] = [];
const IMAGE_PATH = "./image.png";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class EventsGateway {
  @WebSocketServer()
  private server: Server; // public?

  @SubscribeMessage("p")
  public onPaintEvent(client: any, payload: string): void {
    if (data.length > 100) {
      this.savePointsToCanvas(data);
      data = [];
    }

    data.push(payload);
    this.server.clients.forEach((i) =>
      i.send(JSON.stringify({ event: "p", data: payload }))
    );
  }

  @SubscribeMessage("init")
  public onCanvasInitEvent(): any {
    return of({
      event: "init", data: {
        bg: this.getCanvasFileBinaryLike(),
        data
      }
    });
  }

  private savePointsToCanvas(pointsData: string[]): void {
    this.generateCanvas(pointsData);
  }

  private generateCanvas(pointsData: string[]): void {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext("2d");

    if (fs.existsSync(IMAGE_PATH)) {
      loadImage(IMAGE_PATH).then((image: Image) => {
        ctx.drawImage(image, 0, 0);
        this.draw(pointsData, ctx);
        this.saveCanvasToFile(canvas);
      });
      return;
    }

    this.draw(pointsData, ctx);
    this.saveCanvasToFile(canvas);
  }

  private draw(pointsData: string[], ctx: CanvasRenderingContext2D): void {

    pointsData.forEach(item => {
      const itemData: Point | Line = JSON.parse(item);
      if ("x1" in itemData && itemData.x1) {
        this.paintLine(itemData, ctx);
      } else if ("x" in itemData && itemData.x) {
        const dataLine: Line = {
          x1: itemData.x,
          y1: itemData.y,
          x2: itemData.x,
          y2: itemData.y,
          c: itemData.c,
          w: itemData.w
        };
        this.paintLine(dataLine, ctx);
      }
    });
  }

  private saveCanvasToFile(canvas: Canvas): void {
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(IMAGE_PATH, buffer);
  }

  private getCanvasFileBinaryLike(): any {
    return fs.existsSync(IMAGE_PATH) ? fs.readFileSync(IMAGE_PATH) : [];
  }

  private paintLine(line: Line, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = line.c;
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.lineWidth = line.w;
    ctx.strokeStyle = line.c;
    ctx.stroke();
  }

}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: string;
  w: number;
}

interface Point {
  x: number;
  y: number;
  c: string;
  w: number;
}
