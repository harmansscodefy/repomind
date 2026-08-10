function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
      {/* Soft pink/blue color wash for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgba(249,168,212,0.10), transparent 45%), radial-gradient(circle at 75% 70%, rgba(147,197,253,0.12), transparent 45%)",
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pixelgrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pixelgrid)" />
      </svg>

      {/* Brighter, bigger, floating accent blocks */}
      <div className="absolute top-[12%] left-[10%] w-8 h-8 bg-pink-300 opacity-60 animate-pulse" />
      <div className="absolute top-[22%] right-[14%] w-6 h-6 bg-blue-300 opacity-50 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-[18%] left-[16%] w-7 h-7 bg-pink-300 opacity-45 animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-[28%] right-[18%] w-8 h-8 bg-blue-300 opacity-55 animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-[50%] left-[6%] w-5 h-5 bg-pink-300 opacity-40 animate-pulse" style={{ animationDelay: "0.3s" }} />
      <div className="absolute top-[65%] right-[9%] w-6 h-6 bg-blue-300 opacity-45 animate-pulse" style={{ animationDelay: "0.8s" }} />
      <div className="absolute top-[8%] right-[35%] w-4 h-4 bg-pink-200 opacity-35 animate-pulse" style={{ animationDelay: "1.2s" }} />
      <div className="absolute bottom-[10%] left-[38%] w-5 h-5 bg-blue-200 opacity-40 animate-pulse" style={{ animationDelay: "0.6s" }} />
    </div>
  );
}

export default BackgroundPattern;



/*function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
      <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pixelgrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pixelgrid)" />
      </svg>

      <div className="absolute top-[10%] left-[8%] w-6 h-6 bg-pink-300 opacity-30" />
      <div className="absolute top-[20%] right-[12%] w-4 h-4 bg-blue-300 opacity-25" />
      <div className="absolute bottom-[15%] left-[15%] w-5 h-5 bg-pink-300 opacity-20" />
      <div className="absolute bottom-[25%] right-[20%] w-6 h-6 bg-blue-300 opacity-30" />
      <div className="absolute top-[45%] left-[5%] w-3 h-3 bg-pink-300 opacity-25" />
      <div className="absolute top-[60%] right-[8%] w-4 h-4 bg-blue-300 opacity-20" />
    </div>
  );
}

export default BackgroundPattern;

/**function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#10b981"
              strokeWidth="0.8"
              opacity="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <g stroke="#10b981" strokeWidth="1" opacity="0.7">
          <line x1="10%" y1="15%" x2="25%" y2="30%" />
          <line x1="25%" y1="30%" x2="15%" y2="45%" />
          <line x1="80%" y1="10%" x2="65%" y2="25%" />
          <line x1="65%" y1="25%" x2="75%" y2="40%" />
          <line x1="20%" y1="70%" x2="35%" y2="80%" />
          <line x1="85%" y1="60%" x2="70%" y2="75%" />
          <line x1="70%" y1="75%" x2="80%" y2="90%" />
          <line x1="45%" y1="20%" x2="55%" y2="35%" />
          <line x1="5%" y1="60%" x2="18%" y2="70%" />
          <line x1="90%" y1="35%" x2="80%" y2="50%" />
        </g>
        <g fill="#34d399" opacity="0.9">
          <circle cx="10%" cy="15%" r="3.5" />
          <circle cx="25%" cy="30%" r="3.5" />
          <circle cx="15%" cy="45%" r="3.5" />
          <circle cx="80%" cy="10%" r="3.5" />
          <circle cx="65%" cy="25%" r="3.5" />
          <circle cx="75%" cy="40%" r="3.5" />
          <circle cx="20%" cy="70%" r="3.5" />
          <circle cx="35%" cy="80%" r="3.5" />
          <circle cx="85%" cy="60%" r="3.5" />
          <circle cx="70%" cy="75%" r="3.5" />
          <circle cx="80%" cy="90%" r="3.5" />
          <circle cx="45%" cy="20%" r="3.5" />
          <circle cx="55%" cy="35%" r="3.5" />
          <circle cx="5%" cy="60%" r="3.5" />
          <circle cx="18%" cy="70%" r="3.5" />
          <circle cx="90%" cy="35%" r="3.5" />
          <circle cx="80%" cy="50%" r="3.5" />
        </g>
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(16,185,129,0.18), transparent 65%)",
        }}
      />
    </div>
  );
}

export default BackgroundPattern;*/