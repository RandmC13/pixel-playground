"use strict";

import Air from "./air";
import { Particle } from "../particle";
import ParticleUpdate from "../lib/update";

class Sand extends Particle {
    constructor() {
        const type = "sand";
        super(type, false);
    }

    update(x,y,chunk) {
        const update = new ParticleUpdate(this, x, y);
        //Check if sand is on the ground
        const particleBelow = chunk.getRelative(x, y + 1);
        if (particleBelow === null) {
            this.static = true;
            return [];
        }

        //Check if sand can fall down
        if (particleBelow.type == "air") {
            return update
                .replaceWith(new Air())
                .moveDown(1)
                .done();
        }

        //If sand can't fall down check if it can fall left or right
        let left = false;
        let right = false;

        const particleLeft = chunk.getRelative(x - 1, y + 1);
        if (particleLeft !== null && particleLeft.type === "air")
            left = true;
        
        const particleRight = chunk.getRelative(x + 1, y + 1);
        if (particleRight !== null && particleRight.type === "air")
            right = true;

        //If sand can fall either way, choose a random direction
        if (left && right) {
            return update
                .replaceWith(new Air())
                .move(Math.random() > 0.5 ? -1 : 1, 1)
                .done();
        }

        //If sand can only go one way, choose that way
        if (left)
            return update
                .replaceWith(new Air())
                .move(-1, 1)
                .done();
        else if (right)
            return update
                .replaceWith(new Air())
                .move(1, 1)
                .done();

        return [];
    }
}

export default Sand;