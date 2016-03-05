var method = Net.prototype;


var _ping = require('ping');
var async = require('async');


function Net()
{


}


method.Ping = function(ip, callback) {

var isAlive = false;

_ping.sys.probe(ip, function(isAlive){
      console.log(ip + " isAlive? : " + isAlive);
      callback(null, isAlive);
   });

};

module.exports = Net;