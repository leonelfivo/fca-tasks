var Excel 	= require('exceljs');
var MailHelper 	= require('./MailHelper.js');
var PropertiesReader = require('properties-reader');

var properties = PropertiesReader('./properties/properties.file');

exports.generate = function(stream) {
	var workbook = new Excel.Workbook();	
	var sheet = workbook.addWorksheet('FCA Dealer Info');

	var mailSubject = "Task Info: OK!";
	var	mailMessage = "<p>O relatório foi gerado e enviado com sucesso!";		

	// fetch sheet by id 
	var worksheet = workbook.getWorksheet(1);

	stream.on('error', function (error) {		    	
		// Create error email params
    	mailSubject = "Task Info: ERROR!";
		mailMessage = "<p>Ocorreu um erro na geração do relatório!</p> <p/>Erro:<p/>'" + err;
    	return;
	});

	// Create Head	
	stream.on('metadata', function (metadata) {		
		var head = [];
		metadata.forEach(function(element, index, array) {
			head.push(element.name);
		});
		worksheet.addRow(head);
	});

	// Create Body
	stream.on('data', function (data) {	
		worksheet.addRow(data);
	});

	stream.on('end', function () {
								
		// Envia email com arquivo anexo
		workbook.xlsx.writeFile("./exports/"+getFileName())
	    .then(function() {
	    	// Create attachement
	    	var attachments = [
	    		{ 
	    			filename: getFileName(), 
	    			path: './exports/'+getFileName()
	    		}
	    	];

	    	// Attachment Email
	    	var mailParams = {
	    		from: properties.get('mail.send.from'),
	    		to: properties.get('mail.send.to'), 
	    		subject: "Base de Dados FCA Dealer " + getCurrentDate(), 
	    		message: "<p>Bom dia,</p><p>Segue base de dados atualizada.</p><p>Atenciosamente,</p>", 
	    		attachments: attachments
	    	};

	    	// Notification Email
	    	var mailNotificationParams = {
	    		from: properties.get('mail.send.from'),
	    		to: properties.get('mail.notification.to'),
	    		subject: mailSubject, 
	    		message: mailMessage, 
	    		attachments: []
	    	};

        	MailHelper.send(mailParams);
	        MailHelper.send(mailNotificationParams);		    

	    });
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