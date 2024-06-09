import styles from "./splash.module.scss"

export default class GFXSplashScreenManager {
  splashScreens: {
    // color or url()    -> (css background)
    background: string, // image path
    foregroundImage: string, // seconds to wait until next splash
    time: number,
  }[];
  private afterSplashesCallback: (() => void) | undefined;

  constructor() {
    this.splashScreens = []

    return this;
  }

  createSplash(foregroundImage: string, background: string, time: number) {
    this.splashScreens.push({
                              foregroundImage, background, time
                            })
  }

  displaySplash(splashContainer: HTMLDivElement, splashIndex: number = 0) {
    console.debug('Begin OpenGFX DisplaySplash');

    splashContainer.innerHTML = `
      <div style="background:${this.splashScreens[splashIndex].background};--duration:${this.splashScreens[splashIndex].time}s;" class="${styles.background}">
        <img draggable="false" src="${this.splashScreens[splashIndex].foregroundImage}" class="${styles.image}" alt=""/>
      </div>
    `

    // TODO: splash time cut short for some reason???
    setTimeout(() => {
      if (splashIndex + 1 < this.splashScreens.length) {
        this.displaySplash(splashContainer, splashIndex + 1)
      } else {
        this.afterSplashesCallback?.()
      }
    }, this.splashScreens[splashIndex].time * 1000)

    return this;
  }

  afterSplashes(callback: () => void) {
    this.afterSplashesCallback = callback

    return this;
  }
}
