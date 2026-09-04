import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
  Flame,
} from 'lucide-react';
import { FallbackExecutionResult } from '../types';

interface ResilientGatewaySectionProps {
  onSaveInteraction?: (item: FallbackExecutionResult) => void;
}

export const ResilientGatewaySection: React.FC<ResilientGatewaySectionProps> = ({
  onSaveInteraction,
}) => {
  const [prompt, setPrompt] = useState(
    'Draft a production-ready security policy for an agentic AI system with direct tool access, detailing authentication, role isolation, and secret management in 3 concise sections.'
  );
  const [simulatedFaultCode, setSimulatedFaultCode] = useState<number>(0);
  const [simulatedFaultAttempts, setSimulatedFaultAttempts] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FallbackExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const LADDER_MODELS = [
    { name: 'gemini-3.1-flash-lite', role: 'Primary High-Availability', tag: 'Zero-Queue' },
    { name: 'gemini-3.7-flash', role: 'Deep Reasoning & Reflection', tag: 'High Precision' },
    { name: 'gemini-flash-latest', role: 'Dynamic Alias', tag: 'Continuous Release' },
    { name: 'gemini-3.8-flash', role: 'High Capacity Model', tag: 'Agile Flash' },
  ];

  const handleExecute = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/gemini/resilient-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          simulatedFaultCode,
          simulatedFaultAttempts,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data.result);
      if (onSaveInteraction) {
        onSaveInteraction(data.result);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-wider font-bold bg-blue-600/10 text-blue-400 border border-blue-600/20">
                Directive #6
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide uppercase">
                Resilient Gemini Model Fallback Gateway
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
              Automatic multi-tiered fallback ladder recovering gracefully from transient outages
              (503, 429, 404, 500) across 4 verified model tiers without UI downtime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#1a1a1a] text-[10px] font-mono text-neutral-300 rounded-sm border border-[#222] uppercase tracking-wider">
              4-Tier Ladder Architecture
            </span>
          </div>
        </div>
      </div>

      {/* Model Ladder Visualizer Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {LADDER_MODELS.map((model, idx) => {
          const isSuccessful = result?.successfulModel.includes(model.name);
          const wasAttempted = result?.attempts?.some((a) => a.model === model.name);
          const failedAttempt = result?.attempts?.find(
            (a) => a.model === model.name && a.status.startsWith('FAILED')
          );

          return (
            <div
              key={model.name}
              className={`p-3 rounded-sm border transition-colors ${
                isSuccessful
                  ? 'bg-blue-600/10 border-blue-500'
                  : failedAttempt
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : wasAttempted
                  ? 'bg-[#1a1a1a] border-neutral-700'
                  : 'bg-[#0f0f0f] border-[#222]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-[#1a1a1a] text-neutral-400 border border-[#222]">
                  STEP {idx + 1}
                </span>
                {isSuccessful && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-green-500/10 text-green-400 border border-green-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Active Response</span>
                  </span>
                )}
                {failedAttempt && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{failedAttempt.httpCode || 'Fail'} Cascaded</span>
                  </span>
                )}
              </div>

              <div className="font-mono font-bold text-xs text-neutral-200">{model.name}</div>
              <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">{model.role}</div>
              <div className="text-[10px] font-mono text-blue-400/80 mt-1.5">{model.tag}</div>
            </div>
          );
        })}
      </div>

      {/* Main Execution Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Configuration & Fault Injection */}
        <div className="lg:col-span-5 bg-[#0f0f0f] border border-[#222] rounded-sm p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
              Generation Prompt
            </label>
            <textarea
              id="resilient-prompt-input"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm p-2.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              placeholder="Enter your prompt..."
            />
          </div>

          {/* Fault Injection Simulation Controls */}
          <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Fault Injection Simulation</span>
              </label>
              <span className="text-[9px] font-mono text-neutral-500 uppercase">Directive #6</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Simulate transient status codes on the primary model to witness the automatic fallback cascade.
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                id="fault-btn-none"
                onClick={() => setSimulatedFaultCode(0)}
                className={`p-2 rounded-sm text-xs font-mono border transition-colors ${
                  simulatedFaultCode === 0
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                    : 'bg-[#141414] border-[#222] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                No Fault (Direct)
              </button>

              <button
                id="fault-btn-503"
                onClick={() => {
                  setSimulatedFaultCode(503);
                  setSimulatedFaultAttempts(1);
                }}
                className={`p-2 rounded-sm text-xs font-mono border transition-colors ${
                  simulatedFaultCode === 503 && simulatedFaultAttempts === 1
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                    : 'bg-[#141414] border-[#222] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Simulate 503 Fail
              </button>

              <button
                id="fault-btn-429"
                onClick={() => {
                  setSimulatedFaultCode(429);
                  setSimulatedFaultAttempts(1);
                }}
                className={`p-2 rounded-sm text-xs font-mono border transition-colors ${
                  simulatedFaultCode === 429
                    ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                    : 'bg-[#141414] border-[#222] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Simulate 429 Rate Limit
              </button>

              <button
                id="fault-btn-multi"
                onClick={() => {
                  setSimulatedFaultCode(503);
                  setSimulatedFaultAttempts(2);
                }}
                className={`p-2 rounded-sm text-xs font-mono border transition-colors ${
                  simulatedFaultCode === 503 && simulatedFaultAttempts === 2
                    ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                    : 'bg-[#141414] border-[#222] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Simulate 2 Faults
              </button>
            </div>
          </div>

          <button
            id="btn-execute-resilient-gen"
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-sm text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Ladder Gateway...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Run Resilient Gateway</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-sm text-xs font-mono text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right: Telemetry Waterfall & Output */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <div className="h-full min-h-[350px] bg-[#0f0f0f] border border-dashed border-[#222] rounded-sm flex flex-col items-center justify-center p-8 text-center">
              <Activity className="w-10 h-10 text-neutral-600 mb-2" />
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest font-mono">
                Awaiting Gateway Execution
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mt-1">
                Trigger a generation or inject status faults (503/429) to inspect real-time attempt
                telemetry, latency waterfall, and successful recovery.
              </p>
              <button
                id="btn-quick-run-ladder"
                onClick={handleExecute}
                className="mt-4 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/5 border border-[#222] rounded-sm text-xs text-neutral-300 font-mono uppercase tracking-wider transition-colors"
              >
                Execute Default Prompt
              </button>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[350px] bg-[#0f0f0f] border border-[#222] rounded-sm flex flex-col items-center justify-center p-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <div className="text-xs font-semibold uppercase tracking-widest font-mono text-neutral-200">
                Evaluating Resilient Fallback Chain
              </div>
              <p className="text-xs text-neutral-500 max-w-sm">
                Cascading across gemini-3.1-flash-lite, gemini-3.7-flash, and higher reasoning tiers...
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Telemetry Waterfall Card */}
              <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ladder Execution Waterfall</span>
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-neutral-500">Total Latency:</span>
                    <span className="text-green-400 font-bold">{result.totalLatencyMs}ms</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {result.attempts.map((attempt, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-sm border text-xs font-mono flex items-center justify-between ${
                        attempt.status === 'SUCCESS'
                          ? 'bg-green-500/5 border-green-500/30 text-green-300'
                          : 'bg-rose-500/5 border-rose-500/30 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-sm bg-[#1a1a1a] flex items-center justify-center text-[9px] font-bold text-neutral-400 border border-[#222]">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-xs">{attempt.model}</div>
                          {attempt.errorMessage && (
                            <div className="text-[10px] text-rose-400 font-sans mt-0.5">
                              {attempt.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border ${
                            attempt.status === 'SUCCESS'
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {attempt.status}
                        </span>
                        <span className="text-[10px] text-neutral-400">{attempt.latencyMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generated Content Box */}
              <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider">
                      RESOLVED MODEL:
                    </span>
                    <span className="text-[10px] font-mono text-neutral-200 bg-[#1a1a1a] px-2 py-0.5 rounded-sm border border-[#222]">
                      {result.successfulModel}
                    </span>
                  </div>

                  <button
                    id="btn-copy-gen-output"
                    onClick={handleCopy}
                    className="px-2 py-1 bg-[#1a1a1a] hover:bg-white/5 text-neutral-300 border border-[#222] rounded-sm text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="p-3 bg-[#0a0a0a] border border-[#222] rounded-sm text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-wrap">
                  {result.response}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
