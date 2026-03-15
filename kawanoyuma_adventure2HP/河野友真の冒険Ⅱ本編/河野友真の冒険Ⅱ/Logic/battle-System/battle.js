let isBattle = false;
let topCursor = 0; // トップメニューのカーソル（0=たたかう, 1=どうぐ, 2=逃げる）
let isGameOver = false;

let currentBattleBg = "field";
let currentBattleBgColor = "black";

const battleLogs = []; // { text, attackTarget } の配列
let currentLogIndex = 0;
let isBattleLog = false;
let isEnemyPhase = false; // 敵ターン中かどうか
let isBattleEnding = false; // 経験値ログ表示中かどうか
let afterLogAction = null; // ログ終了後の処理（"reselect" = コマンド選択に戻る）

// 攻撃ヒットアニメーション
let hitAnimTarget = null; // 攻撃を受けてる敵オブジェクト
let hitAnimFrame = 0;
const HIT_ANIM_STEPS = 6; // 点滅回数
const HIT_ANIM_INTERVAL = 100; // 1回あたりのms
let isHitAnimating = false;
let pendingHitTarget = null; // Aボタンを押したときに起動するアニメのターゲット

let currentCommandIndex = 0; // 今コマンド選択中のキャラ
let commandPage = 0; // ページ番号
let commandCursor = 0; // カーソル位置（0〜5）
let selectedCommands = []; // 各キャラの選択済みコマンド
let battleAnimation = false;
let battleAnimationFrame = 0;
let isBossBattle = false;

let battlePhase = "command"; // "command" / "skill" / "target"
let targetCursor = 0; // 敵の選択カーソル

// スキルサブメニュー用
let currentSkillSlot = null; // 今選んでるコマンド枠（"magic" / "special1" など）
let skillMenuPage = 0; // スキルメニューのページ番号
let skillMenuCursor = 0; // スキルメニューのカーソル位置
const SKILL_MENU_PAGE_SIZE = 6; // 1ページに表示するスキル数
let currentEnemies = [];
let defeatedEnemies = []; // 倒した敵を記録（経験値計算用）

const mainCommands = [
  { name: "攻撃" },
  { name: "魔法" },
  { name: "特技1" },
  { name: "特技2" },
  { name: "連携" },
  { name: "必殺" },
];



function drawStatus() {
  const halfHeight = canvas.height / 2;
  const uiHeight = canvas.height - halfHeight;
  const statusHeight = uiHeight * 0.27;
  
  const colWidth = canvas.width / 2;
  const rowHeight = statusHeight / 2;
  
  
  
  battleParty.forEach(function(member, i) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    
    const x = col * colWidth;
    const y = halfHeight + rowHeight * row;
    
    // 選択中のキャラは薄い黄色
    if (i === currentCommandIndex) {
      ctx.fillStyle = "rgba(255, 255, 150, 0.3)";
      ctx.fillRect(x, y, colWidth, rowHeight);
    }
    // 選択中のキャラは薄い黄色の後に追加
    if (battlePhase === "target_ally" && i === targetCursor) {
      ctx.fillStyle = "yellow";
      ctx.font = "16px 'JF-Dot-K12'";
      ctx.fillText("◀", x + colWidth - 20, y + rowHeight / 2);
    }
    ctx.font = "14px 'JF-Dot-K12'";
    ctx.fillStyle = "white";
    const buffText = (member.buffs && member.buffs.attack.amount > 1.0) ?
      ` A${member.buffs.attack.amount}` : "";
    ctx.fillText(`${member.name}${buffText}`, x + 10, y + 20);
    ctx.fillText(`HP ${member.hp}/${member.maxHp}  MP ${member.mp}/${member.maxMp}`, x + 10, y + 38);
    // TPゲージ（細い緑バー）
    const gaugeY = y + rowHeight - 3; // ステータス欄の下端ギリギリ
    const gaugeW = colWidth - 20; // 横幅
    const gaugeH = 2; // 高さ（細め）
    const tpRatio = member.tp / member.maxTp;
    
    // 背景（暗い緑）
    ctx.fillStyle = "#1a4a1a";
    ctx.fillRect(x + 10, gaugeY, gaugeW, gaugeH);
    
    // TP量（明るい緑）
    ctx.fillStyle = "#00cc44";
    ctx.fillRect(x + 10, gaugeY, gaugeW * tpRatio, gaugeH);
  });
}

function drawPoints() {
  const halfHeight = canvas.height / 2;
  const uiHeight = canvas.height - halfHeight;
  const statusHeight = uiHeight * 0.25;
  const pointsHeight = uiHeight * 0.15;
  
  const y = halfHeight + statusHeight + pointsHeight / 2 + 8;
  
  ctx.font = "14px 'JF-Dot-K12'";
  ctx.fillStyle = "white";
  ctx.fillText(`SP ${partyPoints.sp}/${partyPoints.maxSp}  UP ${partyPoints.up}/${partyPoints.maxUp}`, 10, y);
}

function drawCommand() {
  const halfHeight = canvas.height / 2;
  const uiHeight = canvas.height - halfHeight;
  const statusHeight = uiHeight * 0.27;
  const pointsHeight = uiHeight * 0.10;
  const commandTop = halfHeight + statusHeight + pointsHeight;
  const commandHeight = uiHeight * 0.6;
  
  const colWidth = canvas.width / 2;
  const rowHeight = commandHeight / 3;
  
  // 表示するコマンドを取得（1ページ6個）
  const pageCommands = mainCommands.slice(commandPage * 6, commandPage * 6 + 6);
  
  pageCommands.forEach(function(cmd, i) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    
    const x = col * colWidth;
    const y = commandTop + row * rowHeight;
    
    // カーソル位置なら背景色を変える
    if (i === commandCursor) {
      ctx.fillStyle = "#555";
    } else {
      ctx.fillStyle = "#333";
    }
    ctx.fillRect(x + 2, y + 2, colWidth - 4, rowHeight - 4);
    
    // コマンド名
    ctx.fillStyle = "white";
    ctx.font = "14px 'JF-Dot-K12'";
    ctx.fillText(cmd.name, x + 10, y + rowHeight / 2 + 5);
  });
}

