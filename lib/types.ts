export type CaseStatus =
  | "Pendiente"
  | "Analizando"
  | "Informe listo"
  | "Requiere información"
  | "Revisión humana solicitada";

export type PortalUserRow = {
  created_at: string;
  email: string;
  id: string;
};

export type LeadRow = {
  amount: number | null;
  country: string | null;
  created_at: string;
  email: string;
  evidence: string | null;
  first_name: string | null;
  full_name: string | null;
  id: string;
  last_name: string | null;
  phone: string | null;
  phone_country: string | null;
  situation: string | null;
  source: string | null;
  timeframe: string | null;
};

export type LeadTransferTokenRow = {
  created_at: string;
  email: string | null;
  expires_at: string;
  lead_id: string;
  source: string | null;
  token: string | null;
  token_hash: string;
  used_at: string | null;
  used_by_user_id: string | null;
};

export type ProfileRow = {
  country: string | null;
  created_at: string;
  email: string | null;
  first_name: string | null;
  full_name: string | null;
  id: string;
  last_name: string | null;
  lead_id: string | null;
  phone: string | null;
  phone_country: string | null;
  source: string | null;
};

export type CaseRow = {
  ai_report: StructuredReport | null;
  bank_name: string | null;
  company_emails: string | null;
  company_name: string | null;
  contact_method: string | null;
  contacted_lawyers: boolean | null;
  country: string | null;
  created_at: string;
  currency: string | null;
  fraud_type: string | null;
  full_description: string | null;
  id: string;
  lead_id: string | null;
  lost_amount: number | null;
  payment_method: string | null;
  phones_or_users: string | null;
  platform_links: string | null;
  promise: string | null;
  recovery_offer_details: string | null;
  recovery_offer_received: boolean | null;
  relevant_urls: string | null;
  reported_to_authorities: boolean | null;
  start_date: string | null;
  status: CaseStatus;
  steps_followed: string | null;
  suspicion_moment: string | null;
  transaction_hashes: string | null;
  updated_at: string | null;
  user_id: string;
  wallets: string | null;
};

export type CaseEvidenceRow = {
  case_id: string;
  created_at: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  id: string;
  user_id: string;
};

export type AccessCodeRow = {
  code_hash: string;
  consumed_at: string | null;
  created_at: string;
  email: string;
  expires_at: string;
  id: string;
  resend_email_id: string | null;
};

export type PrivateSessionRow = {
  created_at: string;
  expires_at: string;
  id: string;
  last_seen_at: string | null;
  token_hash: string;
  user_id: string;
};

export type StructuredReport = {
  complexity: "Bajo" | "Medio" | "Alto";
  chronology: string[];
  disclaimer: string;
  evidenceAnalysis: string[];
  executiveSummary: string;
  findings?: InvestigationFinding[];
  investigation?: InvestigationResultRowPayload;
  missingInformation: string[];
  nextSteps: string[];
  redFlags: string[];
  traceabilityRoutes: string[];
  urgentActions?: string[];
  recommendedDocuments?: string[];
  lawyerReviewItems?: string[];
};

export type CaseReportRow = {
  case_id: string;
  created_at: string;
  id: string;
  report_json: StructuredReport;
  report_text: string | null;
  user_id: string;
};

export type VerificationStatus =
  | "verified"
  | "not_verified"
  | "source_unavailable"
  | "requires_human_review"
  | "public_signal"
  | "partial_match"
  | "mock";

export type InvestigationLifecycleStatus =
  | "pending"
  | "running"
  | "completed"
  | "partial"
  | "failed"
  | "requires_human_review";

export type InvestigationStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "partial"
  | "failed";

export type InvestigationSource = {
  checkedAt: string;
  label: string;
  note?: string;
  status: VerificationStatus;
  url?: string;
};

export type InvestigationFinding = {
  confidence: number;
  explanation: string;
  severity: "Baja" | "Media" | "Alta";
  source: string;
  sourceStatus: VerificationStatus;
  sourceUrl?: string;
  title: string;
  type:
    | "blockchain"
    | "domain"
    | "regulatory"
    | "public_intel"
    | "evidence"
    | "scoring";
};

export type InvestigationScore = {
  evidenceQualityScore: number;
  explanations: string[];
  fraudRiskScore: number;
  legalComplexity: "Baja" | "Media" | "Alta";
  preliminaryCaseIndex: number;
  recommendedPriority: "Baja" | "Media" | "Alta";
  recoveryScamRiskScore: number;
  traceabilityScore: number;
};

