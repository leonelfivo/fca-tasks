
var express = require('express');
var app = express();

app.get('/download/:filename', function (req, res) {

	var filename = req.params.filename;
	var pathName = 'exports/';
  	var file = pathName + filename;

	if(filename == null)
		res.download("Este arquivo não existe!");
	else
  		res.download(file);
});

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});