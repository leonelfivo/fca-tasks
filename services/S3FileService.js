/*
* DEPENDENCES
*/
var s3 = require('s3');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./properties/properties.file');

var s3Key = properties.get('aws.s3.key');
var s3Secret = properties.get('aws.s3.secret');
var s3Region = properties.get('aws.s3.region');
var s3BucketName = properties.get('aws.s3.bucketName');
var s3Path = properties.get('aws.s3.path');

exports.startUpload = function(localFile, onDone) {

  console.log("upload process start...");  

  var s3Client = createClient();

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
    //console.log("progress", Math.round((uploader.progressAmount * 100) / uploader.progressTotal) + "%");
    //console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);        
  });

  uploader.on('end', function() {
    console.log("upload done successfully!");
    return onDone(getS3Url(getFileName(localFile)));
  });  
};

function createClient() {
  var client = s3.createClient({    
    maxAsyncS3: 20,     // this is the default
    s3RetryCount: 3,    // this is the default
    s3RetryDelay: 1000, // this is the default
    multipartUploadThreshold: 20971520, // this is the default (20 MB)
    multipartUploadSize: 15728640, // this is the default (15 MB)
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
