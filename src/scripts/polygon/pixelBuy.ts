import { default as defaultColors } from '../../config/colors.json';
import { store } from "./store";
import { convertToFullHex } from './utils'
import { updateColorDisplay } from "./pixelCard";

const setupSliderControls = () => {
  const layerSlider = document.getElementById('layer-slider') as HTMLInputElement;
  const sliderValue = document.getElementById('slider-value');
  const purchaseLayerButton = document.getElementById('purchase-button') as HTMLButtonElement;
  const decreaseBtn = document.getElementById('decrease-btn');
  const increaseBtn = document.getElementById('increase-btn');
  const maxSliderValue = parseInt(layerSlider.max);
  const minSliderValue = parseInt(layerSlider.min);

  const updatePurchaseButtonState = () => {
    purchaseLayerButton.disabled = layerSlider.value === "0";
    purchaseLayerButton.textContent = parseInt(layerSlider.value) <= 1 ? "Buy Layer" : "Buy Layers";
  };
  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', function() {
      let currentValue = parseInt(layerSlider.value);
      if (currentValue > minSliderValue) {
        layerSlider.value = (currentValue - 1).toString();
        sliderValue.textContent = layerSlider.value;
        updatePurchaseButtonState();
      }
    });
  }


  if (increaseBtn) {
    increaseBtn.addEventListener('click', function() {
      let currentValue = parseInt(layerSlider.value);
      if (currentValue < maxSliderValue) {
        layerSlider.value = (currentValue + 1).toString();
        sliderValue.textContent = layerSlider.value;
        updatePurchaseButtonState();
      }
    });
  }

  if (layerSlider && sliderValue) {
    layerSlider.addEventListener('input', function() {
      sliderValue.textContent = layerSlider.value; 
      updatePurchaseButtonState();
    });
  }
}

const createColorOption = (canvas: fabric.Canvas, color: string, isPicker?: boolean, pickerIndex?: number) => {
  const colorOptionsContainer = document.getElementById('color-options')!;
  
  if (isPicker && typeof pickerIndex !== 'undefined') {
      const element = document.createElement('input');
      element.type = 'color';
      element.value = convertToFullHex(store.colorPicker[pickerIndex]);
      element.addEventListener('click', () => {
        setColorAndUpdateSidebar(canvas, element.value);
      });

      element.addEventListener('input', () => {
        store.colorPicker[pickerIndex] = element.value
        setColorAndUpdateSidebar(canvas, element.value);
      });

      element.addEventListener('change', () => {
          store.colorPicker[pickerIndex] = element.value
          setColorAndUpdateSidebar(canvas, element.value);
      });
      
      colorOptionsContainer.appendChild(element);
  } else if (!isPicker) {
      const element = document.createElement('div');
      element.classList.add('color-option');
      element.style.backgroundColor = color;
      element.addEventListener('click', function () {
          setColorAndUpdateSidebar(canvas, color);
      });
      colorOptionsContainer.appendChild(element);
  }
}


const setColorAndUpdateSidebar = (canvas: fabric.Canvas, color: string) => {
  if (store.selectedSquare !== null) {
      store.selectedSquare.set('fill', color);
      updateColorDisplay();
      canvas.renderAll();
  }
}


const setupColorOptions = (canvas: fabric.Canvas) => {
  const colorOptionsContainer = document.getElementById('color-options')!;
  colorOptionsContainer.innerHTML = '';

  if (store.selectedSquare) {
    createColorOption(canvas, store.selectedSquare.originalFill ? store.selectedSquare.originalFill : "#000");
  }

  defaultColors.forEach(function (color: string) {
      createColorOption(canvas, color);
  });

  createColorOption(canvas, '', true, 0);
  createColorOption(canvas, '', true, 1);
}


export { setupSliderControls, createColorOption, setupColorOptions };
