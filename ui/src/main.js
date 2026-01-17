import init, {Universe, AgentType} from "../../engine/pkg/engine.js";
import {Renderer} from "./renderer.js"

const WIDTH = 10;
const HEIGHT = 10;
const CELL_SIZE = 32; // px

async function loadSprites() {
  const peasantImg = new Image();
  peasantImg.src = "/removed.png"
  await peasantImg.decode();

  return {
    [AgentType.Peasant]: peasantImg,
    //[AgentType.Soldier]: ...
  };
}

async function run() {
  const { memory } = await init();
  const spriteMap = await loadSprites();

  const universe = Universe.new();
  
  const canvas = document.getElementById("sim-canvas");
  const renderer = new Renderer(canvas, WIDTH, HEIGHT, CELL_SIZE, spriteMap);

  const renderLoop = () => {
    renderer.draw(universe, memory);
    //requestAnimationFrame(renderLoop);
  }

  // drawGrid();
  // drawAgents();
  requestAnimationFrame(renderLoop);
}

run();