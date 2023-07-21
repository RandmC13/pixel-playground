import Air from "./air";
import { coordPairToIndex, indexToCoordPair } from "./lib/coords"

class ChunkNeighbourEnum {
    static TOP_LEFT = 0;
    static TOP_CENTRE = 1;
    static TOP_RIGHT = 2;
    static MIDDLE_LEFT = 3;
    static MIDDLE_RIGHT = 5;
    static BOTTOM_LEFT = 6;
    static BOTTOM_CENTRE = 7;
    static BOTTOM_RIGHT = 8;
}

class Chunk {
    /*
        if this.active:
            process() -> processes all particles and pushes any updates this.updates, marks the chunk as active
            dispatchUpdates() -> enacts all updates on the this.particles array, marks the chunk as updated

        if this.hasUpdated:
            draw() -> draws the chunk to the canvas
    */

    constructor(x, y, chunkSize, manager) {
        this.x = x;
        this.y = y;
        this.manager = manager;
        this.particleX = x * chunkSize;
        this.particleY = y * chunkSize;
        this.chunkSize = chunkSize;
        this.totalParticles = chunkSize * chunkSize;
        this.active = false;
        this.particles = Array(this.totalParticles).fill(new Air())
        this.updates = new Set();
        this.hasUpdated = false;
        this.neighbours = Array(8).fill(null);
    }

    markActive() {
        this.manager.registerActiveChunk(this);
    }

    markInactive() {
        this.manager.registerInactiveChunk(this);
    }

    markUpdated() {
        this.manager.registerUpdatedChunk(this);
    }

    draw(p, particleSize) {
        p.push();
        p.scale(particleSize);
        p.translate(this.particleX, this.particleY);
        this.particles.forEach((particle, index) => {
            if (particle.type != "air") {
                p.fill(...particle.colour);
                p.square(...indexToCoordPair(index, this.chunkSize), 1);
            }
        });
        p.pop();
    }

    debug(p) {
        p.push();
        const colour = (this.x + this.y) % 2 === 0 ? [0, 255, 0, 127] : [0, 0, 255, 127];
        p.fill(...colour);
        p.square(this.x * 64, this.y * 64, 64);
        p.pop();
    }

    process() {
        for (const particle of this.particles) {
            try {
                if (particle.static) continue;
            } catch {
                console.log(this);
            }
            const update = particle.update();
            if (update === null)
                continue;
    
            this.updates.push(update);
        }
    }

    dispatchUpdates() {
        // If any updates are dispatched, mark the chunk as active and updated
        // Else, mark the chunk as inactive
        if (this.updates.size === 0) {
            this.markInactive();
            return;
        }

        for (const update of this.updates) {
            const [index, particle] = update;
            this.particles[index] = particle;

            this.markUpdated();

            // Handle special cases that may cause other chunks to be updated
            this.activateChunksNeighbouringParticle(index);
        }

        this.updates.clear();
    }

    setRelative(x, y, particle) {
        this.updates.add([coordPairToIndex(x, y, this.chunkSize), particle]);
        this.markActive();
    }

    setAbsolute(x, y, particle) {
        this.setRelative(x - this.particleX, y - this.particleY, particle);
    }

    registerNeighbour(neighbourIndex, chunk) {
        this.neighbours[neighbourIndex] = chunk;
    }

    activateChunksNeighbouringParticle(index) {
        // This math can probably be sped up by not converting to a coord pair
        // Eg.
        // index % chunkSize == 0 -> It is on the left wall
        // (index + 1) % chunkSize == 0 -> It is on the right wall
        // index < chunkSize ->  It is on the top row
        // index >= this.totalParticles - chunkSize -> It is on the bottom row
        const [x, y] = indexToCoordPair(index, this.chunkSize);

        let x_corner = null, y_corner = null;
        if (x === 0) {
            this.neighbours[ChunkNeighbourEnum.MIDDLE_LEFT]?.markActive();
            x_corner = 0;
        } else if (x === this.chunkSize - 1) {
            this.neighbours[ChunkNeighbourEnum.MIDDLE_LEFT]?.markActive();
            x_corner = 2;
        }
        if (y === 0) {
            this.neighbours[ChunkNeighbourEnum.TOP_CENTRE]?.markActive();
            y_corner = 0;
        } else if (y === this.chunkSize - 1) {
            this.neighbours[ChunkNeighbourEnum.MIDDLE_LEFT]?.markActive();
            y_corner = 6;
        }

        if (x_corner !== null && y_corner !== null)
            this.neighbours[x_corner + y_corner]?.markActive();
    }
}

