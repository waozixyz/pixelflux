import { store } from "./store";
import { convertToFullHex } from './utils'
import { updateHistory } from "./pixelHistory"
import { setupColorOptions, handleLayerSliderUpdate } from "./pixelBuy"

let currentPage = 1;

const displaySquareContent = (show: boolean) => {
  const element = document.querySelector('.square-content') as HTMLElement;
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}
const updateColorDisplay = () => {
  const pixelCard = document.querySelector('.pixel-card') as HTMLElement;
  const pixelDisplayContainer = pixelCard.querySelector('.pixel-display-container') as HTMLElement;
  const pixelCurrent = pixelCard.querySelector('.pixel-current') as HTMLElement;
  const pixelPreview = pixelCard.querySelector('.pixel-preview') as HTMLElement;
  const pixelPropertiesElement = pixelCard.querySelector('.pixel-properties') as HTMLElement;
  const layerSlider = document.getElementById('layer-slider') as HTMLInputElement;
  const arrowSpan = pixelCard.querySelector('.pixel-display-container > span') as HTMLElement;

  const currentLayerNumber = store.selectedSquare.squareLayers.length - 1;

  if (pixelPreview && typeof store.selectedSquare.fill === 'string') {
    pixelPreview.style.backgroundColor = store.selectedSquare.fill ? store.selectedSquare.fill : "#000";
  }

  if (pixelCurrent && typeof store.selectedSquare.originalFill === 'string') {
    pixelCurrent.style.backgroundColor = store.selectedSquare.originalFill ? store.selectedSquare.originalFill : "#000";
  }

  let layerValue = parseInt(layerSlider.value);
  if (layerValue > 0 || store.selectedSquare.fill !== store.selectedSquare.originalFill) {
    if (layerValue === 0) {
      const layerSlider = document.getElementById('layer-slider') as HTMLInputElement;
      layerSlider.value = "1";
      handleLayerSliderUpdate();
      layerValue = 1;
    }
    pixelDisplayContainer.style.display = "flex";
    pixelPreview.style.display = "block";
    arrowSpan.style.display = "inline-block";

    const newLayerNumber = currentLayerNumber + layerValue;
    const newValue = (store.selectedSquare.squareValue * (currentLayerNumber + layerValue + 1)).toFixed(2);

    pixelPropertiesElement.innerHTML = `
      <p>L ${currentLayerNumber} -> L ${newLayerNumber}</p>
      <p>${store.selectedSquare.squareValue} POL -> ${newValue} POL</p>
      <p>x: ${store.selectedSquare.gridX}, y: ${store.selectedSquare.gridY + store.selectedSquare.yOffset}</p>
      `;
  } else {
    arrowSpan.style.display = "none";
    pixelDisplayContainer.style.display = "flex";
    pixelPreview.style.display = "none";
    pixelPropertiesElement.innerHTML = `
      <p>L ${currentLayerNumber}</p>
      <p>${store.selectedSquare.squareValue} POL</p>
      <p>x: ${store.selectedSquare.gridX}, y: ${store.selectedSquare.gridY + store.selectedSquare.yOffset}</p>
      `;
  }


  const colorPickers = document.querySelectorAll('input[type="color"]') as NodeListOf<HTMLInputElement>;
  if (colorPickers && colorPickers.length >= 2) {
    colorPickers[0].value = convertToFullHex(store.colorPicker[0]);
    colorPickers[1].value = convertToFullHex(store.colorPicker[1]);
  }
};


const updateSidebarForSelectedSquare = (canvas: fabric.Canvas) => {
  displaySquareContent(true);
  const layerSlider = document.getElementById('layer-slider') as HTMLInputElement;
  layerSlider.value = "0";
  handleLayerSliderUpdate();
  updateColorDisplay();

  currentPage = 1;
  updateHistory(currentPage);
  setupColorOptions(canvas);
}
export { updateSidebarForSelectedSquare, updateColorDisplay, displaySquareContent }