import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent, useUpdateEvent, usePublishEvent, useEventConflicts } from '../api/events';
import { useAICopilot } from '../api/ai';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { Spinner } from '../components/common/Spinner';
import { AlertCircle, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'competition', label: 'Competition' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'career', label: 'Placement/Career' },
  { value: 'club', label: 'Club Activity' },
  { value: 'department', label: 'Department Event' },
  { value: 'other', label: 'Other' },
];

export const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEvent(id);
  const updateMutation = useUpdateEvent();
  const publishMutation = usePublishEvent();
  const aiMutation = useAICopilot();

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'workshop',
        tags: (event.tags || []).join(', '),
        event_date: event.event_date || '',
        start_time: event.start_time?.slice(0, 5) || '',
        end_time: event.end_time?.slice(0, 5) || '',
        venue: event.venue || '',
        eligibility: event.eligibility || '',
        capacity: event.capacity || '',
        benefits: event.benefits || '',
        contact_info: event.contact_info || '',
        is_free: event.is_free !== false,
        registration_link: event.registration_link || '',
      });
    }
  }, [event]);

  if (isLoading || !formData) {
    return <div className="py-12 flex justify-center"><Spinner /></div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        capacity: parseInt(formData.capacity) || null,
      };
      await updateMutation.mutateAsync({ id: event.id, data: payload });
      navigate('/organizer/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(event.id);
      navigate('/organizer/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  const improveWithAI = async () => {
    if (!formData.title) return;
    try {
      const result = await aiMutation.mutateAsync({ prompt: `${formData.title}. ${formData.description}` });
      if (result) {
        setFormData(prev => ({
          ...prev,
          description: result.description || prev.description,
          category: result.category || prev.category,
          tags: result.tags ? result.tags.join(', ') : prev.tags,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Edit Event</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {event.status === 'draft' ? 'This event is a draft.' : `Status: ${event.status}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Event title" required value={formData.title} onChange={e => update('title', e.target.value)} />

        <div className="relative">
          <Textarea label="Description" required value={formData.description} onChange={e => update('description', e.target.value)} rows={6} />
          <button
            type="button"
            onClick={improveWithAI}
            disabled={aiMutation.isPending}
            className="absolute right-2 top-8 text-xs flex items-center gap-1 bg-accent-light text-accent px-2 py-1 rounded-md font-medium hover:bg-accent/20"
          >
            <Sparkles className="h-3 w-3" />
            {aiMutation.isPending ? 'Improving...' : 'Improve with AI'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Category" value={formData.category} onChange={e => update('category', e.target.value)} options={CATEGORIES} />
          <Input label="Tags" value={formData.tags} onChange={e => update('tags', e.target.value)} placeholder="AI, ML, Beginners (comma-separated)" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Venue" required value={formData.venue} onChange={e => update('venue', e.target.value)} />
          <Input label="Capacity" type="number" value={formData.capacity} onChange={e => update('capacity', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Date" type="date" required value={formData.event_date} onChange={e => update('event_date', e.target.value)} />
          <Input label="Start time" type="time" required value={formData.start_time} onChange={e => update('start_time', e.target.value)} />
          <Input label="End time" type="time" value={formData.end_time} onChange={e => update('end_time', e.target.value)} />
        </div>

        <Textarea label="Eligibility" value={formData.eligibility} onChange={e => update('eligibility', e.target.value)} rows={2} />
        <Textarea label="Benefits" value={formData.benefits} onChange={e => update('benefits', e.target.value)} rows={2} />
        <Input label="Contact info" value={formData.contact_info} onChange={e => update('contact_info', e.target.value)} />

        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          {event.status === 'draft' && (
            <Button type="button" variant="secondary" onClick={handlePublish} loading={publishMutation.isPending}>
              Publish
            </Button>
          )}
          <Button type="submit" variant="primary" loading={updateMutation.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};
