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
            src : ["src/less/*.less"],
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
	  },


	  concat: {
	      js: {
	        src: ['src/js/*.js'],
	        dest: 'dist/js/gm.js',
			options: {
				stripBanners: true
		    }
	      },
	      css: {
	        src: ['dist/css/*.css'],
	        dest: 'dist/css/gm.css',
	      },
	  },


	  uglify: {
		  js: {
			  options: {
				  sourceMap: false, //set to true once we're building a sourcemap file.
				//   sourceMapName: 'dest/js/sourcemap.map'
			  },
			  files: {
			  	'dist/js/gm.min.js': ['dist/js/gm.js']
			  }
		  },
		  css: {
			  options: {
				  sourceMap: false, //set to true once we're building a sourcemap file.
				//   sourceMapName: 'dest/js/sourcemap.map'
			  },
			  files: {
				'dist/css/gm.min.css': ['dist/css/gm.css']
			  }
		  }
	  }


    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default',['connect','less','watch']);

	grunt.registerTask('release',['less','concat','uglify']);


};
