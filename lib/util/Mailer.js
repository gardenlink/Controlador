/*
 * Mailer Helper
 * https://github.com/Gerdenlink
 *
 */


var method = Mailer.prototype;

var nodemailer = require("nodemailer");
var smtpTransport;
var mailOptions;

var _to;
var _from;

var _conf_service;
var _conf_user;
var _conf_pass;
var _conf_enabled;  //servicio habilitado

var _logger;

/**
* config : configuracion de inicio (Json Format)
* logger : objeto winston preconfigurado
*/
function Mailer(config, logger)
{

	//load Config
	_conf_service = config.mailer_service;
	_conf_user = config.mailer_user;
	_conf_pass = config.mailer_pass;
	_conf_enabled = config.mail_enabled;

	_to = config.mailer_destinatario; //puede ser separado por comas
	_from = config.mailer_remitente;

	this._logger = logger;

	// create reusable transport method (opens pool of SMTP connections)
	 smtpTransport = nodemailer.createTransport("SMTP",{
	    service: _conf_service,
	    auth: {
	        user: _conf_user,
	        pass: _conf_pass
	    }
	});

}

method.Enviar = function(subject, texto) {

	// setup e-mail data with unicode symbols
	 mailOptions = {
	    from: _from, // sender address
	    to: _to, // list of receivers
	    subject: subject, // Subject line
	    text: texto // plaintext body
	    //html: "<b>Hello world ✔</b>" // html body
	}
	var logger = this._logger;

	if (_conf_enabled == true || _conf_enabled == "true") //si esta habilitado por configuracion..
	{
		// send mail with defined transport object
		smtpTransport.sendMail(mailOptions,  function(error, response){
		    if(error){
		        console.log("Error al enviar mail .. Detalle de error: " + error.message);
		        
		    }else{
		        console.log("Mensaje Enviado: " + response.message);
		    }

		    // if you don't want to use this transport object anymore, uncomment following line
		    //smtpTransport.close(); // shut down the connection pool, no more messages
		});
	}
	return true;
};

module.exports = Mailer;