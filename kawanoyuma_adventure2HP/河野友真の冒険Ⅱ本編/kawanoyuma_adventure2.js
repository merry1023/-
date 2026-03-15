const buttons = {
  "btn-startgame": function() {
    window.location.href = '/河野友真の冒険Ⅱ本編/河野友真の冒険Ⅱ/kawano_adv2.html'
  },
  "btn-continuegame": function() {
    // つづきからの処理
  },
  "btn-information": function() {
    // おしらせの処理
    const modal = document.getElementById("modal-information");
    modal.style.display = "flex";
  },
  "btn-setting": function() {
    // 設定の処理
  },
  "btn-close-information": function() {
    document.getElementById("modal-information").style.display = "none";
  },
  "btn-setting": function() {
  const modal = document.getElementById("modal-setting");
  modal.style.display = "flex";
},
"btn-close-setting": function() {
  document.getElementById("modal-setting").style.display = "none";
},
};

for (const id in buttons) {
  document.getElementById(id).addEventListener("click", buttons[id]);
}