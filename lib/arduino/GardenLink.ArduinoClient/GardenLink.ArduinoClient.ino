
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



/*  Configuracion de Red: *************************************
 *  EthernetClient : Libreria Base
 *  aREst : Servidor web para exponer api rest en arduino
 *  RestClient : Cliente para consumir servicios rest
 */

//EthernetClient
EthernetClient client;  
char myIPAddress[20]; 

//Arest
IPAddress server(192,168,200,32);  //IP de Servidor Maestro para 
// Create aREST instance
aREST rest = aREST();
// Ethernet server
EthernetServer ArduinoServer(80);


//RestClient
RestClient restClient = RestClient("192.168.200.32",9000); 
String response; //Almacena la respuesta del cliente


/* Datos de Dispositivo */
#define DEVICE "001"
#define KEY_DISPOSITIVO "001_UNTOPO_$"
#define NOMBRE "CONTROLADOR_PRINCIPAL"

String ID_DISPOSITIVO = "001";

/* Contadores para refresco de datos */
int failedCounter = 0; //para manejo de error (al llegar a 5 se reinicia la placa)
unsigned long lastSuccessfulUploadTime = 0; //Don't change. Used to determine if samples need to be uploaded.
unsigned long lastSuccessfulUploadTimeDevice = 0;
unsigned long lastSuccessfulMotorCheckTime = 0;

long updateFrequency = 60000UL;    // Update frequency in milliseconds (20000 = 20 seconds). Change this to change your sample frequency.
long updateFrequencyDevice = 60000;
long updateFrequencyMotor = 5000;

/* SENSORES */
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


/* Controlador Motores 
 *  
 * #Connection:
   #        M1 pin  -> Digital pin 6
   #        E1 pin  -> Digital pin 7
   #        M2 pin  -> Digital pin 4
   #        E2 pin  -> Digital pin 5
   #        Motor Power Supply -> Centor blue screw connector(5.08mm 3p connector)
   #        Motor A  ->  Screw terminal close to E1 driver pin
   #        Motor B  ->  Screw terminal close to E2 driver pin
   # 
   # Note: You should connect the GND pin from the DF-MD v1.3 to your MCU controller. They should share the GND pins.
   #
*/

int E1 = 7;
int M1 = 6;
int E2 = 5;                         
int M2 = 4;

//Estdaos:
// 0.- Detenido
// 1.- Subiendo
// 2.- Bajando


int estado_m1;
int estado_m2;
int estado_m3;
int estado_m4;


// Posiciones:
// 0.- Cerrado
// 1.- 25%
// 2.- 50%
// 3.- 75%
// 4.- 100%


int posicion_m1;
int posicion_m2;
int posicion_m3;
int posicion_m4;


void setup()
{


  //Configuracion de Motores:
   pinMode(M1, OUTPUT);   
   pinMode(M2, OUTPUT); 

   
   estado_m1 = 0;
   estado_m2 = 0;
   estado_m3 = 0;
   estado_m4 = 0;
   
   
   posicion_m1 = 0;
   posicion_m2 = 0;
   posicion_m3 = 0;
   posicion_m4 = 0;
   
  //Servicios expuestos en la placa

  rest.set_name("001");
  rest.set_id("001");
  
  //Motores
  rest.function("Avanzar",avanzarMotor); //Avanzar Motor
  rest.function("Retroceder", retrocederMotor); // Retroceder Motor
  rest.function("Estado", estadoMotor); //Estado motor (ver variable estado)
  rest.function("Posicion", posicionMotor); //ver variable posicion
  rest.function("Detener", detenerMotor); // Detiene lo que este haciendo el motor
  

  //Sensores
//  rest.function("Temperatura", getTemperatura);
//  rest.function("Humedad", getTemperatura);
//  rest.function("IdDispositivo", setIdDispositivo);

  
  dht.begin();
 
  Serial.begin(9600); 
  iniciarEthernet();
  delay(1000);
}


