import { Router } from "express";
import { RequestHandler } from "express";

export interface CrudHandlers {
  list: RequestHandler;
  get: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
}

export const registerCrudRoutes = (
  router: Router,
  path: string,
  handlers: CrudHandlers,
) => {
  router.get(path, handlers.list);
  router.get(`${path}/:id`, handlers.get);
  router.post(path, handlers.create);
  router.patch(`${path}/:id`, handlers.update);
  router.delete(`${path}/:id`, handlers.remove);
};
