module.exports = (grunt) ->

  grunt.initConfig
    clean: ['lib']

    coffee:
      compile:
        expand: true
        cwd: 'src'
        src: ['**/*.coffee']
        dest: 'lib/'
        ext: '.js'

    watch:
      coffee:
        files: '{src,test}/**/*.coffee'
        tasks: ['coffeelint', 'mochaTest']
        options:
          atBegin: true

    coffeelint:
      files: '{src,test}/**/*.coffee'

    mochaTest:
      test:
        src: ['test/**/*.coffee']

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-mocha-test'

  grunt.registerTask 'default', 'watch'
  grunt.registerTask 'build', ['clean', 'coffee']