void loop()
{ 

   // Esperando por nuevos clientes
  EthernetClient client = ArduinoServer.available();
  rest.handle(client);
  
  if(millis() - lastSuccessfulUploadTime > updateFrequency + 3000UL )
  {
    
    for (int i=0; i<N_SENSORES;i++) {
       //actualizarSensores(Sensores[i],leerSensor(Sensores[i]));
       delay(1000);
    }
  }

  if (millis() - lastSuccessfulUploadTimeDevice > updateFrequencyDevice)
  {
      subscribirDispositivo(IP);
      delay(1000);
  }

  if (millis() - lastSuccessfulMotorCheckTime > updateFrequencyMotor)
  {
      Serial.println("Entra CehckMotor");
      RevisarMotores();
      delay(1000);
  }

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
      client.println("Host: 192.168.200.32");
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
  unsigned long frecuencia = 60000UL;
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
  int statusCode = restClient.put(pPath, pBody,  &response);
  statusCode = 200;
  
  bool SubscripcionOk = false;
  int failedCounter = 1;
  

  while(SubscripcionOk == false && failedCounter < 6)
  {
     
    if (statusCode != 0)
    {
     
      //response.remove(0,1);
      //response.remove(response.length()-1,1);
      
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
    
    delay(2000);
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
 
}

int checkMotor1() {

   //Si estoy levantando el piston y su posicion aun no llega a 100
  if (estado_m1 != 0)
  {
    if (estado_m1 == 1) { 
      if (posicion_m1 < 4) {
      posicion_m1++;
      
      Serial.print("Posicion M1 : " + (String)posicion_m1);
      
        for(int value = 0 ; value <= 255; value+=5) {
          
           digitalWrite(M1, HIGH);
           analogWrite(E1, value);   //PWM Speed Control   
           delay(30);      
        }
      }
      else
      {
        detenerMotor("1");
        Serial.print("Detencion de avance Automatica: ");
      }
    }
  }

    if (estado_m1 == 2) { 
      if (posicion_m1 > 0) {
        posicion_m1--;
        Serial.print("Posicion M1 : " + posicion_m1);
        
        for(int value = 0 ; value <= 255; value+=5) {
          
           digitalWrite(M1, LOW);
           analogWrite(E1, value);   //PWM Speed Control     
           delay(30);    
        }
      }
      else
      {
        detenerMotor("1");
        Serial.print("Detencion de reotroceso Automatica: ");
      }
    }
    
  
}

int checkMotor2() {

   //Si estoy levantando el piston y su posicion aun no llega a 100
  if (estado_m2 != 0)
  {
    if (estado_m2 == 1 && posicion_m2 < 4) { 

      posicion_m2++;
      Serial.print("Posicion M2 : " + posicion_m2);
      
      for(int value = 0 ; value <= 255; value+=5) {
        
         digitalWrite(M2, HIGH);
         analogWrite(E2, value);   //PWM Speed Control  
         delay(30);       
      }
    }

  if (estado_m2 == 2 && posicion_m2 > 0) { 

      posicion_m2--;
      Serial.print("Posicion M2 : " + posicion_m2);
      
      for(int value = 0 ; value <= 255; value+=5) {
        
         digitalWrite(M2, LOW);
         analogWrite(E2, value);   //PWM Speed Control   
         delay(30);      
      }
    }
  }

}

int RevisarMotores() {

  unsigned long muestraMedicion = millis();

  checkMotor1();
  checkMotor2();
  //checkMotor3();
  //checkMotor4();
  
  lastSuccessfulMotorCheckTime = muestraMedicion;

}

int avanzarMotor(String nmotor){
  int motor = nmotor.toInt();
  
  int estado = 1; //Subiendo

  Serial.println("AvanzarMotor: " + motor);
  
  switch(motor) {
    case 1:
      estado_m1 = 1;
      break;

    case 2:
      estado_m2 = 1;
      break;
      
    case 3:
      estado_m3 = 1;
      break;
      
    case 4:
      estado_m4 = 1;
      break;
  }

  return 1;

}

int retrocederMotor(String nmotor){
  int motor = nmotor.toInt();
  int estado; //Subiendo
  
  switch(motor) {
    case 1:
      estado_m1 = 2;
      break;

    case 2:
      estado_m2 = 2;
      break;
      
    case 3:
      estado_m3 = 2;
      break;
      
    case 4:
      estado_m4 = 2;
      break;
  }

  return 2;
}

int detenerMotor(String nmotor){
  int motor = nmotor.toInt();
  int estado = 0;
  
  switch(motor) {
    case 1:
      estado_m1 = 0;      
      analogWrite(E1, 0);   //PWM Speed Control
      break;

    case 2:
      estado_m2 = 0;
      analogWrite(E2, 0);   //PWM Speed Control
      break;
      
    case 3:
      estado_m3 = 0;
//      analogWrite(E3, 0);   //PWM Speed Control
      break;
      
    case 4:
      estado_m4 = 0;
  //    analogWrite(E4, 0);   //PWM Speed Control
      break;
  }

  return 0;
}

int estadoMotor(String nmotor){
  int motor = nmotor.toInt();
  int estado = 0;
  
  switch(motor) {
    case 1:
      estado = estado_m1;
      break;

    case 2:
      estado = estado_m2;
      break;
      
    case 3:
      estado = estado_m3;
      break;
      
    case 4:
      estado = estado_m4;
      break;
  }
  
  return estado;
}

int posicionMotor(String nmotor){
  int motor = nmotor.toInt();
  int posicion;
  
  switch(motor) {
    case 1:
      posicion = posicion_m1;
      break;

    case 2:
      posicion = posicion_m2;
      break;
      
    case 3:
      posicion = posicion_m3;
      break;
      
    case 4:
      posicion = posicion_m4;
      break;
  }

  return posicion;
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





