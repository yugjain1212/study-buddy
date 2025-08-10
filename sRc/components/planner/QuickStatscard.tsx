
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, CheckCircle, Target } from "lucide-react";

interface QuickStatsCardProps {
  studySessions: any[];
}

export const QuickStatsCard = ({ studySessions }: QuickStatsCardProps) => {
  const completedTasks = studySessions.filter(session => 
    session.content?.status === 'completed'
  );
  const pendingTasks = studySessions.filter(session => 
    !session.content?.status || session.content.status === 'pending'
  );
  const totalStudyTime = studySessions.reduce((total, session) => 
    total + (session.content?.time_spent || 0), 0
  );

  return (
    <Card className="glass-effect animate-gradient bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 border-green-200/30 dark:border-green-400/30 hover-lift animate-slide-in-right animate-stagger-3">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100 text-lg">
          <TrendingUp className="w-5 h-5 animate-pulse-glow" />
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 glass-effect rounded-lg hover-lift border border-green-300/20">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            </div>
            <div className="text-xl font-bold text-green-700 dark:text-green-400">
              {completedTasks.length}
            </div>
            <div className="text-xs text-green-600 dark:text-green-500">Completed</div>
          </div>
          <div className="text-center p-3 glass-effect rounded-lg hover-lift border border-orange-300/20">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-orange-500 mr-1" />
            </div>
            <div className="text-xl font-bold text-orange-700 dark:text-orange-400">
              {pendingTasks.length}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-500">Pending</div>
          </div>
        </div>
        
        <div className="text-center p-3 glass-effect rounded-lg hover-lift border border-blue-300/20">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-4 h-4 text-blue-500 mr-1" />
          </div>
          <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
            {Math.round(totalStudyTime / 3600)}h
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-500">Total Study Time</div>
        </div>

        <div className="text-xs text-green-700 dark:text-green-300 glass-effect p-3 rounded-lg hover-lift border border-green-300/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">💡</span>
            <strong>Smart Tip:</strong>
          </div>
          <p>You're most productive in the morning. Schedule important topics early!</p>
        </div>
      </CardContent>
    </Card>
  );
};

