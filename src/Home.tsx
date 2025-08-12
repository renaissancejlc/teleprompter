import React, { useState, useRef, useEffect } from 'react';
// --- helpers: markdown stripping (lightweight) and duration formatting ---
function stripMarkdown(src: string): string {
  return src
    // code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // images ![alt](url)
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    // links [text](url)
    .replace(/\[[^\]]*\]\([^\)]*\)/g, ' $1 ')
    // headings, blockquotes, lists, emphasis, inline code
    .replace(/^\s{0,3}#+\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/[*_`~]/g, '')
    // tables pipes
    .replace(/\|/g, ' ')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

// --- scrolling speed model (shared by loop & estimates) ---
const MAX_PX_PER_SEC = 300; // keep in sync with loop
const K_EXP = 2.5;          // curve aggressiveness (gentle)
const BASELINE_PXPS = 12;   // visible baseline when slider > 0

function computePxPerSec(speedValue: number, fine: boolean): number {
  const normalized = Math.max(0, Math.min(1, speedValue / 10)); // 0..1
  if (normalized === 0) return 0;
  const factor = Math.expm1(K_EXP * normalized) / Math.expm1(K_EXP); // 0→1
  const variable = (MAX_PX_PER_SEC - BASELINE_PXPS) * factor;
  const pxps = BASELINE_PXPS + variable;
  return fine ? pxps * 0.5 : pxps;
}


import ReactMarkdown from 'react-markdown';
import { Globe, Linkedin, Github, Info, Instagram, ArrowLeft, Undo } from 'lucide-react';
import remarkGfm from 'remark-gfm';

function Home() {
  const [content, setContent] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [fontSize, setFontSize] = useState(2); // Default size in rem
  const [isRunning, setIsRunning] = useState(false);
  const [displayDarkMode, setDisplayDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fineControl, setFineControl] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ pathPx: 0, wordsPerPixelTotal: 0 });

  const plainText = React.useMemo(() => (isMarkdown ? stripMarkdown(content) : content), [content, isMarkdown]);

  const wordCount = React.useMemo(() => {
    const text = plainText.trim();
    if (!text) return 0;
    const words = text.match(/\b[\w'-]+\b/g);
    return words ? words.length : 0;
  }, [plainText]);

  // Unified ETA: based on current speed × length
  const etaBySpeedSec = React.useMemo(() => {
    const pxps = computePxPerSec(speed, fineControl);
    if (pxps <= 0 || layout.wordsPerPixelTotal <= 0 || wordCount === 0) return 0;
    const wordsPerSecond = pxps * layout.wordsPerPixelTotal;
    return Math.ceil(wordCount / wordsPerSecond);
  }, [speed, fineControl, layout.wordsPerPixelTotal, wordCount]);

  // Layout effect: measure scroll path and words-per-pixel-total
  useEffect(() => {
    const el = displayRef.current;
    const measure = () => {
      if (!el) {
        setLayout({ pathPx: 0, wordsPerPixelTotal: 0 });
        return;
      }
      const pathPx = Math.max(0, el.scrollHeight - el.clientHeight);
      const wordsPerPixelTotal = pathPx > 0 && wordCount > 0 ? wordCount / pathPx : 0;
      setLayout({ pathPx, wordsPerPixelTotal });
    };
    measure();
    setTimeout(measure, 0);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [content, isMarkdown, fontSize, isFullscreen, displayDarkMode, wordCount]);

  // Animation loop: simple, time-based scroll using current speed
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      const el = displayRef.current;
      if (!el || !isRunning) return;
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      const pxps = computePxPerSec(speed, fineControl);
      el.scrollTop = el.scrollTop + pxps * dt;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        setIsRunning(false);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    if (isRunning) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(raf);
  }, [isRunning, speed, fineControl]);


  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen px-8 py-10 space-y-10 font-sans tracking-wide text-black bg-gradient-to-br from-gray-200 via-gray-300 to-gray-100 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]">
<header className="border-y-4 border-black py-4 px-2 mb-8 bg-white">
  <h1 className="text-5xl font-extrabold tracking-tight uppercase leading-none">
    FreePrompt
  </h1>
  <p className="text-xs font-mono uppercase tracking-widest mt-2 text-gray-800">
    Finally, a free, simple web teleprompter.
  </p>
