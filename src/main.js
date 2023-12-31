import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// import { Application } from "pixi.js";
// import config from './config'

createApp(App).mount('#app')

// // pixi
// const app = new Application({
//     width: config.display.width,
//     height: config.display.height,
// });
// document.querySelector('#app')?.append(app.view)


// const graphics = new Graphics();
// const image = [
//   [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
//   [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
//   [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
//   [0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0],
//   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
//   [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
//   [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
//   [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
// ];

// for (let y = 0; y< image.length; y++) {
//   for (let x = 0; x < image[y].length; x++) {
//     if (image[y][x] === 0) continue;
//     graphics.beginFill(0xffffff);
//     graphics.drawRect(x, y, 1, 1);
//     graphics.endFill()
//   }
// }

// app.stage.addChild(graphics);