-- Campus Event Platform — Demo Seed Data
-- NOTE: These users must also exist in Supabase Auth with matching UUIDs.
-- For demo purposes, create them via Supabase Auth first, then update these IDs.

-- Insert Users
INSERT INTO users (id, email, full_name, role, admission_year, branch, interests, goals, onboarding_complete) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@rit.edu', 'System Admin', 'admin', 2020, 'CSE', '["AI/ML", "Cloud", "Web Development"]'::jsonb, '["Career", "Leadership"]'::jsonb, TRUE),
('22222222-2222-2222-2222-222222222222', 'organizer@rit.edu', 'Rahul Sharma', 'organizer', 2024, 'IT', '["AI/ML", "Web Development", "Cloud"]'::jsonb, '["Build Projects", "Network"]'::jsonb, TRUE),
('33333333-3333-3333-3333-333333333333', 'arpit@rit.edu', 'Arpit Panwar', 'student', 2025, 'CSE', '["AI/ML", "Web Development", "Cybersecurity", "Data Science"]'::jsonb, '["Learn", "Compete", "Career", "Build Projects"]'::jsonb, TRUE);

-- Insert Organizations
INSERT INTO organizations (id, name, slug, type, description, is_verified, verified_at, verified_by, created_by, created_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'GDGoC RIT', 'gdgoc-rit', 'club',
 'Google Developer Groups on Campus at RIT. We organize tech talks, workshops, study jams, and hackathons focused on Google technologies and open source.',
 TRUE, NOW(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'IEEE Student Branch', 'ieee-sb', 'club',
 'The IEEE Student Branch organizes technical events, paper presentations, project exhibitions, and industry connect sessions.',
 TRUE, NOW(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'AWS Cloud Club', 'aws-cloud-club', 'club',
 'AWS Cloud Club helps students learn cloud computing through hands-on labs, certification prep sessions, and cloud architecture workshops.',
 TRUE, NOW(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Robotics Club', 'robotics-club', 'club',
 'Building robots, competing in national competitions, and learning electronics and embedded systems.',
 TRUE, NOW(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cultural Committee', 'cultural-committee', 'committee',
 'The Cultural Committee organizes the annual cultural fest, inter-college competitions, and all cultural events on campus.',
 TRUE, NOW(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW()),

('ffffffff-ffff-ffff-ffff-ffffffffffff', 'CSE Department', 'cse-dept', 'department',
 'Department of Computer Science and Engineering. Organizes guest lectures, placement drives, faculty workshops, and academic events.',
 TRUE, NOW(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NOW()),

('00000000-0000-0000-0001-000000000000', 'AI Month Committee', 'ai-month', 'committee',
 'A temporary committee formed to organize AI Month — a series of AI/ML events, workshops, and hackathons throughout October 2026.',
 TRUE, NOW(), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', NOW());

-- Assign members to orgs
INSERT INTO organization_members (org_id, user_id, role) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'admin'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'admin'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'admin'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'admin'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'admin'),
('00000000-0000-0000-0001-000000000000', '22222222-2222-2222-2222-222222222222', 'admin');

-- Insert Events (late September / October 2026)
INSERT INTO events (id, title, slug, description, org_id, created_by, category, tags, event_date, start_time, end_time, venue, eligibility, registration_deadline, capacity, benefits, contact_info, status, is_free, views_count) VALUES

('a1111111-1111-1111-1111-111111111111',
 'Intro to Machine Learning Workshop',
 'intro-to-ml-workshop',
 'A beginner-friendly workshop covering the fundamentals of machine learning. You will learn about supervised and unsupervised learning, build your first ML model using Python and scikit-learn, and understand how to evaluate model performance. No prior ML experience required — just basic Python knowledge.',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222',
 'workshop', '["AI/ML", "Machine Learning", "Python", "Beginners"]'::jsonb,
 '2026-09-28', '14:00', '16:00', 'Computer Lab 1',
 'Open to all years. Basic Python knowledge recommended.',
 '2026-09-27 23:59:00+05:30', 50,
 'Hands-on ML experience · Certificate of participation · Workshop materials',
 'gdgoc@rit.edu', 'published', TRUE, 35),

('a2222222-2222-2222-2222-222222222222',
 'Cloud Computing Fundamentals',
 'cloud-computing-fundamentals',
 'Learn the basics of cloud computing with AWS. This seminar covers EC2, S3, Lambda, and introduces cloud architecture patterns. Ideal for students looking to start their cloud journey or prepare for AWS certifications.',
 'cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222',
 'seminar', '["Cloud", "AWS", "DevOps", "Infrastructure"]'::jsonb,
 '2026-09-30', '10:00', '12:00', 'Auditorium',
 'Open to all CSE, IT, and ECE students.',
 '2026-09-29 23:59:00+05:30', 200,
 'AWS credits for attendees · Study materials · Certificate',
 'aws-club@rit.edu', 'published', TRUE, 62),

('a3333333-3333-3333-3333-333333333333',
 'CodeStorm Hackathon 2026',
 'codestorm-hackathon-2026',
 'The annual 24-hour hackathon. Build innovative solutions to real-world problems in teams of 2-4. Themes include healthcare, education, sustainability, and smart campus. Mentors from industry will be available throughout the event. Top 3 teams win prizes.',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
 'hackathon', '["Hackathon", "Coding", "Innovation", "Competition"]'::jsonb,
 '2026-10-15', '09:00', '18:00', 'Main Hall',
 'Open to all years and branches. Teams of 2-4 members.',
 '2026-10-12 23:59:00+05:30', 300,
 'Prize pool worth INR 50,000 · Certificates · Networking · Mentorship',
 'ieee@rit.edu', 'published', TRUE, 180),

('a4444444-4444-4444-4444-444444444444',
 'RoboWars Championship',
 'robowars-championship',
 'Build a combat robot and compete against other teams. Categories include lightweight and heavyweight bots. Safety gear provided. Preliminary rounds on campus, finals at the inter-college robotics fest.',
 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222',
 'competition', '["Robotics", "Electronics", "Competition", "Hardware"]'::jsonb,
 '2026-10-20', '11:00', '16:00', 'Ground Floor Arena',
 'Open to all years. Teams of 2-5 members.',
 '2026-10-18 23:59:00+05:30', 100,
 'Trophies · Cash prizes · Featured in college magazine',
 'robotics@rit.edu', 'published', TRUE, 55),

('a5555555-5555-5555-5555-555555555555',
 'Diwali Cultural Fest',
 'diwali-cultural-fest',
 'Celebrate Diwali on campus with music performances, dance competitions, food stalls, rangoli competitions, and a DJ night. Open to all students, faculty, and staff.',
 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222',
 'cultural', '["Cultural", "Music", "Dance", "Festival"]'::jsonb,
 '2026-10-25', '17:00', '22:00', 'Campus Square',
 'Open to everyone.',
 '2026-10-24 23:59:00+05:30', 1000,
 'Entertainment · Food · Prizes for competitions · Community building',
 'cultural@rit.edu', 'published', TRUE, 120),

('a6666666-6666-6666-6666-666666666666',
 'Career in AI — Industry Panel',
 'career-in-ai-panel',
 'A panel discussion featuring AI professionals from Google, Microsoft, and startups. Topics include career paths in AI, skills employers look for, internship tips, and the future of AI in India. Q&A session included.',
 '00000000-0000-0000-0001-000000000000', '22222222-2222-2222-2222-222222222222',
 'seminar', '["AI/ML", "Career", "Industry", "Panel Discussion"]'::jsonb,
 '2026-10-05', '14:00', '15:30', 'Seminar Hall A',
 'Recommended for 3rd and 4th year CSE/IT students.',
 '2026-10-04 23:59:00+05:30', 150,
 'Industry insights · Networking · Resume review opportunity',
 'aimonth@rit.edu', 'published', TRUE, 88),

('a7777777-7777-7777-7777-777777777777',
 'Guest Lecture: Advanced Database Systems',
 'guest-lecture-advanced-db',
 'Dr. Priya Mehta from IIT Delhi will discuss modern database architectures, including distributed databases, NewSQL, and the evolution from RDBMS to cloud-native databases.',
 'ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111',
 'seminar', '["Database", "Data Science", "Academic", "Guest Lecture"]'::jsonb,
 '2026-10-10', '10:00', '11:30', 'Auditorium',
 'Open to all CSE and IT students. 3rd/4th year recommended.',
 '2026-10-09 23:59:00+05:30', 250,
 'Academic knowledge · Certificate of attendance',
 'cse-dept@rit.edu', 'published', TRUE, 45),

('a8888888-8888-8888-8888-888888888888',
 'Web Development Bootcamp',
 'web-dev-bootcamp',
 'A 3-hour intensive bootcamp covering React, Node.js, and deploying to the cloud. Build a full-stack project from scratch. Bring your laptop with Node.js pre-installed.',
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222',
 'workshop', '["Web Development", "React", "Node.js", "Full Stack"]'::jsonb,
 '2026-10-08', '14:00', '17:00', 'Computer Lab 2',
 'Open to all years. Basic HTML/CSS knowledge required.',
 '2026-10-07 23:59:00+05:30', 40,
 'Full-stack project · Deployment experience · Certificate',
 'gdgoc@rit.edu', 'published', TRUE, 28),

('a9999999-9999-9999-9999-999999999999',
 'Cybersecurity CTF Challenge',
 'cybersecurity-ctf',
 'Capture The Flag competition testing your skills in cryptography, web exploitation, reverse engineering, and network security. Individual or team (max 3) participation.',
 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222',
 'competition', '["Cybersecurity", "CTF", "Security", "Competition"]'::jsonb,
 '2026-10-18', '09:00', '17:00', 'Computer Lab 3',
 'Open to all years. Basic networking knowledge recommended.',
 '2026-10-16 23:59:00+05:30', 80,
 'Prizes · Security certification discount codes · Bragging rights',
 'ieee@rit.edu', 'published', TRUE, 42),

('ab111111-1111-1111-1111-111111111111',
 'AI Month Closing Hackathon',
 'ai-month-hackathon',
 'The grand finale of AI Month. Build an AI-powered solution in 12 hours. Provided datasets and APIs. Judging based on innovation, technical complexity, and real-world applicability.',
 '00000000-0000-0000-0001-000000000000', '22222222-2222-2222-2222-222222222222',
 'hackathon', '["AI/ML", "Hackathon", "Data Science", "Innovation"]'::jsonb,
 '2026-10-30', '08:00', '20:00', 'Main Hall',
 'Open to all years. Teams of 2-4.',
 '2026-10-28 23:59:00+05:30', 200,
 'Grand prize INR 25,000 · GPU credits · Internship referrals · Certificates',
 'aimonth@rit.edu', 'published', TRUE, 95),

('ab222222-2222-2222-2222-222222222222',
 'Sports Day — Cricket Tournament',
 'sports-day-cricket',
 'Inter-department cricket tournament. Each department fields a team. Round-robin format followed by semi-finals and finals. Registration as a team (11 players + 2 substitutes).',
 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222',
 'sports', '["Sports", "Cricket", "Tournament", "Department"]'::jsonb,
 '2026-10-22', '07:00', '17:00', 'Cricket Ground',
 'Open to all. Must represent a department.',
 '2026-10-20 23:59:00+05:30', 130,
 'Trophy · Medals · Sports certificates',
 'cultural@rit.edu', 'published', TRUE, 68),

('ab333333-3333-3333-3333-333333333333',
 'Placement Preparation Workshop',
 'placement-prep-workshop',
 'Intensive session covering aptitude, DSA problem-solving strategies, and mock interview practice. Led by recently placed seniors and the placement cell.',
 'ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111',
 'seminar', '["Career", "Placement", "Interview", "DSA"]'::jsonb,
 '2026-10-12', '10:00', '13:00', 'Seminar Hall B',
 'Recommended for 3rd and 4th year students.',
 '2026-10-11 23:59:00+05:30', 100,
 'Placement tips · Mock interview practice · Resource kit',
 'cse-dept@rit.edu', 'published', TRUE, 73);

-- Insert Registrations
INSERT INTO registrations (event_id, user_id, status) VALUES
('a1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'registered'),
('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'registered'),
('a6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'registered');

-- Insert Bookmarks
INSERT INTO bookmarks (event_id, user_id) VALUES
('a2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
('ab111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'),
('a8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333');
