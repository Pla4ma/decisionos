export interface PracticeScenario {
  id: string;
  title: string;
  context: string;
  category: string;
  options: PracticeScenarioOption[];
  source: 'ai_generated' | 'curated' | 'popular';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface PracticeScenarioOption {
  title: string;
  description: string;
  pros: string[];
  cons: string[];
}

export interface PracticeSessionResult {
  scenarioId: string;
  chosenOptionIndex: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: 'practice_001',
    title: 'Should I take the promotion?',
    context: 'You\'re offered a management role with 30% more pay but 15 more hours per week. You value work-life balance but also want career growth.',
    category: 'career',
    difficulty: 'medium',
    source: 'curated',
    tags: ['career', 'work-life-balance'],
    options: [
      { title: 'Accept the promotion', description: 'Take the management role with higher pay and responsibility', pros: ['Higher salary', 'Career advancement', 'New skills'], cons: ['Less free time', 'More stress', 'Less hands-on work'] },
      { title: 'Decline and stay', description: 'Keep your current role and work-life balance', pros: ['More personal time', 'Less stress', 'Known environment'], cons: ['Slower career growth', 'Same salary', 'Possible regret'] },
      { title: 'Negotiate a compromise', description: 'Propose a trial period or adjusted responsibilities', pros: ['Best of both worlds', 'Shows initiative', 'Flexible'], cons: ['Might not be accepted', 'Uncertain outcome', 'Could frustrate management'] },
    ],
  },
  {
    id: 'practice_002',
    title: 'Should I move to a new city?',
    context: 'You have a job offer in a city 1,000 miles away. It pays 20% more but you\'d leave your friends and family behind. The cost of living is similar.',
    category: 'moving',
    difficulty: 'medium',
    source: 'curated',
    tags: ['moving', 'life-change'],
    options: [
      { title: 'Take the leap and move', description: 'Accept the offer and relocate', pros: ['Higher income', 'New experiences', 'Career growth'], cons: ['Leave support network', 'Expensive move', 'Starting over socially'] },
      { title: 'Stay where you are', description: 'Decline and look for local opportunities', pros: ['Keep support network', 'No moving costs', 'Comfortable routine'], cons: ['Lower income ceiling', 'Missed adventure', 'Possible future regret'] },
    ],
  },
  {
    id: 'practice_003',
    title: 'Should I start a side business?',
    context: 'You have a solid full-time job and a business idea that could earn extra income. It would require 15 hours/week of evening and weekend work.',
    category: 'business',
    difficulty: 'hard',
    source: 'curated',
    tags: ['business', 'entrepreneurship'],
    options: [
      { title: 'Start the business now', description: 'Launch immediately and work on it evenings/weekends', pros: ['Extra income', 'Personal growth', 'Passion project'], cons: ['Risk of burnout', 'Less free time', 'Financial uncertainty'] },
      { title: 'Wait and plan', description: 'Spend 6 months planning and saving before launching', pros: ['Better preparation', 'Lower risk', 'More sustainable'], cons: ['Momentum lost', 'Competition may move first', 'May never start'] },
      { title: 'Start small', description: 'Dedicate 5 hours/week to validate the idea first', pros: ['Low commitment', 'Test the market', 'Learn without risk'], cons: ['Slow progress', 'Hard to gain traction', 'May lose interest'] },
    ],
  },
  {
    id: 'practice_004',
    title: 'Should I go back to school?',
    context: 'You\'re considering a master\'s degree that would cost $40,000 and take 2 years. It could increase your earning potential by 25% but you\'d lose 2 years of income.',
    category: 'school',
    difficulty: 'medium',
    source: 'curated',
    tags: ['education', 'career-change'],
    options: [
      { title: 'Enroll full-time', description: 'Quit your job and pursue the degree full-time', pros: ['Faster completion', 'Full focus', 'Better networking'], cons: ['No income for 2 years', 'Tuition cost', 'Career gap'] },
      { title: 'Study part-time', description: 'Keep working and take evening/weekend classes', pros: ['Keep income', 'Less debt', 'Apply learning immediately'], cons: ['Takes 3-4 years', 'Exhausting schedule', 'Slower career pivot'] },
      { title: 'Skip degree, learn online', description: 'Take affordable online courses instead', pros: ['Low cost', 'Flexible schedule', 'No career interruption'], cons: ['Less credential value', 'Weaker network', 'Requires self-discipline'] },
    ],
  },
  {
    id: 'practice_005',
    title: 'Should I lend money to a friend?',
    context: 'A close friend asks to borrow $2,000 to cover an emergency expense. They promise to repay in 6 months. Money is tight for you too, but you could make it work.',
    category: 'money',
    difficulty: 'hard',
    source: 'curated',
    tags: ['money', 'relationships'],
    options: [
      { title: 'Lend the full amount', description: 'Give your friend the $2,000 they need', pros: ['Helps a friend', 'Strengthens trust', 'Good karma'], cons: ['Your finances suffer', 'May strain relationship', 'Might not be repaid'] },
      { title: 'Offer a partial gift', description: 'Give $500 as a gift you can afford to lose', pros: ['Helps without risk', 'Clear boundaries', 'Protects your finances'], cons: ['Less helpful to friend', 'Friend may still struggle', 'Awkward conversation'] },
      { title: 'Help in non-financial ways', description: 'Offer to help them budget, find resources, or earn extra income', pros: ['No financial risk', 'Teaches skills', 'Preserves relationship'], cons: ['More time-consuming', 'May not solve the problem', 'Friend might feel judged'] },
    ],
  },
];

export function getRandomScenarios(count: number, excludeIds: string[] = []): PracticeScenario[] {
  const available = PRACTICE_SCENARIOS.filter(s => !excludeIds.includes(s.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getScenarioById(id: string): PracticeScenario | undefined {
  return PRACTICE_SCENARIOS.find(s => s.id === id);
}
