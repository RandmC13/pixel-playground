import p5 from "p5";
/*Potential particle properties:
-colour
-type
-static
-mass
-liquid
-flammable????
-burning??????
-density?????? buoyancy can be added
-radioactivity???????
*/
class Particle {
    constructor(colour, type, stationary) {
        this.colour = colour;
        this.type = type;
        this.static = stationary;
    }

    update() {
        return false;
    }
}

export default Particle;