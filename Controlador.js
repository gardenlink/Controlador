
/*
 * GARDENLINK.CONTROLADOR 0.1
 * Sistema para monitoreo y control de riego automatizado 
 * utilizando Raspberry + Arduino
 * Autor: GardenLink
 * Fecha: 15-01-2015
 */



var express = require('express');
var app = express();
var os=require('os');
var ifaces=os.networkInterfaces();
var req = require('restler');
var winston     = require ('winston'); 
var path        = require ('path'); //para utilizar rutas
var fs = require('fs'); //leer desde el filesystem
//Autenticacion
var passport = require('passport')
var util = require('util')
var TwitterStrategy = require('passport-twitter').Strategy;


/*************************** CONFIG *******************************/

// Configuracion de Winston (logging) para crear archivo de log diario
// ej. log_file.log.2015-13-02
// uso: logger.info("Registro de log", {extraData: 'texto logueado'});
var transports  = []; 
transports.push(new winston.transports.DailyRotateFile({
  name: 'file',
  //datePattern: '.yyyy-MM-ddTHH',
  filename: path.join(__dirname, "logs", "log_file.log")
}));

var logger = new winston.Logger({transports: transports});
var _dirname = __dirname;

//Fin config Winston


// Modo de inicio de aplicacion:
// 1.- Configuracion desde config.json. Requiere iniciar server con comando: 
//     NODE_ENV=production node app.js
// 2.- Configuracion como argumentos al iniciar aplicacion
//     node SwitchControl.js release
//      Opciones: release / debug
var environment = process.argv[2] || process.env.NODE_ENV || 'debug'

//Revisar que las carpetas iniciales existan.. si no estan, las crea.
console.log("Verificando carpetas de sistema..");
var pathLog = __dirname + "/logs";
try {
  fs.mkdirSync(pathLog);
} catch(e) {
  if ( e.code != 'EEXIST' ) throw e;
}
console.log("Carpetas de sistema ok..");

console.log("Leyendo Configuracion... ");
logger.info("Leyendo Configuracion...");
if (environment != 'release' && environment != 'debug')
{
  console.log("Ambiente especificado invalido.. se usara configuracion por defecto");
  logger.info("Ambiente especificado invalido.. se usara configuracion por defecto");
  environment = 'debug';
}
console.log("Ambiente : " + environment);
logger.info("Ambiente : " + environment);
//var config = require("./config.json")[environment];
var Configuracion = require("./lib/util/Configuracion.js");
var configuracion = new Configuracion(environment);
var config = configuracion.LeerConfiguracion();

//IP configuration del host Node.js
var appHost = 0;
var appPort = 0;
var found = false;
for (var dev in ifaces) {
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
      if (details.address!="127.0.0.1" && found == false) {
          found = true;
          IPAddress=details.address;
          console.log("Deteccion de IP del host GardenLink: " + IPAddress);
          logger.info("Deteccion de IP del host GardenLink: " + IPAddress);
        }
    }
  });
}

console.log("Lectura archivo de configuracion config.json...");
appHost = config.app_host;
appPort = config.app_port;



//Base de datos
console.log("Configurando Base de Datos");
logger.info("Configurando Base de Datos");

var DataProvider = require('./lib/dao/DataProvider.js');
var dataProvider = new DataProvider(logger, config, null);

//Servicios
var SS = require('./lib/servicios/ServiceProvider.js');
var serviceProvider = new SS(dataProvider, logger, function(err, data){ });


console.log("GardenLink Host: " + appHost);
console.log("GardenLink Port: " + appPort);

logger.info("GardenLink Host: " + appHost);  
logger.info("GardenLink Port:" + appPort);


console.log("Configurando Libreria Auxiliares...");
logger.info("Fin Configuracion Libreria Auxiliares..."); 

var Auxiliares = require("./lib/util/Auxiliares.js");
var auxiliares = new Auxiliares();

/* Libreria Moment para registro de tiempo */
var moment = require('moment')
moment.locale('es');
/* FIN REGISTRO DE TIEMPO */


/* MAILER  */
console.log("Configurando Libreria Mailer...");
logger.info("Configurando Libreria Mailer...");
console.log("Aviso por Correo : " + config.mail_enabled);
logger.info("Aviso por Correo : " + config.mail_enabled);
var Mailer = require("./lib/util/Mailer.js");
var mailer = new Mailer(config, logger);

/* twitter */
console.log("Configurando Libreria twitter...");
logger.info("Configurando Libreria twitter...");
var Tweet = require("./lib/util/Tweet.js");
var tweet = new Tweet(config, logger);
console.log("Publicacion Twitter : " + config.twitter_enabled);
console.log("Autenticacion Twitter : " + config.twitter_autenticacion);
logger.info("Publicacion Twitter : " + config.twitter_enabled);
logger.info("Autenticacion Twitter : " + config.twitter_autenticacion);



