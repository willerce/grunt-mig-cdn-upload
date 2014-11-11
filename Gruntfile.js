/*
 *
 *
 *
 * Copyright (c) 2014
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    mig_cdn_upload: {
      beta: {
        options: {
          upload_url: 'url',//上传地址，不需要修改
          appname: 'appname',//业务英文名称：appname=haina_img_new;
          user: 'user',//确保上传者（user字段值）是业务的管理员之一
          key: 'key' //这个key可以找CDN运维同学获得
        },
        files: [{expand: true, cwd: 'test/upload', src: ['**'], filter: 'isFile', dest: '/proj-text/beta/'}]
      },
      dist: {
        options: {
          upload_url: 'url',//上传地址，不需要修改
          appname: 'appname',//业务英文名称：appname=haina_img_new;
          user: 'user',//确保上传者（user字段值）是业务的管理员之一
          key: 'key' //这个key可以找CDN运维同学获得
        },
        files: [
          {expand: true, cwd: 'test/upload', src: ['**'], filter: 'isFile', dest: '/proj-text/dist/'},
          {expand: true, cwd: 'test/upload_2', src: ['**'], filter: 'isFile', dest: '/proj-text/dist/'}
        ]
      }
    },

    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['nodeunit']);

  grunt.registerTask('default', ['mig_cdn_upload']);

};
