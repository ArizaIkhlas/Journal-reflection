import React from 'react';
import { Shield, Sparkles, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

export type ActiveTab = 'threat_model' | 'security_review' | 'fallback_ladder' | 'readme_deploy' | 'walkthrough_tests';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  geminiActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, geminiActive }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; code: string }[] = [
    {
      id: 'threat_model',
      label: 'Agentic Threat Model',
      code: 'SEC-01',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    {
      id: 'security_review',
      label: 'Security Reviewer',
      code: 'SEC-02',
      icon: <FileCode className="w-3.5 h-3.5" />,
    },
    {
      id: 'fallback_ladder',
      label: 'Resilient Gateway',
      code: 'SEC-06',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: 'readme_deploy',
      label: 'README & Deploy',
      code: 'SEC-07',
      icon: <Terminal className="w-3.5 h-3.5" />,
    },
    {
      id: 'walkthrough_tests',
      label: 'Walkthrough Tests',
      code: 'TEST-01',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-[#222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center font-mono text-[10px] text-white font-bold">
              S
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold tracking-widest text-white uppercase">
                Production Directives <span className="text-blue-500 font-mono">v2.4.0</span>
              </span>
              <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#1a1a1a] text-neutral-400 border border-[#222] rounded-sm uppercase tracking-wider">
                Cloud Run Ready
              </span>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-600/30 shadow-none'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="text-[9px] font-mono opacity-50 hidden xl:inline">{item.code}</span>
                </button>
              );
            })}
          </nav>

          {/* Status Indicators */}
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="uppercase opacity-60">Firestore: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  geminiActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}
              />
              <span className="uppercase text-neutral-300">
                {geminiActive ? 'Gateway: Active' : 'Gateway: Heuristic'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
