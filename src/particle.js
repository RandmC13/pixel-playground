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
        density: 5,
        liquid: false
    },
    "air": {
        colour: [70,70,70],
        density: 0,
        liquid: true
    },
    "water": {
        colour: [0,105,148],
        density: 1,
        liquid: true
    },
    "oil": {
        colour: [55,58,54],
        density: 0.8,
        liquid: true
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
        this.type = type;
        this.colour = particles[this.type]["colour"];
        this.density = particles[this.type]["density"];
        this.liquid = particles[this.type]["liquid"];
        this.static = stationary;
    }

    update() {
        return false;
    }

    sink(x,y,grid) {
        //Check if object can sink
        if (grid[x][y+1].liquid) {
            if (this.density > grid[x][y+1].density) {
                let clone = grid[x][y];
                grid[x][y] = grid[x][y+1];
                grid[x][y+1] = clone;
                return true;
            }
        }
        return false;
    }
}

export { Particle, getColour, getParticleList };