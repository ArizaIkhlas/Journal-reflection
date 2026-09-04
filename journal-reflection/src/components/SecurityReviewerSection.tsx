import React, { useState } from 'react';
import {
  FileCode,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Sparkles,
  RefreshCw,
  GitCompare,
  Layers,
  Code2,
} from 'lucide-react';
import { SecurityReviewReport, SecurityVulnerability } from '../types';
import { SECURITY_REVIEW_TEMPLATES } from '../data/templates';

interface SecurityReviewerSectionProps {
  onSaveInteraction?: (item: SecurityReviewReport) => void;
}

export const SecurityReviewerSection: React.FC<SecurityReviewerSectionProps> = ({
  onSaveInteraction,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(SECURITY_REVIEW_TEMPLATES[0].id);
  const [targetType, setTargetType] = useState<'code' | 'prompt' | 'architecture' | 'firestore_rules'>('code');
  const [codeSnippet, setCodeSnippet] = useState(SECURITY_REVIEW_TEMPLATES[0].code);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SecurityReviewReport | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeTabDiff, setActiveTabDiff] = useState<Record<string, 'diff' | 'remediated'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTemplateChange = (templateId: string) => {
    const tmpl = SECURITY_REVIEW_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setSelectedTemplateId(tmpl.id);
      setTargetType(tmpl.targetType);
      setCodeSnippet(tmpl.code);
    }
  };

  const handleReview = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/security-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeSnippet,
          targetType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setReport(data.report);
      setTelemetry(data.telemetry);
      if (onSaveInteraction) {
        onSaveInteraction(data.report);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Failed to complete security review.');
    } finally {
      setLoading(false);
    }
  };

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-[#1a1a1a] text-neutral-400 border-[#222]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-wider font-bold bg-blue-600/10 text-blue-400 border border-blue-600/20">
                Directives #2 & #5
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide uppercase">
                OWASP & LLM Security Code Reviewer
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
              Static & dynamic analysis mapping data flow from untrusted entry points to execution sinks,
              evaluating OWASP Top 10 Web & LLM risks, and generating remediated code diffs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#1a1a1a] text-[10px] font-mono text-neutral-300 rounded-sm border border-[#222] uppercase tracking-wider">
              OWASP Top 10 (Web) & LLM01-LLM10
            </span>
          </div>
        </div>
      </div>

      {/* Input & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Code Snippet Input */}
        <div className="lg:col-span-5 bg-[#0f0f0f] border border-[#222] rounded-sm p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2">
              Sample Vulnerability Scenario
            </label>
            <div className="space-y-1.5">
              {SECURITY_REVIEW_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  id={`review-tmpl-${tmpl.id}`}
                  onClick={() => handleTemplateChange(tmpl.id)}
                  className={`w-full text-left p-2.5 rounded-sm border text-xs transition-colors ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-blue-600/10 border-blue-600/40 text-white'
                      : 'bg-[#0a0a0a] border-[#222] text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-medium text-neutral-200">{tmpl.name}</div>
                  <div className="text-[10px] text-neutral-500 font-mono mt-0.5 uppercase">
                    Type: {tmpl.targetType}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
                Target Classification
              </label>
              <select
                id="select-target-type"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
              >
                <option value="code">Backend Code (Node / Python / API)</option>
                <option value="prompt">Agent Prompt / System Instruction</option>
                <option value="firestore_rules">Firestore Security Rules</option>
                <option value="architecture">Architecture Topology</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                Source Code or Prompt Definition
              </label>
              <span className="text-[10px] font-mono text-neutral-500">
                {codeSnippet.split('\n').length} lines
              </span>
            </div>
            <textarea
              id="security-review-code-input"
              rows={11}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm p-2.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              placeholder="Paste code snippet, prompt, or firestore.rules to review..."
            />
          </div>

          <button
            id="btn-run-security-review"
            onClick={handleReview}
            disabled={loading}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-sm text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Code & Sinks...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Security Review</span>
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

        {/* Right: Review Findings & Remediation Diffs */}
        <div className="lg:col-span-7 space-y-4">
          {!report && !loading && (
            <div className="h-full min-h-[350px] bg-[#0f0f0f] border border-dashed border-[#222] rounded-sm flex flex-col items-center justify-center p-8 text-center">
              <FileCode className="w-10 h-10 text-neutral-600 mb-2" />
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest font-mono">
                Awaiting Code Review Input
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mt-1">
                Evaluate code against OWASP Web (A01-A10) and OWASP LLM (LLM01-LLM10), trace entry
                points to execution sinks, and view concrete remediation diffs.
              </p>
              <button
                id="btn-review-sample"
                onClick={handleReview}
                className="mt-4 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/5 border border-[#222] rounded-sm text-xs text-neutral-300 font-mono uppercase tracking-wider transition-colors"
              >
                Review Sample Express App
              </button>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[350px] bg-[#0f0f0f] border border-[#222] rounded-sm flex flex-col items-center justify-center p-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <div className="text-xs font-semibold uppercase tracking-widest font-mono text-neutral-200">
                Analyzing Sinks & Access Controls
              </div>
              <p className="text-xs text-neutral-500 max-w-sm">
                Tracing data flow from untrusted parameters to command sinks and generating
                production-safe code diffs...
              </p>
            </div>
          )}

          {report && !loading && (
            <div className="space-y-4">
              {/* Score & Summary Banner */}
              <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-sm uppercase tracking-wider">
                      SECURITY SCORE: {report.complianceScore}/100
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {report.vulnerabilities.length} Actionable Findings
                    </span>
                  </div>

                  {telemetry && (
                    <span className="text-[10px] font-mono text-neutral-500">
                      via {telemetry.successfulModel} ({telemetry.totalLatencyMs}ms)
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Data Flow Mapping Visualization */}
              {report.dataFlowGraph && report.dataFlowGraph.length > 0 && (
                <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 space-y-3">
                  <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Data Flow Analysis (Untrusted Entry ➔ Execution Sink)</span>
                  </h4>
                  <div className="space-y-2">
                    {report.dataFlowGraph.map((flow, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0a0a0a] border border-[#222] rounded-sm p-3 text-xs font-mono space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-blue-400 font-semibold truncate">
                            <span className="opacity-60">[Source]:</span>
                            <span>{flow.source}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold border ${
                                flow.sanitizationPresent
                                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {flow.sanitizationPresent
                                ? 'Sanitized'
                                : 'Missing Sanitization (Unsafe Sink)'}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-neutral-400 pl-2 border-l border-[#222]">
                          <span className="text-neutral-500 font-sans">Transformation:</span>{' '}
                          {flow.transformation}
                        </div>

                        <div className="flex items-center gap-1 text-rose-400 font-semibold truncate">
                          <span className="opacity-60">[Sink]:</span>
                          <span>{flow.sink}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vulnerabilities & Concrete Code Diffs */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest font-mono flex items-center gap-2">
                  <GitCompare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Severity-Ranked Findings & Remediation Diffs</span>
                </h4>

                {report.vulnerabilities.map((vuln) => {
                  const diffMode = activeTabDiff[vuln.id] || 'diff';

                  return (
                    <div
                      key={vuln.id}
                      className="bg-[#0f0f0f] border border-[#222] rounded-sm overflow-hidden"
                    >
                      {/* Vulnerability Header */}
                      <div className="p-3.5 border-b border-[#222] bg-[#141414] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold border ${getSeverityBadge(
                                vuln.severity
                              )}`}
                            >
                              {vuln.severity}
                            </span>
                            <span className="font-semibold text-xs text-neutral-100">{vuln.title}</span>
                          </div>
                          <div className="text-[10px] font-mono text-blue-400 mt-1 flex items-center gap-2">
                            <span>{vuln.owaspCategory}</span>
                            {vuln.cwe && <span className="text-neutral-500">• {vuln.cwe}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setActiveTabDiff((prev) => ({
                                ...prev,
                                [vuln.id]: prev[vuln.id] === 'remediated' ? 'diff' : 'remediated',
                              }))
                            }
                            className="px-2 py-1 bg-[#1a1a1a] hover:bg-white/5 text-neutral-300 border border-[#222] rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors"
                          >
                            {diffMode === 'diff' ? 'Remediated Only' : 'Diff Comparison'}
                          </button>
                          <button
                            id={`btn-copy-fix-${vuln.id}`}
                            onClick={() => copySnippet(vuln.remediatedCodeSnippet, vuln.id)}
                            className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-sm text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedId === vuln.id ? 'Copied' : 'Copy Fix'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Vulnerability Details */}
                      <div className="p-3.5 space-y-3 text-xs">
                        <p className="text-neutral-300 leading-relaxed">
                          {vuln.dataFlowDescription}
                        </p>

                        {/* Code Display */}
                        {diffMode === 'diff' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {/* Vulnerable Snippet */}
                            <div className="space-y-1">
                              <div className="text-[9px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Vulnerable Implementation</span>
                              </div>
                              <pre className="bg-[#0a0a0a] p-2.5 rounded-sm border border-rose-500/20 text-[11px] font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {vuln.vulnerableCodeSnippet}
                              </pre>
                            </div>

                            {/* Remediated Snippet */}
                            <div className="space-y-1">
                              <div className="text-[9px] font-mono uppercase tracking-wider text-green-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Secure Remediation</span>
                              </div>
                              <pre className="bg-[#0a0a0a] p-2.5 rounded-sm border border-green-500/20 text-[11px] font-mono text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {vuln.remediatedCodeSnippet}
                              </pre>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1">
                            <div className="text-[9px] font-mono uppercase tracking-wider text-green-400 font-bold mb-1 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Remediated Code Implementation</span>
                            </div>
                            <pre className="bg-[#0a0a0a] p-2.5 rounded-sm border border-green-500/30 text-xs font-mono text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                              {vuln.remediatedCodeSnippet}
                            </pre>
                          </div>
                        )}

                        {/* Explanation */}
                        <div className="p-2.5 bg-[#0a0a0a] border border-[#222] rounded-sm text-[11px] text-neutral-400 font-sans">
                          <span className="font-semibold text-neutral-200">Mitigation Rationale:</span>{' '}
                          {vuln.remediationExplanation}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