function drawTopMenu() {
  const halfHeight = canvas.height / 2;
  const uiHeight = canvas.height - halfHeight;
  const statusHeight = uiHeight * 0.27;
  const pointsHeight = uiHeight * 0.10;
  const menuTop = halfHeight + statusHeight + pointsHeight;
  const menuHeight = uiHeight * 0.6;
  const colWidth = canvas.width / 2;
  const rowHeight = menuHeight / 3;
  
  const items = ["たたかう", "どうぐ", "逃げる", "観察"];
  items.forEach(function(name, i) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col * colWidth;
    const y = menuTop + row * rowHeight;
    ctx.fillStyle = i === topCursor ? "#555" : "#333";
    ctx.fillRect(x + 2, y + 2, colWidth - 4, rowHeight - 4);
    ctx.fillStyle = "white";
    ctx.font = "14px 'JF-Dot-K12'";
    ctx.fillText(name, x + 10, y + rowHeight / 2 + 5);
  });
}

const countWeights = [0, 60, 20, 10, 5, 3, 2];

function pickCount() {
  const total = countWeights.reduce(function(sum, w) { return sum + w; }, 0);
  let rand = Math.random() * total;
  for (let i = 1; i < countWeights.length; i++) {
    rand -= countWeights[i];
    if (rand <= 0) return i;
  }
  return 1;
}

function startBattleWithEnemy(regionEnemies) {
  const typeCount = Math.floor(Math.random() * 3) + 1;
  const totalCount = pickCount();
  
  currentEnemies = [];
  for (let i = 0; i < totalCount; i++) {
    const id = pickEncounterEnemy({ enemies: regionEnemies });
    if (!id) continue;
    currentEnemies.push({ ...ENEMIES[id] });
  }
  
  if (currentEnemies.length === 0) return;
  
  // 同名の敵が複数いる場合にA,B,Cラベルを付与
  const nameCounts = {};
  currentEnemies.forEach(function(e) {
    nameCounts[e.name] = (nameCounts[e.name] || 0) + 1;
  });
  const nameIndex = {};
  currentEnemies.forEach(function(e) {
    if (nameCounts[e.name] > 1) {
      nameIndex[e.name] = (nameIndex[e.name] || 0);
      e.label = e.name + "ABCDEFGH" [nameIndex[e.name]];
      nameIndex[e.name]++;
    } else {
      e.label = e.name;
    }
  });
  
  startBattle(false);
}

function startBattle(isBoss) {
  const tile = currentMap.layer1[player.y][player.x];
  currentBattleBg = TILES[tile].battleBg || "field";
  currentBattleBgColor = TILES[tile].color || "black";
  battleParty = allParty.map(function(m) { return Object.assign({}, m); });
  isBossBattle = isBoss || false;
  battleAnimation = true;
  battleAnimationFrame = 0;
  // 状態リセット
  selectedCommands = [];
  currentCommandIndex = 0;
  commandPage = 0;
  commandCursor = 0;
  battlePhase = "top";
  targetCursor = 0;
  currentSkillSlot = null;
  skillMenuPage = 0;
  skillMenuCursor = 0;
  battleLogs.length = 0;
  currentLogIndex = 0;
  isBattleLog = false;
  defeatedEnemies = []; // 倒した敵リストもリセット
  afterLogAction = null;
  pendingHitTarget = null;
  isGameOver = false;
  
  
  
  startBattleAnimation();
}

function endBattle() {
  stopBgm();
  playSe('/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/Sound/SE/ステージクリア.mp3')
  // 倒した敵から合計経験値を計算
  const totalExp = defeatedEnemies.reduce(function(sum, e) {
    return sum + (e.exp || 0); // expがない敵は0扱い
  }, 0);
  
  if (totalExp > 0) {
    // 生きてるメンバー全員に経験値を加算してログ表示
    battleParty.forEach(function(member) {
      if (member.hp <= 0) return; // 戦闘不能メンバーはスキップ（後々）
      
      // 1. まず経験値取得ログ
      addBattleLog(`${member.name}は${totalExp}経験値を取得した！`, null, true);
      
      // allPartyから同名メンバーを探してgainExpを呼ぶ
      // （battlePartyはバトル用コピーなのでallParty側に反映する必要がある）
      const original = allParty.find(function(m) { return m.name === member.name; });
      if (original) {
        // 2. gainExpが返すレベルアップ・スキル習得ログをそのまま追加
        // こうすることで「経験値取得→レベルアップ→スキル習得」の順番が保たれる
        const levelLogs = gainExp(original, totalExp);
        levelLogs.forEach(function(log) {
          // レベルアップログにはSEを追加
          if (log.includes("になった！")) {
            addBattleLog(log, null, true, null, () => {
              playSe("/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/Sound/SE/レベルアップ・経験値アップ.mp3");
            });
          } else {
            addBattleLog(log, null, true);
          }
        });
        
      }
    });
    
    // ログを表示してから終了するため、フラグを立てて終了処理を予約
    isBattleLog = true;
    currentLogIndex = 0;
    isBattleEnding = true; // 経験値ログ表示後にバトル終了するフラグ
    draw();
  } else {
    // 経験値0なら即終了
    isBattle = false;
    draw();
  }
}

// バトル終了処理の本体（経験値ログを全部見終わった後に呼ばれる）
function finalizeBattle() {
  battleParty.forEach(function(member) {
    const original = allParty.find(function(m) { return m.name === member.name; });
    if (original) {
      original.tp = member.tp;
      original.hp = member.hp; // ← 追加
      original.mp = member.mp; // ← 追加
    }
  });
  resetEncounter(); // ← 追加
  isBattle = false;
  isBattleEnding = false;
  draw();
}

function drawBattle() {
  const halfHeight = canvas.height / 2;
  const uiHeight = canvas.height - halfHeight;
  
  // 上半分：敵エリア（黒背景）
  ctx.fillStyle = currentBattleBgColor;
  ctx.fillRect(0, 0, canvas.width, halfHeight);
  
  // 下半分：UIエリア（濃いグレー背景）
  ctx.fillStyle = "#222";
  ctx.fillRect(0, halfHeight, canvas.width, uiHeight);
  
  const statusHeight = uiHeight * 0.27; // 27%
  const pointsHeight = uiHeight * 0.10; // 10%
  const commandHeight = uiHeight * 0.6; // 60%
  
  // 枠線
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  
  // ステータスとTP/SP/UPの境界線
  ctx.beginPath();
  ctx.moveTo(0, halfHeight + statusHeight);
  ctx.lineTo(canvas.width, halfHeight + statusHeight);
  ctx.stroke();
  
  // TP/SP/UPとコマンドの境界線
  ctx.beginPath();
  ctx.moveTo(0, halfHeight + statusHeight + pointsHeight);
  ctx.lineTo(canvas.width, halfHeight + statusHeight + pointsHeight);
  ctx.stroke();
  
  drawStatus()
  drawPoints()
  drawEnemies() // ← これがあるか？
  drawEffects()
  if (isBattleLog) { // ← これがあるか？
    drawBattleLog();
  }
  // スキルメニュー中はコマンドの代わりにスキルリストを表示
  if (battlePhase === "skill") {
    drawSkillMenu();
  } else if (battlePhase === "top") {
    drawTopMenu();
  } else if (battlePhase === "observe") {
    // ターゲット選択と同じ描画（何も表示しない、敵カーソルだけ出る）
  } else {
    drawCommand();
  }
}



