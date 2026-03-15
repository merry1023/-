const allParty = [
{
  name: "河野友真",
  level: 1,
  exp: 0,
  hp: 10,
  maxHp: 10,
  mp: 0,
  maxMp: 0,
  tp: 0,
  maxTp: 200,
  attack: 7,
  defense: 2,
  magicAttack: 0,
  magicDefense: 2,
  speed: 3,
  // 習得済みスキル（コマンド枠ごとに管理）
  // learnType: "level" → レベルアップで自動習得
  // learnType: "event" → learnSkill() を呼んで手動習得
  skills: {
    magic: [], // 魔法（MP消費）
    special1: ["kiai"], // 特技1（TP消費）
    special2: [], // 特技2（MP消費）
    chain: [], // 連携（SP消費）
    ultimate: [], // 必殺（UP消費）
  },
  buffs: { attack: { amount: 1.0, turnsLeft: 0 } },
  portrait: null,
  statusEffects: []
  
},
{
  name: "東由絃",
  level: 1,
  exp: 0,
  hp: 20,
  maxHp: 20,
  mp: 0,
  maxMp: 0,
  tp: 0,
  maxTp: 200,
  attack: 11,
  defense: 5,
  magicAttack: 0,
  magicDefense: 2,
  speed: 7,
  skills: {
    magic: [],
    special1: ["kiai"],
    special2: [],
    chain: [],
    ultimate: [],
  },
  buffs: { attack: { amount: 1.0, turnsLeft: 0 } },
  portrait: "/河野友真の冒険Ⅱ本編/assets/img/yukihiro_idle.png",
  statusEffects: []
},
{
  name: "益田妃夏璃",
  level: 1,
  exp: 0,
  hp: 10,
  maxHp: 10,
  mp: 10,
  maxMp: 10,
  tp: 0,
  maxTp: 200,
  attack: 6,
  defense: 5,
  magicAttack: 4,
  magicDefense: 4,
  speed: 4,
  skills: {
    magic: [],
    special1: ["kiai"],
    special2: [],
    chain: [],
    ultimate: [],
  },
  buffs: { attack: { amount: 1.0, turnsLeft: 0 } },
  portrait: null,
  statusEffects: []
},
{
  name: "沖泰輔",
  level: 1,
  exp: 0,
  hp: 10,
  maxHp: 10,
  mp: 10,
  maxMp: 10,
  tp: 0,
  maxTp: 200,
  attack: 8,
  defense: 2,
  magicAttack: 0,
  magicDefense: 1,
  speed: 3,
  skills: {
    magic: [],
    special1: ["kiai"],
    special2: [],
    chain: [],
    ultimate: [],
  },
  buffs: { attack: { amount: 1.0, turnsLeft: 0 } },
  portrait: null,
  statusEffects: []
}, ];

const partyPoints = {
  sp: 0,
  maxSp: 100,
  up: 0,
  maxUp: 100,
};

let battleParty = [];

// スキル習得関数
// learnType: "level" はレベルアップ時に自動で呼ばれる
// learnType: "event" はイベントなどから手動で呼ぶ
// 必要経験値の計算（案1：シンプル二乗）
// level^2 * 15 でなだらかに重くなるカーブ
function expToNextLevel(level) {
  return Math.floor(level * level * 15);
}

// レベルアップ時のステータス成長
// SP・UP・TPのMAXは100固定なので変えない
// キャラごとに成長率を変えたいときはgrowthTableを調整する
function applyLevelUpStats(member) {
  // キャラ名ごとの成長率テーブル
  // 由絃ATK Lv150で約800を基準に調整済み（S字曲線 level^1.5）
  const growthTable = {
    "河野友真": { hp: 5.3, mp: 3.2, attack: 2.1, defense: 2.1, magicAttack: 2.1, magicDefense: 2.1, speed: 2.1 },
    "東由絃": { hp: 8.46, mp: 1.06, attack: 5.29, defense: 3.17, magicAttack: 1.06, magicDefense: 1.06, speed: 4.23 },
    "益田妃夏璃": { hp: 3.17, mp: 7.41, attack: 1.06, defense: 1.06, magicAttack: 4.23, magicDefense: 4.23, speed: 3.17 },
    "沖泰輔": { hp: 4.23, mp: 3.17, attack: 3.17, defense: 1.06, magicAttack: 3.17, magicDefense: 7.41, speed: 2.11 },
  };
  
  const growth = growthTable[member.name] || { hp: 5, mp: 2, attack: 1, defense: 1, magicAttack: 1, magicDefense: 1, speed: 1 };
  
  // S字曲線：今のレベルと1つ前のレベルの差分を計算
  // (lv^1.5 - (lv-1)^1.5) / 149^1.5 * 149 で1レベルあたりの増加量を算出
  const lv = member.level;
  const maxLv = 149;
  const curve = lv <= 1 ? 0 :
    (Math.pow(lv - 1, 1.5) - Math.pow(lv - 2, 1.5)) / Math.pow(maxLv, 1.5) * maxLv;
  
  function gain(g) { return Math.max(1, Math.floor(g * curve)); }
  
  member.maxHp += gain(growth.hp);
  member.hp += gain(growth.hp);
  if (member.hp > member.maxHp) member.hp = member.maxHp;
  
  member.maxMp += gain(growth.mp);
  member.mp += gain(growth.mp);
  if (member.mp > member.maxMp) member.mp = member.maxMp;
  
  member.attack += gain(growth.attack);
  member.defense += gain(growth.defense);
  member.magicAttack += gain(growth.magicAttack);
  member.magicDefense += gain(growth.magicDefense);
  member.speed += gain(growth.speed);
}

