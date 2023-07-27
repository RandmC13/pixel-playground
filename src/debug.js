import p5 from "p5"
import ChunkManager from "./chunk";

class Debug {
    constructor(enabled, screen, p, config) {
        this.enabled = enabled;
        this.screen = screen;
        this.p = p;

        this.overlayDiv = document.createElement("div");
        this.overlayDiv.style = "position:absolute;top:0;left:0;";
        document.body.appendChild(this.overlayDiv);

        this.mouseX = null;
        this.mouseY = null;

        this.debugFrameCount = 0;

        this.framerateQueueLength = 30;
        this.framerateQueue = Array(this.framerateQueueLength);

        this.debugCommand = false;
        this.debugPause = false;

        this.config = config;

        const sketch = (pdbg) => {
            this.pdbg = pdbg;
            pdbg.setup = () => {
                pdbg.noStroke();
                const {canvas} = pdbg.createCanvas(screen.pixelWidth, screen.pixelHeight);
                canvas.addEventListener("contextmenu", e => e.preventDefault());
            };

            pdbg.draw = () => {
                this.debug();
                this.mouseX = pdbg.mouseX;
                this.mouseY = pdbg.mouseY;              
                this.debugFrameCount++;
            }

            pdbg.keyPressed = () => {
                if (pdbg.keyCode === pdbg.CONTROL)
                    return this.toggle();
                
                if (!this.enabled) return;

                if (pdbg.keyCode === pdbg.SHIFT) {
                    this.debugCommand = true;
                    return;
                }

                if (!this.debugCommand) return;

                switch (pdbg.keyCode) {
                    case 67: // C
                        this.toggleOverlay("ChunkBorders");
                        break;
                    case 80: // P
                        this.debugPause = !this.debugPause;
                        if (this.debugPause)
                            this.p.noLoop();
                        else
                            this.p.loop();
                        break;
                    case 82: // R
                        this.screen.chunks = new ChunkManager(this.screen.chunkWidth, this.screen.chunkHeight, this.config.chunkSize);
                        this.screen.framenum = 0;
                        this.screen.drawAll();
                        // Hide cursor
                        for (const chunk of this.screen.getBrushChunks(this.mouseX / this.config.particleSize, this.mouseY / this.config.particleSize))
                            chunk.draw(this.p, this.config.particleSize);
                        break;
                    case 83: // S
                        if (!this.debugPause) break;
                        this.p.redraw();

                        // Hide cursor
                        for (const chunk of this.screen.getBrushChunks(this.mouseX / this.config.particleSize, this.mouseY / this.config.particleSize))
                            chunk.draw(this.p, this.config.particleSize);
                        break;
                    case 90: // Z
                        this.toggleOverlay("ChunkUpdates");
                        break;
                    case pdbg.LEFT_ARROW:
                        this.config.framerate -= Math.min(5, this.config.framerate / 2);
                        this.p.frameRate(this.config.framerate);
                        break;
                    case pdbg.RIGHT_ARROW:
                        this.config.framerate += Math.min(5, this.config.framerate * 2);
                        this.p.frameRate(this.config.framerate);
                        break;
                }

                return false;
            }

            pdbg.keyReleased = () => {
                if (pdbg.keyCode === pdbg.SHIFT)
                    this.debugCommand = false;
            }
        };

        this.metrics = {
            framenum: {
                enabled: true,
                fn: (dbg) => dbg.screen.framenum,
            },
            framerate: {
                enabled: true,
                fn: (dbg) => {
                    let retval;
                    if (dbg.debugFrameCount % dbg.framerateQueueLength === 0) {
                        retval = (dbg.framerateQueue.reduce((a, v) => a + v, 0) / dbg.framerateQueueLength).toPrecision(4);
                    } else {
                        retval = dbg.metricValues.framerate
                    }
                    dbg.framerateQueue[dbg.debugFrameCount % dbg.framerateQueueLength] = dbg.p.getFrameRate();
                    return retval;
                }
            },
            mouseX: {
                enabled: true,
                fn: (dbg) => dbg.mouseX,
            },
            mouseY: {
                enabled: true,
                fn: (dbg) => dbg.mouseY,
            },
            particle: {
                enabled: true,
                fn: (dbg) => `${~~(dbg.mouseX / dbg.config.particleSize)},${~~(dbg.mouseY / dbg.config.particleSize)}`,
            },
            particleInChunk: {
                enabled: true,
                fn: (dbg) => `${~~(dbg.mouseX / dbg.config.particleSize) % dbg.config.chunkSize},${~~(dbg.mouseY / dbg.config.particleSize) % dbg.config.chunkSize}`
            },
            chunk: {
                enabled: true,
                fn: (dbg) => `${~~(dbg.mouseX / (dbg.config.particleSize * dbg.config.chunkSize))},${~~(dbg.mouseY / (dbg.config.particleSize * dbg.config.chunkSize))}`
            },
        }

        // Dict containing previous values for all metrics
        this.metricValues = {};
        

        this.customOverlays = {
            "ChunkUpdates": {
                enabled: false,
                fn: (dbg) => {
                    dbg.pdbg.push();
                    dbg.pdbg.fill(0, 255, 0, 127);
                    for (const chunk of dbg.screen.chunks.activeChunks) {
                        dbg.pdbg.square(chunk.particleX * dbg.config.particleSize, chunk.particleY * dbg.config.particleSize, dbg.config.chunkSize * dbg.config.particleSize);
                    }
                    dbg.pdbg.fill(0, 0, 255, 127);
                    for (const chunk of dbg.screen.chunks.updatedChunks) {
                        dbg.pdbg.square(chunk.particleX * dbg.config.particleSize, chunk.particleY * dbg.config.particleSize, dbg.config.chunkSize * dbg.config.particleSize);
                    }
                    dbg.pdbg.pop();
                },
            },
            "ChunkBorders": {
                enabled: false,
                fn: (dbg) => {
                    const [chunkX, chunkY] = this.metricValues.chunk.split(",");
                    dbg.pdbg.push();
                    dbg.pdbg.stroke(40);
                    dbg.pdbg.strokeWeight(dbg.config.particleSize / 2);
                    const chunkPixelSize = dbg.config.chunkSize * dbg.config.particleSize;
                    for (let x = 0; x < dbg.screen.chunks.cols; x++) {
                        for (let y = 0; y < dbg.screen.chunks.cols; y++) {
                            dbg.pdbg.noFill();
                            if (x.toString() === chunkX || y.toString() === chunkY)
                                dbg.pdbg.fill(170, 170, 170, 127);
                            dbg.pdbg.square(x * chunkPixelSize, y * chunkPixelSize, chunkPixelSize);
                        }
                    }
                    dbg.pdbg.pop();
                }
            },
        };

        new p5(sketch, this.overlayDiv);

        if (!this.enabled)
            this.disable()
    }

    debug() {
        this.pdbg.clear();
        this.renderOverlays();
        this.renderMetrics();
    }

    renderMetrics() {
        this.pdbg.fill(255, 255, 255);
        this.pdbg.textSize(20);
        let ypos = 20;
        for (const metric of Object.entries(this.metrics)) {
            const [metricName, metricObject] = metric;
            const {enabled, fn} = metricObject;
            if (enabled) {
                const metricValue = fn(this);

                this.metricValues[metricName] = metricValue;
                this.pdbg.text(`${metricName}: ${metricValue}`, 10, ypos);
                ypos += 20
            }
        }
    }

    renderOverlays() {
        for (const overlay of Object.values(this.customOverlays)) {
            const {fn, enabled} = overlay;
            if (enabled)
                fn(this);
        }
    }

    addOverlay(name, fn) {
        this.customOverlays[name] = {fn, enabled: false};
    }

    toggleOverlay(name) {
        this.customOverlays[name].enabled = !(this.customOverlays[name].enabled);
    }

    addMetric(name, fn) {
        this.metrics[name] = {
            fn,
            enabled: true,
        }
    }

    toggleMetric(name) {
        this.metrics[name].enabled = !(this.metrics[name].enabled);
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