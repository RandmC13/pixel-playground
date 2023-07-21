import p5 from "p5"

class Debug {
    constructor(enabled, screen, p) {
        this.enabled = enabled;
        this.screen = screen;
        this.p = p;

        if (!this.enabled) return;

        const overlayDiv = document.createElement("div");
        overlayDiv.style = "position:absolute;top:0;left:0;";
        document.body.appendChild(overlayDiv);

        let sketch = (pdbg) => {
            this.pdbg = pdbg;
            pdbg.setup = () => {
                pdbg.noStroke();
                pdbg.createCanvas(400, 400);
            };

            pdbg.draw = () => this.debug();
        };

        new p5(sketch, overlayDiv);
    }

    debug() {
        this.pdbg.clear();
        this.pdbg.fill(255, 255, 255);
        this.pdbg.textSize(20);
        this.pdbg.text(`framerate: ${this.p.getFrameRate()}`, 10, 20);
    }
}

export default Debug;