class ChunkManager {
    constructor(cols, rows, chunkSize) {
        this.cols = cols;
        this.rows = rows;

        this.chunkCount = cols * rows;
        this.chunkSize = chunkSize;

        this.chunks = new Array(this.cols * this.rows);
        for (let x = 0; x < cols; x++)
            for (let y = 0; y < rows; y++)
                this.chunks[y * cols + x] = new Chunk(x, y, chunkSize, this);

        this.activeChunks = new Set();
        this.updatedChunks = new Set();

        this.chunkNeighbourMapping = {
            [ChunkNeighbourEnum.TOP_LEFT]:      -this.cols - 1,
            [ChunkNeighbourEnum.TOP_CENTRE]:    -this.cols,
            [ChunkNeighbourEnum.TOP_RIGHT]:     -this.cols + 1,
            [ChunkNeighbourEnum.MIDDLE_LEFT]:   -1,
            [ChunkNeighbourEnum.MIDDLE_RIGHT]:  1,
            [ChunkNeighbourEnum.BOTTOM_LEFT]:   this.cols - 1,
            [ChunkNeighbourEnum.BOTTOM_CENTRE]: this.cols,
            [ChunkNeighbourEnum.BOTTOM_RIGHT]:  this.cols + 1,
        };

        this.chunks.forEach((chunk, chunkIndex, chunksArray) => {
            const [x, y] = indexToCoordPair(chunkIndex, cols);

            // Crude way to make a shallow copy
            const mapping = JSON.parse(JSON.stringify(this.chunkNeighbourMapping));

            if (x === 0) {
                delete mapping[ChunkNeighbourEnum.TOP_LEFT];
                delete mapping[ChunkNeighbourEnum.MIDDLE_LEFT];
                delete mapping[ChunkNeighbourEnum.BOTTOM_LEFT];
            } else if (x === cols - 1) {
                delete mapping[ChunkNeighbourEnum.TOP_RIGHT];
                delete mapping[ChunkNeighbourEnum.MIDDLE_RIGHT];
                delete mapping[ChunkNeighbourEnum.BOTTOM_RIGHT];
            }
            
            if (y === 0) {
                delete mapping[ChunkNeighbourEnum.TOP_LEFT];
                delete mapping[ChunkNeighbourEnum.TOP_CENTRE];
                delete mapping[ChunkNeighbourEnum.TOP_RIGHT];
            } else if (y === cols - 1) {
                delete mapping[ChunkNeighbourEnum.BOTTOM_LEFT];
                delete mapping[ChunkNeighbourEnum.BOTTOM_CENTRE];
                delete mapping[ChunkNeighbourEnum.BOTTOM_RIGHT];
            }

            for (const entry of Object.entries(mapping)) {
                const [neighbourId, indexChange] = entry;
                chunk.registerNeighbour(neighbourId, chunksArray[chunkIndex + indexChange]);
            }
        });
    }

    set(x, y, particle) {
        this.getChunkFor(x, y).setAbsolute(x, y, particle);
    }

    registerActiveChunk(chunk) {
        this.activeChunks.add(chunk);
    }

    registerInactiveChunk(chunk) {
        this.activeChunks.delete(chunk);
    }

    registerUpdatedChunk(chunk) {
        this.updatedChunks.add(chunk);
    }

    getChunkFor(x, y) {
        const chunkIndex = coordPairToIndex(
            ~~(x / this.chunkSize),
            ~~(y / this.chunkSize),
            this.cols
        );
        return this.chunks[chunkIndex];
    }

    drawAllChunks(p, particleSize) {
        for (const chunk of this.chunks) {
            chunk.debug(p);
            chunk.draw(p, particleSize);
        }
    }

    draw(p, particleSize) {
        for (const chunk of this.updatedChunks) {
            chunk.debug(p);
            chunk.draw(p, particleSize);
        }
        
        // Should be faster than instantiating a new Set due to GC and Heap alloc times
        // https://measurethat.net/Benchmarks/Show/10675/0/new-set-vs-set-clear#latest_results_block
        this.updatedChunks.clear();
    }

    process() {
        for (const chunk of this.activeChunks) {
            chunk.process();
            chunk.dispatchUpdates();
        }
    }
}

export default ChunkManager;