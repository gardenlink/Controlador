


/*  GARDENLINK - ARDUINO CLIENT
 *  Version 0.1
 *  Fecha 16-02-2016
 */

//Estos modos permiten disminuir el tamaÃ±o del sketch especialmente cuando se compila para ARduino Uno.

//#define HTTP_DEBUG          //Comentar para deshabilitar el modo debug del cliente rest
//#define GENERAL_DEBUG
#define ENABLE_REST_CLIENT  //Comentar para deshabilitar cliente rest
#define ENABLE_REST_SERVER  //Comentar para deshabilitar servidor rest
//#define ENABLE_DHT          //Comentar para deshabiitar el uso de sensor DHT
//#define IS_MEGA_BOARD
#define IS_UNO_BOARD

#if (defined ENABLE_REST_CLIENT) || (defined ENABLE_REST_SERVER)
  #include <SPI.h>
  #include <Ethernet.h>
#endif

#if defined (ENABLE_DHT)
  #include <Sensores.h>
#endif

#if defined (ENABLE_REST_SERVER)
  #include <aREST.h>
#endif

//#include <Actuador.h>

//Print modo debug
#ifdef HTTP_DEBUG
#define HTTP_DEBUG_PRINT(string) (Serial.println(string))
#endif

#ifndef HTTP_DEBUG
#define HTTP_DEBUG_PRINT(string)
#endif

#ifdef GENERAL_DEBUG
#define DEBUG_PRINT(string) (Serial.println(string))
#endif

#ifndef GENERAL_DEBUG
#define DEBUG_PRINT(String)
#endif


#if (defined ENABLE_REST_CLIENT) || (defined ENABLE_REST_SERVER)

/*  Configuracion de Red: *************************************
 *  EthernetClient : Libreria Base
 *  aREst : Servidor web para exponer api rest en arduino
 *  RestClient : Cliente para consumir servicios rest
 */

//Asignacion de IP para Ethernet Shield (en caso de que DHCP no funcione)
byte mac[] = { 0x90, 0xA2, 0xDA, 0x0D, 0x1F, 0x48 };
byte ip[]      = { 192, 168,   100,  100};
byte gateway[] = { 192, 168,   100,  2 };
byte subnet[]  = { 255, 255, 255,   0 };
String IP = "192.168.100.100";  //En caso de no poder conseguir IP por DHCP, se usa esta IP.


//Configuracion de EthernetClient
EthernetClient client;
char myIPAddress[20];

#endif

//******************Arest**************************
//IPAddress server(192,168,0,12);  //IP de Servidor Maestro para
// Create aREST instance
#if defined(ENABLE_REST_SERVER)
aREST rest = aREST();
// Ethernet server
EthernetServer ArduinoServer(80);
#endif
//******************end Arest***********************


#if (defined ENABLE_REST_CLIENT)
//****************RestClient*******************
//RestClient : Direccion en donde esta la API REST
//RestClient restClient = RestClient("192.168.200.32",9000);
//const char* host = "http://gardenlink.cl";
const char* host = "192.168.0.13";
//char host[] = "192.168.200.32"; 
//const char* host = "192.168.0.12";
int PUERTO_REST_API = 80;
String response; //Almacena la respuesta del cliente
//***************end RestClient*****************

#endif

/************* Datos de Dispositivo ******************/
#define DEVICE "002"
#define NOMBRE "CONTROLADOR_PRINCIPAL"
String ID_DISPOSITIVO = "002";

/************ Contadores para refresco de datos ****************/
int failedCounter = 0; //para manejo de error (al llegar a 5 se reinicia la placa)
unsigned long lastSuccessfulUploadTime = 0; //Don't change. Used to determine if samples need to be uploaded.
unsigned long lastSuccessfulUploadTimeDevice = 0;
unsigned long lastSuccessfulMotorCheckTime = 0;
unsigned long lastSuccessfulPumpCheckTime = 0;
long updateFrequency = 20000;    // Update frequency in milliseconds (20000 = 20 seconds). Change this to change your sample frequency.
long updateFrequencyDevice = 30000;
long updateFrequencyMotor = 5000;
long updateFrequencyPump = 4000;

