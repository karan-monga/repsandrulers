import { RenphoMeasurement, RenphoStats } from '@/types/renpho';
import OpenAI from 'openai';

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

// Initialize OpenAI client only if API key is available
let openai: OpenAI | null = null;

try {
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Note: In production, you should use a backend API
    });
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client:', error);
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

      // Check if OpenAI API key is available
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        console.warn('OpenAI API key not found, using simulated responses');
        return this.simulateAIResponse(analysisData);
      }

      // Create a comprehensive prompt for GPT
      const prompt = `Analyze this fitness data and provide actionable insights:

User Data:
- Total measurements: ${analysisData.totalMeasurements}
- Date range: ${analysisData.dateRange.first} to ${analysisData.dateRange.last}
- Current averages: Weight: ${analysisData.averages.weight_lb.toFixed(1)}lb, Body Fat: ${analysisData.averages.body_fat_percent.toFixed(1)}%, Muscle Mass: ${analysisData.averages.muscle_mass_lb.toFixed(1)}lb
- Trends: Weight change: ${analysisData.trends.weight_lb > 0 ? '+' : ''}${analysisData.trends.weight_lb.toFixed(1)}lb, Body Fat change: ${analysisData.trends.body_fat_percent > 0 ? '+' : ''}${analysisData.trends.body_fat_percent.toFixed(1)}%, Muscle Mass change: ${analysisData.trends.muscle_mass_lb > 0 ? '+' : ''}${analysisData.trends.muscle_mass_lb.toFixed(1)}lb
- User goals: ${analysisData.userGoals}

Recent measurements (last 5):
${analysisData.recentMeasurements.map(m => 
  `- ${new Date(m.time_of_measurement).toLocaleDateString()}: Weight ${m.weight_lb.toFixed(1)}lb, Body Fat ${m.body_fat_percent?.toFixed(1) || 'N/A'}%, Muscle ${m.muscle_mass_lb?.toFixed(1) || 'N/A'}lb`
).join('\n')}

Please provide 3-5 insights in this JSON format:
[
  {
    "type": "positive|warning|suggestion|achievement",
    "title": "Brief title",
    "description": "Detailed explanation",
    "actionItems": ["Action 1", "Action 2"],
    "confidence": 0.85
  }
]

Focus on:
1. Progress patterns and trends
2. Potential plateaus or issues
3. Achievements and positive changes
4. Specific, actionable recommendations
5. Health and fitness best practices

Keep insights practical and encouraging. Return only valid JSON.`;

      // Call OpenAI API
      if (!openai) {
        console.warn('OpenAI client not initialized, using simulated responses');
        return this.simulateAIResponse(analysisData);
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a fitness expert AI assistant. Analyze fitness data and provide actionable insights in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      try {
        const insights = JSON.parse(response);
        return insights.slice(0, 4); // Return top 4 insights
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        console.log('Raw response:', response);
        // Fallback to simulated response if parsing fails
        return this.simulateAIResponse(analysisData);
      }
      
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