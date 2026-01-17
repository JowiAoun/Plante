#!/usr/bin/env python3
#############################################################################
# Filename    : soil_moisture.py
# Description : Read soil moisture from SparkFun sensor via Waveshare AD/DA HAT
# Hardware    : Waveshare High-Precision AD/DA HAT (ADS1256 ADC)
#             : SparkFun Soil Moisture Sensor connected to AD0 channel
# Notes       : The HAT uses SPI, not regular GPIO pins!
#             : Make sure SPI is enabled: sudo raspi-config -> Interface Options -> SPI
#############################################################################
import time
import spidev
import lgpio

# ============================================================================
# ADS1256 Configuration (Waveshare High-Precision AD/DA HAT)
# ============================================================================

# GPIO pins used by the Waveshare HAT
RST_PIN = 18    # Reset pin
DRDY_PIN = 17   # Data ready pin

# ADS1256 Registers
REG_STATUS = 0x00
REG_MUX = 0x01
REG_ADCON = 0x02
REG_DRATE = 0x03

# ADS1256 Commands
CMD_WAKEUP = 0x00
CMD_RDATA = 0x01
CMD_RDATAC = 0x03
CMD_SDATAC = 0x0F
CMD_RREG = 0x10
CMD_WREG = 0x50
CMD_SELFCAL = 0xF0
CMD_SELFOCAL = 0xF1
CMD_SELFGCAL = 0xF2
CMD_SYSOCAL = 0xF3
CMD_SYSGCAL = 0xF4
CMD_SYNC = 0xFC
CMD_STANDBY = 0xFD
CMD_RESET = 0xFE

# Data rates
DRATE_30000 = 0xF0
DRATE_15000 = 0xE0
DRATE_7500 = 0xD0
DRATE_3750 = 0xC0
DRATE_2000 = 0xB0
DRATE_1000 = 0xA1
DRATE_500 = 0x92
DRATE_100 = 0x82
DRATE_60 = 0x72
DRATE_50 = 0x63
DRATE_30 = 0x53
DRATE_25 = 0x43
DRATE_15 = 0x33
DRATE_10 = 0x23
DRATE_5 = 0x13
DRATE_2_5 = 0x03

# Gain settings
GAIN_1 = 0x00
GAIN_2 = 0x01
GAIN_4 = 0x02
GAIN_8 = 0x03
GAIN_16 = 0x04
GAIN_32 = 0x05
GAIN_64 = 0x06

# Input channels (single-ended, referenced to AINCOM)
CH_0 = 0x08  # AIN0 vs AINCOM
CH_1 = 0x18  # AIN1 vs AINCOM
CH_2 = 0x28  # AIN2 vs AINCOM
CH_3 = 0x38  # AIN3 vs AINCOM
CH_4 = 0x48  # AIN4 vs AINCOM
CH_5 = 0x58  # AIN5 vs AINCOM
CH_6 = 0x68  # AIN6 vs AINCOM
CH_7 = 0x78  # AIN7 vs AINCOM


