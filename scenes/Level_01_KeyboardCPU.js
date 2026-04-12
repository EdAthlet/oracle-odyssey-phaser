class Level_01_KeyboardCPU extends Phaser.Scene {
    constructor() { super('Level_01_KeyboardCPU'); }

    create() {
        this.typedText = '';
        this.currentLineLength = 0;
        this.particles = [];
        this.startTime = this.time.now;
        this.tipShown = false;

        // Create keys once for reuse in update
        this.keys = this.input.keyboard.addKeys({
            up: 'UP',
            down: 'DOWN',
            left: 'LEFT',
            right: 'RIGHT',
            w: 'W',
            s: 'S',
            a: 'A',
            d: 'D'
        });

        // Boxes
        this.add.rectangle(250, 520, 260, 140, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(250, 580, 'KEYBOARD (Input)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.add.rectangle(550, 380, 200, 130, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(550, 440, 'CPU (Process)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        this.add.rectangle(850, 280, 220, 220, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(850, 420, 'MONITOR (Display)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        // Hero
        this.hero = this.add.circle(300, 480, 25, 0x00ccff);
        this.add.rectangle(285, 445, 30, 18, 0xff4444);

        // Monitor label
        this.add.text(780, 200, 'You typed:', { fontSize: '20px', color: '#aaaaaa' });

        // Monitor text (wraps after 12 characters)
        this.monitorText = this.add.text(780, 230, '', {
            fontSize: '20px',
            color: '#00ff8c',
            fixedWidth: 190,
            wordWrap: { width: 190 },
            align: 'left'
        });

        this.add.text(30, 30, 'Level 01 - Keyboard → CPU → Display', { fontSize: '24px', color: '#ffff44' });

        // Input
        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Escape') this.scene.start('MenuScene');

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Shift'].includes(e.key)) {
                return;
            }

            let char = '';
            if (e.key === ' ') char = '_';
            else if (/[a-zA-Z0-9 -_]/.test(e.key)) char = e.key.toUpperCase();

            if (char) {
                this.typedText += char;
                this.currentLineLength++;

                if (this.currentLineLength >= 12) {
                    this.typedText += '\n';
                    this.currentLineLength = 0;
                }

                this.monitorText.setText(this.typedText);

                // Create visible particle from Keyboard
                const particle = this.add.rectangle(250, 520, 18, 18, 0x00ccff);
                this.particles.push(particle);

                // Tween 1: Keyboard → CPU
                this.tweens.add({
                    targets: particle,
                    x: 550,
                    y: 380,
                    duration: 650,
                    ease: 'Linear',
                    onComplete: () => {
                        particle.setFillStyle(0x00ff88); // turn green

                        // Tween 2: CPU → Monitor
                        this.tweens.add({
                            targets: particle,
                            x: 830,
                            y: 300,
                            duration: 650,
                            ease: 'Linear',
                            onComplete: () => {
                                const letter = this.add.text(830, 280, char, {
                                    fontSize: '38px',
                                    color: '#00ffcc',
                                    fontStyle: 'bold'
                                }).setOrigin(0.5);

                                this.tweens.add({
                                    targets: letter,
                                    alpha: 0,
                                    y: 240,
                                    duration: 800,
                                    onComplete: () => letter.destroy()
                                });

                                const index = this.particles.indexOf(particle);
                                if (index > -1) this.particles.splice(index, 1);
                                particle.destroy();
                            }
                        });
                    }
                });
            }
        });
    }

    update() {
        // Hero movement
        const speed = 6;
        if (this.keys.w.isDown || this.keys.up.isDown) this.hero.y -= speed;
        if (this.keys.s.isDown || this.keys.down.isDown) this.hero.y += speed;
        if (this.keys.a.isDown || this.keys.left.isDown) this.hero.x -= speed;
        if (this.keys.d.isDown || this.keys.right.isDown) this.hero.x += speed;

        // Tip after 20 seconds
        if (!this.tipShown && (this.time.now - this.startTime) / 1000 > 20) {
            this.tipShown = true;
            this.add.text(30, 70, 'Tip: Type BOOT to complete the level', { fontSize: '24px', color: '#ffff88' });
        }

        // Completion + transfer to Level 02
        if (this.typedText.includes('BOOT') || this.typedText.includes('BOOT!')) {
            this.add.text(420, 100, '✓ Level Complete!', { fontSize: '32px', color: '#00ff8c' });
            this.add.text(420, 150, 'Press 2 to go to Level 02', { fontSize: '26px', color: '#ffff88' });

            this.input.keyboard.once('keydown-TWO', () => {
                this.scene.start('Level_02_ImprovedKeyboard');
            });
        }
    }

    shutdown() {
        this.input.keyboard.removeAllListeners();
        this.particles.forEach(p => p.destroy());
        this.particles = [];
        this.tweens.killAll();
    }
}