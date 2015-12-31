module.exports = function(app, moment, dataProvider, logger){

var ArestLibrary = require("../lib/Arduino/Arest.js");
var arduinoService; 


app.get('/Dispositivo/ObtenerPayload/:id', function (request, response) {
    var dispositivo = request.params.id;

     var filter = {Id : String};
    filter.Id = dispositivo;
    //var valor = request.body.valor;
    console.log("llega solicitud de payload para dispositivo " + dispositivo);
    dataProvider.Device().Find(filter, function(err, data) { 
      if (data.length > 0) {
        console.log(data);
        response.json(data);
        //dataProvider.Device().Save(data[0].Id, data[0].Nombre, data[0].Tipo, ip,data[0].Puerto,data[0].Habilitado,true);
      }
    });
});



app.put('/Dispositivo/SubscribirDispositivo/:id', function (request, response) {
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

app.put('/Dispositivo/NotificarEstado/:id', function (request, response) {
    var id = request.params.id;
    var key = request.body.key;
    var ip = request.body.ip;
    console.log("Llega notificacion de estado de dispositivo: " + id + " con IP : " + ip);
    

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

app.get('/Dispositivo/ConsultarEstado/:id', function (request, response) {
    var dispositivo = request.params.id;

    var filter = {Id : String};
    filter.Id = dispositivo;
    //var valor = request.body.valor;
    console.log("llega consulta de estado para dispositivo " + dispositivo);
    dataProvider.Device().Find(filter, function(err, data) { 
      if (data.length > 0) {
        console.log(data);
        response.json(data);
      }
    });
});


};