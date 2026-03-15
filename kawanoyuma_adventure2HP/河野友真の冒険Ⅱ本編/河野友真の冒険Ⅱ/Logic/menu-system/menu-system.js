let isMenuOpen = false;
let menuCursorX = 0;
let menuCursorY = 0;
let currentMenuScreen = "main"; // "main" / "status" / "skill_field"
let statusCursor = 0;

// 立ち絵画像キャッシュ
const portraitCache = {};

function getPortrait(src) {
  if (!src) return null;
  if (!portraitCache[src]) {
    const img = new Image();
    img.onload = function() { draw(); };
    img.src = src;
    portraitCache[src] = img;
  }
  return portraitCache[src];
}

const MENU_ITEMS = [
  ["ステータス",       "魔法/特技"],
  ["スキル",           "アイテム"],
  ["装備",             "地図"],
  ["魔物図鑑",         "称号"],
  ["クエストログ",     "パーティ編成"],
  ["旅の日記を記す",   "旅の日記を読む"],
];

const MENU_DESCRIPTIONS = [
  ["パーティメンバーのステータスを確認する", "魔法・特技をフィールドで使用する"],
  ["スキルポイントを振り分ける", "アイテムを使用・確認する"],
  ["装備を変更する", "現在地周辺の地図を見る"],
  ["討伐した魔物を確認する", "獲得した称号を確認する"],
  ["クエストの進行状況を確認する", "パーティの編成を変更する"],
  ["冒険の記録を日記に記す", "日記に記された冒険を読み返す"],
];

// メニューウィンドウの基本パラメータ（左に20%ずらす）
function getMenuRect() {
  const w = canvas.width * 0.7;
  const h = canvas.height * 0.7;
  const x = (canvas.width - w) / 2 - canvas.width * 0.1;
  const y = (canvas.height - h) / 2;
  return { x, y, w, h };
}

// 説明欄のパラメータ
function getDescRect() {
  const menu = getMenuRect();
  const x = menu.x + menu.w + 10;
  const w = canvas.width * 0.2 - 10;
  const y = menu.y;
  const h = menu.h;
  return { x, y, w, h };
}

function openMenu() {
  isMenuOpen = true;
  currentMenuScreen = "main";
  menuCursorX = 0;
  menuCursorY = 0;
  draw();
}

function closeMenu() {
  isMenuOpen = false;
  draw();
}

function drawMenu() {
  if (currentMenuScreen === "status") {
    drawStatusMenu();
  } else if (currentMenuScreen === "skill_field") {
    drawSkillFieldMenu();
  } else {
    drawMainMenu();
  }
}

function drawDescPanel(text) {
  const { x, y, w, h } = getDescRect();
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  if (!text) return;
  ctx.fillStyle = "white";
  ctx.font = "12px 'JF-Dot-K12'";

  // テキスト折り返し
  const maxW = w - 16;
  const words = text.split("");
  let line = "";
  let lineY = y + 20;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    if (ctx.measureText(testLine).width > maxW && line !== "") {
      ctx.fillText(line, x + 8, lineY);
      line = words[i];
      lineY += 18;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x + 8, lineY);
}

function drawMainMenu() {
  const { x, y, w, h } = getMenuRect();

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  const colW = w / 2;
  const rowH = h / 6;

  ctx.font = "14px 'JF-Dot-K12'";
  MENU_ITEMS.forEach(function(row, rowIndex) {
    row.forEach(function(item, colIndex) {
      const itemX = x + colW * colIndex + 20;
      const itemY = y + rowH * rowIndex + rowH / 2 + 6;

      if (menuCursorX === colIndex && menuCursorY === rowIndex) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x + colW * colIndex, y + rowH * rowIndex, colW, rowH);
        ctx.fillStyle = "yellow";
      } else {
        ctx.fillStyle = "white";
      }
      ctx.fillText(item, itemX, itemY);
    });
  });

const desc = MENU_DESCRIPTIONS[menuCursorY][menuCursorX];
drawDescPanel(desc);
}