class ADS1256:
    """Driver for ADS1256 ADC on Waveshare High-Precision AD/DA HAT."""
    
    def __init__(self, spi_bus=0, spi_device=0, drdy_pin=DRDY_PIN, rst_pin=RST_PIN):
        self.drdy_pin = drdy_pin
        self.rst_pin = rst_pin
        
        # Initialize SPI
        self.spi = spidev.SpiDev()
        self.spi.open(spi_bus, spi_device)
        self.spi.max_speed_hz = 1000000  # 1 MHz
        self.spi.mode = 0b01  # CPOL=0, CPHA=1
        
        # Initialize GPIO using lgpio
        self.gpio = lgpio.gpiochip_open(0)
        lgpio.gpio_claim_input(self.gpio, self.drdy_pin)
        lgpio.gpio_claim_output(self.gpio, self.rst_pin)
        
        # Reset and configure the ADC
        self._reset()
        self._configure()
        
    def _reset(self):
        """Hardware reset the ADC."""
        lgpio.gpio_write(self.gpio, self.rst_pin, 1)
        time.sleep(0.2)
        lgpio.gpio_write(self.gpio, self.rst_pin, 0)
        time.sleep(0.2)
        lgpio.gpio_write(self.gpio, self.rst_pin, 1)
        time.sleep(0.2)
        
    def _wait_drdy(self, timeout=5.0):
        """Wait for DRDY pin to go low (data ready)."""
        start = time.time()
        while lgpio.gpio_read(self.gpio, self.drdy_pin) == 1:
            if time.time() - start > timeout:
                raise TimeoutError("Timeout waiting for DRDY")
            time.sleep(0.0001)
            
    def _write_reg(self, reg, value):
        """Write a value to a register."""
        self._wait_drdy()
        self.spi.xfer2([CMD_WREG | reg, 0x00, value])
        time.sleep(0.001)
        
    def _read_reg(self, reg):
        """Read a value from a register."""
        self._wait_drdy()
        self.spi.xfer2([CMD_RREG | reg, 0x00])
        time.sleep(0.001)
        result = self.spi.xfer2([0xFF])
        return result[0]
        
    def _configure(self, gain=GAIN_1, drate=DRATE_100):
        """Configure the ADC."""
        self._wait_drdy()
        
        # Set status register (auto-calibration, buffer enabled)
        self._write_reg(REG_STATUS, 0x06)
        
        # Set ADCON register (clock out off, sensor detect off, gain)
        self._write_reg(REG_ADCON, gain)
        
        # Set data rate
        self._write_reg(REG_DRATE, drate)
        
        # Perform self-calibration
        self._wait_drdy()
        self.spi.xfer2([CMD_SELFCAL])
        self._wait_drdy()
        
    def read_channel(self, channel):
        """
        Read a single ADC channel.
        
        Args:
            channel: Channel constant (CH_0 through CH_7)
            
        Returns:
            Raw 24-bit ADC value (signed)
        """
        self._wait_drdy()
        
        # Set MUX register for the channel
        self._write_reg(REG_MUX, channel)
        
        # Send SYNC and WAKEUP to start conversion
        self.spi.xfer2([CMD_SYNC])
        time.sleep(0.00001)
        self.spi.xfer2([CMD_WAKEUP])
        
        # Wait for conversion
        self._wait_drdy()
        
        # Read data
        self.spi.xfer2([CMD_RDATA])
        time.sleep(0.00001)
        data = self.spi.xfer2([0xFF, 0xFF, 0xFF])
        
        # Convert to signed 24-bit value
        value = (data[0] << 16) | (data[1] << 8) | data[2]
        if value & 0x800000:  # Negative (two's complement)
            value -= 0x1000000
            
        return value
        
    def read_voltage(self, channel, vref=5.0):
        """
        Read voltage from a channel.
        
        Args:
            channel: Channel constant (CH_0 through CH_7)
            vref: Reference voltage (default 5.0V)
            
        Returns:
            Voltage in volts
        """
        raw = self.read_channel(channel)
        # ADS1256 is 24-bit, so max positive value is 2^23 - 1
        voltage = (raw / 0x7FFFFF) * vref
        return voltage
        
    def close(self):
        """Clean up resources."""
        self.spi.close()
        lgpio.gpiochip_close(self.gpio)


