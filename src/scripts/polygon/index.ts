import { setupCanvas } from './canvas/setup';
import { getStagesFromContracts } from './integrations';
import { setupSidebar } from './sidebar/setup';

document.addEventListener("DOMContentLoaded", async () => {
  const { stages, totalValues } = await getStagesFromContracts();

  if (stages && stages.length > 0) {
    setupCanvas(stages, totalValues);
    setupSidebar();
  }
});
