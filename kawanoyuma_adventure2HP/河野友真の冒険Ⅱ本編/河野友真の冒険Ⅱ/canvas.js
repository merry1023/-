const font = new FontFace('JF-Dot-K12', 'url(/河野友真の冒険Ⅱ本編/assets/fonts/JF-Dot-K12.ttf)');
font.load().then(function(loadedFont) {
  document.fonts.add(loadedFont);
  draw();
});
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const aBtn = document.getElementById("btn-decide");
const bBtn = document.getElementById("btn-cancel");
const mBtn = document.getElementById("btn-menu");



canvas.width = window.innerWidth;
const controlsHeight = document.querySelector(".controls").offsetHeight;
const infoHeight = document.querySelector("#player-info").offsetHeight;
canvas.height = window.innerHeight - controlsHeight - infoHeight;

const TILE_SIZE = 32;

const up_arrow = document.getElementById("btn-up");
const down_arrow = document.getElementById("btn-down");
const left_arrow = document.getElementById("btn-left");
const right_arrow = document.getElementById("btn-right");



let currentMap = world1

function updatePlayerInfo() {
  document.getElementById("player-info").innerHTML = `座標: x,${player.x}, y ,${player.y}`;
}

const player = {
  x: 15,
  y: 10,
  d: "up",
  pocky: 0,
};

const camera = {
  x: 0,
  y: 0,
};

function updateCamera() {
  camera.x = player.x * TILE_SIZE - canvas.width / 2;
  camera.y = player.y * TILE_SIZE - canvas.height / 2;
}

const tileImages = {};

for (const key in TILES) {
  tileImages[key] = new Image();
  tileImages[key].src = TILES[key].image;
}

