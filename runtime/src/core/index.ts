import GFXSplashScreenManager from "./splash.ts";
import OPEN_GFX_SPLASH_LOGO from "../assets/OpenGFX Splash.svg"
import WebGPUPipeline from "./pipeline/webgpu";

class OpenGFXEngine {
  htmlContainer!: HTMLDivElement;

  constructor() {
    console.debug('Begin OpenGFX Initialization');

    return this;
  }

  startup(htmlContainer: HTMLDivElement) {
    console.debug('Begin OpenGFX Startup');

    this.htmlContainer = htmlContainer

    const splashScreenManager = new GFXSplashScreenManager()

    splashScreenManager.createSplash(OPEN_GFX_SPLASH_LOGO, "#1f232d", 3)

    splashScreenManager.afterSplashes(() => {
      const pipeline = new WebGPUPipeline(this.htmlContainer)

      pipeline.init()
    })

    splashScreenManager.displaySplash(htmlContainer)

    return this;
  }
}

const OpenGFX = new OpenGFXEngine();

export default OpenGFX
