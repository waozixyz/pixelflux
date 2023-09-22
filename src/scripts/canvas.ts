import { fabric } from "fabric";
import { roundToTwoSigFigs } from './utils';
import * as polygonConfig from '../config/polygon.json';
import * as defaultConfig from '../config/default.json';
import { CustomRectOptions } from "./interfaces";
import { store, setSelectedSquare } from "./store";

const canvasCache: { [id: string]: fabric.Canvas } = {};
const CELL_SIZE = 32;
const BACKGROUND_COLOR = "#000";

function getConfigBasedOnCanvasId(canvasId: string) {
  return canvasId === 'polygon' ? polygonConfig : defaultConfig;
}

function createCanvas(canvasId: string, prop): fabric.Canvas {
  const gridWidth = prop.shape[0].length;
  const gridHeight = prop.shape.length;
  
  const canvas = new fabric.Canvas("c", { selection: false });
  canvas.setWidth(gridWidth * CELL_SIZE);
  canvas.setHeight(gridHeight * CELL_SIZE);
  canvas.backgroundColor = BACKGROUND_COLOR;
  canvas.renderAll();

  if (!canvasCache[canvasId]) {
    window.addEventListener('resize', () => resizeCanvas(canvas, gridWidth, gridHeight));
  }

  resizeCanvas(canvas, gridWidth, gridHeight);
  return canvas;
}

function showCanvas(canvasId: string) {
  const canvasElement = document.getElementById(canvasId);
  if (canvasElement) {
    canvasElement.style.display = 'block';
  }

  if (canvasCache[canvasId]) {
    const prop = getConfigBasedOnCanvasId(canvasId);
    const gridWidth = prop.shape[0].length;
    const gridHeight = prop.shape.length;
    resizeCanvas(canvasCache[canvasId], gridWidth, gridHeight);
  }
}

function generateGridImage(gridWidth: number, gridHeight: number): string {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = gridWidth * CELL_SIZE;
  tempCanvas.height = gridHeight * CELL_SIZE;

  const ctx = tempCanvas.getContext('2d')!; 

  for (let x = 0; x <= gridWidth; x += CELL_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridWidth);
  }

  for (let y = 0; y <= gridHeight; y += CELL_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(gridHeight, y);
  }

  ctx.stroke();

  return tempCanvas.toDataURL();
}

function resizeCanvas(canvas: fabric.Canvas, gridWidth: number, gridHeight: number) {
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) {
      const width = canvasContainer.clientWidth;
      const height = canvasContainer.clientHeight;
      
      const scaleX = width / (gridWidth * CELL_SIZE);
      const scaleY = height / (gridHeight * CELL_SIZE);
      const scale = Math.min(scaleX, scaleY);
      
      canvas.setZoom(scale);

      canvas.setWidth(gridWidth * CELL_SIZE * scale);
      canvas.setHeight(gridHeight * CELL_SIZE * scale);
      
      const gridImageUrl = generateGridImage(gridWidth, gridHeight);
      canvas.setBackgroundColor(gridImageUrl, () => canvas.renderAll());
      
      canvas.renderAll();
      canvas.backgroundColor = "#000";
      
      canvas.calcOffset();
  }
}


export function setupCanvas(canvasId: string): fabric.Canvas {
  displaySquareContent(false);

  if (canvasCache[canvasId]) {
    showCanvas(canvasId);
    return canvasCache[canvasId];
  }

  const prop = getConfigBasedOnCanvasId(canvasId);
  const canvas = createCanvas(canvasId, prop);
  setupCanvasContent(canvas, prop);
  canvasCache[canvasId] = canvas;

  return canvas;
}

function displaySquareContent(show: boolean) {
  const element = document.querySelector('.square-content') as HTMLElement;
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

function setupCanvasContent(canvas: fabric.Canvas, prop): fabric.Canvas {
  const gridWidth = prop.shape[0].length;
  const gridHeight = prop.shape.length;

  // Set canvas background to the grid image
  const gridImageUrl = generateGridImage(gridWidth, gridHeight);
  canvas.setBackgroundColor(gridImageUrl, () => canvas.renderAll());
  canvas.backgroundColor = "#000";

  const squares: fabric.Rect[] = [];
  const currentShape: string[] = prop.shape;

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      let isX = currentShape[y] ? currentShape[y][x] ? currentShape[y][x] === "x" : false : false;
      let fillColor = "#000";
      let currentValue = prop.initialValue * (y + 1) * (x + 1) * 3;
      if (isX) {
          const positionFactor = 1 - (x / gridWidth + y / gridHeight) / 2;
          const darkeningFactor = Math.floor(255 * positionFactor);

          const redValue = Math.floor((prop.color.r * (255 - darkeningFactor) / 255) + (255 * darkeningFactor / 255));
          const greenValue = Math.floor((prop.color.g * (255 - darkeningFactor) / 255) + (255 * darkeningFactor / 255));
          const blueValue = Math.floor((prop.color.b * (255 - darkeningFactor) / 255) + (255 * darkeningFactor / 255));

          const redHex = redValue.toString(16).padStart(2, "0");
          const greenHex = greenValue.toString(16).padStart(2, "0");
          const blueHex = blueValue.toString(16).padStart(2, "0");

          fillColor = `#${redHex}${greenHex}${blueHex}`;
          currentValue *= (255 / (darkeningFactor + 1)) * 9;
      } 

      const square = new fabric.Rect({
          width: CELL_SIZE,
          height: CELL_SIZE,
          stroke: prop.gridColor,
          fill: fillColor,
          top: (CELL_SIZE * y),
          left: (CELL_SIZE * x),
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
          hoverCursor: 'pointer',
          originalFill: fillColor,
          squareValue: roundToTwoSigFigs(currentValue),
      } as CustomRectOptions);

      square.on('mousedown', function (e) {
        if (!e.target) return;
    
        if (store.selectedSquare && store.selectedSquare !== e.target) {
            store.selectedSquare.set('strokeWidth', 1);
        }
        e.target.set('strokeWidth', 4);
        setSelectedSquare(e.target as fabric.Rect);
    
        if(!store.selectedSquare.squareValue) return;

        displaySquareContent(true)
        const currentValueElement = document.getElementById('current-value')!;
        currentValueElement.textContent = store.selectedSquare.squareValue.toString();
      });

      squares.push(square);
    }
  }
  canvas.add(...squares);

  return canvas;
}