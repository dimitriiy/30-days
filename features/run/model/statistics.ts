import type { TrainingItem } from "@/entities/workout/model/types";

export type WeekDay = TrainingItem | null;

export type Week = {
  weekNumber: number;
  days: WeekDay[];
};

export type WeeklyChartItem = {
  week: number;
  plannedDistance: number;
  doneDistance: number;
  doneDays: number;
};

export function groupWorkoutsByWeek(workouts: TrainingItem[]): Week[] {
  const weeks: Record<number, WeekDay[]> = {};

  workouts.forEach((workout) => {
    const weekNumber = Math.ceil(workout.day / 7);
    const indexInWeek = (workout.day - 1) % 7;

    if (!weeks[weekNumber]) {
      weeks[weekNumber] = Array(7).fill(null);
    }

    weeks[weekNumber][indexInWeek] = workout;
  });

  return Object.entries(weeks)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([weekNumber, days]) => ({
      weekNumber: Number(weekNumber),
      days,
    }));
}

export function calculateWeekProgress(week: Week, doneList: number[]): string {
  const doneSet = new Set(doneList);

  const doneDistance = week.days
    .filter((day): day is TrainingItem => {
      if (!day) return false;
      return doneSet.has(day.id);
    })
    .reduce((acc, day) => acc + day.distance, 0);

  const allDistance = week.days.reduce(
    (acc, day) => acc + (day?.distance ?? 0),
    0,
  );

  return `${doneDistance}km / ${allDistance}km`;
}

export function prepareWeeklyDistanceData(
  doneList: number[],
  weeks: Week[],
): WeeklyChartItem[] {
  const doneSet = new Set(doneList);

  return weeks.map((week) => {
    const plannedDistance = week.days.reduce(
      (sum, day) => sum + (Number(day?.distance) || 0),
      0,
    );

    const doneDaysList = week.days.filter(
      (day): day is TrainingItem => {
        if (!day) return false;
        return doneSet.has(day.id);
      },
    );

    const doneDistance = doneDaysList.reduce(
      (sum, day) => sum + (Number(day.distance) || 0),
      0,
    );

    return {
      week: week.weekNumber,
      plannedDistance: Number(plannedDistance.toFixed(3)),
      doneDistance: Number(doneDistance.toFixed(3)),
      doneDays: doneDaysList.length,
    };
  });
}

export function calculateDistanceStats(programs: TrainingItem[], done: number[]) {
  const allDistance = programs.reduce((acc, item) => acc + item.distance, 0);
  const doneSet = new Set(done);

  const doneDistance = programs
    .filter((item) => doneSet.has(item.id))
    .reduce((acc, item) => acc + item.distance, 0);

  const progress = allDistance > 0 ? Math.floor((doneDistance / allDistance) * 100) : 0;

  return {
    progress,
    allDistance,
    doneDistance,
  };
}
