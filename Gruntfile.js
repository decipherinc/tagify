'use strict';

module.exports = function (grunt) {

    var path = require('path'),
        pkg = require('./package.json');

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        min: path.basename(pkg.main, '.js') + '.min.js',
        qunit: {
            all: {
                options: {
                    urls: [
                        'http://0.0.0.0:8000/tests/test_tagify.html'
                    ],
                    force: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: '.'
                }
            }
        },
        'bower-install-simple': {
            main: {
                options: {
                    directory: './tests/lib'
                }
            }
        },
        devUpdate: {
            main: {
                options: {
                    semver: false,
                    updateType: 'prompt'
                }
            }
        },
        uglify: {
            main: {
                files: {
                    '<%= min %>': '<%= pkg.main %>'
                },
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= pkg.homepage %>\n' +
                    ' * Copyright (c) <%= grunt.template.today("yyyy") %> Decipher, Inc.;' +
                    ' Licensed <%= pkg.license %> */',
                    sourceMap: true
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json',
                    'jquery.tagify.jquery.json'],
                updateConfigs: ['pkg'],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: [
                    'package.json',
                    'bower.json',
                    'tagify.jquery.json',
                    '<%= min %>',
                    '<%= min %>' + '.map'
                ],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('test',
        ['bower-install-simple:main', 'connect', 'qunit']);
    grunt.registerTask('default', ['uglify:main']);

    grunt.registerTask('release', 'Make a new release', function (target) {
        var task = grunt.task;
        task.run('bump-only:' + target);
        task.run('uglify:main');
        task.run('bump-commit');
    });

    grunt.event.on('qunit.log',
        function (result, actual, expected, message) {
            if (!!result) {
                grunt.log.ok(message);
            }
        });
};
