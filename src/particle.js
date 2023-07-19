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
        this.updateToggle = true; //toggles every frame to prevent bugs
    }

    update() {
        //when particle updates flip updateToggle
        this.updateToggle = !this.updateToggle;
    }
}

export default Particle;