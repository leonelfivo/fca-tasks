var XLSXWriter 			= require('xlsx-writestream');
var fs 			= require('fs');
var MailHelper 			= require('./MailHelper.js');
var S3Service 			= require('./S3FileService.js');
var PropertiesReader 	= require('properties-reader');

var properties = PropertiesReader('./properties/properties.file');

var currentFileName = "";

exports.generate = function(stream) {

	currentFileName = generateFileName();

	// Default message text
	var mailSubject = "Task Info: OK!";
	var	mailMessage = "<p>O relatório foi gerado e enviado com sucesso!";		

	// Verify possibles error and toggle success message to error message
	stream.on('error', function (err) {		    	
		// Create error email params
		console.log("Mail error:" + err.stack);
    	mailSubject = "Task Info: ERROR!";
		mailMessage = "<p>Ocorreu um erro na geração do relatório!</p> <p/>Erro:<p/>'" + err.stack;
    	return;	
    });

	// Open file to Stream
	var writer = new XLSXWriter("./exports/"+currentFileName, {});
	writer.getReadStream().pipe(fs.createWriteStream("./exports/"+currentFileName));	

	console.log("./exports/"+currentFileName + " criado.");

	// Create Header based in metadata
	stream.on('metadata', function (metadata) {		
		console.log("Iniciando escrita no arquivo...");
		
		var head = [];
		metadata.forEach(function(element, index, array) {
			head.push(element.name);
		});
		writer.addRow(head);
	});

	// Create document body
	stream.on('data', function (data) {	
		writer.addRow(data);
	});

	// Finalize actions
	stream.on('end', function () {

		// Finalize file writer
		writer.finalize();
		console.log("Escrita concluída.");
		
		// Prepare emails

    	// Create attachement
    	/*var attachments = [
    		{ 
    			filename: generateFileName(), 
    			path: './exports/'+generateFileName()
    		}
    	];*/

    	S3Service.startUpload("./exports/"+currentFileName, function(fileUrl) {    		
    		// Attachment Email params
	    	var mailParams = {
	    		from: properties.get('mail.send.from'),
	    		to: properties.get('mail.send.to'), 
	    		cc: properties.get('mail.send.cc'), 
	    		bcc: properties.get('mail.send.bcc'), 
	    		subject: "Base de Dados FCA Dealer " + getCurrentDate(), 
	    		message: getEmailTemplate(fileUrl), 
	    		attachments: []
	    	};

	    	// Notification Email params
	    	var mailNotificationParams = {
	    		from: properties.get('mail.send.from'),
	    		to: properties.get('mail.notification.to'),
	    		subject: mailSubject, 
	    		message: mailMessage, 
	    		attachments: []
	    	};

	    	// Send email
	    	//MailHelper.send(mailParams);
	        //MailHelper.send(mailNotificationParams);
    	});			    

    });

};

function generateFileName() {
	var date = new Date();    
	var fileName = "fcadealerinfo-database-{versionid}.xlsx";
	var versionid = date.getDate() + "" + (date.getMonth() + 1) + "" + date.getFullYear();
	return fileName.replace("{versionid}", versionid);
}

function getCurrentDate() {
	var date = new Date();    
	var formatedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
	return formatedDate;
}

function getEmailTemplate(fileUrl) {
	var tenplate=
	"<p>Bom dia,</p>"+
	"<p>Segue link para download da base de dados atualizada!</p>"+
	"<p><a href='"+fileUrl+"' target='_blank'>Clique aqui para baixar.</a></p>"+
	"<p>Atenciosamente,</p>"+
	"<p>Equipe FCA.</p>";

	return tenplate;
}
