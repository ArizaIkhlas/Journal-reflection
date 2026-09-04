import React, { useState } from 'react';
import {
  ShieldAlert,
  Cpu,
  Wrench,
  Database,
  Globe,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Sparkles,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { ThreatModelReport, ThreatZone, ThreatItem } from '../types';
import { THREAT_MODEL_TEMPLATES } from '../data/templates';

interface ThreatModelSectionProps {
  onSaveInteraction?: (item: ThreatModelReport) => void;
}

export const ThreatModelSection: React.FC<ThreatModelSectionProps> = ({ onSaveInteraction }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(THREAT_MODEL_TEMPLATES[0].id);
  const [systemName, setSystemName] = useState(THREAT_MODEL_TEMPLATES[0].name);
  const [targetDescription, setTargetDescription] = useState(THREAT_MODEL_TEMPLATES[0].description);
  const [scenarioText, setScenarioText] = useState(THREAT_MODEL_TEMPLATES[0].scenarioText);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ThreatModelReport | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTemplateChange = (templateId: string) => {
    const tmpl = THREAT_MODEL_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setSelectedTemplateId(tmpl.id);
      setSystemName(tmpl.name);
      setTargetDescription(tmpl.description);
      setScenarioText(tmpl.scenarioText);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/threat-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemName,
          targetDescription,
          scenarioText,
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
      setErrorMsg(error.message || 'Failed to generate threat model.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const zoneMeta: Record<
    ThreatZone,
    { label: string; icon: React.ReactNode; color: string; bg: string }
  > = {
    input_surfaces: {
      label: '1. Input Surfaces',
      icon: <Globe className="w-3.5 h-3.5" />,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
    },
    planning_reasoning: {
      label: '2. Planning & Reasoning',
      icon: <Cpu className="w-3.5 h-3.5" />,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
    },
    tool_execution: {
      label: '3. Tool Execution',
      icon: <Wrench className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    memory_state: {
      label: '4. Memory & State',
      icon: <Database className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    inter_system_comm: {
      label: '5. Inter-System Comm',
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
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

  const filteredThreats = report
    ? activeZoneFilter === 'ALL'
      ? report.threats
      : report.threats.filter((t) => t.zone === activeZoneFilter)
    : [];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-wider font-bold bg-blue-600/10 text-blue-400 border border-blue-600/20">
                Directive #1
              </span>
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide uppercase">
                Agentic Threat Modeling Studio
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-3xl">
              Perform scenario-driven threat modeling mapping all 5 Threat Zones to STRIDE
              categories, DREAD severity metrics, and concrete implementation countermeasures.
            </p>
          </div>

          {/* 5-Zone Quick Legend */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(zoneMeta).map(([zoneKey, meta]) => (
              <span
                key={zoneKey}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono border ${meta.bg} ${meta.color}`}
              >
                {meta.icon}
                <span>{meta.label.split('. ')[1]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form & Template Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Input Panel */}
        <div className="lg:col-span-5 bg-[#0f0f0f] border border-[#222] rounded-sm p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2">
              Architecture Archetype
            </label>
            <div className="space-y-1.5">
              {THREAT_MODEL_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  id={`tmpl-btn-${tmpl.id}`}
                  onClick={() => handleTemplateChange(tmpl.id)}
                  className={`w-full text-left p-2.5 rounded-sm border text-xs transition-colors ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-blue-600/10 border-blue-600/40 text-white'
                      : 'bg-[#0a0a0a] border-[#222] text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <div className="font-medium text-neutral-200">{tmpl.name}</div>
                  <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5 font-mono">
                    {tmpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
              System Identifier
            </label>
            <input
              id="threat-system-name"
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 font-mono"
              placeholder="e.g. Multi-Agent Data Assistant"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-1">
              Architecture & Interaction Details
            </label>
            <textarea
              id="threat-scenario-text"
              rows={7}
              value={scenarioText}
              onChange={(e) => setScenarioText(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-sm p-2.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              placeholder="Describe user entry points, tools, database models, and external APIs..."
            />
          </div>

          <button
            id="btn-analyze-threats"
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-sm text-xs font-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Evaluating 5 Threat Zones...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Threat Analysis</span>
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

        {/* Right: Results Panel */}
        <div className="lg:col-span-7 space-y-4">
          {!report && !loading && (
            <div className="h-full min-h-[350px] bg-[#0f0f0f] border border-dashed border-[#222] rounded-sm flex flex-col items-center justify-center p-8 text-center">
              <ShieldAlert className="w-10 h-10 text-neutral-600 mb-2" />
              <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-widest font-mono">
                Awaiting Threat Modeling Input
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mt-1">
                Select an archetype or input your architecture to generate an audit across Input
                Surfaces, Planning, Tools, Memory, and Inter-System Comm.
              </p>
              <button
                id="btn-quick-sample"
                onClick={handleAnalyze}
                className="mt-4 px-3 py-1.5 bg-[#1a1a1a] hover:bg-white/5 border border-[#222] rounded-sm text-xs text-neutral-300 font-mono uppercase tracking-wider transition-colors"
              >
                Run Sample Analysis
              </button>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[350px] bg-[#0f0f0f] border border-[#222] rounded-sm flex flex-col items-center justify-center p-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <div className="text-xs font-semibold uppercase tracking-widest font-mono text-neutral-200">
                Executing Fallback Ladder Analysis
              </div>
              <p className="text-xs text-neutral-500 max-w-sm">
                Mapping threats against STRIDE categories and formulating concrete code
                countermeasures...
              </p>
            </div>
          )}

          {report && !loading && (
            <div className="space-y-4">
              {/* Executive Summary & Telemetry Banner */}
              <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400 font-semibold uppercase">
                      RISK SCORE: {report.overallRiskScore}/100
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {report.threats.length} Identified Threats
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-copy-threat-report"
                      onClick={handleCopy}
                      className="px-2 py-1 bg-[#1a1a1a] hover:bg-white/5 text-neutral-300 border border-[#222] rounded-sm text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? 'Copied' : 'JSON'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {report.executiveSummary}
                </p>

                {telemetry && (
                  <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[10px] font-mono text-neutral-500">
                    <div>Model: <span className="text-blue-400">{telemetry.successfulModel}</span></div>
                    <div>Latency: {telemetry.totalLatencyMs}ms</div>
                    <div>Attempts: {telemetry.attempts?.length || 1}</div>
                  </div>
                )}
              </div>

              {/* 5-Zone Metric Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {Object.entries(zoneMeta).map(([zoneKey, meta]) => {
                  const summary = report.zonesSummary?.[zoneKey as ThreatZone] || {
                    threatCount: 0,
                    highestSeverity: 'LOW',
                  };
                  const isSelected = activeZoneFilter === zoneKey;

                  return (
                    <button
                      key={zoneKey}
                      id={`zone-filter-${zoneKey}`}
                      onClick={() =>
                        setActiveZoneFilter(isSelected ? 'ALL' : zoneKey)
                      }
                      className={`p-2.5 rounded-sm border text-left transition-colors ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 text-white'
                          : 'bg-[#0f0f0f] border-[#222] hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={meta.color}>{meta.icon}</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded-sm font-mono font-bold border ${getSeverityBadge(
                            summary.highestSeverity
                          )}`}
                        >
                          {summary.highestSeverity}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 truncate">
                        {meta.label.split('. ')[1]}
                      </div>
                      <div className="text-xs font-mono font-bold text-neutral-200 mt-0.5">
                        {summary.threatCount} {summary.threatCount === 1 ? 'threat' : 'threats'}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mandatory Threat Summary Table */}
              <div className="bg-[#0f0f0f] border border-[#222] rounded-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-[#1a1a1a] border-b border-[#222] flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>Threat Summary Table (Risks ➔ Countermeasures)</span>
                  </h3>
                  {activeZoneFilter !== 'ALL' && (
                    <button
                      onClick={() => setActiveZoneFilter('ALL')}
                      className="text-[10px] text-blue-400 hover:underline font-mono uppercase"
                    >
                      Clear Filter ({filteredThreats.length})
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#141414] text-neutral-400 font-mono uppercase text-[9px] tracking-wider border-b border-[#222]">
                      <tr>
                        <th className="py-2 px-3">Zone / ID</th>
                        <th className="py-2 px-3">Threat & Vector</th>
                        <th className="py-2 px-3">STRIDE</th>
                        <th className="py-2 px-3">Severity</th>
                        <th className="py-2 px-3">Mitigating Countermeasure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222] font-sans">
                      {filteredThreats.map((threat) => (
                        <tr key={threat.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 align-top whitespace-nowrap">
                            <div className="font-mono font-bold text-neutral-200 text-xs">{threat.id}</div>
                            <div className="text-[9px] text-neutral-500 font-mono uppercase">
                              {threat.zone.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <div className="font-medium text-neutral-100">{threat.threatTitle}</div>
                            <div className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                              {threat.attackVector}
                            </div>
                            {threat.owaspMapping && (
                              <div className="text-[10px] font-mono text-blue-400 mt-1">
                                {threat.owaspMapping}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 align-top whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded-sm bg-[#1a1a1a] text-neutral-300 font-mono text-[9px] border border-[#222]">
                              {threat.stride}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 align-top whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded-sm font-mono text-[9px] font-bold border ${getSeverityBadge(
                                threat.severity
                              )}`}
                            >
                              {threat.severity}
                            </span>
                            <div className="text-[9px] font-mono text-neutral-500 mt-1">
                              I:{threat.impactScore} / L:{threat.likelihoodScore}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 align-top">
                            <div className="text-blue-300 font-medium text-[11px] leading-relaxed">
                              {threat.countermeasure}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-1 font-mono bg-[#0a0a0a] p-2 rounded-sm border border-[#222]">
                              {threat.implementationGuideline}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommended Next Steps */}
              {report.recommendedNextSteps && (
                <div className="bg-[#0f0f0f] border border-[#222] rounded-sm p-4">
                  <h4 className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span>Recommended Hardening Steps</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-neutral-300">
                    {report.recommendedNextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 font-mono font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
