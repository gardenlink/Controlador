
/* ==================================================================================
File:       Prueba_4_Relay_Shield.pde
                    
Author:	Diego Muñoz
        MCI Electronics
        www.olimex.cl
        
Description:  Pequeño sketch de ejemplo donde se activan los relés cuando se le ingresa
              un voltaje en las entradas de los optos.


Target Device: Arduino Duemilanove, Uno, Mega
==================================================================================
Copyright 2013 MCI electronics

Licensed under the Apache License, 
Version 2.0 (the "License"); you may not use this file except in compliance 
with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for
the specific language governing permissions and limitations under the License.
*/
// ==================================================================================
//
// Original by E.M.U.
//
//  Ver | dd mmm yyyy | Author | Description
// =====|=============|========|=====================================================
// 1.00 | 20 may 2011 | D.M    | First release 
// ==================================================================================*/

// Optoacopladores en las entradas digitales D4, D5, D6 y D7
int Opto1 = 7;     
int Opto2 = 6;
int Opto3 = 5;
int Opto4 = 4;

// Las entradas análogas se comportan como salidas digitales A0, A1, A2 y A3
int Relay1 =  A0;   
int Relay2 =  A1;
int Relay3 =  A2;
int Relay4 =  A3;

//Estado de la lectura de los optoacopladores
int estado1;
int estado2;
int estado3;
int estado4;

void setup() {
// configurando los pines como salidas digitales
  pinMode(Relay1, OUTPUT);  
  pinMode(Relay2, OUTPUT);
  pinMode(Relay3, OUTPUT);
  pinMode(Relay4, OUTPUT);
  
// configurando los pines como entradas digitales
  pinMode(Opto1, INPUT);  
  pinMode(Opto2, INPUT); 
  pinMode(Opto3, INPUT); 
  pinMode(Opto4, INPUT); 
}

void loop(){
// Lectura de los optoacopladores
  estado1 = 1;//digitalRead(Opto1);
  estado2 = 1;//digitalRead(Opto2);
  estado3 = 1;//digitalRead(Opto3);
  estado4 = 1;//digitalRead(Opto4);

// Prende los relés dependiendo de la lectura
  if (estado1 == 0) {     
    digitalWrite(Relay1, HIGH);  
  } 
  else {
    digitalWrite(Relay1, LOW); 
  }
  
  if (estado2 == 0) {     
    digitalWrite(Relay2, HIGH);  
  } 
  else {
    digitalWrite(Relay2, LOW); 
  }
  
  if (estado3 == 0) {     
    digitalWrite(Relay3, HIGH);  
  } 
  else {
    digitalWrite(Relay3, LOW); 
  }
  
  if (estado4 ==0) {     
    digitalWrite(Relay4, HIGH);  
  } 
  else {
    digitalWrite(Relay4, LOW); 
  }
  
}