function selectCommand() {
  const selectedCommand = mainCommands[commandPage * 6 + commandCursor];
  if (!selectedCommand) return;
  
  // 魔法・特技はスキルサブメニューへ
  if (selectedCommand.name === "魔法") {
    openSkillMenu("magic", selectedCommand);
  } else if (selectedCommand.name === "特技1") {
    openSkillMenu("special1", selectedCommand);
  } else if (selectedCommand.name === "特技2") {
    openSkillMenu("special2", selectedCommand);
  } else if (selectedCommand.name === "連携") {
    openSkillMenu("chain", selectedCommand);
  } else if (selectedCommand.name === "必殺") {
    openSkillMenu("ultimate", selectedCommand);
  } else if (selectedCommand.name === "攻撃") {
    // 攻撃はそのままターゲット選択へ
    selectedCommands[currentCommandIndex] = {
      command: selectedCommand,
      skill: null, // 通常攻撃はスキルなし
      target: null,
    };
    battlePhase = "target";
    targetCursor = 0;
  }
  
  draw();
}

// スキルサブメニューを開く
// slot = "magic" / "special1" など、parentCommand = 親コマンド（"魔法"など）
function openSkillMenu(slot, parentCommand) {
  const member = battleParty[currentCommandIndex];
  const skillKeys = member.skills ? member.skills[slot] : [];
  
  // 習得済みスキルが0個の場合はログを出してコマンド選択に戻る
  if (!skillKeys || skillKeys.length === 0) {
    addBattleLog(`${member.name}は${parentCommand.name}を覚えていない！`);
    isBattleLog = true;
    currentLogIndex = 0;
    // ログ送り後にコマンド選択に戻るフラグをセット（敵ターンに行かせない）
    afterLogAction = "reselect";
    draw();
    return;
  }
  
  // スキルメニュー用の状態をセット
  currentSkillSlot = slot;
  skillMenuPage = 0;
  skillMenuCursor = 0;
  // 親コマンドを一時保存（後でselectedCommandsに入れるため）
  selectedCommands[currentCommandIndex] = {
    command: parentCommand,
    skill: null,
    target: null,
  };
  battlePhase = "skill";
}

// スキルメニューの描画
function drawSkillMenu() {
  const halfHeight = canvas.height / 2;
  const uiHeight = canvas.height - halfHeight;
  const statusHeight = uiHeight * 0.27;
  const pointsHeight = uiHeight * 0.10;
  const menuTop = halfHeight + statusHeight + pointsHeight;
  const menuHeight = uiHeight * 0.6;
  
  const colWidth = canvas.width / 2;
  const rowHeight = menuHeight / 3;
  
  const member = battleParty[currentCommandIndex];
  const skillKeys = (member.skills && member.skills[currentSkillSlot]) || [];
  
  // 現在のページに表示するスキルを取得
  const pageSkills = skillKeys.slice(
    skillMenuPage * SKILL_MENU_PAGE_SIZE,
    skillMenuPage * SKILL_MENU_PAGE_SIZE + SKILL_MENU_PAGE_SIZE
  );
  
  pageSkills.forEach(function(skillKey, i) {
    const skill = findSkill(skillKey);
    if (!skill) return;
    
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col * colWidth;
    const y = menuTop + row * rowHeight;
    
    // カーソル位置は背景色を変える
    ctx.fillStyle = i === skillMenuCursor ? "#555" : "#333";
    ctx.fillRect(x + 2, y + 2, colWidth - 4, rowHeight - 4);
    
    // スキル名とコスト表示
    ctx.fillStyle = "white";
    ctx.font = "13px 'JF-Dot-K12'";
    ctx.fillText(skill.name, x + 8, y + rowHeight / 2);
    
    // コスト表示（MP/TPなど）
    if (skill.costType) {
      ctx.fillStyle = "#aaa";
      ctx.font = "11px 'JF-Dot-K12'";
      ctx.fillText(`${skill.cost}${skill.costType.toUpperCase()}`, x + 8, y + rowHeight - 6);
    }
  });
  
  // ページ表示（複数ページある場合）
  const totalPages = Math.ceil(skillKeys.length / SKILL_MENU_PAGE_SIZE);
  if (totalPages > 1) {
    ctx.fillStyle = "#aaa";
    ctx.font = "11px 'JF-Dot-K12'";
    ctx.fillText(`${skillMenuPage + 1}/${totalPages}`, canvas.width - 30, menuTop + menuHeight - 5);
  }
  const currentSkillKey = skillKeys[skillMenuPage * SKILL_MENU_PAGE_SIZE + skillMenuCursor];
  const currentSkill = currentSkillKey ? findSkill(currentSkillKey) : null;
  if (currentSkill && currentSkill.description && !isBattleLog) {
    drawBattleLogText(currentSkill.description);
  }
}

// スキルメニューでスキルを決定
function selectSkill() {
  const member = battleParty[currentCommandIndex];
  const skillKeys = (member.skills && member.skills[currentSkillSlot]) || [];
  const skillKey = skillKeys[skillMenuPage * SKILL_MENU_PAGE_SIZE + skillMenuCursor];
  if (!skillKey) return;
  
  const skill = findSkill(skillKey);
  if (!skill) return;
  
  // コスト確認
  if (skill.costType === "tp" && member.tp < skill.cost) {
    addBattleLog(`${member.name}はTPが足りない！`, null, true);
    isBattleLog = true;
    currentLogIndex = 0;
    afterLogAction = "reselect";
    draw();
    return;
  } else if (skill.costType === "mp" && member.mp < skill.cost) {
    addBattleLog(`${member.name}はMPが足りない！`, null, true);
    isBattleLog = true;
    currentLogIndex = 0;
    afterLogAction = "reselect";
    draw();
    return;
  }
  
  // 選択したスキルを保存
  selectedCommands[currentCommandIndex].skill = skill;
  selectedCommands[currentCommandIndex].skillKey = skillKey;
  
  if (skill.target === "all" || skill.target === "all_party" || skill.target === "self" || skill.target === "all_random") {
    selectedCommands[currentCommandIndex].target = null;
    nextCharacterCommand();
  } else {
    if (skill.type === "heal") {
      battlePhase = "target_ally";
    } else {
      battlePhase = "target";
    }
    targetCursor = 0;
  }
  
  draw();
}

