class ParticleUpdate {
    // Used by particle with an update cooldown to keep their chunk active 
    static NullUpdate = null;

    constructor(particle, x, y, chunk) {
        this.particle = particle;
        this.x = x;
        this.y = y;
        this.chunk = chunk;
        this.updates = [];
        this.loadedParticles = {};
    }

    getParticle(offsetX, offsetY) {
        const position = [offsetX, offsetY];
        if (position in this.loadedParticles)
            return this.loadedParticles[position];
        
        const particle = this.chunk.getRelative(this.x + offsetX, this.y + offsetY);
        this.loadedParticles[position] = particle;
        return particle;
    }

    canSink() {
        const particleBelow = this.getParticle(0, 1);
        return (particleBelow !== null && particleBelow.liquid && this.particle.density > particleBelow.density);
    }

    sink() {
        const particleBelow = this.getParticle(0, 1);
        return this.replaceWith(particleBelow).moveDown().done();
    }

    replaceWith(newParticle) {
        this.updates.push([this.x, this.y, newParticle]);
        return this;
    }

    move(deltaX, deltaY) {
        this.updates.push([this.x + deltaX, this.y + deltaY, this.particle]);
        return this;
    }

    moveLeft(particles = 1) {
        this.move(-particles, 0);
        return this;
    }

    moveRight(particles = 1) {
        this.move(particles, 0);
        return this;
    }

    moveUp(particles = 1) {
        this.move(0, -particles);
        return this;
    }

    moveDown(particles = 1) {
        this.move(0, particles);
        return this;
    }

    done() {
        return this.updates;
    }
}

export default ParticleUpdate;