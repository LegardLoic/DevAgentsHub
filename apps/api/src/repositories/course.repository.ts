import type { CourseDetail, CourseSummary, LessonDetail, LessonProgressResponse } from '@devagentshub/types';

import { prisma } from '../lib/prisma';

export class CourseRepository {
  async listPublished(): Promise<CourseSummary[]> {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return courses.map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      isPublished: course.isPublished,
      lessonsCount: course._count.lessons,
    }));
  }

  async findPublishedBySlug(slug: string, userId?: string): Promise<CourseDetail | null> {
    if (userId) {
      const course = await prisma.course.findFirst({
        where: {
          slug,
          isPublished: true,
        },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              progress: {
                where: { userId },
                take: 1,
              },
            },
          },
        },
      });

      if (!course) {
        return null;
      }

      return {
        id: course.id,
        slug: course.slug,
        title: course.title,
        description: course.description,
        isPublished: course.isPublished,
        lessonsCount: course.lessons.length,
        lessons: course.lessons.map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          order: lesson.order,
          excerpt: lesson.excerpt,
          completed: lesson.progress[0]?.completed ?? false,
          completedAt: lesson.progress[0]?.completedAt?.toISOString() ?? null,
        })),
      };
    }

    const course = await prisma.course.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!course) {
      return null;
    }

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      isPublished: course.isPublished,
      lessonsCount: course.lessons.length,
      lessons: course.lessons.map((lesson) => ({
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        order: lesson.order,
        excerpt: lesson.excerpt,
      })),
    };
  }

  async findLessonBySlug(slug: string, userId?: string): Promise<LessonDetail | null> {
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
      include: {
        course: true,
        progress: userId
          ? {
              where: { userId },
              take: 1,
            }
          : false,
      },
    });

    if (!lesson || !lesson.course.isPublished) {
      return null;
    }

    const progress = Array.isArray(lesson.progress) ? lesson.progress[0] : undefined;

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      order: lesson.order,
      content: lesson.content,
      course: {
        id: lesson.course.id,
        slug: lesson.course.slug,
        title: lesson.course.title,
      },
      progress: progress
        ? {
            completed: progress.completed,
            completedAt: progress.completedAt?.toISOString() ?? null,
          }
        : null,
    };
  }

  async findLessonRecordById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });
  }

  async saveLessonProgress(
    userId: string,
    lessonId: string,
    completed: boolean,
  ): Promise<LessonProgressResponse> {
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return {
      lessonId: progress.lessonId,
      completed: progress.completed,
      completedAt: progress.completedAt?.toISOString() ?? null,
    };
  }
}

export const courseRepository = new CourseRepository();
