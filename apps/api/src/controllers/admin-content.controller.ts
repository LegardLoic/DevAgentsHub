import { asyncHandler } from '../utils/async-handler';
import { adminContentService, type AdminContentService } from '../services/admin-content.service';

export class AdminContentController {
  constructor(private readonly adminContent: AdminContentService = adminContentService) {}

  listArticles = asyncHandler(async (_req, res) => {
    const articles = await this.adminContent.listArticles();

    res.status(200).json({
      data: articles,
    });
  });

  getArticle = asyncHandler(async (req, res) => {
    const article = await this.adminContent.getArticle(req.params.id as string);

    res.status(200).json({
      data: article,
    });
  });

  createArticle = asyncHandler(async (req, res) => {
    const article = await this.adminContent.createArticle(req.body);

    res.status(201).json({
      data: article,
    });
  });

  updateArticle = asyncHandler(async (req, res) => {
    const article = await this.adminContent.updateArticle(req.params.id as string, req.body);

    res.status(200).json({
      data: article,
    });
  });

  listCourses = asyncHandler(async (_req, res) => {
    const courses = await this.adminContent.listCourses();

    res.status(200).json({
      data: courses,
    });
  });

  getCourse = asyncHandler(async (req, res) => {
    const course = await this.adminContent.getCourse(req.params.id as string);

    res.status(200).json({
      data: course,
    });
  });

  createCourse = asyncHandler(async (req, res) => {
    const course = await this.adminContent.createCourse(req.body);

    res.status(201).json({
      data: course,
    });
  });

  updateCourse = asyncHandler(async (req, res) => {
    const course = await this.adminContent.updateCourse(req.params.id as string, req.body);

    res.status(200).json({
      data: course,
    });
  });

  createLesson = asyncHandler(async (req, res) => {
    const lesson = await this.adminContent.createLesson(req.params.id as string, req.body);

    res.status(201).json({
      data: lesson,
    });
  });

  updateLesson = asyncHandler(async (req, res) => {
    const lesson = await this.adminContent.updateLesson(req.params.id as string, req.body);

    res.status(200).json({
      data: lesson,
    });
  });
}

export const adminContentController = new AdminContentController();
