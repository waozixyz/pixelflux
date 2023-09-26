import { fabric } from "fabric";
import { CustomRectOptions, Cell, Stage } from "./interfaces";
import { store, setSelectedSquare } from "./store";
import { fromGweiToMatic } from "./utils";
import { updateSidebarForSelectedSquare, displaySquareContent } from "./pixelCard";
import stage2LockedImage from '../../assets/stage2_locked.jpg';
import stage3LockedImage from '../../assets/stage3_locked.jpg';

const canvasCache: { [id: string]: fabric.Canvas } = {};
const CELL_SIZE = 32;
const GRID_COLOR = "#333";
const BACKGROUND_COLOR = "#000";

const STAGE2_ACTIVATION_THRESHOLD = 2000;
const STAGE3_STAGE1_ACTIVATION_THRESHOLD = 15000;
const STAGE3_STAGE2_ACTIVATION_THRESHOLD = 20000; 

const STAGE_DISABLED_HEIGHT = 10;

function createCanvas(canvasId: string, stages: Stage[]): fabric.Canvas {
  const gridWidth = stages[0].cells[0].length;
  const contentHeight = stages.reduce((acc, stage) => acc + stage.cells.length, 0);
  const hasDisabledStage = stages.some(stage => !stage.isEnabled);
  const addedHeightForDisabledStage = hasDisabledStage ? STAGE_DISABLED_HEIGHT : 0;
  const totalHeight = contentHeight + addedHeightForDisabledStage;
  
  const canvas = new fabric.Canvas("c", { selection: false });
  canvas.setWidth(gridWidth * CELL_SIZE);
  canvas.setHeight(totalHeight * CELL_SIZE);

  canvas.backgroundColor = BACKGROUND_COLOR;
  canvas.renderAll();

  if (!canvasCache[canvasId]) {
    window.addEventListener('resize', () => resizeCanvas(canvas, gridWidth, totalHeight));
  }

  resizeCanvas(canvas, gridWidth, totalHeight);
  return canvas;
}

function showCanvas(canvasId: string, stages: Stage[]) {
  
  const canvasElement = document.getElementById(canvasId);
  if (canvasElement) {
    canvasElement.style.display = 'block';
  }

  if (canvasCache[canvasId]) {
    const gridWidth = stages[0][0].length;
    const totalHeight = stages.reduce((acc, stage) => acc + stage.cells.length, 0);
  
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
export function setupCanvas(canvasId: string, stages: Stage[], totalValues: any[]): fabric.Canvas {
  console.log(stages)
  console.log(totalValues)
  displaySquareContent(false);

  if (canvasCache[canvasId]) {
      showCanvas(canvasId, stages);
      return canvasCache[canvasId];
  }

  const canvas = createCanvas(canvasId, stages);
  let yOffset = 0;
  for (const [index, stage] of stages.entries()) {
    if (stage.isEnabled) {
      setupCanvasContent(canvas, stage.cells, yOffset, index);
      yOffset += stage.cells.length;
    } else {
      setupDisabledStageContent(canvas, index, totalValues, yOffset);
      break;
    }
  }

  canvasCache[canvasId] = canvas;

  return canvas;
}


function setupDisabledStageContent(canvas: fabric.Canvas, stageIndex: number, totalValues: any[], yOffset: number): void {
  const imageUrl = stageIndex === 1 ? stage2LockedImage : stage3LockedImage;

  fabric.Image.fromURL(imageUrl, img => {
    const scaleFactor = (STAGE_DISABLED_HEIGHT * CELL_SIZE) / img.height;

    img.set({
        left: 0,
        top: yOffset * CELL_SIZE,
        selectable: false,
        scaleX: scaleFactor,
        scaleY: scaleFactor
    });

    const overlayRect = new fabric.Rect({
      left: -1,
      top: img.top,
      width: img.width * scaleFactor,
      height: img.height * scaleFactor,
      fill: 'rgba(0, 0, 0, 0.5)',
      selectable: false
    });

    canvas.add(img, overlayRect);

    const middleY = img.top + (img.height * scaleFactor) / 2;

    const stageLabel = new fabric.Text(`STAGE ${stageIndex + 1}`, {
        left: img.width * scaleFactor / 2,
        top: middleY - 140,
        fontSize: 60,
        fontFamily: 'kirbyss',
        fill: 'white',
        originX: 'center',
        selectable: false
    });

    const notEnabledLabel = new fabric.Text('Locked', {
        left: img.width * scaleFactor / 2,
        top: middleY + 60,
        fontSize: 60,
        fontFamily: 'kirbyss',
        fill: 'red',
        originX: 'center',
        selectable: false        
    });

    let requiredTotalValueText = "";
    const stage1Value = Math.floor(fromGweiToMatic(totalValues[0]));
    const stage2Value = fromGweiToMatic(totalValues[1]);

    const isStage1Completed = stage1Value >= STAGE2_ACTIVATION_THRESHOLD;
    const isStage3Completed = stage1Value >= STAGE3_STAGE1_ACTIVATION_THRESHOLD && stage2Value >= STAGE3_STAGE2_ACTIVATION_THRESHOLD;

    if (isStage1Completed || isStage3Completed) {
        requiredTotalValueText = "completed";
        notEnabledLabel.text = 'Unlocked';
        notEnabledLabel.fill = 'green';
    } else {
        if (stageIndex === 1) {
            requiredTotalValueText = `Stage 1 Total Value: ${stage1Value}/${STAGE2_ACTIVATION_THRESHOLD} Matic`;
        } else if (stageIndex === 2) {
            requiredTotalValueText = `Stage 1 Total Value: ${stage1Value}/${STAGE3_STAGE1_ACTIVATION_THRESHOLD} Matic, Stage 2 Total Value : ${stage2Value}/${STAGE3_STAGE2_ACTIVATION_THRESHOLD} Matic`;
        }
    }

    const requiredValueLabel = new fabric.Text(requiredTotalValueText, {
        left: img.width * scaleFactor / 2,
        top: middleY - 50,
        fontSize: 30,
        fontFamily: 'kirbyss',
        fill: 'yellow',
        originX: 'center',
        selectable: false
    });

    canvas.add(stageLabel, notEnabledLabel, requiredValueLabel);
  });
}

function setupCanvasContent(canvas: fabric.Canvas, allCells: Cell[][], yOffset: number, stage: number): fabric.Canvas {
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
          squareLayers: cell.layers,
          width: CELL_SIZE,
          height: CELL_SIZE,
          stroke: GRID_COLOR,
          fill: fillColor,
          gridX: x,
          gridY: y,
          stage: stage,
          yOffset: yOffset,
          top: (CELL_SIZE * y) + (yOffset * CELL_SIZE),
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
        const clickedSquare = e.target as fabric.Rect & CustomRectOptions;
        if (store.selectedSquare && store.selectedSquare !== clickedSquare) {
            store.selectedSquare.set('strokeWidth', 1);
            store.selectedSquare.set('fill', store.selectedSquare.originalFill);
        }
        e.target.set('strokeWidth', 4);
        setSelectedSquare(clickedSquare);

        if(!store.selectedSquare.squareValue) return;
        updateSidebarForSelectedSquare(canvas);
      });
      squares.push(square);
    }
  }
  canvas.add(...squares); 

  
  return canvas;
}