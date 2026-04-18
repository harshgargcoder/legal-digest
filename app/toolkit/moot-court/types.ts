export type ViewMode = "setup" | "loading" | "trial" | "evaluation";
export type TrialPhase =
  | "Opening Statements"
  | "Witness Examination"
  | "Closing Arguments"
  | "Verdict Deliberation";
export type CaseType = "Civil" | "Criminal" | "Constitutional" | "Family" | "Contract Dispute";
export type Jurisdiction =
  | "Indian Civil Courts (CPC/IEA)"
  | "Indian Criminal Courts (CrPC/IEA)"
  | "Constitutional Courts";
export type RoleType = "Human" | "AI";

export interface RoleConfig {
  plaintiff: RoleType;
  defendant: RoleType;
  witness: RoleType;
}

export interface Message {
  role: "judge" | "plaintiff" | "defendant" | "witness" | "system";
  content: string;
  timestamp: Date;
  isInadmissible?: boolean;
}

export interface Attachment {
  name: string;
  data: string;
  mimeType: string;
}

export interface MootCourtSession {
  id: string;
  case_type: string;
  created_at: string;
  evaluation?: EvaluationResult | null;
}

export interface EvaluationResult {
  legalReasoning?: number;
  objectionAccuracy?: number;
  examinationQuality?: number;
  proceduralCompliance?: number;
  verdict?: string;
  strengths?: string[];
  improvements?: string[];
}

export interface FirebaseUser {
  uid: string;
}

export interface SpeechRecognitionResultLike {
  transcript: string;
}

export interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>>;
}

export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export interface ScrollRefs {
  plaintiff: (node: HTMLDivElement | null) => void;
  defendant: (node: HTMLDivElement | null) => void;
  center: (node: HTMLDivElement | null) => void;
}
