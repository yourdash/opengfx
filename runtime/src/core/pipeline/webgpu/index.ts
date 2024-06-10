import WebGPULayer from "./layer.ts";

export default class WebGPUPipeline {
  htmlContainer: HTMLDivElement;
  layers: WebGPULayer[];

  constructor(htmlContainer: HTMLDivElement) {
    this.htmlContainer = htmlContainer;
    this.layers = []

    return this;
  }

  init() {
    this.htmlContainer.innerHTML = `
      <div id="render-container">
    `

    let initialLayer = new WebGPULayer()
    this.layers.push(initialLayer);
    document.getElementById("render-container")!.appendChild(initialLayer.canvas);

    return this;
  }
}
