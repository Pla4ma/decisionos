// Decision Partner Types — Lightweight social sharing
export type PartnerStatus = 'pending' | 'viewed' | 'responded' | 'expired';

export interface DecisionPartner {
  id: string;
  decision_id: string;
  owner_id: string;
  partner_id: string | null;
  share_token: string;
  partner_label: string | null;
  partner_input: string | null;
  partner_voted_option_id: string | null;
  status: PartnerStatus;
  created_at: string;
  responded_at: string | null;
  expires_at: string;
}
