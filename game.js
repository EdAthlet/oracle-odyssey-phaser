const config = {
    type: Phaser.AUTO,
    width: 1100,
    height: 720,
    backgroundColor: '#0a0c1c',
    scene: [MenuScene, Level_01_KeyboardCPU, Level_02_ImprovedKeyboard]
};

const game = new Phaser.Game(config);