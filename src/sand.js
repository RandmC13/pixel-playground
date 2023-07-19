import Air from "./air";
import Particle from "./particle";

class Sand extends Particle {
    constructor() {
        const colour = [194,178,128];
        const type = "sand";
        super(colour, type, false);
    }

    update(x,y,grid) {
        //First run default particle operations
        super.update();

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

        //Check if sand is on the ground
        if (y+1 >= grid[0].length) {
            this.static = true;
            return false;
        }

        //Check if sand can fall down
        if (grid[x][y+1].type == "air") {
            goDown();
            return true;
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