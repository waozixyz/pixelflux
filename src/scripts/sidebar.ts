import { default as defaultColors } from '../config/colors.json';
import { store, setCurrentBlockchainTab } from "./store";
import { setupCanvas } from "./canvas";

const ITEMS_PER_PAGE = 5;
let currentPage = 1;

const mockPixelData = [
  { color: "#FF5733", value: 85, contractAddress: "0x1234567890123456789012345678901234567890" },
  { color: "#32a852", value: 80, contractAddress: "0x2345678901234567890123456789012345678901" },
  { color: "#327da8", value: 75, contractAddress: "0x3456789012345678901234567890123456789012" },
  { color: "#a83280", value: 70, contractAddress: "0x4567890123456789012345678901234567890123" },
  { color: "#a87232", value: 65, contractAddress: "0x5678901234567890123456789012345678901234" },
  { color: "#FF5733", value: 60, contractAddress: "0x1234567890123456789012345678901234567890" },
  { color: "#32a852", value: 55, contractAddress: "0x2345678901234567890123456789012345678901" }

];

export function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  tabs.forEach(tab => {
      tab.addEventListener("click", function() {
          tabs.forEach(innerTab => innerTab.classList.remove("active"));
          tab.classList.add("active");

          contents.forEach(content => content.classList.remove("active"));
          const targetContentId = tab.getAttribute("data-content");
          document.getElementById(targetContentId).classList.add("active");
          
          setCurrentBlockchainTab(targetContentId);
          setupCanvas();
      });
  });
}

function createColorOption(canvas: fabric.Canvas, color: string) {
  const colorOptionsContainer = document.getElementById('color-options')!;
  const colorOption = document.createElement('div');
  colorOption.classList.add('color-option');
  colorOption.style.backgroundColor = color;
  colorOption.addEventListener('click', function () {
      if (store.selectedSquare !== null) {
          store.selectedSquare.set('fill', color);
          store.selectedSquare.originalFill = color;
          canvas.renderAll();
      }
  });
  colorOptionsContainer.appendChild(colorOption);
}

export function setupColorOptions(canvas: fabric.Canvas) {
  defaultColors.forEach(function (color: string) {
      createColorOption(canvas, color);
  });
}

function displayHistoryForPage(pageNumber) {
  const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const itemsToDisplay = mockPixelData.slice(startIndex, endIndex);

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

      const formattedAddress = `${data.contractAddress.slice(0, 6)}...${data.contractAddress.slice(-4)}`;

      purchaseInfo.textContent = `Value: ${data.value}, Contract: ${formattedAddress}`;
      liElement.appendChild(purchaseInfo);

      historyElement.appendChild(liElement);
  });

  // Update the navigation buttons (previous/next) based on the current page
  const prevButton = document.getElementById('prev-button') as HTMLInputElement;
  const nextButton = document.getElementById('next-button') as HTMLInputElement;

  if (prevButton && nextButton) {
    prevButton.disabled = pageNumber <= 1;
    nextButton.disabled = pageNumber >= Math.ceil(mockPixelData.length / ITEMS_PER_PAGE);
  }
}

export function setupHistory() {
  displayHistoryForPage(currentPage);

  const prevButton = document.getElementById('prev-button');
  const nextButton = document.getElementById('next-button');

  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
      currentPage--;
      displayHistoryForPage(currentPage);
    });

    nextButton.addEventListener('click', () => {
      currentPage++;
      displayHistoryForPage(currentPage);
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


export function connectWallet() {
  // Logic for connecting to the Polygon network
  console.log("Connecting to Polygon...");
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

document.addEventListener("DOMContentLoaded", () => {
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
    metamaskOption.addEventListener('click', () => {
      // Logic to connect with MetaMask
      console.log("Connecting with MetaMask...");
    });
  }
});
