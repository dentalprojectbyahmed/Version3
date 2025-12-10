import { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Award, Zap } from 'lucide-react';
import { db } from '../services/database';
import { badges, pointsSystem, peshawariMessages } from '../data/gamification';
import { useAuth } from '../contexts/AuthContext';

export default function Gamification() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPoints: 0,
    earnedBadges: [],
    level: 1,
    recentActivities: []
  });
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    // Get user's points from activity log
    const activities = await db.activityLog.toArray();
    const userActivities = activities.filter(a => a.userEmail === user?.email);
    
    // Calculate total points
    let totalPoints = 0;
    const recentActivities = [];

    userActivities.forEach(activity => {
      const points = calculatePoints(activity);
      totalPoints += points;
      
      if (recentActivities.length < 10) {
        recentActivities.push({
          ...activity,
          points
        });
      }
    });

    // Check earned badges
    const earnedBadges = checkBadges(userActivities, totalPoints);

    // Calculate level
    const level = Math.floor(totalPoints / 100) + 1;

    setStats({
      totalPoints,
      earnedBadges,
      level,
      recentActivities: recentActivities.reverse()
    });
  };

  const calculatePoints = (activity) => {
    const action = activity.action.toLowerCase();
    
    // Match activity to point rules
    for (const rule of pointsSystem.actions || []) {
      if (action.includes(rule.action.toLowerCase())) {
        return rule.points;
      }
    }
    
    return 0;
  };

  const checkBadges = (activities, totalPoints) => {
    const earned = [];

    badges.forEach(badge => {
      let qualified = false;

      switch (badge.id) {
        case 'first_patient':
          qualified = activities.some(a => a.action.includes('patient'));
          break;
        case 'speed_demon':
          // Check if 10+ patients in one day
          const dates = {};
          activities.forEach(a => {
            if (a.action.includes('patient')) {
              const date = new Date(a.timestamp).toDateString();
              dates[date] = (dates[date] || 0) + 1;
            }
          });
          qualified = Object.values(dates).some(count => count >= 10);
          break;
        case 'century':
          qualified = totalPoints >= 100;
          break;
        case 'half_thousand':
          qualified = totalPoints >= 500;
          break;
        case 'grand':
          qualified = totalPoints >= 1000;
          break;
        case 'week_warrior':
          // Check if activity every day for 7 days
          const last7Days = new Date();
          last7Days.setDate(last7Days.getDate() - 7);
          const recentActivities = activities.filter(a => new Date(a.timestamp) >= last7Days);
          const uniqueDays = new Set(recentActivities.map(a => new Date(a.timestamp).toDateString()));
          qualified = uniqueDays.size >= 7;
          break;
        case 'perfect_month':
          // Check if activity every day this month
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthActivities = activities.filter(a => new Date(a.timestamp) >= monthStart);
          const monthDays = new Set(monthActivities.map(a => new Date(a.timestamp).toDateString()));
          qualified = monthDays.size >= 20; // At least 20 days
          break;
        case 'money_maker':
          // Check if 50+ invoices
          qualified = activities.filter(a => a.action.includes('invoice')).length >= 50;
          break;
        case 'treatment_master':
          // Check if 100+ treatments
          qualified = activities.filter(a => a.action.includes('treatment')).length >= 100;
          break;
        case 'prescription_pro':
          // Check if 50+ prescriptions
          qualified = activities.filter(a => a.action.includes('prescription')).length >= 50;
          break;
      }

      if (qualified) {
        earned.push(badge);
      }
    });

    return earned;
  };

  const getMotivationalMessage = () => {
    const messages = peshawariMessages.motivational || [];
    return messages.length > 0 ? messages[Math.floor(Math.random() * messages.length)] : 'Keep up the great work!';
  };

  const getProgressToNextLevel = () => {
    const currentLevelPoints = (stats.level - 1) * 100;
    const nextLevelPoints = stats.level * 100;
    const progress = ((stats.totalPoints - currentLevelPoints) / 100) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gamification Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your achievements and earn rewards!</p>
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8" />
          <div>
            <div className="text-sm opacity-90">Today's Message</div>
            <div className="text-lg font-semibold">{getMotivationalMessage()}</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Total Points</div>
              <div className="text-4xl font-bold mt-2">{stats.totalPoints}</div>
            </div>
            <Star className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Level</div>
              <div className="text-4xl font-bold mt-2">{stats.level}</div>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-card bg-opacity-30 rounded-full h-2">
              <div 
                className="bg-card h-2 rounded-full transition-all"
                style={{ width: `${getProgressToNextLevel()}%` }}
              />
            </div>
            <div className="text-xs mt-1 opacity-90">
              {100 - Math.floor(getProgressToNextLevel())} points to Level {stats.level + 1}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Badges Earned</div>
              <div className="text-4xl font-bold mt-2">{stats.earnedBadges.length}</div>
              <div className="text-xs opacity-75 mt-1">of {badges.length}</div>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Your Badges
        </h2>
        <div className="grid grid-cols-5 gap-4">
          {badges.map(badge => {
            const earned = stats.earnedBadges.some(b => b.id === badge.id);
            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  earned 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-border bg-background opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="font-semibold text-sm">{badge.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{badge.description}</div>
                {earned && (
                  <div className="mt-2 text-xs text-yellow-700 font-semibold">
                    ✓ EARNED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-2">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${activity.points > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No activities yet. Start working to earn points!
            </div>
          )}
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-card rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Available Rewards</h2>
        <div className="grid grid-cols-2 gap-4">
          {(pointsSystem.rewards || []).map((reward, index) => {
            const canClaim = stats.totalPoints >= reward.pointsRequired;
            return (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  canClaim 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{reward.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{reward.description}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Requires: {reward.pointsRequired} points
                    </div>
                  </div>
                  {canClaim && (
                    <div className="ml-2">
                      <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs rounded">
                        Available!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
