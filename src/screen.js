import ChunkManager from "./chunk";
import { getColour } from "./particle";
import Air from "./particles/air"
import Sand from "./particles/sand";

class Screen {
    constructor(windowWidth, windowHeight, particleSize, chunkSize, sketchObj) {
        //Functions to initiate grid
        const calculateDimensions = (windowWidth, windowHeight, particleSize) => {
            // Misleading name: this is actually the how many pixels wide a chunk is
            let pixelsPerChunk = (particleSize * chunkSize)
            let widthInChunks = Math.floor(windowWidth / pixelsPerChunk);
            let heightInChunks = Math.floor(windowHeight / pixelsPerChunk);
            //return [ 256, 256, 32, 32, 4, 4 ];
            return [
                widthInChunks * pixelsPerChunk,     // screen width px
                heightInChunks * pixelsPerChunk,    // screen height px
                widthInChunks * chunkSize,          // screen width in particles
                heightInChunks * chunkSize,         // screen height in particles
                widthInChunks,                      // screen width in chunks
                heightInChunks                      // screen height in chunks
            ];
        }

        [
            this.pixelWidth, this.pixelHeight,
            this.particleWidth, this.particleHeight,
            this.chunkWidth, this.chunkHeight
        ] = calculateDimensions(windowWidth,windowHeight,particleSize);

        this.p = sketchObj;
        this.framenum = 0;

        this.particleSize = particleSize;
        this.chunkSize = chunkSize;

        this.chunks = new ChunkManager(this.chunkWidth, this.chunkHeight, this.chunkSize);

        this.paused = false;
        this.cursor = [0,0];
        this.brushRadius = 0;
        this.brushList = [];
        this.cursorType = "sand";
    };

    drawAll() {
        this.chunks.drawAllChunks(this.p, this.particleSize);
    }

    stepSim() {
        this.chunks.process();
        this.chunks.draw(this.p, this.particleSize);
        // this.chunks.drawAllChunks(this.p, this.particleSize);
        //Increment framenum
        this.framenum++;
    };

    getGridCoords(x, y) {
        let gridX = Math.floor(x / this.particleSize);
        let gridY = Math.floor(y / this.particleSize);

        if (gridX < 0 || gridX > this.particleWidth) return false;
        if (gridY < 0 || gridY > this.particleHeight) return false;

        return [gridX,gridY];
    }

    getDrawCoords(gridX, gridY) {
        return [gridX*this.particleSize, gridY*this.particleSize];
    }

    particlesInRadius(x, y, r) {
        let absR = (r + 0.5) * this.particleSize;
        let particles = [];
        let minR = Math.sqrt(2) * 0.5 * this.particleSize; //in radians

        for (var theta=0;theta<2*Math.PI;theta+=0.05) {
            let circleX = x + (absR * Math.sin(theta));
            let circleY = y + (absR * Math.cos(theta));

            //Loop through radi
            for (var radius=0;radius<absR;radius+=minR) {
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
                if (absR >= distance-(0.45*this.particleSize)) {
                    //Don't include particles that go off the screen
                    if (!particles.includes(point) && point) {
                        particles.push(point);
                    }
                }
            }
        }

        this.brushList = particles;
    }

    drawCursor(mouseX, mouseY) {
        const alpha = 25;
        //Set colour
        let colour = getColour(this.cursorType).map(n => n+alpha);
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

        this.chunks.getChunkFor(x, y).markUpdated();
    }

    cursorPlace() {
        //this.brushList.forEach(particle => this.placeParticle(...particle));
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

    placeParticle(x,y) {
        //Place particle based off of current cursor setting
        switch(this.cursorType) {
            case "sand":
                this.grid[x][y] = new Sand();
                break;
            case "air":
                this.grid[x][y] = new Air();
                break;
        }
    }

    set(x, y, particle) {
        this.chunks.set(x, y, particle);
    }
};

export default Screen;