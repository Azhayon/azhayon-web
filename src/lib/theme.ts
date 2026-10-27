export type Theme = "dark" | "light";

export const THEME_COOKIE = "azm_theme";

/**
 * Runs in <head> before the first paint. It reads the theme cookie and sets data-theme on <html>.
 * The server never reads the cookie, so every page stays cacheable. The script is constant,
 * so a future Content-Security-Policy can allow it by hash.
 */
export const themeScript = `(function(){var t="dark";try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(dark|light)(?:;|$)/);if(m)t=m[1]}catch(e){}document.documentElement.dataset.theme=t})()`;

/** Call from a click handler only (it uses the browser). */
export function setThemeCookie(theme: Theme): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}