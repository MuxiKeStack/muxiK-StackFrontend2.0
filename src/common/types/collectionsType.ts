export interface CollectionProps {
  id: number;
  course_id: number;
  name: string;
  teacher: string;
  composite_score: number;
  courseType: string;
  features?: string[];
  is_collected?: boolean;
}
