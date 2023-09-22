import { fabric } from "fabric";

export interface CustomRectOptions extends fabric.IRectOptions {
  originalFill?: string;
  squareValue?: number;
}
