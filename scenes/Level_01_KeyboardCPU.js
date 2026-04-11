class Level_01_KeyboardCPU extends Phaser.Scene {
    constructor() { super('Level_01_KeyboardCPU'); }
    create() {
        this.typedText = '';

        this.add.rectangle(250, 520, 260, 140, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(250, 580, 'KEYBOARD (Input)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.add.rectangle(550, 380, 200, 130, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(550, 440, 'CPU (Process)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.add.rectangle(850, 280, 220, 220, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(850, 420, 'MONITOR (Display)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.hero = this.add.circle(300, 480, 25, 0x00ccff);
        this.add.rectangle(285, 445, 30, 18, 0xff4444);

        this.monitorText = this.add.text(780, 240, 'You typed: ', { fontSize: '20px', color: '#00ff8c' });

        this.add.text(30, 30, 'Level 01 - Keyboard → CPU → Display', { fontSize: '24px', color: '#ffff44' });

        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Escape') this.scene.start('MenuScene');
            if (/[a-zA-Z0-9 -_]/.test(e.key)) {
                this.typedText += e.key.toUpperCase();
                this.monitorText.setText('You typed: ' + this.typedText.slice(-25));
            }
        });
    }
}