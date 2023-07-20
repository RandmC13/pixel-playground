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
        /*
        A snapshot of the grid is made by cloning the array. This allows the draw cycle and simulation cycle to be in the same for loop.
        By using a snapshot, the simulation can be propogated throughout the grid without affecting what is drawn on the screen.

        The snapshot is what is drawn every frame but the changes made by running the simulation are made to the main grid. This also solves the problem
        of having delete themselves if two are competing for the same square as simulations are propogated continuously rather than in a lump-sum method.
        */

        //Take a snapshot of the grid
        let gridSnapshot = [...this.grid].map(row => [...row]);

        for (var y=0;y<gridSnapshot[0].length;y++) {
            for (var x=0;x<gridSnapshot.length;x++) {
                //Draw grid snapshot
                this.p.fill(gridSnapshot[x][y].colour[0],gridSnapshot[x][y].colour[1],gridSnapshot[x][y].colour[2]);
                this.p.square(x*this.particleSize,y*this.particleSize,this.particleSize);
                
                //Step simulation
                //If particle is static no need to update it
                if (gridSnapshot[x][y].static) continue;
                //If particle is not static, run simulation but store the changes in the main grid
                gridSnapshot[x][y].update(x,y,this.grid);
            }
        }
        //Increment framenum
        this.framenum++;
    }
};

export default Screen;