function nextCharacterCommand() {
  currentCommandIndex++;
  commandCursor = 0;
  commandPage = 0;
  
  // HP0のキャラをスキップ
  while (currentCommandIndex < battleParty.length && battleParty[currentCommandIndex].hp <= 0) {
    currentCommandIndex++;
  }
  
  battlePhase = "command";
  
  if (currentCommandIndex >= battleParty.length) {
    currentCommandIndex = 0;
    executeBattle();
  }
}

function confirmTarget() {
  selectedCommands[currentCommandIndex].target = currentEnemies[targetCursor];
  console.log("confirmTarget:", selectedCommands[currentCommandIndex]);
  nextCharacterCommand();
  draw();
}

function showNextLog() {
  if (currentLogIndex < battleLogs.length) {
    isBattleLog = true;
    const log = battleLogs[currentLogIndex];
    currentLogIndex++;
    if (log.dieTarget) log.dieTarget.visuallyDead = true;
    if (log.effect) log.effect();
    draw();
    if (log.attackTarget) {
      pendingHitTarget = log.attackTarget;
    } else if (log.waitA) {
      pendingHitTarget = null;
    } else {
      pendingHitTarget = null;
      showNextLog();
    }
  } else {
    battleLogs.length = 0;
    currentLogIndex = 0;
    isBattleLog = false;
    // ここで初めて死んだ敵を除外し、倒した敵を記録
    currentEnemies.forEach(function(e) {
      if (e.hp <= 0) defeatedEnemies.push(e);
    });
    currentEnemies = currentEnemies.filter(function(e) { return e.hp > 0; });
    if (afterLogAction === "reselect") {
      afterLogAction = null;
      battlePhase = "command";
      draw();
    } else if (afterLogAction === "gameover") {
      afterLogAction = null;
      isBattle = false;
      isGameOver = true;
      
      draw();
    }
    else if (afterLogAction === "reselect_top") {
      // どうぐ・逃げるのログ後はトップメニューに戻る
      afterLogAction = null;
      battlePhase = "top";
      draw();
    } else if (isBattleEnding) {
      // 経験値ログを全部見終わったらバトル終了
      finalizeBattle();
    } else if (currentEnemies.length === 0) {
      endBattle();
    } else if (isEnemyPhase) {
      isEnemyPhase = false;
      battleParty.forEach(function(member) {
        if (member.buffs.attack.turnsLeft > 0) {
          member.buffs.attack.turnsLeft--;
          if (member.buffs.attack.turnsLeft === 0) {
            member.buffs.attack.amount = 1.0;
          }
        }
      });
      // 全滅チェック
      const aliveParty = battleParty.filter(function(m) { return m.hp > 0; });
      if (aliveParty.length === 0) {
        startGameOver();
        return;
      }
      selectedCommands = [];
      // プレイヤーターン開始時：1/3の確率でUP+5
      if (Math.random() < 1 / 3) {
        partyPoints.up = Math.min(partyPoints.maxUp, partyPoints.up + 5);
      }
      currentCommandIndex = 0;
      commandPage = 0;
      commandCursor = 0;
      battlePhase = "top";
      targetCursor = 0;
      draw();
    } else if (afterLogAction === "escape") {
      afterLogAction = null;
      isBattle = false;
      endBattleWithoutReward();
    } else {
      enemyTurn();
    }
  }
}

function endBattleWithoutReward() {
  currentEnemies = [];
  defeatedEnemies = [];
  selectedCommands = [];
  isBattleLog = false;
  isBattleEnding = false;
  isEnemyPhase = false;
  isBattle = false;
  resetEncounter();
  draw();
}

// ヒットアニメーション
function playHitAnimation(target) {
  hitAnimTarget = target;
  hitAnimFrame = 0;
  isHitAnimating = true;
  runHitAnimation();
}

function runHitAnimation() {
  hitAnimFrame++;
  draw();
  if (hitAnimFrame < HIT_ANIM_STEPS) {
    setTimeout(runHitAnimation, HIT_ANIM_INTERVAL);
  } else {
    hitAnimTarget = null;
    isHitAnimating = false;
    // アニメ終了後、次のログ（ダメージログ）を自動表示
    showNextLog();
  }
}

function executeBattle() {
  // 遅延HP反映に対応するため敵の仮HPを用意
  currentEnemies.forEach(function(e) { e.tempHp = e.hp; });
  
  battleParty.forEach(function(m) {
    if (m.hp <= 0) return;
    processStatusEffects(m, false);
  });
  
  for (let i = 0; i < battleParty.length; i++) {
    const cmd = selectedCommands[i];
    if (!cmd) continue;
    
    const attacker = battleParty[i];
    if (attacker.hp <= 0) continue;
    let target = cmd.target;
    const skill = cmd.skill;
    
    const needsTarget = !skill || (skill.target === "single");
    if (!target && needsTarget) continue;
    
    // tempHpで死亡判定
    if (target && target.tempHp <= 0) {
      const newTarget = currentEnemies.find(function(e) { return e.tempHp > 0; });
      if (!newTarget) continue;
      addBattleLog(`${target.label || target.name}は既に倒れている！${attacker.name}は${newTarget.label || newTarget.name}を狙う！`);
      target = newTarget;
    }
    
    if (cmd.command.name === "攻撃") {
      const damage = calcDamage(attacker, target, SKILLS1["tackle"]);
      const newHp = Math.max(0, target.tempHp - damage);
      const dies = newHp <= 0;
      target.tempHp = newHp;
      const targetIndex = currentEnemies.indexOf(target);
      addBattleLog(`${attacker.name}の攻撃！`, target, false, null, () => {
        playEffect("slash", "single", targetIndex); // ← 追加
        playSe('/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/Sound/SE/斬撃音.mp3') //とりあえず斬撃音
      });
      addBattleLog(`${target.label || target.name}に${damage}ダメージ！`, null, true, null, () => {
        target.hp = newHp;
        attacker.tp = Math.min(attacker.maxTp, attacker.tp + 5);
      });
      if (dies) addBattleLog(`${target.label || target.name}は倒れた！`, null, true, target);
    } else if (cmd.skill) {
      // コスト消費
      if (cmd.skill.costType === "tp") {
        attacker.tp = Math.max(0, attacker.tp - cmd.skill.cost);
      } else if (cmd.skill.costType === "mp") {
        attacker.mp = Math.max(0, attacker.mp - cmd.skill.cost);
      }
      
      if (cmd.skill.type === "magical" || cmd.skill.type === "physical") {
        const targetIndex = currentEnemies.indexOf(target);
        const mode = cmd.skill.effectMode || "single";
        const key = cmd.skill.effectKey;
        // ↓ エフェクトはexecuteAttackSkill内のループで再生するので、ここでは呼ばない
        executeAttackSkill(attacker, target, cmd.skill, cmd);
      } else if (cmd.skill.type === "heal") {
        executeHeal(attacker, target, cmd.skill, cmd);
      } else if (cmd.skill.type === "buff") {
        executeBuff(attacker, cmd.skill);
      }
    }
  }
  showNextLog();
}

