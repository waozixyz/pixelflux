import { fabric } from "fabric";
import * as kda from './options/kda.json';
import * as matic from './options/matic.json';
import { default as defaultColors } from './options/colors.json';

document.getElementById('blockchain-heading')!.addEventListener('click', function() {
    const content = document.getElementById('dropdown-content')!;
    if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
});

function generateGridImage(gridWidth: number, gridHeight: number, cellSize: number): string {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = gridWidth * cellSize;
    tempCanvas.height = gridHeight * cellSize;

    const ctx = tempCanvas.getContext('2d')!; 

    for (let x = 0; x <= gridWidth; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, gridWidth);
    }

    for (let y = 0; y <= gridHeight; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(gridHeight, y);
    }

    ctx.stroke();

    return tempCanvas.toDataURL();
}

interface CustomRectOptions extends fabric.IRectOptions {
    originalFill?: string;
    squareValue?: number;
}

function roundToTwoSigFigs(value: number): number {
    if (value === 0) return 0;

    const magnitude = Math.floor(Math.log10(Math.abs(value)));
    const scale = Math.pow(10, magnitude - 1);
    let result = Math.round(value / scale) * scale;

    return Math.round(result * 1e10) / 1e10;
}

document.addEventListener("DOMContentLoaded", function () {
    const prop = matic;
    var canvas: fabric.Canvas = new fabric.Canvas('c', { selection: false });
    const cellSize = 9;
    const gridWidth = matic.shape[0].length;
    const gridHeight = matic.shape.length;
    canvas.setWidth(gridWidth * cellSize);
    canvas.setHeight(gridHeight * cellSize);

    let selectedSquare: fabric.Rect & CustomRectOptions | null = null;

    // Set canvas background to the grid image
    const gridImageUrl = generateGridImage(gridWidth, gridHeight, cellSize);
    canvas.setBackgroundColor(gridImageUrl, () => canvas.renderAll());
    canvas.backgroundColor = "#000";

    const squares: fabric.Rect[] = [];
    const currentShape: string[] = prop.shape;

    function resizeCanvas() {
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            const width = canvasContainer.clientWidth;
            const height = canvasContainer.clientHeight;
            
            // Compute the scale factor
            const scaleX = width / (gridWidth * cellSize);
            const scaleY = height / (gridHeight * cellSize);
            const scale = Math.min(scaleX, scaleY);
            
            canvas.setZoom(scale);
    
            // Set dimensions
            canvas.setWidth(gridWidth * cellSize * scale);
            canvas.setHeight(gridHeight * cellSize * scale);
            
            // Set canvas background to the grid image
            const gridImageUrl = generateGridImage(gridWidth, gridHeight, cellSize);
            canvas.setBackgroundColor(gridImageUrl, () => canvas.renderAll());
            
            canvas.renderAll();
            canvas.backgroundColor = "#000";
            
            // Recalculate the offset
            canvas.calcOffset();
        }
    }
    
    
    function computeCenter() {
        return {
            startX: (canvas.getWidth() - gridWidth * cellSize) / 2,
            startY: (canvas.getHeight() - gridHeight * cellSize) / 2
        };
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize the canvas with the window
    window.addEventListener('resize', resizeCanvas);
    const { startX, startY } = computeCenter();

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {

            let isX = currentShape[y] ? currentShape[y][x] ? currentShape[y][x] === "x" : false : false;
            let fillColor = "#000";
            let currentValue = prop.initialValue * (y + 0.3) * (x + 0.3);
            if (isX) {
                let darkeningFactor = Math.floor(255 - 255 * (((y / gridHeight) + (x / gridWidth))));
                if (darkeningFactor <= 0) darkeningFactor = 0;
                if (darkeningFactor >= 255) darkeningFactor = 255;

                const redValue = Math.floor((prop.color.r * (255 - darkeningFactor) / 255) + (255 * darkeningFactor / 255));
                const greenValue = Math.floor((prop.color.g * (255 - darkeningFactor) / 255) + (255 * darkeningFactor / 255));
                const blueValue = Math.floor((prop.color.b * (255 - darkeningFactor) / 255) + (255 * darkeningFactor / 255));

                const redHex = redValue.toString(16).padStart(2, "0");
                const greenHex = greenValue.toString(16).padStart(2, "0");
                const blueHex = blueValue.toString(16).padStart(2, "0");

                fillColor = `#${redHex}${greenHex}${blueHex}`;
                currentValue *= (255 / (darkeningFactor + 1));
            } 

            const square = new fabric.Rect({
                width: cellSize,
                height: cellSize,
                stroke: prop.gridColor,
                fill: fillColor,
                top: (cellSize * y),
                left: (cellSize * x),
                lockMovementX: true,
                lockMovementY: true,
                hasControls: false,
                hoverCursor: 'pointer',
                originalFill: fillColor,
                squareValue: roundToTwoSigFigs(currentValue),
            } as CustomRectOptions);

            square.on('mousedown', function (e) {
                if (!e.target) return;

                if (selectedSquare && selectedSquare !== e.target) {
                    selectedSquare.set('strokeWidth', 1);
                }
                e.target.set('strokeWidth', 4);
                selectedSquare = e.target as fabric.Rect;

                if(!selectedSquare.squareValue) return;

                const currentValueElement = document.getElementById('current-value')!;
                currentValueElement.textContent = selectedSquare.squareValue.toString();

            });

            squares.push(square);
        }
    }
    canvas.add(...squares);

    const colorOptionsContainer = document.getElementById('color-options')!;
    const colorSelector = document.getElementById('color-selector')! as HTMLInputElement;
    defaultColors.forEach(function (color: string) {
        createColorOption(color);
    });
    

    function createColorOption(color: string) {
        const colorOption = document.createElement('div');
        colorOption.classList.add('color-option');
        colorOption.style.backgroundColor = color;
        colorOption.addEventListener('click', function () {
            if (selectedSquare !== null) {
                selectedSquare.set('fill', color);
                selectedSquare.originalFill = color;
                canvas.renderAll();
            }
        });
        colorOptionsContainer.appendChild(colorOption);
    }

    colorSelector.addEventListener('change', function () {
        const selectedColor = colorSelector.value;
        if (selectedSquare !== null) {
            selectedSquare.set('fill', selectedColor);
            selectedSquare.originalFill = selectedColor;
            canvas.renderAll();
        }
    });

    colorSelector.addEventListener('input', function () {
        const selectedColor = colorSelector.value;
        if (selectedSquare !== null) {
            selectedSquare.set('fill', selectedColor);
            selectedSquare.originalFill = selectedColor;
            canvas.renderAll();
        }
    });

    const historyElement = document.getElementById('history')!;

    for (let i = 0; i < 5; i++) {
        const liElement = document.createElement('li');
        liElement.textContent = `Value: ${Math.floor(Math.random() * 100)}, Contract: ${getRandomContractAddress()}`;
        historyElement.appendChild(liElement);
    }

    function getRandomContractAddress(): string {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }
});
