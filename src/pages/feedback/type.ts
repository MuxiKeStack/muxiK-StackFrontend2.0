export interface SheetItem {
  record_id: string;
  fields: {
    title: string;
    description: string;
    solution: string;
    resolvedStatus: 'resolved' | 'unresolved' | 'notSelected';
  };
}

export interface FeedbackItem {
  record_id: string;
  fields: {
    content: string;
    screenshots: Array<{
      file_token?: string;
      name?: string;
      size?: number;
      tmp_url?: string;
      type?: string;
      url?: string;
    }>;
    submitTime: number | string;
    userId: string;
    contact: string;
    source: string;
    status: string;
    type: string;
    reply: string;
  };
}

export interface FeedbackDetailItem {
  record_id: string;
  fields: {
    content: string;
    screenshots: Array<{ file_token: string }>;
    submitTime: string;
    contact: string;
    source: string;
    status: string;
    type: string;
    reply: string;
  };
}
