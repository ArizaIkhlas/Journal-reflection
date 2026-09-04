import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Download,
  CheckCircle2,
  Shield,
  Key,
  Flame,
  FileCode,
  Tag,
  ExternalLink,
} from 'lucide-react';

export const ReadmeGeneratorSection: React.FC = () => {
  const [projectId, setProjectId] = useState('cloud-run-security-app');
  const [region, setRegion] = useState('asia-southeast1');
  const [serviceName, setServiceName] = useState('threat-modeling-studio');
  const [secretName, setSecretName] = useState('GEMINI_API_KEY');
  const [activeTab, setActiveTab] = useState<'full_readme' | 'firestore_rules' | 'secrets' | 'deploy'>(
    'full_readme'
  );
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchReadme = async () => {
    try {
      const response = await fetch('/api/readme/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          region,
          serviceName,
          secretName,
        }),
      });
      const data = await response.json();
      setGeneratedData(data);
    } catch (err) {
      console.error('Failed to fetch README:', err);
    }
  };

  useEffect(() => {
    fetchReadme();
  }, [projectId, region, serviceName, secretName]);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadReadme = () => {
    if (!generatedData?.readme) return;
    const blob = new Blob([generatedData.readme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-wider font-bold bg-blue-600/10 text-blue-400 border border-blue-600/20">
                Directive #7
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide uppercase">
                Cloud Run Production README & Deployment Generator
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
              Generates ready-to-run Google Cloud Run deploy scripts, Secret Manager IAM bindings,
              owner-bound Firestore security rules, and mandatory challenge verification labels.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-sm text-[10px] font-mono flex items-center gap-1.5 uppercase tracking-wider">
              <Tag className="w-3 h-3" />
              <span>dev-tutorial=cloud-run-ai-challenge</span>
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Customizer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#0f0f0f] border border-[#222] rounded-sm p-4">
        <div>
          <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
            GCP Project ID
          </label>
          <input
            id="cfg-project-id"
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
            GCP Region
          </label>
          <input
            id="cfg-region"
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
            Cloud Run Service Name
          </label>
          <input
            id="cfg-service-name"
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
            Secret Manager Key Name
          </label>
          <input
            id="cfg-secret-name"
            type="text"
            value={secretName}
            onChange={(e) => setSecretName(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0f0f0f] border border-[#222] rounded-sm overflow-hidden">
        {/* Sub-nav Tabs */}
        <div className="p-3 border-b border-[#222] bg-[#141414] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <button
              id="readme-tab-full"
              onClick={() => setActiveTab('full_readme')}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'full_readme'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Complete README.md
            </button>

            <button
              id="readme-tab-firestore"
              onClick={() => setActiveTab('firestore_rules')}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'firestore_rules'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              firestore.rules
            </button>

            <button
              id="readme-tab-secrets"
              onClick={() => setActiveTab('secrets')}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'secrets'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Secret Manager IAM
            </button>

            <button
              id="readme-tab-deploy"
              onClick={() => setActiveTab('deploy')}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors ${
                activeTab === 'deploy'
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-600/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Cloud Run Deploy CLI
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-current-view"
              onClick={() => {
                const text =
                  activeTab === 'full_readme'
                    ? generatedData?.readme
                    : activeTab === 'firestore_rules'
                    ? generatedData?.firestoreRules
                    : activeTab === 'secrets'
                    ? generatedData?.secretCommands
                    : generatedData?.deployCommands;
                copyText(text || '', activeTab);
              }}
              className="px-2 py-1 bg-[#1a1a1a] hover:bg-white/5 text-neutral-300 rounded-sm text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors border border-[#222]"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedKey === activeTab ? 'Copied' : 'Copy View'}</span>
            </button>

            <button
              id="btn-download-readme-md"
              onClick={downloadReadme}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Download README.md</span>
            </button>
          </div>
        </div>

        {/* View Body */}
        <div className="p-4">
          {activeTab === 'full_readme' && (
            <pre className="bg-[#0a0a0a] p-3.5 rounded-sm border border-[#222] text-xs font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
              {generatedData?.readme || 'Loading README...'}
            </pre>
          )}

          {activeTab === 'firestore_rules' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Owner-Bound Path Isolation (Zero Insecure Defaults)</span>
                <span className="font-mono text-blue-400 text-[10px] uppercase">Directive #3 Compliant</span>
              </div>
              <pre className="bg-[#0a0a0a] p-3.5 rounded-sm border border-[#222] text-xs font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedData?.firestoreRules || 'Loading firestore.rules...'}
              </pre>
            </div>
          )}

          {activeTab === 'secrets' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Google Cloud Secret Manager Dynamic Injection & IAM Binding</span>
                <span className="font-mono text-blue-400 text-[10px] uppercase">Directive #4 Compliant</span>
              </div>
              <pre className="bg-[#0a0a0a] p-3.5 rounded-sm border border-[#222] text-xs font-mono text-neutral-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedData?.secretCommands || 'Loading commands...'}
              </pre>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Cloud Run Deployment Command with Mandatory Campaign Label</span>
                <span className="font-mono text-neutral-400 text-[10px]">--update-labels=dev-tutorial=cloud-run-ai-challenge</span>
              </div>
              <pre className="bg-[#0a0a0a] p-3.5 rounded-sm border border-[#222] text-xs font-mono text-amber-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedData?.deployCommands || 'Loading commands...'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