function drawBattleLog() {
  const halfHeight = canvas.height / 2;
  
  // ログエリア（敵エリアの下部）
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, halfHeight - 60, canvas.width, 60);
  
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, halfHeight - 60, canvas.width, 60);
  
  ctx.font = "14px 'JF-Dot-K12'";
  ctx.fillStyle = "white";
  ctx.fillText((battleLogs[currentLogIndex - 1] && battleLogs[currentLogIndex - 1].text) || "", 10, halfHeight - 30);
  // Aボタン促進（アニメーション中は非表示）
  if (!isHitAnimating) {
    ctx.fillText("▼", canvas.width - 20, halfHeight - 10);
  }
}

function drawBattleLogText(text) {
  const halfHeight = canvas.height / 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, halfHeight - 60, canvas.width, 60);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, halfHeight - 60, canvas.width, 60);
  ctx.font = "13px 'JF-Dot-K12'";
  ctx.fillStyle = "#ccc";
  // 折り返し処理
  const maxW = canvas.width - 20;
  const words = text.split("");
  let line = "";
  let lineY = halfHeight - 40;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    if (ctx.measureText(testLine).width > maxW && line !== "") {
      ctx.fillText(line, 10, lineY);
      line = words[i];
      lineY += 18;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, 10, lineY);
}

function addBattleLog(text, attackTarget = null, waitA = false, dieTarget = null, effect = null) {
  battleLogs.push({ text, attackTarget, waitA, dieTarget, effect });
}

function formatLog(text, attacker, target) {
  if (!text) return text;
  return text
    .replace(/self/g, attacker ? attacker.name : "")
    .replace(/enemy/g, target ? target.label || target.name : "");
}

function addSkillLogs(skill, attacker, target, basicLog) {
  const log = skill.battleLog;
  if (!log) {
    addBattleLog(basicLog, target || null, !target);
    return;
  }
  if (log.startsWith("/")) {
    addBattleLog(basicLog, target || null, !target);
    addBattleLog(formatLog(log.slice(1), attacker, target), null, true);
  } else {
    const parts = log.split("/");
    addBattleLog(basicLog, target || null, !target);
    parts.forEach(function(part) {
      if (part.trim()) addBattleLog(formatLog(part, attacker, target), null, true);
    });
  }
}

const enemyImgCache = {};

function getEnemyImg(src) {
  if (!src) return null;
  if (!enemyImgCache[src]) {
    const img = new Image();
    img.onload = function() { draw(); }; // ← 追加
    img.src = src;
    enemyImgCache[src] = img;
  }
  return enemyImgCache[src];
}

function drawEnemies() {
  const halfHeight = canvas.height / 2;
  const enemyCount = currentEnemies.length;
  const colWidth = canvas.width / enemyCount;
  const scale = 3;
  const drawW = 32 * scale;
  const drawH = 32 * scale;
  
  currentEnemies.forEach(function(enemy, i) {
    const x = i * colWidth + colWidth / 2;
    const y = halfHeight / 2; // 敵エリアの中央
    
    const isBeingHit = isHitAnimating && hitAnimTarget === enemy;
    
    // グレーアウト・点滅
    if (enemy.visuallyDead) {
      ctx.filter = "grayscale(100%)";
      ctx.globalAlpha = 0.5;
    } else if (isBeingHit && hitAnimFrame % 2 === 0) {
      ctx.globalAlpha = 0;
    }
    
    const eImg = getEnemyImg(enemy.image);
    if (eImg && eImg.complete) {
      ctx.drawImage(eImg, x - drawW / 2, y - drawH / 2, drawW, drawH);
    }
    
    ctx.filter = "none";
    ctx.globalAlpha = 1.0;
    
    // 名前
    if (isBeingHit) {
      ctx.fillStyle = hitAnimFrame % 2 === 0 ? "red" : "white";
    } else if (enemy.visuallyDead) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = "white";
    }
    ctx.font = "14px 'JF-Dot-K12'";
    ctx.textAlign = "center";
    if (eImg && eImg.complete) {
      ctx.fillText(enemy.label || enemy.name, x, y + drawH / 2 + 16);
    } else {
      ctx.fillText(enemy.label || enemy.name, x, y);
    }
    
    // 矢印は画像の上端よりさらに上
    if ((battlePhase === "target" || battlePhase === "observe") && i === targetCursor) {
      ctx.fillStyle = "yellow";
      ctx.font = "16px 'JF-Dot-K12'";
      ctx.fillText("▼", x, y - drawH / 2 - 8);
    }
    
    ctx.textAlign = "left";
  });
}

function enemyTurn() {
  isEnemyPhase = true;
  
  currentEnemies.forEach(function(enemy) {
    if (enemy.hp <= 0) return;
    processStatusEffects(enemy, true);
  });
  
  currentEnemies.forEach(function(enemy) {
    if (enemy.hp <= 0) return;
    
    // スキルをランダム選択
    const skillKey = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
    // 全配列から該当スキルを検索
    const skill = findSkill(skillKey);
    if (!skill) return;
    
    // ターゲット決定
    const aliveParty = battleParty.filter(function(m) { return m.hp > 0; });
    if (aliveParty.length === 0) return;
    
    if (skill.target === "all") {
      addBattleLog(`${enemy.label || enemy.name}の${skill.name}！`, null, true);
      aliveParty.forEach(function(member) {
        const damage = calcEnemyDamage(enemy, member, skill);
        const newHp = Math.max(0, member.hp - damage);
        const dies = newHp <= 0;
        addBattleLog(`${member.name}に${damage}ダメージ！`, null, true, null, () => {
          member.hp = newHp;
          member.tp = Math.min(member.maxTp, member.tp + 5);
        });
        if (dies) addBattleLog(`${member.name}は倒れた！`, null, true, member);
      });
    } else {
      const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
      const damage = calcEnemyDamage(enemy, target, skill);
      const newHp = Math.max(0, target.hp - damage);
      const dies = newHp <= 0;
      addBattleLog(`${enemy.label || enemy.name}の${skill.name}！`, null, true);
      addBattleLog(`${target.label || target.name}に${damage}ダメージ！`, null, true, null, () => {
        target.hp = newHp;
        target.tp = Math.min(target.maxTp, target.tp + 5);
      });
      if (dies) addBattleLog(`${target.label || target.name}は倒れた！`, null, true, target);
    }
  });
  
  isBattleLog = true;
  currentLogIndex = 0;
  draw();
}

