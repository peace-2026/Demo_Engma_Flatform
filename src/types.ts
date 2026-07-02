export type BusinessType = "EOR" | "GPO" | "HRO" | "RPO";
export type Status = "启用" | "草稿" | "停用";
export type NodeStatus = "未开始" | "进行中" | "已完成";
export type SupportStatus = "Supported" | "Need Review" | "Not Supported";
export type LocalEntity = "Yes" | "Partner" | "No";
export type CountryRuleStatus = "active" | "inactive" | "draft";
export type PayrollFrequency = "Monthly" | "Semi-monthly" | "Weekly" | "Bi-weekly";
export type HolidaySource = "System Default" | "Manual Upload" | "External Calendar";
export type FieldType =
  | "input"
  | "textarea"
  | "select"
  | "date"
  | "radio"
  | "checkbox"
  | "number"
  | "money"
  | "switch"
  | "text"
  | "group"
  | "image"
  | "file"
  | "table"
  | "custom"
  | "employee"
  | "department"
  | "tree";

export interface WorkflowNode {
  id: string;
  code: string;
  name: string;
  description: string;
  roles: string[];
  owner: string;
  dueDate: string;
  completionDate: string;
  status: NodeStatus;
  onlyOneRequired: boolean;
  requiresAttachment: boolean;
  attachmentFormats: string[];
  requiresForm: boolean;
  linkedFormId: string;
  isClientAction: boolean;
  countryRuleReference: {
    enabled: boolean;
    fields: CountryRuleReferenceField[];
    allowSupplementDocuments: boolean;
  };
}

export interface Stage {
  id: string;
  name: string;
  nodes: WorkflowNode[];
}

export interface Scheme {
  id: string;
  code: string;
  name: string;
  businessType: BusinessType;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
  applicableCountry: {
    country: string;
    serviceType: BusinessType[];
  };
  stages: Stage[];
}

export interface FormField {
  id: string;
  type: FieldType;
  field_key: string;
  label: string;
  display: {
    visible: boolean;
    show_label: boolean;
    placeholder: string;
    width: string;
    default_value: string | string[] | number | boolean | null;
    component_style: string | null;
  };
  operation: {
    disabled: boolean;
    show_clear_button: boolean;
  };
  validation: {
    required: boolean;
    validation_type: string | null;
    regex: string;
    max_length: number | null;
  };
  data: null | {
    multiple: boolean;
    data_source_type: "country_config" | "static" | "remote" | "odoo";
    country_config_field?: CountryConfigDataField;
    data_source: {
      mode: "Model" | "Selection";
      model: string;
      args: unknown[];
      context: Record<string, unknown>;
    };
    data_permission: "follow_role" | "follow_feature" | "all_data";
  };
  linkage: {
    enabled: boolean;
    rule: string | null;
    trigger_on_manual_change: boolean;
    trigger_on_value_change: boolean;
  };
  date_format?: string;
  show_word_count?: boolean;
}

export interface FormDefinition {
  id: string;
  code: string;
  name: string;
  businessType: BusinessType;
  creator: string;
  updatedAt: string;
  status: Status;
  fields: FormField[];
}

export interface RolePermission {
  id: string;
  code: string;
  name: string;
  description: string;
  memberCount: number;
  status: Status;
  updatedAt: string;
  members: string[];
  schemes: string[];
  forms: string[];
  accessibleCountries: string[];
  accessibleServiceTypes: BusinessType[];
  canEditCountryConfig: boolean;
  canPublishCountryConfig: boolean;
}

export interface FeaturePermission {
  id: string;
  code: string;
  name: string;
  businessType: BusinessType;
  businessTypes: BusinessType[];
  description: string;
  status: Status;
  roles: string[];
}

export type CountryRuleReferenceField =
  | "Required Documents"
  | "Payroll Cutoff Rule"
  | "Final Pay Rule"
  | "Notice Period Rule"
  | "Holiday Calendar"
  | "Statutory Items";

export type CountryConfigDataField =
  | "Country"
  | "Service Type"
  | "Statutory Items"
  | "Required Documents"
  | "Holiday Calendar";

export interface StatutoryItemDetail {
  id: string;
  item_name: string;
  employee_type: string;
  residency: string;
  employer_contribution_rate: string;
  employee_contribution_rate: string;
  calculation_base: string;
  cap: string;
  effective_date: string;
  remark: string;
}

export interface RequiredDocumentRule {
  id: string;
  document_name: string;
  required_for: string;
  required_type: "Required" | "Optional";
  accepted_format: string[];
  max_file_size: string;
  template_available: boolean;
  remark: string;
}

export interface PayrollRules {
  payroll_cutoff_rule: string;
  payroll_frequency: PayrollFrequency;
  salary_payment_date: string;
  payroll_data_submission_deadline: string;
  late_submission_handling: string;
}

export interface TerminationRules {
  final_pay_rule: string;
  notice_period_rule: string;
  termination_document_required: string[];
  unused_leave_payout_rule: string;
  severance_pay_rule: string;
  remark: string;
}

export interface HolidayItem {
  id: string;
  holiday_name: string;
  date: string;
  type: string;
  is_working_day: boolean;
  remark: string;
}

export interface HolidayCalendarRule {
  holiday_calendar_name: string;
  holiday_source: HolidaySource;
  holiday_list: HolidayItem[];
}

export interface CountryRule {
  id: string;
  country: string;
  service_type: BusinessType;
  support_status: SupportStatus;
  local_entity: LocalEntity;
  partner_name: string;
  effective_date: string;
  status: CountryRuleStatus;
  statutory_items: StatutoryItemDetail[];
  required_documents: RequiredDocumentRule[];
  payroll_rules: PayrollRules;
  termination_rules: TerminationRules;
  holiday_calendar: HolidayCalendarRule;
  risk_notes: string;
  operation_notes: string;
  review_required: boolean;
  reviewer_role: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}
