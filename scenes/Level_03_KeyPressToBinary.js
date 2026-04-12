class Level_03_KeyPressToBinary extends Phaser.Scene {
    constructor() { super('Level_03_KeyPressToBinary'); }

    create() {
        this.typedText = '';
        this.currentLineLength = 0;
        this.particles = [];
        this.startTime = this.time.now;
        this.tipShown = false;
        this.completed = false;

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

        this.cameras.main.setBackgroundColor('#0a0f1f');

        const centerX = this.sys.game.config.width / 2;

        // === MAPPING TABLE (left side) ===
        this.add.rectangle(120, 340, 200, 460, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(120, 170, 'ASCII Mapping Table', { fontSize: '20px', color: '#ffff88' }).setOrigin(0.5);

        const mapping = [
            'A → 01000001', 'B → 01000010', 'C → 01000011', 'D → 01000100',
            'E → 01000101', 'F → 01000110', 'G → 01000111', 'H → 01001000',
            'I → 01001001', 'J → 01001010', 'K → 01001011', 'L → 01001100',
            'M → 01001101', 'N → 01001110', 'O → 01001111', 'P → 01010000',
            '1 → 00110001', '2 → 00110010', '3 → 00110011', 'Space → 00100000'
        ];
        for (let i = 0; i < mapping.length; i++) {
            this.add.text(50, 210 + i * 23, mapping[i], { fontSize: '16px', color: '#aaffff' });
        }

        // === KEYBOARD (left bottom) ===
        this.add.rectangle(380, 580, 260, 140, 0x23334a).setStrokeStyle(4, 0x00ccff);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 9; j++) {
                const x = 275 + j * 27;
                const y = 555 + i * 28;
                this.add.rectangle(x, y, 23, 21, 0x3c415a).setStrokeStyle(2, 0xffffff);
            }
        }
        const sampleLetters = ['Q','W','E','R','T','Y','U','I','O','A','S','D','F','G','H','J','K','L','Z','X','C','V','B','N','M'];
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 9; j++) {
                if (index < sampleLetters.length) {
                    this.add.text(275 + j*27 + 8, 555 + i*28 + 5, sampleLetters[index], {
                        fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
                    });
                    index++;
                }
            }
        }
        this.add.text(380, 670, 'KEYBOARD (Input)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        // Hero starts on keyboard
        this.hero = this.add.circle(380, 480, 25, 0x00ccff);
        this.add.rectangle(365, 445, 30, 18, 0xff4444);

        // === CPU (right next to keyboard) ===
        this.add.rectangle(650, 520, 160, 100, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(650, 635, 'CPU (Process)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        // === MODERN MONITOR (top centre) ===
        const monitorWidth = 420;
        const monitorHeight = 260;
        const monitorX = centerX;
        const monitorY = 220;

        this.add.rectangle(monitorX, monitorY, monitorWidth, monitorHeight, 0x1a1a2e).setStrokeStyle(14, 0x00ccff);
        this.add.rectangle(monitorX, monitorY, monitorWidth - 28, monitorHeight - 28, 0xffffff);

        this.add.text(monitorX, monitorY - 40, 'MONITOR (Display)', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);

        // "You typed:" at top-left of white area
        const displayPadding = 15;
        const displayLeftX = monitorX - ((monitorWidth - 28) / 2) + displayPadding;
        const displayTopY  = monitorY - ((monitorHeight - 28) / 2) + displayPadding;

        this.add.text(displayLeftX, displayTopY, 'You typed:', {
            fontSize: '20px',
            color: '#222222'
        });

        this.monitorText = this.add.text(displayLeftX, displayTopY + 32, '', {
            fontSize: '20px',
            color: '#000000',
            fixedWidth: monitorWidth - 60,
            wordWrap: { width: monitorWidth - 60 },
            align: 'left'
        });

        this.charsPerLine = 24;

        // === RIGHT-SIDE PROFESSIONAL INFO PANEL ===
        const panelWidth = 270;
        const panelHeight = 390;
        const panelX = this.sys.game.config.width - (panelWidth / 2 + 35);
        const panelY = 220;

        this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x16213a)
            .setStrokeStyle(8, 0x00ddff, 1.0);

        const innerPadding = 22;
        this.add.rectangle(
            panelX,
            panelY,
            panelWidth - innerPadding * 2,
            panelHeight - innerPadding * 2,
            0x1e2a4a
        ).setStrokeStyle(2, 0x44bbff);

        this.add.text(panelX, panelY - 152, 'LEVEL 03', {
            fontSize: '20px',
            color: '#ffee77',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(panelX, panelY - 125,
            'Key Press → Electric Signal → Binary → Character', {
            fontSize: '15px',
            color: '#aaddff',
            align: 'center',
            wordWrap: { width: panelWidth - 60 }
        }).setOrigin(0.5);

        this.panelLeftX       = panelX - (panelWidth / 2 - innerPadding);
        this.infoStartY       = panelY - 68;
        this.infoLineHeight   = 74;
        this.panelTextWidth   = panelWidth - innerPadding * 2 - 8;

        this.displayLeftX = displayLeftX;
        this.displayTopY  = displayTopY;

        // === KEYBOARD INPUT ===
        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Escape') this.scene.start('MenuScene');

            if (e.altKey && e.key.toLowerCase() === 'f') {
                this.scale.toggleFullscreen();
                return;
            }

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace', 'Shift'].includes(e.key)) return;

            let char = '';
            if (e.key === ' ') char = '_';
            else if (/[a-zA-Z0-9 -_]/.test(e.key)) char = e.key.toUpperCase();

            if (char) {
                // Build string immediately for logic/completion check
                this.typedText += char;
                this.currentLineLength++;
                if (this.currentLineLength >= this.charsPerLine) {
                    this.typedText += '\n';
                    this.currentLineLength = 0;
                }

                // Signal from keyboard → CPU
                const signal = this.add.rectangle(380, 520, 22, 22, 0x00ffff);
                this.particles.push(signal);

                this.tweens.add({
                    targets: signal,
                    x: 650,
                    y: 520,
                    duration: 650,
                    ease: 'Linear',
                    onComplete: () => {
                        signal.setFillStyle(0x00aaff);

                        // Binary appears at CPU
                        const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
                        const binText = this.add.text(650, 520, binary, {
                            fontSize: '18px', color: '#00ffff', fontStyle: 'bold'
                        }).setOrigin(0.5);

                        // Binary flies to Mapping Table
                        this.tweens.add({
                            targets: binText,
                            x: 120,
                            y: 340,
                            duration: 800,
                            ease: 'Linear',
                            onComplete: () => {
                                // Pulse at Mapping Table (processor lookup)
                                this.tweens.add({
                                    targets: binText,
                                    alpha: 0.2,
                                    duration: 120,
                                    yoyo: true,
                                    repeat: 4,
                                    onComplete: () => {
                                        binText.destroy();
                                        const index = this.particles.indexOf(signal);
                                        if (index > -1) this.particles.splice(index, 1);
                                        signal.destroy();

                                        // === Big floating letter appears on monitor ===
                                        const letter = this.add.text(this.displayLeftX, this.displayTopY + 32, char, {
                                            fontSize: '42px',
                                            color: '#000000',
                                            fontStyle: 'bold'
                                        }).setOrigin(0, 0);

                                        this.tweens.add({
                                            targets: letter,
                                            alpha: 0,
                                            y: letter.y - 40,
                                            duration: 900,
                                            ease: 'Power1',
                                            onComplete: () => {
                                                letter.destroy();

                                                // === ONLY NOW the permanent typed text appears on the monitor ===
                                                this.monitorText.setText(this.typedText);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    update() {
        const speed = 6;
        if (this.keys.w.isDown || this.keys.up.isDown) this.hero.y -= speed;
        if (this.keys.s.isDown || this.keys.down.isDown) this.hero.y += speed;
        if (this.keys.a.isDown || this.keys.left.isDown) this.hero.x -= speed;
        if (this.keys.d.isDown || this.keys.right.isDown) this.hero.x += speed;

        const w = this.sys.game.config.width;
        const h = this.sys.game.config.height;
        if (this.hero.x < 0) this.hero.x = w;
        if (this.hero.x > w) this.hero.x = 0;
        if (this.hero.y < 0) this.hero.y = h;
        if (this.hero.y > h) this.hero.y = 0;

        // Tip after 20 seconds
        if (!this.tipShown && (this.time.now - this.startTime) / 1000 > 20) {
            this.tipShown = true;
            this.add.text(this.panelLeftX, this.infoStartY,
                '→ Tip: Type the binary representa-\ntion of letter J (01001010)', {
                fontSize: '16px',
                color: '#ffff88',
                fontStyle: 'bold',
                align: 'left',
                wordWrap: { width: this.panelTextWidth }
            });
        }

        if (this.typedText.includes('01001010') && !this.completed) {
            this.completed = true;

            this.add.text(this.panelLeftX, this.infoStartY + this.infoLineHeight,
                '→ ✓ Level 3 completed', {
                fontSize: '18px',
                color: '#00ffaa',
                fontStyle: 'bold',
                align: 'left'
            });

            this.add.text(this.panelLeftX, this.infoStartY + this.infoLineHeight + 52,
                '→ Press 4 for the next level', {
                fontSize: '16px',
                color: '#ffee88',
                fontStyle: 'bold',
                align: 'left'
            });

            this.input.keyboard.once('keydown-FOUR', () => this.scene.start('Level_04_1_BinaryThroughLogicGates'));
        }
    }

    shutdown() {
        this.input.keyboard.removeAllListeners();
        this.particles.forEach(p => p.destroy());
        this.particles = [];
        this.tweens.killAll();
    }
}