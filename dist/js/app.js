'use strict';

var boot = {
  preload: function preload() {
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
    var preloaderbar = ['8888888888888888', '8888888888888888'];
    var preloadertext = ['2...222.222.22.', '2...2.2.2.2.2.2', '2...2.2.2.2.2.2', '2...2.2.2.2.2.2', '2...2.2.222.2.2', '2...2.2.2.2.2.2', '2...2.2.2.2.2.2', '222.222.2.2.222'];
    this.input.maxPointers = 1;
    //this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.game.create.texture('preloaderbar', preloaderbar, 16, 6, 0);
    this.game.create.texture('preloadertext', preloadertext, 4, 2, 0);
    var loaderbar = this.add.sprite(this.game.world.width / 2, this.game.world.height / 2, 'preloaderbar');
    var loadingtext = this.loadingtext = this.add.sprite(this.game.world.width / 2, this.game.world.height / 2, 'preloadertext');
    loaderbar.x -= loaderbar.width * 0.5;
    loadingtext.x -= loadingtext.width * 0.5;
    loadingtext.y = loaderbar.y + loaderbar.height + 10;
    this.load.setPreloadSprite(loaderbar);
  },
  create: function create() {
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

var Shooter = {
  create: function create() {
    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.createPlayer();
    this.createBulletPool();
    this.createEnemies();
    this.createParticles();
    this.createExplosions();
    this.cursors = this.input.keyboard.createCursorKeys();
    var spacebar = this.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    this.input.onDown.add(this.startFiring, this);
    this.input.onUp.add(this.stopFiring, this);

    spacebar.onDown.add(this.fire, this);
  },
  startFiring: function startFiring() {
    this.isFiring = true;
  },
  stopFiring: function stopFiring() {
    this.isFiring = false;
  },
  createParticles: function createParticles() {
    var shrapnels = this.shrapnels = this.add.emitter(0, 0, 100);
    shrapnels.maxParticleScale = 0.5;
    shrapnels.minParticleScale = 0.1;
    shrapnels.bounce.x = 1;
    shrapnels.gravity = 0;
    shrapnels.minParticleSpeed.setTo(-1000, 1000);
    shrapnels.maxParticleSpeed.setTo(1000, -1000);
    shrapnels.makeParticles('enemy');
  },
  createExplosions: function createExplosions() {
    var explosions = this.explosions = this.add.group();
    explosions.createMultiple(100, 'explosion');
    explosions.setAll('checkWorldBounds');
    explosions.setAll('outOfBoundsKill');
    //explosions.setAll('scale.x', 0.5);
    //explosions.setAll('scale.y', 0.5);
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach(function (e) {
      e.animations.add('kaboom');
    });
  },
  explode: function explode(sprite) {
    var explosion = this.explosions.getFirstDead();
    explosion.reset(sprite.x, sprite.y);
    explosion.angle = Phaser.Math.degToRad(this.rnd.integerInRange(0, 360));
    explosion.animations.play('kaboom', 80, false, true);
    this.shrapnels.emitX = sprite.x;
    this.shrapnels.emitY = sprite.y;
    this.shrapnels.start(true, 1000, null, 20);
    return explosion;
  },
  enemyHit: function enemyHit(bullet, enemy) {
    bullet.kill();
    this.explode(enemy);
    enemy.x = this.world.width * Math.random();
    enemy.y = this.rnd.integerInRange(0, 100);
  },
  createBulletPool: function createBulletPool() {
    var bullets = this.bullets = this.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(100, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('anchor.x', 0.5);
  },
  createEnemies: function createEnemies() {
    var enemies = this.enemies = this.add.group();
    enemies.enableBody = true;
    enemies.physicsBodyType = Phaser.Physics.ARCADE;
    enemies.createMultiple(10, 'enemy');
    enemies.setAll('anchor.x', 0.5);
    enemies.setAll('anchor.y', 0.5);
    enemies.forEach(this.spawnEnemy, this);
    enemies.setAll('body.velocity.x', 100);
    enemies.setAll('scale.x', 0.5);
    enemies.setAll('scale.y', 0.5);
  },
  spawnEnemy: function spawnEnemy(enemy) {
    enemy.position.set(this.world.width * Math.random(), 100 * Math.random());
    enemy.exists = true;
  },
  createPlayer: function createPlayer() {
    var player = this.add.sprite(this.world.width * 0.5, this.world.height - 200, 'ship');
    player.anchor.set(0.5);
    player.scale.set(0.35);
    this.game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    this.player = player;
  },

  lastFired: Date.now(),

  canFire: function canFire() {
    var now = Date.now();
    if (now > this.lastFired) {
      this.lastFired = now + 350;
      return true;
    }
    return false;
  },
  fire: function fire() {
    if (!this.canFire()) {
      return;
    }
    var total = 3;
    var cone = 30;
    var step = cone / total;
    for (var i = 0; i < total; i++) {
      var bullet = this.bullets.getFirstDead();
      if (bullet) {
        bullet.reset(this.player.x, this.player.y - 50);
        bullet.rotation = Phaser.Math.degToRad(step * i - cone * 0.5);
        this.physics.arcade.velocityFromRotation(bullet.rotation - Phaser.Math.degToRad(90), 400, bullet.body.velocity);
      }
    }
  },
  moveEnemy: function moveEnemy(enemy) {
    if (enemy.x < 0) {
      enemy.x = 20;
      enemy.body.velocity.x *= -1;
    } else if (enemy.x > this.world.width) {
      enemy.x = this.world.width - 10;
      enemy.body.velocity.x *= -1;
    }
  },
  update: function update() {
    this.physics.arcade.overlap(this.bullets, this.enemies, this.enemyHit, null, this);
    //this.physics.arcade.overlap(this.explosions, this.enemies, this.enemyHit, null, this);
    var player = this.player;
    var cursors = this.cursors;

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
      player.body.velocity.x = -200;
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 200;
    }

    if (this.isFiring) {
      if (this.input.activePointer.circle.contains(player.x, player.y)) {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
      } else {
        this.physics.arcade.moveToPointer(this.player, 500);
        this.player.body.velocity.y = 0;
      }
      this.fire();
    }

    this.enemies.forEach(this.moveEnemy, this);
  }
};

var pixelbullet = ['3321'];
var pixelsword = ['......21', '.....211', '33..211.', '33.211..', '.3311...', '.383....', '393333..', '.3..33..'];

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

var platformer = {
  create: function create() {
    var _this = this;

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
    this.npcs.setAll('anchor.y', 1);
    this.npcs.setAll('anchor.y', 1);
    this.npcs.setAll('maxHealth', 5);
    this.npcs.setAll('body.immovable', true);
    this.npcs.forEach(function (e) {
      e.reset(_this.rnd.realInRange(0, _this.world.width), 0);
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
    this.damages.forEach(function (d) {
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
  showWeapon: function showWeapon() {
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
    isSwinging.from({ y: -20, rotation: Phaser.Math.degToRad(rotation) }, 150, Phaser.Easing.Exponential.Out);
    isSwinging.onComplete.addOnce(function () {
      this.sword.sprite.kill();
    }, this);
    isSwinging.start();
    //this.swordTimeout = this.time.events.add(100, this.hideWeapon, this);
  },
  hideWeapon: function hideWeapon() {
    this.sword.sprite.kill();
  },

  //render() {
  //  this.game.debug.spriteBounds(this.sword);
  //},

  fire: function fire() {
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
  enemyHit: function enemyHit(enemy, bullet) {
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
  bulletRemove: function bulletRemove(bullet) {
    bullet.kill();
  },
  fadeOutParticle: function fadeOutParticle(p) {
    p.alpha = p.lifespan / this.explosions.lifespan;
  },
  update: function update() {
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
    } else if (player.isFacing === 'right') {
      this.sword.x = player.x + player.width * 0.5;
    }
    this.sword.y = this.player.y;
  }
};

window.onload = function () {
  var game = new Phaser.Game(800, 320, Phaser.AUTO);
  game.state.add('boot', boot);
  game.state.add('shooter', Shooter);
  game.state.add('platformer', platformer);
  game.state.start('boot');
};
//# sourceMappingURL=app.js.map
