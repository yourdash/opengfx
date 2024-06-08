import './style.css'

function loadAssets() {

}

function displaySplashScreen() {
  document.querySelector<HTMLDivElement>('#rt-portal')!.innerHTML = `
    <h1>OpenGFX Engine</h1>
    `
}

document.querySelector<HTMLDivElement>('#rt-portal')!.innerHTML = `
    <h1>OpenGFX</h1>
`
