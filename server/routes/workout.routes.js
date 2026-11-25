import { crudRouter } from "./crud.router.js";
import controller from "../controllers/workout.controller.js";
import { workoutStats } from "../controllers/analytics.controller.js";
import { validate } from "../middleware/validate.js";
import { workoutSchema } from "../validators/resource.validator.js";
import { analyticsQuerySchema } from "../validators/common.validator.js";

export default crudRouter({
  controller,
  schema: workoutSchema,
  extra: (router) => {
    router.get("/stats", validate(analyticsQuerySchema, "query"), workoutStats);
  },
});
