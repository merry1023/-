function setTile(x, y, layer, material) {
  if (layer === 1) {
    currentMap.layer1[y][x] = material;
  } else if (layer === 2) {
    currentMap.layer2[y][x] = material;
  } else if (layer === 3) {
    currentMap.layer3[y][x] = material;
  } else {
    currentMap.layer4[y][x] = material;
  }
  console.log(`${x},${y}を${layer}にて${TILES[material].name}に変更したにょん`)
  draw()
}

function fillTile(x1, y1, x2, y2, layer, material) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      if (layer === 1) {
        currentMap.layer1[y][x] = material;
      } else if (layer === 2) {
        currentMap.layer2[y][x] = material;
      } else if (layer === 3) {
        currentMap.layer3[y][x] = material;
      } else {
        currentMap.layer4[y][x] = material;
      }
    }
  }
  console.log(`${x1},${y1}から${x2},${y2}の範囲を${layer}レイヤーにて${TILES[material].name}で埋めたにょん`)
  draw()
}

function setPortal(x, y, destMap, destX, destY, type, locked, keyId) {
  const id = `${currentMap.name}_portal_${currentMap.portals.length}`;
  const linkedId = `${destMap}_portal_${MAPS[destMap].portals.length}`;
  
  currentMap.portals.push({
    id: id,
    x: x,
    y: y,
    destMap: destMap,
    destX: destX,
    destY: destY,
    type: type,
    locked: locked || false,
    keyId: keyId || null,
    linkedPortalId: type === "door" ? linkedId : null,
  });

  if (type === "door") {
    MAPS[destMap].portals.push({
      id: linkedId,
      x: destX,
      y: destY,
      destMap: currentMap.name,
      destX: x,
      destY: y,
      type: type,
      locked: locked || false,
      keyId: keyId || null,
      linkedPortalId: id,
    });
    currentMap.layer2[y][x] = 2;
    MAPS[destMap].layer2[destY][destX] = 2;
  } else {
    currentMap.layer2[y][x] = 19;
  }
  
  console.log(`${x},${y}にポータルを設置したにょん`)
  draw()
}

function removePortal(id) {
  const portal = currentMap.portals.find(function(p) {
    return p.id === id;
  });
  
  if (!portal) {
    console.log(`ID:${id}のポータルが見つからなかったにょん`)
    return;
  }

  if (portal.linkedPortalId) {
    const linkedMap = MAPS[portal.destMap];
    const linkedPortal = linkedMap.portals.find(function(p) {
      return p.id === portal.linkedPortalId;
    });
    if (linkedPortal) {
      linkedMap.layer2[linkedPortal.y][linkedPortal.x] = 0;
      linkedMap.portals = linkedMap.portals.filter(function(p) {
        return p.id !== portal.linkedPortalId;
      });
    }
  }

  currentMap.layer2[portal.y][portal.x] = 0;
  currentMap.portals = currentMap.portals.filter(function(p) {
    return p.id !== id;
  });

  console.log(`${id}のポータルを削除したにょん`)
  draw()
}

function setNPC(x, y, name) {
  currentMap.layer3[y][x] = 4;
  currentMap.npcs.push({
    name: name,
    x: x,
    y: y,
    messages: [{ text: "セリフを入力してちょ" }]
  });
  console.log(`${x},${y}に${name}を生み出したにょん`)
  draw()
}

function removeNPC(x, y, name) {
  if (currentMap.layer3[y][x] === 4) {
    currentMap.layer3[y][x] = 0;
  }
  currentMap.npcs = currentMap.npcs.filter(function(npc) {
    return npc.name !== name
  })
  console.log(`${y},${x}の${name}をこの世から抹消したにょん`)
  draw()
}

function exportMap(layer) {
  if (layer) {
    const target = currentMap[layer];
    const rows = target.map(row => `  [${row.join(", ")}]`);
    console.log(`const ${currentMap.name}_${layer} = [\n${rows.join(",\n")}\n];`);
  } else {
    exportMap("layer1");
    exportMap("layer2");
    exportMap("layer3");
    exportMap("layer4");
  }
}

function importCSV(csvString, layer) {
  const tileMap = {
    "-1": 0,
    "0": 23,
    "1": 18, // 壁
    "8": 17, // 水
    "32": 11, // 草
    "33": 14, // 砂漠
    "50": 22, // 森1（当たり判定あり）
    "52": 1, // 火山1
    "53": 1, // 火山2
    "54": 21, // 橋1
    "60": 1, // 火山3
    "61": 1, // 火山4
    "62": 21, // 橋2
    "72": 19, // 村（構造物）
    "73": 16, // 仮：山
    "80": 19, // 洞窟（構造物）
    "81": 11, // 草
    "82": 13, // 仮：森
    "88": 18, // 仮：岩
    "89": 18, // 仮：岩
    "90": 18, // 仮：岩
    "105": 21, // 崖1
  };
  
  const rows = csvString.trim().split('\n');
  const data = rows.map(function(row) {
    return row.split(',').map(function(n) {
      return tileMap[n.trim()] !== undefined ? tileMap[n.trim()] : 0;
    });
  });
  currentMap[layer] = data;
  draw();
  console.log(`CSVを${layer}にインポートしたにょん`);
}