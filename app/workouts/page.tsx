import { redirect } from "next/navigation";

import { WorkoutsDashboard } from "@/features/workouts/ui/workouts-dashboard";
import { validateAuth } from "@/app/api/auth/withAuth";
import { getWorkouts } from "@/server/workouts/program";
import "./workouts.css";

export const metadata = { title: "30 тренировок с гантелями" };

export default async function WorkoutsPage() {
  if ((await validateAuth()) === null) redirect("/login");
  return <WorkoutsDashboard workouts={getWorkouts()} />;
}