class SoilMoistureSensor:
    """
    SparkFun Soil Moisture Sensor interface via Waveshare AD/DA HAT.
    
    Wiring:
        - VCC -> HAT 5V
        - GND -> HAT GND
        - SIG -> HAT AD0 (or any AD0-AD7 channel)
    """
    
    def __init__(self, channel=CH_0, dry_value=None, wet_value=None):
        """
        Initialize the soil moisture sensor.
        
        Args:
            channel: ADC channel the sensor is connected to (default CH_0)
            dry_value: Raw ADC value when sensor is dry (for calibration)
            wet_value: Raw ADC value when sensor is wet (for calibration)
        """
        self.adc = ADS1256()
        self.channel = channel
        
        # Default calibration values (adjust based on your sensor!)
        self.dry_value = dry_value if dry_value is not None else 0x600000  # ~3V (dry/air)
        self.wet_value = wet_value if wet_value is not None else 0x200000  # ~1V (wet/water)
        
    def read_raw(self):
        """Read raw ADC value."""
        return self.adc.read_channel(self.channel)
        
    def read_voltage(self):
        """Read voltage from sensor."""
        return self.adc.read_voltage(self.channel)
        
    def read_moisture_percent(self):
        """
        Read moisture level as a percentage (0-100%).
        
        Returns:
            Moisture percentage (0 = dry, 100 = wet)
        """
        raw = self.read_raw()
        
        # Clamp to calibration range
        if raw >= self.dry_value:
            return 0.0
        if raw <= self.wet_value:
            return 100.0
            
        # Linear interpolation
        percent = (self.dry_value - raw) / (self.dry_value - self.wet_value) * 100.0
        return round(percent, 1)
        
    def calibrate_dry(self):
        """
        Calibrate the dry point.
        Hold the sensor in the air and call this method.
        """
        print("Calibrating DRY point... Hold sensor in air.")
        time.sleep(2)
        readings = [self.read_raw() for _ in range(10)]
        self.dry_value = sum(readings) // len(readings)
        print(f"Dry value set to: {self.dry_value} (0x{self.dry_value:06X})")
        return self.dry_value
        
    def calibrate_wet(self):
        """
        Calibrate the wet point.
        Submerge the sensor in water and call this method.
        """
        print("Calibrating WET point... Submerge sensor in water.")
        time.sleep(2)
        readings = [self.read_raw() for _ in range(10)]
        self.wet_value = sum(readings) // len(readings)
        print(f"Wet value set to: {self.wet_value} (0x{self.wet_value:06X})")
        return self.wet_value
        
    def close(self):
        """Clean up resources."""
        self.adc.close()


def test_adc():
    """Test the ADC by reading all channels."""
    print("Testing Waveshare AD/DA HAT (ADS1256)...")
    print("=" * 50)
    
    try:
        adc = ADS1256()
        print("ADC initialized successfully!")
        print()
        
        channels = [
            (CH_0, "AD0"),
            (CH_1, "AD1"),
            (CH_2, "AD2"),
            (CH_3, "AD3"),
            (CH_4, "AD4"),
            (CH_5, "AD5"),
            (CH_6, "AD6"),
            (CH_7, "AD7"),
        ]
        
        print("Reading all channels:")
        for ch, name in channels:
            voltage = adc.read_voltage(ch)
            raw = adc.read_channel(ch)
            print(f"  {name}: {voltage:.4f}V (raw: 0x{raw & 0xFFFFFF:06X})")
            
        adc.close()
        print("\nADC test complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        print("\nTroubleshooting:")
        print("  1. Make sure SPI is enabled: sudo raspi-config -> Interface Options -> SPI")
        print("  2. Check that the HAT is properly seated on the Pi")
        print("  3. Verify power connections")
        raise


def main():
    """Main function - read soil moisture continuously."""
    print("SparkFun Soil Moisture Sensor via Waveshare AD/DA HAT")
    print("=" * 50)
    print()
    print("Wiring:")
    print("  - VCC -> HAT 5V")
    print("  - GND -> HAT GND")
    print("  - SIG -> HAT AD0")
    print()
    
    try:
        sensor = SoilMoistureSensor(channel=CH_0)
        print("Sensor initialized!")
        print()
        
        count = 0
        while True:
            count += 1
            voltage = sensor.read_voltage()
            moisture = sensor.read_moisture_percent()
            raw = sensor.read_raw()
            
            print(f"[{count}] Moisture: {moisture:5.1f}% | Voltage: {voltage:.3f}V | Raw: 0x{raw & 0xFFFFFF:06X}")
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        if 'sensor' in locals():
            sensor.close()


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--test-adc':
        test_adc()
    else:
        main()
