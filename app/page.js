'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { listProjects, createProject, deleteProject, migrateV1Data, setSession } from '@/lib/dataModel';
import { DEMO_DATA } from '@/lib/demoData';

export default function HomePage() {
  const router = useRouter();
  const fileRef = useRef();
  const [projects, setProjects] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setProjects(listProjects());

    // Migrate V1 data if it exists
    const v1Raw = localStorage.getItem('topout_schedule');
    if (v1Raw) {
      try {
        const v1Data = JSON.parse(v1Raw);
        if (v1Data && v1Data.phases) {
          const migrated = migrateV1Data(v1Data);
          if (migrated) setSession(migrated.id, 'gc');
          localStorage.removeItem('topout_schedule');
          setProjects(listProjects());
        }
      } catch {}
    }

    setHydrated(true);
  }, []);

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setParsing(true);
    setError(null);
    setStage('Reading PDF...');

    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(',')[1]);
        r.onerror = () => rej(new Error('Failed to read file'));
        r.readAsDataURL(file);
      });

      setStage('AI is parsing your schedule...');

      const resp = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Parse failed');
      }

      setStage('Building your dashboard...');
      const data = await resp.json();
      const project = createProject(data.projectName, data);
      setSession(project.id, 'gc');
      router.push(`/project/${project.id}`);
    } catch (err) {
      setError(err.message || 'Failed to parse schedule.');
    } finally {
      setParsing(false);
    }
  };

  const handleDemo = () => {
    const project = createProject(DEMO_DATA.projectName, DEMO_DATA);
    setSession(project.id, 'gc');
    router.push(`/project/${project.id}`);
  };

  const handleDelete = (id) => {
    deleteProject(id);
    setProjects(listProjects());
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-6 h-6 border-2 border-transparent border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If no projects and no upload flow, show landing
  const hasProjects = projects.length > 0;
  const showLanding = !hasProjects && !showUpload;

  if (showLanding) {
    return <LandingScreen onUpload={() => setShowUpload(true)} onDemo={handleDemo} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-[#0b1326] sticky top-0 z-50 flex justify-between items-center px-6 h-16 w-full">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tracking-[0.2em] text-on-surface font-headline uppercase">
            TOPOUT<span className="text-primary-container">.</span>
          </span>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="px-4 py-2 machine-gradient text-surface-container-lowest
                     font-headline font-bold text-[10px] uppercase tracking-[0.15em]
                     active:scale-95 transition-transform"
        >
          New Project
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Upload flow */}
        {showUpload && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline font-extrabold text-xl text-on-surface uppercase tracking-tight">
                New Project
              </h2>
              <button
                onClick={() => { setShowUpload(false); setError(null); }}
                className="text-secondary hover:text-on-surface transition-colors text-sm font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="bg-error-container/20 border-l-4 border-error p-3 mb-4 text-on-error-container text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div
              onClick={() => !parsing && fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`
                relative p-10 border-2 border-dashed cursor-pointer
                flex flex-col items-center justify-center transition-all duration-300
                ${dragOver ? 'border-primary-container bg-primary-container/5' : 'bg-surface-container-low border-outline-variant hover:border-primary-container'}
                ${parsing ? 'pointer-events-none opacity-80' : ''}
              `}
            >
              <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />

              {parsing ? (
                <div className="text-center animate-fade-in">
                  <div className="w-6 h-6 border-2 border-transparent border-t-primary rounded-full mx-auto mb-4 animate-spin" />
                  <div className="text-on-surface font-headline font-bold text-sm tracking-tight uppercase">{stage}</div>
                  <div className="text-secondary text-xs mt-2 opacity-60">This may take 10-15 seconds</div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 mb-4 flex items-center justify-center bg-surface-container-highest">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <h3 className="font-headline font-bold text-sm tracking-tight text-on-surface uppercase">Upload Schedule PDF</h3>
                  <p className="text-secondary text-xs mt-1 font-medium uppercase tracking-widest opacity-60">P6, MS Project, or Excel</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-outline-variant opacity-30" />
              <span className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">OR</span>
              <div className="h-px flex-1 bg-outline-variant opacity-30" />
            </div>

            <button
              onClick={handleDemo}
              disabled={parsing}
              className="w-full py-3 border border-secondary text-secondary font-bold text-sm
                         tracking-widest uppercase hover:bg-secondary hover:text-surface
                         transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              Load Demo Schedule
            </button>
          </div>
        )}

        {/* Project list */}
        {hasProjects && (
          <div>
            <h2 className="font-headline font-extrabold text-xl text-on-surface uppercase tracking-tight mb-6">
              Your Projects
            </h2>
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-surface-container-low hover:bg-surface-container-high
                             transition-colors duration-100 group cursor-pointer"
                  onClick={() => router.push(`/project/${p.id}`)}
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-2 h-full bg-primary-container flex-shrink-0 self-stretch" />
                      <div className="min-w-0">
                        <h3 className="font-headline font-bold text-sm text-on-surface tracking-tight uppercase truncate">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">
                            {p.activityCount} Activities
                          </span>
                          <span className="text-[10px] text-secondary opacity-60">
                            Updated {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this project?')) handleDelete(p.id);
                        }}
                        className="text-secondary hover:text-error transition-colors opacity-0 group-hover:opacity-100 p-1"
                        title="Delete project"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b7c8e1" strokeWidth="2" className="flex-shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Landing screen (when no projects exist)
function LandingScreen({ onUpload, onDemo }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 hero-bg relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dot-grid" />

      <header className="fixed top-0 w-full flex justify-between items-center px-8 h-20 z-50">
        <span className="text-2xl font-black tracking-[0.2em] text-on-surface font-headline uppercase">
          TOPOUT<span className="text-primary-container">.</span>
        </span>
      </header>

      <main className="w-full max-w-lg text-center relative z-10">
        <div className="w-1.5 h-1.5 bg-primary-container mx-auto mb-4" />

        <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-[-0.04em] text-on-surface leading-tight max-w-2xl mx-auto">
          Schedules that actually{' '}
          <span className="text-primary-container">make sense.</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-secondary max-w-xl mx-auto font-medium leading-relaxed opacity-80">
          Upload a PDF schedule and get a clean, role-based dashboard for owners, GCs, and subs.
        </p>

        <div className="w-full mt-8">
          <button
            onClick={onUpload}
            className="w-full relative p-12 border-2 border-dashed bg-surface-container-low
                       border-outline-variant hover:border-primary-container
                       cursor-pointer flex flex-col items-center justify-center
                       transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-primary-container opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300" />
            <div className="w-16 h-16 mb-6 flex items-center justify-center bg-surface-container-highest">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="font-headline font-bold text-lg tracking-tight text-on-surface uppercase">
              Upload Schedule PDF
            </h3>
            <p className="text-secondary text-xs mt-2 font-medium uppercase tracking-widest opacity-60">
              P6, MS Project, or Excel Exports
            </p>
          </button>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px flex-1 bg-outline-variant opacity-30" />
            <span className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">OR</span>
            <div className="h-px flex-1 bg-outline-variant opacity-30" />
          </div>

          <button
            onClick={onDemo}
            className="w-full py-4 border border-secondary text-secondary font-bold text-sm
                       tracking-widest uppercase hover:bg-secondary hover:text-surface
                       transition-colors duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Load Demo Schedule
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>

      <footer className="fixed bottom-12 w-full flex justify-center items-center gap-8 md:gap-16">
        {[
          { icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', label: 'Owner View' },
          { icon: 'M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7', label: 'GC View' },
          { icon: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', label: 'Sub View' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffc174" strokeWidth="2">
              <path d={item.icon} />
            </svg>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.15em]">{item.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}
