/**
 * Weekly Insight Pulse (Demo Mode)
 *
 * Aggregates sensor data from the demo store and builds the weekly
 * summary from deterministic templates (the AI was disabled after the
 * hackathon). Return shapes are unchanged so WeeklyPulseCard renders
 * exactly as before.
 */

import { listFarms } from './demo-store';
import type { WeeklyPlantStats, WeeklyInsightPulse } from '@/types';

/**
 * Determine the primary issue from alert breakdown
 */
export function getPrimaryIssue(
    byType: { temperature: number; humidity: number; soilMoisture: number }
): 'temperature' | 'humidity' | 'soilMoisture' | 'none' {
    const max = Math.max(byType.temperature, byType.humidity, byType.soilMoisture);
    if (max === 0) return 'none';
    if (byType.humidity === max) return 'humidity';
    if (byType.temperature === max) return 'temperature';
    return 'soilMoisture';
}

interface InsightTemplate {
    summary: (stats: WeeklyPlantStats) => string;
    suggestions: string[];
    encouragement: string;
}

const INSIGHT_TEMPLATES: Record<ReturnType<typeof getPrimaryIssue>, InsightTemplate> = {
    soilMoisture: {
        summary: (stats) =>
            `Your plants logged ${stats.alerts.total} alert${stats.alerts.total === 1 ? '' : 's'} this week, mostly about soil moisture 💧. A watering top-up would go a long way.`,
        suggestions: ['Water dry farms today and re-check soil moisture in an hour'],
        encouragement: 'A little water and they will bounce right back! 🌱',
    },
    temperature: {
        summary: (stats) =>
            `This week brought ${stats.alerts.total} alert${stats.alerts.total === 1 ? '' : 's'}, with temperature as the main culprit 🌡️. Keep an eye on the greenhouse heat.`,
        suggestions: ['Open the greenhouse lid during warm afternoons to keep temperatures in range'],
        encouragement: 'Your green thumb is showing, keep it up!',
    },
    humidity: {
        summary: (stats) =>
            `Humidity drove most of this week's ${stats.alerts.total} alert${stats.alerts.total === 1 ? '' : 's'} 💨. Small airflow tweaks should settle things down.`,
        suggestions: ['Group plants together or mist them to stabilize humidity levels'],
        encouragement: 'Steady hands grow strong plants! 🌿',
    },
    none: {
        summary: () =>
            'A calm week on the farm: no threshold alerts logged 🌱. Your plants are living their best lives.',
        suggestions: ['Keep your current routine and check in on the Weekly Pulse next week'],
        encouragement: 'Flawless week, your plants are thriving! 🏆',
    },
};

/**
 * Generate a weekly insight pulse from aggregated stats (deterministic, no AI)
 */
export async function generateWeeklyInsight(
    stats: WeeklyPlantStats
): Promise<Omit<WeeklyInsightPulse, 'id' | 'userId' | 'createdAt' | 'userReaction'>> {
    const primaryIssue = getPrimaryIssue(stats.alerts.byType);
    const template = INSIGHT_TEMPLATES[primaryIssue];

    const summary =
        stats.healthTrend === 'declining' && primaryIssue !== 'none'
            ? `${template.summary(stats)} Overall health is trending down, so act soon.`
            : template.summary(stats);

    return {
        stats,
        summary,
        primaryIssue,
        suggestions: template.suggestions,
        encouragement: template.encouragement,
    };
}

/**
 * Aggregate weekly stats from the demo store's farm data
 */
export async function aggregateWeeklyStats(userId: string): Promise<WeeklyPlantStats> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const farms = listFarms(userId);

    if (farms.length === 0) {
        return {
            userId,
            weekStartDate: weekAgo.toISOString(),
            weekEndDate: now.toISOString(),
            alerts: {
                total: 0,
                byType: { temperature: 0, humidity: 0, soilMoisture: 0 },
                criticalCount: 0,
            },
            averageResponseTimeMinutes: 0,
            healthTrend: 'stable',
        };
    }

    // Calculate alerts based on current sensor readings vs thresholds
    let tempAlerts = 0;
    let humidityAlerts = 0;
    let soilAlerts = 0;
    let criticalCount = 0;
    let warningCount = 0;
    let healthyCount = 0;

    for (const farm of farms) {
        const { sensors, thresholds, status } = farm;

        // Count status for health trend
        if (status === 'critical') criticalCount++;
        else if (status === 'warning') warningCount++;
        else healthyCount++;

        // Check temperature alerts
        const temp = sensors.temperature.value;
        if (temp < thresholds.temperature.min || temp > thresholds.temperature.max) {
            tempAlerts++;
        }

        // Check humidity alerts
        const humidity = sensors.humidity.value;
        if (humidity < thresholds.humidity.min || humidity > thresholds.humidity.max) {
            humidityAlerts++;
        }

        // Check soil moisture alerts
        const soil = sensors.soilMoisture.value;
        if (soil < thresholds.soilMoisture.min || soil > thresholds.soilMoisture.max) {
            soilAlerts++;
        }
    }

    const totalAlerts = tempAlerts + humidityAlerts + soilAlerts;

    // Determine health trend based on farm statuses
    let healthTrend: 'improving' | 'stable' | 'declining';
    if (criticalCount > 0 || warningCount > healthyCount) {
        healthTrend = 'declining';
    } else if (healthyCount > warningCount && criticalCount === 0) {
        healthTrend = 'improving';
    } else {
        healthTrend = 'stable';
    }

    return {
        userId,
        weekStartDate: weekAgo.toISOString(),
        weekEndDate: now.toISOString(),
        alerts: {
            total: totalAlerts,
            byType: {
                temperature: tempAlerts,
                humidity: humidityAlerts,
                soilMoisture: soilAlerts,
            },
            criticalCount,
        },
        averageResponseTimeMinutes: 30,
        healthTrend,
    };
}

/**
 * Record user reaction to a weekly pulse (demo: log only)
 */
export async function recordPulseReaction(
    pulseId: string,
    userId: string,
    reaction: 'helpful' | 'not_helpful'
): Promise<void> {
    console.log(`[WeeklyPulse] Recorded reaction for pulse ${pulseId} (user ${userId}): ${reaction}`);
}
