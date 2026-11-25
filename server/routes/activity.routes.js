import { crudRouter } from "./crud.router.js";
import controller from "../controllers/activity.controller.js";
import { activityStats } from "../controllers/analytics.controller.js";
import { validate } from "../middleware/validate.js";
import { activitySchema } from "../validators/resource.validator.js";
import { listQuerySchema, analyticsQuerySchema } from "../validators/common.validator.js";

export default crudRouter({
  controller,
  schema: activitySchema,
  extra: (router) => {
    router.get("/export", validate(listQuerySchema, "query"), controller.exportCsv);
    router.get("/stats", validate(analyticsQuerySchema, "query"), activityStats);
  },
});
