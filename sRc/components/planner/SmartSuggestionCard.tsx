import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Brain, Clock, Target, Zap, BookOpen, ChevronRight, Plus, AlertTriangle, CalendarDays } from "lucide-react";
import { format, addDays, isToday, isTomorrow, isAfter, differenceInDays, parseISO } from "date-fns";

interface StudySession {
  id: string;
  topic?: string;
  title?: string;
  duration_minutes?: number;
  duration?: number;
  session_type?: string;
  created_at?: string;
  dueDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  subject?: string;
  content?: {
    status?: 'not_started' | 'in_progress' | 'completed';
    subject?: string;
    completed_at?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

interface ExamSchedule {
  id: string;
  title: string;
  subject: string;
  date: string;
  weightage: number;
  topics: string[];
}

interface SmartSuggestion {
  id: string;
  title: string;
  type: "review" | "new" | "practice" | "exam_prep" | "exam_soon";
  priority: "high" | "medium" | "low";
  estimatedMinutes: number;
  reason: string;
  subject?: string;
  suggestedDate?: Date;
  examDate?: Date;
}

interface SmartSuggestionsCardProps {
  studySessions: StudySession[];
  upcomingExams: ExamSchedule[];
  recentPerformance: any[];
  onAddSuggestion: (suggestion: SmartSuggestion) => void;
}

export const SmartSuggestionsCard = ({ 
  studySessions = [], 
  upcomingExams = [],
  recentPerformance = [],
  onAddSuggestion 
}: SmartSuggestionsCardProps) => {
  
  // Extract unique subjects from study sessions
  const subjects = useMemo(() => {
    return Array.from(new Set(studySessions
      .filter(s => s.subject || s.content?.subject)
      .map(s => s.subject || s.content?.subject)
    ));
  }, [studySessions]);

  // Categorize sessions by priority
  const priorityCounts = useMemo(() => {
    return studySessions.reduce((acc, session) => {
      const priority = session.priority || session.content?.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [studySessions]);

  // Generate intelligent suggestions
  const suggestions = useMemo<SmartSuggestion[]>(() => {
    const now = new Date();
    const baseSuggestions: SmartSuggestion[] = [
      {
        id: 'focus-block',
        title: 'Focused Work Block',
        type: 'new',
        priority: 'high',
        estimatedMinutes: 50,
        reason: 'Optimal time for deep work based on your habits',
        subject: subjects[0] || 'Priority Subject'
      },
      {
        id: 'active-recall',
        title: 'Active Recall Session',
        type: 'practice',
        priority: 'medium',
        estimatedMinutes: 30,
        reason: 'Boost retention for recently studied topics',
        subject: subjects[subjects.length - 1] || 'Recent Topic'
      },
      {
        id: 'weekly-review',
        title: 'Weekly Knowledge Review',
        type: 'review',
        priority: 'medium',
        estimatedMinutes: 45,
        reason: 'Consolidate learning from past 7 days',
        subject: 'All Subjects'
      }
    ];

    // Add exam prep suggestions if exams are coming up
    upcomingExams.slice(0, 2).forEach(exam => {
      const daysUntil = differenceInDays(parseISO(exam.date), now);
      
      if (daysUntil <= 7) {
        baseSuggestions.push({
          id: `exam-${exam.id}`,
          title: `Exam Prep: ${exam.title}`,
          type: 'exam_prep',
          priority: 'high',
          estimatedMinutes: 90,
          reason: `${daysUntil} days until exam - focus on weak areas`,
          subject: exam.subject,
          examDate: parseISO(exam.date)
        });
      }
    });

    // Suggest breaks if user has many high-priority tasks
    if ((priorityCounts['high'] || 0) > 3) {
      baseSuggestions.push({
        id: 'strategic-break',
        title: 'Strategic Break',
        type: 'new',
        priority: 'low',
        estimatedMinutes: 15,
        reason: 'Prevent burnout with a mindful break',
        subject: 'Wellbeing'
      });
    }

    return baseSuggestions;
  }, [studySessions, upcomingExams, subjects, priorityCounts]);

  return (
    <Card className="border-border/50 shadow-lg hover-lift animate-slide-in-right">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Smart Suggestions
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on your study patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {suggestion.type === 'exam_prep' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {suggestion.reason}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{suggestion.subject}</Badge>
                      <Badge variant="outline">{suggestion.estimatedMinutes} mins</Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onAddSuggestion(suggestion)}
                    className="text-primary hover:text-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
