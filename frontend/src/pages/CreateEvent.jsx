import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent, useEventConflicts } from '../api/events';
import { useAICopilot } from '../api/ai';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { AlertCircle, Sparkles } from 'lucide-react';

export const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Technical', event_date: '', start_time: '', end_time: '', venue: '',
    eligibility: '', capacity: '', is_free: true
  });
  
  const navigate = useNavigate();
  const createMutation = useCreateEvent();
  const aiMutation = useAICopilot();
  const conflicts = useEventConflicts({ date: formData.event_date, startTime: formData.start_time, venue: formData.venue });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ ...formData, capacity: parseInt(formData.capacity) || null });
      navigate('/organizer/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const improveWithAI = async () => {
    if (!formData.description) return;
    try {
      const { suggestion } = await aiMutation.mutateAsync(formData.description);
      setFormData({ ...formData, description: suggestion });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">Create New Event</h1>
      
      {conflicts.data?.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-warning">Potential Conflict Detected</h4>
            <p className="text-sm text-yellow-800">There are {conflicts.data.length} event(s) happening at the same time/venue.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Event Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        
        <div className="relative">
          <Textarea label="Description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={6} />
          <button type="button" onClick={improveWithAI} disabled={aiMutation.isPending} className="absolute right-2 top-8 text-xs flex items-center gap-1 bg-accent/10 text-accent px-2 py-1 rounded font-medium hover:bg-accent/20">
            <Sparkles className="h-3 w-3" /> Improve with AI
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} options={[{value:'Technical',label:'Technical'},{value:'Cultural',label:'Cultural'},{value:'Sports',label:'Sports'}]} />
          <Input label="Venue" required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Date" type="date" required value={formData.event_date} onChange={e => setFormData({...formData, event_date: e.target.value})} />
          <Input label="Start Time" type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
          <Input label="End Time" type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Capacity" type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
          <Input label="Eligibility" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} />
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" isLoading={createMutation.isPending}>Publish Event</Button>
        </div>
      </form>
    </div>
  );
};
