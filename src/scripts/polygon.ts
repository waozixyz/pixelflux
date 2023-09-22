import { setupCanvas } from './canvas';
import { setupColorOptions, setupHistory } from './sidebar';

document.addEventListener("DOMContentLoaded", function () {
    const canvas = setupCanvas("polygon");

    setupColorOptions(canvas);
    setupHistory();
});
