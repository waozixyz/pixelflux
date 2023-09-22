import { setupCanvas } from './canvas';
import { setupTabs, setupColorOptions, setupHistory } from './sidebar';

document.addEventListener("DOMContentLoaded", function () {
    const canvas = setupCanvas();
    
    setupTabs();
    setupColorOptions(canvas);
    setupHistory();
});
