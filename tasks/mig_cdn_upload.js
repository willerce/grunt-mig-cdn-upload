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

'use strict';

module.exports = function (grunt) {

  grunt.registerMultiTask('mig_cdn_upload', 'The best Grunt plugin ever.', function () {

    var done = this.async();

    var options = this.options({
      upload_url: '',
      appname: '',
      folder: '',
      user: '',
      key: ''
    });

    // 文件遍历
    this.files.forEach(function (file) {
      file.src.filter(function (filepath) {
        //移除不存在的文件
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {

          var stats = fs.statSync(filepath);

          if (stats.isFile()) {
            return true;
          }

        }
      }).map(function (filepath) {

        var fileType = path.extname(filepath);
        var fileName = path.basename(filepath, fileType);
        var stats = fs.statSync(filepath);
        var fileSize = stats["size"];

        //拼接 URL
        var upload_url = options.upload_url + "?" +
          'appname=' + options.appname +
          '&user=' + options.user +
          '&filename=' + fileName +
          '&filetype=' + fileType.replace('.', '') +
          '&filepath=' + options.folder +
          '&filesize=' + fileSize;

        //读取文件流上传
        fs.createReadStream(path.join(process.cwd(), filepath)).pipe(
          request({
              method: 'POST',
              uri: upload_url,
              headers: {'X-CDN-Authentication': options.key}
            }, function (error, response, body) {

              if (response.statusCode === 200) {
                //上传成功
                var bodyObj = JSON.parse(body);
                var urls = bodyObj['cdn_url'].split('|');

                if (!!urls || urls.length === 0) {
                  grunt.log.error(JSON.stringify({'msg': 'error', 'url': 'not found'}));
                } else {
                  grunt.log.writeln('File "' + urls + '" uploaded.');
                }

              } else {
                grunt.log.error(JSON.stringify({
                  'msg': 'error',
                  'url': 'upload error, response status code is ' + response.statusCode
                }));
              }

              done();
            }
          ));
      });
    });
  });

};
