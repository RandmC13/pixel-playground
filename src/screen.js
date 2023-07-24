import { WatchIgnorePlugin } from "webpack";
import { getColour, getParticleList } from "./particle";
import Air from "./particles/air"
import Sand from "./particles/sand";
import Water from "./particles/water";

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
        this.particleList = getParticleList();
        this.particleSelected = 0;
        this.paused = false;
        this.framenum = 0;
        this.cursor = [0,0];
        this.brushRadius = 0;
        this.brushList = [];
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
                this.p.fill(...gridSnapshot[x][y].colour);
                this.p.square(...this.getDrawCoords(x,y),this.particleSize);
                
                //Step simulation
                //Only step sim if it is not paused
                if (!this.paused) {
                    //If particle is static no need to update it
                    if (gridSnapshot[x][y].static) continue;
                    //If particle is not static, run simulation but store the changes in the main grid
                    gridSnapshot[x][y].update(x,y,this.grid);
                }
            }
        }
        //Increment framenum if sim is unpaused
        if (!this.paused) this.framenum++;
    };

    getGridCoords(x, y) {
        let gridX = Math.floor(x / this.particleSize);
        let gridY = Math.floor(y / this.particleSize);

        if (gridX < 0 || gridX > this.grid.length) return false;
        if (gridY < 0 || gridY > this.grid[0].length) return false;

        return [gridX,gridY];
    }

    getDrawCoords(gridX, gridY) {
        return [gridX*this.particleSize, gridY*this.particleSize];
    }

    particlesInRadius(x, y, r) {
        //If radius is 0, just draw a point
        if (r == 0) {
            this.brushList = [this.getGridCoords(x,y)];
            return true;
        }
        let absR = (r + 0.5) * this.particleSize;
        let particles = [];
        let minR = Math.sqrt(2) * 0.5 * this.particleSize; //in radians

        for (var theta=0;theta<2*Math.PI;theta+=0.05) {
            //Loop through radi
            for (var radius=0;radius<absR+(0.5*this.particleSize);radius+=minR) {
                let pointX = x + (radius * Math.sin(theta));
                let pointY = y + (radius * Math.cos(theta));
                let point = this.getGridCoords(pointX,pointY);
                if (!point) continue;
                //Get center of grid position
                let [particleX,particleY] = this.getDrawCoords(...point).map(n => n + (0.5*this.particleSize));
                particleX = particleX - x;
                particleY = particleY - y;
                //Get distance of point from center
                let distance = Math.sqrt((particleX**2) + (particleY**2));
                //If the circle can draw a line further than the center of the particle, draw it
                if (absR >= distance) {
                    //Don't include particles that go off the screen
                    if (!particles.includes(point) && point) {
                        particles.push(point);
                    }
                }
            }
        }

        this.brushList = particles;
        return true;
    }

    drawCursor(mouseX, mouseY) {
        const alpha = 25;
        //Set colour
        let colour = getColour(this.particleList[this.particleSelected]).map(n => n+alpha);
        this.p.fill(colour);

        let cursor = this.getGridCoords(mouseX, mouseY);
        if (cursor) this.cursor = cursor;

        let [x,y] = this.cursor;

        let [centerX,centerY] = this.getDrawCoords(x,y).map(n => n+(0.5*this.particleSize));
        this.particlesInRadius(centerX,centerY,this.brushRadius);

        //Draw each particle
        this.brushList.forEach(particle => {
            this.p.square(...this.getDrawCoords(...particle),this.particleSize);
        });
    }

    cursorPlace() {
        this.brushList.forEach(particle => this.placeParticle(...particle));
    }

    pauseText() {
        let padding = 5;
        let string = "Paused";
        let x = this.width - (this.p.textWidth(string) + (2 * padding));
        let y = padding;
        this.p.textAlign(this.p.LEFT,this.p.TOP);
        this.p.fill(255);
        this.p.text(string, x, y);
    }

    switchParticle(increment) {
        let tempSelection = this.particleSelected + increment;
        //Make sure the number does not overflow
        if (tempSelection > this.particleList.length-1) {
            //If attempting to overflow particle list, revert to beginning
            this.particleSelected = 0;
            return false;
        };
        if (tempSelection < 0) {
            //If attempting to underflow particle list, go to end of the list
            this.particleSelected = this.particleList.length-1;
            return false;
        };
        this.particleSelected = tempSelection;
        return true;
    }

    placeParticle(x,y) {
        //Place particle based off of current cursor setting
        switch(this.particleList[this.particleSelected]) {
            case "sand":
                this.grid[x][y] = new Sand();
                break;
            case "air":
                this.grid[x][y] = new Air();
                break;
            case "water":
                this.grid[x][y] = new Water();
                break;
        }
    }
};

export default Screen;