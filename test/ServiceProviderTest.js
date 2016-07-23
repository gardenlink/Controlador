var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

//MAS INFORMACION SOBRE SHOULD:
// http://www.phloxblog.in/node-js-uni-testing-js/#.V28ET7jhCCh


/* Mis variables */

var logger = new winston.Logger({});
var DataProvider = require('../lib/dao/DataProvider.js');
var ServiceProvider = require('../lib/servicios/ServiceProvider.js');


describe('****** Service Provider *********', function() {

 var dataProvider;
 var serviceProvider;
  
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    // In our tests we use the test db
    var environment = "debug";
    var Configuracion = require("../lib/util/Configuracion.js");
	var configuracion = new Configuracion(environment);
	var config = configuracion.LeerConfiguracion();
    dataProvider = new DataProvider(logger, config, null);
    
    
    console.log("PROVEEDOR BD MONGO HABILITADO : " + dataProvider.GetConfig().MONGO.Habilitado);
    console.log("PROVEEDOR BD NEDB HABILITADO : " + dataProvider.GetConfig().NEDB.Habilitado);
    
    //console.log(dataProvider.GetConfig().Mongoose[MONGO].connection.readyState);
    dataProvider.Relay().Delete(1000,function(error, data) {
    	dataProvider.Device().Delete("100",function(a, c) {
    		dataProvider.Motor().Delete(95,function(e, d) {
    			 serviceProvider = new ServiceProvider(dataProvider,config,logger); 
   				 done();
	    	});
    		
	    });
    });
    
  
   
    
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
 
   /* 
   describe('#Relay-Activar', function() {
		 
		 it('should activate a relay', function(done) {
			   	 serviceProvider.Relay().Activar("001", 1, function(err, data) { 
			      should.not.exist(err);
			      should.exist(data);
			      done();
			    });
		});
	
    });
    
	*/
    
    
    
  });
