var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var winston = require('winston');

//MAS INFORMACION SOBRE SHOULD:
// http://www.phloxblog.in/node-js-uni-testing-js/#.V28ET7jhCCh


/* Mis variables */

var logger = new winston.Logger({});
var Ponte = require('../lib/servicios/PonteHttpClient.js');
var ponte;
 


describe('****** Ponte HTTP Tests  *********', function() {

  
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    
    var opt = { Debug : true };
    ponte = new Ponte("localhost","3000",null, opt);
    done();
    
  
   
    
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
 
    
   describe('#PonteHttpClient-Publicar', function() {
		 
		 it('should publish on a topic', function(done) {
			   	 var payload = "RE20X";
			   	 ponte.Publicar("test", payload, function(err, data) { 
			   	 	should.not.exist(err);
		        	should.exist(data);
			   	 	done();
			   	 });
		});
		
    });
    
   
	describe('#PonteHttpClient-Leer', function() {
		 
		 it('should read for a topic', function(done) {
			   	 ponte.Leer("test", function(err, data) { 
			   	 	should.not.exist(err);
		        	should.exist(data);
		        	data.should.equal("payload=RE20X")
			   	 	done();
			   	 });
		});
		
    });
    
    
    
  });
