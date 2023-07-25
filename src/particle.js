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
const getColour = (type) => {
    //List of available colour types
    let colours = {
        sand: [194,178,128],
        air: [70,70,70]
    };

    return colours[type];
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

export { Particle, getColour };