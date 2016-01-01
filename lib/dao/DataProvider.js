/*
 * Sensor DataProvider Provider
 * https://github.com/Botanicbot/App/Tweet.js
 * 
 * 2015 Diego Navarro M
 *
 */

 var method = DataProvider.prototype;

 var Sources = {
   Device : require('./DeviceProvider.js'),
   Sensor : require('./SensorProvider.js'),
   Bomba : require('./BombaProvider.js')
 }

 var Configuracion = {
  NEDB : Object,
  MONGO : Object,
  DWEET : Object
 }

 var Data = {
  Device : Object,
  Sensor : Object,
  Bomba : Object
 }


 var mongoose = require('mongoose')

 

 function DataProvider(log, config, opt) {
    
  EstablecerConfiguraciones(config);

  if (opt)
    this.BuildCustomProvider(log, opt);
  else
    this.BuildProviderAutoConfig(log, Configuracion);

  
  Inicializar(Configuracion);
 }

 //Extrae las configuraciones de los datasources desde el archivo de configuracion global
 function EstablecerConfiguraciones(config) {
    for (var conf in config.datasource) {
      Configuracion[conf] = config.datasource[conf];
      if (conf == "MONGO")
      {
        if (Configuracion[conf].Habilitado == "true")
        {
          mongoose = require('mongoose');
          var debug = Configuracion[conf].Debug == "true" ? true : false;
          mongoose.set('debug', debug);
             try {
          mongoose.connect('mongodb://'+Configuracion[conf].UserName+':'+Configuracion[conf].Password+'@ds039960.mongolab.com:39960/botanicbot-db');
          } catch(e) {
            console.log("Error al abrir conexion : " + e);
          }
        }
        Configuracion[conf].DataSource = mongoose;

      }
    }
 }

 //Inicializa datos cuando no existe la base
 function Inicializar(config)
 {
    Data.Device.Inicializar(config);
    //Data.Sensor.Inicializar(config);
 }


 //ejemplo:  opt = config.NEDB.Habilitado
 method.BuildCustomProvider = function(log, opt) {
  console.log("custom");
    Data.Device = new Sources.Device(log, opt);
    Data.Sensor = new Sources.Sensor(log, null, opt);
    Data.Bomba = new Sources.Bomba(log, opt);
 };

 method.BuildProviderAutoConfig = function(log, config) {
    Data.Device = new Sources.Device(log, config);
    Data.Sensor = new Sources.Sensor(log, null, config);
    Data.Bomba = new Sources.Bomba(log, config);
 }

 method.Device = function()
 {
    return Data.Device;
 }

 method.Sensor = function()
 {
  return Data.Sensor;
 }

 method.Bomba = function()
 {
  return Data.Bomba;
 }

 method.GetConfig = function()
 {
   return Configuracion;
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


module.exports = DataProvider;
