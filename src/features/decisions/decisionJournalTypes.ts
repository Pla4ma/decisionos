// Decision Journal — Free-form writing with AI auto-classification
// The lowest-friction creative mode. Write first, structure later.

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  word_count: number;
  sentiment: 'positive' | 'negative' | 'mixed' | 'neutral' | null;
  category_hint: string | null;
  decision_id: string | null;
  is_analyzed: boolean;
  created_at: string;
  updated_at: string;
}

export function extractDecisionFromJournal(content: string): { title: string | null; options: string[] } {
  const lines = content.split('\n').filter(l => l.trim());
  const firstLine = lines[0] || '';
  const title = firstLine.length > 150 ? firstLine.substring(0, 147) + '...' : firstLine || null;

  const options: string[] = [];
  const optionPatterns = [
    /(?:option|choice|considering)\s*(?:A|1)?[:\s]+(.+)/gi,
    /(?:vs\.?|versus|or)\s+(.+)/gi,
    /^(?:- |\* |•)\s*(.+)/gm,
  ];

  for (const pattern of optionPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const opt = match[1]?.trim();
      if (opt && opt.length > 2 && opt.length < 200) {
        options.push(opt);
      }
    }
  }

  return { title, options: [...new Set(options)].slice(0, 5) };
}
