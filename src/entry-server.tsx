import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./app/App";
import { SeoContext, type SeoMetadata } from "./app/components/Seo";

export function render(location: string) {
  const metadata: { current: SeoMetadata | null } = { current: null };
  const markup = renderToString(
    <SeoContext.Provider value={metadata}>
      <StaticRouter location={location}><App /></StaticRouter>
    </SeoContext.Provider>,
  );
  if (!metadata.current) throw new Error(`Missing SEO metadata for ${location}`);
  return { markup, metadata: metadata.current };
}
