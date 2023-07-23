class ParticleUpdate {
    constructor(particle, x, y) {
        this.particle = particle;
        this.x = x;
        this.y = y;
        this.updates = [];
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