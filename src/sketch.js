//Imports
import p5 from "p5";

import Debug from "./debug";
import Screen from "./screen";
import Sand from "./sand";

const sketch = (p) => {
	//Defining variables
	let screen, debug;

	const particleSize = 8;
	const chunkSize = 8;
	const framerate = 30;

	//Function runs once on page load

	p.setup = () => {
		//Set no stroke
		p.noStroke();
		p.background(70);
		//Define screen object
		screen = new Screen(p.windowWidth, p.windowHeight, particleSize, chunkSize, p);
		//Set frame rate
		p.frameRate(framerate);
		//generate random sand particles
		for (var i=0;i<30;i++) {
			let x = Math.floor(Math.random() * screen.particleWidth);
			let y = Math.floor(Math.random() * screen.particleHeight);
			screen.set(x, y, new Sand());
		}

		p.createCanvas(screen.pixelWidth, screen.pixelHeight);

		debug = new Debug(false, screen, p);
		screen.drawAll();
	};

	//Game loop
	p.draw = () => {
		//Step simulation every cycle of game loop
		screen.stepSim();
		if (screen.framenum % 2 == 0)
			screen.set(screen.particleWidth / 2, 15, new Sand());
	};
};

new p5(sketch, document.body);