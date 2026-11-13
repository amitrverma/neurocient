export type Nudge = {
  id: string;
  title: string;
  paragraphs: string[];
  quote: string | null;
  link: string | null;
  is_active: boolean;
  created_at: string;
  last_selected_on: string | null;
  selected_today: boolean;
  whatsapp_preview: string;
};

export type NudgeDraft = Pick<
  Nudge,
  "title" | "paragraphs" | "quote" | "link" | "is_active"
>;

export type NudgeResponse = {
  items: Nudge[];
  total: number;
  page: number;
  page_size: number;
  today_selection: Nudge | null;
};
