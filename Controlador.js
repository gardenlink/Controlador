
/*
 * CONTROLADOR 0.1
 * Sistema para monitoreo y control de riego automatizado 
 * utilizando Raspberry + Arduino
 * Autor: mantgambl
 * Instrucciones: http://medium.com/mantgambl
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
var config = require("./config.json")[environment];

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
          console.log("Deteccion de IP del host BotanicBot: " + IPAddress);
          logger.info("Deteccion de IP del host BotanicBot: " + IPAddress);
        }
    }
  });
}

console.log("Lectura archivo de configuracion config.json...");
appHost = config.app_host;
appPort = config.app_port;

//TEst Async

/*
var async = require('async');
var ping = require('ping');

var isAlive = false;
async.each(config.dispositivos, function(item, callback) { 
  
   ping.sys.probe(item.ip, function(isAlive){
      console.log(item.ip + " isAlive? : " + isAlive);
      callback();
   });
}, function(err) {
  console.log("***************************************************************terminado");
});
*/


dispositivos = config.dispositivos;
console.log("Dispositivos Arduino configurados: " + Object.keys(dispositivos).length);
for (var dispositivo in dispositivos) {
  console.log("-------------------------------------------------------");
  console.log(" NOMBRE: " + dispositivos[dispositivo].nombre);  
  console.log(" ID: " + dispositivos[dispositivo].id);  
  console.log(" TIPO: " + dispositivos[dispositivo].tipo);  
  console.log(" IP: " + dispositivos[dispositivo].ip);  
  console.log(" PUERTO: " + dispositivos[dispositivo].puerto);  
  console.log(" HABILITADO: " + dispositivos[dispositivo].habilitado);  



}
console.log("-------------------------------------------------------");


console.log("BotanicBot Host: " + appHost);
console.log("BotanicBot Port: " + appPort);

logger.info("BotanicBot Host: " + appHost);  
logger.info("BotanicBot Port:" + appPort);


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


//Base de datos
console.log("Configurando Base de Datos");
logger.info("Configurando Base de Datos");

var DataProvider = require('./lib/dao/DataProvider.js');
var dataProvider = new DataProvider(logger, config, null);

var DbSync = require('./lib/DbSync.js');
var dbSync = new DbSync(dataProvider, logger, mailer, moment);
dbSync.Iniciar();


/* TEMPORIZADOR */
console.log("Configurando Temporizador...");
logger.info("Configurando Temporizador...")
var Temporizador = require("./lib/Temporizador.js");
var tareas = new Temporizador(config, logger, mailer,tweet,dispositivos,dataProvider);
tareas.Iniciar();
console.log("Fin Configuracion Temporizador...");
logger.info("Fin Configuracion Temporizador..."); 


/* Monitoreo de Salud (Lectura Sensores) */
console.log("Configurando Modulo de Monitorizacion de Salud...");
logger.info("Configurando Modulo de Monitorizacion de Salud...")
var MonitorSalud = require("./lib/MonitorSalud.js");
var monitor = new MonitorSalud(config, logger, mailer,moment,tweet,dispositivos, dataProvider);
monitor.Iniciar();
console.log("Fin Configuracion Modulo Monitorizacion de Salud...");
logger.info("Fin Configuracion Modulo Monitorizacion de Salud...");

console.log("Configurando Express..");


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
require('./routes/Bomba.js')(app, req, moment, logger, dispositivos,dataProvider);

console.log("./routes/Sensor");
logger.info("./routes/Sensor");
require('./routes/Sensor.js')(app, req, moment, logger, dispositivos);

console.log("./routes/Monitor");
logger.info("./routes/Monitor");
require('./routes/Monitor.js')(app,moment,dataProvider,logger, graficos);


require('./routes/FBoardViews')(app);

console.log("./routes/Autenticacion");
logger.info("./routes/Autenticacion");
require('./routes/Autenticacion.js')(app, config,passport,util,TwitterStrategy,auxiliares);

console.log("./routes/Log");
logger.info("./routes/Log");
require('./routes/Log')(app, auxiliares, logger, tareas,fs, _dirname);

console.log("./routes/Dispositivo");
logger.info("./routes/Dispositivo");
require('./routes/Dispositivo')(app,moment,dataProvider,logger);

console.log("Inicializando Actuadores..");
var BombaService = require("./lib/servicios/BombaService.js");
var bombasvc = new BombaService(dispositivos,logger);

for (c in config.actuadores) {
  if (config.actuadores[c].tipo == "relay") {
      console.log("Inicializando relay " + config.actuadores[c].id);
      bombasvc.DesactivarBomba(config.actuadores[c].id, function(data) {});
  }
}


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