/* TEMPORIZADOR */
console.log("Configurando Temporizador...");
logger.info("Configurando Temporizador...")
var Temporizador = require("./lib/Temporizador.js");
var tareas = new Temporizador(config, logger, mailer,tweet,dataProvider);
tareas.Iniciar();
console.log("Fin Configuracion Temporizador...");
logger.info("Fin Configuracion Temporizador..."); 



/* Monitoreo de Salud (Lectura Sensores) */
console.log("Configurando Modulo de Monitorizacion de Salud...");
logger.info("Configurando Modulo de Monitorizacion de Salud...")
var MonitorSalud = require("./lib/MonitorSalud.js");
var monitor = new MonitorSalud(config, logger, mailer,moment,tweet, dataProvider, serviceProvider);
monitor.Iniciar();
console.log("Fin Configuracion Modulo Monitorizacion de Salud...");
logger.info("Fin Configuracion Modulo Monitorizacion de Salud...");

console.log("Configurando Express..");




console.log("Configurando CORS..");
logger.info("Configurando CORS..");


// CORS header securiy
	app.all('/', function (req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
	});


app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set("view options", {layout: false}); // disable layout
  //app.engine('html', require('ejs').renderFile);
   app.set('view engine', 'ejs');
  
  //app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
   app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	  next();
  });
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
});





//Graficos
console.log("Configurando Libreria para graficos");
logger.info("Configurando Libreria para graficos");
var Graficos = require("./lib/util/Graficos.js");
var graficos = new Graficos(config, logger);

//Rutas para api rest.
console.log("Preparando Rutas de apliacion..");
logger.info("Preparando Rutas de aplicacion..");

console.log("./routes/Bomba");
logger.info("./routes/Bomba");
require('./routes/Bomba.js')(app, req, moment, logger,dataProvider);

console.log("./routes/Sensor");
logger.info("./routes/Sensor");
require('./routes/Sensor.js')(app, moment, dataProvider, serviceProvider, logger);

console.log("./routes/Relay");
logger.info("./routes/Relay");
require('./routes/Relay.js')(app, moment, dataProvider, serviceProvider, logger);

console.log("./routes/Temporizador");
logger.info("./routes/Temporizador");
require('./routes/Temporizador.js')(app, moment, dataProvider, logger);

console.log("./routes/Monitor");
logger.info("./routes/Monitor");
require('./routes/Monitor.js')(app,moment,dataProvider,logger, graficos);


require('./routes/Panel')(app);

console.log("./routes/Autenticacion");
logger.info("./routes/Autenticacion");
require('./routes/Autenticacion.js')(app, config,passport,util,TwitterStrategy,auxiliares);

console.log("./routes/Log");
logger.info("./routes/Log");
require('./routes/Log')(app, auxiliares, logger, tareas,fs, _dirname);

console.log("./routes/admin");
logger.info("./routes/admin");
require('./routes/Admin')(app);

console.log("./routes/Dispositivo");
logger.info("./routes/Dispositivo");
require("./routes/Dispositivo")(app, moment, dataProvider, logger);

console.log("./routes/TipoActuador");
logger.info("./routes/TipoActuador");
require("./routes/TipoActuador")(app, dataProvider, logger);

console.log("./routes/Motor");
logger.info("./routes/Motor");
require('./routes/Motor.js')(app, moment, dataProvider,serviceProvider, logger);

console.log("./routes/Estados");
logger.info("./routes/Estados");
require('./routes/Estados.js')(app, logger);

console.log("./routes/Console");
logger.info("./routes/Console");
require('./routes/Console.js')(app);

console.log("./routes/Servicio");
logger.info("./routes/Servicio");
require('./routes/Servicio.js')(app, moment, dataProvider,serviceProvider, logger);





/*
console.log("Inicializando Actuadores..");
var BombaService = require("./lib/servicios/BombaService.js");
var bombasvc = new BombaService(dispositivos,logger);

for (c in config.actuadores) {
  if (config.actuadores[c].tipo == "relay") {
      console.log("Inicializando relay " + config.actuadores[c].id);
      bombasvc.DesactivarBomba(config.actuadores[c].id, function(data) {});
  }
}
*/


console.log("Fin Configuracion ...");
logger.info("Fin Configuracion ..."); 

/************************** END CONFIG ********************************/

//var Camaras = require("./lib/util/Camaras.js");
//var camara = new Camaras(config,logger);
/*
camara.GetStreamUri(function (data) {
  console.log(data);
});
*/

app.listen(appPort); 
console.log('Servidor corriendo en: http://'+IPAddress+':'+appPort+'/');
logger.info('Servidor corriendo en: http://'+IPAddress+':'+appPort+'/');