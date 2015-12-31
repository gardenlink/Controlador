/*
 * Sensor MongoDB Provider
 * https://github.com/Botanicbot/App/Tweet.js
 * 
 * 2015 Diego Navarro M
 *
 */

var method = DeviceProvider.prototype;

var Models; //require('../../models/Sensor.js');
var MongoModels;

var _logs;
var _moment;

var _DEBUG = false;

var DweetIO = require("node-dweetio");
var _dweetClient;

var async = require('async');




var Datastore = require('nedb'); 
var db = {};
// You can issue commands right away


var _provider = {
  DWEET : false,
  MONGO : false,
  NEDB :false
};

var Initialized = false;

var _dweet_prefijo;



function DeviceProvider(logs, config) {
  console.log("Inicializando DeviceProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
      Models = require("../dto/Dispositivo.js");
      

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var DeviceSchema = new Schema({
          Id : String
          , Nombre : String
          , Tipo  : String
          , Ip : String
          , Puerto : Number
          , Habilitado : Boolean
          , Estado : Boolean
      });


      MongoModels = mongoose.model('Device', DeviceSchema)

    }
    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/Dispositivo.js");
      _dweet_prefijo = config.DWEET.prefijo_dispositivo;
    }
    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      db.Device = new Datastore({ filename: './db/Dispositivo.db', autoload:true});
      //db.Device.loadDatabase();
      db.Device.ensureIndex({ fieldName: 'Id', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/Dispositivo.js");
    }
 
}


method.GetProviders = function(callback)
{
  callback(_provider);
};


