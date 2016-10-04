module.exports = function(grunt) {
//https://atom.io/packages/grunt-runner
    grunt.initConfig({

        connect: {
            server: {
                options: {
                    keepalive:true,
                    port: 8080,
                    hostname:"127.0.0.1"
                    //livereload : 8082
                }
            }
        },

        less : {
          options : {
            sourceMap : false,
            sourceMapFilename : 'dist/css/*.css.map',
            compress : false
          },
          theme : {
            expand : true,
            flatten : true,
            src : ["src/less/itemlist.less","src/less/userlist.less","src/less/itemadd.less","src/less/errors.less"],
            dest : "dist/css/",
            ext : ".css"
          }
        },

        watch : {
          less : {
            files : ['src/less/*.less'],
            tasks : ['less'],
            options : {
              interrupt : false
            }
          }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default',['connect','less','watch']);


};