/***************** SENSORES **************************/
#if defined (ENABLE_DHT)
#define SENSOR_DHT_PIN 8    //pin 8    
#define N_SENSORES 3
Sensores arrSensores[N_SENSORES] = {  Sensores(1, SENSOR_DHT_PIN, "DHT", 'T'), //Sensor DHT Temperatura
                                      Sensores(2, SENSOR_DHT_PIN, "DHT", 'H'),  //Sensor DHT Humedad
                                      Sensores(3, 3, "ANALOGO") };              //Sensor Analogo Nivel en pin 3
  
#endif

//Actuador actuador;

/* Configuracion Bombas 
 *  
 *  
*/

void setup()
{

  //Config bomba

  

//Motores
//actuador = Actuador();
//actuador.InitMotor(1,7,6); //PARAMS (id,E,M)
//actuador.InitMotor(2,5,4);
 

  //Servicios rest expuestos en la placa

#if defined(ENABLE_REST_SERVER)
  rest.set_name("001");
  rest.set_id("001");

  //Motores
  rest.function("Motor", Motor); //Acciones con Motores de ventanas

  //Sensores
#if defined (ENABLE_DHT)
  
  rest.function("Sensor", Sensor);
#endif
  //rest.function("IdDispositivo", setIdDispositivo);

  //Relays
  rest.function("Relay", Relay);

  //Bombas
  rest.function("Bomba", Bomba);
  
#endif


  


#if defined(GENERAL_DEBUG)
  Serial.begin(9600);
#endif

#if defined(LIGHTWEIGHT) && LIGHTWEIGHT == 1
  DEBUG_PRINT("Modo Liviano Activado, las funciones no entregan resultados");
#endif

#if defined(ENABLE_REST_SERVER) ||  defined (ENABLE_REST_CLIENT)
  iniciarEthernet();
  delay(1000);
#endif
}


void loop()
{

  // Esperando por nuevos clientes
#if defined(ENABLE_REST_SERVER)
  EthernetClient client = ArduinoServer.available();
  rest.handle(client);
#endif

  //Reportar este dispositivo al master
  if (millis() - lastSuccessfulUploadTimeDevice > updateFrequencyDevice)
  {
    #if defined (ENABLE_REST_CLIENT)
      subscribirDispositivo(IP);
    #endif
    delay(1000);
  }

  //Revisar sensores
  #if defined (ENABLE_DHT)
  if (millis() - lastSuccessfulUploadTime > updateFrequency + 3000UL )
  {

    for (int i = 0; i < N_SENSORES; i++) {

      String tipo = arrSensores[i].GetTipo();
      String idSensor = (String)arrSensores[i].GetId();
      char operacion = arrSensores[i].GetOperacion();

      DEBUG_PRINT("Lectura Sensor tipo: " + tipo + " ID: "  + idSensor);

      actualizarSensores(tipo,operacion, idSensor);

      delay(1000);
    }
  }
  #endif

  //Revisar motores
  if (millis() - lastSuccessfulMotorCheckTime > updateFrequencyMotor)
  {
    //HTTP_DEBUG_PRINT("Entra CehckMotor");
    lastSuccessfulMotorCheckTime = millis();
    //actuador.RevisarMotores();
    delay(1000);
  }

  /* BOMBAS */
  
  //Revisar bombas para ver si estan activas y si llevan mucho tiempo
  //bomba1.Revisar();
  //bomba2.Revisar();
  
}


#if defined(ENABLE_REST_SERVER) ||  defined (ENABLE_REST_CLIENT)
void iniciarEthernet()
{
  //Start or restart the Ethernet connection.
  client.stop();

  DEBUG_PRINT("Obteniendo IP..");
  DEBUG_PRINT();

  //Wait for the connection to finish stopping
  delay(2000);

  //Connect to the network and obtain an IP address using DHCP
  if (Ethernet.begin(mac) == 0)
  {
    DEBUG_PRINT(F("DHCP Failed, se usa ip estatica"));
    Ethernet.begin(mac, ip);
    DEBUG_PRINT();
  }
  else
  {
    DEBUG_PRINT(F("Conectado a la red usando DHCP"));

    //Set the mac and ip variables so that they can be used during sensor uploads later
    //HTTP_DEBUG_PRINT(F(" MAC: "));
    //HTTP_DEBUG_PRINT(mac);
    DEBUG_PRINT(F(" IP address: "));
    IP = getIpReadable(Ethernet.localIP());
    DEBUG_PRINT(IP);
    DEBUG_PRINT();
  }

#if defined (ENABLE_REST_CLIENT)
  subscribirDispositivo(IP);
#endif

#if defined (ENABLE_REST_SERVER)
  ArduinoServer.begin();
#endif
  DEBUG_PRINT("Servidor corriendo en:  " + IP);
}