method.Save = function(Id, Nombre, Tipo, Ip,Puerto,Habilitado,Estado) {
    
    if (_provider.MONGO) {
        var deviceModel = new Models();
        deviceModel.Crear(Id, Nombre, Tipo, Ip, Puerto, Habilitado,Estado);
        
         if(deviceModel.Validar(deviceModel.Objeto())) {
              
              MongoModels.findOne({Id : deviceModel.Objeto().Id}, function (err, data) {

                
                if (data.length == 0) {
                  objMongo = new MongoModels(deviceModel.Objeto());
                  objMongo.save(function(err, data) {
                  if (_DEBUG)
                    console.log("inserto nuevo objeto");
                  // newDoc is the newly inserted document, including its _id
                  // newDoc has no key called notToBeSaved since its value was undefined
                  });
                }
                else
                {
               
                  MongoModels.update({ _id : data._id }, {  $set: {
                      Nombre : deviceModel.Objeto().Nombre,
                      Tipo : deviceModel.Objeto().Tipo,
                      Ip : deviceModel.Objeto().Ip,
                      Puerto : deviceModel.Objeto().Puerto,
                      Habilitado: deviceModel.Objeto().Habilitado,
                      Estado: deviceModel.Objeto().Estado 
                    }
                    }, function (err, numReplaced) {
                      if (_DEBUG)
                        console.dir(numReplaced);
                    if (err)
                      console.log("Error al updatear" + err);
                  });

                }
              });
              }
              else
              {
                if (_DEBUG)
                  console.log("DeviceProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
              }


    }
   

    if (_provider.NEDB){
      var deviceModel = new Models();
      deviceModel.Crear(Id, Nombre, Tipo, Ip, Puerto, Habilitado,Estado);
      if (_DEBUG)
        console.log(deviceModel.Objeto());
      //console.log(GenerarDweetId(Id));

      if(deviceModel.Validar(deviceModel.Objeto())) {
      db.Device.find({Id : deviceModel.Objeto().Id}, function (err, data) {
        if (data.length == 0) {
          db.Device.insert(deviceModel.Objeto(), function (err, newDoc) {   // Callback is optional
          if (_DEBUG)
            console.log("inserto nuevo objeto");
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined
          });
        }
        else
        {
          db.Device.update({ _id: data[0]._id }, { $set: {
              Id : deviceModel.Objeto().Id,
              Nombre : deviceModel.Objeto().Nombre,
              Tipo : deviceModel.Objeto().Tipo,
              Ip : deviceModel.Objeto().Ip,
              Puerto : deviceModel.Objeto().Puerto,
              Habilitado: deviceModel.Objeto().Habilitado,
              Estado: deviceModel.Objeto().Estado }
            }, { multi : true}, function (err, numReplaced) {
              if (_DEBUG)
                console.log("Remplazados: " + numReplaced);
            if (err)
              console.log("Error al updatear" + err);
          });
        }
      });
      }
      else
      {
        if (_DEBUG)
          console.log("DeviceProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
      }
    }

    if (_provider.DWEET)
    {
      var deviceModel = new Models();
      deviceModel.Crear(Id, Nombre, Tipo, Ip, Puerto, Habilitado,Estado);
      console.log(deviceModel.Objeto());
      console.log(GenerarDweetId(Id));
      
      
      this._dweetClient.dweet_for(GenerarDweetId(Id), deviceModel.Objeto(), function(err, dweet){

          if (err) {console.log("Error al grabar Dispositivo en dweet: " + err);}
         
      }); 
    }
};


method.SaveSync = function(target, Id, Nombre, Tipo, Ip,Puerto,Habilitado,Estado) {
    if (target.MONGO) {
      throw new Error("DeviceProvider.Save.Mongo - No implementado");
    }
   

    if (target.NEDB){
      var deviceModel = new Models();
      deviceModel.Crear(Id, Nombre, Tipo, Ip, Puerto, Habilitado,Estado);
      if (_DEBUG)
        console.log(deviceModel.Objeto());
      //console.log(GenerarDweetId(Id));

      if(deviceModel.Validar(deviceModel.Objeto())) {
      db.Device.find({Id : deviceModel.Objeto().Id}, function (err, data) {
        if (data.length == 0) {
          db.Device.insert(deviceModel.Objeto(), function (err, newDoc) {   // Callback is optional
          if (_DEBUG)
            console.log("inserto nuevo objeto");
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined
          });
        }
        else
        {
          db.Device.update({ _id: data[0]._id }, { $set: {
              Id : deviceModel.Objeto().Id,
              Nombre : deviceModel.Objeto().Nombre,
              Tipo : deviceModel.Objeto().Tipo,
              Ip : deviceModel.Objeto().Ip,
              Puerto : deviceModel.Objeto().Puerto,
              Habilitado: deviceModel.Objeto().Habilitado,
              Estado: deviceModel.Objeto().Estado }
            }, { multi : true}, function (err, numReplaced) {
              if (_DEBUG)
                console.log("Remplazados: " + numReplaced);
            if (err)
              console.log("Error al updatear" + err);
          });
        }
      });
      }
      else
      {
        if (_DEBUG)
          console.log("DeviceProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
      }
    }

    if (target.DWEET)
    {
      var deviceModel = new Models();
      deviceModel.Crear(Id, Nombre, Tipo, Ip, Puerto, Habilitado,Estado);
      console.log(deviceModel.Objeto());
      console.log(GenerarDweetId(Id));
      
      
      this._dweetClient.dweet_for(GenerarDweetId(Id), deviceModel.Objeto(), function(err, dweet){

          if (err) {console.log("Error al grabar Dispositivo en dweet: " + err);}
         
      }); 
    }
}


method.GetAll = function(callback) {

 if (_provider.MONGO) {

    var myDocs;
     //Models.find({ 'some.value': 5 }, function (err, docs) {
     Models.find({}, function(err, docs) {
       if (err) callback(err)
       else callback(null, docs);
     });
  }

  

  if (_provider.NEDB) {
    db.Device.find({}, function (err, docs) {
      var lstModels = [];
      if (docs > 0) {
      async.each(docs, function(doc, cb) { 
        var deviceModel = new Models();
          if (_DEBUG)
            console.log("find: " + doc);
        deviceModel.Crear(doc.Id, doc.Nombre, doc.Tipo, doc.Ip, doc.Puerto, doc.Habilitado, doc.Estado);
        lstModels.push(deviceModel.Objeto());
        
      }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
      }
      callback(null, lstModels);
      
      });
    }
    else if (_provider.DWEET) {
   //throw new Error("DeviceProvider.GetAll.Dweet  - No implementado");
   console.log("DeviceProvider.GetAll.Dweet  - No implementado");
  }
  
};


method.Find = function(filter, callback) {

 if (_provider.MONGO) {

    var lstModels = [];
    MongoModels.find(filter).exec(function(err, docs) {
       if (err) callback(err, lstModels)
       else {
         if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var deviceModel = new Models();
            deviceModel.Crear(doc.Id, doc.Nombre, doc.Tipo, doc.Ip, doc.Puerto, doc.Habilitado, doc.Estado);
            lstModels.push(deviceModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("MONGO: Error al leer async en mettodo GetAll() error : " + error); });
          }
        callback(null, lstModels);
       }
     });
  }
  else   if (_provider.NEDB) {
    db.Device.find({Id : filter.Id}, function (err, docs) {
      var lstModels = [];
      if (_DEBUG)
        console.log("Find: doc : " + docs);
      if (docs.length > 0) {
        async.each(docs, function(doc, cb) { 
          var deviceModel = new Models();
          deviceModel.Crear(doc.Id, doc.Nombre, doc.Tipo, doc.Ip, doc.Puerto, doc.Habilitado, doc.Estado);
          lstModels.push(deviceModel.Objeto());
        }, function(error) { console.log("Error al leer async en mettodo GetAll() error : " + error); });
      }
      callback(null, lstModels);
      });
    }
    else if (_provider.DWEET) {
    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {
        
        

        var lstModels = [];

        for(theDweet in dweets)
        {
            var dweet = dweets[theDweet];
            var deviceModel = new Models();
            deviceModel.Crear(dweet.content["Id"], dweet.content["Nombre"], dweet.content["Tipo"], dweet.content["Ip"], dweet.content["Puerto"],dweet.content["Habilitado"], dweet.content["Estado"]);

            lstModels.push(deviceModel.Objeto());
        }
    callback(null, lstModels);
    });
  }

  
};

method.GetCollection = function(filter, callback) {

 if (_provider.MONGO) {

    Models.find(filter).exec(function(err, docs) {
       if (err) callback(err)
       else callback(null, docs);
     });
  }

 
  if (_provider.NEDB) {
    console.log("NEDB no implementado para GetCollection");
  }
  else  if (_provider.DWEET) {
    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {

       var lstModels = [];

      for(theDweet in dweets)
      {
          var dweet = dweets[theDweet];

          var deviceModel = new Models();
          deviceModel.Crear(dweet.content["Id"], dweet.content["Nombre"], dweet.content["Tipo"], dweet.content["Ip"], dweet.content["Puerto"],dweet.content["Habilitado"], dweet.content["Estado"]);
          lstModels.push(deviceModel.Objeto());

      }
      callback(null, lstModels);
    });
  }


};