// 経験値を加算してレベルアップを処理する関数
// gainExp(member, 取得経験値) の形で呼ぶ
// ログは返り値の配列で返す（表示タイミングをbattle.js側で制御するため）
function gainExp(member, exp) {
  const logs = []; // このメンバーのレベルアップ・スキル習得ログをまとめる配列
  
  member.exp += exp;
  
  // 必要経験値を超えた分だけループ（一気に複数レベルアップも対応）
  while (member.exp >= expToNextLevel(member.level)) {
    const oldLevel = member.level;
    member.exp -= expToNextLevel(member.level); // 超えた分を次レベルへ繰り越し
    member.level++;
    
    // レベルアップログを配列に追加（addBattleLogは呼ばない）
    logs.push(`${member.name}はLv${oldLevel}→Lv${member.level}になった！`);
    
    
    // ステータス成長（SP/UP/TPのMAXは固定なので上げない）
    applyLevelUpStats(member);
    
    // スキル習得チェック（習得ログも返り値に含める）
    const skillLogs = checkLevelUpSkills(member);
    skillLogs.forEach(function(log) { logs.push(log); });
  }
  
  return logs; // ログ配列を返す
  
}

// スキル習得関数
// learnType: "level" はレベルアップ時に自動で呼ばれる
// learnType: "event" はイベントなどから手動で呼ぶ
// スキルを習得してログ文字列を返す（addBattleLogは呼ばない）
function learnSkill(member, skillKey, slot) {
  const skill = findSkill(skillKey);
  if (!skill) return null;
  if (member.skills[slot].includes(skillKey)) return null; // 習得済みはスキップ
  member.skills[slot].push(skillKey);
  return `${member.name}は${skill.name}を覚えた！`; // ログ文字列を返す
}

// レベルアップ時に呼ぶ（河野友真専用。他メンバーは後々追加）
// 習得したスキルのログ配列を返す
function checkLevelUpSkills(member) {
  if (member.name !== "河野友真") return [];
  
  const logs = [];
  
  // 各配列とスロット名の対応表
  const learnSources = [
    { dict: MAGICS, slot: "magic" },
    { dict: SKILLS1, slot: "special1" },
    { dict: SKILLS2, slot: "special2" },
    { dict: COMBOS, slot: "chain" },
    { dict: ULTIMATES, slot: "ultimate" },
  ];
  
  // 全配列をループして習得条件を満たしたスキルを習得
  learnSources.forEach(function(source) {
    for (const skillKey in source.dict) {
      const skill = source.dict[skillKey];
      if (!skill.learnType || skill.learnType !== "level") continue;
      if (member.level >= skill.learnLevel) {
        const log = learnSkill(member, skillKey, source.slot);
        if (log) logs.push(log); // 習得できた場合だけログを追加
      }
    }
  });
  
  return logs; // ログ配列を返す
}

// =============================================
// デバッグ用関数
// =============================================

// 指定した名前のメンバーをレベルに上げる
// コンソールで setLevel("河野友真", 50) のように使う
function setLevel(name, targetLevel) {
  // allPartyから名前で検索
  const member = allParty.find(function(m) { return m.name === name; });
  if (!member) {
    console.log(`「${name}」というメンバーは見つからないにょん`);
    return;
  }
  
  const startLevel = member.level;
  member.level = targetLevel;
  member.exp = 0; // そのレベルの経験値0からスタート
  
  // レベル差分だけステータス成長を適用
  for (let i = startLevel; i < targetLevel; i++) {
    applyLevelUpStats(member);
  }
  
  // スキルをリセットしてレベル分まとめて習得チェック
  member.skills = { magic: [], special1: [], special2: [], chain: [], ultimate: [] };
  checkLevelUpSkills(member);
  
  console.log(`${member.name}をLv${targetLevel}にしたにょん`);
  console.log(`習得スキル:`, member.skills);
}

// 現在のパーティ状態をコンソールに表示
function debugParty() {
  allParty.forEach(function(m) {
    console.log(`[${m.name}] Lv${m.level} EXP:${m.exp}/${expToNextLevel(m.level)}`);
    console.log(`  スキル:`, m.skills);
  });
}