// 攻撃スキルの実行
// skill.target が "all" なら全体、"single" なら単体
function executeAttackSkill(attacker, target, skill, cmd) {
  const basicLog = `${attacker.name}は${skill.name}を放った！`;
  
  if (skill.target === "all") {
    addSkillLogs(skill, attacker, null, basicLog);
    currentEnemies.forEach(function(enemy) {
      if (enemy.tempHp <= 0) return;
      const enemyIndex = currentEnemies.indexOf(enemy);
      if (skill.effectKey) playEffect(skill.effectKey, skill.effectMode || "single", enemyIndex);
      const elementRate = getElementRate(skill ? skill.element : null, enemy.element);
      if (calcDodge(attacker, enemy)) {
        addBattleLog(`${enemy.label || enemy.name}はかわした！`, null, true);
        return;
      }
      const isCrit = calcCritical(attacker, skill);
      const damage = calcDamage(attacker, enemy, skill, isCrit);
      const newHp = Math.max(0, enemy.tempHp - damage);
      const dies = newHp <= 0;
      enemy.tempHp = newHp;
      if (isCrit) addBattleLog(`急所に当たった！`, null, true);
      if (elementRate === 2.0) addBattleLog("弱点の一撃！", null, true);
      if (elementRate === 0.5) addBattleLog("効果は薄い...", null, true);
      if (elementRate === 0.0) addBattleLog("効かない！", null, true);
      if (elementRate === -1.0) addBattleLog("吸収した！", null, true);
      addBattleLog(`${enemy.label || enemy.name}に${damage}ダメージ！`, null, true, null, () => {
        enemy.hp = newHp;
        if (skill.statusEffect) {
          const effects = Array.isArray(skill.statusEffect) ? skill.statusEffect : [skill.statusEffect];
          effects.forEach(function(e) { applyStatusEffect(enemy, e); });
        }
      });
      if (dies) addBattleLog(`${enemy.label || enemy.name}は倒れた！`, null, true, enemy);
    });
  } else if (skill.target === "all_random") {
    const hits = skill.hits || 1;
    addSkillLogs(skill, attacker, null, basicLog);
    for (let h = 0; h < hits; h++) {
      const aliveEnemies = currentEnemies.filter(function(e) { return e.tempHp > 0; });
      if (aliveEnemies.length === 0) break;
      const randTarget = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      const randTargetIndex = currentEnemies.indexOf(randTarget);
      if (skill.effectKey) playEffect(skill.effectKey, "single", randTargetIndex);
      const elementRate = getElementRate(skill ? skill.element : null, randTarget.element);
      if (calcDodge(attacker, randTarget)) {
        addBattleLog(`${randTarget.label || randTarget.name}はかわした！`, null, true);
        continue;
      }
      const isCrit = calcCritical(attacker, skill);
      const damage = calcDamage(attacker, randTarget, skill, isCrit);
      const newHp = Math.max(0, randTarget.tempHp - damage);
      const dies = newHp <= 0;
      randTarget.tempHp = newHp;
      if (isCrit) addBattleLog(`急所に当たった！`, null, true);
      if (elementRate === 2.0) addBattleLog(`弱点の一撃！`, null, true);
      else if (elementRate === 0.5) addBattleLog(`効果はいまひとつ...`, null, true);
      else if (elementRate === 0) addBattleLog(`効かない！`, null, true);
      else if (elementRate < 0) addBattleLog(`吸収した！`, null, true);
      addBattleLog(`${randTarget.label || randTarget.name}に${damage}ダメージ！`, null, true, null, () => {
        randTarget.hp = newHp;
        if (h === hits - 1 && skill.statusEffect) {
          const effects = Array.isArray(skill.statusEffect) ? skill.statusEffect : [skill.statusEffect];
          effects.forEach(function(e) { applyStatusEffect(randTarget, e); });
        }
      });
      if (dies) addBattleLog(`${randTarget.label || randTarget.name}は倒れた！`, null, true, randTarget);
    }
    addBattleLog(`${hits}回攻撃した！`, null, true);
  } else {
    const elementRate = getElementRate(skill ? skill.element : null, target.element);
    if (calcDodge(attacker, target)) {
      addBattleLog(`${basicLog}`, target);
      addBattleLog(`${target.label || target.name}はかわした！`, null, true);
      return;
    }
    
    const hits = skill.hits || 1;
    addSkillLogs(skill, attacker, target, basicLog);
    
    if (skill.instantDeath) {
      const immune = skill.instantDeath.bossImmune && target.isBoss;
      if (!immune && Math.random() < skill.instantDeath.chance) {
        target.tempHp = 0;
        target.hp = 0;
        addBattleLog(`${target.label || target.name}は即死した！`, null, true);
        addBattleLog(`${target.label || target.name}は倒れた！`, null, true, target);
        return;
      }
    }
    
    for (let h = 0; h < hits; h++) {
      if (target.tempHp <= 0) break;
      const targetIndex = currentEnemies.indexOf(target);
      if (skill.effectKey) playEffect(skill.effectKey, skill.effectMode || "single", targetIndex);
      const isCrit = calcCritical(attacker, skill);
      const damage = calcDamage(attacker, target, skill, isCrit);
      const newHp = Math.max(0, target.tempHp - damage);
      const dies = newHp <= 0;
      target.tempHp = newHp;
      if (isCrit) addBattleLog(`急所に当たった！`, null, true);
      if (elementRate === 2.0) addBattleLog(`弱点の一撃！`, null, true);
      else if (elementRate === 0.5) addBattleLog(`効果はいまひとつ...`, null, true);
      else if (elementRate === 0) addBattleLog(`効かない！`, null, true);
      else if (elementRate < 0) addBattleLog(`吸収した！`, null, true);
      addBattleLog(`${target.label || target.name}に${damage}ダメージ！`, null, true, null, () => {
        target.hp = newHp;
        attacker.tp = Math.min(attacker.maxTp, attacker.tp + 5);
        if (h === hits - 1 && skill.statusEffect) {
          const effects = Array.isArray(skill.statusEffect) ? skill.statusEffect : [skill.statusEffect];
          effects.forEach(function(e) { applyStatusEffect(target, e); });
        }
      });
      if (dies) { addBattleLog(`${target.label || target.name}は倒れた！`, null, true, target); break; }
    }
    if (hits > 1) addBattleLog(`${hits}回攻撃した！`, null, true);
  }
}


