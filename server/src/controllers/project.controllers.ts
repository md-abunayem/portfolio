import {Request, Response} from "express";

import { asyncHandler } from "../utils/asyncHandler";
import * as projectService from "../services/project.sevice";
import { ApiError } from "../utils/ApiError";
import {ApiResponse} from "../utils/ApiResponse";


export const createProject = asyncHandler(async (req: Request, res: Response) => {
    const projectData = await projectService.createProject(req.body);

    res.status(201).json(new ApiResponse(
          201,
          projectData,
          "Project created successfully",
        ),)
});