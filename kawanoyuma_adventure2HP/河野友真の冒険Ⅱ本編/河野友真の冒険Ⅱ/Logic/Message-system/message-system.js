let currentNPC = null;
let currentMessageIndex = 0;
let currentChoiceIndex = 0;

function drawMessageBox() {
  const boxHeight = canvas.height * 0.3;
  const boxY = canvas.height - boxHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, boxY, canvas.width, boxHeight);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, boxY, canvas.width, boxHeight);
  ctx.beginPath();
  ctx.moveTo(0, boxY + 30);
  ctx.lineTo(canvas.width, boxY + 30);
  ctx.stroke();
}
let allmessage = "";
let message_i = 0;
let istalked = false;

let timer = null;

let currentName = "";

function startMessage(npc) {
  currentNPC = npc;
  currentMessageIndex = 0;
  currentName = npc.name;
  allmessage = npc.messages[0].text;
  message_i = 0;
  istalked = true;
  
  timer = setInterval(function() {
    message_i++;
    if (message_i >= allmessage.length) {
      clearInterval(timer);
    }
    draw();
  }, 100);
}

function drawMessageText(name, text, hasChoices) {
  const boxHeight = canvas.height * 0.3;
  const boxY = canvas.height - boxHeight;
  
  ctx.fillStyle = "white";
  ctx.font = "16px 'JF-Dot-K12'";
  
  // 名前
  ctx.fillText(name, 20, boxY + 20);
  
  // 選択肢があるかどうかで幅を変える
  const maxWidth = hasChoices ? canvas.width / 3 * 2 - 40 : canvas.width - 40;
  
  // 本文を自動改行
  const lines = wrapText(text, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 20, boxY + 50 + i * 20);
  }
}

function wrapText(text, maxWidth) {
  const chars = text.split("");
  let line = "";
  let lines = [];
  
  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i];
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth) {
      lines.push(line);
      line = chars[i];
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
}

function drawChoices(choices) {
  const choicesX = canvas.width / 3 * 2;
  const boxHeight = canvas.height * 0.3;
  const boxY = canvas.height - boxHeight;
  ctx.fillStyle = "white";
  ctx.font = "16px 'JF-Dot-K12'";
  for (let i = 0; i < choices.length; i++) {
    const prefix = i === currentChoiceIndex ? "▶ " : "　";
    ctx.fillText(prefix + choices[i].text, choicesX + 20, boxY + 50 + i * 30);
  }
}

function showMessage(text) {
  currentMessageIndex = 0;
  currentName = "";
  allmessage = text
  message_i = 0;
  istalked = true;
  
  timer = setInterval(function() {
    message_i++;
    if (message_i >= allmessage.length) {
      clearInterval(timer);
    }
    draw();
  }, 100);
}