#endif

#if defined(ENABLE_REST_CLIENT)
//Reportar la IP de este dispositivo al master (raspberry)
void subscribirDispositivo(String ip) {
  unsigned long connectAttemptTime = millis();
  unsigned long frecuencia = 60000UL;

  DEBUG_PRINT("Inicio Subscripcion de dispositivo");

  //restClient.setContentType("application/x-www-form-urlencoded");
  //restClient.setHeader("User-Agent: Arduino/1.0");

  //Parametro ip (String to Char)
  String param = "ip=" + ip;
  char pBody[param.length() + 1];
  param.toCharArray(pBody, sizeof(pBody));

  //id Dispositivo
  String spath = "/api/dispositivos/" + ID_DISPOSITIVO + "/subscripcion";
  char pPath[spath.length() + 1];
  spath.toCharArray(pPath, sizeof(pPath));

  //Llamada a servicio
  int statusCode = callPut(pPath, pBody,  &response);
  HTTP_DEBUG_PRINT("REspuesta de servidor status code :" + statusCode);
  statusCode = 200;

  bool SubscripcionOk = false;
  int failedCounter = 1;

  while (SubscripcionOk == false && failedCounter < 6)
  {

    if (statusCode != 0)
    {

      //response.remove(0,1);
      //response.remove(response.length()-1,1);

      // PArseo sensores
      //String tipo = response.substring(0,3);
      //String idSensor = Sensores[i].substring(3,Sensores[i].length());

      
      frecuencia = response.toInt();
      SubscripcionOk = true;
      lastSuccessfulUploadTimeDevice = connectAttemptTime;
    }
    else
    {

    #if defined (GENERAL_DEBUG)
          frecuencia = 60000UL;
    #else
          frecuencia = 600000UL;
    #endif


      SubscripcionOk = false;
      failedCounter++;
    }

    delay(2000);
  }

  if (failedCounter > 5 )
  {
    //Too many failures. Restart Ethernet.
    HTTP_DEBUG_PRINT(F("Despues de 5 reintentos, reinicio ethernet "));
    failedCounter = 0;
    iniciarEthernet();
  }

  response = "";
  SubscripcionOk = true;

  HTTP_DEBUG_PRINT("Frecuencia de actualizacion de sensores.." + frecuencia);
  updateFrequency = frecuencia;

}

#endif



/* Servicio de Motores */

int Motor(String params) {
  String accion = params.substring(0, 1);
  int idMotor = params.substring(1, (int)params.length()).toInt();
  char pBody[2];
  accion.toCharArray(pBody, sizeof(pBody));
  char selector = pBody[0];

  int resultado = 0;


  switch (selector)
  {
    case 'A':
//      actuador.AvanzarMotor(idMotor);
      break;

    case 'R':
  //    actuador.RetrocederMotor(idMotor);
      break;

    case 'D':
    //  actuador.DetenerMotor(idMotor);
      break;

    case 'E':
     // resultado = actuador.EstadoMotor(idMotor);
      break;

    case 'P':
     // resultado = actuador.PosicionMotor(idMotor);
      break;

    default:
     // resultado = -1;
      DEBUG_PRINT("Llamada a motor con parametro accion incorrecto");
      break;
  }

  return resultado;

}

/* Servicio de Bombas */

