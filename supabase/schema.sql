-- =========================================================
-- Vitals — Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)
-- =========================================================

-- Question bank: shared across all users, grows via AI generation
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('Reading', 'Math', 'Science', 'English')),
  prompt text not null,
  options jsonb not null,          -- array of 4 strings
  answer int not null,             -- index 0-3
  explanation text not null,
  exam text not null default 'TEAS7',  -- lets you add NCLEX/HESI later without a new table
  source text not null default 'seed', -- 'seed' | 'ai'
  created_at timestamptz not null default now()
);

-- Per-user spaced repetition progress (Leitner box 1-5) per question
create table if not exists user_progress (
  user_id uuid references auth.users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  box int not null default 1 check (box between 1 and 5),
  last_answered_at timestamptz,
  primary key (user_id, question_id)
);

-- Per-user study plan (exam date + daily pace)
create table if not exists study_plans (
  user_id uuid primary key references auth.users(id) on delete cascade,
  exam_date date,
  exam_type text not null default 'TEAS7',
  daily_count int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now()
);

-- Timed practice test attempts (for score history / predicted score trend)
create table if not exists test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  correct int not null,
  total int not null,
  by_section jsonb not null,      -- {"Reading": {"correct": 3, "total": 4}, ...}
  created_at timestamptz not null default now()
);

-- Subscription status, synced from Stripe webhooks
create table if not exists subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'plus', 'cohort')),
  status text not null default 'inactive',   -- 'active' | 'canceled' | 'past_due' | 'inactive'
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security — users can only touch their own rows.
-- The `questions` table is readable by everyone (it's the shared bank)
-- and only writable by the server (via the service role key), never the client.
-- =========================================================

alter table questions enable row level security;
alter table user_progress enable row level security;
alter table study_plans enable row level security;
alter table test_attempts enable row level security;
alter table subscriptions enable row level security;

create policy "questions are readable by anyone"
  on questions for select
  using (true);
-- No insert/update/delete policy for questions on the client —
-- new questions are written by app/api/generate-questions using the service role key.

create policy "users manage their own progress"
  on user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage their own study plan"
  on study_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users manage their own test attempts"
  on test_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users read their own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);
-- subscriptions are written only by the Stripe webhook (service role key), never the client.

-- =========================================================
-- Seed data — same 18 questions from the prototype.
-- Run this once after creating the table.
-- =========================================================

