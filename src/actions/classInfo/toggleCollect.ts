import { useClassInfoStore } from '@/store/classInfo';
import { useMyCollectionsStore } from '@/store/collections';

import type { CollectionProps } from '@/common/types/collectionsType';
import type { Course } from '@/common/types/commentTypes';

/** 编排：收藏切换 + 同步 collections store */
export async function toggleClassCollect(
  courseId: number,
  course: Course,
  collect: boolean
): Promise<boolean> {
  const nextCollect = await useClassInfoStore
    .getState()
    .toggleCollect(courseId, collect);

  const { id, name, teacher, composite_score, type, features } = course;
  const { addCollection, removeCollection } = useMyCollectionsStore.getState();

  if (nextCollect) {
    addCollection({
      id,
      course_id: id,
      name,
      teacher,
      composite_score,
      courseType: type,
      features: Object.keys(features || {}),
      is_collected: true,
    } as CollectionProps);
  } else {
    removeCollection(courseId);
  }

  return nextCollect;
}