method.GetLast = function(filter, callback) {

  if (_provider.MONGO) {

    throw new Error("No implementado");
  }

 

  if (_provider.NEDB) {
    console.log("NEDB no implementado para GetLAst");
  }
  else  if (_provider.DWEET) {

    this._dweetClient.get_all_dweets_for(GenerarDweetId(filter.Id), function(err, dweets) {

      if (!err){
      var dweet = dweets[0]; // Dweet is always an array of 1
      var deviceModel = new Models();
      deviceModel.Crear(dweet.content["Id"], dweet.content["Nombre"], dweet.content["Tipo"], dweet.content["Ip"], dweet.content["Puerto"],dweet.content["Habilitado"], dweet.content["Estado"]);
      callback(null, deviceModel.Objeto());
      }
    });
  }

};

method.Inicializar = function(config){
 if (_provider.NEDB){
    

 db.Device.find({}, function (err, docs) {

if (docs.length == 0) {
     
     console.log("Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/Dispositivo.json");
     /*
     var Device1 = {
                "nombre" : "ARDUINO_BOMBAS_1",
                "id" : "001",
                "tipo" : "UNO",
                "ip" : "192.168.0.16",
                "puerto" : "80",
                "habilitado" : "true"
            };
            
      var Device2 = {
                "nombre" : "ARDUINO_VENTANAS_1",
                "id" : "002",
                "tipo" : "MEGA",
                "ip" : "192.168.0.11",
                "puerto" : "80",
                "habilitado" : "true"
            };
      */
      var configuracion = require('../../db/DatosIniciales/Dispositivo.js');
      console.dir(configuracion);
      async.each(configuracion.dispositivos, function(item, callback) { 

        var deviceModel = new Models();
        deviceModel.Crear(item.id, item.nombre, item.tipo, item.ip, item.puerto, item.habilitado, false);
        db.Device.insert(deviceModel.Objeto(), function (err, newDoc) {   // Callback is optional 
        });

        


      });

     
  }
});
}

if (_provider.MONGO)
{

  MongoModels.find({}, function (err, docs) {
    if (docs.length == 0) {
      console.log("Inicializo base de datos MONGO con valores desde archivo de datos iniciales /db/DatosIniciales/Dispositivo.json");

        var configuracion = require('../../db/DatosIniciales/Dispositivo.json');
        async.each(configuracion.dispositivos, function(item, callback) { 

       var deviceModel = new Models();
        deviceModel.Crear(item.id, item.nombre, item.tipo, item.ip, item.puerto, item.habilitado, false);

         

       var objMongo = new MongoModels(deviceModel.Objeto());
                  objMongo.save(function(err, data) {
                  if (_DEBUG)
                  {
                    if (err) { console.log(err);} else {
                    console.log("MONGO: inserto nuevo objeto");
                    console.log(data);
                  }
                  }
                  // newDoc is the newly inserted document, including its _id
                  // newDoc has no key called notToBeSaved since its value was undefined
                  });

        });
    }
  });

}


  

};

function GenerarDweetId(id) {
  return _dweet_prefijo + id;

};


module.exports = DeviceProvider;