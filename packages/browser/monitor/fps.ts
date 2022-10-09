let lastTime = performance.now();
let frame = 0;
let lastFameTime = performance.now();
//
let fps: number;
const loop = function () {
  const now = performance.now();
  const fs = now - lastFameTime;
  lastFameTime = now;
  fps = Math.round(1000 / fs);
  frame++;
  if (now > 1000 + lastTime) {
    fps = Math.round((frame * 1000) / (now - lastTime));
    frame = 0;
    lastTime = now;
  }
  window.requestAnimationFrame(loop);
};

let fpsListTemp: number[] = [];

function isBlocking(fpsList: number[], below = 20, last = 3) {
  let count = 0;
  for (let i = 0; i < fpsList.length; i++) {
    if (fpsList[i] && fpsList[i] < below) {
      count++;
    } else {
      count = 0;
    }
    if (count >= last) {
      return true;
    }
  }
  fpsListTemp = [];
  return false;
}

// 每秒中计算一次网页的 FPS 值,连续出现3个低于20的 FPS 即可认为网页存在卡顿。
setInterval(() => {
  //
  fpsListTemp.push(fps);

  if (fpsListTemp.length > 3) {
    const judgeIsBlocking = isBlocking(fpsListTemp, 20, 3);
    //TODO: 上报日志
  }
}, 1000);
