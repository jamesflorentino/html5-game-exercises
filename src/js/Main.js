import boot from './states/boot';
import shooter from './states/shooter';
import platformer from './states/platformer';

window.onload = function() {
  var game = new Phaser.Game(800, 320, Phaser.AUTO);
  game.state.add('boot', boot);
  game.state.add('shooter', shooter);
  game.state.add('platformer', platformer);
  game.state.start('boot');
};
