import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface AddStudySessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSessionAdded?: () => void;
}

export const AddStudySessionModal = ({ open, onOpenChange, onSessionAdded }: AddStudySessionModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    duration: "",
    sessionType: "other",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          topic: formData.topic,
          duration_minutes: parseInt(formData.duration) || 0,
          session_type: formData.sessionType,
          content: {
            subject: formData.subject,
            notes: formData.notes
          }
        });

      if (error) throw error;

      // Update user progress
      await supabase.rpc('update_user_progress', {
        p_user_id: user.id,
        p_subject: formData.subject,
        p_topic: formData.topic,
        p_progress_percentage: 20,
        p_study_time_minutes: parseInt(formData.duration) || 0
      });

      toast({
        title: "Success",
        description: "Study session added successfully!",
      });

      setFormData({
        topic: "",
        subject: "",
        duration: "",
        sessionType: "other",
        notes: ""
      });
      
      onOpenChange(false);
      onSessionAdded?.();
    } catch (error) {
      console.error('Error adding study session:', error);
      toast({
        title: "Error",
        description: "Failed to add study session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Study Session</DialogTitle>
          <DialogDescription>
            Create a new study session to track your learning progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({...prev, topic: e.target.value}))}
                placeholder="e.g., Binary Trees"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData(prev => ({...prev, subject: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Data Structures">Data Structures</SelectItem>
                  <SelectItem value="Algorithms">Algorithms</SelectItem>
                  <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                  <SelectItem value="Database Systems">Database Systems</SelectItem>
                  <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
                placeholder="e.g., 60"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sessionType">Session Type</Label>
              <Select 
                value={formData.sessionType} 
                onValueChange={(value) => setFormData(prev => ({...prev, sessionType: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
