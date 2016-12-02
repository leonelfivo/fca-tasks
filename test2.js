var S3Service 			= require('./services/S3FileService.js');
var PropertiesReader 	= require('properties-reader');
var s3 					= require('s3');
var PropertiesReader 	= require('properties-reader');

var properties = PropertiesReader('./properties/properties.file');

var s3Key = properties.get('aws.s3.key');
var s3Secret = properties.get('aws.s3.secret');
var s3Region = properties.get('aws.s3.region');
var s3BucketName = properties.get('aws.s3.bucketName');
var s3Path = properties.get('aws.s3.path');

var currentFileName = "fcadealerinfo-database-2122016.xlsx"; 

S3Service.startUpload("./exports/"+currentFileName, function(fileUrl) {   			
	console.log("Done " + fileUrl + "!");
});			 