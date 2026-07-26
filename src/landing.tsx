import { useEffect, useState } from "react";
import { normalizePath, type LandingPath } from "./landing/constants";
import HomePage from "./landing/HomePage";
import { PrivacyPage, SupportPage, TermsPage } from "./landing/LegalPages";
import { SiteChrome } from "./landing/SiteChrome";
import "./landing/landing.css";

function pageTitle(path: LandingPath): string {
  switch (path) {
    case "/privacy":
      return "Privacy Policy — Excellence Absolue";
    case "/terms":
      return "Terms of Service — Excellence Absolue";
    case "/support":
      return "Support — Excellence Absolue";
    default:
      return "Excellence Absolue — Effortless studying for Mac";
  }
}

/**
 * Official English marketing site (Warm Premium).
 * Served in the browser shell; Tauri desktop never mounts this tree.
 */
export default function Landing() {
  const [path, setPath] = useState<LandingPath>(() =>
    normalizePath(window.location.pathname),
  );

  useEffect(() => {
    document.documentElement.lang = "en";
    document.title = pageTitle(path);
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const prevColor = body.style.color;
    html.style.background = "#fdfdfd";
    body.style.background = "#fdfdfd";
    body.style.color = "#2a2420";
    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
      body.style.color = prevColor;
    };
  }, [path]);

  useEffect(() => {
    const onPopState = () => {
      setPath(normalizePath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  let body = <HomePage />;
  if (path === "/privacy") body = <PrivacyPage />;
  else if (path === "/terms") body = <TermsPage />;
  else if (path === "/support") body = <SupportPage />;

  return <SiteChrome>{body}</SiteChrome>;
}
