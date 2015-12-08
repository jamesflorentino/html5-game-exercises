var pixelbullet = [
  '3321',
];
var pixelsword = [
	'......21',
	'.....211',
	'33..211.',
	'33.211..',
	'.3311...',
	'.383....',
	'393333..',
	'.3..33..'
];

//var over = [
//  '2222.2...2.222..',
//  '2..2.2...2.2..2.',
//  '2..2.2...2.2..2.',
//  '2..2.2...2.222..',
//  '2..2..2.2..2..2.',
//  '2222...2...2..2.',
//];

//var platform = {
//  grass: [
//    '........',
//    '........',
//    'BBBBBBBB',
//    '.AAAAAAA',
//    '.AAAAAAA',
//    '.AAAAAAA',
//    '.CCCCCCC',
//    '........'
//  ]
//};

const platformer = {
  create() {
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.physics.arcade.gravity.y = 1000;
    this.game.create.texture('pixelbullet', pixelbullet, 2, 2);
    this.game.create.texture('pixelsword', pixelsword, 3, 3, 0);

    var bg = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'platformer-bg');
    bg.fixedToCamera = true;

    var map = this.add.tilemap('map');
    map.addTilesetImage('tilemap');

    map.createLayer('ground').resizeWorld();


    this.npcs = this.add.group();
    this.npcs.enableBody = true;
    this.npcs.physicsBodyType = Phaser.Physics.ARCADE;
    this.npcs.createMultiple(5, 'enemy');
    this.npcs.setAll('anchor.x', 0.5);
    this.npcs.setAll('anchor.y', 0.25);
    this.npcs.setAll('maxHealth', 5);
    this.npcs.setAll('body.immovable', true);
    this.npcs.forEach(e => {
      e.reset(this.rnd.realInRange(0, this.world.width), 0);
      e.body.collideWorldBounds = true;
      e.heal(5);
    });

    this.bullets = this.add.group();
    this.bullets.speed = 500;
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(10, 'pixelbullet');
    this.bullets.setAll('checkWorldBounds', true);
    this.bullets.setAll('body.allowGravity', false);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('anchor.y', 0.5);

    this.explosions = this.add.emitter(0, 0, 50);
    this.explosions.makeParticles('character-0');
    this.explosions.gravity = 1000;
    this.explosions.bounce.set(0);
    this.explosions.minParticleScale = 0.1;
    this.explosions.maxParticleScale = 0.3;


    this.damages = this.add.group();
    this.damages.createMultiple(50, 'explosion');
    this.damages.setAll('scale.x', 0.5);
    this.damages.setAll('scale.y', 0.5);
    this.damages.setAll('anchor.x', 0.5);
    this.damages.setAll('anchor.y', 0.5);
    this.damages.forEach(d => {
      d.animations.add('kaboom');
    });

    this.bitcoins = this.add.emitter(0, 0, 50);
    this.bitcoins.makeParticles('bitcoin-icon');
    this.bitcoins.bounce.set(0.1);
    this.bitcoins.maxParticleSpeed.set(20, 0);
    this.bitcoins.minParticleSpeed.set(-20, -500);

    var player = this.player = this.add.sprite(this.world.width * 0.5, 0, 'character-0');
    this.physics.enable(player);

    player.body.collideWorldBounds = true;
    player.anchor.x = 0.5;
    player.anchor.y = 0.5;

    player.walkspeed = 150;
    player.jumpHeight = -400;

    player.animations.add('down', Phaser.ArrayUtils.numberArray(0, 3), 12, true);
    player.animations.add('left', Phaser.ArrayUtils.numberArray(4, 7), 12, true);
    player.animations.add('right', Phaser.ArrayUtils.numberArray(8, 11), 12, true);
    player.animations.add('up', Phaser.ArrayUtils.numberArray(12, 15), 12, true);
    player.animations.play('left');

    this.sword = this.add.group();
    this.sword.sprite = this.sword.create(0, 0, 'pixelsword', true);
    this.physics.enable(this.sword.sprite, Phaser.Physics.ARCADE);
    this.sword.sprite.anchor.set(0.5);
    this.sword.sprite.isSword = true;
    this.sword.sprite.kill();
    this.cursors = this.input.keyboard.createCursorKeys();

    this.fireButton = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    this.meleeButton = this.input.keyboard.addKey(Phaser.KeyCode.F);
    this.fireButton.onDown.add(this.fire, this);
    this.meleeButton.onDown.add(this.showWeapon, this);

    this.layer = map.createLayer('collisions');
    this.layer.resizeWorld();
    map.setCollision([33, 9], true, 'collisions');
    this.layer.visible = false;

    map.createLayer('foreground').resizeWorld();


    this.camera.follow(this.player, Phaser.Camera.STYLE_PLATFORMER);
  },

  showWeapon() {
    if (this.sword.sprite.alive) {
      return;
    }
    var player = this.player;
    var sword = this.sword.sprite;
    var currentAnim = player.animations.currentAnim.name;
    var rotation;
    if (currentAnim === 'left') {
      sword.isFacing = 'left';
      sword.scale.x = -1;
      rotation = 90;
    } else if (currentAnim === 'right') {
      sword.isFacing = 'right';
      sword.scale.x = 1;
      rotation = -90;
    }
    this.sword.sprite.reset();
    var isSwinging = this.sword.isSwinging = this.add.tween(this.sword.sprite);
    isSwinging.from({ y: -20, rotation: Phaser.Math.degToRad(rotation)}, 150, Phaser.Easing.Exponential.Out);
    isSwinging.onComplete.addOnce(function() {
      this.sword.sprite.kill();
    },this);
    isSwinging.start();
    //this.swordTimeout = this.time.events.add(100, this.hideWeapon, this);
  },

  hideWeapon() {
    this.sword.sprite.kill();
  },

  //render() {
  //  this.game.debug.spriteBounds(this.sword);
  //},

  fire() {
    var player = this.player;
    if (!player.isFacing) {
      return;
    }
    var bullet = this.bullets.getFirstDead();
    var currentAnim = player.animations.currentAnim.name;
    if (bullet) {
      bullet.reset(player.x, player.y);
      //bullet.body.allowGravity = false;
      if (currentAnim === 'left') {
        bullet.body.velocity.x = -this.bullets.speed;
        bullet.isFacing = 'left';
        bullet.rotation = Phaser.Math.degToRad(180);
      } else if (currentAnim === 'right') {
        bullet.rotation = Phaser.Math.degToRad(0);
        bullet.isFacing = 'right';
        bullet.body.velocity.x = this.bullets.speed;
      }
    }
  },

  enemyHit(enemy, bullet) {
    if (!bullet.isSword) {
      bullet.kill();
    }
    if (bullet.isSword) {
      var now = Date.now();
      if (bullet.nextHit && bullet.nextHit > now) {
        return;
      }
      bullet.nextHit = Date.now() + 250;
    }
    enemy.damage(1);
    enemy.body.friction.x = 100;

    this.bitcoins.emitX = this.explosions.emitX = enemy.x;
    this.bitcoins.emitY = this.explosions.emitY = enemy.y;
    this.explosions.maxParticleAlpha = 0.5;
    this.explosions.maxParticleSpeed.set(10, -400);
    this.explosions.minParticleSpeed.set(-10, -400);

    if (bullet.isFacing === 'left') {
      this.explosions.minParticleSpeed.x = -200;
    } else if (bullet.isFacing === 'right') {
      this.explosions.minParticleSpeed.x = 200;
    }

    this.explosions.start(true, 3000, null, 10);
    if (!enemy.alive) {
      var blood = this.damages.getFirstDead();
      if (blood) {
        blood.reset(enemy.x, enemy.y);
        blood.animations.play('kaboom');
      }
      this.bitcoins.start(true, 3000, null, 10);
    } else {
      this.add.tween(enemy.scale).from({ x: 1.2, y: 1.2 }, 250, Phaser.Easing.Back.Out, true);
    }

  },

  bulletRemove(bullet) {
    bullet.kill();
  },

  fadeOutParticle(p) {
    p.alpha = p.lifespan / this.explosions.lifespan;
  },

  update() {
    this.physics.arcade.collide(this.player, this.layer);
    this.physics.arcade.collide(this.explosions, this.layer);
    this.physics.arcade.collide(this.bitcoins, this.layer);
    this.physics.arcade.collide(this.npcs, this.layer);
    //this.physics.arcade.collide(this.npcs, this.player);
    //this.physics.arcade.collide(this.bitcoins, this.player, this.removeCoin, false, this);
    this.physics.arcade.collide(this.bullets, this.layer, this.bulletRemove, false, this);
    this.physics.arcade.overlap(this.npcs, this.bullets, this.enemyHit, false, this);
    this.physics.arcade.overlap(this.npcs, this.sword, this.enemyHit, false, this);
    this.explosions.forEachAlive(this.fadeOutParticle, this);

    var player = this.player;
    player.body.velocity.x = 0;
    var cursors = this.cursors;
    if (cursors.left.isDown) {
      player.body.velocity.x = -player.walkspeed;
      if (player.isFacing !== 'left') {
        player.isFacing = 'left';
        player.animations.play('left');
      }
    } else if (cursors.right.isDown) {
      player.body.velocity.x = player.walkspeed;
      if (player.isFacing !== 'right') {
        player.isFacing = 'right';
        player.animations.play('right');
      }
    } else {
      if (player.isFacing !== 'idle') {
        player.isFacing = 'idle';
        player.animations.stop();
      }
    }

    if (cursors.up.isDown && player.body.onFloor()) {
      player.body.velocity.y = player.jumpHeight;
    }

    if (player.isFacing === 'left') {
      this.sword.x = player.x - player.width * 0.5;
    } else if (player.isFacing === 'right'){
      this.sword.x = player.x + player.width * 0.5;
    }
    this.sword.y = this.player.y;

  }
};

export default platformer;
