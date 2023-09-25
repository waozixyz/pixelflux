import { store } from "./store";
import { convertToFullHex } from './utils'
import { updateHistory } from "./pixelHistory"
import { setupColorOptions } from "./pixelBuy"

let currentPage = 1;

const displaySquareContent = (show: boolean) => {
  const element = document.querySelector('.square-content') as HTMLElement;
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

const updateColorDisplay = () => {
  const pixelDisplayElement = document.querySelector('.pixel-display') as HTMLElement;
  if (pixelDisplayElement && typeof store.selectedSquare.fill === 'string') {
    pixelDisplayElement.style.backgroundColor = store.selectedSquare.fill ? store.selectedSquare.fill : "#000";
  }
  
  const colorPickers = document.querySelectorAll('input[type="color"]') as NodeListOf<HTMLInputElement>;
  if (colorPickers && colorPickers.length >= 2) {
    colorPickers[0].value = convertToFullHex(store.colorPicker[0]);
    colorPickers[1].value = convertToFullHex(store.colorPicker[1]);
  }
}


const updateSidebarForSelectedSquare = (canvas: fabric.Canvas) => {
  displaySquareContent(true);
  updateColorDisplay();

  const pixelPropertiesElement = document.querySelector('.pixel-properties');
  if (pixelPropertiesElement) {
    const currentLayerNumber = store.selectedSquare.squareLayers.length;
    const currentLayer = currentLayerNumber > 0 ? store.selectedSquare.squareLayers[currentLayerNumber - 1] : null;
   

    pixelPropertiesElement.innerHTML = `
      <p>L ${currentLayerNumber - 1}</p>
      <p>${store.selectedSquare.squareValue} POL</p>
      <p>x: ${store.selectedSquare.gridX}, y: ${store.selectedSquare.gridY + store.selectedSquare.yOffset}</p>
      <br />
      <p>Owner</p>
      <p>${currentLayer.owner.slice(0, 4)}...${currentLayer.owner.slice(-4)}</p>
      `;
  }


  currentPage = 1;
  updateHistory(currentPage);
  setupColorOptions(canvas);
}
export { updateSidebarForSelectedSquare, updateColorDisplay, displaySquareContent }