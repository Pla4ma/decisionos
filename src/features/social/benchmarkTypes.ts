// Benchmark Types — Anonymous social comparison
export interface AnonymousBenchmark {
  eligible: boolean;
  reviews_needed?: number;
  regret_rate?: {
    yours: number;
    median: number;
    percentile: number;
  };
  satisfaction?: {
    yours: number;
    median: number;
  };
  consistency?: {
    yours: number;
    avg: number;
  };
  total_reviewed?: number;
  peer_count?: number;
}

export interface ImprovementScore {
  ready: boolean;
  reviews_needed?: number;
  overall_score?: number;
  trend?: 'improving' | 'declining' | 'stable';
  recent_avg?: number;
  early_avg?: number;
  total_reviews?: number;
}
