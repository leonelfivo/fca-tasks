var XLSXWriter = require('xlsx-writestream');
var fs = require('fs');
var MailHelper 	= require('./MailHelper.js');
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./properties/properties.file');

exports.generate = function(stream) {

	// Default message text
	var mailSubject = "Task Info: OK!";
	var	mailMessage = "<p>O relatório foi gerado e enviado com sucesso!";		

	// Verify possibles error and toggle success message to error message
	stream.on('error', function (error) {		    	
		// Create error email params
    	mailSubject = "Task Info: ERROR!";
		mailMessage = "<p>Ocorreu um erro na geração do relatório!</p> <p/>Erro:<p/>'" + err;
    	return;	});

	// Open file to Stream
	var writer = new XLSXWriter("./exports/"+getFileName(), {});
	writer.getReadStream().pipe(fs.createWriteStream("./exports/"+getFileName()));	

	// Create Header based in metadata
	stream.on('metadata', function (metadata) {		
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
		
		// Prepare emails

    	// Create attachement
    	var attachments = [
    		{ 
    			filename: getFileName(), 
    			path: './exports/'+getFileName()
    		}
    	];

    	// Attachment Email params
    	var mailParams = {
    		from: properties.get('mail.send.from'),
    		to: properties.get('mail.send.to'), 
    		cc: properties.get('mail.send.cc'), 
    		bcc: properties.get('mail.send.bcc'), 
    		subject: "Base de Dados FCA Dealer " + getCurrentDate(), 
    		message: "<p>Bom dia,</p><p>Segue base de dados atualizada.</p><p>Atenciosamente,</p>", 
    		attachments: attachments
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
    	MailHelper.send(mailParams);
        MailHelper.send(mailNotificationParams);		    

    });

};

function getFileName() {
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