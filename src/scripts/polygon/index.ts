import { setupCanvas } from './canvas/setup';
import { getStagesFromContracts } from './integrations';
import { setupSidebar } from './sidebar';

document.addEventListener("DOMContentLoaded", async () => {
  const loadingAnimation = document.getElementById('loading-animation');
  loadingAnimation.style.display = 'block';

  const { stages, totalValues } = await getStagesFromContracts();

  loadingAnimation.style.display = 'none';

  if (stages && stages.length > 0) {
    setupCanvas(stages, totalValues);
    setupSidebar();
  }
});
