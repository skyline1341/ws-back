import { Injectable } from "@nestjs/common";
import { Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage } from "canvas";
import * as fs from "fs";
import { Point } from "../models/point.model";
import { Line } from "../models/line.model";

const IMAGE_PATH = "./image.png";

@Injectable()
export class CanvasService {

  public getCanvasFileBinaryLike(): Buffer | unknown[] {
    return fs.existsSync(IMAGE_PATH) ? fs.readFileSync(IMAGE_PATH) : [];
  }

  public generateCanvas(pointsData: string[]): void {
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
