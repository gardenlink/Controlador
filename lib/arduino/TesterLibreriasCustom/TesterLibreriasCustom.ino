#define DEBUGMODE
//#define SENSORES_ON
#define BOMBAS_ON

#include <Arduino.h>
#include <Actuador.h>
#ifdef SENSORES_ON
#include <Sensores.h>
#endif
#ifdef SENSORES_ON
Sensores sensor(1,1);
#endif
Actuador actuador;

//const int num_bombas = 3;
//Bombas arrBombas[num_bombas];

/*
#define SENSOR_DHT_PIN 8    //pin 8    
#define N_SENSORES 3
Sensores arrSensores[N_SENSORES] = {  Sensores(1, SENSOR_DHT_PIN, "DHT", 'T'), //Sensor DHT Temperatura
                                      Sensores(2, SENSOR_DHT_PIN, "DHT", 'H'),  //Sensor DHT Humedad
                                      Sensores(3, 3, "ANALOGO") };              //Sensor Analogo Nivel en pin 3

*/

int count = 0;

void setup() {
  // put your setup code here, to run once:

  Serial.begin(9600);

  actuador = Actuador();
  actuador.InitMotor(1,3,4);
  actuador.InitMotor(2,5,6);
  actuador.InitMotor(3,8,9);
  actuador.InitMotor(4,8,9);
  
  Serial.println(actuador.GetConfig(1));
  //actuador.Encender();
  #ifdef SENSORES_ON
  //sensor = Sensores(1,A3,"DHT",'T');
  //sensor.Leer();

  
  #endif
  //Serial.println(sensor.GetConfig());

  
  
  
}

void loop() {

  actuador.RevisarMotores();
  delay(5000);

  Serial.println("Estado : " + (String)actuador.EstadoMotor(1));
  //Serial.println("Posicion : " + (String)actuador.PosicionMotor(1));

  if (count == 3) {
    actuador.AvanzarMotor(1);
  }

  if (count == 9) {
    actuador.RetrocederMotor(1);
  
  }

  count++;
}

