export default {
  preload() {
    this.load.image('bullet', '/assets/bullet.png');
    this.load.image('enemy', '/assets/enemy.png');
    this.load.image('ship', '/assets/ship.png');
    this.load.spritesheet('character-0', '/assets/characters/1.png', 32, 48);
    this.load.spritesheet('explosion', '/assets/explosion_sheet.png', 100, 100);
  },

  create() {
    this.input.maxPointers = 1;
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    //this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    //this.scale.startFullScreen();
    //game.scale = Phaser.ScaleManager.RESIZE;
    //this.scale.pageAlignHorizontally = true;
    //this.scale.pageAlignVertically = true;
    //this.scale.setScreenSize(true);
    this.state.start('shooter');
  }
};
