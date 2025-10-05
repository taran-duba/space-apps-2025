export type UserIllness = {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  notes: string | null;
};

export type Tables = {
  user_illnesses: UserIllness;
};
