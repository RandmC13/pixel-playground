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
        this.framenum = 0;
    };

    stepSim() {
        /*These 2 loops could be combined for more efficiency but can sometimes make the game look choppy because more intensive
            update processes result in gaps between parts of the frame being drawn. By separating the loops, the frame is drawn uniformly.*/
        for (var y=0;y<this.grid[0].length;y++) {
            for (var x=0;x<this.grid.length;x++) {
                //Step simulation
                //If particle is static no need to update

                let skipParticle = false;

                if (this.grid[x][y].static) skipParticle = true;
                //If particle has already been updated, don't update again (flip toggle back)
                if (!this.grid[x][y].updateToggle) {
                    skipParticle = true;
                    this.grid[x][y].updateToggle = !this.grid[x][y].updateToggle;
                }
                //If particle is not static, update and store its changes also flip its frame num
                if (!skipParticle) this.grid[x][y].update(x,y,this.grid);

                //Draw grid
                this.p.fill(this.grid[x][y].colour[0],this.grid[x][y].colour[1],this.grid[x][y].colour[2]);
                this.p.square(x*this.particleSize,y*this.particleSize,this.particleSize);
            }
        }
        //Increment framenum
        this.framenum++;
    }
};

export default Screen;