function drawLayer(layer) {
  for (let y = 0; y < layer.length; y++) {
    for (let x = 0; x < layer[y].length; x++) {
      const tileNum = layer[y][x];
      if (tileNum === 0) continue;
      if (!TILES[tileNum]) continue;
      
      if (TILES[tileNum].image && tileImages[tileNum] && tileImages[tileNum].complete && tileImages[tileNum].naturalWidth > 0) {
        ctx.drawImage(
          tileImages[tileNum],
          x * TILE_SIZE - camera.x,
          y * TILE_SIZE - camera.y,
          TILE_SIZE,
          TILE_SIZE
        );
      } else {
        ctx.fillStyle = TILES[tileNum].color
        ctx.fillRect(
          x * TILE_SIZE - camera.x,
          y * TILE_SIZE - camera.y,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }
}


function drawPlayer() {
  ctx.fillStyle = "red";
  ctx.fillRect(
    Math.floor(canvas.width / 2),
    Math.floor(canvas.height / 2),
    TILE_SIZE,
    TILE_SIZE
  );
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  
  if (isBattle) {
    drawBattle();
  } else {
    updateCamera();
    drawLayer(currentMap.layer1);
    drawLayer(currentMap.layer2);
    drawLayer(currentMap.layer3);
    drawPlayer();
    drawLayer(currentMap.layer4);
    updatePlayerInfo();
    if (istalked) {
      drawMessageBox();
      if (currentNPC) {
        const currentMessage = currentNPC.messages[currentMessageIndex];
        const hasChoices = currentMessage.choices !== undefined;
        drawMessageText(currentName, allmessage.slice(0, message_i), hasChoices);
        if (hasChoices) {
          drawChoices(currentMessage.choices);
        }
      } else {
        drawMessageText(currentName, allmessage.slice(0, message_i), false);
      }
    }
  }
  if (isGameOver) {
    drawGameOver();
    return;
  }
  if (isMenuOpen) drawMenu();
}

function canMove(x, y) {
  const tile = currentMap.layer2[y][x];
  return !TILES[tile].collision;
}

function canMoveNPC(x, y) {
  const npc = currentMap.npcs.find(function(n) {
    return n.x === x && n.y === y;
  });
  return !npc;
}

draw();

function movePlayer(dx, dy) {
  if (isBattle || battleAnimation) return;
  if (dx === -1) player.d = "left";
  if (dx === 1) player.d = "right";
  if (dy === -1) player.d = "up";
  if (dy === 1) player.d = "down";
  if (canMove(player.x + dx, player.y + dy) && canMoveNPC(player.x + dx, player.y + dy)) {
    player.x += dx;
    player.y += dy;
    const tile = currentMap.layer2[player.y][player.x]
    const findPortal = currentMap.portals.find(function(p) {
      return p.x === player.x && p.y === player.y;
    });
    
    if (findPortal) {
      currentMap = MAPS[findPortal.destMap];
      player.x = findPortal.destX;
      player.y = findPortal.destY;
    } else {
      checkEncounter(currentMap, player.x, player.y); // ← 追加
    }
    draw();
    
  }
}

function gameOverRevive() {
  // HP・MP全回復、TP・SP・UP0
  allParty.forEach(function(member) {
    member.hp = member.maxHp;
    member.mp = member.maxMp;
    member.tp = 0;
  });
  partyPoints.sp = 0;
  partyPoints.up = 0;
  
  // pocky1/4没収
  player.pocky = Math.floor(player.pocky * 3 / 4);
  
  // village1にリスポーン
  currentMap = MAPS["village1"];
  player.x = 5;
  player.y = 5;
  player.d = "down";
  
  isGameOver = false;
  gameOverCursor = 0;
  draw();
}

function drawGameOver() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 「不合格」
  ctx.fillStyle = "white";
  ctx.font = "48px 'JF-Dot-K12'";
  ctx.textAlign = "center";
  ctx.fillText("☆不合格☆", canvas.width / 2, canvas.height * 0.35);
  
  // ボタン1
  ctx.font = "20px 'JF-Dot-K12'";
  ctx.fillStyle = gameOverCursor === 0 ? "#555" : "#333";
  ctx.fillRect(canvas.width / 2 - 150, canvas.height * 0.55, 300, 50);
  ctx.fillStyle = "white";
  ctx.fillText("何度でも甦るさ", canvas.width / 2, canvas.height * 0.55 + 32);
  
  // ボタン2
  ctx.fillStyle = gameOverCursor === 1 ? "#555" : "#333";
  ctx.fillRect(canvas.width / 2 - 150, canvas.height * 0.70, 300, 50);
  ctx.fillStyle = "white";
  ctx.fillText("タイトル画面に戻る。", canvas.width / 2, canvas.height * 0.70 + 32);
  
  ctx.textAlign = "left";
}

let gameOverCursor = 0;


up_arrow.addEventListener("click", function() {
  if (isMenuOpen) { menuInput("up"); return; }
  if (battleAnimation) return;
  if (battlePhase === "target_ally") {
    targetCursor = (targetCursor - 1 + battleParty.length) % battleParty.length;
    draw();
    return;
  }
  if (isGameOver) {
    gameOverCursor = gameOverCursor === 0 ? 1 : 0;
    draw();
    return;
  }
  if (isBattle) {
    if (battlePhase === "top") {
      topCursor = topCursor <= 1 ? topCursor + 2 : topCursor - 2;
      draw();
      return;
    }
    if (battlePhase === "skill") {
      // 現在ページの実際のスキル数を取得
      const member_u = battleParty[currentCommandIndex];
      const skillKeys_u = (member_u.skills && member_u.skills[currentSkillSlot]) || [];
      const pageCount_u = Math.min(
        SKILL_MENU_PAGE_SIZE,
        skillKeys_u.length - skillMenuPage * SKILL_MENU_PAGE_SIZE
      );
      // 一番上なら一番下へ（実際に存在するスキル数の範囲内）
      if (skillMenuCursor <= 1) {
        // ページ内最後の行（奇数なら1個、偶数なら2個）
        skillMenuCursor = pageCount_u % 2 === 1 ? pageCount_u - 1 : pageCount_u - 2;
      } else {
        skillMenuCursor -= 2;
      }
      draw();
    } else {
      if (commandCursor <= 1) {
        commandCursor += 4; // 一番上なら一番下へ
      } else {
        commandCursor -= 2;
      }
      draw();
    }
  } else if (!istalked) {
    movePlayer(0, -1);
    player.d = 'up';
  } else if (currentNPC && currentNPC.messages[currentMessageIndex].choices) {
    const currentChoiceLength = currentNPC.messages[currentMessageIndex].choices.length;
    if (currentChoiceIndex <= 0) {
      currentChoiceIndex = currentChoiceLength - 1;
    } else {
      currentChoiceIndex--;
    }
    draw();
  }
});

down_arrow.addEventListener("click", function() {
  if (isMenuOpen) { menuInput("down"); return; }
  if (battleAnimation) return;
  if (battlePhase === "target_ally") {
    targetCursor = (targetCursor + 1) % battleParty.length;
    draw();
    return;
  }
  if (isGameOver) {
    gameOverCursor = gameOverCursor === 0 ? 1 : 0;
    draw();
    return;
  }
  if (isBattle) {
    if (battlePhase === "top") {
      topCursor = topCursor >= 2 ? topCursor - 2 : topCursor + 2;
      draw();
      return;
    }
    if (battlePhase === "skill") {
      // 現在ページの実際のスキル数を取得
      const member_d = battleParty[currentCommandIndex];
      const skillKeys_d = (member_d.skills && member_d.skills[currentSkillSlot]) || [];
      const pageCount_d = Math.min(
        SKILL_MENU_PAGE_SIZE,
        skillKeys_d.length - skillMenuPage * SKILL_MENU_PAGE_SIZE
      );
      const nextCursor = skillMenuCursor + 2;
      // 次のカーソル位置がページ内スキル数を超えたら一番上に戻る
      if (nextCursor >= pageCount_d) skillMenuCursor = 0;
      else skillMenuCursor = nextCursor;
      draw();
    } else {
      if (commandCursor >= 4) {
        commandCursor -= 4;
      } else {
        commandCursor += 2;
      }
      draw();
    }
  } else if (!istalked) {
    movePlayer(0, 1);
    player.d = 'down';
  } else if (currentNPC && currentNPC.messages[currentMessageIndex].choices) {
    const currentChoiceLength = currentNPC.messages[currentMessageIndex].choices.length;
    if (currentChoiceIndex <= 0) {
      currentChoiceIndex = currentChoiceLength - 1;
    } else {
      currentChoiceIndex--;
    }
    draw();
  }
});


left_arrow.addEventListener("click", function() {
  if (isMenuOpen) { menuInput("left"); return; }
  if (battleAnimation) return;
  if (isBattle) {
    if (battlePhase === "top") {
      if (topCursor % 2 === 1) topCursor--;
      draw();
      return;
    }
    if (battlePhase === "skill") {
      const member_l = battleParty[currentCommandIndex];
      const skillKeys_l = (member_l.skills && member_l.skills[currentSkillSlot]) || [];
      const totalPages_l = Math.ceil(skillKeys_l.length / SKILL_MENU_PAGE_SIZE);
      if (skillMenuCursor % 2 === 0) {
        // 左端なら前のページへ
        if (skillMenuPage > 0) {
          skillMenuPage--;
          skillMenuCursor = 1;
        }
        else {
          skillMenuPage = totalPages_l - 1;
          skillMenuCursor = 1;
        }
      } else {
        skillMenuCursor--;
      }
      draw();
    } else if (battlePhase === "target" || battlePhase === "observe") {
      if (targetCursor <= 0) {
        targetCursor = currentEnemies.length - 1;
      } else {
        targetCursor--;
      }
    } else {
      const totalPages = Math.ceil(mainCommands.length / 6);
      if (commandCursor % 2 === 0) {
        if (commandPage > 0) {
          commandPage--;
          commandCursor++;
        } else {
          commandPage = totalPages - 1;
          commandCursor++;
        }
      } else {
        commandCursor--;
      }
    }
    draw();
  } else {
    movePlayer(-1, 0);
    player.d = 'left';
  }
});

right_arrow.addEventListener("click", function() {
  if (isMenuOpen) { menuInput("right"); return; }
  if (battleAnimation) return;
  if (isBattle) {
    if (battlePhase === "top") {
      if (topCursor % 2 === 0 && topCursor + 1 <= 3) topCursor++;
      draw();
      return;
    }
    if (battlePhase === "skill") {
      const member_r = battleParty[currentCommandIndex];
      const skillKeys_r = (member_r.skills && member_r.skills[currentSkillSlot]) || [];
      const totalPages_r = Math.ceil(skillKeys_r.length / SKILL_MENU_PAGE_SIZE);
      const pageCount_r = Math.min(
        SKILL_MENU_PAGE_SIZE,
        skillKeys_r.length - skillMenuPage * SKILL_MENU_PAGE_SIZE
      );
      if (skillMenuCursor % 2 === 1) {
        // 右端なら次のページへ
        if (skillMenuPage < totalPages_r - 1) {
          skillMenuPage++;
          skillMenuCursor = 0;
        }
        else {
          skillMenuPage = 0;
          skillMenuCursor = 0;
        }
      } else {
        // 右隣にスキルが存在する場合だけ移動
        if (skillMenuCursor + 1 < pageCount_r) skillMenuCursor++;
      }
      draw();
    } else if (battlePhase === "target" || battlePhase === "observe") {
      if (targetCursor >= currentEnemies.length - 1) {
        targetCursor = 0;
      } else {
        targetCursor++;
      }
    } else {
      const totalPages = Math.ceil(mainCommands.length / 6);
      if (commandCursor % 2 === 1) {
        if (commandPage < totalPages - 1) {
          commandPage++;
          commandCursor--;
        } else {
          commandPage = 0;
          commandCursor--;
        }
      } else {
        commandCursor++;
      }
    }
    draw();
  } else {
    movePlayer(1, 0);
    player.d = 'right';
  }
});

aBtn.addEventListener("click", function() {
  if (isMenuOpen) { menuInput("a"); return; }
  if (isGameOver) {
    if (gameOverCursor === 0) {
      gameOverRevive();
    } else {
      window.location.href = "/河野友真の冒険Ⅱ本編/kawanoyuma_adventure2.html";
    }
    return;
  }
  if (isBattle) {
    // ログ表示中が最優先
    if (isBattleLog) {
      if (isHitAnimating) return;
      if (pendingHitTarget) {
        const t = pendingHitTarget;
        pendingHitTarget = null;
        playHitAnimation(t);
        return;
      }
      showNextLog();
      return;
    }
    // トップメニュー
    if (battlePhase === "top") {
      selectTopCommand();
    } else if (battlePhase === "command") {
      selectCommand();
    } else if (battlePhase === "skill") {
      selectSkill();
    } else if (battlePhase === "target") {
      confirmTarget();
    } else if (battlePhase === "observe") {
      observeEnemy();
    } else if (battlePhase === "target_ally") {
      confirmAllyTarget();
    }
  } else if (istalked) {
    const currentMessage = currentNPC.messages[currentMessageIndex];
    if (message_i >= allmessage.length) {
      if (currentMessage.choices) {
        currentMessageIndex = currentMessage.choices[currentChoiceIndex].next;
      } else {
        if (currentMessage.next !== undefined) {
          currentMessageIndex = currentMessage.next;
        } else {
          currentMessageIndex++;
        }
      }
      if (currentNPC.messages[currentMessageIndex]) {
        allmessage = currentNPC.messages[currentMessageIndex].text;
        message_i = 0;
        clearInterval(timer);
        timer = setInterval(function() {
          message_i++;
          if (message_i >= allmessage.length) {
            clearInterval(timer);
          }
          draw();
        }, 100);
      } else {
        istalked = false;
        currentNPC = null;
        draw();
      }
    }
  } else {
    let targetX = player.x;
    let targetY = player.y;
    if (player.d === "up") targetY -= 1;
    if (player.d === "down") targetY += 1;
    if (player.d === "left") targetX -= 1;
    if (player.d === "right") targetX += 1;
    const npc = currentMap.npcs.find(function(n) {
      return n.x === targetX && n.y === targetY;
    });
    if (npc) {
      startMessage(npc);
    }
  }
});

bBtn.addEventListener("click", function() {
  if (isMenuOpen) { menuInput("b"); return; }
  if (isBattle) {
    if (battlePhase === "skill") {
      // スキルメニュー → コマンド選択に戻る
      battlePhase = "command";
      currentSkillSlot = null;
      selectedCommands[currentCommandIndex] = null;
      draw();
    } else if (battlePhase === "command") {
      // コマンド選択中 → 1個前のキャラのコマンドに戻る
      selectedCommands[currentCommandIndex] = null;
      if (currentCommandIndex > 0) {
        currentCommandIndex--;
        selectedCommands[currentCommandIndex] = null;
        battlePhase = "command"; // topじゃなくcommandに戻る
      } else {
        // 1人目ならトップに戻る
        battlePhase = "top";
        topCursor = 0;
      }
      draw();
    } else if (battlePhase === "target" || battlePhase === "skill") {
      // ターゲット・スキル選択 → コマンド選択に戻る
      battlePhase = "command";
      currentSkillSlot = null;
      selectedCommands[currentCommandIndex] = null;
      draw();
    }
  }
});

mBtn.addEventListener("click", function() {
  if (battleAnimation) return;
  if (isBattle) return;
  if (isMenuOpen) { closeMenu(); return; }
  openMenu();
});