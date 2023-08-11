# Chunk System

## Intro

In order to increase the efficiency of the simulation, the screen is divided into square areas called chunks. The chunk allocation is handled by the `ChunkManager` class defined in `src/chunk.js`. The `ChunkManager` allocates an array of `Chunk`s, which are all processed and rendered only when required. The `ChunkManager` class provides a high level interface into the underlying chunks, providing basic functionality such as setting particles, rendering chunks and other utilty functions.

## The Chunk Lifecycle

After being created, the chunk is marked as inactive. There only 2 ways for a chunk to become active. Either:
<p>A particle enters the chunk, via the player or from another chunk</p>
<p>Or</p>
<p>A neighbouring chunk activates the chunk due to a particle on the border</p>

In either case, all the of the particles within the chunk will be processed. If any updates are encountered (a particle moving, being destroyed or created), the chunk will be marked as updated and will be rendered to the screen. If no updates are encountered, the chunk is marked as inactive again.

## Particle / Chunk interface

Whenever a chunk is processed, the `update()` function is called for all particles within that chunk. `update()` is called with the particle's coordinates relative to its containing chunk and a reference to the containing chunk, eg `update(0, 0, Chunk())`. The coordinates 0, 0 refer to the top left particle within a chunk. Particles should perform any processing, using `chunk.getRelative()` to query surrounding particles, and return an array of Update lists. There is a `ParticleUpdate` class in `src/lib/update.js` which assists with generating this array. Each item in the array should be another array where the first two items are an X and Y coordinate (relative to the parent chunk), and the final item is the new particle to be placed at those coordinates. Dispatching the updates is handled by the `Chunk` class and particles should not modify their parent chunk.

### Example Snippets

```js
// Basic particle that moves down if it can
class BasicParticle extends Particle {
    constructor() {
        const type = "basic";
        super(type, false);
    }

    update(x, y, chunk) {
        // Get the particle at (x, y + 1), ie the particle below
        const particleBelow = chunk.getRelative(x, y + 1);
        if (particleBelow.type === "air") {
            return [
                [x, y, new Air()],  // Replace the current particle with Air
                [x, y + 1, this],   // Replace the Air below with the current particle
            ]
        }

        return [];
    }
}

```

## Chunk

```js
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
    };

    markActive();
    markInactive();
    markUpdated();
    draw(p, particleSize);
    process();
    getChunkForRelative(x, y);
    getRelative(x, y);
    setIndex(index, particle);
    setRelative(x, y, particle);
    setAbsolute(x, y, particle);
    registerNeighbour(neighbourIndex, chunk);
    activateChunksNeighbouringParticle(index);
}
```

### Properties:
- `x`: The chunk x coordinate (in chunk coordinates).
- `y`: The chunk y coordinate (in chunk coordinates).
- `manager`: A reference to the `ChunkManager` that created/manages this chunk.
- `particleX`: The particle x coordinate of the top left corner of this chunk.
- `particleY`: The particle y coordinate of the top left corner of this chunk.
- `chunkSize`: The width and height of this chunk in particles.
- `totalParticles`: The total number of particles in this chunk.
- `particles`: The array of particles for this chunk.
- `neighbours`: The array of neighbouring chunks.

### Methods:
- `constructor(x, y, chunkSize, manager)`: When the `ChunkManager` initialises a new `Chunk`, it will pass in the x and y position of the chunk (**in chunk coordinates**), the chunkSize which represents the width and height of the chunk, and a reference to itself.
- `markActive()`: When a chunk needs to be processed, it can call this function to signal to the `ChunkManager` that it should be processed on the next simulation step. It will continue to be processed on each simulation step until it calls `markInactive()`.
- `markInactive()`: This function signals to the `ChunkManager` that this chunk can be removed from the list of chunks to process.
- `markUpdated()`: This signals to the `ChunkManager` that this chunk needs to be re-rendered.
- `draw(p, particleSize)`: This function renders the chunk to the screen. It takes two arguments: `p`, which is a reference to the p5 object, and `particleSize` which is an integer specifying what size to draw the particles within the chunk.
- `process()`: This function invokes the `update()` method on all particles within the chunk and applies the updates to the particles array of this chunk and its neighbours if required.
- `getChunkForRelative(x, y)`: This function locates the chunk that contains the specified coordinates relative to the top left corner of the current chunk (measured in particles). eg, with a chunkSize of 8, calling `getChunkForRelative(-1, 9)` will return the chunk to the bottom-left of the current chunk. When possible, this function will use the neighbours array of the chunk, however if the requested coordinates are more than 1 chunk away, the chunk will be located using the `getChunkFor(x, y)` method of the `ChunkManager`.
- `getRelative(x, y)`: Returns the particle at the given relative (particle) coordinates.
- `setIndex(index, particle)`: Sets the particle at the given index and marks the chunk updated and active. Also calls `activateChunksNeighbouringParticle(index)`.
- `setRelatve(x, y, particle)`: Sets the particle at the given relative (particle) coordinates.
- `setAbsolute(x, y, particle)`: Sets the particle at the given absolute (particle) coordinates.
- `registerNeighbour(neighbourIndex, chunk)`: This function is called by the `ChunkManager` when intialising chunks. A neighbourIndex must be specified from the `ChunkNeighbourEnum` class, as well as the chunk to associate with the given index.
- `activateChunksNeighbouringParticle(index)`: For a given index, this function will determine if the particle directly neighbours any chunks, and if so, will mark them as active.


## ChunkManager

