import { fabric } from "fabric";
import { CustomRectOptions, Cell } from "../interfaces";
import { store, setSelectedSquare } from "../store";
import { fromGweiToMatic } from "../utils";
import { updateSidebarForSelectedSquare } from "../sidebar/pixelCard";

import { CANVAS_CONFIG, STAGE_THRESHOLDS } from "./config";

const generateGridImage = (gridWidth: number, gridHeight: number): string => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = gridWidth * CANVAS_CONFIG.CELL_SIZE;
  tempCanvas.height = gridHeight * CANVAS_CONFIG.CELL_SIZE;

  const ctx = tempCanvas.getContext('2d')!; 

  for (let x = 0; x <= gridWidth; x += CANVAS_CONFIG.CELL_SIZE) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gridWidth);
  }

  for (let y = 0; y <= gridHeight; y += CANVAS_CONFIG.CELL_SIZE) {
    ctx.moveTo(0, y);
    ctx.lineTo(gridHeight, y);
  }

  ctx.stroke();

  return tempCanvas.toDataURL();
}

const resizeCanvas = (canvas: fabric.Canvas, gridWidth: number, gridHeight: number) => {
  const canvasContainer = document.getElementById('canvas-container');
  if (canvasContainer) {
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    
    const scaleX = width / (gridWidth * CANVAS_CONFIG.CELL_SIZE);
    const scaleY = height / (gridHeight * CANVAS_CONFIG.CELL_SIZE);
    const scale = Math.min(scaleX, scaleY);
    
    canvas.setZoom(scale);

    canvas.setWidth(gridWidth * CANVAS_CONFIG.CELL_SIZE * scale);
    canvas.setHeight(gridHeight * CANVAS_CONFIG.CELL_SIZE * scale);
    
    const gridImageUrl = generateGridImage(gridWidth, gridHeight);
    canvas.setBackgroundColor(gridImageUrl, () => canvas.renderAll());
    
    canvas.renderAll();
    canvas.backgroundColor = "#000";
    
    canvas.calcOffset();
  }
}

const updateCanvasCell = (buyer: string, x: number, y: number, numLayers: number, color: string, stage: number, updatedTotalValues: any[]): void => {
  const canvas = store.canvas;
  const square = canvas.getObjects().find((obj: any) => obj.gridX === x && obj.gridY === y && obj.stage === stage) as fabric.Rect & CustomRectOptions;

  if (square) {
    square.set('fill', color);
    square.originalFill = color;
    const updatedLayers = [...square.squareLayers];

    for (let i = 0; i < numLayers; i++) {
      updatedLayers.push({
        owner: buyer,
        color: color
      });
    }
    square.set('squareLayers', updatedLayers);
  
    if (store.selectedSquare && store.selectedSquare.gridX === x && store.selectedSquare.gridY === y && store.selectedSquare.stage === stage) {
      setSelectedSquare(square);
      updateSidebarForSelectedSquare(canvas);
    }

    canvas.renderAll();
  }
  const stage1Value = Number(fromGweiToMatic(updatedTotalValues[0]));
  const stage2Value = Number(fromGweiToMatic(updatedTotalValues[1]));

  const requiredValueLabel = canvas.getObjects().find((obj: any) => obj.type === 'text' && obj.text.includes('Total Value')) as fabric.Text;
 

  if (requiredValueLabel) {
    requiredValueLabel.text = getRequiredTotalValueText(stage, stage1Value, stage2Value);
    canvas.renderAll();
  }

}

const getRequiredTotalValueText = (stageIndex: number, stage1Value: number, stage2Value: number) => {
  if (stage1Value >= STAGE_THRESHOLDS.STAGE2_ACTIVATION || 
      (stage1Value >= STAGE_THRESHOLDS.STAGE3_STAGE1_ACTIVATION && stage2Value >= STAGE_THRESHOLDS.STAGE3_STAGE2_ACTIVATION)) {
      return "completed";
  }

  if (stageIndex === 1) {
      return `Stage 1 Total Value: ${stage1Value}/${STAGE_THRESHOLDS.STAGE2_ACTIVATION} Matic`;
  } 

  if (stageIndex === 2) {
      return `Stage 1 Total Value: ${stage1Value}/${STAGE_THRESHOLDS.STAGE3_STAGE1_ACTIVATION} Matic, Stage 2 Total Value: ${stage2Value}/${STAGE_THRESHOLDS.STAGE3_STAGE2_ACTIVATION} Matic`;
  }
  
  return "";
}

const createTextLabel = (text: string, options: fabric.ITextOptions): fabric.Text => {
  const defaultOptions = {
      fontFamily: 'kirbyss',
      originX: 'center',
      selectable: false
  };
  return new fabric.Text(text, { ...defaultOptions, ...options });
}

export { updateCanvasCell, resizeCanvas, createTextLabel, getRequiredTotalValueText, generateGridImage }