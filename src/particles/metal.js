import { Particle } from "../particle";

class Metal extends Particle {
    constructor() {
        const type = "metal";
        super(type, true);
    }
}

export default Metal;