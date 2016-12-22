/*
* DEPENDENCES
*/
var AWS      = require('aws-sdk');
AWS.config.loadFromPath('./services/config.json');    

var fs       = require('fs');
var s3Stream = require('s3-upload-stream')(new AWS.S3());
 
// Set the client to be used for the upload. 
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./properties/properties.file');

var s3Key = properties.get('aws.s3.key');
var s3Secret = properties.get('aws.s3.secret');
var s3Region = properties.get('aws.s3.region');
var s3BucketName = properties.get('aws.s3.bucketName');
var s3Path = properties.get('aws.s3.path');

exports.startUpload = function(localFile, onDone) {
  console.log("upload process start..."); 

  console.log("FILE: "+getFileName(localFile)); 

  // Create the streams 
  var read = fs.createReadStream(localFile);  
  var upload = s3Stream.upload({
    "Bucket": s3BucketName+s3Path,
    "Key": getFileName(localFile)
  });
   
  // Optional configuration 
  upload.maxPartSize(20971520); // 20 MB 
  upload.concurrentParts(5);
   
  // Handle errors. 
  upload.on('error', function (error) {
      console.error("Unable to upload:", error);  
      return;  
  });
   
  upload.on('part', function (details) {      
      console.log("Uploading File...");
  });
   
  upload.on('uploaded', function(details) {
    console.log("upload done successfully!");
    return onDone(getS3Url(getFileName(localFile)));
  });  

  read.pipe(upload);
};

function getFileName(path) {  
  return path.replace(/^.*[\\\/]/, '');
}

function getS3Url(fileName) {
  return s3Url="http://s3-"+s3Region+".amazonaws.com/"+s3BucketName+s3Path+"/"+fileName;  
}