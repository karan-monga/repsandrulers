'use client';

import { useState, useRef } from 'react';
import { Target, Plus, Edit, Trash2, CheckCircle, Circle, TrendingDown, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Milestone } from '@/contexts/AuthContext';
import { formatMeasurement } from '@/lib/calculations';

export function WeightGoalComponent() {
  const { userProfile, measurements, weightGoal, setWeightGoal, updateWeightGoal, deleteWeightGoal } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ value: '', date: '' });
  const [targetWeight, setTargetWeight] = useState('');
  const targetWeightRef = useRef<HTMLInputElement>(null);
  const editTargetWeightRef = useRef<HTMLInputElement>(null);

  // Get current weight from latest measurement
  const latestMeasurement = measurements[0];
  const currentWeight = latestMeasurement?.weight || 0;

  // Calculate weight change from start
  const startWeight = measurements[measurements.length - 1]?.weight;
  const weightChange = startWeight ? currentWeight - startWeight : 0;
  const weightToGo = weightGoal ? currentWeight - weightGoal.target_value : 0;
  const isLosing = weightGoal ? weightGoal.target_value < currentWeight : false;

  // Check for newly reached milestones
  const checkAndUpdateMilestones = () => {
    if (!weightGoal || !latestMeasurement) return;

    const updatedMilestones = weightGoal.milestones.map(milestone => {
      if (!milestone.reached) {
        const reached = isLosing ? 
          currentWeight <= milestone.value : 
          currentWeight >= milestone.value;
        
        if (reached) {
          return {
            ...milestone,
            reached: true,
            reachedAt: new Date().toISOString()
          };
        }
      }
      return milestone;
    });

    if (updatedMilestones.some(m => m.reached !== weightGoal.milestones.find(om => om.id === m.id)?.reached)) {
      updateWeightGoal({ milestones: updatedMilestones });
    }
  };

  // Check milestones when current weight changes
  useState(() => {
    if (latestMeasurement) {
      checkAndUpdateMilestones();
    }
  });

  const handleSetGoal = async (targetWeightValue: number) => {
    await setWeightGoal({
      type: 'weight',
      target_value: targetWeightValue,
      current_value: currentWeight,
      start_date: new Date().toISOString(),
      target_date: null,
      milestones: []
    });
    setIsEditing(false);
    setTargetWeight('');
  };

  const handleAddMilestone = async () => {
    if (!weightGoal || !newMilestone.value) return;

    const milestone: Milestone = {
      id: Date.now().toString(),
      value: Number(newMilestone.value),
      date: newMilestone.date || undefined,
      reached: false
    };

    await updateWeightGoal({
      milestones: [...weightGoal.milestones, milestone]
    });

    setNewMilestone({ value: '', date: '' });
    setIsAddingMilestone(false);
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!weightGoal) return;

    await updateWeightGoal({
      milestones: weightGoal.milestones.filter(m => m.id !== milestoneId)
    });
  };

  const handleDeleteGoal = async () => {
    if (confirm('Are you sure you want to delete your weight goal?')) {
      await deleteWeightGoal();
    }
  };

  const getNextMilestone = () => {
    if (!weightGoal || weightGoal.milestones.length === 0) return null;
    
    const unreachedMilestones = weightGoal.milestones
      .filter(m => !m.reached)
      .sort((a, b) => isLosing ? a.value - b.value : b.value - a.value);
    
    return unreachedMilestones[0] || null;
  };

  const nextMilestone = getNextMilestone();

  if (!weightGoal) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weight Goal</h3>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Set a weight goal to track your progress</p>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Set Weight Goal</span>
          </button>
        </div>

        {isEditing && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262626] rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Set Your Target Weight</h4>
            <div className="flex items-center space-x-3">
              <input
                ref={targetWeightRef}
                type="number"
                step="0.1"
                placeholder={`Target weight in ${userProfile?.unit_preference === 'metric' ? 'kg' : 'lbs'}`}
                className="input flex-1"
                value={targetWeight}
                onChange={e => setTargetWeight(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = Number(targetWeight);
                    if (target > 0) handleSetGoal(target);
                  }
                }}
              />
              <button
                onClick={() => {
                  const target = Number(targetWeight);
                  if (target > 0) handleSetGoal(target);
                }}
                className="btn-primary"
              >
                Set Goal
              </button>
              <button
                onClick={() => { setIsEditing(false); setTargetWeight(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weight Goal</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddingMilestone(true)}
            className="btn-secondary p-2"
            title="Add Milestone"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary p-2"
            title="Edit Goal"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteGoal}
            className="btn-secondary p-2 text-red-600 hover:text-red-700"
            title="Delete Goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current vs Target Weight */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-[#262626] p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Current Weight</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatMeasurement(currentWeight, userProfile?.unit_preference || 'metric', 'weight')}
            </p>
            {weightChange !== 0 && (
              <div className="flex items-center justify-center mt-2">
                {weightChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  weightChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {userProfile?.unit_preference === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
            )}
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg text-center">
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-1">Target Weight</p>
            <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              {formatMeasurement(weightGoal.target_value, userProfile?.unit_preference === 'metric' ? 'metric' : 'imperial', 'weight')}
            </p>
            {weightToGo !== 0 && (
              <div className="flex items-center justify-center mt-2">
                {isLosing ? (
                  <TrendingDown className="w-4 h-4 text-primary-500 mr-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-primary-500 mr-1" />
                )}
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {Math.abs(weightToGo).toFixed(1)} {userProfile?.unit_preference === 'metric' ? 'kg' : 'lbs'} to go
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Goal Status */}
        {weightToGo === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-green-800 dark:text-green-200 font-medium">Goal Achieved! 🎉</p>
            <p className="text-green-600 dark:text-green-400 text-sm">You've reached your target weight</p>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  {isLosing ? 'Losing Weight' : 'Gaining Weight'}
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  {isLosing ? 'Keep up the great work!' : 'Stay consistent with your routine'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-800 dark:text-blue-200 font-bold text-lg">
                  {Math.abs(weightToGo).toFixed(1)} {userProfile?.unit_preference === 'metric' ? 'kg' : 'lbs'}
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-sm">remaining</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Milestones */}
      {weightGoal.milestones.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Milestones</h4>
          <div className="space-y-2">
            {weightGoal.milestones
              .sort((a, b) => isLosing ? a.value - b.value : b.value - a.value)
              .map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    milestone.reached 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                      : 'bg-gray-50 dark:bg-[#262626] border-gray-200 dark:border-[#2e2e2e]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {milestone.reached ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <span className={`font-medium ${
                        milestone.reached ? 'text-green-800 dark:text-green-200' : 'text-gray-900 dark:text-white'
                      }`}>
                        {formatMeasurement(milestone.value, userProfile?.unit_preference === 'metric' ? 'metric' : 'imperial', 'weight')}
                      </span>
                      {milestone.date && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          by {new Date(milestone.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg mb-4">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            <strong>Next milestone:</strong> {formatMeasurement(nextMilestone.value, userProfile?.unit_preference === 'metric' ? 'metric' : 'imperial', 'weight')}
            {nextMilestone.date && (
              <span className="ml-2">by {new Date(nextMilestone.date).toLocaleDateString()}</span>
            )}
          </p>
        </div>
      )}

      {/* Add Milestone Form */}
      {isAddingMilestone && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262626] rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add Milestone</h4>
          <div className="space-y-3">
            <input
              type="number"
              step="0.1"
              placeholder={`Weight in ${userProfile?.unit_preference === 'metric' ? 'kg' : 'lbs'}`}
              value={newMilestone.value}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, value: e.target.value }))}
              className="input"
            />
            <input
              type="date"
              placeholder="Target date (optional)"
              value={newMilestone.date}
              onChange={(e) => setNewMilestone(prev => ({ ...prev, date: e.target.value }))}
              className="input"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddMilestone}
                disabled={!newMilestone.value}
                className="btn-primary disabled:opacity-50"
              >
                Add Milestone
              </button>
              <button
                onClick={() => {
                  setIsAddingMilestone(false);
                  setNewMilestone({ value: '', date: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Form */}
      {isEditing && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-[#262626] rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Edit Target Weight</h4>
          <div className="flex items-center space-x-3">
            <input
              ref={editTargetWeightRef}
              type="number"
              step="0.1"
              defaultValue={weightGoal.target_value}
              placeholder={`Target weight in ${userProfile?.unit_preference === 'metric' ? 'kg' : 'lbs'}`}
              className="input flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = Number((e.target as HTMLInputElement).value);
                  if (target > 0) {
                    updateWeightGoal({ target_value: target });
                    setIsEditing(false);
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const target = Number(editTargetWeightRef.current?.value);
                if (target > 0) {
                  updateWeightGoal({ target_value: target });
                  setIsEditing(false);
                }
              }}
              className="btn-primary"
            >
              Update Goal
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 