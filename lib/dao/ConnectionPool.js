/*
 * Sensor DataProvider Provider
 * https://github.com/Botanicbot/App/Tweet.js
 * 
 * 2015 Diego Navarro M
 *
 */

 var method = ConnectionPool.prototype;

 var DataProvider = require('./DataProvider.js');

 var confDweet;
 var confMongo;
  var confNeed;

 var Conexiones = {
  MONGO : Object,
  NEDB : Object,
  DWEET : Object
 }

 var configuracion =  
        { 
          "datasource" : {
                            "NEDB"  : { "Habilitado" : "true" },
                            "MONGO" : { "Habilitado" : "false" },
                            "DWEET" : { "Habilitado" : "true",
                                        "prefijo_sensor" : "bb_njs_sensor_",
                                        "prefijo_bomba" : "bb_njs_relay_",
                                        "prefijo_dispositivo": "bb_njs_device_"
                                      }
                          }
        };

 function ConnectionPool(log, config) {
  
    ConfigurarMongo(log,config);
    ConfigurarDweet(log,config);
    ConfigurarNedb(log,config);
  
   
}

function ConfigurarMongo(log, config)
{
   if (config.datasource.MONGO.Habilitado == "true") {
      
      console.log("Genero Origen de datos para provider MONGO");
      configuracion.datasource.MONGO.Habilitado ="true";
      configuracion.datasource.NEDB.Habilitado = "false";
      configuracion.datasource.DWEET.Habilitado = "false";
      Conexiones.MONGO = new DataProvider(log, configuracion, null);
    }
}

function ConfigurarDweet(log, config)
{
    if (config.datasource.DWEET.Habilitado == "true") {
      
      console.log("Genero Origen de datos para provider DWEET");
      configuracion.datasource.MONGO.Habilitado = "false";
      configuracion.datasource.NEDB.Habilitado = "false";
      configuracion.datasource.DWEET.Habilitado = "true";
      Conexiones.DWEET = new DataProvider(log, configuracion, null);
    }
}

function ConfigurarNedb(log, config)
{
   if (config.datasource.NEDB.Habilitado == "true"){
      
      console.log("Genero Origen de datos para provider NEDB");
      configuracion.datasource.NEDB.Habilitado = "true";
      configuracion.datasource.MONGO.Habilitado = "false";
      configuracion.datasource.DWEET.Habilitado = "false";
      Conexiones.NEDB = new DataProvider(log, configuracion, null);
    }


}


 method.Mongo = function()
 {
    return Conexiones.MONGO;
 }

 method.Nedb = function()
 {
  return Conexiones.NEDB;
 }

 method.Dweet = function()
 {
  return Conexiones.DWEET;
 }

 //USO:

 //var DataProvider = require('./lib/dao/DataProvider.js');
//var customConfig = config;
//customConfig.datasource.NEDB.Habilitado = true;
//customConfig.datasource.MONGO.Habilitado = false;
//customConfig.datasource.DWEET.Habilitado = false;
//var dataProvider = new DataProvider(logger, config, null);
//var filtro = { Id : String };
//filtro.Id = "002";
//dataProvider.Device().Find(filtro, function(err, data) { console.log(data);});


module.exports = ConnectionPool;
