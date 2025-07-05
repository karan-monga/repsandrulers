export interface MeasurementData {
  weight: number;
  neck: number;
  chest: number;
  waist: number;
  hips: number;
  leftBicep: number;
  rightBicep: number;
  leftThigh: number;
  rightThigh: number;
  leftCalf: number;
  rightCalf: number;
}

export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInM = height / 100;
  return Number((weight / (heightInM * heightInM)).toFixed(1));
}

export function convertUnits(value: number, fromUnit: 'metric' | 'imperial', toUnit: 'metric' | 'imperial', type: 'weight' | 'length'): number {
  if (fromUnit === toUnit) return value;

  if (type === 'weight') {
    // kg to lbs or lbs to kg
    return fromUnit === 'metric' ? value * 2.20462 : value / 2.20462;
  } else {
    // cm to inches or inches to cm
    return fromUnit === 'metric' ? value / 2.54 : value * 2.54;
  }
}

export function formatMeasurement(value: number, unit: 'metric' | 'imperial', type: 'weight' | 'length'): string {
  // Convert the value to the target unit if needed
  // Measurements are stored in metric units in the database
  const convertedValue = convertUnits(value, 'metric', unit, type);
  
  if (type === 'weight') {
    return unit === 'metric' ? `${convertedValue.toFixed(1)} kg` : `${convertedValue.toFixed(1)} lbs`;
  } else {
    return unit === 'metric' ? `${convertedValue.toFixed(1)} cm` : `${convertedValue.toFixed(1)} in`;
  }
}

// Helper function to parse feet/inches input (e.g., "6'1" -> 73 inches)
export function parseHeightInput(input: string): number {
  if (!input) return 0;
  
  // Handle feet'inches format (e.g., "6'1", "5'11")
  const feetInchesMatch = input.match(/^(\d+)'(\d+)$/);
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1]);
    const inches = parseInt(feetInchesMatch[2]);
    return feet * 12 + inches;
  }
  
  // Handle just inches
  const inchesMatch = input.match(/^(\d+)$/);
  if (inchesMatch) {
    return parseInt(inchesMatch[1]);
  }
  
  // Handle decimal inches
  const decimalMatch = input.match(/^(\d+\.\d+)$/);
  if (decimalMatch) {
    return parseFloat(decimalMatch[1]);
  }
  
  return 0;
}

// Helper function to format height for display
export function formatHeight(height: number, unit: 'metric' | 'imperial'): string {
  if (unit === 'metric') {
    return `${height.toFixed(1)} cm`;
  } else {
    const totalInches = height;
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches.toString().padStart(1, '0')}"`;
  }
}

export function getBMICategory(bmi: number): { category: string; color: string } {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
  if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
  return { category: 'Obese', color: 'text-red-600' };
}

// Goal progress calculations
export function calculateWeightChange(currentWeight: number, startWeight?: number): {
  change: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (!startWeight) {
    return { change: 0, trend: 'stable' };
  }

  const change = currentWeight - startWeight;
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

  return { change, trend };
}