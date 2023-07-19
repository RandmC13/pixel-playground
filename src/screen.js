import Air from "./air"

class Screen {
    constructor(windowWidth, windowHeight, particleSize, sketchObj) {
        //Functions to initiate grid
        const calculateDimensions = (windowWidth, windowHeight, particleSize) => {
            let width = Math.floor(windowWidth / particleSize) * particleSize;
            let height = Math.floor(windowHeight / particleSize) * particleSize;
            return [width,height];
        }

        const generateGrid = (particleSize) => {
            let cols = this.width / particleSize;
            let colHeight = this.height / particleSize;

            let grid = new Array(cols);

            for (var x=0;x<cols;x++) {
                grid[x] = new Array(colHeight).fill(new Air());
            }

            return grid;
        }

        let dimensions = calculateDimensions(windowWidth,windowHeight,particleSize);

        this.p = sketchObj;
        this.width = dimensions[0];
        this.height = dimensions[1];
        this.particleSize = particleSize;
        this.grid = generateGrid(this.particleSize);
        this.gridWidth = this.grid.length;
        this.gridHeight = this.grid[0].length;
    };

    updateGrid(updates) {
        for (var i=0;i<updates.length;i++) {
            //Loop through changes and update the grid accordingly
            this.grid[updates[i][0]][updates[i][1]] = updates[i][2];
        }
    }

    stepSim() {
        let gridUpdates = [];
        /*These 2 loops could be combined for more efficiency but can sometimes make the game look choppy because more intensive
            update processes result in gaps between parts of the frame being drawn. By separating the loops, the frame is drawn uniformly.*/
        for (var y=0;y<this.grid[0].length;y++) {
            for (var x=0;x<this.grid.length;x++) {
                //Draw grid
                this.p.fill(this.grid[x][y].colour[0],this.grid[x][y].colour[1],this.grid[x][y].colour[2]);
                this.p.square(x*this.particleSize,y*this.particleSize,this.particleSize);
            }
        }
        for (var y=0;y<this.grid[0].length;y++) {
            for (var x=0;x<this.grid.length;x++) {
                //Step simulation
                //If particle is static no need to update
                if (this.grid[x][y].static) continue;
                //If particle is not static, update and store its changes
                let update = this.grid[x][y].update(x,y,this.grid);
                //If particle hasn't changed then do nothing
                if (!update) continue;
                for (var i=0;i<update.length;i++) gridUpdates.push(update[i]);
            }
        }
        //Enact updates
        this.updateGrid(gridUpdates);
    }
};

export default Screen;