var webduino = require('webduino');


var argv = process.argv[2] || 'nonespecified';
var opts;
if (argv == 'true') { 
	opts = {test : true};
	console.log("Se hace uso de mocking para probar");
}
else
{
	console.log("Se ejecuta con board conectada al usb");
	opts = null;
}

var webduinoApp = webduino(opts);

var server = webduinoApp.server();
var PORT = 8000;

webduinoApp.on("ready", function() {
  // On board ready, start listening for http requests
  server.listen(PORT, function() {
    // Notify local IP Addrsss & PORT
    var IP = webduinoApp.localIPs()[0];
    console.log("Listening ons "+IP+":"+PORT);
  });
})