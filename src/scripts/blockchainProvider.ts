import { BrowserProvider, JsonRpcProvider, WebSocketProvider } from 'ethers';

import Pixelflux1JSON from '../../build/contracts/Pixelflux1.json';
import Pixelflux2JSON from '../../build/contracts/Pixelflux2.json';
import Pixelflux3JSON from '../../build/contracts/Pixelflux3.json';

require('dotenv').config();

const getBrowserProvider = (): BrowserProvider | null => {
  if (!window.ethereum) {
    console.error('MetaMask or a similar wallet provider is required.');
    return null;
  }
  return new BrowserProvider(window.ethereum);
}

const getJsonProvider = (): JsonRpcProvider | null => {
  const infuraUrl = `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
  if (!process.env.INFURA_API_KEY) {
    console.error('Infura API key is required.');
    return null;
  }
  return new JsonRpcProvider(infuraUrl);
}

const getWebsocketProvider = (): WebSocketProvider | null => {
  const infuraUrl = `wss://polygon-mainnet.infura.io/ws/v3/${process.env.INFURA_API_KEY}`;
  if (!process.env.INFURA_API_KEY) {
    console.error('Infura API key is required.');
    return null;
  }
  console.log('Creating WebSocketProvider with URL:', infuraUrl);
  return new WebSocketProvider(infuraUrl);
}


const getProvider = async (): Promise<BrowserProvider | JsonRpcProvider | null> => {
  const browserProvider = getBrowserProvider();
  if (browserProvider) {
    try {
      // Attempt to get the network as a test to see if the provider works
      await browserProvider.getNetwork();
      return browserProvider;
    } catch (error) {
      console.error('BrowserProvider not supported:', error);
      // Fall back to JsonRpcProvider if BrowserProvider doesn't work
    }
  }
  return getJsonProvider();
};

 
const contractABIs = [Pixelflux1JSON.abi, Pixelflux2JSON.abi, Pixelflux3JSON.abi];


export {contractABIs, getProvider, getBrowserProvider, getWebsocketProvider }