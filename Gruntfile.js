'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

/**
 * Explaining grunt dependencies
 *
 *
 *
 */

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    appRoot: 'app',
    distRoot: 'dist',

    pkg: grunt.file.readJSON('package.json'),
    bowerRC: grunt.file.readJSON('.bowerrc'),

    /**
     We do not need to write a dynamic config file for now.
     //configFile: grunt.file.readJSON('config.json'),
     **/
    writefile: {
      options: {
        data: {
          version: '<%= pkg.version %>',
          builtDate: '<%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>'
        }
      },
      configFile: {
        src: 'grunt_templates/template.hbs',
        dest: 'path/to/config/file.js'
      }
    },

    /** Parse CHANGELOG.md to a HTML file **/
    markdown: {
      changeLog: {
        files: [
          {
            expand: true,
            src: 'CHANGELOG.md',
            dest: 'app/',
            ext: '.html'
          }
        ]
      }
    },

    /* Watches files for changes and runs tasks based on the changed files */
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep', 'injector']
      },
      js: {
        files: [
          '<%= appRoot %>/scripts/**/*.js'
        ],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
//      TODO: Implement as soon as we have tests running
//      jsTest: {
//        files: ['test/spec/{,*/}*.js'],
//        tasks: ['newer:jshint:test', 'karma']
//      },
      styles: {
        files: ['<%= appRoot %>/styles/**/*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= appRoot %>/**/*.html',
          '.tmp/styles/**/*.css',
          '<%= appRoot %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    /* Grunt Server Settings */
    connect: {
      options: {
        port: 9002,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          middleware: function (connect, options) {
            if (!Array.isArray(options.base)) {
              options.base = [options.base];
            }

            // Setup the proxy
            var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

            // Serve static files.
            options.base.forEach(function (base) {
              middlewares.push(connect.static(base));
            });

            // Make directory browse-able.
            var directory = options.directory || options.base[options.base.length - 1];
            middlewares.push(connect.directory(directory));

            return middlewares;
          },
          open: true,
          base: [
            '.tmp',
            '<%= appRoot %>'
          ]
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= appRoot %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= distRoot %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= appRoot %>/scripts/**/*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/**/*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= distRoot %>/*',
              '!<%= distRoot %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 3 version', 'ie > 9']
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/styles/',
            src: '**/*.css',
            dest: '.tmp/styles/'
          }
        ]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= appRoot %>/index.html'],
        exclude: [
          'es5-shim.js', //Deactivated as we do not want to support ie9
          'bootstrap.js', //Deactivated as we do not need it
          'ui-bootstrap' //Deactivated as we do not need it
        ],
        ignorePath: '<%= appRoot %>/'
      }
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= distRoot %>/scripts/**/*.js',
            '<%= distRoot %>/styles/**/*.css'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= appRoot %>/index.html',
      options: {
        dest: '<%= distRoot %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= distRoot %>/{,*/}*.html'],
      css: ['<%= distRoot %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= distRoot %>']
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    cssmin: {
      options: {
//                root: '<%= appRoot %>'
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= distRoot %>',
            src: ['*.html', 'template/**/*.html'],
            dest: '<%= distRoot %>'
          }
        ]
      }
    },

    // ngmin tries to make the code safe for minification automatically by
    // using the Angular long form for dependency injection. It doesn't work on
    // things like resolve or inject so those have to be done manually.
    ngmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/scripts',
            src: '*.js',
            dest: '.tmp/concat/scripts'
          }
        ]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      images: {
        files: [
          {
            expand: true,
            cwd: '<%= appRoot %>/images',
            src: '**/*.{png,jpg,jpeg,gif}',
            dest: '<%= distRoot %>/images'
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= appRoot %>',
            dest: '<%= distRoot %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              '*.html',
              'template/**/*.html'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= distRoot %>/images',
            src: ['generated/*']
          },
          // Copy bootstrap fonts
          {
            expand: true,
            cwd: '<%= bowerRC.directory %>/bootstrap/dist/fonts/',
            src: ['**'],
            dest: '<%= distRoot %>/fonts/'
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= appRoot %>/styles',
        dest: '.tmp/styles/',
        src: '**/*.css'
      }
    },

    injector: {
        options: {
          ignorePath: '<%= appRoot %>/',
        addRootSlash: false
        },
        local_dependencies: {
          files: {
            'app/index.html': ['<%= appRoot %>/scripts/**/*.js', '<%= appRoot %>/styles/**/*.css']
          }
        }
    },

    // TODO: Adjust karma settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.registerTask('serve', function () {
    var target = grunt.option('target') || 'dev';
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }
    grunt.task.run([
      // 'writefile:configFile', At the moment we have a fixed config file
      // 'markdown:changeLog', At the moment we have no Changelog
      'clean:server',
      'injector',
      'wiredep',
      'copy:styles',
      'autoprefixer',
      //'configureProxies:server',
      'connect:livereload',
      'watch'
    ]);
  });

  //TODO: Actually implement testing
  grunt.registerTask('test', [
    // 'writefile:configFile', // At the moment we have a fixed config file
    // 'markdown:changeLog', // At the moment we have no Changelog
    // 'clean:server',
    // 'copy:styles',
    // 'autoprefixer',
    // 'configureProxies:server',
    // 'connect:test',
    // 'karma'
  ]);

  /**
   *
   * Grunt Build Task. This Task creates a directory dist which contains a deployable app
   *
   */
  grunt.registerTask('build', [
    // 'writefile:configFile', // At the moment we have a fixed config file
    // 'markdown:changeLog', // At the moment we have no Changelog
    'clean:dist',     // Clean Destination Folder
    'injector',        // Automatically at dependencies from bower path (bower.json)
    'wiredep',        // Automatically at dependencies from bower path (bower.json)
    'useminPrepare',  // Prepare minification
    'copy:images',    // Copy images to Dist
    'copy:styles',    // Copy stylesheets to Dist
    'autoprefixer',   // Adds prefixes to css properties (ie -webkit-property, -moz-property)
    'concat',         // Concat styles and scripts into one file
    'ngmin',          // preminify Angular files (i.e. function ($scope) -> ['$scope', function($scope)])
    'copy:dist',      // Copy remaining files to Dist
    'cssmin',         // Minify CSS
    'uglify',         // Minify JS
    'rev',            // Create file revisions to force browser reload
    'usemin',         // Replace links to CSS and scripts with revisioned ones in index.html
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    // 'test', TODO: Tests are not implemented yet
    'build'
  ]);
};
