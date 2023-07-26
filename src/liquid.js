import { Particle } from "./particle";

class Liquid extends Particle {
    constructor(type) {
        super(type, false);
    }

    update(x,y,grid) {
        const goLeft = () => {
            let clone = grid[x][y];
            grid[x][y] = grid[x-1][y];
            grid[x-1][y] = clone;
        };

        const goRight = () => {
            let clone = grid[x][y];
            grid[x][y] = grid[x+1][y];
            grid[x+1][y] = clone;
        };

        //If liquid can go down, do it
        if (y+1 < grid[0].length) {
            //Attempt to sink, if it works, exit the function
            if (this.sink(x,y,grid)) return true;
        }
        //Check if liquid can go left or right
        let left = false;
        let right = false;

        if (x-1 >= 0) {
            if (grid[x-1][y].liquid) left = true;
        };
        if (x+1 < grid.length) {
            if (grid[x+1][y].liquid) right = true;
        };

        //If liquid can go either way, choose a random direction
        if (left && right) {
            if (Math.random() > 0.5) {
                goLeft();
                return true;
            }

            goRight();
            return true;
        }

        //If liquid can only go one way, choose that way
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

export default Liquid;