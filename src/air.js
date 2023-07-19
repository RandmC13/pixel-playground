import Particle from "./particle";

class Air extends Particle {
    constructor() {
        const colour = [70,70,70];
        const type = "air";
        super(colour, type, true);
    }
}

export default Air;