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

 var Data = {
  Device : Object,
  Sensor : Object,
  Bomba : Object
 }

 function DataProvider(log, config, opt) {
  if (opt)
    this.BuildCustomProvider(log, opt);
  else
    this.BuildProviderAutoConfig(log, config);

  Inicializar(config);
 }


 function Inicializar(config)
 {
    Data.Device.Inicializar(config);
    //Data.Sensor.Inicializar(config);
 }


 //ejemplo opt = config.datasource.NEDB.Habilitado
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
