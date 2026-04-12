class Level_04_PC_Boot extends Phaser.Scene {
    constructor() { super('Level_04_PC_Boot'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a0f1f');

        const centerY = this.sys.game.config.height / 2;
        const pcCenterX = 360;   // PC positioned on the left

        // === MAIN COMPUTER CASE ===
        this.add.rectangle(pcCenterX, centerY + 30, 520, 400, 0x1e2a4a)
            .setStrokeStyle(18, 0x00ccff);

        this.add.text(pcCenterX, centerY - 210, 'COMPUTER SYSTEM', {
            fontSize: '28px', color: '#ffee77', fontStyle: 'bold'
        }).setOrigin(0.5);

        // === HARD DRIVE - BIGGER ===
        this.hd = this.add.rectangle(pcCenterX - 165, centerY - 5, 190, 190, 0x334466)
            .setStrokeStyle(6, 0x88aaff);

        this.add.text(pcCenterX - 165, centerY - 115, 'HARD DRIVE\n(Storage)', {
            fontSize: '16px', color: '#aaddff', align: 'center'
        }).setOrigin(0.5);

        // === OS inside Hard Drive (static) ===
        const osBox = this.add.rectangle(pcCenterX - 200, centerY - 15, 78, 48, 0x00aaff)
            .setStrokeStyle(3, 0xffffff);
        this.add.text(osBox.x, osBox.y, 'OS', {
            fontSize: '18px', color: '#000000', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(osBox.x, osBox.y + 32, '(Core System)', {
            fontSize: '12px', color: '#000000'
        }).setOrigin(0.5);

        // === Windows inside Hard Drive (static) ===
        const winBox = this.add.rectangle(pcCenterX - 125, centerY + 25, 82, 48, 0x44ddff)
            .setStrokeStyle(3, 0xffffff);
        this.add.text(winBox.x, winBox.y, 'Windows', {
            fontSize: '16px', color: '#000022', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(winBox.x, winBox.y + 32, '(User Interface)', {
            fontSize: '12px', color: '#000022'
        }).setOrigin(0.5);

        // === CPU (Smaller) ===
        this.cpu = this.add.rectangle(pcCenterX, centerY - 125, 100, 60, 0x334466)
            .setStrokeStyle(6, 0x88aaff);
        this.add.text(pcCenterX, centerY - 155, 'CPU', {
            fontSize: '18px', color: '#ffee88', fontStyle: 'bold'
        }).setOrigin(0.5);

        // === RAM ===
        this.ram = this.add.rectangle(pcCenterX + 165, centerY - 10, 150, 140, 0x334466)
            .setStrokeStyle(6, 0x88aaff);
        this.add.text(pcCenterX + 165, centerY - 85, 'RAM\n(Memory)', {
            fontSize: '16px', color: '#aaddff', align: 'center'
        }).setOrigin(0.5);

        // === POWER SWITCH ===
        this.powerOn = false;
        this.switchBase = this.add.rectangle(pcCenterX + 235, centerY + 110, 40, 70, 0x222233)
            .setStrokeStyle(4, 0x00ccff);
        this.switchKnob = this.add.rectangle(pcCenterX + 235, centerY + 130, 28, 16, 0xff4444);

        this.add.text(pcCenterX + 235, centerY + 165, 'POWER', {
            fontSize: '15px', color: '#ffffff'
        }).setOrigin(0.5);

        this.switchKnob.setInteractive();
        this.switchKnob.on('pointerdown', () => this.togglePower());

        // === RIGHT-SIDE VERTICAL INFO PANEL ===
        const panelX = this.sys.game.config.width - 180;
        const panelY = centerY - 40;

        this.add.rectangle(panelX, panelY, 280, 420, 0x16213a)
            .setStrokeStyle(8, 0x00ddff);

        this.add.text(panelX, panelY - 170, 'LEVEL 04', {
            fontSize: '22px', color: '#ffee77', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(panelX, panelY - 135, 'How Programs Load\ninto Memory', {
            fontSize: '17px', color: '#aaddff', align: 'center'
        }).setOrigin(0.5);

        this.add.text(panelX - 110, panelY - 80, 
            'Click the POWER switch\nto turn on the computer.\n\nWatch how the OS and\nWindows load from the\nHard Drive into RAM.', {
            fontSize: '16px', color: '#88ffcc', align: 'left'
        });

        this.statusText = this.add.text(panelX - 110, panelY + 80, '', {
            fontSize: '18px', color: '#ffee88', align: 'left'
        });

        this.movingObjects = [];
    }

    togglePower() {
        this.powerOn = !this.powerOn;

        if (this.powerOn) {
            this.switchKnob.setFillStyle(0x44ff88);
            this.statusText.setText('✓ POWER ON\nBooting...');
            this.time.delayedCall(800, () => this.startBootSequence());
        } else {
            this.switchKnob.setFillStyle(0xff4444);
            this.statusText.setText('POWER OFF');

            this.movingObjects.forEach(obj => obj && obj.destroy());
            this.movingObjects = [];
        }
    }

    startBootSequence() {
        this.statusText.setText('Loading OS\nfrom Hard Drive...');

        this.time.delayedCall(1200, () => {
            this.statusText.setText('OS loaded\ninto RAM');

            const osBlock = this.add.rectangle(this.hd.x - 35, this.hd.y - 10, 70, 35, 0x00ccff)
                .setStrokeStyle(3, 0xffffff);
            this.add.text(osBlock.x, osBlock.y, 'OS', {
                fontSize: '16px', color: '#000000', fontStyle: 'bold'
            }).setOrigin(0.5);

            this.movingObjects.push(osBlock);

            this.tweens.add({
                targets: osBlock,
                x: this.ram.x,
                duration: 1400,
                ease: 'Power2',
                onComplete: () => {
                    this.statusText.setText('CPU is now\nrunning the OS');
                    this.time.delayedCall(1000, () => this.loadWindows());
                }
            });
        });
    }

    loadWindows() {
        this.statusText.setText('Loading Windows\nfrom HD to RAM...');

        for (let i = 0; i < 3; i++) {
            const delay = i * 400;

            this.time.delayedCall(delay, () => {
                const block = this.add.rectangle(this.hd.x + 20, this.hd.y + 45, 55, 28, 0x44ddff)
                    .setStrokeStyle(3, 0x112233);

                this.add.text(block.x, block.y, 'WIN', {
                    fontSize: '14px', color: '#000022', fontStyle: 'bold'
                }).setOrigin(0.5);

                this.movingObjects.push(block);

                this.tweens.add({
                    targets: block,
                    x: this.ram.x - 30 + i * 22,
                    y: this.ram.y + 15 + (i % 2) * 18,
                    duration: 1300,
                    ease: 'Cubic.easeOut',
                    onComplete: () => {
                        this.tweens.add({
                            targets: block,
                            y: '+=7',
                            duration: 160,
                            yoyo: true,
                            ease: 'Sine.easeInOut'
                        });
                    }
                });
            });
        }

        this.time.delayedCall(2300, () => {
            this.statusText.setText('✓ Windows is now\nrunning from RAM!\nCPU can display\nthe desktop.');

            this.add.text(this.sys.game.config.width - 180, this.sys.game.config.height - 70,
                '→ Press 5 for the next level', {
                fontSize: '18px', color: '#ffee88'
            }).setOrigin(0.5);

            this.input.keyboard.once('keydown-FIVE', () => this.scene.start('Level_05'));
        });
    }
}