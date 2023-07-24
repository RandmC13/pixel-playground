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
    constructor(type, stationary) {
        this.colour = getColour(type);
        this.type = type;
        this.static = stationary;
    }

    update() {
        return false;
    }
}

export { Particle, getColour, getParticleList };