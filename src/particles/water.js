import Liquid from "../liquid";

class Water extends Liquid {
    constructor() {
        const type = "water";
        super(type);
    }

    update(x,y,grid) {
        super.update(x,y,grid);
    }
}

export default Water;