// 回復スキルの実行
function executeHeal(attacker, target, skill, cmd) {
  const healAmount = Math.floor((attacker.magicAttack || 0) * skill.power / 10);
  const basicLog = `${attacker.name}は${skill.name}を使った！`;
  if (skill.target === "all_party") {
    addSkillLogs(skill, attacker, null, basicLog); // ← 差し替え
    battleParty.forEach(function(member) {
      if (member.hp <= 0) return;
      const newHp = Math.min(member.maxHp, member.hp + healAmount);
      addBattleLog(`${member.name}のHPが${healAmount}回復した！`, null, true, null, () => {
        member.hp = newHp;
      });
    });
  } else {
    const healTarget = target || attacker;
    const newHp = Math.min(healTarget.maxHp, healTarget.hp + healAmount);
    addSkillLogs(skill, attacker, healTarget, basicLog); // ← 差し替え
    addBattleLog(`${healtarget.label || target.name}のHPが${healAmount}回復した！`, null, true, null, () => {
      healTarget.hp = newHp;
    });
  }
}

// バフスキルの実行（自己強化）
// 今はログのみ。ステータス変動の永続管理は後々追加
function executeBuff(attacker, skill) {
  addSkillLogs(skill, attacker, null, `${attacker.name}は${skill.name}を使った！`);
  if (skill === SKILLS1["kiai"] || skill.name === "気合いだめ") {
    partyPoints.sp = Math.min(partyPoints.maxSp, partyPoints.sp + 5);
    addBattleLog(`パーティのSPが5上がった！`, null, true);
  }
  if (skill.effect && skill.effect.stat === "attack") {
    const amount = skill.effect.amount;
    const turns = skill.effect.turns;
    addBattleLog(`${attacker.name}の攻撃力が上がった！`, null, true, null, () => {
      attacker.buffs.attack = { amount: amount, turnsLeft: turns };
    });
  }
}

// スキルキーから対応する配列を探して返すヘルパー関数
// MAGICS→SKILLS1→SKILLS2→COMBOS→ULTIMATESの順に検索する
function findSkill(skillKey) {
  return MAGICS[skillKey] || SKILLS1[skillKey] || SKILLS2[skillKey] || COMBOS[skillKey] || ULTIMATES[skillKey] || null;
}

function calcEnemyDamage(enemy, member, skill) {
  const power = (skill && skill.power !== undefined) ? skill.power : 10;
  if (power === 0) return 0;
  const baseAtk = (skill && skill.type === "magical") ?
    (enemy.magicAttack || 0) : (enemy.attack || 0);
  const defVal = (skill && skill.type === "magical") ?
    (member.magicDefense || 0) : (member.defense || 0);
  
  const levelRate = Math.max(0.3, Math.min(3.0, (enemy.level || 1) / member.level));
  const rand = 0.85 + Math.random() * 0.30;
  const elementRate = getElementRate(skill ? skill.element : null, member.element);
  
  const raw = baseAtk * (power / 10) * levelRate * rand;
  if (elementRate < 0) return -(Math.max(1, Math.floor(raw - defVal * 0.806)));
  if (elementRate === 0) return 0;
  return Math.max(1, Math.floor(raw * elementRate - defVal * 0.806));
}

function calcDamage(attacker, defender, skill, isCritical = false) {
  const power = (skill && skill.power !== undefined) ? skill.power : 10;
  if (power === 0) return 0;
  const baseAtk = (skill && skill.type === "magical") ?
    (attacker.magicAttack || 0) : (attacker.attack || 0);
  const defVal = (skill && skill.type === "magical") ?
    (defender.magicDefense || 0) : (defender.defense || 0);
  
  const buffRate = (attacker.buffs && attacker.buffs.attack) ?
    attacker.buffs.attack.amount : 1.0;
  const rageRate = (attacker.statusEffects && attacker.statusEffects.some(s => s.type === "rage")) ? 1.1 : 1.0;
  const levelRate = Math.max(0.3, Math.min(3.0, attacker.level / (defender.level || 1)));
  const rand = 0.85 + Math.random() * 0.30;
  const critRate = isCritical ? 1.5 : 1.0;
  const elementRate = getElementRate(skill ? skill.element : null, defender.element);
  
  const raw = baseAtk * (power / 10) * levelRate * buffRate * rageRate * rand * critRate;
  if (elementRate < 0) return -(Math.max(1, Math.floor(raw - defVal * 0.806)));
  if (elementRate === 0) return 0;
  return Math.max(1, Math.floor(raw * elementRate - defVal * 0.806));
}

function selectTopCommand() {
  if (battleParty[currentCommandIndex].hp <= 0) {
    nextCharacterCommand();
    return;
  }
  if (topCursor === 0) {
    // たたかう → コマンド選択へ
    battlePhase = "command";
  } else if (topCursor === 1) {
    // どうぐ → 未実装
    addBattleLog("まだどうぐは使えない！", null, true);
    isBattleLog = true;
    currentLogIndex = 0;
    afterLogAction = "reselect_top";
    draw();
    return;
  } else if (topCursor === 2) {
    // パーティの素早さ合計 vs 敵の素早さ合計
    const partySpeed = battleParty.reduce(function(sum, m) {
      return sum + (m.hp > 0 ? (m.speed || 0) : 0);
    }, 0);
    const enemySpeed = currentEnemies.reduce(function(sum, e) {
      return sum + (e.speed || 0);
    }, 0);
    
    if (partySpeed > enemySpeed) {
      addBattleLog("うまく逃げ切った！", null, true);
      isBattleLog = true;
      currentLogIndex = 0;
      afterLogAction = "escape";
    } else {
      addBattleLog("逃げられなかった！", null, true);
      isBattleLog = true;
      currentLogIndex = 0;
      afterLogAction = "reselect_top";
    }
    draw();
    return;
  } else if (topCursor === 3) {
    // 観察 → ターゲット選択へ
    battlePhase = "observe";
    targetCursor = 0;
    draw();
    return;
  }
  draw();
}

