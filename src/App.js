import React, { Component } from 'react';
import { SketchPicker } from 'react-color';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import convert from './utils/convert.js';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    curColor: {
      R: 0,
      G: 0,
      B: 0,
    },
    resultColor: {
      R: 0,
      G: 0,
      B: 0,
    },
    sens: 10,
  };

  initPixels = [];

  getBitmap = path => new Promise((resolve, reject) => {
    const image = new Image();
    image.src = path;

    image.onload = () => {
      this.refs.canvas.width = image.width;
      this.refs.canvas.height = image.height;
      this.refs.canvasResult.width = image.width;
      this.refs.canvasResult.height = image.height;

      window.createImageBitmap(image).then(img => {
        const ctx = this.refs.canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const image = ctx.getImageData(0, 0, img.width, img.height).data;
        const pixels = [];
        for (let i = 0; i < img.width * img.height * 4; i += 4) {
          pixels.push({
            R: image[i],
            G: image[i + 1],
            B: image[i + 2],
          });
        }
      resolve(pixels);
      });
    }
  });

  renderChangedImage = pixels => {
    const ctxResult = this.refs.canvasResult.getContext('2d');
    // const pixelArray = [];
    // pixels.forEach(pixel => pixelArray.push(pixel.R, pixel.G, pixel.B, 255));
    const typedArray = new Uint8ClampedArray(pixels);
    const imageData = ctxResult.createImageData(this.refs.canvas.width, this.refs.canvas.height);
    imageData.data.set(typedArray);
    ctxResult.putImageData(imageData, 0, 0);
  }

  changeColor = pixels => {
    const {L: L1, a: a1, b: b1 } = convert.rgb_to_lab(this.state.curColor);
    const {L: L2, a: a2, b: b2 } = convert.rgb_to_lab(this.state.resultColor);
    const D = {
      L: L2 - L1,
      a: a2 - a1,
      b: b2 - b1,
    };
    const resultArray = [];
    let counter = 0;

    pixels.forEach(pixel => {
      const { L, a, b } = convert.rgb_to_lab({
        R: pixel.R,
        G: pixel.G,
        B: pixel.B,
      });
      const d = Math.sqrt(Math.pow(L - L1, 2) + Math.pow(a - a1, 2) + Math.pow(b - b1, 2));
      if (d < this.state.sens) {
        counter++;
        const Lab = [L + D.L, a + D.a, b + D.b];
        const rgb = convert.lab2rgb(Lab);
        resultArray.push(rgb[0], rgb[1], rgb[2], 255);
      } else {
        resultArray.push(pixel.R, pixel.G, pixel.B, 255);
      }
    });
    console.log('if:', counter, '\nelse:', pixels.length - counter);
    return this.renderChangedImage(resultArray);
  }

  handleClickImage = e => {
    const colorPicker = document.getElementById('color-picker');
    const ctx = this.refs.canvas.getContext('2d');
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const pixel = ctx.getImageData(x, y, 1, 1);
    const data = pixel.data;
    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
    colorPicker.style.background =  rgba;
    colorPicker.textContent = rgba;
    this.setState({
      curColor: {
        R: data[0],
        G: data[1],
        B: data[2],
      },
    });
  };

  handlePickerChange = ({ rgb }) => {
  this.setState({
    resultColor: {
      R: rgb.r,
      G: rgb.g,
      B: rgb.b,
    },
  });
}

  handleChangeSens = value => {
    this.setState({
      sens: value,
    });
  }

  render() {
    console.log('render');
    this.getBitmap('/images/1.jpg').then(pixels => this.initPixels = pixels);
    return (
      <div className="App">
        <canvas ref="canvas" onClick={this.handleClickImage} id="canvasily"></canvas>
        <canvas ref="canvasResult" id="canvasily-result"></canvas>
        <div id="color-picker"></div>
        <button className="button" onClick={() => this.changeColor(this.initPixels)}>Change</button>
        <SketchPicker
          className="picker"
          color={{
            r: this.state.resultColor.R.toString(),
            g: this.state.resultColor.G.toString(),
            b: this.state.resultColor.B.toString(),
            a: '1',
          }}
          onChange={this.handlePickerChange}
        />
        <Slider
          className="slider"
          min={0}
          max={100}
          step={1}
          value={this.state.sens}
          onChange={this.handleChangeSens}
        />
        <div className="wrapper">
          <div className="original-picture">
          </div>
          <div className="changed-picture">
          </div>
        </div>
      </div>
    );
  }
}

export default App;
