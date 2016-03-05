/*  GARDENLINK - ARDUINO CLIENT 
 *  Version 0.1
 *  Fecha 16-02-2016
 */

#include <SPI.h>
#include <Ethernet.h>
#include "DHT.h"
#include <aREST.h>
#include "RestClient.h"


byte mac[] = { 0x90, 0xA2, 0xDA, 0x0D, 0x1F, 0x48 };
byte ip[]      = { 192, 168,   100,  100}; 
byte gateway[] = { 192, 168,   100,  2 };   
byte subnet[]  = { 255, 255, 255,   0 }; 
String IP = "192.168.100.100";  //En caso de no poder conseguir IP por DHCP, se usa esta IP.


/* //Servidor Maestro -> Raspberry */
EthernetClient client;  
IPAddress server(192,168,100,149); 
RestClient restClient = RestClient("192.168.0.14",9000); 


char myIPAddress[20]; 


String response;


// Create aREST instance
aREST rest = aREST();
// Ethernet server
EthernetServer ArduinoServer(80);



/* Datos internos */
#define ID_DISPOISTIVO "002"
#define KEY_DISPOSITIVO "001_UNTOPO_$"
#define NOMBRE "CONTROLADOR_VENTANAS"

String ID_DISPOSITIVO = "002";


int failedCounter = 0; //para manejo de error
unsigned long lastSuccessfulUploadTime = 0; //Don't change. Used to determine if samples need to be uploaded.
unsigned long lastSuccessfulUploadTimeDevice = 0;

long updateFrequency = 30000UL;    // Update frequency in milliseconds (20000 = 20 seconds). Change this to change your sample frequency.
long updateFrequencyDevice = 30000;

#define PUERTO_REST_API 9000
#define PIN_SENSOR_PLANTA_1 "1"
#define PIN_SENSOR_PLANTA_2 "2"
#define PIN_SENSOR_PLANTA_3 "3"
#define PIN_SENSOR_PLANTA_4 "4"

#define SENSOR_DHT 8    
#define DHTTYPE DHT11   // DHT 11
//#define DHTTYPE DHT22   // DHT 22  (AM2302)
//#define DHTTYPE DHT21   // DHT 21 (AM2301)

#define N_SENSORES 1
String Sensores[N_SENSORES] = {"DHT"};

DHT dht(SENSOR_DHT, DHTTYPE);

void setup()
{
  
  //Datos para los servicios REST
  rest.set_id(ID_DISPOISTIVO);
  rest.set_name(NOMBRE);
  rest.function("Avanzar",avanzarMotor); //Avanzar Motor
  rest.function("Retroceder", retrocederMotor); // Retroceder Motor
  rest.function("Estado", estadoMotor);
  rest.function("Posicion", posicionMotor);
  rest.function("Temperatura", getTemperatura);
  rest.function("Humedad", getTemperatura);
  rest.function("IdDispositivo", setIdDispositivo);

  
  dht.begin();
 //Ethernet.begin(mac, ip); 
 Serial.begin(9600); 
 iniciarEthernet();
 delay(1000);
}


void loop()
{ 
  if(millis() - lastSuccessfulUploadTime > updateFrequency + 3000UL )
  {
 
    for (int i=0; i<N_SENSORES;i++) {
       //actualizarSensores(Sensores[i],leerSensor(Sensores[i]));
       delay(12000);
    }
  }

  if (millis() - lastSuccessfulUploadTimeDevice > updateFrequencyDevice)
  {
      subscribirDispositivo(IP);
      delay(1000);
  }

   // Esperando por nuevos clientes
  EthernetClient client = ArduinoServer.available();
  rest.handle(client);
}

int leerSensor(String idSensor)
{
  int valor;
  if (idSensor == "DHT")
  {
     float t = dht.readTemperature();
  
     if (isnan(t)) { // || isnan(f)) {
      Serial.println("Failed to read from DHT sensor!");
      return -1;
     }
     valor = t;
  }
  else
  {
    if (idSensor == "1")
      valor = 90;
    else
      valor = 95;
  }

  

  return valor;
}



void actualizarSensores(String idSensor, int valor) {

    unsigned long connectAttemptTime = millis();

    if (idSensor == "DHT")
    {
      idSensor = "8";
    }
    
    
    if (client.connect(server,PUERTO_REST_API))
    {
      String PostData = "valor=" + (String)valor;
      client.println("PUT /monitor/GrabarMedicion/" + idSensor + " HTTP/1.1");
      client.println("Host: 192.168.100.112");
      client.println("User-Agent: Arduino/1.0");
      client.println("Content-Type:  application/x-www-form-urlencoded");
      client.println("Connection: close");
      client.print("Content-Length: ");
      client.println(PostData.length());
      client.println();
      client.print(PostData);
      client.println();
      Serial.println("Grabado sensor: " + idSensor + " Valor : " + valor);

      lastSuccessfulUploadTime = connectAttemptTime;
      failedCounter = 0;

      client.stop();
    }
    else
    {
      Serial.println("Connection Fallo.");  
      Serial.println();
      manejarErrorConexion();
    }

     
}


