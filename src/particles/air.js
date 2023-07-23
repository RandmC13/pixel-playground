import { Particle } from "../particle";

class Air extends Particle {
    constructor() {
        const type = "air";
        super(type, true);
    }
}

export default Air;