insert into questions (section, prompt, options, answer, explanation, source) values
('Reading', 'A passage states, ''Despite the rain, the parade continued as planned.'' What logical relationship does ''despite'' express?',
 '["Cause and effect", "Contrast", "Time sequence", "Comparison"]', 1,
 '''Despite'' introduces a contrast: it signals that something happened even though a reason existed for it not to.', 'seed'),
('Math', 'A patient needs 750 mg of a medication. Each tablet contains 250 mg. How many tablets are needed?',
 '["2", "3", "4", "5"]', 1,
 'Divide the total dose by the dose per tablet: 750 ÷ 250 = 3 tablets.', 'seed'),
('Science', 'Which organ is primarily responsible for filtering blood and producing urine?',
 '["Liver", "Kidney", "Pancreas", "Spleen"]', 1,
 'The kidneys filter waste and excess fluid from the blood to produce urine.', 'seed'),
('English', 'Choose the grammatically correct sentence:',
 '["Neither of the nurses were late.", "Neither of the nurses was late.", "Neither of the nurse''s was late.", "Neither of the nurses is being late."]', 1,
 '''Neither'' is singular, so it takes a singular verb: ''was,'' not ''were.''', 'seed'),

-- Reading (4 more)
('Reading', 'What is the main idea of a passage that opens with a topic sentence, follows with three supporting examples, and closes by restating the topic sentence in different words?',
 '["The examples are more important than the topic sentence", "The main idea is stated in the topic sentence and reinforced by the examples", "The passage has no clear main idea", "The main idea changes with each example"]', 1,
 'A topic sentence states the main idea; supporting examples exist to develop and prove that idea, and a restated closing sentence reinforces it rather than introducing a new one.', 'seed'),
('Reading', 'A nurse reads, ''The patient winced and pulled her arm away as the needle approached.'' What can the reader infer?',
 '["The patient is unconscious", "The patient is anticipating pain", "The patient wants the injection", "The patient is asleep"]', 1,
 'Wincing and pulling away are physical reactions that signal anticipation of pain, even though the word ''pain'' never appears in the sentence — that is an inference, not a direct statement.', 'seed'),
('Reading', 'An article on hand hygiene ends with, ''So the next time you''re tempted to skip washing your hands, remember: it takes twenty seconds to prevent an infection that could take weeks to treat.'' What is the author''s primary purpose?',
 '["To entertain the reader with a story", "To persuade the reader to wash their hands", "To describe the history of soap", "To compare two brands of hand sanitizer"]', 1,
 'The direct call to action (''the next time you''re tempted...remember'') and the cost-benefit framing are persuasive techniques aimed at changing the reader''s behavior.', 'seed'),
('Reading', 'In the sentence ''The technician had to placate the anxious patient before starting the procedure,'' the word ''placate'' most nearly means:',
 '["Alarm", "Calm", "Examine", "Ignore"]', 1,
 'The surrounding context — an anxious patient who needs attention before a procedure can start — signals that ''placate'' means to calm or soothe someone.', 'seed'),

-- Math (4 more)
('Math', 'A recipe calls for 3/4 cup of an ingredient. If a nurse educator wants to make half of that amount for a demonstration, how much should she use?',
 '["1/4 cup", "3/8 cup", "1/2 cup", "3/4 cup"]', 1,
 'Half of 3/4 is found by multiplying: 3/4 × 1/2 = 3/8 cup.', 'seed'),
('Math', 'A solution contains 40 mL of medication mixed into 200 mL of saline. What percentage of the solution is medication?',
 '["10%", "20%", "40%", "50%"]', 1,
 'Divide the part by the whole and convert to a percentage: 40 ÷ 200 = 0.20, or 20%.', 'seed'),
('Math', 'If a hospital unit maintains a nurse-to-patient ratio of 1:4, how many nurses are needed for 32 patients?',
 '["4", "6", "8", "12"]', 1,
 'Set up the ratio as a proportion and divide: 32 patients ÷ 4 patients per nurse = 8 nurses.', 'seed'),
('Math', 'Convert 2.5 liters to milliliters.',
 '["25 mL", "250 mL", "2,500 mL", "25,000 mL"]', 2,
 'There are 1,000 milliliters in a liter, so multiply: 2.5 × 1,000 = 2,500 mL.', 'seed'),

-- Science (3 more)
('Science', 'Which cellular structure is primarily responsible for producing the energy (ATP) a cell needs?',
 '["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"]', 1,
 'Mitochondria carry out cellular respiration, converting nutrients into ATP, which is why they are often called the ''powerhouse of the cell.''', 'seed'),
('Science', 'Which chamber of the heart pumps oxygenated blood out to the rest of the body?',
 '["Right atrium", "Right ventricle", "Left atrium", "Left ventricle"]', 3,
 'The left ventricle has the thickest muscular wall of the four chambers because it must generate enough pressure to pump oxygenated blood through the entire systemic circulation.', 'seed'),
('Science', 'A solution with a pH of 3 is best described as:',
 '["Strongly basic", "Neutral", "Weakly basic", "Acidic"]', 3,
 'The pH scale runs from 0 to 14, with 7 being neutral; values below 7, like 3, are acidic, while values above 7 are basic.', 'seed'),

-- English (3 more)
('English', 'Which sentence uses the semicolon correctly?',
 '["I checked his pulse; it was elevated.", "I checked his pulse, it was elevated;", "I checked; his pulse was elevated.", "I checked his pulse it was elevated;"]', 0,
 'A semicolon correctly joins two independent clauses that are closely related in meaning, without needing a coordinating conjunction.', 'seed'),
('English', 'Choose the correct word: ''The medication did not ___ the patient''s symptoms as expected.''',
 '["affect", "effect", "affects", "effecting"]', 0,
 '''Affect'' is used as a verb meaning to influence something, while ''effect'' is normally a noun meaning a result — since a verb is needed here, ''affect'' is correct.', 'seed'),
('English', 'Which of the following is a run-on sentence that needs to be corrected?',
 '["The patient arrived at 8 a.m. she was seen within ten minutes.", "The patient arrived at 8 a.m., and she was seen within ten minutes.", "The patient arrived at 8 a.m. She was seen within ten minutes.", "Arriving at 8 a.m., the patient was seen within ten minutes."]', 0,
 'The first option joins two independent clauses with only a space and no punctuation or conjunction, creating a run-on; the others correctly separate or join the clauses.', 'seed');
