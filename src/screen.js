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
                grid[x] = new Array(colHeight).fill(0);
            }

            return grid;
        }

        let dimensions = calculateDimensions(windowWidth,windowHeight,particleSize);

        this.width = dimensions[0];
        this.height = dimensions[1];
        this.particleSize = particleSize;
        this.grid = generateGrid(this.particleSize);
        this.gridWidth = this.grid.length;
        this.gridHeight = this.grid[0].length;
        this.p = sketchObj;
    };

    draw() {
        for (var y=0;y<this.grid[0].length;y++) {
            for (var x=0;x<this.grid.length;x++) {
                if (this.grid[x][y] == 1) this.p.rect(x*this.particleSize,y*this.particleSize,this.particleSize);
            }
        }
    }
};

export default Screen;