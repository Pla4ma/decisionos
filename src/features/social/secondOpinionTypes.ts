// Second Opinion Network — Anonymous community voting
// The network effect: more users = better opinions for everyone

export interface SecondOpinionRequest {
  id: string;
  user_id: string;
  decision_id: string;
  question: string;
  options: SecondOpinionOption[];
  status: 'open' | 'closed';
  total_votes: number;
  created_at: string;
  closed_at: string | null;
}

export interface SecondOpinionOption {
  id: string;
  request_id: string;
  title: string;
  vote_count: number;
}

export interface SecondOpinionVote {
  id: string;
  request_id: string;
  voter_id: string;
  selected_option_id: string;
  created_at: string;
}

export interface PublicSecondOpinionRequest {
  id: string;
  question: string;
  options: Array<{ id: string; title: string; vote_count: number }>;
  total_votes: number;
  category: string;
}
