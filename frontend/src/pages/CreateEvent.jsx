import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent, usePublishEvent, useEventConflicts } from '../api/events';
import { useOrganizations } from '../api/organizations';
import { useAICopilot } from '../api/ai';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { AlertCircle, Sparkles, X, Check } from 'lucide-react';
import { ImageUpload } from '../components/common/ImageUpload';

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

export const CreateEvent = () => {
  const navigate = useNavigate();
  const createMutation = useCreateEvent();
  const publishMutation = usePublishEvent();
  const aiMutation = useAICopilot();
  const { data: orgs } = useOrganizations();

  const [formData, setFormData] = useState({
    title: '', description: '', org_id: '', category: 'workshop',
    tags: '', event_date: '', start_time: '', end_time: '', venue: '',
    eligibility: '', registration_deadline: '', capacity: '',
    benefits: '', contact_info: '', is_free: true,
    poster_url: '', registration_link: '',
  });

  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [error, setError] = useState('');

  // Conflict detection
  const shouldCheckConflicts = formData.event_date && formData.start_time && formData.end_time && formData.venue;
  const { data: conflicts } = useEventConflicts(
    shouldCheckConflicts
      ? { event_date: formData.event_date, start_time: formData.start_time, end_time: formData.end_time, venue: formData.venue }
      : null
  );

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const orgOptions = orgs
    ? [{ value: '', label: 'Select organization' }, ...orgs.map(o => ({ value: o.id, label: o.name }))]
    : [{ value: '', label: 'Loading...' }];

  const handleCopilot = async () => {
    if (!formData.title && !formData.description) return;
    try {
      const result = await aiMutation.mutateAsync({ prompt: formData.title + '. ' + formData.description });
      if (result) setAiSuggestions(result);
    } catch {
      // AI failure is non-critical
    }
  };

  const applySuggestion = (key, value) => {
    if (key === 'tags' && Array.isArray(value)) {
      update('tags', value.join(', '));
    } else {
      update(key, value);
    }
  };

  const handleSubmit = async (action) => {
    setError('');
    if (!formData.title || !formData.org_id || !formData.event_date || !formData.start_time) {
      setError('Please fill in required fields: title, organization, date, and start time.');
      return;
    }
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };
      const newEvent = await createMutation.mutateAsync(payload);
      if (action === 'publish' && newEvent?.id) {
        await publishMutation.mutateAsync(newEvent.id);
      }
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to create event');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Create Event</h1>
        <p className="mt-1 text-sm text-text-secondary">Fill in the details to create a new event.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-error">{error}</div>
      )}

      {/* Conflict warning */}
      {conflicts && conflicts.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning">Venue conflict detected</p>
            <ul className="mt-1 text-sm text-yellow-800 list-disc pl-4">
              {conflicts.map(c => (
                <li key={c.id}>{c.title} ({c.start_time} – {c.end_time})</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <Input label="Event title *" value={formData.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Introduction to Machine Learning" />

        {/* Description + AI Copilot */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-text-primary">Description</label>
            <button
              type="button"
              onClick={handleCopilot}
              disabled={aiMutation.isPending}
              className="text-xs flex items-center gap-1 bg-accent-light text-accent px-2.5 py-1 rounded-md font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {aiMutation.isPending ? 'Generating...' : '✦ Improve with AI'}
            </button>
          </div>
          <textarea
            value={formData.description}
            onChange={e => update('description', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            placeholder="Describe the event..."
          />
        </div>

        {/* AI Suggestions panel */}
        {aiSuggestions && (
          <div className="border border-accent/30 bg-accent-light/50 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-accent flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Suggestions
              </h3>
              <button onClick={() => setAiSuggestions(null)} className="text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            {aiSuggestions.description && (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-text-muted uppercase mb-1">Description</p>
                  <p className="text-xs text-text-secondary bg-surface p-2 rounded border border-border">{aiSuggestions.description.slice(0, 200)}...</p>
                </div>
                <button onClick={() => applySuggestion('description', aiSuggestions.description)} className="text-xs bg-accent text-white px-2 py-1 rounded-md flex items-center gap-1 flex-shrink-0">
                  <Check className="h-3 w-3" /> Apply
                </button>
              </div>
            )}
            {aiSuggestions.category && (
              <div className="flex items-center justify-between">
                <p className="text-xs"><span className="font-semibold text-text-muted">Category:</span> <span className="text-text-primary">{aiSuggestions.category}</span></p>
                <button onClick={() => applySuggestion('category', aiSuggestions.category)} className="text-xs bg-accent text-white px-2 py-1 rounded-md">Apply</button>
              </div>
            )}
            {aiSuggestions.tags && (
              <div className="flex items-center justify-between">
                <p className="text-xs"><span className="font-semibold text-text-muted">Tags:</span> <span className="text-text-primary">{Array.isArray(aiSuggestions.tags) ? aiSuggestions.tags.join(', ') : aiSuggestions.tags}</span></p>
                <button onClick={() => applySuggestion('tags', aiSuggestions.tags)} className="text-xs bg-accent text-white px-2 py-1 rounded-md">Apply</button>
              </div>
            )}
            {aiSuggestions.target_audience && (
              <p className="text-xs"><span className="font-semibold text-text-muted">Target audience:</span> <span className="text-text-primary">{aiSuggestions.target_audience}</span></p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Organization *" value={formData.org_id} onChange={e => update('org_id', e.target.value)} options={orgOptions} />
          <Select label="Category" value={formData.category} onChange={e => update('category', e.target.value)} options={CATEGORIES} />
        </div>

        <Input label="Tags" value={formData.tags} onChange={e => update('tags', e.target.value)} placeholder="AI, ML, Beginners (comma-separated)" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Date *" type="date" value={formData.event_date} onChange={e => update('event_date', e.target.value)} />
          <Input label="Start time *" type="time" value={formData.start_time} onChange={e => update('start_time', e.target.value)} />
          <Input label="End time" type="time" value={formData.end_time} onChange={e => update('end_time', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Venue *" value={formData.venue} onChange={e => update('venue', e.target.value)} placeholder="e.g. Computer Lab 1" />
          <Input label="Capacity" type="number" value={formData.capacity} onChange={e => update('capacity', e.target.value)} placeholder="Leave empty for unlimited" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Registration deadline</label>
            <input
              type="datetime-local"
              value={formData.registration_deadline}
              onChange={e => update('registration_deadline', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <Input label="Contact info" value={formData.contact_info} onChange={e => update('contact_info', e.target.value)} placeholder="email or phone" />
        </div>

        <Textarea label="Eligibility" value={formData.eligibility} onChange={e => update('eligibility', e.target.value)} rows={2} placeholder="e.g. Open to all years. Basic Python knowledge required." />
        <Textarea label="Benefits" value={formData.benefits} onChange={e => update('benefits', e.target.value)} rows={2} placeholder="e.g. Certificate · Workshop materials · Networking" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ImageUpload
            label="Event Poster / Banner"
            value={formData.poster_url}
            onChange={(url) => update('poster_url', url)}
            placeholder="Drag & drop your event poster here, or click to browse"
          />

          <Input
            label="External registration link"
            value={formData.registration_link}
            onChange={e => update('registration_link', e.target.value)}
            placeholder="https://forms.google.com/..."
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_free}
            onChange={e => update('is_free', e.target.checked)}
            className="rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm text-text-primary">This event is free to attend</span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-5 border-t border-border">
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button variant="secondary" onClick={() => handleSubmit('draft')} loading={createMutation.isPending}>
            Save as draft
          </Button>
          <Button variant="primary" onClick={() => handleSubmit('publish')} loading={createMutation.isPending || publishMutation.isPending}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};
