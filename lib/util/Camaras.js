/*
 * Twitter Helper
 * https://github.com/Gerdenlink
 *
 */

var method = Camaras.prototype;

 //http = require('http'),
 Cam = require('onvif').Cam;
 var _camara;


//log
var _logger;
var _config;


/**
* config : the configuratio object (Json Format)
* logger : winston preconfigured object
*/
function Camaras(config, logger)
{
  
  var CAMERA_HOST = "192.168.0.13"
  var USERNAME = "admin";
  var PASSWORD = "admin123";

  this._camara = new Cam({
  	hostname: CAMERA_HOST,
  	username: USERNAME,
  	password: PASSWORD,
    port : 1080
    //service : "/12"
	});

  this._camara.getSystemDateAndTime(function(data) { console.log(data);});

/*
this._camara =  require('onvif');
this._camara.Discovery.probe(function(err, cams) {
// function would be called only after timeout (5 sec by default)
    if (err) { throw err; }
    cams.forEach(function(cam) {
        cam.username = "admin";
        cam.password = "admin123";
        cam.connect(console.log);
    });
});

*/

}

method.GetStreamUri = function(callback) {

  
	//this._camara.getStreamUri({protocol:'RTSP', profileToken : 'MainStream'}, function(err, stream) { callback(stream.uri); });
	
	/*
	 http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('<html><body>' +
        '<embed type="application/x-vlc-plugin" target="' + stream.uri + '"></embed>' +
        '</body></html>');
    }).listen(3030);
	*/
};

method.GetDeviceInfo = function(callback) {
  this._camara.getDeviceInformation(callback);
};

 
 



module.exports = Camaras;