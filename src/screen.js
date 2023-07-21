import Air from "./air"
import Chunk from "./chunk"

class Screen {
    constructor(windowWidth, windowHeight, particleSize, chunkSize, sketchObj) {
        //Functions to initiate grid
        const calculateDimensions = (windowWidth, windowHeight, particleSize) => {
            let width = Math.floor(windowWidth / particleSize) * particleSize;
            let height = Math.floor(windowHeight / particleSize) * particleSize;
            return [width,height];
        }

        const generateChunks = (particleSize, chunkSize) => {
            let cols = (this.width / particleSize) / chunkSize;
            let rows = (this.height / particleSize) / chunkSize;

            let chunks = new Array(cols * rows).map(
                (_, index) => new Chunk(...indexToCoordPair(index), chunkSize)
            );

            return chunks;
        }

        let dimensions = calculateDimensions(windowWidth,windowHeight,particleSize);

        this.p = sketchObj;
        this.width = dimensions[0];
        this.height = dimensions[1];
        this.particleSize = particleSize;
        this.chunkSize = chunkSize;
        this.chunks = generateChunks(this.particleSize);
        this.gridWidth = this.chunks.length;
        this.gridHeight = this.chunks[0].length;
        this.framenum = 0;
        this.activeChunks = new Set();
    };

    drawAllChunks(chunks = null) {
        const chunkList = (chunks ?? this.chunks);
        for (let chunk of chunkList)
            chunk.draw();
    }

    updateGrid(updates) {
        const chunks = new Set();
        for (let update of updates) {
            const [x, y, particle] = update;
            //Loop through changes and update the grid accordingly
            const chunk = this.chunks[~~(x / this.chunkSize)][~~(y / this.chunkSize)];
            chunk.queueUpdate(x, y, particle);
            chunks.add(chunk);
        }

        for (let chunk of chunks)
            chunk.dispatchUpdates();

        return chunks;
    }

    stepSim() {
        let gridUpdates = [];
        /*These 2 loops could be combined for more efficiency but can sometimes make the game look choppy because more intensive
            update processes result in gaps between parts of the frame being drawn. By separating the loops, the frame is drawn uniformly.*/
        // for (var y=0;y<this.grid[0].length;y++) {
        //     for (var x=0;x<this.grid.length;x++) {
        //         //Draw grid
        //         this.p.fill(this.grid[x][y].colour[0],this.grid[x][y].colour[1],this.grid[x][y].colour[2]);
        //         this.p.square(x*this.particleSize,y*this.particleSize,this.particleSize);
        //     }
        // }
        //Enact updates
        const updatedChunks = this.updateGrid(gridUpdates);

        this.drawAllChunks(updatedChunks)        

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
        
        //Increment framenum
        this.framenum++;
    }

    set(x, y, particle) {
        const chunk = this._getChunkForParticle(x, y);
        chunk.setAbsolute(x, y, particle);
        this.activeChunks.add(chunk);
    }

    _getChunkForParticle(x, y) {
        return this.chunks[coordPairToIndex(x / this.chunkSize, y / this.chunkSize)]
    }
};

export default Screen;