import Liquid from "../liquid";

class Oil extends Liquid {
    constructor() {
        const type = "oil";
        super(type);
    }

    update(x,y,grid) {
        super.update(x,y,grid);
    }
}

export default Oil;