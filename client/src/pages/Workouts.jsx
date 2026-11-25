import { Dumbbell } from "lucide-react";
import RecordsPage from "../components/records/RecordsPage";
import { workoutService } from "../services/resources";
import { WORKOUT_CATEGORIES } from "../utils/constants";

const config = {
  label: "Workout",
  plural: "Workouts",
  description: "Structured training sessions with their own history and statistics. Everyday movement belongs in Activities.",
  emptyMessage: "Record a session to see your workout history and statistics here.",
  titleKey: "name",
  titleLabel: "Workout name",
  titlePlaceholder: "Full body strength",
  categories: WORKOUT_CATEGORIES,
  service: workoutService,
  exportable: false,
  icon: Dumbbell,
};

export default function Workouts() {
  return <RecordsPage config={config} />;
}
