const Shooter = {
  create() {
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

  startFiring() {
    this.isFiring = true;
  },

  stopFiring() {
    this.isFiring = false;
  },

  createParticles() {
    var shrapnels = this.shrapnels = this.add.emitter(0, 0, 100);
    shrapnels.maxParticleScale = 0.5;
    shrapnels.minParticleScale = 0.1;
    shrapnels.bounce.x = 1;
    shrapnels.gravity = 0;
    shrapnels.minParticleSpeed.setTo(-1000, 1000);
    shrapnels.maxParticleSpeed.setTo(1000, -1000);
    shrapnels.makeParticles('enemy');
  },

  createExplosions() {
    var explosions = this.explosions = this.add.group();
    explosions.createMultiple(100, 'explosion');
    explosions.setAll('checkWorldBounds');
    explosions.setAll('outOfBoundsKill');
    //explosions.setAll('scale.x', 0.5);
    //explosions.setAll('scale.y', 0.5);
    explosions.setAll('anchor.x', 0.5);
    explosions.setAll('anchor.y', 0.5);
    explosions.forEach(e => {
      e.animations.add('kaboom');
    });
  },

  explode(sprite) {
    var explosion = this.explosions.getFirstDead();
    explosion.reset(sprite.x, sprite.y);
    explosion.angle = Phaser.Math.degToRad(this.rnd.integerInRange(0, 360));
    explosion.animations.play('kaboom', 80, false, true);
    this.shrapnels.emitX = sprite.x;
    this.shrapnels.emitY = sprite.y;
    this.shrapnels.start(true, 1000, null, 20);
    return explosion;
  },

  enemyHit(bullet, enemy) {
    bullet.kill();
    this.explode(enemy);
    enemy.x = this.world.width * Math.random();
    enemy.y = this.rnd.integerInRange(0, 100);
  },

  createBulletPool() {
    var bullets = this.bullets = this.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(100, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('anchor.x', 0.5);
  },

  createEnemies() {
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

  spawnEnemy(enemy) {
    enemy.position.set(this.world.width * Math.random(), 100  * Math.random());
    enemy.exists = true;
  },

  createPlayer() {
    console.log(this.world.height);
    var player = this.add.sprite(this.world.width * 0.5, this.world.height - 200, 'ship');
    player.anchor.set(0.5);
    player.scale.set(0.35);
    this.game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;
    this.player = player;
  },

  lastFired: Date.now(),

  canFire() {
    var now = Date.now();
    if (now > this.lastFired) {
      this.lastFired = now + 350;
      return true;
    }
    return false;
  },

  fire() {
    if (!this.canFire()) {
      return;
    }
    var total = 3;
    var cone = 30;
    var step = cone / total;
    for(var i=0;i<total;i++) {
      var bullet = this.bullets.getFirstDead();
      if (bullet) {
        bullet.reset(this.player.x, this.player.y - 50);
        bullet.rotation = Phaser.Math.degToRad((step * i) - (cone * 0.5));
        this.physics.arcade.velocityFromRotation(bullet.rotation - Phaser.Math.degToRad(90), 400, bullet.body.velocity);
      }
    }
  },

  moveEnemy(enemy) {
    if (enemy.x < 0) {
      enemy.x = 20;
      enemy.body.velocity.x *= -1;
    } else if (enemy.x > this.world.width) {
      enemy.x = this.world.width - 10;
      enemy.body.velocity.x *= -1;
    }
  },

  update() {
    this.physics.arcade.overlap(this.bullets, this.enemies, this.enemyHit, null, this);
    //this.physics.arcade.overlap(this.explosions, this.enemies, this.enemyHit, null, this);
    const { player, cursors } = this;

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

export default Shooter;
