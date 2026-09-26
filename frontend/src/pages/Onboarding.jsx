import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useOnboarding } from '../api/auth';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';

const BRANCHES = [
  { value: 'CSE', label: 'Computer Science' },
  { value: 'ECE', label: 'Electronics & Communication' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'EEE', label: 'Electrical Engineering' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'Other', label: 'Other' },
];

const ADMISSION_YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: String(year), label: String(year) };
});

const INTERESTS = {
  Technical: [
    'AI/ML', 'Web Development', 'App Development', 'Cybersecurity',
    'Cloud', 'DevOps', 'Data Science', 'Blockchain', 'Robotics', 'Electronics',
  ],
  'Non-technical': [
    'Design', 'Photography', 'Music', 'Dance', 'Sports',
    'Entrepreneurship', 'Debate', 'Cultural',
  ],
};

const GOALS = [
  'Learn', 'Compete', 'Network', 'Build Projects',
  'Career', 'Leadership', 'Entertainment',
];

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [admissionYear, setAdmissionYear] = useState('');
  const [branch, setBranch] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const onboarding = useOnboarding();

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleGoal = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    try {
      const res = await onboarding.mutateAsync({
        admission_year: parseInt(admissionYear),
        branch,
        interests: selectedInterests,
        goals: selectedGoals,
      });
      setUser(res.data || res);
      navigate('/');
    } catch (err) {
      console.error('Onboarding failed:', err);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Welcome to CampusConnect</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s === step
                  ? 'bg-accent text-white'
                  : s < step
                  ? 'bg-accent/20 text-accent'
                  : 'bg-gray-100 text-text-muted'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={`flex-1 h-px ${s < step ? 'bg-accent' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Academic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Academic information</h2>
          <Select
            label="Admission year"
            value={admissionYear}
            onChange={(e) => setAdmissionYear(e.target.value)}
            options={ADMISSION_YEARS}
            placeholder="Select year"
          />
          <Select
            label="Branch"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            options={BRANCHES}
            placeholder="Select branch"
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => { navigate('/'); }} className="flex-1">
              Skip
            </Button>
            <Button
              variant="primary"
              onClick={() => setStep(2)}
              className="flex-1"
              disabled={!admissionYear || !branch}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Interests */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-text-primary">What interests you?</h2>
          <p className="text-sm text-text-secondary">Select topics you're interested in. This helps us recommend relevant events.</p>

          {Object.entries(INTERESTS).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-accent-light border-accent text-accent font-medium'
                        : 'border-border text-text-secondary hover:border-gray-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button variant="primary" onClick={() => setStep(3)} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Goals */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-text-primary">What are your goals?</h2>
          <p className="text-sm text-text-secondary">What do you want to get out of campus events?</p>

          <div className="flex flex-wrap gap-2">
            {GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleGoal(goal)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  selectedGoals.includes(goal)
                    ? 'bg-accent-light border-accent text-accent font-medium'
                    : 'border-border text-text-secondary hover:border-gray-400'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              className="flex-1"
              loading={onboarding.isPending}
            >
              Get started
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
