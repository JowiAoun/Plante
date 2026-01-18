#!/usr/bin/env python3
"""
Dual Servo Controller for Plante Greenhouse
Controls 2 servos connected to Arduino via USB serial

Usage:
    python3 servo_control.py              # Interactive mode
    python3 servo_control.py 1 90         # Set servo 1 to 90°
    python3 servo_control.py 2 45         # Set servo 2 to 45°
    python3 servo_control.py both 90      # Set both to 90°
    python3 servo_control.py demo         # Run demo
    python3 servo_control.py test         # Run test sequence (0→90→180→90→0)
    python3 servo_control.py status       # Get current positions
"""

import serial
import time
import sys

SERIAL_PORT = '/dev/ttyACM0'
BAUD_RATE = 9600


class DualServoController:
    def __init__(self, port=SERIAL_PORT):
        self.port = port
        self.serial = None
        
    def connect(self):
        """Connect to Arduino."""
        try:
            self.serial = serial.Serial(self.port, BAUD_RATE, timeout=2)
            time.sleep(3)  # Wait for Arduino reset (needs ~3 seconds)
            
            # Try multiple times to find READY signal
            for attempt in range(5):
                # Read whatever is in the buffer
                if self.serial.in_waiting > 0:
                    data = self.serial.read(self.serial.in_waiting)
                    if b'READY' in data:
                        print(f"Connected to Arduino on {self.port}")
                        return True
                
                # Try readline
                raw = self.serial.readline()
                if b'READY' in raw:
                    print(f"Connected to Arduino on {self.port}")
                    return True
                    
                time.sleep(0.2)
            
            # If we get here, no READY found
            print("No READY signal received from Arduino.")
            print("Try: 1) Unplug and replug Arduino, 2) Ensure dual_servo.ino is uploaded")
            return False
            
        except serial.SerialException as e:
            print(f"Serial error: {e}")
            print("Check: ls /dev/ttyACM* /dev/ttyUSB*")
            return False
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
            
    def close(self):
        """Close connection."""
        if self.serial:
            self.serial.close()
            
    def send_command(self, cmd):
        """Send command and get response."""
        self.serial.write(f"{cmd}\n".encode())
        time.sleep(0.1)
        raw = self.serial.readline()
        response = raw.decode('utf-8', errors='replace').strip()
        return response
        
    def set_servo(self, servo, angle):
        """
        Set servo position.
        
        Args:
            servo: 1, 2, or 'both'
            angle: 0-180 degrees
        """
        cmd = f"{servo}:{angle}"
        response = self.send_command(cmd)
        print(f"  {response}")
        return "OK" in response
    
    def smooth_move(self, servo, target, step=5, delay=0.05):
        """
        Move servo smoothly to target position.
        
        Args:
            servo: 1, 2, or 'both'
            target: Target angle 0-180
            step: Degrees per step (smaller = smoother)
            delay: Seconds between steps
        """
        # Get current position (assume 0 if unknown)
        status = self.send_command("STATUS")
        current = 0
        if "1=" in status:
            try:
                current = int(status.split("1=")[1].split(",")[0])
            except:
                current = 0
        
        # Calculate direction
        if target > current:
            angles = range(current, target + 1, step)
        else:
            angles = range(current, target - 1, -step)
        
        for angle in angles:
            self.send_command(f"{servo}:{angle}")
            time.sleep(delay)
        
        # Ensure we hit exact target
        self.send_command(f"{servo}:{target}")
        
    def get_status(self):
        """Get current servo positions."""
        response = self.send_command("STATUS")
        print(f"  {response}")
        return response
        
    def demo(self):
        """Run demo sequence."""
        print("\n=== Servo Demo ===\n")
        
        print("Both servos to 0°...")
        self.set_servo("both", 0)
        time.sleep(1)
        
        print("Servo 1 to 90°...")
        self.set_servo(1, 90)
        time.sleep(1)
        
        print("Servo 2 to 90°...")
        self.set_servo(2, 90)
        time.sleep(1)
        
        print("Both servos to 180°...")
        self.set_servo("both", 180)
        time.sleep(1)
        
        print("Sweep down...")
        for angle in range(180, -1, -10):
            self.set_servo("both", angle)
            time.sleep(0.1)
            
        print("\nDemo complete!")
    
    def test(self):
        """Run smooth test sequence: 0 → 90 → 180 → 90 → 0 in 10° steps."""
        print("\n=== Servo Test Sequence (Smooth) ===\n")
        
        # Start at 0
        print("Starting at 0°...")
        self.set_servo("both", 0)
        time.sleep(1)
        
        # Go from 0 to 90 in 10° steps
        print("Moving 0° → 90°...")
        for angle in range(10, 91, 10):  # 10, 20, 30, ... 90
            self.set_servo("both", angle)
            time.sleep(0.2)
        
        time.sleep(0.5)
        
        # Go from 90 to 180 in 10° steps
        print("Moving 90° → 180°...")
        for angle in range(100, 181, 10):  # 100, 110, ... 180
            self.set_servo("both", angle)
            time.sleep(0.2)
        
        time.sleep(0.5)
        
        # Go from 180 to 90 in 10° steps
        print("Moving 180° → 90°...")
        for angle in range(170, 89, -10):  # 170, 160, ... 90
            self.set_servo("both", angle)
            time.sleep(0.2)
        
        time.sleep(0.5)
        
        # Go from 90 to 0 in 10° steps
        print("Moving 90° → 0°...")
        for angle in range(80, -1, -10):  # 80, 70, ... 0
            self.set_servo("both", angle)
            time.sleep(0.2)
            
        print("\nTest complete!")
        
    def interactive(self):
        """Interactive control mode."""
        print("\n=== Interactive Servo Control ===")
        print("Commands:")
        print("  1:90    - Set servo 1 to 90°")
        print("  2:45    - Set servo 2 to 45°")
        print("  both:90 - Set both servos to 90°")
        print("  status  - Get positions")
        print("  demo    - Run full demo")
        print("  test    - Run test (0→90→180→90→0)")
        print("  quit    - Exit")
        print()
        
        while True:
            try:
                cmd = input("> ").strip().lower()
                
                if cmd == 'quit' or cmd == 'exit':
                    break
                elif cmd == 'status':
                    self.get_status()
                elif cmd == 'demo':
                    self.demo()
                elif cmd == 'test':
                    self.test()
                elif ':' in cmd:
                    parts = cmd.split(':')
                    servo = parts[0]
                    angle = int(parts[1])
                    self.set_servo(servo, angle)
                else:
                    print("Invalid command")
                    
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"Error: {e}")


def main():
    controller = DualServoController()
    
    if not controller.connect():
        print("Failed to connect. Check Arduino is plugged in.")
        print("Try: ls /dev/ttyACM* /dev/ttyUSB*")
        return
        
    try:
        if len(sys.argv) == 1:
            # Interactive mode
            controller.interactive()
            
        elif sys.argv[1] == 'demo':
            controller.demo()
            
        elif sys.argv[1] == 'test':
            controller.test()
            
        elif sys.argv[1] == 'status':
            controller.get_status()
            
        elif len(sys.argv) == 3:
            # Direct command: python3 servo_control.py 1 90
            servo = sys.argv[1]
            angle = int(sys.argv[2])
            controller.set_servo(servo, angle)
            
        else:
            print(__doc__)
            
    finally:
        controller.close()


if __name__ == '__main__':
    main()
