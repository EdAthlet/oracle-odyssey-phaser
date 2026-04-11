class Level_02_ImprovedKeyboard extends Phaser.Scene {
    constructor() { super('Level_02_ImprovedKeyboard'); }

    create() {
        this.typedText = '';
        this.currentLineLength = 0;
        this.particles = [];
        this.startTime = this.time.now;
        this.tipShown = false;
        this.completed = false;

        // === KEYBOARD ===
        this.add.rectangle(250, 520, 260, 140, 0x23334a).setStrokeStyle(4, 0x00ccff);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 9; j++) {
                const x = 135 + j * 27;
                const y = 495 + i * 28;
                this.add.rectangle(x, y, 23, 21, 0x3c415a).setStrokeStyle(2, 0xffffff);
            }
        }
        const sampleLetters = ['Q','W','E','R','T','Y','U','I','O','A','S','D','F','G','H','J','K','L','Z','X','C','V','B','N','M'];
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 9; j++) {
                if (index < sampleLetters.length) {
                    this.add.text(135 + j*27 + 8, 495 + i*28 + 5, sampleLetters[index], {
                        fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
                    });
                    index++;
                }
            }
        }
        this.add.text(250, 610, 'KEYBOARD (Input)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        // === CPU ===
        this.add.rectangle(550, 380, 200, 130, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(550, 525, 'CPU (Process)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        // === MONITOR ===
        this.add.rectangle(850, 280, 250, 220, 0x23334a).setStrokeStyle(6, 0x111133);
        this.add.rectangle(865, 295, 220, 160, 0x112233);
        this.add.rectangle(810, 480, 100, 15, 0x23334a);
        this.add.rectangle(835, 495, 50, 20, 0x23334a);
        this.add.text(850, 520, 'MONITOR (Display)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        // Hero
        this.hero = this.add.circle(300, 480, 25, 0x00ccff);
        this.add.rectangle(285, 445, 30, 18, 0xff4444);

        // Monitor text
        this.add.text(780, 200, 'You typed:', { fontSize: '20px', color: '#aaaaaa' });
        this.monitorText = this.add.text(780, 230, '', {
            fontSize: '20px',
            color: '#00ff8c',
            fixedWidth: 210,
            wordWrap: { width: 210 }
        });

        this.add.text(30, 30, 'Level 02 - Improved Keyboard & Monitor', { fontSize: '22px', color: '#ffff44' });

        // Input
        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Escape') this.scene.start('MenuScene');

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Shift'].includes(e.key)) return;

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

                const particle = this.add.rectangle(250, 520, 18, 18, 0x00ccff);
                this.particles.push(particle);

                this.tweens.add({
                    targets: particle,
                    x: 550,
                    y: 380,
                    duration: 650,
                    ease: 'Linear',
                    onComplete: () => {
                        particle.setFillStyle(0x00ff88);

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
        if (this.input.keyboard.addKey('W').isDown || this.input.keyboard.addKey('UP').isDown) this.hero.y -= speed;
        if (this.input.keyboard.addKey('S').isDown || this.input.keyboard.addKey('DOWN').isDown) this.hero.y += speed;
        if (this.input.keyboard.addKey('A').isDown || this.input.keyboard.addKey('LEFT').isDown) this.hero.x -= speed;
        if (this.input.keyboard.addKey('D').isDown || this.input.keyboard.addKey('RIGHT').isDown) this.hero.x += speed;

        // === HERO WRAPPING (reappears from opposite side) ===
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        if (this.hero.x < 0) this.hero.x = width;
        if (this.hero.x > width) this.hero.x = 0;
        if (this.hero.y < 0) this.hero.y = height;
        if (this.hero.y > height) this.hero.y = 0;

        // Tip after 10 seconds
        if (!this.tipShown && (this.time.now - this.startTime) / 1000 > 10) {
            this.tipShown = true;
            this.add.text(30, 65, '→ Tip: Type BOOT! to complete the level', { fontSize: '20px', color: '#ffff88' });
        }

        // Completion - ONLY BOOT!
        if (this.typedText.includes('BOOT!') && !this.completed) {
            this.completed = true;

            this.add.text(30, 100, '→ ✓ Level Complete!', { fontSize: '20px', color: '#00ff8c' });
            this.add.text(30, 130, '→ Bring the hero to the keyboard and press ENTER to go to Level 03', {
                fontSize: '20px',
                color: '#ffff88'
            });

            this.input.keyboard.once('keydown-ENTER', () => {
                const nearKeyboard = this.hero.x > 100 && this.hero.x < 400 && this.hero.y > 400 && this.hero.y < 600;
                if (nearKeyboard) {
                    this.scene.start('Level_03');
                }
            });
        }
    }
}