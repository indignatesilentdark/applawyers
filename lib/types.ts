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

export type ProfileRow = {
  country: string | null;
  created_at: string;
  email: string | null;
  first_name: string | null;
  id: string;
  last_name: string | null;
  phone: string | null;
};

export type CaseRow = {
  company_emails: string | null;
  company_name: string | null;
  contact_method: string | null;
  country: string | null;
  created_at: string;
  currency: string | null;
  fraud_type: string | null;
  full_description: string | null;
  id: string;
  lost_amount: number | null;
  phones_or_users: string | null;
  platform_links: string | null;
  promise: string | null;
  relevant_urls: string | null;
  start_date: string | null;
  status: CaseStatus;
  steps_followed: string | null;
  suspicion_moment: string | null;
  transaction_hashes: string | null;
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
  missingInformation: string[];
  nextSteps: string[];
  redFlags: string[];
  traceabilityRoutes: string[];
};

export type CaseReportRow = {
  case_id: string;
  created_at: string;
  id: string;
  report_json: StructuredReport;
  report_text: string | null;
  user_id: string;
};
