import { setupSliderControls } from './pixelBuy';
import { handlePurchaseClick } from './purchaseLogic';
import { showNotification, hideNotification } from '../notification';
import { showWalletModal, hideWalletModal } from '../walletModal';

const displayConnectedAddress = (address: string) => {
  document.getElementById('connect-text').style.display = 'none';
  document.getElementById('address-text').style.display = 'flex';
  document.getElementById('account-address').textContent = `${address.slice(0, 4)}...${address.slice(-4)}`;
}

const setupSidebar = async() => {
  setupSliderControls();

  const closeNotificationButton = document.getElementById('close-notification');
  if (closeNotificationButton) {
    closeNotificationButton.addEventListener('click', hideNotification);
  }
  
  const tooltipInfo = document.getElementById('tooltip-info');

  tooltipInfo.addEventListener('click', function() {
      showNotification("Buying a layer redistributes funds to current layer owners. When you purchase multiple layers, the incremental cost for each layer can circle back to you, especially if you own existing layers.");
  });
  
  
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
                params: [{ chainId: '0x89' }],
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