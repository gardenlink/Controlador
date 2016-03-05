var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
//var winston = require('winston');
//var config = require('./config-debug');

describe('Routing', function() {
  var url = 'http://localhost:9000';
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    // In our tests we use the test db
    //mongoose.connect(config.db.mongodb);							
    done();
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
  describe('Account', function() {
    it('should return values', function(done) {
      
      /*
      var profile = {
        username: 'vgheri',
        password: 'test',
        firstName: 'Valerio',
        lastName: 'Gheri'
      };
      */
    // once we have specified the info we want to send to the server via POST verb,
    // we need to actually perform the action on the resource, in this case we want to 
    // POST on /api/profiles and we want to send some info
    // We do this using the request object, requiring supertest!
    request(url)
	.get('/api/sensores')
	//.send(profile)
    // end handles the response
     .expect('Content-Type', /json/)
     .expect(200) //Status code
    
	.end(function(err, res) {
         
          should.equal(err, null); 
          should(res).be.json; 
          res.body[0].IdSensor.should.exists; 
          
          
         	 //res.body.should.be.a('object'); 
         	//res.should.have.status(200); 
         	//res.body[0].should.be.a('object'); 
          done();
        });
    });
    
     //INicio 2° TEst
    /*
    it('should return values from devices', function(done){
	var body = {
		firstName: 'JP',
		lastName: 'Berd'
	};
	request(url)
		.put('/api/profiles/vgheri')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			// Should.js fluent syntax applied
			res.body.should.have.property('_id');
	                res.body.firstName.should.equal('JP');
	                res.body.lastName.should.equal('Berd');                    
	                res.body.creationDate.should.not.equal(null);
			done();
		});
	});
	*/
	//End 2° TEst
    
    //INicio 3° TEst
    /*
    it('should return values from devices', function(done){
	var body = {
		firstName: 'JP',
		lastName: 'Berd'
	};
	request(url)
		.put('/api/profiles/vgheri')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			// Should.js fluent syntax applied
			res.body.should.have.property('_id');
	                res.body.firstName.should.equal('JP');
	                res.body.lastName.should.equal('Berd');                    
	                res.body.creationDate.should.not.equal(null);
			done();
		});
	});
	*/
	//End 3° TEst
  });
});