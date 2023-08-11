import Liquid from "../liquid";

class Water extends Liquid {
    constructor() {
        const type = "water";
        super(type, false);
    }
}

export default Water;