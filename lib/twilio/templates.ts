/**
 * SMS Message Templates
 * Pre-defined templates for all notification types
 */

import type { SmsNotificationType } from '@/lib/db/types';

/**
 * Template parameters for different notification types
 */
export interface WateringParams {
  plantName: string;
  nextWateringDate?: string;
}

export interface MaintenanceParams {
  farmName: string;
  taskDescription: string;
  dueDate: string;
}

export interface TankAlertParams {
  farmName: string;
  percentage: number;
  estimatedDays?: number;
}

export interface TemperatureParams {
  farmName: string;
  temperature: number;
  plantNames: string;
  minTemp: number;
  maxTemp: number;
  isHigh: boolean;
}

export interface HumidityParams {
  farmName: string;
  humidity: number;
  plantNames: string;
  minHumidity: number;
  maxHumidity: number;
}

/**
 * Generate watering confirmation message
 */
export function getWateringConfirmation({ plantName, nextWateringDate }: WateringParams): string {
  const nextInfo = nextWateringDate ? `\n\nNext watering: ${nextWateringDate}` : '';
  return `🌱 Your ${plantName} was just watered!${nextInfo}\n\n— Plante`;
}

/**
 * Generate maintenance reminder message
 */
export function getMaintenanceReminder({ farmName, taskDescription, dueDate }: MaintenanceParams): string {
  return `🔔 Maintenance reminder for ${farmName}\n\nTask: ${taskDescription}\nDue: ${dueDate}\n\nOpen Plante to mark as complete.\n\n— Plante`;
}

/**
 * Generate tank level alert message
 * Severity is determined by percentage
 */
export function getTankLevelAlert({ farmName, percentage, estimatedDays }: TankAlertParams): string {
  if (percentage <= 5) {
    // Empty - urgent
    return `🚨 URGENT: Water tank nearly empty!\n\n${farmName} needs water immediately. Your plants may be at risk.\n\n— Plante`;
  }
  
  if (percentage <= 10) {
    // Critical
    return `🚨 Water tank critically low at ${percentage}%\n\nPlease refill your water tank soon to keep your plants healthy.\n\n— Plante`;
  }
  
  // Low (≤ 25%)
  const daysInfo = estimatedDays ? ` has about ${estimatedDays} days of water remaining` : '';
  return `⚠️ Water tank at ${percentage}%\n\nYour ${farmName}${daysInfo}.\n\n— Plante`;
}

/**
 * Generate temperature alert message
 */
export function getTemperatureAlert({ farmName, temperature, plantNames, minTemp, maxTemp, isHigh }: TemperatureParams): string {
  const status = isHigh ? 'Too hot' : 'Too cold';
  const action = isHigh 
    ? 'Consider moving to a cooler location or increasing airflow.'
    : 'Move away from cold drafts or windows.';
  
  return `🌡️ Temperature alert for ${farmName}\n\nCurrent: ${temperature}°F — ${status} for ${plantNames}\nRecommended: ${minTemp}°F - ${maxTemp}°F\n\n${action}\n\n— Plante`;
}

/**
 * Generate humidity alert message
 */
export function getHumidityAlert({ farmName, humidity, plantNames, minHumidity, maxHumidity }: HumidityParams): string {
  const isLow = humidity < minHumidity;
  const status = isLow ? 'Too dry' : 'Too humid';
  const action = isLow
    ? 'Consider misting your plants or using a humidifier.'
    : 'Increase ventilation or reduce watering frequency.';
  
  return `💧 Humidity alert for ${farmName}\n\nCurrent: ${humidity}% — ${status} for ${plantNames}\nRecommended: ${minHumidity}% - ${maxHumidity}%\n\n${action}\n\n— Plante`;
}

/**
 * Generate phone verification code message
 */
export function getVerificationCode(code: string): string {
  return `Your Plante verification code is: ${code}\n\nThis code expires in 10 minutes.`;
}

/**
 * Get message template by notification type
 */
export function getMessageByType(
  type: SmsNotificationType, 
  params: Record<string, unknown>
): string {
  switch (type) {
    case 'watering':
      return getWateringConfirmation(params as unknown as WateringParams);
    case 'maintenance':
      return getMaintenanceReminder(params as unknown as MaintenanceParams);
    case 'tank_low':
    case 'tank_critical':
    case 'tank_empty':
      return getTankLevelAlert(params as unknown as TankAlertParams);
    case 'temp_high':
    case 'temp_low':
      return getTemperatureAlert(params as unknown as TemperatureParams);
    case 'humidity_alert':
      return getHumidityAlert(params as unknown as HumidityParams);
    case 'verification':
      return getVerificationCode(params.code as string);
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}
