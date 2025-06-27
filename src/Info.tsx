import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Globe, Linkedin, Github, Info as InfoIcon, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

function Info() {
  const [content, setContent] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [displayDarkMode, setDisplayDarkMode] = useState(true);
  const displayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        if (displayRef.current) {
          displayRef.current.scrollTop += speed;
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isRunning, speed]);

  const toggleFullScreen = () => {
    if (displayRef.current) {
      if (!document.fullscreenElement) {
        displayRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="min-h-screen px-8 py-10 space-y-10 font-sans tracking-wide text-black bg-gradient-to-br from-gray-200 via-gray-300 to-gray-100 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]">
<header className="border-y-4 border-black py-4 px-2 mb-8 bg-white">
  <h1 className="text-5xl font-extrabold tracking-tight uppercase leading-none">
    <Link to="/" className="hover:underline">
      FreePrompt
    </Link>
  </h1>
  <p className="text-xs font-mono uppercase tracking-widest mt-2 text-gray-800">
    Finally, a free, simple web teleprompter.
  </p>
</header>

<section className="space-y-4">
  <h2 className="text-2xl font-bold uppercase tracking-wide">About Me</h2>
  <p className="text-lg">
    I'm a software engineer who loves building fun, useful, and open tools like this one. I freelance, create side projects, and enthusiastically welcome input, feedback, and feature suggestions.
  </p>
  <p className="text-lg">
    FreePrompt exists because we believe helpful tools should be accessible to everyone. No paywalls, no hassle, just free and functional.
  </p>
  <h2 className="text-2xl font-bold uppercase tracking-wide mt-6">Support This Project</h2>
  <p className="text-lg">
    If you'd like to support my work or get in touch for freelance projects, please visit my website or connect with me on LinkedIn and GitHub using the links below.
  </p>
</section>
      
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
      <InfoIcon size={16} />
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

export default Info; 