int Bomba(String params) {
  String accion = params.substring(0, 1);
  String Pin = params.substring(1, (int)params.length());
  int Id = 1;

  char pBody[2];
  char pinBody[2];
  accion.toCharArray(pBody, sizeof(pBody));
  Pin.toCharArray(pinBody, sizeof(pinBody));

  char selector = pBody[0];
  char dPin = pinBody[0];
  int resultado;
  DEBUG_PRINT("Bomba Pin en parametro "  + (String)dPin);

  int aPin = mapAnalogPin(dPin);
  DEBUG_PRINT("Relay Pin en parametro "  + (String)aPin);

  //actuador.SetId(Id);
  //bomba1.SetPin(aPin);
  
  
  switch (selector)
  {
    case 'E':
      //actuador.Encender(Id);
      resultado = 1;
      break;

    case 'A':
      //actuador.Apagar(Id);
      resultado = 0;
      break;

    default:
      HTTP_DEBUG_PRINT("Llamada a bomba con parametro accion incorrecto");
      resultado = -1;
  }
  
}


/* CODIGO PARA MANEJO DE RELAYS */

int Relay(String params) {

  String accion = params.substring(0, 1);
  String Pin = params.substring(1, (int)params.length());

  char pBody[2];
  char pinBody[2];
  accion.toCharArray(pBody, sizeof(pBody));
  Pin.toCharArray(pinBody, sizeof(pinBody));

  char selector = pBody[0];
  char dPin = pinBody[0];
  int resultado;
  DEBUG_PRINT("Relay Pin en parametro "  + (String)dPin);


  int aPin = mapAnalogPin(dPin);
  DEBUG_PRINT("Relay Pin en parametro "  + (String)aPin);



  switch (selector)
  {
    case 'E':
      pinMode(aPin, OUTPUT);
      digitalWrite(aPin, HIGH);
      resultado = 1;
      break;

    case 'A':
      pinMode(aPin, OUTPUT);
      digitalWrite(aPin, LOW);
      resultado = 0;
      break;

    default:
      HTTP_DEBUG_PRINT("Llamada a relay con parametro accion incorrecto");
      resultado = -1;
  }

  return resultado;

}



int mapAnalogPinString(String Pin)
{
  int analogPin;

   

#if defined (IS_MEGA_BOARD)
  if (Pin == "A10") {
    return A10;
  }

  if (Pin == "A11") {
    return A11;
  }

  if (Pin == "A12") {
    return A12;
  }

  if (Pin == "A13") {
    return A13;
  }

  if (Pin == "A14") {
    return A14;
  }

  if (Pin == "A15") {
    return A15;
  }
#endif

  return -1;
}




int mapAnalogPin(char Pin) {



  int analogPin;

  switch (Pin) {

    case '0':
      analogPin = A0;
      break;
    case '1':
      analogPin = A1;
      break;

    case '2':
      analogPin = A2;
      break;

    case '3':
      analogPin = A3;
      break;

    case '4':
      analogPin = A4;
      break;

    case '5':
      analogPin = A5;
      break;

    case '6':
      analogPin = A6;
      break;

    case '7':
      analogPin = A7;
      break;

#if defined (IS_MEGA_BOARD)


    case '8':
      analogPin = A8;
      break;

    case '9':
      analogPin = A9;
      break;

    case '10':
      analogPin = A10;
      break;

    case '11':
      analogPin = A11;
      break;

    case '12':
      analogPin = A12;
      break;

    case '13':
      analogPin = A13;
      break;

    case '14':
      analogPin = A14;
      break;
#endif

    default:
      analogPin = -1;
      break;

  }
  return analogPin;
}


/* CODIGO PARA MANEJO DE SENSORES */

#if defined (ENABLE_DHT)


