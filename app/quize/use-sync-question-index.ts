import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { currentIndexAtom } from "./models";

export function useSyncQuestionIndex(currentIndex: number) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initializedFromQueryRef = useRef(false);

  useEffect(() => {
    if (initializedFromQueryRef.current) {
      return;
    }
    initializedFromQueryRef.current = true;

    const q = searchParams.get("q");
    if (q !== null) {
      const index = parseInt(q, 10);
      if (!isNaN(index) && index >= 0 && index !== currentIndex) {
        currentIndexAtom.set(index);
      }
    }
  }, [currentIndex, searchParams]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q === String(currentIndex)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("q", String(currentIndex));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentIndex, pathname, router, searchParams]);
}
