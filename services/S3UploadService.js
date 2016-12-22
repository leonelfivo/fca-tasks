/*
* DEPENDENCES
*/
var s3 = require('s3');
var PropertiesReader = require('properties-reader');

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

var properties = PropertiesReader('./properties/properties.file');

var s3Key = properties.get('aws.s3.key');
var s3Secret = properties.get('aws.s3.secret');
var s3Region = properties.get('aws.s3.region');
var s3BucketName = properties.get('aws.s3.bucketName');
var s3Path = properties.get('aws.s3.path');

var multipartUploadThreshold = 15 * 1024 * 1024;
var multipartUploadSize = 5 * 1024 * 1024;

exports.startUpload = function(localFile, onDone) {

  createBigFile(localFile, 16 * 1024 * 1024, function (err, _hexdigest) {

    console.log("upload process start...");  

    var s3Client = createClient();
    var progressEventCount = 0;

    var params = {
      localFile: localFile,
      s3Params: {
        Bucket: s3BucketName+s3Path,
        Key: getFileName(localFile)
      }
    };
    
    var uploader = s3Client.uploadFile(params);

    uploader.on('error', function(err) {
      console.error("Unable to upload:", err.stack);  
      return;  
    });

    uploader.on('progress', function() {

        var amountDone = uploader.progressAmount;
        var amountTotal = uploader.progressTotal;
        var progress = (amountDone * 100) / amountTotal;   

        console.log("Uploading ", Math.round(progress) + "%");        
    });

    uploader.on('end', function() {
      console.log("upload done successfully!");
      return onDone(getS3Url(getFileName(localFile)));
    });

  });
};

/**
* Functions
*/
function createClient() {
  var client = s3.createClient({    
    maxAsyncS3: 2,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: multipartUploadThreshold, // this is the default (20 MB)
    multipartUploadSize: multipartUploadSize, // this is the default (15 MB)
    signatureVersion: 'v4',
    s3Options: {
      accessKeyId: s3Key,
      secretAccessKey: s3Secret,
      region: s3Region
    },
  });

  return client;
}

function getFileName(path) {  
  return path.replace(/^.*[\\\/]/, '');
}

function getS3Url(fileName) {
  return s3Url="http://s3-"+s3Region+".amazonaws.com/"+s3BucketName+s3Path+"/"+fileName;  
}

function createBigFile(file, size, cb) {
  mkdirp(path.dirname(file), function(err) {
    if (err) return cb(err);
    var md5sum = crypto.createHash('md5');
    var out = fs.createWriteStream(file);
    out.on('error', function(err) {
      cb(err);
    });
    out.on('close', function() {
      cb(null, md5sum.digest('hex'));
    });
    var str = "abcdefghijklmnopqrstuvwxyz";
    var buf = "";
    for (var i = 0; i < size; ++i) {
      buf += str[i % str.length];
    }
    out.write(buf);
    md5sum.update(buf);
    out.end();
  });
}
