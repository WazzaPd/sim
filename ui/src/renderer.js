import { AgentType } from "../../engine/pkg/engine.js";

const CELL_SIZE = 32; // px
const GRID_COLOR = "#CCEECC";
const PEASANT_COLOR = "#00FF00"; // Green
const SOLDIER_COLOR = "#FF0000"; // Red
const DEAD_COLOR    = "#FFFFFF"; // White
const KING_COLOR    = "#FFD700"; // Gold

// Macros for accessing the Agent Struct
const AGENT_SIZE = 12;
const A_OFFSET_X = 0;
const A_OFFSET_Y = 4;
const A_OFFSET_TYPE = 8;

// Macros for accessing the tile Struct
const TILE_SIZE = 2;
const T_OFFSET_FERTILITY = 0;
const T_OFFSET_CROPS = 1;

export class Renderer {
    constructor(canvas, width, height, cellSize, sprites) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Pixel art look
        
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.sprites = sprites;
        
        // Configuration
        this.GRID_COLOR = "#CCEECC";
        
        // Resize canvas immediately
        this.canvas.height = (this.cellSize + 1) * this.height + 1;
        this.canvas.width = (this.cellSize + 1) * this.width + 1;
    }

    draw(universe, memory) {
        // Clear screen
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        this.drawCropsView(universe, memory);
        this.drawAgents(universe, memory);
    }

    drawGrid() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.GRID_COLOR;

        // Vertical
        for (let i = 0; i <= this.width; i++) {
            let x = i * (this.cellSize + 1) + 1;
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, (this.cellSize + 1) * this.height + 1);
        }

        // Horizontal
        for (let j = 0; j <= this.height; j++) {
            let y = j * (this.cellSize + 1) + 1;
            this.ctx.moveTo(0, y);
            this.ctx.lineTo((this.cellSize + 1) * this.width + 1, y);
        }

        this.ctx.stroke();
    }


    drawCropsView(universe, memory) {
        const tilesPtr = universe.tiles();
        const view = new DataView(memory.buffer);
        const CELL_SIZE = this.cellSize;
        const universeWidth = this.width;
        const universeHeight = this.height;

        this.ctx.beginPath();

        for(let row = 0; row< universeWidth; row++){
            for(let col = 0; col< universeHeight; col++){

                const tileStart = tilesPtr + ( ( (row * universeWidth) + col) * TILE_SIZE);
                const growthLevel = view.getUint8(tileStart + T_OFFSET_CROPS);

                if(growthLevel < 1) this.ctx.fillStyle = DEAD_COLOR;
                else if( growthLevel < 5) this.ctx.fillStyle = SOLDIER_COLOR;
                else if(growthLevel < 12) this.ctx.fillStyle = PEASANT_COLOR;
                else this.ctx.fillStyle = KING_COLOR;

                this.ctx.fillRect(
                    col*(CELL_SIZE+1)+1,
                    row*(CELL_SIZE+1)+1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }
        this.ctx.stroke();
      }

    drawAgents(universe, memory) {
        const CELL_SIZE = this.cellSize;
        const AGENT_SIZE = 12; // Struct size in bytes
        
        // Pointers
        const agentsPtr = universe.agents();
        const count = universe.get_agent_count();
        const view = new DataView(memory.buffer);

        for (let i = 0; i < count; i++) {
            const agentStart = agentsPtr + (i * AGENT_SIZE);
            
            // Read Rust memory
            const x = view.getUint32(agentStart + A_OFFSET_X, true);
            const y = view.getUint32(agentStart + A_OFFSET_Y, true);
            const type = view.getUint8(agentStart + A_OFFSET_TYPE);

            const sprite = this.sprites[type];
            
            const destX = x * (CELL_SIZE + 1) + 1;
            const destY = y * (CELL_SIZE + 1) + 1;

            //calc sprite position
            const sx = 79;
            const sy = 3;


            if (sprite) {
                // Determine animation frame here if you want
                // For now, simple draw:
                this.ctx.drawImage(sprite, sx, sy, 64, 64, destX, destY, CELL_SIZE, CELL_SIZE);
            } else {
                this.ctx.fillStyle = "#FF00FF"; // Error magenta
                this.ctx.fillRect(destX, destY, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}