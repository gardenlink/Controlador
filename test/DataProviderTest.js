var test = require('unit.js');
describe('Test para el DataProvider', function(){
  it('DataProvider', function(){
    // just for example of tested value

    //INIT ROUTINE:
    var winston     = require ('winston'); 
    var transports  = []; 
    var path        = require ('path'); //para utilizar rutas
	transports.push(new winston.transports.DailyRotateFile({
	  name: 'file',
	  //datePattern: '.yyyy-MM-ddTHH',
	  filename: path.join(__dirname, "logs", "log_test_file.log")
	}));

	var logger = new winston.Logger({transports: transports});

	var config = require("../config.json")["debug"];

    var DataProvider = require('../lib/dao/DataProvider.js');
	var dataProvider = new DataProvider(logger, config, null);

  console.dir(dataProvider, false,null,true);
    
	 test
          .object(dataProvider)
            //.hasValue('developper')
            .hasProperty('Data')
            //.hasProperty('from', 'France')
            //.contains({message: 'hello world'})
        ;


    var example = 'hello world';
    test
      .string(example)
        .startsWith('hello')
        .match(/[a-z]/)
      .given(example = 'you are welcome')
        .string(example)
          .endsWith('welcome')
          .contains('you')
      .when('"example" becomes an object', function(){
        example = {
          message: 'hello world',
          name: 'Nico',
          job: 'developper',
          from: 'France'
        };
      })
      .then('test the "example" object', function(){
        test
          .object(example)
            .hasValue('developper')
            .hasProperty('name')
            .hasProperty('from', 'France')
            .contains({message: 'hello world'})
        ;
      })
      .if(example = 'bad value')
        .error(function(){
          example.badMethod();
        })
    ;
  });
  it('other test case', function(){
    // other tests ...
  });
});