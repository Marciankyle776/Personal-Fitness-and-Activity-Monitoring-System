import { Activity } from "lucide-react";
import RecordsPage from "../components/records/RecordsPage";
import { activityService } from "../services/resources";
import { ACTIVITY_CATEGORIES } from "../utils/constants";

const config = {
  label: "Activity",
  plural: "Activities",
  description: "Everyday movement such as walks, runs and rides. For structured training sessions, use Workouts.",
  emptyMessage: "Log your first walk, run or ride to start building your history.",
  titleKey: "title",
  titleLabel: "Activity title",
  titlePlaceholder: "Morning walk",
  categories: ACTIVITY_CATEGORIES,
  service: activityService,
  exportable: true,
  icon: Activity,
};

export default function Activities() {
  return <RecordsPage config={config} />;
}
