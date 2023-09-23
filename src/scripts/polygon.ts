import { setupCanvas } from './canvas';
import { setupColorOptions, setupHistory } from './sidebar';
import { Contract, BrowserProvider } from 'ethers';
import contractConfig from '../config/contracts.json';

import Pixelflux1JSON from '../../build/contracts/Pixelflux1.json';

document.addEventListener("DOMContentLoaded", async () => {

    if (typeof window.ethereum !== 'undefined' && window.ethereum.isConnected()) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            const provider: BrowserProvider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const { Pixelflux1, Pixelflux2, Pixelflux3 } = contractConfig.polygon;

            const contractABI = Pixelflux1JSON.abi;
            // Fetch allCells for all stages
            const stages = [];
            for (const address of [Pixelflux1, Pixelflux2, Pixelflux3]) {
                const contract = new Contract(address, contractABI, signer);
                const allCells = await contract.getAllCellStates();
                stages.push(allCells);
            }
            
            try {
                // For now, only use the first stage (index 0)
                const canvas = setupCanvas("polygon", stages);
                setupColorOptions(canvas);
                setupHistory();
            } catch (error) {
                console.error("Error setting up canvas:", error);
            }
        }
    }
});
