module.exports = function(app, moment, dataProvider, logger, graficos){

var ArestLibrary = require("../lib/Arduino/Arest.js");
var arduinoService; 


app.put('/monitor/GrabarMedicion/:id', function (request, response) {
    var sensor = request.params.id;
    var dispositivo = "001"; //request.params.idDispositivo;
    var valor = request.body.valor;
    console.log("llega solicitud de grabacion para grabar sensor: " + sensor + " con valor : " + valor);
    dataProvider.Sensor().Save(dispositivo,sensor, sensor, valor);
    response.json("OK");
});


app.put('/monitor/SubscribirDispositivo/:id', function (request, response) {
    var id = request.params.id;
    var key = request.body.key;
    var ip = request.body.ip;
    console.log("Llega peticion de subscripcion desde dispositivo: " + id + " con IP : " + ip);
    console.log("Obteniendo informacion del dispositivo..");

    //this.arduinoService = new ArestLibrary(ip + ':' + "9000");
    //this.arduinoService.boardInfo(id,  function(data) { console.log(data); });

    //sensorProvider.Save(sensor, valor);
    var filter = {Id : String};
    filter.Id = id;
    
    dataProvider.Device().Find(filter, function(err, data) { 
      if (data.length > 0) {
        dataProvider.Device().Save(data[0].Id, data[0].Nombre, data[0].Tipo, ip,data[0].Puerto,data[0].Habilitado,true);
      }
    });
    
    //dataProvider.Device().GetAll(function(err, data) {
     // console.log(data);
     // });
    
    response.json("Ok");  
});


app.get('/monitor/ListarMediciones/:id', function (request, response) {

   var  today = moment();
    yesterday = moment(today).add(-12, 'hours');

    //console.log(today.toDate());
    //console.log(yesterday.toDate());

  var filter =  {TimeStamp: {
      $gte: yesterday.toDate(),
      $lt: today.toDate()},
      Id : request.params.id
    };


    dataProvider.Sensor().GetCollection(filter, function(error,docs){
        response.json(docs);
        });

      });

app.get('/monitor/Graficar/:id', function(request,response) {

   var  today = moment();
    yesterday = moment(today).add(-12, 'hours');

   var filter =  {TimeStamp: {
      $gte: yesterday.toDate(),
      $lt: today.toDate()},
      Id : request.params.id
    };


  dataProvider.Sensor().GetCollection(filter,function(error,docs){
        graficos.Graficar(docs, function(error, url){ 
              response.json(url);
          });
        });
});   

};