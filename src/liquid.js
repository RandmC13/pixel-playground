import { Particle } from "./particle";
import ParticleUpdate from "./lib/update";

class Liquid extends Particle {
    constructor(type) {
        super(type, false);
    }

    update(x,y,chunk) {
        const update = new ParticleUpdate(this, x, y, chunk);
        
        if (update.canSink())
            return update.sink();

        //Check if liquid can go left or right
        let left = false;
        let right = false;

        const particleLeft = update.getParticle(-1, 0);
        if (particleLeft !== null && particleLeft.liquid && particleLeft.type !== this.type)
            left = true;
        
        const particleRight = update.getParticle(1, 0);
        if (particleRight !== null && particleRight.liquid && particleRight.type !== this.type)
            right = true;

        //If liquid can go either way, choose a random direction
        if (left && right) {
            if (Math.random() > 0.5)
                return update
                    .replaceWith(particleLeft)
                    .moveLeft()
                    .done();
            else
                return update
                    .replaceWith(particleRight)
                    .moveRight()
                    .done();
        }

        //If liquid can only go one way, choose that way
        if (left) {
            return update
                .replaceWith(particleLeft)
                .moveLeft()
                .done();
        } else if (right) {
            return update
                .replaceWith(particleRight)
                .moveRight()
                .done();
        }

        return [];
    }
}

export default Liquid;