"use strict";

import Air from "./particles/air";
import { coordPairToIndex, indexToCoordPair } from "./lib/coords"
import ParticleUpdate from "./lib/update";

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
    constructor(x, y, chunkSize, manager) {
        this.x = x;
        this.y = y;
        this.manager = manager;
        this.particleX = x * chunkSize;
        this.particleY = y * chunkSize;
        this.chunkSize = chunkSize;
        this.totalParticles = chunkSize * chunkSize;
        this.particles = Array(this.totalParticles).fill(new Air())
        this.neighbours = Array(9).fill(null);
        this.updateQueue = new Set();
    }

    markActive() {
        this.manager.registerActiveChunk(this);
    }

    markInactive() {
        this.manager.registerInactiveChunk(this);
    }

    markAddtional() {
        this.manager.registerAdditionalChunk(this);
    }

    markUpdated() {
        this.manager.registerUpdatedChunk(this);
    }

    draw(p, particleSize) {
        p.push();
        p.scale(particleSize);
        p.translate(this.particleX, this.particleY);
        this.particles.forEach((particle, index) => {
            p.fill(...particle.colour);
            p.square(...indexToCoordPair(index, this.chunkSize), 1);
        });
        p.pop();
    }

    process() {
        let updateCount = 0;
        const particlesCopy = [...this.particles];
        particlesCopy.forEach((particle, index) => {
            // static particles have no updates
            if (particle.static) return;

            // get list of updates from particle
            const updates = particle.process(...indexToCoordPair(index, this.chunkSize), this);
            if (updates === ParticleUpdate.NullUpdate) {
                updateCount++;
                return;
            }

            updateCount += updates.length;

            for (const update of updates) {
                const [x, y, updatedParticle] = update;

                // index is within current chunk
                if (0 <= x && x < this.chunkSize && 0 <= y && y < this.chunkSize) {
                    this.setRelative(x, y, updatedParticle);
                    continue;
                }

                const chunk = this.getChunkForRelative(x, y);
                if (chunk === null) return;
                
                // generate coords relative to other chunk
                const relativeX = (x + this.particleX) - chunk.particleX;
                const relativeY = (y + this.particleY) - chunk.particleY;

                if (this.manager.chunkHasBeenProcessed(chunk)) {
                    chunk.setRelative(relativeX, relativeY, updatedParticle);
                } else {
                    if (!this.manager.chunkIsActive(chunk))
                        chunk.markAddtional();

                    chunk.setRelative(relativeX, relativeY, updatedParticle.withUpdateCooldown(1));
                }
            }
        });

        for (const update of this.updateQueue) {
            const [x, y, updatedParticle] = update;
            this.setRelative(x, y, updatedParticle);
        }
        this.updateQueue.clear();

        if (updateCount === 0)
            this.markInactive();
        else
            this.markUpdated();
    }

    getChunkForRelative(x, y) {
        /*
            This function takes a pair of relative coordinates (ie (0,0) is the top left corner of the chunk)
            and returns the chunk corresponding to the coordinates. If the coordinate falls within a neighbouring
            chunk, the neighbouring chunk will be returned from this.neighbours. If the chunk is further afield,
            this.manager.getChunkFor() will be called with the absolute coordinates to resolve the chunk. This case
            shouldn't happen in the current state of PixelPlayground as no particles currently have the ability to
            affect particles more than 1 chunk away, but the implementation may be useful in the future.
        */

        // Work out what column the chunk is in
        let col = 0;
        if (-this.chunkSize <= x && x < 0)
            col = 0;    // left
        else if (0 <= x && x < this.chunkSize)
            col = 1;    // centre
        else if (this.chunkSize <= x < (this.chunkSize * 2))
            col = 2;    // right
        else
            return this.manager.getChunkFor(x + this.particleX, y + this.particleY);

        // Work out what row the chunk is in
        let row = 0;
        if (-this.chunkSize <= y && y < 0)
            row = 0;    // top
        else if (0 <= y && y < this.chunkSize)
            row = 3;    // middle
        else if (this.chunkSize <= x < (this.chunkSize * 2))
            row = 6;    // bottom
        else
            return this.manager.getChunkFor(x + this.particleX, y + this.particleY);

        
        const index = row + col;
        if (index === 4)
            // 4 => column = 1 (centre) + row = 3 (middle) => the current chunk
            return this;

        return this.neighbours[index]; 
    }

    setIndex(index, particle) {
        this.particles[index] = particle;
        this.markActive();
        this.markUpdated();
        this.activateChunksNeighbouringParticle(index);
    }

    getRelative(x, y) {
        if (0 <= x && x < this.chunkSize && 0 <= y && y < this.chunkSize)
            return this.particles[coordPairToIndex(x, y, this.chunkSize)];
        
        const chunk = this.getChunkForRelative(x, y);
        if (chunk === null) return null;
        // generate coords relative to other chunk
        const relativeX = (x + this.particleX) - chunk.particleX;
        const relativeY = (y + this.particleY) - chunk.particleY;

        return chunk.getRelative(relativeX, relativeY);
    }

    setRelative(x, y, particle) {
        this.setIndex(coordPairToIndex(x, y, this.chunkSize), particle);
    }

    setAbsolute(x, y, particle) {
        this.setIndex(coordPairToIndex(x - this.particleX, y - this.particleY, this.chunkSize), particle);
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
            this.neighbours[ChunkNeighbourEnum.MIDDLE_RIGHT]?.markActive();
            x_corner = 2;
        }
        if (y === 0) {
            this.neighbours[ChunkNeighbourEnum.TOP_CENTRE]?.markActive();
            y_corner = 0;
        } else if (y === this.chunkSize - 1) {
            this.neighbours[ChunkNeighbourEnum.BOTTOM_CENTRE]?.markActive();
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
        this.additionalChunks = new Set();

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
            }
            if (x === cols - 1) {
                delete mapping[ChunkNeighbourEnum.TOP_RIGHT];
                delete mapping[ChunkNeighbourEnum.MIDDLE_RIGHT];
                delete mapping[ChunkNeighbourEnum.BOTTOM_RIGHT];
            }
            
            if (y === 0) {
                delete mapping[ChunkNeighbourEnum.TOP_LEFT];
                delete mapping[ChunkNeighbourEnum.TOP_CENTRE];
                delete mapping[ChunkNeighbourEnum.TOP_RIGHT];
            }
            if (y === rows - 1) {
                delete mapping[ChunkNeighbourEnum.BOTTOM_LEFT];
                delete mapping[ChunkNeighbourEnum.BOTTOM_CENTRE];
                delete mapping[ChunkNeighbourEnum.BOTTOM_RIGHT];
            }

            for (const entry of Object.entries(mapping)) {
                const [neighbourId, indexChange] = entry;
                chunk.registerNeighbour(neighbourId, chunksArray[chunkIndex + indexChange]);
            }
        });

        this.processedChunks = new Set();
    }

    set(x, y, particle) {
        this.getChunkFor(x, y)?.setAbsolute(x, y, particle);
    }

    registerActiveChunk(chunk) {
        this.activeChunks.add(chunk);
    }

    registerAdditionalChunk(chunk) {
        this.additionalChunks.add(chunk);
    }

    registerInactiveChunk(chunk) {
        this.activeChunks.delete(chunk);
    }

    registerUpdatedChunk(chunk) {
        this.updatedChunks.add(chunk);
    }

    getChunkFor(x, y) {
        const chunkX = ~~(x / this.chunkSize);
        const chunkY = ~~(y / this.chunkSize);
        if (0 > chunkX || chunkX >= this.cols || 0 > chunkY || chunkY >= this.rows)
            return null;

        const chunkIndex = coordPairToIndex(
            ~~(x / this.chunkSize),
            ~~(y / this.chunkSize),
            this.cols
        );
        return this.chunks[chunkIndex];
    }

    drawAllChunks(p, particleSize) {
        for (const chunk of this.chunks) {
            chunk.draw(p, particleSize);
        }
    }

    draw(p, particleSize) {
        for (const chunk of this.updatedChunks) {
            chunk.draw(p, particleSize);
            // TODO: move this to the debug canvas
            // chunk.debug(p);
        }
        
        // Should be faster than instantiating a new Set due to GC and Heap alloc times
        // https://measurethat.net/Benchmarks/Show/10675/0/new-set-vs-set-clear#latest_results_block
        this.updatedChunks.clear();
    }

    process() {
        // Clone the active chunks set to avoid modifying it
        // while we are iterating over it - JS doesn't agree with that
        const activeChunks = new Set(this.activeChunks);
        this.processChunks(activeChunks);

        while (this.additionalChunks.size !== 0) {
            const additionalChunks = new Set(this.additionalChunks);
            this.additionalChunks.clear();
            this.processChunks(additionalChunks);
        }
    }

    processChunks(chunkArray) {
        this.processedChunks.clear();
        for (const chunk of chunkArray) {
            chunk.process();
            this.processedChunks.add(chunk);
        }
    }

    chunkHasBeenProcessed(chunk) {
        return this.processedChunks.has(chunk);
    }

    chunkIsActive(chunk) {
        return this.activeChunks.has(chunk);
    }
}

export default ChunkManager;