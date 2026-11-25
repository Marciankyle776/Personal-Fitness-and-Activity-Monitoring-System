import { useEffect } from "react";

// Keeps the browser tab and screen-reader page title in step with the visible screen.
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | FitTrack` : "FitTrack";
  }, [title]);
}