void manejarErrorConexion() {
  //Connection failed. Increase failed counter
  failedCounter++;
 
  Serial.print(F("La conexion a BotanicBot fallo "));
  Serial.print(failedCounter);  
  Serial.println(F(" vez"));
  delay(1000);
     
  // Check if Arduino Ethernet needs to be restarted
  if (failedCounter > 5 )
  {
    //Too many failures. Restart Ethernet.
    Serial.print(F("Despues de 3 reintentos, reinicio ethernet "));
    iniciarEthernet();
  }
 
 }

void iniciarEthernet()
{
  //Start or restart the Ethernet connection.
  client.stop();
 
  Serial.println("Obteniendo IP..");
  Serial.println();  
 
  //Wait for the connection to finish stopping
  delay(2000);
 
  //Connect to the network and obtain an IP address using DHCP
  if (Ethernet.begin(mac) == 0)
  {
    Serial.println(F("DHCP Failed, se usa ip estatica"));
    Ethernet.begin(mac, ip); 
    Serial.println();
  }
  else
  {
    Serial.println(F("Conectado a la red usando DHCP"));
 
    //Set the mac and ip variables so that they can be used during sensor uploads later
    //Serial.print(F(" MAC: "));
    //Serial.println(mac);
    Serial.print(F(" IP address: "));
    IP = getIpReadable(Ethernet.localIP());
    Serial.println(IP);
    Serial.println();
  }

  subscribirDispositivo(IP);

  ArduinoServer.begin();
  Serial.println("Servidor corriendo en:  " + IP);
 
}

//Reportar la IP de este dispositivo al master (raspberry)
void subscribirDispositivo(String ip) {
  unsigned long connectAttemptTime = millis();
  unsigned long frecuencia = 600000UL;
  restClient.setContentType("application/x-www-form-urlencoded");
  //restClient.setHeader("User-Agent: Arduino/1.0");

  //Parametro ip (String to Char)
  String param = "ip=" + ip;
  char pBody[param.length()+1];
  param.toCharArray(pBody, sizeof(pBody));  

  //id Dispositivo
  String spath = "/api/dispositivos/" + ID_DISPOSITIVO + "/ip";
  char pPath[spath.length()+1];
  spath.toCharArray(pPath, sizeof(pPath)); 

  //Llamada a servicio 
  int statusCode = restClient.put(pPath, pBody);
  statusCode = 200;
  
  bool SubscripcionOk = false;
  int failedCounter = 1;
  char culo[10];

  while(SubscripcionOk == false && failedCounter < 6)
  {
    if (statusCode != 0)
    {
      response.remove(0,1);
      response.remove(response.length()-1,1);
      
      frecuencia = response.toInt();
      SubscripcionOk = true;
      lastSuccessfulUploadTimeDevice = connectAttemptTime;
    }
    else
    {
      frecuencia = 600000UL;
      SubscripcionOk = false;
      failedCounter++;
    }
    Serial.print("Status code: ");
    Serial.println((String)statusCode);
    Serial.print("Frecuencia de Muestreo: ");
    Serial.println((String)frecuencia);
    Serial.println("Conteo : " + (String)failedCounter);
    Serial.println("OK : " + (String)SubscripcionOk);
    
    delay(5000);
  }

  if (failedCounter > 5 )
  {
    //Too many failures. Restart Ethernet.
    Serial.print(F("Despues de 5 reintentos, reinicio ethernet "));
    failedCounter=0;
    iniciarEthernet();
  }

  response="";
  SubscripcionOk = true;

  updateFrequency = frecuencia;
  /*
  Serial.print("Status code from server: ");
  Serial.println(statusCode);
  Serial.print("Response body from server: ");
  Serial.println(response);
  delay(1000);
  response = "";
  */
   
   /*
   if (client.connect(server,PUERTO_REST_API))
   {
      String PostData = "ip=" + ip;
      client.println("PUT /monitor/SubscribirDispositivo/" + (String)ID_DISPOISTIVO + " HTTP/1.1");
      client.println("Host: 192.168.100.112");
      client.println("User-Agent: Arduino/1.0");
      client.println("Content-Type:  application/x-www-form-urlencoded");
      client.println("Connection: close");
      client.print("Content-Length: ");
      client.println(PostData.length());
      client.println();
      client.print(PostData);
      Serial.println("Solicitud enviada <id>: " + (String)ID_DISPOISTIVO + " <ip>: " + ip);
   }
   */
}

char* getIpReadable(IPAddress ipAddress)
{
  //Convert the ip address to a readable string
  unsigned char octet[4]  = {0,0,0,0};
  for (int i=0; i<4; i++)
  {
    octet[i] = ( ipAddress >> (i*8) ) & 0xFF;
  }
  sprintf(myIPAddress, "%d.%d.%d.%d\0",octet[0],octet[1],octet[2],octet[3]);
 
  return myIPAddress;
}


int avanzarMotor(String nmotor){
  return 1;
}

int retrocederMotor(String nmotor){
  return 0;
}

int estadoMotor(String nmotor){
  return 2;
}

int posicionMotor(String nmotor){
  return 3;
}

int setIdDispositivo(String idDispositivo) {
  ID_DISPOSITIVO = idDispositivo;
  Serial.print("Llega peticion" + ID_DISPOSITIVO);
  return 1;
}

int getTemperatura(String idSensor) {
  return 9000;
}

int getHumedad(String idSensor) {
  return 8000;
}





