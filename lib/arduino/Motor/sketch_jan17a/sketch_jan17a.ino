// # Editor     : Lauren from DFRobot
// # Date       : 17.02.2012
 
// # Product name: L298N motor driver module DF-MD v1.3
// # Product SKU : DRI0002
// # Version     : 1.0
 
// # Description:
// # The sketch for using the motor driver L298N
// # Run with the PWM mode
 
// # Connection:
// #        M1 pin  -> Digital pin 4
// #        E1 pin  -> Digital pin 5
// #        M2 pin  -> Digital pin 7
// #        E2 pin  -> Digital pin 6
// #        Motor Power Supply -> Centor blue screw connector(5.08mm 3p connector)
// #        Motor A  ->  Screw terminal close to E1 driver pin
// #        Motor B  ->  Screw terminal close to E2 driver pin
// # 
// # Note: You should connect the GND pin from the DF-MD v1.3 to your MCU controller. They should share the GND pins.
// #
 
int E1 = 7;
int M1 = 6;
int E2 = 5;                         
int M2 = 4;    

bool subiendo = false;
int ciclo = 1;

void setup() 
{ 
    pinMode(M1, OUTPUT);   
    pinMode(M2, OUTPUT); 
  
   Serial.begin(9600);         // Used to check value
} 
 
void loop() 
{ 
  //45 ciclos sin delay
  //14 ciclos con delay
  
  Serial.print(F("Ciclo: "));
  Serial.print(ciclo);  
  Serial.print("\n");  
  

  if (ciclo == 1)
  {
    Serial.print(F("Iniciando.. "));
    Serial.print("\n");   
  }

  if (ciclo == 3)
  {
    Serial.print(F("25% alcanzado "));
    Serial.print("\n");    
  }
  
  if (ciclo == 6) {
    Serial.print(F("50% alcanzado "));
    Serial.print("\n");    
  }
  

  if (ciclo == 10)
  {
    Serial.print(F("75% alcanzado "));
    Serial.print("\n");    
  }


  if (ciclo == 13)
  {
    Serial.print(F("100% alcanzado "));
    Serial.print("\n");    
  }
  
  
  
  Inicializar();
  ciclo++;
  delay(5000);
  /*
  int value;
  for(value = 0 ; value <= 255; value+=5) 
  { 
    digitalWrite(M1,HIGH);   
    //digitalWrite(M2,HIGH);       
    analogWrite(E1, value);   //PWM Speed Control
    //analogWrite(E2, value);   //PWM Speed Control
    delay(30); 
    Serial.write(value);
    
  }  
  */
}


void Inicializar()
{
  int value;
    
    for(value = 0 ; value <= 255; value+=5) 
    { 
      digitalWrite(M1,HIGH);  
      digitalWrite(M2,HIGH);       
      analogWrite(E1, value);   //PWM Speed Control
      analogWrite(E2, value);   //PWM Speed Control
      delay(30); 
      //Serial.write(value);
      
    }  
}


