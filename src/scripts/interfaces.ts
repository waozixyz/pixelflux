import { fabric } from "fabric";

export interface CustomRectOptions extends fabric.IRectOptions {
  originalFill?: string;
  squareValue?: number;
}

export interface Layer {
  owner: string;
  color: string;
}

export interface Cell {
  baseValue: number; 
  layers: Layer[];
}
