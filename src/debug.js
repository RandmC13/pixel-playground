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

        this.mouseX = null;
        this.mouseY = null;

        let sketch = (pdbg) => {
            this.pdbg = pdbg;
            pdbg.setup = () => {
                pdbg.frameRate(10);
                pdbg.noStroke();
                pdbg.createCanvas(screen.pixelWidth, screen.pixelHeight);
            };

            pdbg.draw = () => this.debug();

            pdbg.mouseClicked = (event) => {
                this.mouseX = event.x;
                this.mouseY = event.y;
                return false;
            }
        };

        this.metrics = {
            "framerate": () => this.p.getFrameRate(),
            "mouseX": () => this.mouseX,
            "mouseY": () => this.mouseY,
            "particle": () => `${~~(this.mouseX / this.screen.particleSize)},${~~(this.mouseY / this.screen.particleSize)}`,
            "chunk": () => `${~~(this.mouseX / (this.screen.particleSize * this.screen.chunkSize))},${~~(this.mouseY / (this.screen.particleSize * this.screen.chunkSize))}`
        }

        this.customOverlays = [
            this.chunkOverlay,
        ]

        new p5(sketch, overlayDiv);
    }

    debug() {
        this.pdbg.clear();
        this.pdbg.fill(255, 255, 255);
        this.pdbg.textSize(20);
        let ypos = 20;
        for (const metric of Object.entries(this.metrics)) {
            this.pdbg.text(`${metric[0]}: ${metric[1]()}`, 10, ypos);
            ypos += 20
        }

        for (const overlay of this.customOverlays)
            overlay(this);
    }

    chunkOverlay(dbg) {
        dbg.pdbg.push();
        dbg.pdbg.fill(0, 255, 0, 127);
        for (const chunk of dbg.screen.chunks.activeChunks) {
            dbg.pdbg.square(chunk.particleX * dbg.screen.particleSize, chunk.particleY * dbg.screen.particleSize, dbg.screen.chunkSize * dbg.screen.particleSize);
        }
        dbg.pdbg.pop();
    }
}

export default Debug;