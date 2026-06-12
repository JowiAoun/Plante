/**
 * Demo Chat Engine
 *
 * Canned keyword-based replies that replace the AI chat for the demo.
 * Answers are built from the live demo-store sensor values, so the
 * assistant always agrees with what the dashboards show.
 *
 * Style rules carried over from the old AI system prompt: friendly plant
 * assistant persona, plain text (no markdown), 2-3 sentences, sparing emoji.
 */

import type { DemoFarm } from './demo-store';

export interface DemoChatContext {
  user: {
    username: string;
    displayName: string;
    level: number;
    xp: number;
  };
  farms: DemoFarm[];
}

export interface DemoChatReply {
  response: string;
  suggestedActions: string[];
}

const FALLBACK_TIPS = [
  'A good rule of thumb: water deeply but less often, so roots grow strong. Anything specific you want to check on today? 🌱',
  'Most leafy plants are happiest between 18 and 26°C. Ask me about any of your farms and I can tell you how they are doing!',
  'Yellowing leaves usually mean too much water, while crispy edges mean too little. Want me to check one of your farms?',
  'Rotating your plants a quarter turn each week helps them grow evenly toward the light. Ask me about a farm for a live reading!',
  'Soil that sticks to your finger is moist enough; if it crumbles away, it is time to water. I can check your farms if you ask!',
];

function describeFarmReading(farm: DemoFarm): string {
  const temp = farm.sensors.temperature.value;
  const humidity = farm.sensors.humidity.value;
  const soil = farm.sensors.soilMoisture.value;
  return `${farm.name} is at ${temp}°C with ${humidity}% humidity and ${soil}% soil moisture`;
}

/** Human-readable list of sensors outside or near their threshold ranges. */
function problemSensors(farm: DemoFarm): string[] {
  const problems: string[] = [];
  const checks: { label: string; value: number; unit: string; min: number; max: number }[] = [
    { label: 'temperature', value: farm.sensors.temperature.value, unit: '°C', ...farm.thresholds.temperature },
    { label: 'humidity', value: farm.sensors.humidity.value, unit: '%', ...farm.thresholds.humidity },
    { label: 'soil moisture', value: farm.sensors.soilMoisture.value, unit: '%', ...farm.thresholds.soilMoisture },
  ];

  for (const check of checks) {
    const range = check.max - check.min;
    const buffer = range * 0.1;
    if (check.value < check.min) {
      problems.push(`${check.label} is ${check.value}${check.unit}, below the ${check.min}${check.unit} minimum`);
    } else if (check.value > check.max) {
      problems.push(`${check.label} is ${check.value}${check.unit}, above the ${check.max}${check.unit} maximum`);
    } else if (check.value < check.min + buffer || check.value > check.max - buffer) {
      problems.push(`${check.label} is ${check.value}${check.unit}, close to its safe limit`);
    }
  }
  return problems;
}

function farmReport(farm: DemoFarm): string {
  const readings = describeFarmReading(farm);

  if (farm.status === 'critical') {
    const problems = problemSensors(farm);
    const detail = problems.length > 0 ? problems[0] : 'a sensor is out of range';
    return `${readings}. It is in critical condition: ${detail}. I would water it and check on it again in an hour! 🚨`;
  }

  if (farm.status === 'warning') {
    const problems = problemSensors(farm);
    const detail = problems.length > 0 ? problems[0] : 'a sensor is drifting toward its limit';
    return `${readings}. Keep an eye on it: ${detail}. A little care now keeps it from going critical!`;
  }

  return `${readings}. Everything looks healthy, you are doing a great job with this one! 🌱`;
}

function statusEmoji(status: DemoFarm['status']): string {
  if (status === 'critical') return 'critical 🚨';
  if (status === 'warning') return 'needs attention ⚠️';
  return 'healthy 🌱';
}

function buildResponse(message: string, ctx: DemoChatContext): string {
  const msg = message.toLowerCase();
  const farms = ctx.farms;

  // 1. A specific farm is mentioned by name
  const mentioned = farms.find((f) => msg.includes(f.name.toLowerCase()));
  if (mentioned) {
    return farmReport(mentioned);
  }

  // 2. Greetings
  if (/\b(hello|hi|hey|howdy|bonjour)\b/.test(msg)) {
    return `Hello ${ctx.user.displayName}! I am Plante, your plant care assistant. Ask me about any of your farms and I will check its live readings for you 🌱`;
  }

  // 3. Temperature
  if (/\b(temp|temperature|hot|cold|warm|heat)\b/.test(msg) && farms.length > 0) {
    const parts = farms.map((f) => `${f.name} is at ${f.sensors.temperature.value}°C`);
    return `Here is the temperature across your farms: ${parts.join(', ')}. Most plants are happiest between 18 and 26°C!`;
  }

  // 4. Humidity
  if (/\bhumid/.test(msg) && farms.length > 0) {
    const parts = farms.map((f) => `${f.name} is at ${f.sensors.humidity.value}%`);
    return `Humidity check: ${parts.join(', ')}. If a room is too dry, grouping plants together raises humidity naturally!`;
  }

  // 5. Water / soil
  if (/\b(water|soil|dry|moist|thirst|irrigat)/.test(msg) && farms.length > 0) {
    const driest = [...farms].sort(
      (a, b) => a.sensors.soilMoisture.value - b.sensors.soilMoisture.value
    )[0];
    return `Soil moisture wise, ${driest.name} is the thirstiest at ${driest.sensors.soilMoisture.value}%. Hit the Water Now button on its farm page and it will thank you! 💧`;
  }

  // 6. Status / health rundown
  if (/\b(status|health|check|doing|how are)\b/.test(msg) && farms.length > 0) {
    const parts = farms.map((f) => `${f.name} is ${statusEmoji(f.status)}`);
    return `Quick rundown: ${parts.join(', ')}. Ask me about any farm by name for a full reading!`;
  }

  // 7. Gamification
  if (/\b(level|xp|achievement|streak|points?)\b/.test(msg)) {
    return `You are level ${ctx.user.level} with ${ctx.user.xp} XP, ${ctx.user.displayName}. Keep your plants healthy to grow your green streak and unlock new badges! 🏆`;
  }

  // 8. Help
  if (/\b(help|what can you)\b/.test(msg)) {
    return 'I can check your farms by name, give you temperature, humidity, and soil readings, and share plant care tips. Try asking "how is Tomato Paradise doing?"';
  }

  // 9. Fallback: rotating tip (deterministic on message length)
  return FALLBACK_TIPS[message.length % FALLBACK_TIPS.length];
}

/** Suggested action chips, mirroring the old chat route's behavior. */
function buildSuggestedActions(response: string, farms: DemoFarm[]): string[] {
  const suggestedActions: string[] = [];
  const lower = response.toLowerCase();

  if (lower.includes('water')) {
    suggestedActions.push('How often should I water?');
  }
  if (lower.includes('temperature') || lower.includes('temp')) {
    suggestedActions.push('What temperature is best?');
  }
  if (farms.some((f) => f.status === 'critical' || f.status === 'warning')) {
    suggestedActions.push('Check my farm status');
  }

  return suggestedActions.slice(0, 3);
}

export function generateDemoReply(message: string, ctx: DemoChatContext): DemoChatReply {
  const response = buildResponse(message, ctx);
  return {
    response,
    suggestedActions: buildSuggestedActions(response, ctx.farms),
  };
}
