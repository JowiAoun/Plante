/*
 * Plante Dual Servo Controller
 * Controls 2 servos via serial commands from Raspberry Pi
 * 
 * Commands:
 *   1:90    - Set servo 1 to 90 degrees
 *   2:45    - Set servo 2 to 45 degrees
 *   BOTH:90 - Set both servos to 90 degrees
 *   STATUS  - Get current positions
 */

#include <Servo.h>

Servo servo1;
Servo servo2;

int pos1 = 0;
int pos2 = 0;

String input = "";

void setup() {
  Serial.begin(9600);
  
  servo1.attach(9);   // Servo 1 on pin 9
  servo2.attach(10);  // Servo 2 on pin 10
  
  servo1.write(0);
  servo2.write(0);
  
  Serial.println("READY:2_SERVOS");
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      processCommand(input);
      input = "";
    } else {
      input += c;
    }
  }
}

void processCommand(String cmd) {
  cmd.trim();
  cmd.toUpperCase();
  
  // STATUS command
  if (cmd == "STATUS") {
    Serial.print("STATUS:1=");
    Serial.print(pos1);
    Serial.print(",2=");
    Serial.println(pos2);
    return;
  }
  
  // Parse command (format: "SERVO:ANGLE")
  int colonIndex = cmd.indexOf(':');
  if (colonIndex == -1) {
    Serial.println("ERROR:Invalid format. Use 1:90 or 2:45 or BOTH:90");
    return;
  }
  
  String servo = cmd.substring(0, colonIndex);
  int angle = cmd.substring(colonIndex + 1).toInt();
  angle = constrain(angle, 0, 180);
  
  if (servo == "1") {
    servo1.write(angle);
    pos1 = angle;
    Serial.print("OK:1=");
    Serial.println(angle);
  }
  else if (servo == "2") {
    servo2.write(angle);
    pos2 = angle;
    Serial.print("OK:2=");
    Serial.println(angle);
  }
  else if (servo == "BOTH") {
    servo1.write(angle);
    servo2.write(angle);
    pos1 = angle;
    pos2 = angle;
    Serial.print("OK:BOTH=");
    Serial.println(angle);
  }
  else {
    Serial.println("ERROR:Unknown servo. Use 1, 2, or BOTH");
  }
}
