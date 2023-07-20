//Imports
import p5 from "p5";

import Screen from "./screen";
import Sand from "./sand";

const sketch = (p) => {
	//Defining variables
	let screen;

	const particleSize = 8;
	const framerate = 30;

	//Function runs once on page load

	p.setup = () => {
		//Set no stroke
		p.noStroke();
		p.background(70);
		//Define screen object
		screen = new Screen(p.windowWidth, p.windowHeight, particleSize, p);
		//Set frame rate
		p.frameRate(framerate);
		//generate random sand particles
		for (var i=0;i<30;i++) {
			let x = Math.floor(Math.random() * screen.gridWidth);
			let y = Math.floor(Math.random() * screen.gridHeight);
			screen.grid[x][y] = new Sand();
		}

		p.createCanvas(screen.width, screen.height);

	};

	//Game loop

	p.draw = () => {
		//Step simulation every cycle of game loop
		screen.stepSim();
		if (screen.framenum % 2 == 0) screen.grid[Math.floor(screen.gridWidth/2)][15] = new Sand();
	};
};

new p5(sketch, document.body);