export default class WebGPULayer {
  canvas: HTMLCanvasElement

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 768
    this.canvas.height = 512
    this.canvas.style.background = 'pink';

    return this;
  }
}
