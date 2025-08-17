import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, RotateCcw, Trophy, Clock } from "lucide-react";
import { QuizTimer } from "./QuizTimer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizGeneratorProps {
  category: string;
  difficulty: string;
  questionCount?: number;
  onQuizComplete?: (score: number) => void;
}

export const QuizGenerator = ({ category, difficulty, questionCount = 5, onQuizComplete }: QuizGeneratorProps) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Timer states
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);
  const [totalQuizTime, setTotalQuizTime] = useState<number>(0);

  const generateAIQuiz = async () => {
    setLoading(true);
    
    try {
      const prompt = `Generate ${questionCount} multiple choice questions about ${category} at ${difficulty} difficulty level. 

Format the response as a JSON array with each question having this exact structure:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why this is correct"
}

Make sure:
- Each question has exactly 4 options
- correctAnswer is the index (0-3) of the correct option
- Questions are relevant to ${category}
- Difficulty matches ${difficulty} level
- Include clear explanations

Return only the JSON array, no additional text.`;

      console.log('Generating quiz with Mistral AI...');
      
      const { data, error } = await supabase.functions.invoke('chat-with-mistral', {
        body: {
          message: prompt,
          sessionId: `quiz-generation-${Date.now()}`
        }
      });

      if (error) {
        throw error;
      }

      if (!data?.response) {
        throw new Error('No response from AI');
      }

      console.log('AI Response:', data.response);

      // Check if response indicates service issues
      if (data.response.includes('technical difficulties') || data.response.includes('service issues')) {
        throw new Error('AI service temporarily unavailable');
      }

      // Extract JSON from the response
      let jsonText = data.response;
      
      // Try to find JSON array in the response
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      let generatedQuestions;
      try {
        generatedQuestions = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        throw new Error('Invalid response format from AI');
      }
      
      if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
        throw new Error('Invalid questions format received');
      }

      // Validate and format questions
      const formattedQuestions: Question[] = generatedQuestions.map((q, index) => ({
        id: index + 1,
        question: q.question || 'Question text missing',
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4 ? q.correctAnswer : 0,
        explanation: q.explanation || 'No explanation provided'
      }));

      console.log('Generated questions:', formattedQuestions);

      setQuiz(formattedQuestions);
      setQuizStarted(true);
      setQuizStartTime(Date.now());
      setQuestionStartTime(Date.now());
      setRetryCount(0); // Reset retry count on success
      
      toast({
        title: "Quiz Generated!",
        description: `${formattedQuestions.length} AI-generated questions ready`,
      });

    } catch (error) {
      console.error('Error generating quiz:', error);
      setRetryCount(prev => prev + 1);
      
      let errorMessage = "Failed to generate quiz questions. ";
      if (retryCount === 0) {
        errorMessage += "This might be due to high demand on the AI service. Please try again.";
      } else if (retryCount === 1) {
        errorMessage += "The AI service is experiencing issues. Please wait a moment and try again.";
      } else {
        errorMessage += "The AI service seems to be having extended issues. This could be due to API limits or service outage. Please try again later.";
      }
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    
    const questionEndTime = Date.now();
    const questionTime = Math.floor((questionEndTime - questionStartTime) / 1000);
    const newQuestionTimes = [...questionTimes, questionTime];
    setQuestionTimes(newQuestionTimes);
    
    const answerIndex = parseInt(selectedAnswer);
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
      setQuestionStartTime(Date.now());
    } else {
      const totalTime = Math.floor((questionEndTime - quizStartTime) / 1000);
      setTotalQuizTime(totalTime);
      completeQuiz(newAnswers, totalTime);
    }
  };

  const completeQuiz = async (finalAnswers: number[], totalTime: number) => {
    const score = finalAnswers.reduce((acc, answer, index) => {
      return acc + (answer === quiz[index].correctAnswer ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / quiz.length) * 100);
    
    setShowResult(true);
    onQuizComplete?.(percentage);

    if (user) {
      try {
        await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            topic: `${category} Quiz (AI Generated)`,
            duration_minutes: Math.ceil(totalTime / 60),
            session_type: 'quiz',
            content: {
              category,
              difficulty,
              score: percentage,
              questions: quiz.length,
              correct_answers: score,
              total_time_seconds: totalTime,
              question_times: questionTimes,
              average_time_per_question: Math.round(totalTime / quiz.length),
              ai_generated: true
            }
          });

        await supabase.rpc('update_user_progress', {
          p_user_id: user.id,
          p_subject: category,
          p_topic: 'AI Quiz Practice',
          p_progress_percentage: Math.min(percentage, 100),
          p_study_time_minutes: Math.ceil(totalTime / 60),
          p_quiz_score: percentage
        });

        if (percentage === 100) {
          await supabase
            .from('achievements')
            .insert({
              user_id: user.id,
              achievement_type: 'quiz_perfect',
              title: 'Perfect Score!',
              description: `Got 100% on AI-generated ${category} quiz`,
              icon: '🏆'
            });

          toast({
            title: "Achievement Unlocked!",
            description: "Perfect Score! You got 100% on the AI-generated quiz!",
          });
        }
      } catch (error) {
        console.error('Error saving quiz results:', error);
      }
    }
  };

  const resetQuiz = () => {
    setQuiz([]);
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setAnswers([]);
    setShowResult(false);
    setQuizStarted(false);
    setQuestionTimes([]);
    setTotalQuizTime(0);
    setRetryCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!quizStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {category} Quiz
            <Badge variant="secondary">AI-Generated</Badge>
          </CardTitle>
          <CardDescription>
            Get {questionCount} personalized {difficulty.toLowerCase()} level questions generated by AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline">{difficulty}</Badge>
            <Badge variant="secondary">{questionCount} Questions</Badge>
            <Badge variant="secondary">~{Math.max(questionCount * 2, 5)} minutes</Badge>
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">🤖 AI-Powered</Badge>
          </div>
          <Button 
            onClick={generateAIQuiz} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Generating AI Quiz..." : "Generate AI Quiz"}
          </Button>
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              {retryCount === 1 ? "Having trouble? Try again in a moment." : "Service issues detected. Please wait before retrying."}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showResult) {
    const score = answers.reduce((acc, answer, index) => {
      return acc + (answer === quiz[index].correctAnswer ? 1 : 0);
    }, 0);
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            AI Quiz Complete!
          </CardTitle>
          <CardDescription>Here are your results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary mb-2">{percentage}%</div>
            <p className="text-muted-foreground">
              You got {score} out of {quiz.length} AI-generated questions correct
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Total time: {formatTime(totalQuizTime)}
              </span>
              <span>Avg per question: {formatTime(Math.round(totalQuizTime / quiz.length))}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Review:</h4>
            {quiz.map((question, index) => (
              <div key={question.id} className="p-3 border rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  {answers[index] === question.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{question.question}</p>
                      <Badge variant="outline" className="text-xs">
                        {formatTime(questionTimes[index] || 0)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Correct: {question.options[question.correctAnswer]}
                    </p>
                    {answers[index] !== question.correctAnswer && (
                      <p className="text-xs text-red-600">
                        Your answer: {question.options[answers[index]]}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                  {question.explanation}
                </p>
              </div>
            ))}
          </div>

          <Button onClick={resetQuiz} className="w-full gap-2">
            <RotateCcw className="w-4 h-4" />
            Generate Another AI Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = quiz[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Question {currentQuestion + 1} of {quiz.length}
            <Badge variant="secondary" className="text-xs">AI-Generated</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <QuizTimer 
              isActive={true} 
              questionStartTime={questionStartTime}
            />
            <Badge variant="outline">{difficulty}</Badge>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <h3 className="text-lg font-medium">{currentQ.question}</h3>
        
        <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
          {currentQ.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Button 
          onClick={handleAnswerSubmit}
          disabled={!selectedAnswer}
          className="w-full"
        >
          {currentQuestion < quiz.length - 1 ? "Next Question" : "Finish Quiz"}
        </Button>
      </CardContent>
    </Card>
  );
};
