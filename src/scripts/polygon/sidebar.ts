import { default as defaultColors } from '../../config/colors.json';
import { store } from "./store";
import { convertToFullHex } from './utils'

const ITEMS_PER_PAGE = 5;
let currentPage = 1;


export function displaySquareContent(show: boolean) {
  const element = document.querySelector('.square-content') as HTMLElement;
  if (element) {
    element.style.display = show ? 'block' : 'none';
  }
}

export function updateSidebarForSelectedSquare(canvas: fabric.Canvas) {
  displaySquareContent(true);
  updateColorDisplay();

  const pixelPropertiesElement = document.querySelector('.pixel-properties');
  if (pixelPropertiesElement) {
    const currentLayerNumber = store.selectedSquare.squareLayers.length;
    const currentLayer = currentLayerNumber > 0 ? store.selectedSquare.squareLayers[currentLayerNumber - 1] : null;
   

    pixelPropertiesElement.innerHTML = `
      <p class="center">L ${currentLayerNumber - 1}</p>
      <p class="center">${store.selectedSquare.squareValue} POL</p>
      <p class="center">x: ${store.selectedSquare.gridX}, y: ${store.selectedSquare.gridY + store.selectedSquare.yOffset}</p>
      <br />
      <p>Owner = ${currentLayer.owner.slice(0, 4)}...${currentLayer.owner.slice(-4)}</p>
      `;
  }


  currentPage = 1;
  updateHistory(currentPage);
  setupColorOptions(canvas);
}

function updateColorDisplay() {
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

function setColorAndUpdateSidebar(canvas: fabric.Canvas, color: string) {
  if (store.selectedSquare !== null) {
      store.selectedSquare.set('fill', color);
      updateColorDisplay();
      canvas.renderAll();
  }
}

function createColorOption(canvas: fabric.Canvas, color: string, isPicker?: boolean, pickerIndex?: number) {
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



export function setupColorOptions(canvas: fabric.Canvas) {
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

function displayHistoryForPage(pageNumber: number, pixelData: any) {
  const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const itemsToDisplay = pixelData.slice(startIndex, endIndex);

  const historyElement = document.getElementById('history')!;
  historyElement.innerHTML = '';

  itemsToDisplay.forEach(data => {
      const liElement = document.createElement('li');

      const colorCircle = document.createElement('div');
      colorCircle.classList.add('color-circle');
      colorCircle.style.backgroundColor = data.color;
      liElement.appendChild(colorCircle);

      const purchaseInfo = document.createElement('div');
      purchaseInfo.classList.add('purchase-info');

      const formattedAddress = `${data.contractAddress.slice(0, 4)}...${data.contractAddress.slice(-4)}`;

      purchaseInfo.innerHTML = `Value: ${data.value} <br/> Owner: ${formattedAddress}`;
      liElement.appendChild(purchaseInfo);

      historyElement.appendChild(liElement);
  });

  const prevButton = document.getElementById('prev-button') as HTMLInputElement;
  const nextButton = document.getElementById('next-button') as HTMLInputElement;

  if (prevButton && nextButton) {
    prevButton.disabled = pageNumber <= 1;
    nextButton.disabled = pageNumber >= Math.ceil(pixelData.length / ITEMS_PER_PAGE);
  }
}

function updateHistory(currentPage: number) {
  const pixelData = store.selectedSquare.squareLayers.map(layer => ({
      color: layer.color ? layer.color : "#000",
      value: store.selectedSquare.squareValue,
      contractAddress: layer.owner
  }));
  displayHistoryForPage(currentPage, pixelData);

  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
      currentPage--;
      displayHistoryForPage(currentPage, pixelData);
    });

    nextButton.addEventListener('click', () => {
      currentPage++;
      displayHistoryForPage(currentPage, pixelData);
    });
  }
}

export function setupBuyButton() {
  const buyButton = document.getElementById('buy-button');
  if (buyButton) {
    buyButton.addEventListener('click', function() {
      console.log("Buy action triggered!");
    });
  }
}

export function showWalletModal() {
  const walletModal = document.getElementById('wallet-modal');
  if (walletModal) {
    walletModal.style.display = 'block';
  }
}

export function hideWalletModal() {
  const walletModal = document.getElementById('wallet-modal');
  if (walletModal) {
    walletModal.style.display = 'none';
  }
}

const displayConnectedAddress = (address: string) => {
  document.getElementById('connect-text').style.display = 'none';
  document.getElementById('address-text').style.display = 'flex';
  document.getElementById('account-address').textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
}

document.addEventListener("DOMContentLoaded", async() => {
  const connectButton = document.getElementById('connect-wallet');
  const closeModalButton = document.getElementById('close-modal');
  const metamaskOption = document.getElementById('metamask-option');

  if (connectButton) {
    connectButton.addEventListener('click', showWalletModal);
  }

  if (closeModalButton) {
    closeModalButton.addEventListener('click', hideWalletModal);
  }

  if (metamaskOption) {
    metamaskOption.addEventListener('click', async () => {
      console.log("Connecting with MetaMask...");
  
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            console.log("Account access granted.");
           
            const connectedAddress = accounts[0];
            console.log("Connected address:", connectedAddress);
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x539' }],
              });
              console.log("Switched to the Polygon network.");
            } catch (switchError) {
              console.error("Error switching to Polygon:", switchError);
            }
  
          } else {
            console.log("Account access denied.");
          }
  
        } catch (err) {
          console.error("Error connecting to MetaMask:", err);
        }
  
      } else {
        console.log("MetaMask is not installed.");
      }
    });
    
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const connectedAddress = accounts[0];
        displayConnectedAddress(connectedAddress);
      }
    }
  }

});
