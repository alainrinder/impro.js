module.exports = function(grunt) {
  'use script';

  var orderedSources = [
    'src/main.js',
    'src/utils.js',
    'src/exception.js',
    'src/image.js',
    'src/process.js',
    'src/**/*.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: '\'use strict\';\n\n',
        separator: '\n\n'
      },
      dist: {
        src: orderedSources,
        dest: 'bin/<%= pkg.name %>'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'bin/<%= pkg.name.replace(".js", ".min.js") %>': ['<%= concat.dist.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'src/*.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        undef: true,
        unused: false, //'vars',
        latedef: true,
        eqeqeq: true,
        quotmark: 'single',
        nonbsp: true,
        predef: ['ImPro'],
        globals: {
          window: true,
          console: true,
          module: true,
          document: true,
          performance: true,
          'ImPro': true,
        }
      }
    },
    removeLoggingCalls: {
      files: ['<%= pkg.name %>.js'],
      options: {
        methods: ['assert', 'log', 'info', 'warn'],
        strategy: function(statement) {
          return 'null /* ' + statement + ' */';
        }
      }
    },
    jsdoc: {
      dist: {
        src: orderedSources,
        dest: 'doc',
        lenient: true
      }
    },
    clean: {
      'doc': ['doc/*.html']
    },
    jasmine: {
      'all': {
        src: orderedSources,
        options: {
          specs: './spec/*.spec.js',
          helpers: './spec/*.helper.js'
        }
      }
    },
    'http-server': {
      'dev': {
        root: '.',
        port: 8080,
        host: '127.0.0.1',
        runInBackground: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-remove-logging-calls');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-http-server');

  grunt.registerTask('build', ['jshint', 'concat', 'removeLoggingCalls', 'uglify', 'clean:doc', 'jsdoc']);
  grunt.registerTask('test', ['jshint', 'jasmine:all']);
  grunt.registerTask('run', ['http-server:dev']);
};
