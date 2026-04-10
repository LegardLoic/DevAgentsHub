import type {
  AdminArticleDetail,
  AdminArticlePayload,
  AdminArticleSummary,
  AdminCourseDetail,
  AdminCoursePayload,
  AdminCourseSummary,
  AdminLessonDetail,
  AdminLessonPayload,
} from '@devagentshub/types';

import { apiFetch, patchJson, postJson } from './api';

export const fetchAdminArticles = () => apiFetch<AdminArticleSummary[]>('/api/admin/articles');

export const fetchAdminArticle = (id: string) =>
  apiFetch<AdminArticleDetail>(`/api/admin/articles/${id}`);

export const createAdminArticle = (payload: AdminArticlePayload) =>
  postJson<AdminArticleDetail, AdminArticlePayload>('/api/admin/articles', payload);

export const updateAdminArticle = (id: string, payload: AdminArticlePayload) =>
  patchJson<AdminArticleDetail, AdminArticlePayload>(`/api/admin/articles/${id}`, payload);

export const fetchAdminCourses = () => apiFetch<AdminCourseSummary[]>('/api/admin/courses');

export const fetchAdminCourse = (id: string) =>
  apiFetch<AdminCourseDetail>(`/api/admin/courses/${id}`);

export const createAdminCourse = (payload: AdminCoursePayload) =>
  postJson<AdminCourseDetail, AdminCoursePayload>('/api/admin/courses', payload);

export const updateAdminCourse = (id: string, payload: AdminCoursePayload) =>
  patchJson<AdminCourseDetail, AdminCoursePayload>(`/api/admin/courses/${id}`, payload);

export const createAdminLesson = (courseId: string, payload: AdminLessonPayload) =>
  postJson<AdminLessonDetail, AdminLessonPayload>(`/api/admin/courses/${courseId}/lessons`, payload);

export const updateAdminLesson = (id: string, payload: AdminLessonPayload) =>
  patchJson<AdminLessonDetail, AdminLessonPayload>(`/api/admin/lessons/${id}`, payload);
