export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getExampleDecisions(): string[] {
  return [
    'Should I quit my job?', 'Should I move?',
    'Should I start this business?', 'Should I choose this school?',
    'Should I make this big purchase?', 'Should I break up?',
    'Should I take this offer?', 'Should I wait or act now?',
  ];
}

export function getRecoveryGreeting(missedDays: number): string {
  if (missedDays <= 1) return 'Glad you are back.';
  if (missedDays <= 3) return 'Life happens. Let us pick up where you left off.';
  return 'No pressure. Start fresh whenever you are ready.';
}

export function getSubtitleForStage(
  hasDecisions: boolean,
  hasReviews: boolean,
  isPowerUser: boolean,
): string {
  if (!hasDecisions) return 'Think clearly before choices you might regret';
  if (!hasReviews) return 'Your decisions — pick up where you left off';
  if (!isPowerUser) return 'Your Daily Briefing';
  return 'Your Decision Intelligence Dashboard';
}