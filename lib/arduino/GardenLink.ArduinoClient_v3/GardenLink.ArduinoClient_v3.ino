#include "SocketIOClient.h"
#include "Ethernet.h"
#include "SPI.h"
#include "bitlash.h"
SocketIOClient client;

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
char hostname[] = "192.168.0.2";
int port = 3000;


// websocket message handler: do something with command from server
void ondata(SocketIOClient client, char *data) {
  Serial.print(data);
}

void setup() {
  Serial.begin(57600);

  Ethernet.begin(mac);

  client.setDataArrivedDelegate(ondata);
  if (!client.connect(hostname, port)) Serial.println(F("Not connected."));

  if (client.connected()) client.send("Client here!");
}

#define HELLO_INTERVAL 3000UL
unsigned long lasthello;

void loop() {
  client.monitor();

  unsigned long now = millis();
  if ((now - lasthello) >= HELLO_INTERVAL) {
    lasthello = now;
    if (client.connected()) client.send("Hello, world!\n");
  }
}
