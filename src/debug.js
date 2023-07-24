import p5 from "p5"

class Debug {
    constructor(enabled, screen, p) {
        this.enabled = enabled;
        this.screen = screen;
        this.p = p;

        this.overlayDiv = document.createElement("div");
        this.overlayDiv.style = "position:absolute;top:0;left:0;";
        document.body.appendChild(this.overlayDiv);

        this.mouseX = null;
        this.mouseY = null;

        this.framerateQueueLength = 30;
        this.framerateQueue = Array(this.framerateQueueLength);

        let sketch = (pdbg) => {
            this.pdbg = pdbg;
            pdbg.setup = () => {
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
            "framerate": () => {
                this.framerateQueue.push(this.p.getFrameRate());
                if (this.framerateQueue.length > this.framerateQueueLength)
                    this.framerateQueue = this.framerateQueue.slice(1, this.framerateQueueLength);
                
                return this.framerateQueue.reduce((a, v) => a + v, 0) / this.framerateQueueLength;
            },
            "mouseX": () => this.mouseX,
            "mouseY": () => this.mouseY,
            "particle": () => `${~~(this.mouseX / this.screen.particleSize)},${~~(this.mouseY / this.screen.particleSize)}`,
            "chunk": () => `${~~(this.mouseX / (this.screen.particleSize * this.screen.chunkSize))},${~~(this.mouseY / (this.screen.particleSize * this.screen.chunkSize))}`
        }

        this.customOverlays = [
            this.chunkOverlay,
        ]

        new p5(sketch, this.overlayDiv);

        if (!this.enabled)
            this.disable()
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
        dbg.pdbg.fill(0, 0, 255, 127);
        for (const chunk of dbg.screen.chunks.updatedChunks) {
            dbg.pdbg.square(chunk.particleX * dbg.screen.particleSize, chunk.particleY * dbg.screen.particleSize, dbg.screen.chunkSize * dbg.screen.particleSize);
        }
        dbg.pdbg.pop();
    }

    toggle() {
        if (this.enabled)
            this.disable();
        else
            this.enable();
    }

    enable() {
        this.enabled = true;
        this.pdbg.loop();
        this.overlayDiv.removeAttribute("hidden");
    }

    disable() {
        this.enabled = false;
        this.pdbg.noLoop();
        this.overlayDiv.setAttribute("hidden", true);
    }
}

export default Debug;