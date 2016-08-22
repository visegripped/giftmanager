module.exports = function(grunt) {

    grunt.initConfig({

        connect: {
            server: {
                options: {
                    keepalive:true,
                    port: 8082,
                    hostname:"127.0.0.1"
                    //livereload : 8082
                }
            }
        },

        less : {
          options : {
            sourceMap : true,
            sourceMapFilename : 'dest/css/userlist.css.map',
            compress : false
          },
          theme : {
            expand : true,
            flatten : true,
            src : ["src/less/userlist.less"],
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
