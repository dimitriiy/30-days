"use client";

import { QuizButton, QuizHeader, QuizScreen } from "../components";
import { useEffect, useMemo, useState } from "react";

type Team = {
  id: string;
  name: string;
  score: number;
};

type ResultsMode = "edit" | "view";

type ResultsState = {
  teams: Team[];
  mode: ResultsMode;
};

const STORAGE_KEY = "quize-results-state-v1";

const createTeam = (name: string): Team => ({
  id: crypto.randomUUID(),
  name: name.trim(),
  score: 0,
});

const parseStorageState = (value: string | null): ResultsState | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<ResultsState>;
    const teams = Array.isArray(parsed.teams)
      ? parsed.teams
          .filter(
            (item): item is Team =>
              typeof item?.id === "string" &&
              typeof item?.name === "string" &&
              typeof item?.score === "number",
          )
          .map((item) => ({
            id: item.id,
            name: item.name.trim(),
            score: item.score,
          }))
          .filter((item) => item.name.length > 0)
      : [];

    const mode: ResultsMode = parsed.mode === "view" ? "view" : "edit";

    return { teams, mode };
  } catch {
    return null;
  }
};

export default function QuizResultsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [mode, setMode] = useState<ResultsMode>("edit");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const parsed = parseStorageState(localStorage.getItem(STORAGE_KEY));
    if (parsed) {
      setTeams(parsed.teams);
      setMode(parsed.mode);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        teams,
        mode,
      } satisfies ResultsState),
    );
  }, [isHydrated, mode, teams]);

  const canAddTeam = useMemo(() => newTeamName.trim().length > 0, [newTeamName]);

  const addTeam = () => {
    if (!canAddTeam) {
      return;
    }

    setTeams((prev) => [...prev, createTeam(newTeamName)]);
    setNewTeamName("");
  };

  const updateScore = (teamId: string, nextScore: number) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId ? { ...team, score: Math.max(0, nextScore) } : team,
      ),
    );
  };

  return (
    <QuizScreen variant="dark" className="min-h-screen">
      <QuizHeader title="Результаты" showBack variant="dark" />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 pb-8 pt-2">
        <div className="flex items-center justify-center gap-3">
          <QuizButton
            variant={mode === "edit" ? "primary" : "outline-light"}
            size="sm"
            onClick={() => setMode("edit")}
          >
            Редактировать
          </QuizButton>
          <QuizButton
            variant={mode === "view" ? "primary" : "outline-light"}
            size="sm"
            onClick={() => setMode("view")}
          >
            Просмотр
          </QuizButton>
        </div>

        {mode === "edit" && (
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={newTeamName}
                onChange={(event) => setNewTeamName(event.target.value)}
                placeholder="Название команды"
                className="h-12 w-full rounded-full border border-white/30 bg-white/15 px-5 text-lg font-semibold text-white outline-none placeholder:text-white/60 focus:border-white/60"
              />
              <QuizButton
                variant="primary"
                size="md"
                className="h-12 px-7"
                onClick={addTeam}
                disabled={!canAddTeam}
              >
                Добавить
              </QuizButton>
            </div>
          </div>
        )}

        {teams.length === 0 && (
          <div className="mt-10 text-center text-xl font-semibold text-white/70">
            Добавьте команды, чтобы начать вести счет
          </div>
        )}

        {mode === "edit" && teams.length > 0 && (
          <div className="grid gap-3">
            {teams.map((team) => (
              <article
                key={team.id}
                className="flex items-center justify-between rounded-3xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur"
              >
                <div className="pr-3 text-xl font-extrabold uppercase tracking-wide text-white">
                  {team.name}
                </div>

                <div className="flex items-center gap-2">
                  <QuizButton
                    variant="outline-light"
                    size="sm"
                    onClick={() => updateScore(team.id, team.score - 1)}
                  >
                    -1
                  </QuizButton>
                  <span className="min-w-16 text-center text-3xl font-extrabold tabular-nums text-white">
                    {team.score}
                  </span>
                  <QuizButton
                    variant="outline-light"
                    size="sm"
                    onClick={() => updateScore(team.id, team.score + 1)}
                  >
                    +1
                  </QuizButton>
                </div>
              </article>
            ))}
          </div>
        )}

        {mode === "view" && teams.length > 0 && (
          <div className="grid gap-4">
            {teams.map((team) => (
              <article
                key={team.id}
                className="rounded-3xl border border-white/25 bg-white/10 px-6 py-7 text-center backdrop-blur"
              >
                <h3 className="text-4xl font-extrabold uppercase tracking-[0.08em] text-white sm:text-5xl">
                  {team.name}
                </h3>
                <p className="mt-3 text-6xl font-black tabular-nums text-white sm:text-7xl">
                  {team.score}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </QuizScreen>
  );
}
