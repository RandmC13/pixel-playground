import Liquid from "../liquid";
//Just water but less dense, eventually will be made flammable though
class Oil extends Liquid {
    constructor() {
        const type = "oil";
        super(type, false);
    }
}

export default Oil;