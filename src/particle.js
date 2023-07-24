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
        colour: [194,178,128],
        density: 5
    },
    "air": {
        colour: [70,70,70],
        density: 0
    },
    "water": {
        colour: [0,105,148],
        density: 1
    }
};

const getColour = (type) => {
    return particles[type]["colour"];
}

const getParticleList = () => {
    return Object.keys(particles);
}

class Particle {
    constructor(type, stationary, liquid=false) {
        this.type = type;
        this.colour = particles[this.type]["colour"];
        this.density = particles[this.type]["density"];
        this.static = stationary;
        this.liquid = liquid;
    }

    update() {
        return false;
    }
}

export { Particle, getColour, getParticleList };