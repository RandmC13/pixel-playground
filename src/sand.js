import Air from "./air";
import Particle from "./particle";

class Sand extends Particle {
    constructor() {
        const colour = [194,178,128];
        const type = "sand";
        super(colour, type, false);
    }

    update(x,y,grid) {
        let changes = [];

        //Check if sand is on the ground
        if (y+1 >= grid[0].length) {
            this.static = true;
            return false;
        }

        //Check if sand can fall down
        if (grid[x][y+1].type == "air") {
            changes.push([x,y+1,grid[x][y]]);
            changes.push([x,y,new Air()]);

            return changes;
        }
    }
}

export default Sand;