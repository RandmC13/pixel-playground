import ChunkManager from "./chunk";

class Screen {
    constructor(windowWidth, windowHeight, particleSize, chunkSize, sketchObj) {
        //Functions to initiate grid
        const calculateDimensions = (windowWidth, windowHeight, particleSize) => {
            // Misleading name: this is actually the how many pixels wide a chunk is
            let pixelsPerChunk = (particleSize * chunkSize)
            let widthInChunks = Math.floor(windowWidth / pixelsPerChunk);
            let heightInChunks = Math.floor(windowHeight / pixelsPerChunk);
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
        ] = calculateDimensions(windowWidth,windowHeight,particleSize);;

        this.p = sketchObj;
        this.framenum = 0;

        this.particleSize = particleSize;
        this.chunkSize = chunkSize;

        this.chunks = new ChunkManager(this.chunkWidth, this.chunkHeight, this.chunkSize);
    };

    drawAll() {
        this.chunks.drawAllChunks(this.p, this.particleSize);
    }

    stepSim() {
        this.chunks.process();
        this.chunks.draw(this.p, this.particleSize)
        //Increment framenum
        this.framenum++;
    }

    set(x, y, particle) {
        this.chunks.set(x, y, particle);
    }
};

export default Screen;