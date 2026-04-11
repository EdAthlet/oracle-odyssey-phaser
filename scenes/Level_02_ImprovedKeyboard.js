class Level_02_ImprovedKeyboard extends Phaser.Scene {
    constructor() { super('Level_02_ImprovedKeyboard'); }
    create() {
        this.typedText = '';
        this.startTime = this.time.now;

        // Keyboard with keys
        this.add.rectangle(250, 520, 260, 140, 0x23334a).setStrokeStyle(4, 0x00ccff);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 9; j++) {
                const x = 195 + j * 27;
                const y = 495 + i * 28;
                this.add.rectangle(x, y, 23, 21, 0x3c415a).setStrokeStyle(2, 0xffffff);
            }
        }
        this.add.text(250, 580, 'KEYBOARD (Input)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.add.rectangle(550, 380, 200, 130, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(550, 440, 'CPU (Process)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.add.rectangle(850, 280, 220, 220, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(850, 420, 'MONITOR (Display)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.hero = this.add.circle(300, 480, 25, 0x00ccff);
        this.add.rectangle(285, 445, 30, 18, 0xff4444);

        this.monitorText = this.add.text(780, 240, 'You typed: ', { fontSize: '20px', color: '#00ff8c' });

        this.add.text(30, 30, 'Level 02 - Improved Keyboard & Monitor', { fontSize: '24px', color: '#ffff44' });

        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Escape') this.scene.start('MenuScene');
            if (/[a-zA-Z0-9 -_]/.test(e.key)) {
                this.typedText += e.key.toUpperCase();
                this.monitorText.setText('You typed: ' + this.typedText.slice(-24));
            }
        });
    }

    update() {
        const elapsed = (this.time.now - this.startTime) / 1000;
        if (elapsed > 10) {
            this.add.text(40, 30, 'Tip: Type BOOT!', { fontSize: '24px', color: '#ffff88' });
        }
        if (this.typedText.includes('BOOT') || this.typedText.includes('BOOT!')) {
            this.add.text(420, 60, '✓ Level Complete!', { fontSize: '32px', color: '#00ff8c' });
        }
    }
}