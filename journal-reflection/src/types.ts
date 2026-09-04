export type PsychoTheme = 'sage_botanical' | 'cognitive_slate' | 'sand_therapy';

export interface ThemeOption {
  id: PsychoTheme;
  name: string;
  tagline: string;
  badge: string;
  primaryColor: string;
  bgColor: string;
  isDark: boolean;
}

export type Mood = 
  | 'Tenang' 
  | 'Reflektif' 
  | 'Bersyukur' 
  | 'Terinspirasi' 
  | 'Bersemangat'
  | 'Fokus' 
  | 'Tertantang' 
  | 'Cemas' 
  | 'Kelelahan Mental'
  | 'Inspired' | 'Focused' | 'Calm' | 'Reflective' | 'Anxious' | 'Grateful' | 'Challenged' | 'Energized';

export type JournalCategory = 
  | 'Pemeriksaan Emosi & Terapi'
  | 'Pengembangan Diri'
  | 'Refleksi Sesi & Mindfulness'
  | 'Restrukturisasi Kognitif (CBT)'
  | 'Karier & Kerja Mendalam'
  | 'Brainstorming Ide'
  | 'Strategi & Tujuan'
  | 'Rasa Syukur Harian'
  | 'Filosofi & Kehidupan'
  | 'Pemeriksaan Emosi'
  | 'Personal Growth'
  | 'Deep Work & Career'
  | 'Emotional Check-in'
  | 'Idea Brainstorming'
  | 'Strategy & Goals'
  | 'Daily Gratitude'
  | 'Philosophy & Life';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface ReflectionInsight {
  summary: string;
  keyTakeaways: string[];
  actionItems: string[];
  detectedThemes: string[];
  generatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: JournalCategory;
  mood: Mood;
  tags: string[];
  messages: ChatMessage[];
  aiInsight?: ReflectionInsight;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface FallbackAttempt {
  model: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED_SIMULATED' | 'FAILED_API' | 'SKIPPED';
  httpCode?: number;
  errorMessage?: string;
  latencyMs: number;
}

export interface GeminiReflectionResponse {
  reply: string;
  summary?: string;
  keyTakeaways?: string[];
  actionItems?: string[];
  detectedThemes?: string[];
  modelUsed: string;
  attempts: FallbackAttempt[];
  totalLatencyMs: number;
}

// ==========================================
// Security & Verification Types
// ==========================================
export type ThreatZone =
  | 'input_surfaces'
  | 'planning_reasoning'
  | 'tool_execution'
  | 'memory_state'
  | 'inter_system_comm';

export type StrideCategory =
  | 'Spoofing'
  | 'Tampering'
  | 'Repudiation'
  | 'Information Disclosure'
  | 'Denial of Service'
  | 'Elevation of Privilege';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export interface ThreatItem {
  id: string;
  zone: ThreatZone;
  threatTitle: string;
  stride: StrideCategory;
  attackVector: string;
  severity: SeverityLevel;
  impactScore: number;
  likelihoodScore: number;
  countermeasure: string;
  implementationGuideline: string;
  owaspMapping?: string;
}

export interface ThreatModelReport {
  id: string;
  systemName: string;
  targetDescription: string;
  createdAt: string;
  zonesSummary: Record<ThreatZone, { threatCount: number; highestSeverity: SeverityLevel }>;
  threats: ThreatItem[];
  overallRiskScore: number;
  executiveSummary: string;
  recommendedNextSteps: string[];
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  severity: SeverityLevel;
  owaspCategory: string;
  cwe?: string;
  entryPoint: string;
  executionSink: string;
  dataFlowDescription: string;
  vulnerableCodeSnippet: string;
  remediatedCodeSnippet: string;
  remediationExplanation: string;
}

export interface SecurityReviewReport {
  id: string;
  targetType: 'code' | 'prompt' | 'architecture' | 'firestore_rules';
  reviewedAt: string;
  summary: string;
  vulnerabilities: SecurityVulnerability[];
  dataFlowGraph: {
    source: string;
    transformation: string;
    sink: string;
    sanitizationPresent: boolean;
  }[];
  complianceScore: number;
}

export interface FallbackExecutionResult {
  prompt: string;
  response: string;
  successfulModel: string;
  attempts: FallbackAttempt[];
  totalLatencyMs: number;
  ladderOrder: string[];
  simulatedFaultCode?: number;
}

export interface PersistedInteraction {
  id: string;
  type: 'threat_model' | 'security_review' | 'gemini_fallback' | 'deployment_config';
  title: string;
  timestamp: string;
  payloadCleaned: boolean;
  data: Record<string, unknown>;
}

export interface TestWalkthroughCase {
  id: string;
  module: 'Threat Modeling' | 'Security Reviewer' | 'Fallback Ladder' | 'Payload Hygiene' | 'README & Deploy';
  title: string;
  userAction: string;
  expectedOutcome: string;
  testScriptStep: string;
  verificationMethod: 'AUTOMATED' | 'MANUAL';
  status: 'PENDING' | 'PASSED' | 'FAILED';
  runTelemetry?: string;
}
