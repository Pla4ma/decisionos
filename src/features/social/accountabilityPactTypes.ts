export type PactStatus = 'pending' | 'active' | 'completed' | 'broken';
export type PactVisibility = 'public' | 'partners_only' | 'private';

export interface AccountabilityPact {
  id: string;
  decision_id: string;
  owner_id: string;
  partner_id: string | null;
  partner_email: string;
  pact_type: 'share_vote' | 'shared_commitment' | 'outcome_report';
  visibility: PactVisibility;
  status: PactStatus;
  owner_committed_option_id: string | null;
  partner_voted_option_id: string | null;
  review_expected_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PactInvite {
  id: string;
  pact_id: string;
  inviter_name: string;
  decision_title: string;
  invite_token: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'declined';
}
