import type { ExplainStyle } from "@/lib/types";

// Hand-written "explain it differently" text for the 18 seed questions.
// Keyed by exact question prompt (matches supabase/schema.sql seed data).
// This exists so the AI tutor works with zero Anthropic API calls / cost.
// AI-generated questions (source: "ai") aren't in this map — the route
// falls back to a friendly message for those instead of calling the API.
export const STATIC_EXPLANATIONS: Record<string, Record<ExplainStyle, string>> = {
  "A passage states, 'Despite the rain, the parade continued as planned.' What logical relationship does 'despite' express?":
    {
      simple:
        "'Despite' means 'even though.' It tells you something happened anyway, even when there was a reason it might not. That's the definition of contrast — two things pulling in opposite directions.",
      analogy:
        "Think of 'despite' like an umbrella in the rain — the rain (the obstacle) is still there, but it doesn't stop the person underneath. The parade happened in spite of the rain, which is exactly what contrast means: two opposing things existing side by side.",
      steps:
        "1) Find the word in question: 'despite.' 2) Ask what it's connecting — here, rain and a parade continuing. 3) Notice the rain would normally cause the parade to stop, but it didn't. 4) That gap between expectation and outcome is a contrast relationship, not cause-and-effect, time, or comparison.",
      examTrick:
        "Whenever you see 'despite,' 'although,' 'even though,' or 'in spite of,' your brain should immediately flag 'contrast.' These words are TEAS favorites for testing whether you can spot a relationship without it being spelled out directly.",
    },
  "A patient needs 750 mg of a medication. Each tablet contains 250 mg. How many tablets are needed?": {
    simple:
      "You have 750 mg total and each tablet is 250 mg. To find how many tablets that is, divide the total by the size of one tablet: 750 divided by 250 equals 3.",
    analogy:
      "It's like having $750 and wanting to know how many $250 bills that makes — you divide $750 by $250 and get 3 bills. Same math, different units.",
    steps:
      "1) Identify the total dose needed: 750 mg. 2) Identify the dose per tablet: 250 mg. 3) Divide total by per-tablet dose: 750 ÷ 250. 4) That equals 3 tablets.",
    examTrick:
      "Dosage-calculation questions almost always boil down to 'total ÷ unit size.' If you see 'how many tablets/mL/doses,' set up a division problem first before overthinking it.",
  },
  "Which organ is primarily responsible for filtering blood and producing urine?": {
    simple:
      "The kidneys are the organs that clean your blood. They pull out waste and extra water and turn it into urine.",
    analogy:
      "Think of the kidneys like a coffee filter for your blood — the blood flows through, the waste gets caught and removed, and what's left over (urine) drains out.",
    steps:
      "1) The question asks which organ filters blood and makes urine. 2) The liver processes toxins but doesn't make urine. 3) The pancreas handles digestion and blood sugar, not filtration. 4) The kidneys are the organs built specifically to filter blood and produce urine.",
    examTrick:
      "TEAS science loves to pair 'filters blood' with 'produces urine' in the same sentence — that exact combination is the kidney's signature job. Memorize that pairing and you'll catch this pattern instantly.",
  },
  "Choose the grammatically correct sentence:": {
    simple:
      "'Neither' means 'not one or the other' — it's talking about a single thing, so it needs a singular verb. That's why it's 'was,' not 'were.'",
    analogy:
      "Treat 'neither' like the word 'one' — you wouldn't say 'one of the nurses were late,' so you don't say 'neither of the nurses were late' either.",
    steps:
      "1) Find the subject: 'neither.' 2) Remember neither/either are always singular, no matter how many nouns follow them. 3) Match it to a singular verb: 'was.' 4) 'Neither of the nurses was late' is correct.",
    examTrick:
      "Watch for 'neither,' 'either,' 'each,' and 'every' — TEAS loves hiding a plural-looking noun right next to them to bait you into a plural verb. These words are always singular.",
  },
  "What is the main idea of a passage that opens with a topic sentence, follows with three supporting examples, and closes by restating the topic sentence in different words?":
    {
      simple:
        "The first sentence tells you the big idea. The examples after it are just there to back that idea up, and the ending repeats it in new words to remind you what the passage was really about.",
      analogy:
        "It's like a sandwich: the topic sentence is the top slice of bread (the idea), the examples are the filling (the proof), and the closing sentence is the bottom slice of bread — same idea, wrapping it back up.",
      steps:
        "1) Identify where the main idea usually lives: the topic sentence. 2) Recognize that supporting examples exist to prove that idea, not replace it. 3) Notice the closing sentence restates the same idea in different words. 4) The main idea is the topic sentence, reinforced by everything else.",
      examTrick:
        "When a passage 'bookends' itself — same idea at the start and end, with examples in between — that structure is a giant flag pointing straight at the main idea. Don't get distracted picking one of the examples instead.",
    },
  "A nurse reads, 'The patient winced and pulled her arm away as the needle approached.' What can the reader infer?":
    {
      simple:
        "The passage never says 'the patient is in pain,' but wincing and pulling away are things people do when they expect something to hurt. Putting two clues together to guess the unstated meaning is called an inference.",
      analogy:
        "It's like seeing someone flinch before you even touch a hot pan — you don't need them to say 'that will hurt,' their body already told you.",
      steps:
        "1) Note the physical actions described: wincing, pulling away. 2) Ask what those actions usually mean in real life — bracing for pain. 3) Confirm the word 'pain' is never stated directly. 4) Since you're combining clues to reach an unstated conclusion, that's an inference, and 'anticipating pain' fits best.",
      examTrick:
        "Inference questions almost never state the answer in the text — they describe an action or reaction and want you to connect it to an unwritten feeling or motive. If the exact answer word never appears in the passage, you're being tested on inference.",
    },
  "An article on hand hygiene ends with, 'So the next time you're tempted to skip washing your hands, remember: it takes twenty seconds to prevent an infection that could take weeks to treat.' What is the author's primary purpose?":
    {
      simple:
        "The passage ends by telling the reader to do something (wash their hands) and gives them a reason why. Writing that pushes the reader toward an action is meant to persuade.",
      analogy:
        "It's the same move a commercial makes — 'buy this because it saves you time and money' — except here it's 'wash your hands because it saves you from a worse outcome.'",
      steps:
        "1) Look at the ending line: it directly addresses the reader ('you'). 2) Notice it compares a small cost (20 seconds) to a bigger cost (weeks of treatment). 3) That cost-benefit comparison is a classic persuasion technique. 4) The purpose is to persuade the reader to wash their hands.",
      examTrick:
        "Any time a passage ends with a direct call to action pointed at 'you,' TEAS wants you to label the purpose as persuasive — not informative or entertaining, even if the passage includes facts.",
    },
  "In the sentence 'The technician had to placate the anxious patient before starting the procedure,' the word 'placate' most nearly means:":
    {
      simple:
        "'Placate' means to calm someone down. The sentence talks about an anxious patient who needs to be soothed before a procedure, which is exactly what 'placate' describes.",
      analogy:
        "It's like patting a nervous dog before a vet visit — you're not curing anything, you're just calming the nerves so the next step can happen.",
      steps:
        "1) Look at who needs placating: an anxious patient. 2) Notice the timing: before a procedure, meaning something needs to happen first. 3) Ask what you'd do to an anxious person before something stressful — calm them. 4) 'Placate' means to calm or soothe.",
      examTrick:
        "Vocabulary-in-context questions almost always give you a strong emotional clue word nearby — here it's 'anxious.' Match the unknown word to the emotion it's meant to fix, and you'll usually land on the right definition.",
    },
  "A recipe calls for 3/4 cup of an ingredient. If a nurse educator wants to make half of that amount for a demonstration, how much should she use?":
    {
      simple:
        "Half of a fraction just means multiplying it by 1/2. So 3/4 times 1/2 gives you 3/8 cup.",
      analogy:
        "Imagine cutting a 3/4-full glass of water exactly in half — you'd have less than half a cup left, specifically 3/8 of a cup.",
      steps:
        "1) Start with 3/4 cup. 2) 'Half of' means multiply by 1/2. 3) Multiply the numerators (3×1=3) and denominators (4×2=8). 4) That gives 3/8 cup.",
      examTrick:
        "Whenever you see 'half of a fraction,' don't try to eyeball it — multiply straight across by 1/2. Multiplying fractions is just numerator times numerator, denominator times denominator.",
    },
  "A solution contains 40 mL of medication mixed into 200 mL of saline. What percentage of the solution is medication?":
    {
      simple:
        "To find a percentage, divide the part by the whole, then move the decimal two spots to turn it into a percent. 40 divided by 200 is 0.20, which is 20%.",
      analogy:
        "It's like saying 40 out of 200 students passed a test — that's the same ratio as 20 out of 100, or 20%.",
      steps:
        "1) Identify the part: 40 mL of medication. 2) Identify the whole: 200 mL total solution. 3) Divide part by whole: 40 ÷ 200 = 0.20. 4) Convert to a percent by multiplying by 100: 20%.",
      examTrick:
        "'What percentage' questions are always part ÷ whole × 100. Make sure you're dividing the smaller amount by the total, not the other way around — that's the most common slip-up.",
    },
  "If a hospital unit maintains a nurse-to-patient ratio of 1:4, how many nurses are needed for 32 patients?": {
    simple:
      "If one nurse covers 4 patients, you just need to know how many groups of 4 fit into 32. 32 divided by 4 is 8, so you need 8 nurses.",
    analogy:
      "It's like packing 32 people into vans that each hold 4 — you'd need 8 vans. Same idea, just nurses and patients instead.",
    steps:
      "1) Set up the ratio: 1 nurse per 4 patients. 2) You have 32 patients total. 3) Divide total patients by patients-per-nurse: 32 ÷ 4. 4) That equals 8 nurses.",
    examTrick:
      "Ratio questions like '1:4' are really just division in disguise — divide the total by the second number in the ratio to find how many of the first thing you need.",
  },
  "Convert 2.5 liters to milliliters.": {
    simple:
      "There are 1,000 milliliters in every liter. So to convert liters to milliliters, multiply by 1,000: 2.5 times 1,000 is 2,500.",
    analogy:
      "Think of liters like dollars and milliliters like cents — just like $2.50 is 250 cents (×100), 2.5 liters is 2,500 mL (×1,000), just a different conversion factor.",
    steps:
      "1) Know the conversion: 1 L = 1,000 mL. 2) Start with 2.5 liters. 3) Multiply by 1,000 to convert to milliliters. 4) 2.5 × 1,000 = 2,500 mL.",
    examTrick:
      "Metric conversions on the TEAS are almost always 'multiply by 1,000' (L→mL, kg→g) or 'divide by 1,000' the other direction. Memorize that one factor and most conversion questions become instant.",
  },
  "Which cellular structure is primarily responsible for producing the energy (ATP) a cell needs?": {
    simple:
      "Mitochondria are the parts of a cell that make energy. They take in nutrients and turn them into ATP, which the cell uses as fuel.",
    analogy:
      "Mitochondria work like a power plant inside the cell — raw materials go in, usable energy (ATP) comes out.",
    steps:
      "1) The question asks what makes ATP, the cell's energy. 2) The nucleus stores DNA, not energy production. 3) Ribosomes build proteins, not ATP. 4) Mitochondria are specifically built to convert nutrients into ATP through cellular respiration.",
    examTrick:
      "Any time you see 'ATP' or 'powerhouse of the cell' in a question, the answer is mitochondria — this is one of the most repeated facts on the TEAS science section.",
  },
  "Which chamber of the heart pumps oxygenated blood out to the rest of the body?": {
    simple:
      "The left ventricle is the heart's strongest pumping chamber. Its job is to push oxygen-rich blood out to your whole body, so it needs to be powerful.",
    analogy:
      "Think of the left ventricle like the strongest pump in a sprinkler system — it has to push water (blood) the farthest distance, all the way out to the yard (your whole body), so it needs the most force.",
    steps:
      "1) The question asks which chamber sends oxygenated blood to the body. 2) The right side of the heart deals with blood going to the lungs, not the body. 3) Of the two left chambers, the atrium receives blood, while the ventricle pumps it out. 4) The left ventricle pumps oxygenated blood to the entire body.",
    examTrick:
      "Remember: right side = lungs, left side = body; atria receive, ventricles pump out. Whenever a question mentions pumping blood 'to the rest of the body,' it's pointing straight at the left ventricle.",
  },
  "A solution with a pH of 3 is best described as:": {
    simple:
      "The pH scale goes from 0 to 14. Seven is right in the middle and counts as neutral. Anything below 7, like 3, is acidic.",
    analogy:
      "Think of the pH scale like a thermometer for acidity — 7 is 'room temperature' (neutral), and the lower the number goes below that, the more 'acidic' it gets.",
    steps:
      "1) Recall the pH scale range: 0 to 14. 2) Recall that 7 is neutral. 3) Compare 3 to 7 — it's lower. 4) Values below 7 are acidic, so a pH of 3 is acidic.",
    examTrick:
      "Just memorize the three zones: below 7 = acidic, 7 = neutral, above 7 = basic. Any pH question on the TEAS is testing whether you know which side of 7 the number falls on.",
  },
  "Which sentence uses the semicolon correctly?": {
    simple:
      "A semicolon connects two complete sentences that are closely related, without needing a word like 'and.' 'I checked his pulse; it was elevated' works because both halves could stand alone as full sentences.",
    analogy:
      "Think of a semicolon like a soft pause between two related thoughts — stronger than a comma, but not a full stop like a period.",
    steps:
      "1) Find where each option puts the semicolon. 2) Check whether both sides of the semicolon are complete sentences on their own. 3) 'I checked his pulse' and 'it was elevated' both work as standalone sentences. 4) That makes the semicolon placement correct in that option.",
    examTrick:
      "The quick test for a semicolon: read what's before it and what's after it separately — if both sides could be their own complete sentence, the semicolon is used correctly.",
  },
  "Choose the correct word: 'The medication did not ___ the patient's symptoms as expected.'": {
    simple:
      "'Affect' is a verb meaning to influence or change something. Since the sentence needs an action word ('did not ___ the symptoms'), 'affect' is the right choice.",
    analogy:
      "Think 'A is for Action' — affect is almost always the verb (an action), while effect is almost always the noun (a result), like the 'effect' you see after something 'affects' it.",
    steps:
      "1) Look at the sentence structure: 'did not ___ the symptoms.' 2) That blank needs a verb, since it's describing an action. 3) 'Affect' is the verb form; 'effect' is normally the noun form. 4) 'Affect' fits the blank correctly.",
    examTrick:
      "Affect/effect mix-ups are a TEAS classic. Quick trick: affect = action (verb), effect = end result (noun). If the sentence needs a verb, go with affect.",
  },
  "Which of the following is a run-on sentence that needs to be corrected?": {
    simple:
      "A run-on sentence happens when two complete sentences are jammed together without any punctuation or connecting word. 'The patient arrived at 8 a.m. she was seen within ten minutes' does exactly that — it needs a period, comma+and, or semicolon between the two ideas.",
    analogy:
      "It's like two cars trying to merge into one lane with no signal or gap — the sentence needs some kind of separator (period, comma, semicolon) to keep the two complete thoughts from colliding.",
    steps:
      "1) Check if the sentence has two complete ideas: 'the patient arrived' and 'she was seen.' 2) Look for punctuation connecting them — there isn't any. 3) Two complete sentences with no separator is the definition of a run-on. 4) That's why this option needs correcting.",
    examTrick:
      "To spot a run-on fast, split the sentence at any suspicious gap and check if both halves could stand alone as full sentences. If they can, and there's no period, comma+conjunction, or semicolon between them, it's a run-on.",
  },
};
