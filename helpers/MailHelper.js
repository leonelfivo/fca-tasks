/*
* DEPENDENCES
*/
var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./properties/properties.file');

// Mail Server Configurations
var mailOptions = {
    host: properties.get('mail.host'),
    port: properties.get('mail.port'),
    auth: {
        user: properties.get('mail.username'),
        pass: properties.get('mail.password')
    }
};

var NodeMailer = require('nodemailer');
var transporter = NodeMailer.createTransport(mailOptions);

// Functions
exports.send = function(params) {
	// send mail 
	transporter.sendMail({
	    from: mailOptions.auth.user,
	    to: params.to,
	    cc: params.cc,
	    bcc: params.bcc,
	    subject: params.subject,
	    html: params.message,
	    attachments: params.attachments
	}, function(error, response) {
	   if (error) {
	        console.log(error);
	   } else {
	        console.log('Message sent');
	   }
	});
};