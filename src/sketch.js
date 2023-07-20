//Imports
import p5 from "p5";

import Screen from "./screen";
import Sand from "./particles/sand";
import { getColour } from "./particle";

const sketch = (p) => {
	//Defining variables
	let screen;

	let mouseHeld = false;

	const particleSize = 8;
	const framerate = 30;

	//Function runs once on page load
	p.setup = () => {
		//Set no stroke and draw background
		p.noStroke();
		p.background(...getColour("air"));

		//Define screen object
		screen = new Screen(p.windowWidth, p.windowHeight, particleSize, p);
		
		//Set frame rate and create the canvas
		p.frameRate(framerate);
		p.createCanvas(screen.width, screen.height);
	};

	//Game loop
	p.draw = () => {
		//Make stream of sand (place sand every 2 frames)
		if (screen.framenum % 2 == 0) screen.grid[Math.floor(screen.gridWidth/2)][15] = new Sand();

		//If mouse is held, place a particle
		if (mouseHeld) screen.placeParticle();

		//Step simulation every cycle of game loop
		screen.stepSim();

		//Place cursor at mouse position
		screen.drawCursor(p.mouseX,p.mouseY);
	};

	//Event that runs if mouse is pressed
	p.mousePressed = () => {
		mouseHeld = true;
	}
	//Event that runs if mouse is released
	p.mouseReleased = () => {
		mouseHeld = false;
	}
};

new p5(sketch, document.body);