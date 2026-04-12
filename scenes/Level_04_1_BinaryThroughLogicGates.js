class Level_04_1_BinaryThroughLogicGates extends Phaser.Scene {
    constructor() { super('Level_04_1_BinaryThroughLogicGates'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a0f1f');

        this.hero = this.add.circle(180, 620, 24, 0x00ccff);
        this.add.rectangle(165, 586, 30, 18, 0xff4444);

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

        this.outputBits = '';
        this.currentBits = '';

        this.challenges = [
            { op: 'AND', bits: '10', result: '0' },
            { op: 'OR', bits: '10', result: '1' },
            { op: 'NOT', bits: '1', result: '0' },
            { op: 'AND', bits: '00', result: '0' },
            { op: 'OR', bits: '01', result: '1' },
            { op: 'OR', bits: '10', result: '1' },
            { op: 'NOT', bits: '0', result: '1' },
            { op: 'OR', bits: '11', result: '1' }
        ];
        this.challengeIndex = 0;

        this.add.text(30, 24, 'Level 04.1 - Binary Through Logic Gates', {
            fontSize: '28px',
            color: '#ffff66',
            fontStyle: 'bold'
        });

        this.add.text(30, 62, 'Type only 0 or 1, then route the bits to the correct gate (AND/OR/NOT).', {
            fontSize: '18px',
            color: '#aaddff'
        });

        // Input panel
        this.add.rectangle(180, 560, 280, 280, 0x23334a).setStrokeStyle(4, 0x00ccff);
        this.add.text(180, 450, 'INPUT PANEL', { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.bitsText = this.add.text(70, 490, 'Current bits: -', { fontSize: '20px', color: '#00ffcc' });

        // CPU / gates area
        this.add.rectangle(560, 360, 360, 440, 0x16213a).setStrokeStyle(6, 0x00ccff);
        this.add.text(560, 150, 'CPU Gate Core', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        this.gatePads = {
            AND: this.add.rectangle(460, 285, 170, 90, 0x203a5a).setStrokeStyle(4, 0x66ddff),
            OR: this.add.rectangle(660, 285, 170, 90, 0x203a5a).setStrokeStyle(4, 0x66ddff),
            NOT: this.add.rectangle(560, 420, 170, 90, 0x203a5a).setStrokeStyle(4, 0x66ddff)
        };

        this.add.text(460, 285, 'AND', { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(660, 285, 'OR', { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(560, 420, 'NOT', { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // Monitor/output panel
        this.add.rectangle(910, 320, 330, 350, 0x1a1a2e).setStrokeStyle(6, 0x00ccff);
        this.add.text(910, 170, 'OUTPUT MONITOR', { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(760, 215, 'Target: 01001111', { fontSize: '18px', color: '#ffee88' });
        this.outputText = this.add.text(760, 250, 'Output bits: ', { fontSize: '24px', color: '#00ffcc', fontStyle: 'bold' });

        this.challengeText = this.add.text(760, 330, '', {
            fontSize: '20px',
            color: '#ffffff',
            wordWrap: { width: 300 }
        });

        this.statusText = this.add.text(760, 410, '', {
            fontSize: '18px',
            color: '#aaddff',
            wordWrap: { width: 300 }
        });

        this.updateChallengeText();

        this.input.keyboard.on('keydown', (e) => {
            if (e.key === 'Escape') {
                this.scene.start('MenuScene');
                return;
            }

            if (e.altKey && e.key.toLowerCase() === 'f') {
                this.scale.toggleFullscreen();
                return;
            }

            if (this.completed) {
                if (e.key === '5' || e.key === 'm' || e.key === 'M') {
                    this.scene.start('MenuScene');
                }
                return;
            }

            if (e.key === 'Backspace') {
                this.currentBits = this.currentBits.slice(0, -1);
                this.updateChallengeText();
                return;
            }

            if (e.key === 'Enter') {
                this.tryRouteCurrentBits();
                return;
            }

            if (e.key === '0' || e.key === '1') {
                const challenge = this.challenges[this.challengeIndex];
                if (!challenge) return;

                const requiredLength = challenge.op === 'NOT' ? 1 : 2;
                if (this.currentBits.length < requiredLength) {
                    this.currentBits += e.key;
                    this.updateChallengeText();
                }
            }
        });
    }

    getGateByHeroPosition() {
        if (this.hero.x > 375 && this.hero.x < 545 && this.hero.y > 240 && this.hero.y < 330) return 'AND';
        if (this.hero.x > 575 && this.hero.x < 745 && this.hero.y > 240 && this.hero.y < 330) return 'OR';
        if (this.hero.x > 475 && this.hero.x < 645 && this.hero.y > 375 && this.hero.y < 465) return 'NOT';
        return null;
    }

    computeResult(op, bits) {
        const a = bits[0] === '1' ? 1 : 0;

        if (op === 'NOT') return String(a ? 0 : 1);

        const b = bits[1] === '1' ? 1 : 0;
        if (op === 'AND') return String(a & b);
        if (op === 'OR') return String(a | b);
        return '0';
    }

    tryRouteCurrentBits() {
        const challenge = this.challenges[this.challengeIndex];
        if (!challenge) return;

        const requiredLength = challenge.op === 'NOT' ? 1 : 2;
        if (this.currentBits.length !== requiredLength) {
            this.statusText.setText(`Enter exactly ${requiredLength} bit(s) before routing.`);
            return;
        }

        const gate = this.getGateByHeroPosition();
        if (!gate) {
            this.statusText.setText('Move onto a gate pad (AND/OR/NOT) and press ENTER.');
            return;
        }

        if (gate !== challenge.op) {
            this.statusText.setText(`Wrong gate. Challenge requires ${challenge.op}.`);
            return;
        }

        const result = this.computeResult(challenge.op, this.currentBits);
        if (result !== challenge.result) {
            this.statusText.setText(`Result mismatch (${challenge.op} ${this.currentBits} = ${result}). Retry.`);
            return;
        }

        const signal = this.add.circle(190, 560, 10, 0x00ffff);
        this.tweens.add({
            targets: signal,
            x: challenge.op === 'AND' ? 460 : (challenge.op === 'OR' ? 660 : 560),
            y: challenge.op === 'NOT' ? 420 : 285,
            duration: 300,
            onComplete: () => {
                this.tweens.add({
                    targets: signal,
                    x: 820,
                    y: 260,
                    duration: 350,
                    onComplete: () => signal.destroy()
                });
            }
        });

        this.outputBits += result;
        this.outputText.setText(`Output bits: ${this.outputBits}`);
        this.statusText.setText(`${challenge.op} ${this.currentBits} = ${result} ✓`);

        this.currentBits = '';
        this.challengeIndex += 1;

        if (this.challengeIndex >= this.challenges.length) {
            this.completed = true;
            this.challengeText.setText('✓ Level 04.1 Complete');
            this.statusText.setText('Output reached 01001111. Press 5 or M for Menu.');
            return;
        }

        this.updateChallengeText();
    }

    updateChallengeText() {
        const challenge = this.challenges[this.challengeIndex];
        if (!challenge) return;

        const requiredLength = challenge.op === 'NOT' ? 1 : 2;
        this.bitsText.setText(`Current bits: ${this.currentBits || '-'} (${this.currentBits.length}/${requiredLength})`);
        this.challengeText.setText(
            `Challenge ${this.challengeIndex + 1}/${this.challenges.length}\n` +
            `Required gate: ${challenge.op}\n` +
            `Type ${requiredLength} bit(s), then stand on ${challenge.op} and press ENTER.`
        );
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

        if (!this.tipShown && (this.time.now - this.startTime) / 1000 > 15) {
            this.tipShown = true;
            this.add.text(30, 92, 'Tip: Use Backspace to correct bits. Enter routes at the gate pad.', {
                fontSize: '18px',
                color: '#ffff88'
            });
        }
    }

    shutdown() {
        this.input.keyboard.removeAllListeners();
        this.tweens.killAll();
    }
}
