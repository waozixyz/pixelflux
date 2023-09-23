import { fabric } from "fabric";
import { CustomRectOptions, Cell } from "./interfaces";
import { store, setSelectedSquare } from "./store";

const canvasCache: { [id: string]: fabric.Canvas } = {};
const CELL_SIZE = 32;
const GRID_COLOR = "#333";
const BACKGROUND_COLOR = "#000";

function createCanvas(canvasId: string, stages: Cell[][][]): fabric.Canvas {
  const gridWidth = stages[0][0].length;
  const totalHeight = stages.reduce((acc, stage) => acc + stage.length, 0);
  
  const canvas = new fabric.Canvas("c", { selection: false });
  canvas.setWidth(gridWidth * CELL_SIZE);
  canvas.setHeight(totalHeight * CELL_SIZE);  // Adjusted height for all stages
  canvas.backgroundColor = BACKGROUND_COLOR;
  canvas.renderAll();

  if (!canvasCache[canvasId]) {
    window.addEventListener('resize', () => resizeCanvas(canvas, gridWidth, totalHeight));
  }

  resizeCanvas(canvas, gridWidth, totalHeight);
  return canvas;
}

function showCanvas(canvasId: string, stages: Cell[][][]) {
  
  const canvasElement = document.getElementById(canvasId);
  if (canvasElement) {
    canvasElement.style.display = 'block';
  }

  if (canvasCache[canvasId]) {
    const gridWidth = stages[0][0].length;
    const totalHeight = stages.reduce((acc, stage) => acc + stage.length, 0);
  
    resizeCanvas(canvasCache[canvasId], gridWidth, totalHeight);
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
function fromGweiToMatic(value: bigint) {
  return Number(value) / 10**9;
}

export function setupCanvas(canvasId: string, stages: Cell[][][]): fabric.Canvas {
  displaySquareContent(false);

  // For now, only use the first stage's allCells
  const stage1 = stages[0];

  if (canvasCache[canvasId]) {
      showCanvas(canvasId, stages);
      return canvasCache[canvasId];
  }

  const canvas = createCanvas(canvasId, stages);
  let yOffset = 0;
  for (const stage of stages) {
    setupCanvasContent(canvas, stage, yOffset);
    yOffset += stage.length * CELL_SIZE; 
  }
  canvasCache[canvasId] = canvas;

  return canvas;
}

function displaySquareContent(show: boolean) {
  const element = document.querySelector('.square-content') as HTMLElement;
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

function setupCanvasContent(canvas: fabric.Canvas, allCells: Cell[][], yOffset: number): fabric.Canvas {
  const gridHeight = allCells.length;
  const gridWidth = allCells[0].length;

  // Set canvas background to the grid image
  const gridImageUrl = generateGridImage(gridWidth, gridHeight);
  canvas.setBackgroundColor(gridImageUrl, () => canvas.renderAll());
  canvas.backgroundColor = "#000";

  const squares: fabric.Rect[] = [];
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      let fillColor = "#000";
      let cell = allCells[y][x];
      let currentValue = fromGweiToMatic(cell.baseValue);
      if (cell.layers.length > 0) {
        fillColor = cell.layers[cell.layers.length - 1].color;
      }
      const square = new fabric.Rect({
          width: CELL_SIZE,
          height: CELL_SIZE,
          stroke: GRID_COLOR,
          fill: fillColor,
          top: (CELL_SIZE * y) + yOffset,
          left: (CELL_SIZE * x),
          lockMovementX: true,
          lockMovementY: true,
          hasControls: false,
          hoverCursor: 'pointer',
          originalFill: fillColor,
          squareValue: currentValue,
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