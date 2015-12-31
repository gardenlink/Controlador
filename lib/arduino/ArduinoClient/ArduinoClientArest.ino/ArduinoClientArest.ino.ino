#include <SPI.h>
#include <Ethernet.h>
#include "DHT.h"
#include <aREST.h>


byte mac[] = { 0x90, 0xA2, 0xDA, 0x0D, 0x1F, 0x48 };
byte ip[]      = { 192, 168,   100,  100}; 
byte gateway[] = { 192, 168,   100,  2 };   
byte subnet[]  = { 255, 255, 255,   0 }; 
String IP = "192.168.100.100";

EthernetClient client;  
IPAddress server(192,168,100,112); //Master Server
char myIPAddress[20]; 



// Create aREST instance
aREST rest = aREST();
// Ethernet server
EthernetServer ArduinoServer(80);



/* Datos internos */
#define ID_DISPOISTIVO "001"
#define KEY_DISPOSITIVO "001_UNTOPO_$"
#define NOMBRE "CONTROLADOR_BOMBA"


int failedCounter = 0; //para manejo de error
unsigned long lastSuccessfulUploadTime = 0; //Don't change. Used to determine if samples need to be uploaded.

const unsigned long updateFrequency = 10000UL;    // Update frequency in milliseconds (20000 = 20 seconds). Change this to change your sample frequency.

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

  rest.set_id(ID_DISPOISTIVO);
  rest.set_name(NOMBRE);
  
  
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
       actualizarSensores(Sensores[i],leerSensor(Sensores[i]));
       delay(12000);
    }
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

  ArduinoServer.begin();
  Serial.print("Servidor corriendo en:  " + IP);

  subscribirDispositivo(IP);
 
}

//Reportar la IP de este dispositivo al master (raspberry)
void subscribirDispositivo(String ip) {
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


