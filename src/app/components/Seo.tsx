import { useEffect } from "react";

type Props = { title: string; description: string; path: string; schema?: Record<string, unknown> | Record<string, unknown>[] };

export function Seo({ title, description, path, schema }: Props) {
  useEffect(() => {
    const canonical = `https://lemanczyk-it.pl${path === "/" ? "/" : path}`;
    document.title = title;
    document.documentElement.lang = "pl";
    const setMeta = (selector: string, attr: string, value: string) => {
      let node = document.head.querySelector<HTMLMetaElement>(selector);
      if (!node) {
        node = document.createElement("meta");
        const [name, key] = attr.split("=");
        node.setAttribute(name, key);
        document.head.appendChild(node);
      }
      node.setAttribute("content", value);
    };
    setMeta('meta[name="description"]', "name=description", description);
    setMeta('meta[property="og:title"]', "property=og:title", title);
    setMeta('meta[property="og:description"]', "property=og:description", description);
    setMeta('meta[property="og:url"]', "property=og:url", canonical);
    setMeta('meta[name="twitter:title"]', "name=twitter:title", title);
    setMeta('meta[name="twitter:description"]', "name=twitter:description", description);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.href = canonical;
    const old = document.getElementById("page-schema");
    old?.remove();
    if (schema) {
      const script = document.createElement("script");
      script.id = "page-schema";
      script.type = "application/ld+json";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }, [title, description, path, schema]);
  return null;
}
