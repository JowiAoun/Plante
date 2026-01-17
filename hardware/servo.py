#!/usr/bin/env python3
#############################################################################
# Filename    : servo.py
# Description : Control SG90 servo motor
# Hardware    : SG90 Micro Servo on GPIO 18
########################################################################
import time
import lgpio

SERVO_PIN = 18  # GPIO 18 (Physical Pin 12)

# SG90 Servo specs:
# - PWM frequency: 50Hz (20ms period)
# - Pulse width: 500µs (0°) to 2500µs (180°)
PWM_FREQ = 50

def angle_to_duty_cycle(angle):
    """Convert angle (0-180) to duty cycle percentage for SG90."""
    # SG90: 500µs = 0°, 2500µs = 180°
    # At 50Hz, period = 20ms = 20000µs
    # Duty cycle = pulse_width / period * 100
    pulse_width = 500 + (angle / 180) * 2000  # 500-2500µs range
    duty_cycle = (pulse_width / 20000) * 100
    return duty_cycle

class Servo:
    def __init__(self, pin=SERVO_PIN):
        self.pin = pin
        self.handle = lgpio.gpiochip_open(0)
        lgpio.gpio_claim_output(self.handle, self.pin)
        
    def set_angle(self, angle):
        """Set servo to specific angle (0-180 degrees)."""
        angle = max(0, min(180, angle))  # Clamp to valid range
        duty = angle_to_duty_cycle(angle)
        lgpio.tx_pwm(self.handle, self.pin, PWM_FREQ, duty)
        
    def sweep(self, start=0, end=180, step=10, delay=0.1):
        """Sweep servo from start to end angle."""
        if start < end:
            angles = range(start, end + 1, step)
        else:
            angles = range(start, end - 1, -step)
        
        for angle in angles:
            self.set_angle(angle)
            time.sleep(delay)
    
    def stop(self):
        """Stop PWM signal."""
        lgpio.tx_pwm(self.handle, self.pin, 0, 0)
        
    def cleanup(self):
        """Clean up GPIO resources."""
        self.stop()
        lgpio.gpiochip_close(self.handle)

def demo():
    """Run a demo of servo movements."""
    servo = Servo()
    
    print("Moving to 0°...")
    servo.set_angle(0)
    time.sleep(1)
    
    print("Moving to 90°...")
    servo.set_angle(90)
    time.sleep(1)
    
    print("Moving to 180°...")
    servo.set_angle(180)
    time.sleep(1)
    
    print("Sweeping 0° to 180°...")
    servo.sweep(0, 180, step=10, delay=0.1)
    time.sleep(0.5)
    
    print("Sweeping 180° to 0°...")
    servo.sweep(180, 0, step=10, delay=0.1)
    time.sleep(0.5)
    
    print("Returning to center (90°)...")
    servo.set_angle(90)
    time.sleep(1)
    
    servo.cleanup()
    print("Done!")

if __name__ == '__main__':
    print('Servo control starting...')
    try:
        demo()
    except KeyboardInterrupt:
        print("\nExiting...")
    except Exception as e:
        print(f"Error: {e}")
