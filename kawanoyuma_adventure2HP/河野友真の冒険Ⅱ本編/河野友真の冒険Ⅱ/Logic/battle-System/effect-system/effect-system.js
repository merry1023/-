const EFFECT_ASSETS = {
  // ===== 既存 =====
  slash:        { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect001.png",  frames: 5,  fps: 12, direction: "horizontal" },
  fire:         { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect037.png",  frames: 8,  fps: 12, direction: "horizontal" },
  static:       { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect027.png",  frames: 8,  fps: 12, direction: "horizontal" },
  heal:         { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect017.png",  frames: 8,  fps: 12, direction: "horizontal" },
  burn:         { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect024.png",  frames: 8,  fps: 12, direction: "horizontal" },
  micro:        { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect008.png",  frames: 8,  fps: 12, direction: "horizontal" },
  electro:      { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect040.png",  frames: 8,  fps: 12, direction: "horizontal" },
  explosion:    { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect036.png",  frames: 7,  fps: 12, direction: "horizontal" },
  hell_fire:    { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect023.png",  frames: 9,  fps: 8,  direction: "vertical",   frameW: 320, frameH: 120 },
  hell_flower:  { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect030.png",  frames: 8,  fps: 8,  direction: "vertical",   frameW: 320, frameH: 120 },
  buff_up:      { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect019.png",  frames: 10, fps: 12, direction: "horizontal" },
  heart:        { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect016.png",  frames: 8,  fps: 12, direction: "horizontal" },

  // ===== 炎系 =====
  fire_ball:    { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect003.png",  frames: 5,  fps: 12, direction: "horizontal" },
  fire_burst:   { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect004.png",  frames: 7,  fps: 12, direction: "horizontal" },
  fire_ring:    { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect022.png",  frames: 8,  fps: 12, direction: "horizontal" },
  dark_rose:    { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect018.png",  frames: 8,  fps: 10, direction: "horizontal" },
  fire_jet:     { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect103a.png", frames: 10, fps: 14, direction: "horizontal" },

  // ===== 電気系 =====
  lightning:    { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect033.png",  frames: 5,  fps: 8,  direction: "vertical",   frameW: 320, frameH: 120 },
  summon_ring:  { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect021.png",  frames: 7,  fps: 8,  direction: "vertical",   frameW: 320, frameH: 120 },

  // ===== 氷系 =====
  ice_needle:   { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect005.png",  frames: 9,  fps: 12, direction: "horizontal" },
  ice_wall:     { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect031.png",  frames: 9,  fps: 8,  direction: "vertical",   frameW: 320, frameH: 120 },
  ice_bomb:     { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect038.png",  frames: 8,  fps: 12, direction: "horizontal" },
  ice_crystal:  { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect035.png",  frames: 8,  fps: 8,  direction: "vertical",   frameW: 320, frameH: 120 },

  // ===== 闇・魔系 =====
  purple_beam:  { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect006.png",  frames: 7,  fps: 12, direction: "horizontal" },
  dark_orb:     { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect014.png",  frames: 8,  fps: 12, direction: "horizontal" },

  // ===== 風・水系 =====
  tornado:      { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect009.png",  frames: 8,  fps: 12, direction: "horizontal" },
  cherry:       { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect012.png",  frames: 9,  fps: 8,  direction: "vertical",   frameW: 320, frameH: 120 },

  // ===== バフ・デバフ系 =====
  light:        { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect007.png",  frames: 14, fps: 14, direction: "horizontal" },
  dust:         { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect010.png",  frames: 8,  fps: 12, direction: "horizontal" },
  rock:         { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect028.png",  frames: 8,  fps: 12, direction: "horizontal" },

  // ===== 物理系（2行スプライト） =====
  claw:         { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect121.png",  frames: 10, fps: 14, direction: "grid", cols: 5, frameW: 120, frameH: 120 },
  fang:         { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect122.png",  frames: 10, fps: 12, direction: "grid", cols: 5, frameW: 120, frameH: 120 },
  slash2:       { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect123.png",  frames: 10, fps: 14, direction: "grid", cols: 5, frameW: 160, frameH: 120 },
  slash3:       { src: "/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/battle-System/effect-system/effects/pipo-btleffect124.png",  frames: 10, fps: 12, direction: "grid", cols: 5, frameW: 320, frameH: 240 },
};

let activeEffects = [];

function playEffect(key, mode, targetIndex) {
  const asset = EFFECT_ASSETS[key];
  if (!asset) return;

  const img = new Image();
  img.onload = function() {
    const frameW = asset.frameW || (asset.direction === "vertical" ? img.naturalWidth : img.naturalWidth / asset.frames);
    const frameH = asset.frameH || (asset.direction === "vertical" ? img.naturalHeight / asset.frames : img.naturalHeight);

    const halfHeight = canvas.height / 2;
    let positions = [];

    if (mode === "single") {
      const colWidth = canvas.width / currentEnemies.length;
      const x = targetIndex * colWidth + colWidth / 2 - frameW / 2;
      const y = halfHeight / 2 - frameH / 2;
      positions.push({ x, y });
    } else if (mode === "all_each") {
      currentEnemies.forEach(function(_, i) {
        const colWidth = canvas.width / currentEnemies.length;
        const x = i * colWidth + colWidth / 2 - frameW / 2;
        const y = halfHeight / 2 - frameH / 2;
        positions.push({ x, y });
      });
    } else if (mode === "all_cover") {
      positions.push({ x: 0, y: 0, w: canvas.width, h: halfHeight });
    }

    activeEffects.push({
      asset, img, positions,
      currentFrame: 0,
      frameInterval: 1000 / asset.fps,
      lastTime: performance.now(),
    });

    requestAnimationFrame(effectLoop);
  };
  img.src = asset.src;
}

function effectLoop() {
  draw();
  if (activeEffects.length > 0) {
    requestAnimationFrame(effectLoop);
  }
}

function updateEffects(now) {
  activeEffects = activeEffects.filter(function(effect) {
    if (now - effect.lastTime >= effect.frameInterval) {
      effect.currentFrame++;
      effect.lastTime = now;
    }
    return effect.currentFrame < effect.asset.frames;
  });
}

function drawEffects() {
  const now = performance.now();
  updateEffects(now);

  activeEffects.forEach(function(effect) {
    const asset = effect.asset;
    const img = effect.img;
    const f = effect.currentFrame;

    // フレーム座標を計算
    let srcX, srcY, frameW, frameH;

    if (asset.direction === "grid") {
      // 2行以上のグリッドスプライト
      frameW = asset.frameW;
      frameH = asset.frameH;
      const col = f % asset.cols;
      const row = Math.floor(f / asset.cols);
      srcX = col * frameW;
      srcY = row * frameH;
    } else if (asset.direction === "vertical") {
      frameW = asset.frameW || img.naturalWidth;
      frameH = asset.frameH || (img.naturalHeight / asset.frames);
      srcX = 0;
      srcY = frameH * f;
    } else {
      // horizontal
      frameW = asset.frameW || (img.naturalWidth / asset.frames);
      frameH = asset.frameH || img.naturalHeight;
      srcX = frameW * f;
      srcY = 0;
    }

    effect.positions.forEach(function(pos) {
      const drawW = pos.w || frameW;
      const drawH = pos.h || frameH;
      ctx.drawImage(img, srcX, srcY, frameW, frameH, pos.x, pos.y, drawW, drawH);
    });
  });
}
