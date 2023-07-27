import ChunkManager from "./chunk";
import { getColour, getParticleList } from "./particle";
import Air from "./particles/air"
import Oil from "./particles/oil";
import Sand from "./particles/sand";
import Water from "./particles/water";

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
        this.particleList = getParticleList();
        this.particleSelected = 0;
        this.framenum = 0;

        this.particleSize = particleSize;
        this.chunkSize = chunkSize;

        this.chunks = new ChunkManager(this.chunkWidth, this.chunkHeight, this.chunkSize);

        this.paused = false;
        this.cursor = [0,0];
        this.brushes = {};
        this.brushRadius = 0;

        for (let radius = 0; radius < 20; radius++) {
            this.generateBrush(radius);
        }
    };

    drawAll() {
        this.chunks.drawAllChunks(this.p, this.particleSize);
    }
    
    draw() {
        this.chunks.draw(this.p, this.particleSize);
    }

    stepSim() {
        this.chunks.process();
        this.draw();
        // this.chunks.drawAllChunks(this.p, this.particleSize);

        //Increment framenum if sim is unpaused
        if (!this.paused) this.framenum++;
    };

    getGridCoords(x, y) {
        let gridX = Math.floor(x / this.particleSize);
        let gridY = Math.floor(y / this.particleSize);

        if (gridX < 0 || gridX > this.particleWidth-1) return false;
        if (gridY < 0 || gridY > this.particleHeight-1) return false;

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

    generateBrush(r) {
        // Rather than generating brushes on the fly, we can generate a series of offsets
        // on simulation start and apply them to hopefully get a speed up
        // Using the big brush size seems to cut the FPS in half
        const offsets = [[0,0]];
        if (r === 0) {
            this.brushes[r] = offsets;
            return;
        }

        // Array.includes compares by reference (JS add Tuples already)
        // So we will convert the point to a string and store it in a set
        // to check if the point is already included. Slow, but this code is only
        // run once at start.
        const includedPoints = new Set(["0,0"]);

        const absR = (r + 0.5) * this.particleSize;
        const minR = Math.sqrt(2) * 0.5 * this.particleSize; //in radians
        const TWO_PI = 2 * Math.PI;

        for (let theta = 0; theta < TWO_PI; theta += 0.05) {
            for (let radius = 0; radius < absR + (0.5 * this.particleSize); radius += minR) {
                const pointX = Math.floor((radius * Math.sin(theta)) / this.particleSize);
                const pointY = Math.floor((radius * Math.cos(theta)) / this.particleSize);
                const [offsetX, offsetY] = [Math.floor(pointX), Math.floor(pointY)];
                const pointString = `${offsetX},${offsetY}`;
                if (includedPoints.has(pointString)) continue;

                const centreX = (pointX + 0.5) * this.particleSize;
                const centreY = (pointY + 0.5) * this.particleSize;
                const distance = Math.sqrt((centreX * centreX) + (centreY * centreY));

                if (absR >= distance) {
                    offsets.push([offsetX, offsetY]);
                    includedPoints.add(pointString);
                }
            }
        }

        this.brushes[r] = offsets;
    }

    *getBrushParticles() {
        // Generator function is used to avoid looping over the items twice
        const [x,y] = this.cursor;

        for (const offset of this.brushes[this.brushRadius]) {
            yield [x + offset[0], y + offset[1]];
        }
    }

    drawCursor(mouseX, mouseY) {
        const alpha = 25;
        //Set colour
        let colour = getColour(this.particleList[this.particleSelected]).map(n => n+alpha);
        this.p.fill(colour);

        let cursor = (this.brushRadius === 0) ? this.getGridCoords(mouseX, mouseY) : this.getGridCoords(mouseX + 0.5 * this.particleSize, mouseY + 0.5 * this.particleSize);
        if (cursor) this.cursor = cursor;

        const particles = this.getBrushParticles();

        for (const particle of particles)
            this.p.square(...this.getDrawCoords(particle[0], particle[1]), this.particleSize);

        const brushChunks = this.getBrushChunks(...this.cursor);
        for (const chunk of brushChunks)
            chunk.markUpdated();
        
    }

    getBrushChunks(x, y) {
        const chunks = new Set();
        chunks.add(this.chunks.getChunkFor(x, y));
        let chunkRadius = Math.ceil(this.brushRadius / this.chunkSize) + 1;
        for (let chunkX = 0; chunkX < chunkRadius; chunkX++) {
            for (let chunkY = 0; chunkY < chunkRadius; chunkY++) {
                chunks.add(this.chunks.getChunkFor(x - chunkX * this.chunkSize, y - chunkY * this.chunkSize));
                chunks.add(this.chunks.getChunkFor(x + chunkX * this.chunkSize, y - chunkY * this.chunkSize));
                chunks.add(this.chunks.getChunkFor(x - chunkX * this.chunkSize, y + chunkY * this.chunkSize));
                chunks.add(this.chunks.getChunkFor(x + chunkX * this.chunkSize, y + chunkY * this.chunkSize));
            }
        }

        chunks.delete(null);
        return chunks;
    }

    cursorPlace() {
        for (const particle of this.getBrushParticles())
            this.placeParticle(...particle);
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
                this.set(x, y, new Sand());
                break;
            case "air":
                this.set(x, y, new Air());
                break;
            case "water":
                this.set(x, y, new Water());
                break;
            case "oil":
                this.set(x, y, new Oil());
        }
    }

    set(x, y, particle) {
        this.chunks.set(x, y, particle);
    }
};

export default Screen;