function observeEnemy() {
  const enemy = currentEnemies[targetCursor];
  if (!enemy) return;
  const element = enemy.element || "なし";
  addBattleLog(`名前:${enemy.label || enemy.name}　属性:${element}`, null, true);
  const ratio = enemy.hp / enemy.maxHp;
  let status;
  if (ratio >= 1.0) status = `${enemy.label || enemy.name}はピンピンしている！`;
  else if (ratio >= 0.75) status = `${enemy.label || enemy.name}はなんとも言えない表情をしている！`;
  else if (ratio >= 0.50) status = `${enemy.label || enemy.name}は少し疲れているようだ…`;
  else if (ratio >= 0.25) status = `${enemy.label || enemy.name}は弱っている！`;
  else status = `${enemy.label || enemy.name}は今にも倒れそうだ！`;
  addBattleLog(status, null, true);
  isBattleLog = true;
  currentLogIndex = 0;
  afterLogAction = "reselect_top";
  draw();
}

function startGameOver() {
  stopBgm()
  playSe('/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/Logic/Sound/SE/死亡音.mp3')
  addBattleLog("ざぁーこ♡ざぁーこ♡", null, true);
  addBattleLog("こんなので負けちゃうなんて弱すぎでしょw", null, true);
  isBattleLog = true;
  currentLogIndex = 0;
  afterLogAction = "gameover";
  draw();
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

function confirmAllyTarget() {
  selectedCommands[currentCommandIndex].target = battleParty[targetCursor];
  nextCharacterCommand();
  draw();
}

function formatLog(text, attacker, target) {
  if (!text) return text;
  return text
    .replace(/self/g, attacker ? attacker.name : "")
    .replace(/enemy/g, target ? target.label || target.name : "");
}

// battleLog の / 区切りを処理してaddBattleLogに追加する
// 先頭が / なら基本ログを先に出す
function addSkillLogs(skill, attacker, target, basicLog) {
  const log = skill.battleLog;
  if (!log) {
    // battleLogなし→基本ログだけ
    addBattleLog(basicLog, target || null, !target);
    return;
  }
  if (log.startsWith("/")) {
    // 先頭/→基本ログ表示後、次ページに特殊ログ
    addBattleLog(basicLog, target || null, !target);
    addBattleLog(formatLog(log.slice(1), attacker, target), null, true);
  } else {
    // 途中/→/で分割してページ送り
    const parts = log.split("/");
    addBattleLog(basicLog, target || null, !target);
    parts.forEach(function(part) {
      if (part.trim()) addBattleLog(formatLog(part, attacker, target), null, true);
    });
  }
}

function calcCritical(attacker, skill) {
  if (!skill || skill.type !== "physical") return false;
  const baseRate = 0.05;
  const bonus = skill.critBonus || 0;
  return Math.random() < baseRate + bonus;
}

function calcDodge(attacker, defender) {
  // 比率型：相手より素早いほど回避率上昇、上限50%
  const rate = Math.min(0.5, Math.max(0, (defender.speed / (attacker.speed || 1) - 1) * 0.2));
  return Math.random() < rate;
}

function applyStatusEffect(target, effect) {
  if (!effect) return;
  if (Math.random() > effect.chance) return;
  // 既に同じ状態異常があればターンリセット
  const existing = target.statusEffects.find(function(s) { return s.type === effect.type; });
  const defaultTurns = { burn: 3, shock: 5, rage: 5 };
  const turns = defaultTurns[effect.type] || 3;
  if (existing) { existing.turnsLeft = turns; return; }
  target.statusEffects.push({ type: effect.type, turnsLeft: turns });
}

function processStatusEffects(target, isEnemy) {
  if (!target.statusEffects || target.statusEffects.length === 0) return false;
  let skip = false;
  target.statusEffects = target.statusEffects.filter(function(s) {
    if (s.type === "burn") {
      const dmg = Math.max(1, Math.floor(target.maxHp * 0.05));
      addBattleLog(`${target.label || target.name}は火傷で${dmg}ダメージ！`, null, true, null, () => {
        target.hp = Math.max(0, target.hp - dmg);
      });
    } else if (s.type === "shock") {
      if (Math.random() < 0.5) {
        addBattleLog(`${target.label || target.name}は感電して動けない！`, null, true);
        skip = true;
      }
    } else if (s.type === "rage") {
      // 怒りはターン処理なし（バフとして乗ってるだけ）
    }
    s.turnsLeft--;
    return s.turnsLeft > 0;
  });
  return skip;
}

const ELEMENT_CHART = {
  fire: { weak: ["ice"], resist: ["fire"], nullify: [], absorb: ["wind"] },
  ice: { weak: ["fire"], resist: ["ice", "wind"], nullify: [], absorb: [] },
  electro: { weak: ["wind", "muscle"], resist: ["electro"], nullify: [], absorb: [] },
  wind: { weak: ["electro"], resist: ["wind", "ice"], nullify: [], absorb: [] },
  light: { weak: ["dark", "psychic"], resist: ["light"], nullify: [], absorb: ["light"] },
  dark: { weak: ["light", "legacy"], resist: ["dark"], nullify: [], absorb: ["dark"] },
  magic: { weak: ["psychic"], resist: ["magic"], nullify: [], absorb: [] },
  psychic: { weak: ["magic", "legacy"], resist: ["psychic"], nullify: ["physic"], absorb: [] },
  legacy: { weak: ["magic"], resist: ["legacy", "light"], nullify: ["psychic"], absorb: [] },
  physic: { weak: ["muscle", "vector"], resist: [], nullify: ["psychic"], absorb: [] },
  muscle: { weak: ["physic"], resist: ["muscle"], nullify: [], absorb: ["electro"] },
  vector: { weak: [], resist: [], nullify: ["fire", "ice", "electro", "wind", "light", "dark", "magic", "psychic", "legacy", "muscle"], absorb: ["physic"] },
};

function getElementRate(skillElement, defenderElement) {
  if (!skillElement || !defenderElement) return 1.0;
  const chart = ELEMENT_CHART[defenderElement];
  if (!chart) return 1.0;
  if (chart.absorb.includes(skillElement)) return -1.0; // 吸収
  if (chart.nullify.includes(skillElement)) return 0.0; // 無効
  if (chart.weak.includes(skillElement)) return 2.0; // 弱点
  if (chart.resist.includes(skillElement)) return 0.5; // 耐性
  return 1.0;
}