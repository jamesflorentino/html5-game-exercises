module.exports = function(grunt) {
  require("load-grunt-tasks")(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    connect: {
      server: {
        options: {
          port: 9001
        }
      }
    },

    rollup: {
      options: {},
      files: {
        dest: 'dist/js/Main.js',
        'src': 'src/js/Main.js',
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: {
          'dist/js/app.js': 'dist/js/Main.js'
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['rollup', 'babel']
      }
    }
  });

  grunt.registerTask('serve', ['rollup', 'babel', 'connect:server', 'watch']);
};
