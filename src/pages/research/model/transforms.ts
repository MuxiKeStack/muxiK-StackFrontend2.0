import {
  translateAssessments,
  translateCourseProperty,
  translateFeatures,
} from '@/common/constants/courseLabels';
import type { SearchResultCourse } from '@/pages/research/types';

export function enhanceCourses(courses: SearchResultCourse[]): SearchResultCourse[] {
  return courses.map((course) => ({
    ...course,
    courseType: translateCourseProperty(
      (course as { type?: string; property?: string }).type ??
        (course as { property?: string }).property
    ),
    features: translateFeatures(course.features as string[]),
    assessments: translateAssessments(course.assessments),
  }));
}
