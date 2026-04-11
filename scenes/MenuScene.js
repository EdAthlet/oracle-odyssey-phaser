class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        this.add.text(550, 160, 'ORACLE ODYSSEY', { fontSize: '64px', fontStyle: 'bold', color: '#00ff8c' }).setOrigin(0.5);
        this.add.text(550, 250, 'From Bits to Cloud', { fontSize: '32px', color: '#00ccff' }).setOrigin(0.5);
        this.add.text(550, 360, 'Press 1 → Level 01\nPress 2 → Level 02', {
            fontSize: '28px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ONE', () => this.scene.start('Level_01_KeyboardCPU'));
        this.input.keyboard.on('keydown-TWO', () => this.scene.start('Level_02_ImprovedKeyboard'));
    }
}