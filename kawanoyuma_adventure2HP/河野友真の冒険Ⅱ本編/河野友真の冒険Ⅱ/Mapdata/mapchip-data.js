function createLayer(width, height, fill = 0) {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

const TILES = {
  0: {},
  1: { name: "木の壁", image: "wall.png", color: "brown", collision: true, trigger: null, triggerEnabled: false, battleBg: null },
  2: { name: "扉", image: "/河野友真の冒険Ⅱ本編/assets/img/door.png", collision: false, color: "brown", trigger: "changeMap", triggerEnabled: true, battleBg: null },
  3: { name: "屋根", image: "", color: "darkred", collision: false, trigger: null, triggerEnabled: false, battleBg: null },
  4: { name: "NPC", image: "", color: "blue", collision: false, trigger: null, triggerEnabled: false, battleBg: null },
  5: { name: "木の床", image: "", color: "peru", collision: false, trigger: null, triggerEnabled: false, battleBg: null },
  6: { name: "タンス", image: "", color: "saddlebrown", collision: true, trigger: "examine", triggerEnabled: true, battleBg: null },
  7: { name: "タル", image: "", color: "burlywood", collision: true, trigger: "examine", triggerEnabled: true, battleBg: null },
  8: { name: "椅子", image: "", color: "tan", collision: true, trigger: null, triggerEnabled: false, battleBg: null },
  9: { name: "机", image: "", color: "tan", collision: true, trigger: null, triggerEnabled: false, battleBg: null },
  10: { name: "無", image: "", color: "black", collision: true, trigger: null, triggerEnabled: false, battleBg: null },
  11: { name: "草", image: "grass.png", color: "green", collision: false, battleBg: "field" },
  12: { name: "草原", image: "", color: "lightgreen", collision: false, trigger: null, triggerEnabled: false, battleBg: "field" },
  13: { name: "森", image: "", color: "darkgreen", collision: true, trigger: null, triggerEnabled: false, battleBg: "forest" },
  14: { name: "砂漠", image: "", color: "sandybrown", collision: false, trigger: null, triggerEnabled: false, battleBg: "desert" },
  15: { name: "雪原", image: "", color: "aliceblue", collision: false, trigger: null, triggerEnabled: false, battleBg: "snow" },
  16: { name: "山", image: "", color: "gray", collision: true, trigger: null, triggerEnabled: false, battleBg: "mountain" },
  17: { name: "水", image: "", color: "dodgerblue", collision: true, trigger: null, triggerEnabled: false, battleBg: "water" },
  18: { name: "岩", image: "", color: "dimgray", collision: true, trigger: null, triggerEnabled: false, battleBg: "rock" },
  19: { name: "構造物", image: "", color: "gold", collision: false, trigger: "enterLocation", triggerEnabled: true, battleBg: null },
  20: { name: "橋", image: "", color: "peru", collision: false, trigger: null, triggerEnabled: false, battleBg: "field" },
  21: { name: "仮", image: "", color: "purple", collision: false, trigger: null, triggerEnabled: false, battleBg: "field" },
  22: { name: "森1", image: "", color: "darkgreen", collision: true, trigger: null, triggerEnabled: false, battleBg: "forest" },
  23: { name: "森2", image: "", color: "forestgreen", collision: false, trigger: null, triggerEnabled: false, battleBg: "forest" },
};