void actualizarSensores(String tipo, char accion, String idSensor) {

  //restClient.setContentType("application/x-www-form-urlencoded");
  //restClient.setHeader("User-Agent: Arduino/1.0");

  unsigned long muestraMedicion = millis();
  lastSuccessfulUploadTime = muestraMedicion;

  //LEer sensoeres

  int valor = 0;
  String pinSensor;

  if (tipo == "DHT") {
  
    String accion = (String)accion;
    //valor = Sensor(accion + idSensor);
    valor = arrSensores[0].Leer();
  }
  else if (tipo == "ANALOGO") {

    pinSensor = idSensor;
    valor = analogRead(mapAnalogPinString(pinSensor));
  }
  else
  {
    pinSensor = idSensor;
    valor = digitalRead(pinSensor.toInt());

  }

  DEBUG_PRINT("Actualizando lectura de sensor tipo : " + tipo + " Id : " + pinSensor + " Valor Lectura : " + (String)valor);
  String param = "IdSensor=" + idSensor + " IdDispositivo=" + (String)ID_DISPOSITIVO + " Valor=" + (String)valor;

  char pBody[param.length() + 1];
  param.toCharArray(pBody, sizeof(pBody));

  //id Dispositivo
  String spath = "/api/sensores/mediciones";
  char pPath[spath.length() + 1];
  spath.toCharArray(pPath, sizeof(pPath));

  //Llamada a servicio
  #if defined (ENABLE_REST_CLIENT)
  int statusCode = callPut(pPath, pBody, &response);
  statusCode = 200;
  #endif
}

//Servicio para manejo de sensores
//Parametros:
// params: <ACCION><IDSENSOR><PIN>
//    ACCION :
//      T: Temperatura
//      H: Humedad
//    IDSENSOR : ID_SENSOR desde base de datos
//    PIN      : PIN EN DONDE ESTA EL SENSOR

int Sensor(String params) {




  String accion = params.substring(0, 1);
  String idSensor = params.substring(1, (int)params.length());
  //String Pin = params.substring(2,(int)params.length());



  char pBody[2];
  accion.toCharArray(pBody, sizeof(pBody));
  char selector = pBody[0];

  DEBUG_PRINT("Llamada Sensor con parametro "  + (String)selector);

  int resultado = -1;

  float h;
  float t;


  switch (selector)
  {
    case 'T':
      // Read temperature as Celsius (the default)
      t = 22;//dht1.readTemperature();
      if (isnan(t)) { // || isnan(f)) {
        DEBUG_PRINT("Failed to read from DHT sensor!");
        resultado = -1;
      }
      resultado = t;
      break;

    case 'H':
      // Reading temperature or humidity takes about 250 milliseconds!
      // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
      h = 22;//dht1.readHumidity();
      if (isnan(h)) { // || isnan(f)) {
        DEBUG_PRINT("Failed to read from DHT sensor!");
        resultado - 1;
      }

      resultado = (int)h;
      break;

    default:
      DEBUG_PRINT("Llamada a sensor con parametro accion incorrecto");
      resultado = -1;
  }

  HTTP_DEBUG_PRINT("Llamada Sensor valor : " + (String)resultado);
  return resultado;
}
#endif


int setIdDispositivo(String idDispositivo) {
  ID_DISPOSITIVO = idDispositivo;
  DEBUG_PRINT("Llega peticion" + ID_DISPOSITIVO);
  return 1;
}

#if defined (ENABLE_REST_CLIENT) || defined (ENABLE_REST_SERVER)

char* getIpReadable(IPAddress ipAddress)
{
  //Convert the ip address to a readable string
  unsigned char octet[4]  = {0, 0, 0, 0};
  for (int i = 0; i < 4; i++)
  {
    octet[i] = ( ipAddress >> (i * 8) ) & 0xFF;
  }
  sprintf(myIPAddress, "%d.%d.%d.%d\0", octet[0], octet[1], octet[2], octet[3]);

  return myIPAddress;
}


void manejarErrorConexion() {
  //Connection failed. Increase failed counter
  failedCounter++;

  HTTP_DEBUG_PRINT(F("La conexion a BotanicBot fallo "));
  HTTP_DEBUG_PRINT(failedCounter);
  HTTP_DEBUG_PRINT(F(" vez"));
  delay(1000);

  // Check if Arduino Ethernet needs to be restarted
  if (failedCounter > 5 )
  {
    //Too many failures. Restart Ethernet.
    HTTP_DEBUG_PRINT(F("Despues de 3 reintentos, reinicio ethernet "));
    iniciarEthernet();
  }

}
#endif



