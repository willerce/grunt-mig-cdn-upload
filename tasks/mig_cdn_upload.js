/*
 * grunt-mig-cdn-upload
 * https://github.com/willerce/grunt-mig-cdn-upload
 *
 * Copyright (c) 2014 willerce (willerce@gmail.com)
 * Licensed under the MIT license.
 */

var fs = require('fs-extra');
var request = require('request');
var path = require('path');
var async = require('async');

'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('mig_cdn_upload', 'The best Grunt plugin ever.', function () {

    var done = this.async();

    var options = this.options({
      upload_url: '',
      appname: '',
      user: '',
      key: ''
    });

    var q = async.queue(function (task, callback) {

      var filepath = task.filepath;
      var file = task.file;

      grunt.log.writeln("开始上传:" + filepath);

      fs.stat(filepath, function (err, stats) {

        var fileType = path.extname(filepath);
        var fileName = path.basename(filepath, fileType);
        var fileSize = stats["size"];

        //拼接 URL
        var upload_url = options.upload_url + "?" +
          'appname=' + options.appname +
          '&user=' + options.user +
          '&filename=' + fileName +
          '&filetype=' + fileType.replace('.', '') +
          '&filepath=' + path.dirname(file.dest) +
          '&filesize=' + fileSize;

        //读取文件流上传
        fs.createReadStream(path.join(process.cwd(), filepath)).pipe(
          request({
              method: 'POST',
              uri: upload_url,
              headers: {'X-CDN-Authentication': options.key}
            }, function (error, response, body) {

              if (error) {
                grunt.log.error("网络错误：" + filepath + "，错误信息：" + JSON.stringify(error));
              } else if (response.statusCode === 200) {

                //上传成功
                var bodyObj = JSON.parse(body);
                var urls = bodyObj['cdn_url'].split('|');

                if (!urls || urls.length === 0) {
                  grunt.log.error(JSON.stringify({'msg': 'error', 'url': 'not found'}));
                  grunt.log.error(body);
                } else {
                  grunt.log.ok('File "' + urls + '" uploaded.');
                }

              } else {
                grunt.log.error("上传错误：" + filepath + JSON.stringify({
                  'msg': 'error',
                  'url': 'upload error, response status code is ' + response.statusCode
                }));
              }

              callback();

            }
          ));
      });
    }, 100);

    q.drain = function () {
      done();
    };

    this.files.forEach(function (file) {
      file.src.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return !!grunt.file.isFile(filepath);
        }
      }).map(function (filepath) {
        //循环添加任务
        q.push({file: file, filepath: filepath});

      });
    });

  });
};
