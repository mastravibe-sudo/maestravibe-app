// components/ThemeScript.tsx
// Put <ThemeScript /> inside <head> of app/layout.tsx so a saved dark theme applies before first paint (no white flash).
export default function ThemeScript() {
  const code = "try{if(localStorage.getItem('mm_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}";
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}