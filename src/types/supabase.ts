export interface Database {
  public: {
    Tables: {
      daily_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_date: string;        // ISO date 'YYYY-MM-DD'
          subject_id: string;
          subject_name: string;
          subject_part: string;      // 'A' | 'B'
          completed: boolean;
          what_i_did: string | null;
          plan_for_tomorrow: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_entries']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['daily_entries']['Insert']>;
      };
      resources: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          file_url: string | null;
          link_url: string | null;
          resource_type: 'pdf' | 'link';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['resources']['Row'], 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['resources']['Insert']>;
      };
      resource_tags: {
        Row: {
          id: string;
          resource_id: string;
          tag_name: string;
        };
        Insert: Omit<Database['public']['Tables']['resource_tags']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['resource_tags']['Insert']>;
      };
    };
  };
}