export type BlockchainCounterparty = {
  address: string;
  count: number;
  totalValueNative: number;
};

export type BlockchainInvestigationResult = {
  confidenceScore: number;
  contractInteractionDetected: boolean;
  detectedNetwork:
    | "Ethereum"
    | "BSC"
    | "Polygon"
    | "Arbitrum"
    | "Optimism"
    | "No verificado";
  firstTransactionAt: string | null;
  hashStatus: "Válido" | "Inválido" | "No verificado";
  knownExchange: string | null;
  lastTransactionAt: string | null;
  notes: string[];
  primaryInboundWallets: BlockchainCounterparty[];
  primaryOutboundWallets: BlockchainCounterparty[];
  sources: InvestigationSource[];
  totalMovedNative: number | null;
  traceabilityLevel: "Baja" | "Media" | "Alta";
  traceabilityReasons: string[];
  transactionCount: number;
  transactionHash: string | null;
  walletAddress: string | null;
  walletStatus: "Válida" | "Inválida" | "No verificado";
};

export type DomainInvestigationResult = {
  country: string | null;
  createdAt: string | null;
  domain: string | null;
  domainAgeDays: number | null;
  domainFound: boolean;
  expiresAt: string | null;
  notes: string[];
  privacyProtection: "Activa" | "Inactiva" | "No verificado";
  registrar: string | null;
  riskExplanation: string;
  riskLevel: "Bajo" | "Medio" | "Alto";
  sources: InvestigationSource[];
  status: VerificationStatus;
  nameservers: string[];
};

export type RegulatoryMatch = {
  confidence: number;
  label: string;
  sourceUrl?: string;
  status: "autorizado" | "advertido" | "no_encontrado" | "no_verificado";
  type: "exacta" | "parcial" | "sin_coincidencia";
};

export type RegulatoryInvestigationResult = {
  consultedRegulators: string[];
  matches: RegulatoryMatch[];
  notes: string[];
  riskLevel: "Bajo" | "Medio" | "Alto";
  sources: InvestigationSource[];
  summary: string;
};

export type PublicIntelMention = {
  kind: "negative" | "neutral" | "warning";
  title: string;
  url: string;
};

export type PublicIntelResult = {
  confidenceScore: number;
  negativeMentions: number;
  neutralMentions: number;
  notes: string[];
  relevantMentions: PublicIntelMention[];
  reputationRisk: "Bajo" | "Medio" | "Alto";
  sources: InvestigationSource[];
  summary: string;
};

export type EvidenceEntityMap = {
  balances: string[];
  dates: string[];
  emails: string[];
  platformNames: string[];
  phones: string[];
  wallets: string[];
};

export type EvidenceInvestigationResult = {
  detectedEntities: EvidenceEntityMap;
  evidenceId: string;
  evidenceType: string;
  extractedText: string | null;
  fileName: string;
  probativeValue: "Alta" | "Media" | "Baja";
  requiresHumanReview: boolean;
  riskSignals: string[];
  sourceStatus: VerificationStatus;
  summary: string;
};

export type InvestigationTimelineStep = {
  code:
    | "case_created"
    | "blockchain"
    | "domain"
    | "regulators"
    | "public_intel"
    | "evidence"
    | "scoring"
    | "report";
  label: string;
  message: string;
  status: InvestigationStepStatus;
  updatedAt: string;
};

export type InvestigationResultRowPayload = {
  blockchain_result: BlockchainInvestigationResult;
  created_at?: string;
  domain_result: DomainInvestigationResult;
  evidence_result: EvidenceInvestigationResult[];
  findings: InvestigationFinding[];
  public_intel_result: PublicIntelResult;
  regulatory_result: RegulatoryInvestigationResult;
  score_result: InvestigationScore;
  sources: InvestigationSource[];
  status: InvestigationLifecycleStatus;
  timeline: InvestigationTimelineStep[];
  updated_at?: string;
};

export type InvestigationResultRow = {
  blockchain_result: BlockchainInvestigationResult | null;
  case_id: string;
  created_at: string;
  domain_result: DomainInvestigationResult | null;
  evidence_result: EvidenceInvestigationResult[] | null;
  findings: InvestigationFinding[] | null;
  id: string;
  public_intel_result: PublicIntelResult | null;
  regulatory_result: RegulatoryInvestigationResult | null;
  score_result: InvestigationScore | null;
  sources: InvestigationSource[] | null;
  status: InvestigationLifecycleStatus;
  timeline: InvestigationTimelineStep[] | null;
  updated_at: string;
};
