import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Quick-add links (navbar, dashboard) go to "/page?new=1". This opens the page's create form once
// and removes the parameter so refreshing the page does not reopen it.
export default function useOpenOnNewParam(onOpen) {
  const [params, setParams] = useSearchParams();
  useEffect(() => {
    if (params.get("new")) {
      onOpen();
      setParams({}, { replace: true });
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps
}
