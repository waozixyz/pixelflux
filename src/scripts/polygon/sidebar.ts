
import { setupSliderControls } from './pixelBuy';
import { Contract } from 'ethers';
import Pixelflux1JSON from '../../../build/contracts/Pixelflux1.json';
import { getProvider } from './blockchainProvider';
import { store } from './store';
import contractConfig from '../../config/contracts.json';
import { showNotification, hideNotification } from '../notification';

const buyLayers = async(provider: any, userAddress: string, contractAddress: string, x: number, y: number, numLayersToAdd: number, color: string) => {
  const contract = new Contract(contractAddress, Pixelflux1JSON.abi, provider.getSigner(userAddress));

  const baseValueInGwei = store.selectedSquare.squareValue;
  const totalValueToSend = baseValueInGwei * numLayersToAdd;

  if (numLayersToAdd === 1) {
    await contract.buyLayer(x, y, color, { value: totalValueToSend.toString() });
  } else {
    await contract.buyMultipleLayers(x, y, numLayersToAdd, color, { value: totalValueToSend.toString() });
  }
}


const handlePurchaseClick = async() => {
  const provider = getProvider();
  let userAddress = '';
  if (typeof window.ethereum !== 'undefined') {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      userAddress = accounts[0];
    }
  }

  if (!userAddress) {
    showNotification("No user address found. Please connect to MetaMask.");
    return;
}
  
  const contractAddress = contractConfig.polygon.Pixelflux[store.selectedSquare.stage];  
  const layerSlider = document.getElementById('layer-slider') as HTMLInputElement;
  const numLayersToAdd = parseInt(layerSlider.value);
  const color = (typeof store.selectedSquare.fill === 'string') ? store.selectedSquare.fill : '';
  const x = store.selectedSquare.gridX;
  const y = store.selectedSquare.gridY;

  buyLayers(provider, userAddress, contractAddress, x, y, numLayersToAdd, color);
}


const showWalletModal = () => {
  const walletModal = document.getElementById('wallet-modal');
  if (walletModal) {
    walletModal.style.display = 'block';
  }
}

const hideWalletModal = () => {
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


const setupSidebar = async() => {
  setupSliderControls();

  const closeNotificationButton = document.getElementById('close-notification');
  if (closeNotificationButton) {
    closeNotificationButton.addEventListener('click', hideNotification);
  }
  
  const connectButton = document.getElementById('connect-wallet');
  const closeModalButton = document.getElementById('close-modal');
  const metamaskOption = document.getElementById('metamask-option');
  const purchaseLayerButton = document.getElementById('purchase-button') as HTMLButtonElement;
  if (purchaseLayerButton) {
    purchaseLayerButton.addEventListener('click', handlePurchaseClick);
  }

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
}

export { showWalletModal, hideWalletModal, setupSidebar }