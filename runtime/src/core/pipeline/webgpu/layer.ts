export default class WebGPULayer {
  canvas: HTMLCanvasElement

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 768
    this.canvas.height = 512
    this.canvas.style.background = 'pink';

    this.fetchGPU().then(gpu => {
      console.log(gpu);

      const context = this.canvas.getContext('webgpu');
      if (context === null) {
        console.error('WebGPU not supported on this browser!');
        return null;
      }

      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
                          device, format: presentationFormat,
                        });
    })

    return this;
  }

  async fetchGPU() {
    // @ts-ignore
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice();
    if (!device) {
      throw 'need a browser that supports WebGPU';
    }

    return device
  }
}