</header>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your script here..."
        className="w-full h-40 p-4 rounded-lg border border-gray-500 bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="mt-2 flex space-x-2">
        <button
          onClick={() => setIsMarkdown(false)}
          className={`uppercase text-xs tracking-wide border border-black px-3 py-2 transition ${
            !isMarkdown ? 'bg-black text-white' : 'bg-white/30 backdrop-blur-md hover:bg-black hover:text-white'
          }`}
        >
          Raw Text
        </button>
        <button
          onClick={() => setIsMarkdown(true)}
          className={`uppercase text-xs tracking-wide border border-black px-3 py-2 transition ${
            isMarkdown ? 'bg-black text-white' : 'bg-white/30 backdrop-blur-md hover:bg-black hover:text-white'
          }`}
        >
          Markdown
        </button>
      </div>
      <hr className="border-t-2 border-black my-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
        <div className="col-span-full grid grid-cols-1 gap-3">
          <div className="flex flex-col space-y-1">
            <label className="uppercase text-xs tracking-wide font-bold">Speed: {speed.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full bg-white/30 backdrop-blur-md border border-black cursor-pointer"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="uppercase text-xs tracking-wide font-bold">Font Size: {fontSize}rem</label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full bg-white/30 backdrop-blur-md border border-black cursor-pointer"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="fine-control"
              type="checkbox"
              checked={fineControl}
              onChange={(e) => setFineControl(e.target.checked)}
              className="h-4 w-4 border border-black cursor-pointer"
            />
            <label htmlFor="fine-control" className="uppercase text-xs tracking-wide font-bold select-none">Fine Control (½ speed)</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="text-sm uppercase tracking-wide font-bold">
              Words: {wordCount}
            </div>
            <div className="text-sm uppercase tracking-wide font-bold">
              ETA: {formatDuration(etaBySpeedSec)}
            </div>
          </div>
        </div>
        <button onClick={() => setIsRunning(true)} className="uppercase text-xs tracking-wide border border-black bg-white/30 backdrop-blur-md shadow-sm px-3 py-2 hover:bg-black hover:text-white transition">
          Start
        </button>
        <button onClick={() => setIsRunning(false)} className="uppercase text-xs tracking-wide border border-black bg-white/30 backdrop-blur-md shadow-sm px-3 py-2 hover:bg-black hover:text-white transition">
          Pause
        </button>
        <button onClick={() => (displayRef.current!.scrollTop = 0)} className="uppercase text-xs tracking-wide border border-black bg-white/30 backdrop-blur-md shadow-sm px-3 py-2 hover:bg-black hover:text-white transition">
          Reset
        </button>
        <button onClick={toggleFullScreen} className="uppercase text-xs tracking-wide border border-black bg-white/30 backdrop-blur-md shadow-sm px-3 py-2 hover:bg-black hover:text-white transition">
          Fullscreen
        </button>
        <button
          onClick={() => setDisplayDarkMode(!displayDarkMode)}
          className="uppercase text-xs tracking-wide border border-black bg-white/30 backdrop-blur-md shadow-sm px-3 py-2 hover:bg-black hover:text-white transition"
        >
          {displayDarkMode ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
      <hr className="border-t-2 border-black my-6" />
      <div
        ref={displayRef}
        style={{ fontSize: `${fontSize}rem` }}
        className={`${
          isFullscreen ? 'fixed top-0 left-0 w-full h-full z-50 overflow-y-scroll pt-16' : 'relative h-96 overflow-y-scroll'
        } border p-4 leading-loose ${displayDarkMode ? 'bg-black text-white' : 'bg-white text-black'} overflow-x-hidden`}
      >
        {isFullscreen && (
          <div className={`fixed top-0 left-0 right-0 ${displayDarkMode ? 'bg-black/90 text-white' : 'bg-white/90 text-black'} backdrop-blur-md border-b border-black flex items-center justify-between py-2 px-3 z-50`}>
            {/* Left Side: Exit Button */}
            <div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="flex items-center space-x-1 text-xs uppercase border px-2 py-1 hover:bg-black hover:text-white transition"
              >
                <Undo size={16} />
                <span>Exit Fullscreen</span>
              </button>
            </div>

            {/* Right Side: Other Controls */}
            <div className="flex flex-wrap items-center space-x-2">
              <button onClick={() => setIsRunning(true)} className="text-xs uppercase border px-2 py-1 hover:bg-black hover:text-white transition">Start</button>
              <button onClick={() => setIsRunning(false)} className="text-xs uppercase border px-2 py-1 hover:bg-black hover:text-white transition">Pause</button>
              <button onClick={() => (displayRef.current!.scrollTop = 0)} className="text-xs uppercase border px-2 py-1 hover:bg-black hover:text-white transition">Reset</button>
              <div className="flex flex-col space-y-1">
                <label className="text-xs uppercase tracking-wide font-bold">Speed: {speed.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.01"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-24 bg-white/30 backdrop-blur-md border border-black cursor-pointer"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-xs uppercase tracking-wide font-bold">Font Size: {fontSize}rem</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-24 bg-white/30 backdrop-blur-md border border-black cursor-pointer"
                />
              </div>
              <div className="text-xs uppercase tracking-wide font-bold whitespace-nowrap">
                ETA: {formatDuration(etaBySpeedSec)}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="fine-control-fs"
                  type="checkbox"
                  checked={fineControl}
                  onChange={(e) => setFineControl(e.target.checked)}
                  className="h-3.5 w-3.5 border border-black cursor-pointer"
                />
                <label htmlFor="fine-control-fs" className="text-xs uppercase tracking-wide font-bold select-none">Fine</label>
              </div>
              <button
                onClick={() => setDisplayDarkMode(!displayDarkMode)}
                className="text-xs uppercase border px-2 py-1 hover:bg-black hover:text-white transition"
              >
                {displayDarkMode ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </div>
        )}
        <div className="pt-64 pb-64 break-words">
          {isMarkdown ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            <pre className="whitespace-pre-wrap break-words overflow-x-hidden">{content}</pre>
          )}
        </div>
      </div>
      <footer className="border-t-4 border-black pt-6 mt-12 text-center uppercase tracking-wider text-sm">
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
    <a href="https://renaissancecarr.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:underline hover:text-blue-700 transition">
      <Globe size={16} />
      <span>Website</span>
    </a>
    <a href="https://www.linkedin.com/in/renaissancejlc" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:underline hover:text-blue-700 transition">
      <Linkedin size={16} />
      <span>LinkedIn</span>
    </a>
    <a href="https://github.com/renaissancejlc" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:underline hover:text-blue-700 transition">
      <Github size={16} />
      <span>GitHub</span>
    </a>
    <a href="/info" className="flex items-center space-x-2 hover:underline hover:text-blue-700 transition">
      <Info size={16} />
      <span>Info</span>
    </a>
    <a href="https://instagram.com/renaissancejlc" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 hover:underline hover:text-blue-700 transition">
      <Instagram size={16} />
      <span>Instagram</span>
    </a>
  </div>
</footer>
    </div>
  );
}

export default Home; 