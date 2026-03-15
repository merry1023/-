// エンカウント状態
let encounterRate = 0; // 現在のエンカウント率（0〜100）
let stepsSinceBattle = 0; // 戦闘後の歩数

// 現在地のリージョンを返す
function getCurrentRegion(map, x, y) {
  if (!map.regions) return null;
  return map.regions.find(function(r) {
    return x >= r.xMin && x <= r.xMax && y >= r.yMin && y <= r.yMax;
  }) || null;
}

// レベル±10で抽選対象を絞り、weightで選ぶ
function pickEncounterEnemy(region) {
  const playerLevel = allParty[0].level;
  const valid = region.enemies.filter(function(e) {
    const enemy = ENEMIES[e.id];
    return enemy && enemy.level <= playerLevel + 5; // 格上は+5まで、格下は制限なし
  });
  if (valid.length === 0) return null;
  
  const totalWeight = valid.reduce(function(sum, e) { return sum + e.weight; }, 0);
  let rand = Math.random() * totalWeight;
  for (const e of valid) {
    rand -= e.weight;
    if (rand <= 0) return e.id;
  }
  return valid[valid.length - 1].id;
}

// 1歩ごとに呼ぶ
function checkEncounter(map, x, y) {
  const region = getCurrentRegion(map, x, y);
  if (!region) return; // リージョン外はエンカウントなし
  
  if (stepsSinceBattle < 3) {
    stepsSinceBattle++;
    return;
  }
  
  encounterRate = Math.min(100, encounterRate + 5);
  
  if (Math.random() * 100 < encounterRate) {
    const enemyId = pickEncounterEnemy(region);
    if (!enemyId) return;
    encounterRate = 0;
    stepsSinceBattle = 0;
    // エンカウント！戦闘開始
    startBattleWithEnemy(region.enemies);
  }
}

// 戦闘後にリセット
function resetEncounter() {
  encounterRate = 0;
  stepsSinceBattle = 0;
}