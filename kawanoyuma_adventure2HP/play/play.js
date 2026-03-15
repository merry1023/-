function checkPassward() {
  const input = document.getElementById("pass").value;
  if (input === "Pocky") {
    window.location.href = "/河野友真の冒険Ⅱ本編/kawanoyuma_adventure2.html" ;
  } else {
    alert("パスワードが違うのねん！入力しなおして欲しいのねん！");
  }
  // Tab to edit
}