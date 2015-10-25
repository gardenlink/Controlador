var method = Graficos.prototype;
var Auxiliares = require('./Auxiliares');
var auxiliares = new Auxiliares();

var plotly;
function Graficos(config, logger) 
{
  plotly = require('plotly')('BotanicBot','fgshqj0wqi');
}



method.Graficar = function(info, callback) {
  

var data = [];
var xAxys = [];
var yAxys = [];

for(var i in info)
{
   //console.log("Timestamp: " + docs[i].TimeStamp + " Valor : " + docs[i].Valor);
   //xAxys[i] = auxiliares.DateParse_hh_mm(info[i].TimeStamp);
   xAxys[i] = auxiliares.DateParse_dd_mm_yyyy_hh_mm(info[i].TimeStamp)
   
   yAxys[i] = info[i].Valor;
}

var data = [
  {
    x: xAxys,//["2013-10-04 22:23:00", "2013-11-04 22:23:00", "2013-12-04 22:23:00"], 
    y: yAxys,//[1, 3, 6], 
    type: "scatter"
  }
];

//console.log(data);

var graphOptions = {filename: "date-axes", fileopt: "overwrite"};
plotly.plot(data, graphOptions, function (err, msg) {
    callback(null, msg.url);
});

};


module.exports = Graficos;