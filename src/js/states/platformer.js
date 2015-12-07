const platformer = {
  create() {
    this.physics.startSystem(Phaser.Physics.ARCADE);

    var player = this.player = this.add.sprite(200, 200, 'character-0');
    player.animations.add('down', Phaser.ArrayUtils.numberArray(0, 3), 12, true);
    player.animations.add('left', Phaser.ArrayUtils.numberArray(4, 7), 12, true);
    player.animations.add('right', Phaser.ArrayUtils.numberArray(8, 11), 12, true);
    player.animations.add('up', Phaser.ArrayUtils.numberArray(12, 15), 12, true);
    player.animations.play('down');

    this.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  playerFace(direction) {
    const { player } = this;
    if (player.isFacing !== direction) {
      player.animations.play(direction);
      player.isFacing = direction;
    }
  },

  update() {
    const { player, cursors } = this;

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown) {
      player.body.velocity.x = -200;
      this.playerFace('left');
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 200;
      this.playerFace('right');
    } else if (cursors.up.isDown) {
      player.body.velocity.y = -200;
      this.playerFace('up');
    } else if (cursors.down.isDown) {
      player.body.velocity.y = 200;
      this.playerFace('down');
    } else {
      if (player.isFacing !== 'idle') {
        player.animations.stop(null, true);
        player.isFacing = 'idle';
      }
    }

  }

};

export default platformer;