#if defined (ENABLE_REST_CLIENT)
int request(const char* method, const char* path,
            const char* body, String* response) {


  int num_headers;
  num_headers = 0;
  const char* headers[10];
  const char* contentType;
  contentType = "application/x-www-form-urlencoded";  // default



  HTTP_DEBUG_PRINT("HTTP: connect to: \n" + (String)host + ":" + PUERTO_REST_API);

/*
 * client.connect() returns:
  SUCCESS 1
  TIMED_OUT -1
  INVALID_SERVER -2
  TRUNCATED -3
  INVALID_RESPONSE -4
  ERROR 0
  */
  if (client.connect(host, PUERTO_REST_API)) {
    HTTP_DEBUG_PRINT("HTTP: connected\n");
    HTTP_DEBUG_PRINT("REQUEST: \n");
    // Make a HTTP request line:
    write(method);
    write(" ");
    write(path);
    write(" HTTP/1.1\r\n");
    for (int i = 0; i < num_headers; i++) {
      write(headers[i]);
      write("\r\n");
    }
    write("Host: ");
    write(host);
    write("\r\n");
    write("Connection: close\r\n");

    if (body != NULL) {
      char contentLength[30];
      sprintf(contentLength, "Content-Length: %d\r\n", strlen(body));
      write(contentLength);

      write("Content-Type: ");
      write(contentType);
      write("\r\n");
    }

    write("\r\n");

    if (body != NULL) {
      write(body);
      write("\r\n");
      write("\r\n");
    }

    //make sure you write all those bytes.
    delay(100);

    HTTP_DEBUG_PRINT("HTTP: call readResponse\n");
    int statusCode = readResponse(response);

    HTTP_DEBUG_PRINT("HTTP: return readResponse\n");

    //cleanup
    HTTP_DEBUG_PRINT("HTTP: stop client\n");
    num_headers = 0;
    client.stop();
    delay(50);
    HTTP_DEBUG_PRINT("HTTP: client stopped\n");

    return statusCode;
  } else {
    HTTP_DEBUG_PRINT("HTTP Connection failed\n");
    client.stop();
    return 0;
  }
}


int callGet(const char* path, String* response) {
  return request("GET", path, NULL, response);
}

int callPut(const char* path, const char* body, String* response) {
  return request("PUT", path, body, response);
}


int callPost(const char* path, const char* body, String* response) {
  return request("POST", path, body, response);
}

int callPost(const char* path, const char* body) {
  return request("POST", path, body, NULL);
}

int callPatch(const char* path, const char* body, String* response) {
  return request("PATCH", path, body, response);
}

void write(const char* string) {
  client.print(string);
}



int readResponse(String* response) {

  // an http request ends with a blank line
  boolean currentLineIsBlank = true;
  boolean httpBody = false;
  boolean inStatus = false;

  char statusCode[4];
  int i = 0;
  int code = 0;

  if (response == NULL) {
    HTTP_DEBUG_PRINT("HTTP: NULL RESPONSE POINTER: \n");
  } else {
    HTTP_DEBUG_PRINT("HTTP: NON-NULL RESPONSE POINTER: \n");
  }

  HTTP_DEBUG_PRINT("HTTP: RESPONSE: \n");
  while (client.connected()) {
    HTTP_DEBUG_PRINT(".");

    if (client.available()) {
      HTTP_DEBUG_PRINT(",");

      char c = client.read();
      HTTP_DEBUG_PRINT(c);

      if (c == ' ' && !inStatus) {
        inStatus = true;
      }

      if (inStatus && i < 3 && c != ' ') {
        statusCode[i] = c;
        i++;
      }
      if (i == 3) {
        statusCode[i] = '\0';
        code = atoi(statusCode);
      }

      if (httpBody) {
        //only write response if its not null
        if (response != NULL) response->concat(c);
      }
      else
      {
        if (c == '\n' && currentLineIsBlank) {
          httpBody = true;
        }

        if (c == '\n') {
          // you're starting a new line
          currentLineIsBlank = true;
        }
        else if (c != '\r') {
          // you've gotten a character on the current line
          currentLineIsBlank = false;
        }
      }
    }
  }
  HTTP_DEBUG_PRINT("HTTP: return readResponse3\n");
  return code;
}

#endif











