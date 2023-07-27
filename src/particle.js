import ParticleUpdate from "./lib/update";

/*Potential particle properties:
-colour
-type
-static
-state flag (solid, liquid, fire) having a flag should help with making particle interaction checking easier
-mass
-liquid
-flammable????
-burning??????
-density?????? buoyancy can be added
-radioactivity???????
*/

const particles = {
    "sand": {
        colour: [194,178,128]
    },
    "air": {
        colour: [70,70,70]
    }
};

const getColour = (type) => {
    return particles[type]["colour"];
}

const getParticleList = () => {
    return Object.keys(particles);
}

class Particle {
    constructor(type, stationary, updateCooldown=0) {
        this.colour = getColour(type);
        this.type = type;
        this.static = stationary;
        this.updateCooldown = updateCooldown;
    }

    withUpdateCooldown(cooldown) {
        this.updateCooldown = cooldown;
        return this;
    }

    process(x, y, chunk) {
        if (this.updateCooldown > 0) {
            this.updateCooldown--;
            return ParticleUpdate.NullUpdate;
        }

        return this.update(x, y, chunk);
    }

    update(x, y, chunk) {
        return [];
    }
}

export { Particle, getColour, getParticleList };