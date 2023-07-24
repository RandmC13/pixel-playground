import { Particle } from "../particle";

class Water extends Particle {
    constructor() {
        const type = "water";
        super(type, false, liquid=true);
    }

    update(x,y,grid) {
        const goDown = () => {
            grid[x][y+1] = grid[x][y];
            grid[x][y] = new Air();
        };

        const goLeft = () => {
            grid[x-1][y] = grid[x][y];
            grid[x][y] = new Air();
        };

        const goRight = () => {
            grid[x+1][y] = grid[x][y];
            grid[x][y] = new Air();
        };

        //If water can go down, do it
        if (y+1 > grid[0].length-1) {
            if (grid[x][y+1].type == "air") {
                goDown();
                return true;
            } 
        }
        //Check if water can go left or right
        let left = false;
        let right = false;

        if (x-1 >= 0) {
            if (grid[x-1][y].type == "air") left = true;
        };
        if (x+1 < grid.length) {
            if (grid[x+1][y].type == "air") right = true;
        };

        //If water can go either way, choose a random direction
        if (left && right) {
            if (Math.random() < 0.5) {
                goLeft();
                return true;
            }

            goRight();
            return true;
        }

        //If water can only go one way, choose that way
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

export default Water;