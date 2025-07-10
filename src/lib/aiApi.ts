import { RenphoMeasurement, RenphoStats } from '@/types/renpho';

interface AIAnalysisRequest {
  measurements: RenphoMeasurement[];
  stats: RenphoStats;
  userGoals?: string;
  timeRange?: string;
}

interface AIInsight {
  type: 'positive' | 'warning' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  actionItems?: string[];
  confidence: number;
}

export const aiApi = {
  async analyzeProgress(data: AIAnalysisRequest): Promise<AIInsight[]> {
    try {
      // Prepare the data for analysis
      const analysisData = {
        totalMeasurements: data.stats.totalMeasurements,
        dateRange: data.stats.dateRange,
        averages: data.stats.averages,
        trends: data.stats.trends,
        recentMeasurements: data.measurements.slice(0, 5), // Last 5 measurements
        userGoals: data.userGoals || 'General fitness and health improvement',
        timeRange: data.timeRange || 'recent'
      };

      // For now, we'll simulate AI responses since we need to set up the actual API
      // In production, you would call the OpenAI API here with a prompt like:
      // const prompt = `Analyze this fitness data and provide actionable insights...`;
      return this.simulateAIResponse(analysisData);
      
    } catch (error) {
      console.error('Error analyzing progress:', error);
      return [];
    }
  },

  // Simulate AI responses for development
  simulateAIResponse(data: any): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Analyze weight trends
    if (data.trends.weight_lb < -2) {
      insights.push({
        type: 'positive',
        title: 'Great Weight Loss Progress!',
        description: `You've lost ${Math.abs(data.trends.weight_lb).toFixed(1)} pounds recently. This is a healthy rate of weight loss that suggests you're in a good caloric deficit.`,
        actionItems: [
          'Maintain your current nutrition and exercise routine',
          'Consider adding strength training to preserve muscle mass',
          'Monitor energy levels and adjust if needed'
        ],
        confidence: 0.9
      });
    } else if (data.trends.weight_lb > 2) {
      insights.push({
        type: 'warning',
        title: 'Weight Gain Detected',
        description: `You've gained ${data.trends.weight_lb.toFixed(1)} pounds recently. This might be muscle gain, but let's check your body composition.`,
        actionItems: [
          'Review your nutrition and portion sizes',
          'Increase cardio or activity level',
          'Track your body fat percentage more closely'
        ],
        confidence: 0.8
      });
    }

    // Analyze body fat trends
    if (data.trends.body_fat_percent < -1) {
      insights.push({
        type: 'achievement',
        title: 'Body Fat Reduction Success!',
        description: `Your body fat percentage has decreased by ${Math.abs(data.trends.body_fat_percent).toFixed(1)}%. This indicates you're losing fat while potentially maintaining muscle.`,
        actionItems: [
          'Continue with your current routine',
          'Consider progressive overload in strength training',
          'Maintain adequate protein intake'
        ],
        confidence: 0.95
      });
    }

    // Analyze muscle mass trends
    if (data.trends.muscle_mass_lb > 1) {
      insights.push({
        type: 'positive',
        title: 'Muscle Mass Building!',
        description: `You've gained ${data.trends.muscle_mass_lb.toFixed(1)} pounds of muscle mass. This is excellent progress for strength and body composition.`,
        actionItems: [
          'Continue with progressive overload',
          'Ensure adequate protein intake (1.6-2.2g per kg body weight)',
          'Get sufficient sleep for muscle recovery'
        ],
        confidence: 0.9
      });
    }

    // Check for plateaus
    if (Math.abs(data.trends.weight_lb) < 0.5 && Math.abs(data.trends.body_fat_percent) < 0.5) {
      insights.push({
        type: 'suggestion',
        title: 'Progress Plateau Detected',
        description: 'Your measurements have been relatively stable recently. This might indicate a plateau in your progress.',
        actionItems: [
          'Increase workout intensity or frequency',
          'Adjust your caloric intake',
          'Try new exercises or training methods',
          'Consider a deload week then ramp up'
        ],
        confidence: 0.7
      });
    }

    // General health insights
    if (data.averages.body_fat_percent > 25) {
      insights.push({
        type: 'suggestion',
        title: 'Body Fat Optimization Opportunity',
        description: `Your current body fat percentage of ${data.averages.body_fat_percent.toFixed(1)}% is above the recommended range for optimal health and performance.`,
        actionItems: [
          'Focus on creating a moderate caloric deficit',
          'Increase protein intake to preserve muscle',
          'Add more cardio sessions',
          'Consider tracking your macros more closely'
        ],
        confidence: 0.8
      });
    }

    // If no specific insights, provide general encouragement
    if (insights.length === 0) {
      insights.push({
        type: 'positive',
        title: 'Consistent Tracking!',
        description: 'Great job maintaining consistent measurements. Regular tracking is key to long-term success.',
        actionItems: [
          'Continue tracking your progress',
          'Set specific, measurable goals',
          'Consider adding more measurement types'
        ],
        confidence: 0.6
      });
    }

    return insights.slice(0, 4); // Return top 4 insights
  }
}; 