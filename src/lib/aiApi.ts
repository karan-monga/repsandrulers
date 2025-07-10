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
    
    // Always provide at least one insight based on current data
    const weightTrend = data.trends.weight_lb;
    const bodyFatTrend = data.trends.body_fat_percent;
    const muscleTrend = data.trends.muscle_mass_lb;
    const avgBodyFat = data.averages.body_fat_percent;
    
    // Weight trend analysis (more generous thresholds)
    if (weightTrend < -1) {
      insights.push({
        type: 'positive',
        title: 'Weight Loss Progress!',
        description: `You've lost ${Math.abs(weightTrend).toFixed(1)} pounds recently. Keep up the great work!`,
        actionItems: [
          'Maintain your current routine',
          'Consider adding strength training',
          'Monitor your energy levels'
        ],
        confidence: 0.85
      });
    } else if (weightTrend > 1) {
      insights.push({
        type: 'warning',
        title: 'Weight Gain Noticed',
        description: `You've gained ${weightTrend.toFixed(1)} pounds recently. Let's review your approach.`,
        actionItems: [
          'Review your nutrition plan',
          'Increase activity level',
          'Track body composition changes'
        ],
        confidence: 0.75
      });
    } else {
      insights.push({
        type: 'suggestion',
        title: 'Stable Weight Maintenance',
        description: 'Your weight has been relatively stable. This could be good maintenance or a plateau.',
        actionItems: [
          'Assess if this is your goal weight',
          'Consider adjusting your routine',
          'Focus on body composition improvements'
        ],
        confidence: 0.7
      });
    }

    // Body fat analysis
    if (bodyFatTrend < -0.5) {
      insights.push({
        type: 'achievement',
        title: 'Body Fat Reduction!',
        description: `Your body fat percentage decreased by ${Math.abs(bodyFatTrend).toFixed(1)}%. Excellent progress!`,
        actionItems: [
          'Continue your current approach',
          'Maintain protein intake',
          'Keep up the consistency'
        ],
        confidence: 0.9
      });
    } else if (avgBodyFat > 20) {
      insights.push({
        type: 'suggestion',
        title: 'Body Fat Optimization',
        description: `Your current body fat of ${avgBodyFat.toFixed(1)}% could be optimized for better health.`,
        actionItems: [
          'Focus on moderate caloric deficit',
          'Increase protein intake',
          'Add more cardio sessions'
        ],
        confidence: 0.8
      });
    }

    // Muscle mass analysis
    if (muscleTrend > 0.5) {
      insights.push({
        type: 'positive',
        title: 'Muscle Building Progress!',
        description: `You've gained ${muscleTrend.toFixed(1)} pounds of muscle mass. Great work!`,
        actionItems: [
          'Continue progressive overload',
          'Ensure adequate protein (1.6-2.2g/kg)',
          'Prioritize sleep for recovery'
        ],
        confidence: 0.85
      });
    }

    // General tracking encouragement (always include)
    insights.push({
      type: 'positive',
      title: 'Consistent Tracking!',
      description: `You have ${data.totalMeasurements} measurements tracked. Regular monitoring is key to success!`,
      actionItems: [
        'Keep tracking consistently',
        'Set specific goals',
        'Review progress weekly'
      ],
      confidence: 0.8
    });

    return insights.slice(0, 4); // Return top 4 insights
  }
}; 