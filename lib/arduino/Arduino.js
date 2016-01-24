var method = Arduino.prototype;
var _type;

var BOARD = {
    UNO: {
      NUMPINS : 20,
      ANALOG_PIN : { 
         0 : 'A0',
         1 : 'A1',
         2 : 'A2',
         3 : 'A3',
         4 : 'A4'
      },
      ANALOG_PIN_STATE : {
         'ON'  : 255,
         'OFF' : 0
      },
      DIGITAL_PIN:
      {
          0 : 0,
          1 : 1,
          2 : 2, 
          3 : 3,
          4 : 4,
          5 : 5, 
          6 : 6,
          7 : 7,
          8 : 8,
          9 : 9
      },
      DIGITAL_PIN_STATE : {
         'ON'  : 1,
         'OFF' : 0
      }
    },
    MEGA: {
      NUMPINS : 64,
      ANALOG_PIN : { 
         0 : 'A0',
         1 : 'A1',
         2 : 'A2',
         3 : 'A3',
         4 : 'A4',
         5 : 'A5',
         6 : 'A6',
         7 : 'A7',
         8 : 'A8',
         9 : 'A9'
      },
      ANALOG_PIN_STATE : {
         'ON'  : 255,
         'OFF' : 0
      },
      DIGITAL_PIN:
      {
          0 : 0,
          1 : 1,
          2 : 2, 
          3 : 3,
          4 : 4,
          5 : 5, 
          6 : 6,
          7 : 7,
          8 : 8,
          9 : 9,
          10 : 10,
          11 : 11,
          12 : 12,
          13 : 13,
          14 : 14,
          15 : 15,
          16 : 16,
          17 : 17,
          18 : 18,
          19 : 19,
          20 : 20,
          21 : 21,
          22 : 22 // son 53
      },
      DIGITAL_PIN_STATE : {
         'ON'  : 1,
         'OFF' : 0
      }
    }     
};


function Arduino(type) 
{
  _type = type;
  if (!BOARD[_type])
  {
    console.log("El tipo de tarjeta no esta soportado, se asume ARDUINO UNO") ;
    _type = 'UNO';
  }
}


method.Board = function() {
  return BOARD[_type];
};

module.exports = Arduino;


