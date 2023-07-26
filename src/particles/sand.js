import { Particle } from "../particle";
import Air from "./air";

class Sand extends Particle {
    constructor() {
        const type = "sand";
        super(type, false);
    }

    update(x,y,grid) {
        const goDown = () => {
            grid[x][y+1] = grid[x][y];
            grid[x][y] = new Air();
        };

        const goLeft = () => {
            grid[x-1][y+1] = grid[x][y];
            grid[x][y] = new Air();
        };

        const goRight = () => {
            grid[x+1][y+1] = grid[x][y];
            grid[x][y] = new Air();
        };

        //Check if sand is on the ground, if not attempt to sink sand
        if (y+1 > grid[0].length-1) {
            this.static = true;
            return false;
        } else {
            //Attempt to sink, if it works, exit the function
            if (this.sink(x,y,grid)) return true;
        }

        //If sand can't fall down check if it can fall left or right
        let left = false;
        let right = false;

        if (x-1 >= 0) {
            if (grid[x-1][y+1].type == "air") left = true;
        };
        if (x+1 < grid.length) {
            if (grid[x+1][y+1].type == "air") right = true;
        };

        //If sand can fall either way, choose a random direction
        if (left && right) {
            if (Math.random() < 0.5) {
                goLeft();
                return true;
            }

            goRight();
            return true;
        }

        //If sand can only go one way, choose that way
        if (left) {
            goLeft();
            return true;
        } else if (right) {
            goRight();
            return true;
        }

        return false;
    }
}

export default Sand;