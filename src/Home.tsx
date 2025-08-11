import React, { useState, useRef, useEffect } from 'react';
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
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let last = 0;

    const loop = (t: number) => {
      if (!displayRef.current || !isRunning) return;
      if (!last) last = t;
      const dt = (t - last) / 1000; // seconds since last frame
      last = t;

      // Nonlinear speed curve: 0–10 slider → 0–300 px/sec with extra precision at the low end
      const maxPxPerSec = 300;
      const normalized = speed / 10; // 0..1
      const pxPerSec = maxPxPerSec * normalized * normalized; // quadratic easing

      const el = displayRef.current;
      const nextScroll = el.scrollTop + pxPerSec * dt;
      el.scrollTop = nextScroll;

      // Stop at bottom
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        // pause when we hit the bottom
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
  }, [isRunning, speed]);

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
            <label className="uppercase text-xs tracking-wide font-bold">Speed: {speed.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
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
                <label className="text-xs uppercase tracking-wide font-bold">Speed: {speed.toFixed(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
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