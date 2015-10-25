/* 
  This a simple example of the aREST Library for Arduino (Uno/Mega/Due/Teensy)
  using the Ethernet library (for example to be used with the Ethernet shield). 
  See the README file for more details.
 
  Written in 2014 by Marco Schwartz under a GPL license. 
*/

// Libraries
#include <SPI.h>
#include <Ethernet.h>
#include <aREST.h>
#include <avr/wdt.h>
#include "DHT.h"

// Enter a MAC address for your controller below.
byte mac[] = { 0x90, 0xA2, 0xDA, 0x0D, 0x1F, 0x48 };

// IP address in case DHCP fails
IPAddress ip(192,168,0,90);

// Ethernet server
EthernetServer server(80);

// Create aREST instance
aREST rest = aREST();

// Variables to be exposed to the API
int temperature;
int humidity;


#define LEDPIN 9

// DHT SPECIAL:
#define DHTPIN 7     // what pin we're connected to
// Uncomment whatever type you're using!
#define DHTTYPE DHT11   // DHT 11
//#define DHTTYPE DHT22   // DHT 22  (AM2302)
//#define DHTTYPE DHT21   // DHT 21 (AM2301)
DHT dht(DHTPIN, DHTTYPE);

void setup(void)
{  
  // Start Serial
  Serial.begin(115200);
  
  // Init variables and expose them to REST API
  //temperature = 0;
  //humidity = 0;
  //rest.variable("temperature",&temperature);
  //rest.variable("humidity",&humidity);

  // Funciones que seran expuestas por la API
  rest.function("Temperatura",getTemperatura);
  rest.function("Humedad", getHumedad);
  
  // Identificador y nombre del dispositivo
  rest.set_id("001");
  rest.set_name("ARDUINO_UNO_1");

  //rest.set_status_led(LEDPIN);

  // Iniciar la conexion ethernet
  if (Ethernet.begin(mac) == 0) {
    //Serial.println("Fallo al obtener IP por DHCP");
    // no point in carrying on, so do nothing forevermore:
    // try to congifure using IP address instead of DHCP:
    Ethernet.begin(mac, ip);
  }

  
  
  //Inicializar sensores:
  dht.begin();
  Serial.print("Sensores Inicializados..");

  //Inicio server
  server.begin();
  Serial.print("Servidor corriendo en:  ");
  Serial.println(Ethernet.localIP());

  // Start watchdog
  wdt_enable(WDTO_4S);
}

void loop() {  
  
  // Esperando por nuevos clientes
  EthernetClient client = server.available();
  rest.handle(client);
  wdt_reset();
  
}


// Funcion que es accesible por la API
int ledControl(String command) {
  
  // Get state from command
  Serial.println(command);
  int state = command.toInt();
  
  digitalWrite(6,state);
  return 2;
}

//Obtiene la temperatura del DHT
int getTemperatura(String command){ 

   // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  //float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  //float f = dht.readTemperature(true);

  // Check if any reads failed and exit early (to try again).
  if (isnan(t)) { // || isnan(f)) {
    Serial.println("Failed to read from DHT sensor!");
    return -1;
  }

  // Compute heat index in Fahrenheit (the default)
  //float hif = dht.computeHeatIndex(f, h);
  // Compute heat index in Celsius (isFahreheit = false)
  //float hic = dht.computeHeatIndex(t, h, false);

//  Serial.print("Humidity: ");
//  Serial.print(h);
//  Serial.print(" %\t");
//  Serial.print("Temperature: ");
//  Serial.print(t);
//  Serial.print(" *C ");
//  Serial.print(f);
//  Serial.print(" *F\t");
//  Serial.print("Heat index: ");
//  Serial.print(hic);
//  Serial.print(" *C ");
//  Serial.print(hif);
//  Serial.println(" *F");

  return t;
  
}

//Obtiene la humedad desde el DHT
int getHumedad(String command){ 

   // Reading temperature or humidity takes about 250 milliseconds!
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  //float t = dht.readTemperature();
  // Read temperature as Fahrenheit (isFahrenheit = true)
  //float f= dht.readTemperature(true);

  // Check if any reads failed and exit early (to try again).
  if (isnan(h)) { // || isnan(f)) {
    Serial.println("Failed to read from DHT sensor!");
    return -1;
  }

  // Compute heat index in Fahrenheit (the default)
  //float hif = dht.computeHeatIndex(f, h);
  // Compute heat index in Celsius (isFahreheit = false)
  //float hic = dht.computeHeatIndex(t, h, false);

//  Serial.print("Humidity: ");
//  Serial.print(h);
//  Serial.print(" %\t");
//  Serial.print("Temperature: ");
//  Serial.print(t);
//  Serial.print(" *C ");
//  Serial.print(f);
//  Serial.print(" *F\t");
//  Serial.print("Heat index: ");
//  Serial.print(hic);
//  Serial.print(" *C ");
//  Serial.print(hif);
//  Serial.println(" *F");

  return h;
  
}

