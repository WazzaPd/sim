use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    agents: Vec<Agent>,
    tiles: Vec<Tile>,
}

pub struct Tile{
    fertility: u8,
    crops: u8,
}

#[wasm_bindgen]
#[repr(C)]
#[derive(Clone, Copy)]
pub struct Agent {
    x: u32,
    y: u32,
    agent_type: AgentType,
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum AgentType {
    Dead = 0,
    Peasant = 1,
    Soldier = 2,
    King = 3,
}

impl Universe{
    // For tiles
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    pub fn grow_tile(&mut self, row: u32, col:u32, grow_by:u8){
        let idx = self.get_index(row, col);
        self.tiles[idx].crops += grow_by;
    }

    pub fn peek_tile(&self, row: u32, col:u32) -> &Tile{
        let idx = self.get_index(row, col);
        &self.tiles[idx]
    }

}

#[wasm_bindgen]
impl Universe{

    //If Peasant on fertile tile -> grow fertility*1 # crops
    pub fn tick(&mut self) {
        

        for i in 0..self.agents.len() {
            let agent = &self.agents[i];

            // Peasant on fertile tile -> grow crops
            let fertility = {
                let tile = self.peek_tile(agent.x, agent.y);
                tile.fertility
            };

            if fertility != 0 {
                self.grow_tile(agent.x, agent.y, fertility);
            }

        }
    }

    pub fn new() -> Universe {
        let width = 10;
        let height = 10;
        let agents: Vec<Agent> = (0..width * height)
            .filter(|i| i % 2 == 0 || i % 7 == 0)
            .map(|i| {
                let col = i % width;
                let row = i / width;

                // 3. Return the FULL struct
                Agent {
                    agent_type: AgentType::Peasant,
                    x: col,
                    y: row,
                }
            })
            .collect();

        let tiles = (0..width * height)
            .map(|i|{
                let col = i % width;
                let row = i / width;

                // 2. Decide the Type
                let fertility = if i % 2 == 0 || i % 7 == 0 {
                    0
                } else {
                    1
                };

                let crops = 0;

                // 3. Return the FULL struct
                Tile {
                    fertility,
                    crops,
                }
            })
            .collect();

        Universe {
            width,
            height,
            agents,
            tiles,
        }
    }

    pub fn agents(&self) -> *const Agent {
        self.agents.as_ptr()
    }

    pub fn get_agent_count(&self) -> u32 {
        self.agents.len() as u32
    }

    pub fn tiles(&self) -> *const Tile {
        self.tiles.as_ptr()
    }

    pub fn get_tile_count(&self) -> u32 {
        self.tiles.len() as u32
    }

}