function drawStatusMenu() {
  const { x, y, w, h } = getMenuRect();

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  const member = allParty[statusCursor];

  // 立ち絵
  const portrait = getPortrait(member.portrait);
  if (portrait && portrait.complete) {
    const imgW = portrait.naturalWidth;
    const imgH = portrait.naturalHeight;
    const maxW = w / 2 - 20;
    const maxH = h - 20;
    const scale = Math.min(maxW / imgW, maxH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = x + (w / 2 - drawW) / 2;
    const drawY = y + (h - drawH) / 2;
    ctx.drawImage(portrait, drawX, drawY, drawW, drawH);
  }

  const sx = x + w / 2 + 10;
  ctx.fillStyle = "white";
  ctx.font = "14px 'JF-Dot-K12'";
  ctx.fillText(`${member.name}　Lv.${member.level}`, sx, y + 30);
  ctx.fillText(`HP　${member.hp} / ${member.maxHp}`, sx, y + 60);
  ctx.fillText(`MP　${member.mp} / ${member.maxMp}`, sx, y + 80);
  ctx.fillText(`TP　${member.tp} / ${member.maxTp}`, sx, y + 100);
  ctx.fillText(`攻撃力　　${member.attack}`, sx, y + 130);
  ctx.fillText(`防御力　　${member.defense}`, sx, y + 150);
  ctx.fillText(`魔法攻撃力　${member.magicAttack}`, sx, y + 170);
  ctx.fillText(`魔法防御力　${member.magicDefense}`, sx, y + 190);
  ctx.fillText(`素早さ　　${member.speed}`, sx, y + 210);
  ctx.fillText(`EXP　${member.exp} / ${expToNextLevel(member.level)}`, sx, y + 240);

  if (statusCursor > 0) {
    ctx.fillStyle = "white";
    ctx.fillText("◀", x + 10, y + h / 2);
  }
  if (statusCursor < allParty.length - 1) {
    ctx.fillStyle = "white";
    ctx.fillText("▶", x + w - 25, y + h / 2);
  }

  drawDescPanel(null);
}

// =============================================
// 魔法/特技フィールド使用画面
// =============================================
let skillMenuTab = 0;
let skillMenuRow = -1;
let fieldSkillPage = 0;
let skillMenuMsg = "";
const SKILL_FIELD_PAGE_SIZE = 6;

const SKILL_TABS = ["魔法", "特技1", "特技2"];
const SKILL_DICTS = [MAGICS, SKILLS1, SKILLS2];

function getFieldSkillList(member) {
  const dict = SKILL_DICTS[skillMenuTab];
  return Object.entries(dict).filter(function([key]) {
    return member.skills[["magic", "special1", "special2"][skillMenuTab]].includes(key);
  });
}

function drawSkillFieldMenu() {
  const { x, y, w, h } = getMenuRect();

  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  const member = allParty[0];
  const skills = getFieldSkillList(member);
  const pageSkills = skills.slice(fieldSkillPage * SKILL_FIELD_PAGE_SIZE, (fieldSkillPage + 1) * SKILL_FIELD_PAGE_SIZE);

  ctx.font = "14px 'JF-Dot-K12'";

  // タブ描画
  const tabW = w / 3;
  SKILL_TABS.forEach(function(tab, i) {
    const tx = x + tabW * i;
    if (skillMenuTab === i) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(tx, y, tabW, 30);
    }
    ctx.fillStyle = (skillMenuTab === i && skillMenuRow === -1) ? "yellow" : "white";
    ctx.fillText(tab, tx + 10, y + 20);
  });

  // 区切り線
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x + w, y + 30);
  ctx.stroke();

  // スキルリスト
  const listX = x + 10;
  const listY = y + 50;
  const rowH = (h - 60) / SKILL_FIELD_PAGE_SIZE;

  pageSkills.forEach(function([key, skill], i) {
    const iy = listY + rowH * i;
    const isSelected = skillMenuRow === i;
    if (isSelected) {
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(x, iy - 14, w, rowH);
      ctx.fillStyle = "yellow";
    } else {
      ctx.fillStyle = "white";
    }
    const costStr = skill.cost > 0 ? `${skill.cost}${skill.costType === "mp" ? "MP" : "TP"}` : "";
    ctx.fillText(skill.name, listX, iy);
    ctx.fillText(costStr, x + w - 60, iy);
  });

  // メッセージ
  if (skillMenuMsg) {
    ctx.fillStyle = "yellow";
    ctx.fillText(skillMenuMsg, x + 10, y + h - 15);
  }

  // ページ表示
  const maxPage = Math.ceil(skills.length / SKILL_FIELD_PAGE_SIZE);
  if (maxPage > 1) {
    ctx.fillStyle = "white";
    ctx.fillText(`${fieldSkillPage + 1} / ${maxPage}`, x + w - 50, y + h - 15);
  }

  // 説明欄
  let desc = null;
  if (skillMenuRow >= 0 && pageSkills[skillMenuRow]) {
    desc = pageSkills[skillMenuRow][1].description || null;
  }
  drawDescPanel(desc);
}

