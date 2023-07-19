//Imports
import p5 from "p5";

import Screen from "./screen"

const sketch = (p) => {
	//Defining variables
	let screen;

	const particleSize = 5;

	//Function runs once on page load

	p.setup = () => {
		//Define screen object
		screen = new Screen(p.windowWidth, p.windowHeight, particleSize, p);

		for (var i=0;i<30;i++) {
			let x = Math.floor(Math.random() * screen.gridWidth);
			let y = Math.floor(Math.random() * screen.gridHeight);
			screen.grid[x][y] = 1;
		};

		p.createCanvas(screen.width, screen.height);
	};

	//Game loop

	p.draw = () => {
		p.background(70);
		//Draw particles on screen
		//generate random particles
		for (var i=0;i<30;i++) {
			let x = Math.floor(Math.random() * screen.gridWidth);
			let y = Math.floor(Math.random() * screen.gridHeight);
			screen.grid[x][y] = 1;
		}
		//Set no stroke
		p.noStroke();
		screen.draw();
	};
};

new p5(sketch, document.body);