import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listQuerySchema } from "../validators/common.validator.js";

// Standard REST routes for a resource. `extra` registers additional routes
// BEFORE "/:id" so paths like "/export" and "/stats" are not captured as ids.
export const crudRouter = ({ controller, schema, extra }) => {
  const router = Router();
  router.use(protect);
  if (extra) extra(router);
  router.get("/", validate(listQuerySchema, "query"), controller.list);
  router.post("/", validate(schema), controller.create);
  router.get("/:id", controller.getOne);
  router.put("/:id", validate(schema), controller.update);
  router.delete("/:id", controller.remove);
  return router;
};
