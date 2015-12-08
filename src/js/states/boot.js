export default {
  preload() {
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('ship', 'assets/ship.png');
    this.load.spritesheet('character-0', 'assets/characters/1.png', 32, 48);
    this.load.spritesheet('explosion', 'assets/explosion_sheet.png', 100, 100);
    this.load.spritesheet('blood-splat', 'assets/blood-splat.bmp', 40, 40);
    this.load.tilemap('map', 'assets/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tilemap', 'assets/tilemap.png');
    this.load.image('platformer-bg', 'assets/platformer-bg.jpg');
    this.load.image('bitcoin-icon', 'assets/bitcoin-icon.png');
    var preloaderbar = [
      '8888888888888888',
      '8888888888888888',
    ];
    var preloadertext = [
      '2...222.222.22.',
      '2...2.2.2.2.2.2',
      '2...2.2.2.2.2.2',
      '2...2.2.2.2.2.2',
      '2...2.2.222.2.2',
      '2...2.2.2.2.2.2',
      '2...2.2.2.2.2.2',
      '222.222.2.2.222'
    ];
    this.input.maxPointers = 1;
    //this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.create.texture('preloaderbar', preloaderbar, 16, 6, 0);
    this.game.create.texture('preloadertext', preloadertext, 4, 2, 0);
    var loaderbar = this.add.sprite(this.game.world.width/2, this.game.world.height/2, 'preloaderbar');
    var loadingtext = this.loadingtext = this.add.sprite(this.game.world.width/2, this.game.world.height/2, 'preloadertext');
    loaderbar.x -= loaderbar.width * 0.5;
    loadingtext.x -= loadingtext.width * 0.5;
    loadingtext.y = loaderbar.y + loaderbar.height + 10;
    this.load.setPreloadSprite(loaderbar);
  },

  create() {
    this.loadingtext.kill();
    //this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    //this.scale.startFullScreen();
    //game.scale = Phaser.ScaleManager.RESIZE;
    //this.scale.pageAlignHorizontally = true;
    //this.scale.pageAlignVertically = true;
    //this.scale.setScreenSize(true);
    this.state.start('platformer');
  }
};
