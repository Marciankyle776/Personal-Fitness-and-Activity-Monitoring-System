import { crudRouter } from "./crud.router.js";
import controller from "../controllers/goal.controller.js";
import { goalSchema } from "../validators/resource.validator.js";

export default crudRouter({ controller, schema: goalSchema });
