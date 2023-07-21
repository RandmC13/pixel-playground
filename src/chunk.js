import Air from "./air";
import { coordPairToIndex } from "./lib/coords"

class Chunk {
    constructor(x, y, chunkSize) {
        this.x = x;
        this.y = y;
        this.particles = Array(chunkSize * chunkSize).fill(new Air())
        this.updates = [];
    }

    draw() {

    }

    process() {
        for (const particle of this.particles) {
            if (particle.static) continue;
            const update = particle.update()
        }
    }

    dispatchUpdates() {
        for (const update of this.updates) {
            const [index, particle] = update;
            this.particles[index] = particle;

            // Handle special cases that may cause other chunks to be updated
        }
    }

    setRelative(x, y, particle) {
        this.updates.push([coordPairToIndex(x, y), particle]);
    }

    setAbsolute(x, y, particle) {
        this.setRelative(x - this.x, y - this.y, particle);
    }
}

export default Chunk;