function skillFieldInput(key) {
  const member = allParty[0];
  const skills = getFieldSkillList(member);
  const maxPage = Math.ceil(skills.length / SKILL_FIELD_PAGE_SIZE);
  const pageSkills = skills.slice(fieldSkillPage * SKILL_FIELD_PAGE_SIZE, (fieldSkillPage + 1) * SKILL_FIELD_PAGE_SIZE);

  skillMenuMsg = "";

  if (skillMenuRow === -1) {
    if (key === "left")  { skillMenuTab = (skillMenuTab - 1 + 3) % 3; fieldSkillPage = 0; }
    if (key === "right") { skillMenuTab = (skillMenuTab + 1) % 3; fieldSkillPage = 0; }
    if (key === "down")  skillMenuRow = 0;
    if (key === "b")     currentMenuScreen = "main";
  } else {
    if (key === "up") {
      if (skillMenuRow === 0) skillMenuRow = -1;
      else skillMenuRow--;
    }
    if (key === "down") {
      if (skillMenuRow < pageSkills.length - 1) skillMenuRow++;
    }
    if (key === "left") {
      if (fieldSkillPage > 0) { fieldSkillPage--; skillMenuRow = 0; }
    }
    if (key === "right") {
      if (fieldSkillPage < maxPage - 1) { fieldSkillPage++; skillMenuRow = 0; }
    }
    if (key === "b") currentMenuScreen = "main";
    if (key === "a") {
      const entry = pageSkills[skillMenuRow];
      if (entry) {
        const [, skill] = entry;
        if (skill.type === "heal") {
          // 後々回復処理を実装
        } else {
          skillMenuMsg = "ここで使っても意味が無い！";
        }
      }
    }
  }
  draw();
}

function menuInput(key) {
  if (currentMenuScreen === "status") {
    if (key === "left")  statusCursor = Math.max(0, statusCursor - 1);
    if (key === "right") statusCursor = Math.min(allParty.length - 1, statusCursor + 1);
    if (key === "b")     currentMenuScreen = "main";
    draw();
    return;
  }
  if (currentMenuScreen === "skill_field") {
    skillFieldInput(key);
    return;
  }

  if (key === "up")    menuCursorY = (menuCursorY - 1 + 6) % 6;
  if (key === "down")  menuCursorY = (menuCursorY + 1) % 6;
  if (key === "left")  menuCursorX = 0;
  if (key === "right") menuCursorX = 1;
  if (key === "b" || key === "m") closeMenu();
  if (key === "a") selectMenuItem();
  draw();
}

function selectMenuItem() {
  const item = MENU_ITEMS[menuCursorY][menuCursorX];
  if (item === "ステータス") {
    currentMenuScreen = "status";
    statusCursor = 0;
    draw();
  }
  if (item === "魔法/特技") {
    currentMenuScreen = "skill_field";
    skillMenuTab = 0;
    skillMenuRow = -1;
    fieldSkillPage = 0;
    skillMenuMsg = "";
    draw();
  }
}
