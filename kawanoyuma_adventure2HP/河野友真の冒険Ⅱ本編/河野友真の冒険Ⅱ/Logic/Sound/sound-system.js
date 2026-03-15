function wait(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

let currentBgm = null;

function playBgm(src) {
  stopBgm(); // 前のBGMを止める
  currentBgm = new Audio(src);
  currentBgm.loop = true;
  currentBgm.play();
}

function stopBgm() {
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
    currentBgm = null;
  }
}

function playSe(src) {
  const se = new Audio(src);
  se.play();
}