/*
 * dao.TipoActuadorProvider
 * https://github.com/Gerdenlink
 *
 */

var method = TipoActuadorProvider.prototype;

var Models; 
var MongoModels;

var _logs;
var _moment;

var DweetIO = require("node-dweetio");
var _dweetClient;

var _DEBUG = true;

var DWEET = "Dweet";
var MONGO = "Mongo";

var async = require('async');

var _dweet_prefijo;

var Datastore = require('nedb'); 
var db = {};


var _provider = {
  DWEET : false,
  MONGO : false,
  NEDB :false
};



function TipoActuadorProvider(logs, moment, config) {
  console.log("Inicializando TipoActuadorProvider..");
  _logs = logs;
  
    if (config.MONGO.Habilitado == "true") {
      _provider.MONGO = true;
        Models = require("../dto/TipoActuador.js");

      var mongoose = config.MONGO.DataSource, Schema = mongoose.Schema;

      var TipoActuadorSchema = new Schema({
          IdTipoActuador : Number
          , Descripcion : String
      });
      

      MongoModels = mongoose.model('TipoActuador', TipoActuadorSchema)

    }

    if (config.DWEET.Habilitado == "true"){
      _provider.DWEET = true;
      this._dweetClient = new DweetIO();
      Models = require("../dto/TipoActuador.js");
      _dweet_prefijo = config.DWEET.prefijo_TipoActuador;
    }

    if (config.NEDB.Habilitado == "true"){
      _provider.NEDB = true;
      
      db.TipoActuador = new Datastore({ filename: './db/TipoActuador.db', autoload:true});
      db.TipoActuador.ensureIndex({ fieldName: 'IdTipoActuador', unique: true, sparse:true }, function (err) {
        if (err) {
          console.log("Error al crear el indice: Error: " + err.message);
        }
      });
      Models = require("../dto/TipoActuador.js");
    }
 
}

//Inicializa la base de datos
method.Inicializar = function(config){
	 
	 if (_provider.NEDB){
		 db.TipoActuador.find({}, function (err, docs) {
		
			if (docs.length == 0) {
			     
			     console.log("Inicializo base de datos con valores desde archivo de datos iniciales /db/DatosIniciales/TipoActuador.json");
			     
			      var configuracion = require('../../db/DatosIniciales/TipoActuador.json');
			      console.dir(configuracion);
			      async.each(configuracion.tipoactuador, function(item, callback) { 
			
			        var TipoActuadorModel = new Models();
			        TipoActuadorModel.Crear(item.IdTipoActuador,
			        				  item.Descripcion);
			        db.TipoActuador.insert(TipoActuadorModel.Objeto(), function (err, newDoc) {   // Callback is optional 
			        });
			
			      });
			  }
		});
	}
};


method.Delete = function(IdTipoActuador) {
	 if (_provider.NEDB){
	 	db.TipoActuador.remove({ IdTipoActuador: IdTipoActuador }, {}, function (err, numRemoved) {
  			if(_DEBUG)
  				console.log("TipoActuador.Delete -> CantEliminados " + numRemoved); 
		});
	 }
};

method.Save = function(IdTipoActuador, Descripcion) {
    
    if (_provider.MONGO) {
        throw new Error("TipoActuador.Save no habilitado para MongoDB");
    }
     
    if (_provider.DWEET) {
      throw new Error("TipoActuador.Save no habilitado para Dweet"); 
    }
	
	  if (_provider.NEDB){
	      var TipoActuadorModel = new Models();
	      TipoActuadorModel.Crear(IdTipoActuador, Descripcion);
	      
	      if (_DEBUG)
	        console.log(TipoActuadorModel.Objeto());
	
	      if(TipoActuadorModel.Validar(TipoActuadorModel.Objeto())) {
	      db.TipoActuador.find({IdTipoActuador : TipoActuadorModel.Objeto().IdTipoActuador}, function (err, data) {
	        if (data.length == 0) {
	          db.TipoActuador.insert(TipoActuadorModel.Objeto(), function (err, newDoc) {   // Callback is optional
	          if (_DEBUG)
	            console.log("inserto nuevo objeto");
	          });
	        }
	        else
	        {
	          db.TipoActuador.update({ _id: data[0]._id }, { $set: {
	              IdTipoActuador : TipoActuadorModel.Objeto().IdTipoActuador,
	              Descripcion : TipoActuadorModel.Objeto().Descripcion
	              }
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
	          console.log("TipoActuadorProvider.Save() : No se graba objeto debido a que no pasa la validacion de integridad");
	      }
    }

};


method.GetCollection = function(filter, callback) {

throw new Error("TipoActuador.GetCollection no implementado");

};

method.GetLast = function(filter, callback) {

throw new Error("TipoActuador.GetLast no implementado");

};

method.Find = function(filter, callback) {

	if (_provider.NEDB) {
	      var lstModels = [];
	      
	      var filters = {};
	      if (filter.IdTipoActuador)
	      	filters.IdTipoActuador = parseInt(filter.IdTipoActuador);
	      	
	       if (filter.Descripcion)
	      	filters.Descripcion = filter.Descripcion;
	      
	      if (filters.length == 0) {
	      	if (_DEBUG)
	      		console.log("TipoActuador.method.Find() no se han seteado filtros"); 
	      }
	      
	      if (_DEBUG)
	      	console.log("TipoActuador.Find().filters : " + filters.IdTipoActuador);
	      
	      db.TipoActuador.find(filters, function (err, docs) {
	        
	        if (err) {
	           if (_DEBUG) console.log("Error al leer async en mettodo Find() error : " + error);
	           callback(err, lstModels);
	        } 
	        else 
	        {
	          if (docs.length > 0) {
		          async.each(docs, function(doc, cb) { 
		            var TipoActuadorModel = new Models();
		            TipoActuadorModel.Crear(doc.IdTipoActuador,
		            				  doc.Descripcion);
		            				  
		            lstModels.push(TipoActuadorModel.Objeto());
		            
		          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
	          }
	          callback(null, lstModels[0]);
	        }
	      });
	  }

};



method.GetAll = function(callback) {

 if (_provider.MONGO) {
     throw new Error("TipoActuador.GetAll() no habilitado para Mongo");
  }

  if (_provider.NEDB) {
      var lstModels = [];
      db.TipoActuador.find({}, function (err, docs) {
        
        if (err) {
           if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error);
           callback(err, lstModels);
        } 
        else 
        {
          if (docs.length > 0) {
          async.each(docs, function(doc, cb) { 
            var TipoActuadorModel = new Models();
            TipoActuadorModel.Crear(doc.IdTipoActuador, doc.Descripcion);
            lstModels.push(TipoActuadorModel.Objeto());
            
          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
          }
          callback(null, lstModels);
        }
      });
  }
  else if (_provider.DWEET) {
    throw new Error("TipoActuador.GetAll() no habilitado para Dweet");
  }



};

function GenerarDweetId(TipoActuador) {
  return _dweet_prefijo + TipoActuador;

};


module.exports = TipoActuadorProvider;