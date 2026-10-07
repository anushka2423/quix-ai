"use client";

import { useEffect, useState } from "react";
import type { QuizModule } from "@/types/quiz";
import { fetchQuizModules } from "@/lib/supabase";

// Shared across pages so moving home → quiz → results doesn't refetch
let cache: Promise<QuizModule[]> | null = null;

export function useQuizModules(): { modules: QuizModule[] | null; error: boolean } {
  const [modules, setModules] = useState<QuizModule[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    cache ??= fetchQuizModules();
    cache.then(
      (m) => active && setModules(m),
      (err) => {
        console.error("Failed to load quiz modules:", err);
        cache = null;
        if (active) setError(true);
      }
    );
    return () => {
      active = false;
    };
  }, []);

  return { modules, error };
}
