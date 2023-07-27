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
        colour: [194,178,128],
        density: 5,
        liquid: false
    },
    "air": {
        colour: [90,90,90],
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
        this.colour = getColour(type);
        this.type = type;
        this.colour = particles[this.type]["colour"];
        this.density = particles[this.type]["density"];
        this.liquid = particles[this.type]["liquid"];
        this.static = stationary;
        this.updateCooldown = 0;
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