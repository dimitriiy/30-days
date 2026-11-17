import { redirect } from "next/navigation";

import { WorkoutsDashboard } from "@/features/workouts/ui/workouts-dashboard";
import { validateSession } from "@/app/api/auth/login/session";
import { getWorkouts } from "@/server/workouts/program";
import "./workouts.css";

export const metadata = { title: "30 тренировок с гантелями" };

export default async function WorkoutsPage() {
  if (!(await validateSession())) redirect("/login");
  return <WorkoutsDashboard workouts={getWorkouts()} />;
}
