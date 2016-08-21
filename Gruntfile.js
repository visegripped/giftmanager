module.exports = function(grunt) {

    grunt.initConfig({

        connect: {
            server: {
                options: {
                    keepalive:true,
                    port: 8082,
                    hostname:"127.0.0.1"
                    //livereload : 8082
                },
                livereload: {
                    options: {
                        open: true,
                        middleware: function (connect) {
                            return [
                                connect.static('.tmp')
                            ];
                        }
                    }
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default',['connect']);


};