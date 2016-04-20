var method = Configuracion.prototype;

var _environment;
var _ambienteHeroku = false;

function Configuracion(environment) { 
	_environment = environment;
	
	if (process.env.HEROKU) {
		console.log("Configuracion : Cargo parametros desde variables de entorno o archivo .env");
		_ambienteHeroku = true;
	}
	else
	{
		console.log("Configuracion : Cargo parametros desde archivo config.json");
	}

};


method.LeerConfiguracion = function() {

	var config;
	if (_ambienteHeroku) 
		config = CargarVariablesEntorno();

	else		
		config = CargarDesdeArchivoConfig();
	
	return config;
}

function CargarVariablesEntorno() {
	_config = 
	{
		 	"app_host" : process.env.app_host,
		    "app_port" : process.env.app_port,
		    "datasource" : {
		        "NEDB"  : { "Habilitado" : process.env.datasource.NEDB.Habilitado,
		                    "Sincronizacion" : process.env.datasource.NEDB.Sincronizacion,
		                    "Debug" : process.env.datasource.NEDB.Debug,
		                    "Intervalo" : process.env.datasource.NEDB.Intervalo },
		        "MONGO" : { "Habilitado" : process.env.datasource.MONGO.Habilitado,
		                     "Sincronizacion" : process.env.datasource.MONGO.Sincronizacion,
		                     "Intervalo" : process.env.datasource.MONGO.Intervalo,
		                     "Debug" : process.env.datasource.MONGO.Debug,
		                     "UserName" : process.env.datasource.MONGO.Username,
		                     "Password" : process.env.datasource.MONGO.Password
		                      },
		        "DWEET" : { "Habilitado" : "false",
		                    "Sincronizacion" : "false",
		                    "Intervalo" : "1",
		                    "prefijo_sensor" : "bb_njs_sensor_",
		                    "prefijo_bomba" : "bb_njs_relay_",
		                    "prefijo_dispositivo": "bb_njs_device_"
		                  }
		        },
		    "mail_enabled" : process.env.mailer.mail_enabled,
		    "mailer_service" : process.env.mailer.mailer_service,
		    "mailer_user" : process.env.mailer.mailer_user,
		    "mailer_pass" : process.env.mailer.mailer_pass,
		    "mailer_destinatario" : process.env.mailer.mailer_destinatario,
		    "mailer_remitente" : process.env.mailer.mailer_remitente,
		    "twitter_enabled" : process.env.twitter.twitter_enabled,
		    "twitter_consumer_secret" :process.env.twitter.twitter_consumer_secret,
		    "twitter_consumer_key":process.env.twitter.twitter_consumer_key,
		    "twitter_access_token":process.env.twitter.twitter_access_token,
		    "twitter_access_token_secret":process.env.twitter.twitter_access_token_secret,
		    "twitter_callback_url" : process.env.twitter.twitter_callback_url,
		    "twitter_autenticacion" : process.env.twitter.twitter_autenticacion,
		    "monitor_habilitado" : process.env.monitor.monitor_habilitado,
		    "monitor_intervalo" : process.env.monitor.monitor_intervalo,
		    "monitor_datasource" : process.env.monitor.monitor_datasource
	};
	
	return _config;
}


function CargarDesdeArchivoConfig() {

	_config = require("../../config.json")[_environment];
	return _config;
	
}


module.exports = Configuracion;

