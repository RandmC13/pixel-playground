//Imports
import p5 from "p5";

import Debug from "./debug";
import Screen from "./screen";
import Sand from "./particles/sand";
import { getColour } from "./particle";

const sketch = (p) => {
	//Defining variables
	let screen, debug;

	let mouseHeld = false;
	let mouseNotMovedYet = true;

	const particleSize = 4;
	const chunkSize = 4;
	let framerate = 60;

	//Function runs once on page load
	p.setup = () => {
		//Set no stroke and draw background
		p.noStroke();
		p.background(...getColour("air"));

		//Define screen object
		screen = new Screen(p.windowWidth, p.windowHeight, particleSize, chunkSize, p);
		//Set frame rate
		p.frameRate(framerate);

		const { canvas } = p.createCanvas(screen.pixelWidth, screen.pixelHeight);
		// Ensure canvas is selected
		canvas.focus();
		// Prevent right click from opening menu
		canvas.addEventListener("contextmenu", (e) => e.preventDefault())

		debug = new Debug(false, screen, p);
		screen.drawAll();
	};

	//Game loop
	p.draw = () => {
		//If mouse is held, place a particle
		if (mouseHeld && !mouseNotMovedYet) screen.cursorPlace();

		//Step simulation every cycle of game loop
		if (!screen.paused) {
			screen.stepSim();
			if (screen.framenum % 2 == 0)
				screen.set(screen.particleWidth / 2, 2, new Sand());
		} else {
			//If sim is paused, draw pause text
			screen.pauseText();
			screen.draw();
		}
		//Place cursor at mouse position
		if (!mouseNotMovedYet) screen.drawCursor(p.mouseX,p.mouseY);
	};

	//Event that runs if mouse is pressed
	p.mousePressed = () => {
		// On right click, place only one particle
		if (p.mouseButton === p.RIGHT)
			screen.cursorPlace()
		else
			mouseHeld = true;

		// prevent default behaviour
		return false;
	}

	//Event that runs if mouse is released
	p.mouseReleased = () => {
		mouseHeld = false;

		// prevent default behaviour
		return false;
	}

	//Even that runs if key is pressed
	p.keyPressed = () => {
		switch (p.keyCode) {
			case 32:
				//If space bar is pressed, toggle pause
				screen.paused = !screen.paused;
				break;
			case p.UP_ARROW:
				if (screen.brushRadius < 10) screen.brushRadius++;
				break;
			case p.DOWN_ARROW:
				if (screen.brushRadius > 0) screen.brushRadius--;
				break;
			case p.LEFT_ARROW:
				framerate -= Math.min(5, framerate / 2);
				p.frameRate(framerate);
				break;
			case p.RIGHT_ARROW:
				framerate += Math.min(5, framerate * 2);
				p.frameRate(framerate);
				break;
		}
		//If s key is pressed whilst paused, un pause the simulation, step it and then pause again
		if (p.keyCode == 83 && screen.paused) {
			screen.paused = false;
			screen.stepSim();
			screen.paused = true;
		}

		// prevent default behaviour
		return false;
	}

	p.mouseMoved = () => {
		mouseNotMovedYet = false;

		// prevent default behaviour
		return false;
	}
};

new p5(sketch, document.body);