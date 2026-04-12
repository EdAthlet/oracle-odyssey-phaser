const config = {
    type: Phaser.AUTO,
    width: 1100,
    height: 720,
    backgroundColor: '#0a0c1c',
    scene: [MenuScene, Level_01_KeyboardCPU, Level_02_ImprovedKeyboard, Level_03_KeyPressToBinary, Level_04_PC_Boot, Level_04_1_BinaryThroughLogicGates]
};

const game = new Phaser.Game(config);