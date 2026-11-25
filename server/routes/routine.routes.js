import { crudRouter } from "./crud.router.js";
import controller from "../controllers/routine.controller.js";
import { validate } from "../middleware/validate.js";
import { routineSchema, logRoutineSchema } from "../validators/resource.validator.js";

export default crudRouter({
  controller,
  schema: routineSchema,
  extra: (router) => {
    router.post("/:id/log", validate(logRoutineSchema), controller.logRoutine);
  },
});
