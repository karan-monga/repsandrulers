'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Trophy, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { aiApi } from '@/lib/aiApi';
import { RenphoMeasurement, RenphoStats } from '@/types/renpho';

interface AIInsightsProps {
  measurements: RenphoMeasurement[];
  stats: RenphoStats | null;
}

interface AIInsight {
  type: 'positive' | 'warning' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  actionItems?: string[];
  confidence: number;
}

const insightTypeConfig = {
  positive: {
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  suggestion: {
    icon: Lightbulb,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  achievement: {
    icon: Trophy,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  }
};

export function AIInsights({ measurements, stats }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (measurements.length > 0 && stats) {
      generateInsights();
    }
  }, [measurements, stats]);

  const generateInsights = async () => {
    if (!stats) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const aiInsights = await aiApi.analyzeProgress({
        measurements,
        stats,
        userGoals: 'General fitness and health improvement',
        timeRange: 'recent'
      });
      
      setInsights(aiInsights);
    } catch (err) {
      setError('Failed to generate AI insights. Please try again.');
      console.error('Error generating insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightConfig = (type: AIInsight['type']) => {
    return insightTypeConfig[type];
  };

  if (measurements.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Progress Insights
          </h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
            <Sparkles className="w-3 h-3 mr-1" />
            NEW
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Analyzing your progress...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
              <button
                onClick={generateInsights}
                className="btn-secondary text-sm"
              >
                Try Again
              </button>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                Need more data to generate insights. Continue tracking your progress!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const config = getInsightConfig(insight.type);
                const IconComponent = config.icon;
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${config.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {insight.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {insight.description}
                        </p>
                        {insight.actionItems && insight.actionItems.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Recommended Actions:
                            </p>
                            <ul className="space-y-1">
                              {insight.actionItems.map((action, actionIndex) => (
                                <li
                                  key={actionIndex}
                                  className="text-xs text-gray-600 dark:text-gray-400 flex items-start space-x-2"
                                >
                                  <span className="text-primary-600 dark:text-primary-400 mt-1">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI insights are based on your measurement trends and fitness best practices.
                </p>
                <button
                  onClick={generateInsights}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1"
                >
                  Refresh Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 