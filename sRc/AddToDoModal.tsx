import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Flag, ChevronLeft, ChevronRight, Loader, MessageSquare, BookOpen, FileText, Clipboard, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface AddToDoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToDoAdded?: () => void;
}

export const AddToDoModal = ({ open, onOpenChange, onToDoAdded }: AddToDoModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>();
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    duration: "",
    sessionType: "tutor_chat",
    notes: "",
    priority: "medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.topic || !formData.subject || !formData.duration) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!dueDate) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const insertData = {
        topic: formData.topic,
        duration_minutes: parseInt(formData.duration) || 60,
        session_type: formData.sessionType || 'study',
        user_id: user?.id,
        content: {
          title: formData.topic,
          description: formData.notes || '',
          subject: formData.subject,
          notes: formData.notes || '',
          priority: formData.priority || 'medium',
          due_date: dueDate.toISOString(),
          status: 'pending',
          type: 'study',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      
      console.log('Inserting study session:', JSON.stringify(insertData, null, 2));
      
      const { data, error } = await supabase
        .from('study_sessions')
        .insert([insertData]);
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Task added successfully!",
      });
      
      onOpenChange(false);
      
      // Refresh tasks
      if (onToDoAdded) {
        onToDoAdded();
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setDueDate(date);
    }
  };

  const calendarTheme = {
    background: 'bg-background',
    border: 'border border-input',
    hoverBg: 'hover:bg-accent',
    selectedBg: 'bg-primary text-primary-foreground',
    todayBg: 'bg-accent text-accent-foreground',
    disabledText: 'text-muted-foreground opacity-50'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Study Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new study session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="block">Task Title *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({...prev, topic: e.target.value}))}
                placeholder="e.g., Study Binary Trees"
                required
                className="w-full"
              />
            </div>

            {/* Subject and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData(prev => ({...prev, subject: value}))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    <SelectItem value="math" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Mathematics</SelectItem>
                    <SelectItem value="science" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Science</SelectItem>
                    <SelectItem value="history" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">History</SelectItem>
                    <SelectItem value="english" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">English</SelectItem>
                    <SelectItem value="cs" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({...prev, priority: value as 'low' | 'medium' | 'high'}))}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      {formData.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>}
                      {formData.priority === 'medium' && <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>}
                      {formData.priority === 'low' && <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>}
                      <SelectValue placeholder="Select priority" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[100] min-w-[200px] bg-background border border-input rounded-md shadow-lg">
                    <SelectItem value="high" className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                        <span>High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low" className="px-4 py-2 hover:bg-accent cursor-pointer">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        <span>Low</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="block">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                  placeholder="e.g., 60"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="relative">
                  <DatePicker
                    selected={dueDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    showTimeSelect={false}
                    dateFormat="MMMM d, yyyy"
                    placeholderText="Click to select date"
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                      "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                      "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                      "cursor-pointer"
                    )}
                    calendarClassName="react-datepicker-custom"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="sessionType">Task Type</Label>
              <Select 
                value={formData.sessionType} 
                onValueChange={(value) => setFormData(prev => ({...prev, sessionType: value}))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent className="z-[100] min-w-[200px] bg-background border border-input rounded-md shadow-lg">
                  <SelectItem value="tutor_chat" className="px-4 py-2 hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Tutor Chat</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="self_study" className="px-4 py-2 hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Self Study</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="quiz" className="px-4 py-2 hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      <span>Quiz Practice</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="study_plan" className="px-4 py-2 hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Study Plan Review</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="document_review" className="px-4 py-2 hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Document Review</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="assignment" className="px-4 py-2 hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Clipboard className="w-4 h-4" />
                      <span>Assignment Work</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="reading" className="px-4 py-2 hover:bg-accent cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      <span>Reading</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="block">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                placeholder="Add any additional notes or details..."
                className="min-h-[120px] w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
