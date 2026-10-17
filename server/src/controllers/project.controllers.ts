import { Request, Response } from "express";
import * as projectService from "../services/project.service";
import { createCrudHandlers } from "./crud.controllers";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const adminProjectController = createCrudHandlers(
  projectService.adminProjectCrudService,
);

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await projectService.listPublishedProjects(req.query);
  res.json(new ApiResponse(200, projects, "Projects retrieved successfully."));
});

export const listFeaturedProjects = asyncHandler(
  async (_req: Request, res: Response) => {
    const projects = await projectService.listFeaturedProjects();
    res.json(
      new ApiResponse(200, projects, "Featured projects retrieved successfully."),
    );
  },
);

export const getProject = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await projectService.getPublishedProject(req.params.slug);
    res.json(new ApiResponse(200, project, "Project retrieved successfully."));
  },
);
