function odysseyGoMenu() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "odyssey", action: "menu" }, "*");
    return true;
  }
  return false;
}

function odysseyGoInstance() {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "odyssey", action: "instance" }, "*");
    return true;
  }
  return false;
}

window.odysseyGoMenu = odysseyGoMenu;
window.odysseyGoInstance = odysseyGoInstance;
