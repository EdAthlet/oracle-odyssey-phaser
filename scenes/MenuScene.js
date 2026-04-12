class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }

    create() {
        this.cameras.main.setBackgroundColor('#0a0f1f');

        // Title
        this.add.text(80, 60, 'Oracle Odyssey', { 
            fontSize: '48px', 
            color: '#ffff44',
            fontStyle: 'bold'
        });

        this.add.text(80, 120, 'From Bits to Cloud - Training Game', { 
            fontSize: '24px', 
            color: '#aaccff' 
        });

        // Levels list - starting from top-left, going down
        const startY = 220;
        const lineHeight = 70;

        this.createLevelButton(80, startY + 0*lineHeight, '1', 'Level 01 - Keyboard → CPU → Display', 'Level_01_KeyboardCPU');
        this.createLevelButton(80, startY + 1*lineHeight, '2', 'Level 02 - Improved Keyboard & Monitor', 'Level_02_ImprovedKeyboard');
        this.createLevelButton(80, startY + 2*lineHeight, '3', 'Level 03 - Key Press → Electric Signal → Binary → Character', 'Level_03_KeyPressToBinary');
        this.createLevelButton(80, startY + 3*lineHeight, '4', 'Level 04 - Full PC Boot: HD → RAM → OS', 'Level_04_PC_Boot');
        this.createLevelButton(80, startY + 4*lineHeight, '5', 'Level 04.1 - Binary Through Logic Gates', 'Level_04_1_BinaryThroughLogicGates');

        // Instructions at bottom
        this.add.text(80, 720, 'Click on a level or press the number key to start', { 
            fontSize: '18px', 
            color: '#888888' 
        });
    }

    createLevelButton(x, y, number, title, sceneKey) {
        // Background box for each level
        const box = this.add.rectangle(x + 140, y + 22, 620, 52, 0x1a1a2e).setStrokeStyle(4, 0x00ccff);
        box.setInteractive();

        // Number
        this.add.text(x, y + 10, number, { 
            fontSize: '32px', 
            color: '#00ffcc', 
            fontStyle: 'bold' 
        });

        // Title
        this.add.text(x + 70, y + 18, title, { 
            fontSize: '22px', 
            color: '#ffffff' 
        });

        // Click handler
        box.on('pointerdown', () => {
            this.scene.start(sceneKey);
        });

        // Keyboard shortcut
        this.input.keyboard.on('keydown-' + number, () => {
            this.scene.start(sceneKey);
        });
    }

    shutdown() {
        this.input.keyboard.removeAllListeners();
    }
}