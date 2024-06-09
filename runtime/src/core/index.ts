import GFXSplashScreenManager from "./splash.ts";
import OPEN_GFX_SPLASH_LOGO from "../assets/OpenGFX Splash.svg"

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
      this.htmlContainer.innerHTML = `<div>Hello World from OpenGFX Runtime<button onclick="window.location.reload()">Reload Page</button></div>`
    })

    splashScreenManager.displaySplash(htmlContainer)

    return this;
  }
}

const OpenGFX = new OpenGFXEngine();

export default OpenGFX
