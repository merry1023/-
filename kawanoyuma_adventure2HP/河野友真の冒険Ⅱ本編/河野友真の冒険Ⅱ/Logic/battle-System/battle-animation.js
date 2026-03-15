let animationProgress = 0; // アニメーションの進行度（0〜1）
let flashCount = 0;
let isWhite = false;

async function drawNormalBattleAnimation() {
  // まずマップを描画
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateCamera();
  drawLayer(currentMap.layer1);
  drawLayer(currentMap.layer2);
  drawLayer(currentMap.layer3);
  drawPlayer();
  drawLayer(currentMap.layer4);
  
  // その上にワイプを重ねる
  const wipeWidth = canvas.width * animationProgress;
  const wipeHeight = canvas.height * animationProgress;
  
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, wipeWidth, wipeHeight);
  
  animationProgress += 0.05;
  
  if (animationProgress >= 1) {
    playBgm('/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/Sound/BGM/Tailshaft.mp3')
    animationProgress = 0;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(function() {
      isBattle = true;
      battleAnimation = false;
      draw();
    }, 1000);
  } else {
    requestAnimationFrame(drawNormalBattleAnimation);
  }
}

function drawBossBattleAnimation() {
  // まずマップを描画
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateCamera();
  drawLayer(currentMap.layer1);
  drawLayer(currentMap.layer2);
  drawLayer(currentMap.layer3);
  drawPlayer();
  drawLayer(currentMap.layer4);
  
  // 点滅（黒と白を交互に）
  if (isWhite) {
    ctx.fillStyle = "white";
  } else {
    ctx.fillStyle = "black";
  }
  ctx.globalAlpha = 0.8;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;
  
  isWhite = !isWhite;
  flashCount++;
  
  if (flashCount < 20) { // 約2秒点滅
    setTimeout(function() {
      requestAnimationFrame(drawBossBattleAnimation);
    }, 100); // 0.1秒ごとに点滅
  } else {
    // 1秒待機してフェードイン
    flashCount = 0;
    isWhite = false;
    ctx.fillStyle = "white";
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTimeout(function() {
      drawBossFadeIn(1.0);
    }, 1000);
  }
}
function drawBossFadeIn(alpha) {
  isBattle = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBattle();
  
  // 白いオーバーレイをフェードアウト
  ctx.fillStyle = "white";
  ctx.globalAlpha = alpha;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;
  
  alpha -= 0.02;
  
  if (alpha > 0) {
    requestAnimationFrame(function() {
      drawBossFadeIn(alpha);
    });
  } else {
    draw();
  }
}

function startBattleAnimation() {
  animationProgress = 0;
  if (isBossBattle) {
    drawBossBattleAnimation();
  } else {
    drawNormalBattleAnimation();
  }
}