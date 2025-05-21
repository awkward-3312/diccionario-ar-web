function toggleModo() {
  const esClaro = document.body.classList.toggle("light-mode");
  localStorage.setItem("modoClaro", esClaro ? "1" : "0");
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("modoClaro") === "1") {
    document.body.classList.add("light-mode");
  }
});
