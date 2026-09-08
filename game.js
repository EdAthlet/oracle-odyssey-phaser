const SCENES = [
  MenuScene,
  Level_01_KeyboardCPU,
  Level_02_ImprovedKeyboard,
  Level_03_KeyPressToBinary,
  Level_04_PC_Boot,
  Level_04_1_BinaryThroughLogicGates,
  Level_06_TheInstance,
];

const params = new URLSearchParams(window.location.search);
const startKey = params.get("scene") || "MenuScene";
const startIndex = SCENES.findIndex((S) => S.name === startKey);
if (startIndex > 0) {
  const [hit] = SCENES.splice(startIndex, 1);
  SCENES.unshift(hit);
}

const config = {
  type: Phaser.AUTO,
  width: 1100,
  height: 720,
  backgroundColor: "#0a0c1c",
  parent: "game",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: SCENES,
};

window.odysseyGame = new Phaser.Game(config);
