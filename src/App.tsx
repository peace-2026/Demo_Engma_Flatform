import { useEffect, useMemo, useState } from "react";
import {
  advancedFieldComponents,
  attachmentFormats,
  basicFieldComponents,
  businessTypes,
  countryConfigDataFields,
  countryOptions,
  createCode,
  createField,
  initialCountryRules,
  initialFeatures,
  initialForms,
  initialRoles,
  initialSchemes,
  localEntityOptions,
  roleNames,
  statutoryItemOptions,
  supportStatusOptions,
  terminationDocumentOptions,
} from "./mockData";
import type {
  BusinessType,
  CountryConfigDataField,
  CountryRule,
  CountryRuleStatus,
  FeaturePermission,
  FieldType,
  FormDefinition,
  FormField,
  HolidayItem,
  LocalEntity,
  NodeStatus,
  PayrollFrequency,
  RolePermission,
  Scheme,
  Stage,
  StatutoryItemDetail,
  SupportStatus,
  WorkflowNode,
  RequiredDocumentRule,
} from "./types";

type MenuKey = "home" | "order" | "project" | "scheme" | "form" | "permission" | "country";
type PermissionTab = "role" | "feature" | "data";
type ProjectStatus = "草稿" | "启用" | "已暂停" | "已完成";
type ProjectNodeTimeStatus = "未配置" | "已配置" | "配置缺失" | "已启用";
type ProjectServiceType = BusinessType | "Work Visa";
type TimeRuleType = "fixed" | "recurring" | "relative" | "manual";
type CountryFilters = {
  country: string;
  serviceType: string;
  supportStatus: string;
  localEntity: string;
  status: string;
};

type ProjectTimeRule = {
  timezone: string;
  type: TimeRuleType;
  fixedDate: string;
  fixedTime: string;
  allowOverdue: boolean;
  reminder: string;
  frequency: string;
  weekDay: string;
  monthDay: string;
  quarterMonth: string;
  startDate: string;
  endDate: string;
  dependencyNodeId: string;
  offsetDirection: "T+" | "T-";
  offsetValue: string;
  offsetUnit: string;
  weekendHandling: string;
  manualReminder: string;
};

type ProjectNode = {
  id: string;
  sourceNodeId: string;
  name: string;
  stageName: string;
  roles: string[];
  status: ProjectNodeTimeStatus;
  timeRuleSummary: string;
  timeRule: ProjectTimeRule | null;
};

type ProjectStage = {
  id: string;
  name: string;
  nodes: ProjectNode[];
};

type ProjectSchemeInstance = {
  id: string;
  sourceSchemeId: string;
  code: string;
  name: string;
  country: string;
  serviceTypes: ProjectServiceType[];
  stages: ProjectStage[];
};

type Project = {
  id: string;
  code: string;
  name: string;
  customer: string;
  country: string;
  serviceTypes: ProjectServiceType[];
  owner: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  schemes: ProjectSchemeInstance[];
};

type OrderStatus = "Draft" | "Submitted" | "In Progress" | "Waiting Client" | "Waiting Approval" | "Completed" | "Overdue" | "Cancelled";
type OrderNodeStatus = "Not Started" | "In Progress" | "Waiting Client" | "Waiting SD" | "Waiting Approval" | "Completed" | "Rejected" | "Overdue";
type OrderStageStatus = "Not Started" | "In Progress" | "Completed";
type OrderAttachmentStatus = "Pending Upload" | "Uploaded" | "Confirmed" | "Rejected";
type OrderFormStatus = "Not Started" | "Draft" | "Submitted" | "Rejected" | "Confirmed";
type OrderDetailTab = "workflow" | "forms" | "attachments" | "approvals" | "messages" | "logs";
type DashboardRole = "客户" | "总部项目对接人" | "财务" | "当地实操人员";
type DashboardDateRange = "本月" | "近 7 天" | "近 30 天" | "本季度" | "自定义";
type DashboardServiceType = "All" | BusinessType | "Contractor" | "Benefits";
type DashboardChartId = "todos" | "due" | "status" | "workflow" | "onboarding" | "documents" | "payroll" | "distribution";
type DashboardOrderIntent = {
  stamp: number;
  status?: OrderStatus;
  country?: string;
  serviceType?: string;
  selectedOrderId?: string;
  tab?: OrderDetailTab;
};

type OrderWorkflowNode = {
  node_id: string;
  node_name: string;
  executor_role: string;
  assignee: string;
  due_date: string;
  completion_date: string | null;
  status: OrderNodeStatus;
  is_client_action: boolean;
  requires_form: boolean;
  form_id: string;
  requires_attachment: boolean;
  accepted_format: string[];
  required_documents: string[];
  requires_approval: boolean;
};

type OrderWorkflowStage = {
  stage_id: string;
  stage_name: string;
  stage_status: OrderStageStatus;
  nodes: OrderWorkflowNode[];
};

type OrderWorkflow = {
  workflow_id: string;
  workflow_name: string;
  stages: OrderWorkflowStage[];
};

type OrderAttachment = {
  id: string;
  file_name: string;
  file_type: string;
  file_size: string;
  stage_name: string;
  node_id: string;
  node_name: string;
  uploaded_by: string;
  uploaded_time: string;
  status: OrderAttachmentStatus;
};

type OrderFormRecord = {
  id: string;
  form_id: string;
  form_name: string;
  stage_name: string;
  node_id: string;
  node_name: string;
  filled_by: string;
  status: OrderFormStatus;
  submitted_time: string;
};

type ApprovalRecord = {
  id: string;
  node_name: string;
  approver: string;
  action: "Approve" | "Reject" | "Return" | "Transfer";
  comment: string;
  approval_time: string;
  status: string;
};

type OrderMessage = {
  id: string;
  sender: string;
  sent_time: string;
  content: string;
  linked_node: string;
};

type OperationLog = {
  id: string;
  time: string;
  actor: string;
  type: string;
  target: string;
  content: string;
};

type ServiceOrder = {
  order_id: string;
  order_name: string;
  client: string;
  country_location: string;
  service_type: BusinessType;
  service_name: string;
  project: string;
  legal_entity: string;
  pay_group: string;
  pay_frequency: string;
  pay_period: string;
  pay_date: string;
  sd_team: string[];
  client_contact: string[];
  approval_role: string[];
  status: OrderStatus;
  current_stage: string;
  current_node: string;
  due_date: string;
  created_time: string;
  updated_time: string;
  expected_completion_date: string;
  workflow: OrderWorkflow;
  attachments: OrderAttachment[];
  forms: OrderFormRecord[];
  approval_records: ApprovalRecord[];
  messages: OrderMessage[];
  operation_logs: OperationLog[];
};

const nowText = "2026-07-01 10:16";
const watermarkText = "英格玛国际企业服务事业部 概念图";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const nowFullText = "2026-07-01 10:00:00";
const projectServiceTypeOptions: ProjectServiceType[] = ["EOR", "GPO", "HRO", "RPO", "Work Visa"];
const projectOwnerOptions = ["总部项目对接人", "当地实操人员", "财务", "客户"];
const timezoneOptions = ["Asia/Singapore", "Asia/Shanghai", "Asia/Tokyo", "Europe/London", "America/New_York"];
const timeRuleTypeLabels: Record<TimeRuleType, string> = {
  fixed: "固定时间点",
  recurring: "周期性时间",
  relative: "相对上一节点时间",
  manual: "手动设置",
};

const defaultTimeRule = (dependencyNodeId = ""): ProjectTimeRule => ({
  timezone: "Asia/Singapore",
  type: "fixed",
  fixedDate: "2026-07-15",
  fixedTime: "18:00",
  allowOverdue: true,
  reminder: "截止前 1 天提醒",
  frequency: "每月",
  weekDay: "Monday",
  monthDay: "5",
  quarterMonth: "1",
  startDate: "2026-07-01",
  endDate: "",
  dependencyNodeId,
  offsetDirection: "T+",
  offsetValue: "3",
  offsetUnit: "工作日",
  weekendHandling: "顺延到下一个工作日",
  manualReminder: "截止当天提醒",
});

const buildTimeRuleSummary = (rule: ProjectTimeRule) => {
  if (rule.type === "fixed") return `固定截止时间：${rule.fixedDate} ${rule.fixedTime} ${rule.timezone}`;
  if (rule.type === "recurring") {
    if (rule.frequency === "每周") return `每周 ${rule.weekDay} ${rule.fixedTime} 截止，时区 ${rule.timezone}`;
    if (rule.frequency === "每季度") return `每季度第 ${rule.quarterMonth} 月 ${rule.monthDay} 日 ${rule.fixedTime} 截止，时区 ${rule.timezone}`;
    if (rule.frequency === "每天") return `每天 ${rule.fixedTime} 截止，时区 ${rule.timezone}`;
    if (rule.frequency === "每年") return `每年 ${rule.monthDay} 日 ${rule.fixedTime} 截止，时区 ${rule.timezone}`;
    return `每月 ${rule.monthDay} 日 ${rule.fixedTime} 截止，时区 ${rule.timezone}`;
  }
  if (rule.type === "relative") return `上一节点完成后 ${rule.offsetDirection}${rule.offsetValue} ${rule.offsetUnit} ${rule.fixedTime} 截止，遇节假日${rule.weekendHandling.replace("到", "")}`;
  return "手动设置，不自动生成截止时间";
};

const schemeConfigStatus = (scheme: ProjectSchemeInstance) => {
  const nodes = scheme.stages.flatMap((stage) => stage.nodes);
  const configured = nodes.filter((node) => Boolean(node.timeRule)).length;
  if (!nodes.length || configured === 0) return "未配置";
  if (configured === nodes.length) return "已配置";
  return "部分配置";
};

const stageConfigStatus = (stage: ProjectStage) => {
  const configured = stage.nodes.filter((node) => Boolean(node.timeRule)).length;
  if (!stage.nodes.length || configured === 0) return "未配置";
  if (configured === stage.nodes.length) return "已配置";
  return "部分配置";
};

const createEmptyCountryRule = (existingCount: number): CountryRule => ({
  id: `country_rule_${Date.now()}_${existingCount + 1}`,
  country: "Singapore",
  service_type: "EOR",
  support_status: "Need Review",
  local_entity: "Partner",
  partner_name: "",
  effective_date: "2026-07-01",
  status: "draft",
  statutory_items: [],
  required_documents: [],
  payroll_rules: {
    payroll_cutoff_rule: "每月 15 日",
    payroll_frequency: "Monthly",
    salary_payment_date: "每月最后一个工作日",
    payroll_data_submission_deadline: "每月 15 日前提交薪资变动数据",
    late_submission_handling: "超过截止日提交的数据顺延至下个薪资周期处理",
  },
  termination_rules: {
    final_pay_rule: "离职后 X 天内",
    notice_period_rule: "按合同或当地法律",
    termination_document_required: [],
    unused_leave_payout_rule: "",
    severance_pay_rule: "",
    remark: "",
  },
  holiday_calendar: {
    holiday_calendar_name: "本地节假日",
    holiday_source: "System Default",
    holiday_list: [],
  },
  risk_notes: "",
  operation_notes: "",
  review_required: false,
  reviewer_role: [],
  created_by: "Admin",
  created_at: nowFullText,
  updated_at: nowFullText,
});

const findCountryRules = (rules: CountryRule[], country: string, serviceTypes: BusinessType[]) =>
  rules.filter((rule) => rule.country === country && serviceTypes.includes(rule.service_type) && rule.status !== "inactive");

const summarizeStatutoryItems = (rule: CountryRule) => rule.statutory_items.map((item) => item.item_name).join(" / ") || "-";
const summarizeRequiredDocuments = (rule: CountryRule) => rule.required_documents.map((item) => item.document_name).join("、") || "-";

const projectNode = (
  id: string,
  name: string,
  stageName: string,
  roles: string[],
  status: ProjectNodeTimeStatus = "未配置",
  timeRule: ProjectTimeRule | null = null,
): ProjectNode => ({
  id,
  sourceNodeId: id,
  name,
  stageName,
  roles,
  status,
  timeRule,
  timeRuleSummary: timeRule ? buildTimeRuleSummary(timeRule) : "暂无",
});

const fixedOnboardingRule: ProjectTimeRule = {
  ...defaultTimeRule(),
  type: "fixed",
  fixedDate: "2026-07-15",
  fixedTime: "18:00",
  timezone: "Asia/Singapore",
};

const payrollRecurringRule: ProjectTimeRule = {
  ...defaultTimeRule(),
  type: "recurring",
  frequency: "每月",
  monthDay: "5",
  fixedTime: "18:00",
  timezone: "Asia/Singapore",
};

const payrollRelativeRule: ProjectTimeRule = {
  ...defaultTimeRule("project-payroll-node-1"),
  type: "relative",
  offsetDirection: "T+",
  offsetValue: "3",
  offsetUnit: "工作日",
  fixedTime: "18:00",
};

const projectSchemeCatalog: ProjectSchemeInstance[] = [
  {
    id: "catalog-onboarding",
    sourceSchemeId: "scheme-eor-001",
    code: "SCHEME-001",
    name: "Onboarding Service",
    country: "Singapore",
    serviceTypes: ["EOR", "GPO"],
    stages: [
      {
        id: "project-stage-info",
        name: "Employee Information Collection",
        nodes: [
          projectNode("project-onboarding-node-1", "Upload Employee Basic Information", "Employee Information Collection", ["客户"], "已配置", fixedOnboardingRule),
          projectNode("project-onboarding-node-2", "Validate Employee Documents", "Employee Information Collection", ["当地实操人员"]),
        ],
      },
      {
        id: "project-stage-contract",
        name: "Contract Preparation",
        nodes: [projectNode("project-onboarding-node-3", "Prepare Local Employment Contract", "Contract Preparation", ["当地实操人员"])],
      },
      {
        id: "project-stage-resignation",
        name: "Contract Resignation",
        nodes: [projectNode("project-onboarding-node-4", "Contract Resignation", "Contract Resignation", ["客户"])],
      },
    ],
  },
  {
    id: "catalog-working-visa",
    sourceSchemeId: "scheme-working-visa-001",
    code: "SCHEME-002",
    name: "Working Visa",
    country: "Singapore",
    serviceTypes: ["EOR"],
    stages: [
      { id: "visa-stage-period", name: "Work Visa Period", nodes: [projectNode("project-visa-node-1", "Choose Work Visa Period", "Work Visa Period", ["客户"])] },
      { id: "visa-stage-docs", name: "Documents Collection", nodes: [projectNode("project-visa-node-2", "Required Documents", "Documents Collection", ["候选人"])] },
      {
        id: "visa-stage-review",
        name: "Application Review",
        nodes: [
          projectNode("project-visa-node-3", "Review Materials for Work Visa Application", "Application Review", ["当地实操人员"]),
          projectNode("project-visa-node-4", "Upload Invoice", "Application Review", ["总部项目对接人"]),
        ],
      },
      { id: "visa-stage-result", name: "Visa Result", nodes: [projectNode("project-visa-node-5", "Application is successful", "Visa Result", ["当地实操人员"])] },
    ],
  },
  {
    id: "catalog-payroll",
    sourceSchemeId: "scheme-gpo-001",
    code: "SCHEME-003",
    name: "Payroll Monthly Service",
    country: "Singapore",
    serviceTypes: ["GPO"],
    stages: [
      { id: "payroll-stage-data", name: "Payroll Data Collection", nodes: [projectNode("project-payroll-node-1", "Upload Monthly Payroll Data", "Payroll Data Collection", ["客户"], "已配置", payrollRecurringRule)] },
      { id: "payroll-stage-calc", name: "Payroll Calculation", nodes: [projectNode("project-payroll-node-2", "Calculate Payroll", "Payroll Calculation", ["当地实操人员"], "未配置", payrollRelativeRule)] },
      { id: "payroll-stage-confirm", name: "Payroll Confirmation", nodes: [projectNode("project-payroll-node-3", "Confirm Payroll Result", "Payroll Confirmation", ["客户"])] },
      { id: "payroll-stage-delivery", name: "Payslip Delivery", nodes: [projectNode("project-payroll-node-4", "Deliver Payslip", "Payslip Delivery", ["总部项目对接人"])] },
    ],
  },
];

const cloneProjectScheme = (template: ProjectSchemeInstance): ProjectSchemeInstance => {
  const copy = clone(template);
  const stamp = Date.now();
  return {
    ...copy,
    id: `project-scheme-${template.id}-${stamp}`,
    stages: copy.stages.map((stage, stageIndex) => ({
      ...stage,
      id: `${stage.id}-${stamp}-${stageIndex}`,
      nodes: stage.nodes.map((node, nodeIndex) => ({
        ...node,
        id: `${node.id}-${stamp}-${nodeIndex}`,
        sourceNodeId: node.sourceNodeId,
        timeRule: node.timeRule ? clone(node.timeRule) : null,
      })),
    })),
  };
};

const createInitialProjects = (): Project[] => [
  {
    id: "project-001",
    code: "PROJECT-001",
    name: "APAC Talent Expansion Project",
    customer: "APAC Talent Ltd.",
    country: "Singapore",
    serviceTypes: ["EOR", "GPO", "Work Visa"],
    owner: "总部项目对接人",
    description: "该项目用于 APAC 区域员工入职、签证和月度薪资服务交付。",
    createdAt: "2026-07-01 09:30",
    updatedAt: "2026-07-01 11:20",
    status: "草稿",
    schemes: projectSchemeCatalog.map(cloneProjectScheme),
  },
];

const orderNowText = "2026-07-02 10:30:00";

const formNameMap: Record<string, string> = {
  onboarding_order_form: "Onboarding Order Form",
  employee_basic_information_form: "Employee Basic Information Form",
  payroll_movement_form: "Payroll Movement Data Form",
};

const createOnboardingWorkflow = (): OrderWorkflow => ({
  workflow_id: "workflow_eor_onboarding",
  workflow_name: "Onboarding Service",
  stages: [
    {
      stage_id: "stage_place_order",
      stage_name: "Place Order",
      stage_status: "Completed",
      nodes: [
        {
          node_id: "submit_onboarding_order",
          node_name: "Submit Onboarding Order",
          executor_role: "Client",
          assignee: "Client HRBP",
          due_date: "2026-07-01",
          completion_date: "2026-07-01 15:30:00",
          status: "Completed",
          is_client_action: true,
          requires_form: true,
          form_id: "onboarding_order_form",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: false,
        },
        {
          node_id: "review_order_information",
          node_name: "Review Order Information",
          executor_role: "总部项目对接人",
          assignee: "SD Owner",
          due_date: "2026-07-02",
          completion_date: "2026-07-02 09:10:00",
          status: "Completed",
          is_client_action: false,
          requires_form: false,
          form_id: "",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: true,
        },
      ],
    },
    {
      stage_id: "stage_employee",
      stage_name: "Employee",
      stage_status: "In Progress",
      nodes: [
        {
          node_id: "upload_employee_basic_information",
          node_name: "Upload Employee Basic Information",
          executor_role: "Client",
          assignee: "Client HRBP",
          due_date: "2026-07-05",
          completion_date: null,
          status: "Waiting Client",
          is_client_action: true,
          requires_form: true,
          form_id: "employee_basic_information_form",
          requires_attachment: true,
          accepted_format: ["PDF", "DOC", "DOCX", "PNG", "JPG"],
          required_documents: ["Passport", "ID Card", "Employee Information Sheet"],
          requires_approval: false,
        },
        {
          node_id: "validate_employee_information",
          node_name: "Validate Employee Information",
          executor_role: "当地实操人员",
          assignee: "Local Ops",
          due_date: "2026-07-07",
          completion_date: null,
          status: "Not Started",
          is_client_action: false,
          requires_form: false,
          form_id: "",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: false,
        },
      ],
    },
    {
      stage_id: "stage_contract",
      stage_name: "Contract",
      stage_status: "Not Started",
      nodes: [
        {
          node_id: "prepare_employment_contract",
          node_name: "Prepare Employment Contract",
          executor_role: "当地实操人员",
          assignee: "Local Ops",
          due_date: "2026-07-10",
          completion_date: null,
          status: "Not Started",
          is_client_action: false,
          requires_form: false,
          form_id: "",
          requires_attachment: true,
          accepted_format: ["PDF", "DOC", "DOCX"],
          required_documents: ["Employment Contract Draft"],
          requires_approval: false,
        },
        {
          node_id: "client_review_contract",
          node_name: "Client Review Contract",
          executor_role: "Client",
          assignee: "Client Legal Approver",
          due_date: "2026-07-12",
          completion_date: null,
          status: "Not Started",
          is_client_action: true,
          requires_form: false,
          form_id: "",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: true,
        },
        {
          node_id: "employee_sign_contract",
          node_name: "Employee Sign Contract",
          executor_role: "Client",
          assignee: "Client HRBP",
          due_date: "2026-07-15",
          completion_date: null,
          status: "Not Started",
          is_client_action: true,
          requires_form: false,
          form_id: "",
          requires_attachment: true,
          accepted_format: ["PDF", "PNG", "JPG"],
          required_documents: ["Signed Employment Contract"],
          requires_approval: false,
        },
      ],
    },
    {
      stage_id: "stage_onboarding",
      stage_name: "Onboarding",
      stage_status: "Not Started",
      nodes: [
        {
          node_id: "confirm_onboarding_date",
          node_name: "Confirm Onboarding Date",
          executor_role: "总部项目对接人",
          assignee: "SD Owner",
          due_date: "2026-07-18",
          completion_date: null,
          status: "Not Started",
          is_client_action: false,
          requires_form: false,
          form_id: "",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: false,
        },
        {
          node_id: "complete_onboarding",
          node_name: "Complete Onboarding",
          executor_role: "当地实操人员",
          assignee: "Local Ops",
          due_date: "2026-07-20",
          completion_date: null,
          status: "Not Started",
          is_client_action: false,
          requires_form: false,
          form_id: "",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: false,
        },
      ],
    },
  ],
});

const createPayrollWorkflow = (): OrderWorkflow => ({
  workflow_id: "workflow_gpo_payroll",
  workflow_name: "Payroll Monthly Service",
  stages: [
    {
      stage_id: "payroll_stage_data",
      stage_name: "Data Collection",
      stage_status: "Completed",
      nodes: [
        {
          node_id: "upload_monthly_payroll_data",
          node_name: "Upload Monthly Payroll Data",
          executor_role: "Client",
          assignee: "Client Payroll",
          due_date: "2026-07-01",
          completion_date: "2026-07-01 12:20:00",
          status: "Completed",
          is_client_action: true,
          requires_form: true,
          form_id: "payroll_movement_form",
          requires_attachment: true,
          accepted_format: ["XLS", "XLSX", "PDF"],
          required_documents: ["Movement Data Sheet"],
          requires_approval: false,
        },
      ],
    },
    {
      stage_id: "payroll_stage_processing",
      stage_name: "Payroll Processing",
      stage_status: "In Progress",
      nodes: [
        {
          node_id: "calculate_payroll",
          node_name: "Calculate Payroll",
          executor_role: "当地实操人员",
          assignee: "Local Payroll Ops",
          due_date: "2026-07-03",
          completion_date: null,
          status: "In Progress",
          is_client_action: false,
          requires_form: false,
          form_id: "",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: false,
        },
        {
          node_id: "review_draft_payroll_report",
          node_name: "Review Draft Payroll Report",
          executor_role: "Client",
          assignee: "Client Payroll",
          due_date: "2026-07-04",
          completion_date: null,
          status: "Waiting Approval",
          is_client_action: true,
          requires_form: false,
          form_id: "",
          requires_attachment: false,
          accepted_format: [],
          required_documents: [],
          requires_approval: true,
        },
      ],
    },
    {
      stage_id: "payroll_stage_payment",
      stage_name: "Payment",
      stage_status: "Not Started",
      nodes: [
        {
          node_id: "process_invoice_payment",
          node_name: "Process Invoice Payment",
          executor_role: "Client",
          assignee: "Client Finance",
          due_date: "2026-07-08",
          completion_date: null,
          status: "Not Started",
          is_client_action: true,
          requires_form: false,
          form_id: "",
          requires_attachment: true,
          accepted_format: ["PDF", "PNG", "JPG"],
          required_documents: ["Payment Proof"],
          requires_approval: false,
        },
      ],
    },
  ],
});

const workflowCatalog: Record<string, () => OrderWorkflow> = {
  "EOR::Onboarding Service": createOnboardingWorkflow,
  "GPO::Payroll Monthly Service": createPayrollWorkflow,
};

const getWorkflowForService = (serviceType: BusinessType, serviceName: string) => {
  const factory = workflowCatalog[`${serviceType}::${serviceName}`] ?? createOnboardingWorkflow;
  return factory();
};

const computeStageStatus = (nodes: OrderWorkflowNode[]): OrderStageStatus => {
  if (nodes.length > 0 && nodes.every((node) => node.status === "Completed")) return "Completed";
  if (nodes.some((node) => node.status !== "Not Started")) return "In Progress";
  return "Not Started";
};

const summarizeOrderProgress = (workflow: OrderWorkflow) => {
  const stages = workflow.stages.map((stage) => ({ ...stage, stage_status: computeStageStatus(stage.nodes) }));
  const activeStage = stages.find((stage) => stage.stage_status === "In Progress") ?? stages.find((stage) => stage.stage_status !== "Completed") ?? stages[stages.length - 1];
  const activeNode =
    activeStage?.nodes.find((node) => node.status !== "Completed") ??
    activeStage?.nodes[activeStage.nodes.length - 1] ??
    stages.flatMap((stage) => stage.nodes).find((node) => node.status !== "Completed");
  return {
    workflow: { ...workflow, stages },
    current_stage: activeStage?.stage_name ?? "-",
    current_node: activeNode?.node_name ?? "-",
    due_date: activeNode?.due_date ?? "-",
  };
};

const makeOperationLog = (type: string, target: string, content: string): OperationLog => ({
  id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  time: orderNowText,
  actor: "Admin",
  type,
  target,
  content,
});

const withOrderProgress = (order: ServiceOrder): ServiceOrder => {
  const summary = summarizeOrderProgress(order.workflow);
  return {
    ...order,
    workflow: summary.workflow,
    current_stage: summary.current_stage,
    current_node: summary.current_node,
    due_date: summary.due_date,
  };
};

const createInitialOrders = (): ServiceOrder[] => [
  withOrderProgress({
    order_id: "ORD-EOR-ONB-001",
    order_name: "Japan EOR Onboarding Order",
    client: "Demo Client B",
    country_location: "Japan",
    service_type: "EOR",
    service_name: "Onboarding Service",
    project: "Japan EOR Onboarding Project",
    legal_entity: "Partner Entity",
    pay_group: "Local Employee Group",
    pay_frequency: "Monthly",
    pay_period: "2026-07",
    pay_date: "2026-07-25",
    sd_team: ["总部项目对接人", "当地实操人员"],
    client_contact: ["Client HRBP"],
    approval_role: ["Client Legal Approver"],
    status: "In Progress",
    current_stage: "",
    current_node: "",
    due_date: "",
    created_time: "2026-07-01 09:00:00",
    updated_time: "2026-07-02 10:30:00",
    expected_completion_date: "2026-07-20",
    workflow: getWorkflowForService("EOR", "Onboarding Service"),
    attachments: [],
    forms: [
      {
        id: "form_record_onboarding_order",
        form_id: "onboarding_order_form",
        form_name: "Onboarding Order Form",
        stage_name: "Place Order",
        node_id: "submit_onboarding_order",
        node_name: "Submit Onboarding Order",
        filled_by: "Client HRBP",
        status: "Confirmed",
        submitted_time: "2026-07-01 15:30:00",
      },
    ],
    approval_records: [
      {
        id: "approval_review_order",
        node_name: "Review Order Information",
        approver: "SD Owner",
        action: "Approve",
        comment: "Order information is complete.",
        approval_time: "2026-07-02 09:10:00",
        status: "Approved",
      },
    ],
    messages: [
      {
        id: "msg_001",
        sender: "SD Owner",
        sent_time: "2026-07-02 10:20:00",
        content: "Please upload the employee documents before the due date.",
        linked_node: "Upload Employee Basic Information",
      },
    ],
    operation_logs: [
      { id: "log_create_order", time: "2026-07-01 09:00:00", actor: "Client HRBP", type: "创建订单", target: "Japan EOR Onboarding Order", content: "Submitted onboarding order." },
      { id: "log_approve_order", time: "2026-07-02 09:10:00", actor: "SD Owner", type: "审批通过", target: "Review Order Information", content: "Approved order information." },
    ],
  }),
  withOrderProgress({
    order_id: "ORD-GPO-202607-001",
    order_name: "Singapore Payroll July Order",
    client: "Nekie Group",
    country_location: "Singapore",
    service_type: "GPO",
    service_name: "Payroll Monthly Service",
    project: "APAC Talent Expansion Project",
    legal_entity: "Nekie SG Pte. Ltd.",
    pay_group: "Monthly Payroll Group",
    pay_frequency: "Monthly",
    pay_period: "2026-07",
    pay_date: "2026-07-30",
    sd_team: ["总部项目对接人", "当地实操人员", "财务"],
    client_contact: ["Client Payroll"],
    approval_role: ["Client Finance"],
    status: "Waiting Approval",
    current_stage: "",
    current_node: "",
    due_date: "",
    created_time: "2026-07-01 08:30:00",
    updated_time: "2026-07-02 09:40:00",
    expected_completion_date: "2026-07-08",
    workflow: getWorkflowForService("GPO", "Payroll Monthly Service"),
    attachments: [
      {
        id: "att_payroll_data",
        file_name: "movement_data_july.xlsx",
        file_type: "XLSX",
        file_size: "244 KB",
        stage_name: "Data Collection",
        node_id: "upload_monthly_payroll_data",
        node_name: "Upload Monthly Payroll Data",
        uploaded_by: "Client Payroll",
        uploaded_time: "2026-07-01 12:12:00",
        status: "Confirmed",
      },
    ],
    forms: [
      {
        id: "form_payroll_movement",
        form_id: "payroll_movement_form",
        form_name: "Payroll Movement Data Form",
        stage_name: "Data Collection",
        node_id: "upload_monthly_payroll_data",
        node_name: "Upload Monthly Payroll Data",
        filled_by: "Client Payroll",
        status: "Submitted",
        submitted_time: "2026-07-01 12:20:00",
      },
    ],
    approval_records: [],
    messages: [],
    operation_logs: [
      { id: "log_payroll_create", time: "2026-07-01 08:30:00", actor: "Client Payroll", type: "创建订单", target: "Singapore Payroll July Order", content: "Created monthly payroll order." },
      { id: "log_payroll_upload", time: "2026-07-01 12:12:00", actor: "Client Payroll", type: "上传附件", target: "Upload Monthly Payroll Data", content: "Uploaded movement_data_july.xlsx." },
    ],
  }),
];

function App() {
  const [schemes, setSchemes] = useState<Scheme[]>(() => clone(initialSchemes));
  const [forms, setForms] = useState<FormDefinition[]>(() => clone(initialForms));
  const [roles, setRoles] = useState<RolePermission[]>(() => clone(initialRoles));
  const [features, setFeatures] = useState<FeaturePermission[]>(() => clone(initialFeatures));
  const [countryRules, setCountryRules] = useState<CountryRule[]>(() => clone(initialCountryRules));
  const [projects, setProjects] = useState<Project[]>(() => createInitialProjects());

  const [menu, setMenu] = useState<MenuKey>("home");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectSchemeId, setSelectedProjectSchemeId] = useState<string | null>(null);
  const [selectedProjectNodeId, setSelectedProjectNodeId] = useState<string | null>(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>("stage-gpo-data");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeDrawerOpen, setNodeDrawerOpen] = useState(false);

  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [fieldPanelTab, setFieldPanelTab] = useState<"field" | "form" | "rule">("field");
  const [permissionTab, setPermissionTab] = useState<PermissionTab>("role");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [selectedCountryRuleId, setSelectedCountryRuleId] = useState<string | null>(null);
  const [countryFilters, setCountryFilters] = useState<CountryFilters>({
    country: "",
    serviceType: "",
    supportStatus: "",
    localEntity: "",
    status: "",
  });
  const [countryRuleError, setCountryRuleError] = useState("");

  const [createSchemeOpen, setCreateSchemeOpen] = useState(false);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [addProjectSchemeOpen, setAddProjectSchemeOpen] = useState(false);
  const [timeDrawerOpen, setTimeDrawerOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({ name: "", businessType: "GPO" as BusinessType });
  const [newForm, setNewForm] = useState({ name: "", businessType: "EOR" as BusinessType });
  const [newProject, setNewProject] = useState({
    name: "APAC Talent Expansion Project",
    customer: "APAC Talent Ltd.",
    country: "Singapore",
    serviceTypes: ["EOR", "GPO", "Work Visa"] as ProjectServiceType[],
    owner: "总部项目对接人",
    description: "该项目用于 APAC 区域员工入职、签证和月度薪资服务交付。",
  });
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [editingStage, setEditingStage] = useState<{ id: string; name: string } | null>(null);
  const [jsonModal, setJsonModal] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"PC" | "Mobile" | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dashboardOrderIntent, setDashboardOrderIntent] = useState<DashboardOrderIntent | null>(null);

  const selectedScheme = schemes.find((item) => item.id === selectedSchemeId) ?? null;
  const selectedProject = projects.find((item) => item.id === selectedProjectId) ?? null;
  const selectedProjectScheme = selectedProject?.schemes.find((item) => item.id === selectedProjectSchemeId) ?? selectedProject?.schemes[0] ?? null;
  const selectedProjectNode = selectedProjectScheme?.stages.flatMap((stage) => stage.nodes).find((node) => node.id === selectedProjectNodeId) ?? null;
  const selectedStage = selectedScheme?.stages.find((item) => item.id === selectedStageId) ?? selectedScheme?.stages[0] ?? null;
  const selectedNode = selectedStage?.nodes.find((item) => item.id === selectedNodeId) ?? null;
  const selectedForm = forms.find((item) => item.id === selectedFormId) ?? null;
  const selectedField = selectedForm?.fields.find((item) => item.id === selectedFieldId) ?? null;
  const selectedCountryRule = countryRules.find((item) => item.id === selectedCountryRuleId) ?? null;

  useEffect(() => {
    if (settingsOpen && menu === "form") {
      setMenu("scheme");
      setSelectedFormId(null);
      setSelectedFieldId(null);
    }
  }, [menu, settingsOpen]);

  const enterSchemeDetail = (scheme: Scheme) => {
    setSelectedSchemeId(scheme.id);
    setSelectedStageId(scheme.stages[1]?.id ?? scheme.stages[0]?.id ?? "");
    setMenu("scheme");
  };

  const createScheme = () => {
    if (!newScheme.name.trim()) return;
    const code = createCode("SCHEME", schemes.length + 1);
    const scheme: Scheme = {
      id: `scheme-${Date.now()}`,
      code,
      name: newScheme.name.trim(),
      businessType: newScheme.businessType,
      creator: "Admin",
      createdAt: nowText,
      updatedAt: nowText,
      status: "草稿",
      applicableCountry: {
        country: "Singapore",
        serviceType: [newScheme.businessType],
      },
      stages: ["Place Order", "Data Collection", "Payroll Processing", "Payment"].map((name, index) => ({
        id: `stage-${Date.now()}-${index}`,
        name,
        nodes: [],
      })),
    };
    setSchemes((prev) => [scheme, ...prev]);
    setCreateSchemeOpen(false);
    setNewScheme({ name: "", businessType: "GPO" });
    setSelectedSchemeId(scheme.id);
    setSelectedStageId(scheme.stages[0].id);
  };

  const updateScheme = (schemeId: string, updater: (scheme: Scheme) => Scheme) => {
    setSchemes((prev) => prev.map((scheme) => (scheme.id === schemeId ? { ...updater(scheme), updatedAt: nowText } : scheme)));
  };

  const addStage = () => {
    if (!selectedScheme || !newStageName.trim()) return;
    const stage: Stage = { id: `stage-${Date.now()}`, name: newStageName.trim(), nodes: [] };
    updateScheme(selectedScheme.id, (scheme) => ({ ...scheme, stages: [...scheme.stages, stage] }));
    setSelectedStageId(stage.id);
    setNewStageName("");
    setStageModalOpen(false);
  };

  const saveStageName = () => {
    if (!selectedScheme || !editingStage) return;
    updateScheme(selectedScheme.id, (scheme) => ({
      ...scheme,
      stages: scheme.stages.map((stage) => (stage.id === editingStage.id ? { ...stage, name: editingStage.name.trim() || stage.name } : stage)),
    }));
    setEditingStage(null);
  };

  const addNode = () => {
    if (!selectedScheme || !selectedStage) return;
    const index = selectedStage.nodes.length + 1;
    const next: WorkflowNode = {
      id: `node-${Date.now()}`,
      code: `NODE-${selectedScheme.businessType}-${String(Date.now()).slice(-5)}`,
      name: `New Workflow Node ${index}`,
      description: "",
      roles: ["总部项目对接人"],
      owner: "总部项目对接人",
      dueDate: "-",
      completionDate: "-",
      status: "未开始",
      onlyOneRequired: false,
      requiresAttachment: false,
      attachmentFormats: [],
      requiresForm: false,
      linkedFormId: "",
      isClientAction: false,
      countryRuleReference: {
        enabled: false,
        fields: [],
        allowSupplementDocuments: true,
      },
    };
    updateScheme(selectedScheme.id, (scheme) => ({
      ...scheme,
      stages: scheme.stages.map((stage) => (stage.id === selectedStage.id ? { ...stage, nodes: [...stage.nodes, next] } : stage)),
    }));
    setSelectedNodeId(next.id);
  };

  const updateNode = (nodeId: string, patch: Partial<WorkflowNode>) => {
    if (!selectedScheme) return;
    updateScheme(selectedScheme.id, (scheme) => ({
      ...scheme,
      stages: scheme.stages.map((stage) => ({
        ...stage,
        nodes: stage.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch, owner: (patch.roles ?? node.roles).join(" / ") } : node)),
      })),
    }));
  };

  const createForm = () => {
    if (!newForm.name.trim()) return;
    const code = createCode("FORM", forms.length + 1);
    const form: FormDefinition = {
      id: code,
      code,
      name: newForm.name.trim(),
      businessType: newForm.businessType,
      creator: "Admin",
      updatedAt: nowText,
      status: "草稿",
      fields: [],
    };
    setForms((prev) => [form, ...prev]);
    setCreateFormOpen(false);
    setNewForm({ name: "", businessType: "EOR" });
    setSelectedFormId(form.id);
    setSelectedFieldId(null);
  };

  const updateForm = (formId: string, updater: (form: FormDefinition) => FormDefinition) => {
    setForms((prev) => prev.map((form) => (form.id === formId ? { ...updater(form), updatedAt: nowText } : form)));
  };

  const addField = (type: FieldType, label: string) => {
    if (!selectedForm) return;
    const field = createField(type, label, Date.now());
    updateForm(selectedForm.id, (form) => ({ ...form, fields: [...form.fields, field] }));
    setSelectedFieldId(field.id);
    setFieldPanelTab("field");
  };

  const updateField = (fieldId: string, updater: (field: FormField) => FormField) => {
    if (!selectedForm) return;
    updateForm(selectedForm.id, (form) => ({
      ...form,
      fields: form.fields.map((field) => (field.id === fieldId ? updater(field) : field)),
    }));
  };

  const deleteField = (fieldId: string) => {
    if (!selectedForm) return;
    updateForm(selectedForm.id, (form) => ({ ...form, fields: form.fields.filter((field) => field.id !== fieldId) }));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const updateCountryRule = (ruleId: string, updater: (rule: CountryRule) => CountryRule) => {
    setCountryRules((prev) => prev.map((rule) => (rule.id === ruleId ? { ...updater(rule), updated_at: nowFullText } : rule)));
  };

  const validateCountryRule = (rule: CountryRule) => {
    const duplicated = countryRules.some((item) => item.id !== rule.id && item.country === rule.country && item.service_type === rule.service_type && item.status !== "inactive");
    if (duplicated) return "Country + Service Type 不能重复";
    if (rule.local_entity === "Partner" && !rule.partner_name.trim()) return "Local Entity 为 Partner 时必须填写 Partner Name";
    if (rule.review_required && rule.reviewer_role.length === 0) return "Review Required = true 时必须选择 Reviewer Role";
    return "";
  };

  const saveCountryRule = (status?: CountryRuleStatus) => {
    if (!selectedCountryRule) return;
    const error = validateCountryRule(selectedCountryRule);
    if (error) {
      setCountryRuleError(error);
      return;
    }
    updateCountryRule(selectedCountryRule.id, (rule) => ({ ...rule, status: status ?? rule.status }));
    setCountryRuleError("");
    if (status === "active") setSelectedCountryRuleId(null);
  };

  const createCountryRule = () => {
    const rule = createEmptyCountryRule(countryRules.length);
    setCountryRules((prev) => [rule, ...prev]);
    setCountryRuleError("");
    setSelectedCountryRuleId(rule.id);
  };

  const copyCountryRule = (rule: CountryRule) => {
    const next = clone(rule);
    next.id = `country_rule_copy_${Date.now()}`;
    next.country = `${rule.country} Copy`;
    next.status = "draft";
    next.created_at = nowFullText;
    next.updated_at = nowFullText;
    setCountryRules((prev) => [next, ...prev]);
    setCountryRuleError("");
    setSelectedCountryRuleId(next.id);
  };

  const updateProject = (projectId: string, updater: (project: Project) => Project) => {
    setProjects((prev) => prev.map((project) => (project.id === projectId ? { ...updater(project), updatedAt: "2026-07-01 11:20" } : project)));
  };

  const createProject = () => {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: `project-${Date.now()}`,
      code: `PROJECT-${String(projects.length + 1).padStart(3, "0")}`,
      name: newProject.name.trim(),
      customer: newProject.customer.trim() || "APAC Talent Ltd.",
      country: newProject.country,
      serviceTypes: newProject.serviceTypes,
      owner: newProject.owner,
      description: newProject.description,
      createdAt: "2026-07-01 09:30",
      updatedAt: "2026-07-01 11:20",
      status: "草稿",
      schemes: [],
    };
    setProjects((prev) => [project, ...prev]);
    setSelectedProjectId(project.id);
    setSelectedProjectSchemeId(null);
    setSelectedProjectNodeId(null);
    setCreateProjectOpen(false);
  };

  const addSchemeToProject = (template: ProjectSchemeInstance) => {
    if (!selectedProject) return;
    const nextScheme = cloneProjectScheme(template);
    updateProject(selectedProject.id, (project) => ({ ...project, schemes: [...project.schemes, nextScheme] }));
    setSelectedProjectSchemeId(nextScheme.id);
    setSelectedProjectNodeId(nextScheme.stages[0]?.nodes[0]?.id ?? null);
    setAddProjectSchemeOpen(false);
  };

  const updateProjectNode = (projectId: string, schemeId: string, nodeId: string, patch: Partial<ProjectNode>) => {
    updateProject(projectId, (project) => ({
      ...project,
      schemes: project.schemes.map((scheme) =>
        scheme.id === schemeId
          ? {
              ...scheme,
              stages: scheme.stages.map((stage) => ({
                ...stage,
                nodes: stage.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
              })),
            }
          : scheme,
      ),
    }));
  };

  const saveProjectNodeTime = (rule: ProjectTimeRule) => {
    if (!selectedProject || !selectedProjectScheme || !selectedProjectNode) return;
    updateProjectNode(selectedProject.id, selectedProjectScheme.id, selectedProjectNode.id, {
      timeRule: rule,
      timeRuleSummary: buildTimeRuleSummary(rule),
      status: "已配置",
    });
    setTimeDrawerOpen(false);
  };

  const clearProjectNodeTime = (nodeId: string) => {
    if (!selectedProject || !selectedProjectScheme) return;
    updateProjectNode(selectedProject.id, selectedProjectScheme.id, nodeId, {
      timeRule: null,
      timeRuleSummary: "暂无",
      status: "未配置",
    });
  };

  const mainContent = (() => {
    if (menu === "home") {
      return (
        <HomeDashboard
          onNavigateOrders={(intent) => {
            setDashboardOrderIntent({ ...intent, stamp: Date.now() });
            setMenu("order");
            setSettingsOpen(false);
          }}
        />
      );
    }
    if (menu === "order") {
      return <OrderManagement countryRules={countryRules} dashboardIntent={dashboardOrderIntent} />;
    }
    if (menu === "project") {
      return selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          selectedSchemeId={selectedProjectSchemeId}
          selectedNodeId={selectedProjectNodeId}
          onBack={() => {
            setSelectedProjectId(null);
            setSelectedProjectSchemeId(null);
            setSelectedProjectNodeId(null);
            setTimeDrawerOpen(false);
          }}
          onChange={(patch) => updateProject(selectedProject.id, (project) => ({ ...project, ...patch }))}
          onActivate={() => updateProject(selectedProject.id, (project) => ({ ...project, status: "启用" }))}
          onAddScheme={() => setAddProjectSchemeOpen(true)}
          onSelectScheme={(schemeId) => {
            setSelectedProjectSchemeId(schemeId);
            const scheme = selectedProject.schemes.find((item) => item.id === schemeId);
            setSelectedProjectNodeId(scheme?.stages[0]?.nodes[0]?.id ?? null);
          }}
          onRemoveScheme={(schemeId) =>
            updateProject(selectedProject.id, (project) => {
              const nextSchemes = project.schemes.filter((scheme) => scheme.id !== schemeId);
              if (selectedProjectSchemeId === schemeId) {
                setSelectedProjectSchemeId(nextSchemes[0]?.id ?? null);
                setSelectedProjectNodeId(nextSchemes[0]?.stages[0]?.nodes[0]?.id ?? null);
              }
              return { ...project, schemes: nextSchemes };
            })
          }
          onSelectNode={setSelectedProjectNodeId}
          onConfigNode={(nodeId) => {
            setSelectedProjectNodeId(nodeId);
            setTimeDrawerOpen(true);
          }}
          onClearNode={clearProjectNodeTime}
        />
      ) : (
        <ProjectManagement
          projects={projects}
          onCreate={() => setCreateProjectOpen(true)}
          onOpen={(project) => {
            setSelectedProjectId(project.id);
            setSelectedProjectSchemeId(project.schemes[0]?.id ?? null);
            setSelectedProjectNodeId(project.schemes[0]?.stages[0]?.nodes[0]?.id ?? null);
          }}
        />
      );
    }
    if (menu === "scheme") {
      return selectedScheme ? (
        <SchemeDetail
          scheme={selectedScheme}
          countryRules={countryRules}
          selectedStage={selectedStage}
          selectedNodeId={selectedNodeId}
          onBack={() => {
            setSelectedSchemeId(null);
            setNodeDrawerOpen(false);
          }}
          onSchemeNameBlur={(name) => updateScheme(selectedScheme.id, (scheme) => ({ ...scheme, name: name.trim() || scheme.name }))}
          onApplicableCountryChange={(patch) => updateScheme(selectedScheme.id, (scheme) => ({ ...scheme, applicableCountry: { ...scheme.applicableCountry, ...patch } }))}
          onStageSelect={setSelectedStageId}
          onAddStage={() => setStageModalOpen(true)}
          onStageEdit={(stage) => setEditingStage({ id: stage.id, name: stage.name })}
          onDeleteStage={(stageId) =>
            updateScheme(selectedScheme.id, (scheme) => {
              const nextStages = scheme.stages.filter((stage) => stage.id !== stageId);
              if (stageId === selectedStageId) setSelectedStageId(nextStages[0]?.id ?? "");
              return { ...scheme, stages: nextStages };
            })
          }
          onAddNode={addNode}
          onNodeSelect={setSelectedNodeId}
          onNodeDelete={(nodeId) => {
            updateScheme(selectedScheme.id, (scheme) => ({
              ...scheme,
              stages: scheme.stages.map((stage) => ({ ...stage, nodes: stage.nodes.filter((node) => node.id !== nodeId) })),
            }));
            if (selectedNodeId === nodeId) setSelectedNodeId(null);
          }}
          onNodeSettings={(nodeId) => {
            setSelectedNodeId(nodeId);
            setNodeDrawerOpen(true);
          }}
        />
      ) : (
        <SchemeList schemes={schemes} onCreate={() => setCreateSchemeOpen(true)} onOpen={enterSchemeDetail} onDelete={(id) => setSchemes((prev) => prev.filter((item) => item.id !== id))} />
      );
    }
    if (menu === "form") {
      return selectedForm ? (
        <FormDesigner
          form={selectedForm}
          selectedField={selectedField}
          selectedFieldId={selectedFieldId}
          panelTab={fieldPanelTab}
          onBack={() => setSelectedFormId(null)}
          onSelectField={setSelectedFieldId}
          onAddField={addField}
          onDeleteField={deleteField}
          onCopyField={(field) => {
            const copy = { ...clone(field), id: `${field.id}_copy_${Date.now()}`, field_key: `${field.field_key}_copy`, label: `${field.label} Copy` };
            updateForm(selectedForm.id, (form) => ({ ...form, fields: [...form.fields, copy] }));
            setSelectedFieldId(copy.id);
          }}
          onClear={() => {
            updateForm(selectedForm.id, (form) => ({ ...form, fields: [] }));
            setSelectedFieldId(null);
          }}
          onGenerateJson={() => setJsonModal(JSON.stringify(selectedForm, null, 2))}
          onPreview={setPreviewMode}
          onSave={() => updateForm(selectedForm.id, (form) => ({ ...form, status: "启用" }))}
          onPanelTabChange={setFieldPanelTab}
          onUpdateField={updateField}
          onUpdateForm={(patch) => updateForm(selectedForm.id, (form) => ({ ...form, ...patch }))}
          countryRules={countryRules}
        />
      ) : (
        <FormList forms={forms} onCreate={() => setCreateFormOpen(true)} onOpen={(form) => setSelectedFormId(form.id)} onDelete={(id) => setForms((prev) => prev.filter((item) => item.id !== id))} />
      );
    }
    if (menu === "country") {
      return selectedCountryRule ? (
        <CountryRuleDetail
          rule={selectedCountryRule}
          error={countryRuleError}
          allRules={countryRules}
          onBack={() => {
            setSelectedCountryRuleId(null);
            setCountryRuleError("");
          }}
          onChange={(updater) => updateCountryRule(selectedCountryRule.id, updater)}
          onSaveDraft={() => saveCountryRule("draft")}
          onPublish={() => saveCountryRule("active")}
          onDeactivate={() => saveCountryRule("inactive")}
        />
      ) : (
        <CountryConfigList
          rules={countryRules}
          filters={countryFilters}
          onFiltersChange={setCountryFilters}
          onCreate={createCountryRule}
          onOpen={(id) => {
            setCountryRuleError("");
            setSelectedCountryRuleId(id);
          }}
          onDelete={(id) => setCountryRules((prev) => prev.filter((item) => item.id !== id))}
          onCopy={copyCountryRule}
        />
      );
    }
    return (
      <PermissionSettings
        tab={permissionTab}
        roles={roles}
        features={features}
        countryRules={countryRules}
        selectedRoleId={selectedRoleId}
        selectedFeatureId={selectedFeatureId}
        onTabChange={setPermissionTab}
        onRoleSelect={setSelectedRoleId}
        onFeatureSelect={setSelectedFeatureId}
        onRoleChange={(roleId, patch) => setRoles((prev) => prev.map((role) => (role.id === roleId ? { ...role, ...patch, updatedAt: nowText } : role)))}
        onFeatureChange={(featureId, patch) => setFeatures((prev) => prev.map((feature) => (feature.id === featureId ? { ...feature, ...patch } : feature)))}
      />
    );
  })();

  return (
    <div className="app-shell">
      <GlobalWatermark text={watermarkText} />
      <main className={settingsOpen ? "workspace with-secondary-menu" : "workspace"}>{mainContent}</main>
      <LeftMenu
        active={menu}
        onChange={(key) => {
          setMenu(key);
          setSettingsOpen(false);
          setSelectedProjectId(null);
          setSelectedSchemeId(null);
          setSelectedFormId(null);
          setSelectedCountryRuleId(null);
          setNodeDrawerOpen(false);
          setTimeDrawerOpen(false);
        }}
        onSettings={() => {
          setMenu("scheme");
          setSelectedProjectId(null);
          setSelectedSchemeId(null);
          setSelectedFormId(null);
          setSelectedCountryRuleId(null);
          setNodeDrawerOpen(false);
          setTimeDrawerOpen(false);
          setSettingsOpen(true);
        }}
      />

      {createSchemeOpen && (
        <Modal title="创建方案" onClose={() => setCreateSchemeOpen(false)} footer={<button className="primary-btn" onClick={createScheme}>确认创建</button>}>
          <LabeledInput label="方案名称" required value={newScheme.name} onChange={(value) => setNewScheme((prev) => ({ ...prev, name: value }))} placeholder="请输入方案名称" />
          <LabeledSelect label="适用业务类型" value={newScheme.businessType} options={businessTypes} onChange={(value) => setNewScheme((prev) => ({ ...prev, businessType: value as BusinessType }))} />
        </Modal>
      )}

      {createFormOpen && (
        <Modal title="创建表单" onClose={() => setCreateFormOpen(false)} footer={<button className="primary-btn" onClick={createForm}>确认创建</button>}>
          <LabeledInput label="表单名称" required value={newForm.name} onChange={(value) => setNewForm((prev) => ({ ...prev, name: value }))} placeholder="请输入表单名称" />
          <LabeledSelect label="业务类型" value={newForm.businessType} options={businessTypes} onChange={(value) => setNewForm((prev) => ({ ...prev, businessType: value as BusinessType }))} />
        </Modal>
      )}

      {createProjectOpen && (
        <Modal title="创建项目" onClose={() => setCreateProjectOpen(false)} footer={<><button className="secondary-btn" onClick={() => setCreateProjectOpen(false)}>取消</button><button className="primary-btn" onClick={createProject}>保存并进入详情</button></>}>
          <LabeledInput label="项目名称" required value={newProject.name} onChange={(value) => setNewProject((prev) => ({ ...prev, name: value }))} />
          <LabeledInput label="客户名称" value={newProject.customer} onChange={(value) => setNewProject((prev) => ({ ...prev, customer: value }))} />
          <LabeledSelect label="国家" value={newProject.country} options={countryOptions} onChange={(value) => setNewProject((prev) => ({ ...prev, country: value }))} />
          <MultiSelectDropdown label="服务类型" options={projectServiceTypeOptions} values={newProject.serviceTypes} onChange={(values) => setNewProject((prev) => ({ ...prev, serviceTypes: values as ProjectServiceType[] }))} />
          <LabeledSelect label="项目负责人" value={newProject.owner} options={projectOwnerOptions} onChange={(value) => setNewProject((prev) => ({ ...prev, owner: value }))} />
          <label className="form-row"><span>项目说明</span><textarea value={newProject.description} rows={4} onChange={(event) => setNewProject((prev) => ({ ...prev, description: event.target.value }))} /></label>
        </Modal>
      )}

      {addProjectSchemeOpen && selectedProject && (
        <ProjectSchemePickerModal
          project={selectedProject}
          templates={projectSchemeCatalog}
          onClose={() => setAddProjectSchemeOpen(false)}
          onAdd={addSchemeToProject}
        />
      )}

      {stageModalOpen && (
        <Modal title="新增步骤" onClose={() => setStageModalOpen(false)} footer={<button className="primary-btn" onClick={addStage}>确认</button>}>
          <LabeledInput label="步骤名称" required value={newStageName} onChange={setNewStageName} placeholder="例如 Contract Preparation" />
        </Modal>
      )}

      {editingStage && (
        <Modal title="编辑步骤" onClose={() => setEditingStage(null)} footer={<button className="primary-btn" onClick={saveStageName}>保存</button>}>
          <LabeledInput label="步骤名称" required value={editingStage.name} onChange={(name) => setEditingStage((prev) => (prev ? { ...prev, name } : prev))} />
        </Modal>
      )}

      {jsonModal && (
        <Modal title="当前表单 JSON" wide onClose={() => setJsonModal(null)}>
          <pre className="json-block">{jsonModal}</pre>
        </Modal>
      )}

      {previewMode && selectedForm && (
        <Modal title={`${previewMode} 预览`} wide={previewMode === "PC"} onClose={() => setPreviewMode(null)}>
          <div className={previewMode === "Mobile" ? "mobile-preview" : "pc-preview"}>
            <FormPreview fields={selectedForm.fields} />
          </div>
        </Modal>
      )}

      {settingsOpen && (
        <Drawer title="系统设置" onClose={() => setSettingsOpen(false)} narrow fromLeft plain>
          <div className="settings-menu-panel">
            <div className="settings-search-row">
              <input placeholder="输入关键字查询" />
              <button onClick={() => setSettingsOpen(false)} title="收起">«</button>
            </div>
            <div className="settings-menu-list">
              <button className={menu === "scheme" ? "active" : ""} onClick={() => { setMenu("scheme"); setSelectedSchemeId(null); setSelectedFormId(null); setSelectedCountryRuleId(null); }}>方案设置</button>
              <button className={menu === "permission" ? "active" : ""} onClick={() => { setMenu("permission"); setSelectedSchemeId(null); setSelectedFormId(null); setSelectedCountryRuleId(null); }}>权限设置</button>
              <button className={menu === "country" ? "active" : ""} onClick={() => { setMenu("country"); setSelectedSchemeId(null); setSelectedFormId(null); setSelectedCountryRuleId(null); }}>国家配置</button>
            </div>
          </div>
        </Drawer>
      )}

      {nodeDrawerOpen && selectedScheme && selectedStage && selectedNode && (
        <NodeConfigDrawer
          node={selectedNode}
          onClose={() => setNodeDrawerOpen(false)}
          onChange={(patch) => updateNode(selectedNode.id, patch)}
        />
      )}

      {timeDrawerOpen && selectedProject && selectedProjectScheme && selectedProjectNode && (
        <ProjectTimeDrawer
          projectScheme={selectedProjectScheme}
          node={selectedProjectNode}
          onClose={() => setTimeDrawerOpen(false)}
          onSave={saveProjectNodeTime}
        />
      )}
    </div>
  );
}

function LeftMenu({ active, onChange, onSettings }: { active: MenuKey; onChange: (key: MenuKey) => void; onSettings: () => void }) {
  const items: { key: MenuKey; label: string; icon: string }[] = [
    { key: "home", label: "首页", icon: "⌂" },
    { key: "order", label: "订单", icon: "order" },
    { key: "project", label: "项目", icon: "project" },
  ];
  return (
    <aside className="left-menu">
      <div className="brand-block">
        <div className="brand-mark">E</div>
        <div>
          <strong>Engma</strong>
          <span>服务平台</span>
        </div>
      </div>
      <nav>
        {items.map((item) => (
          <button key={item.key} className={active === item.key ? "menu-item active" : "menu-item"} onClick={() => onChange(item.key)}>
            <span className="menu-icon"><MenuIcon icon={item.icon} /></span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="settings-btn" onClick={onSettings} title="系统设置" aria-label="系统设置">
        <span className="menu-icon">⚙</span>
        <span className="menu-label">设置</span>
      </button>
    </aside>
  );
}

function MenuIcon({ icon }: { icon: string }) {
  if (icon === "order") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 16H8" />
        <path d="M14 8H8" />
        <path d="M16 12H8" />
        <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (icon === "project") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
        <path d="M8 10v4" />
        <path d="M12 10v2" />
        <path d="M16 10v6" />
      </svg>
    );
  }
  return <>{icon}</>;
}

const dashboardRoles: DashboardRole[] = ["客户", "总部项目对接人", "财务", "当地实操人员"];
const dashboardDateRanges: DashboardDateRange[] = ["本月", "近 7 天", "近 30 天", "本季度", "自定义"];
const dashboardCountries = ["All", "Singapore", "Japan", "Vietnam", "China", "Malaysia"];
const dashboardServiceTypes: DashboardServiceType[] = ["All", "EOR", "GPO", "HRO", "RPO", "Contractor", "Benefits"];

const dashboardChartOrder: Record<DashboardRole, DashboardChartId[]> = {
  客户: ["todos", "due", "status", "workflow", "onboarding", "documents", "payroll", "distribution"],
  总部项目对接人: ["status", "due", "workflow", "todos", "documents", "onboarding", "payroll", "distribution"],
  财务: ["todos", "payroll", "due", "status", "documents", "workflow", "distribution", "onboarding"],
  当地实操人员: ["todos", "due", "workflow", "onboarding", "documents", "payroll", "status", "distribution"],
};

const roleClients: Record<DashboardRole, string[]> = {
  客户: ["Demo Client B"],
  总部项目对接人: ["Demo Client A", "Demo Client B", "Nekie Group", "BrightHire CN"],
  财务: ["Demo Client A", "Demo Client B", "Nekie Group"],
  当地实操人员: ["Demo Client B", "Nekie Group", "BrightHire CN"],
};

const dashboardOrders = [
  { order_id: "ORD-EOR-ONB-001", target_order_id: "ORD-EOR-ONB-001", order_name: "Japan EOR Onboarding Order", client: "Demo Client B", country: "Japan", service_type: "EOR", service_name: "Onboarding Service", project: "Japan EOR Onboarding Project", status: "In Progress" as OrderStatus, current_stage: "Employee", current_node: "Upload Employee Basic Information", total_nodes: 8, completed_nodes: 2, employee_count: 12 },
  { order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", order_name: "Singapore Payroll July Order", client: "Nekie Group", country: "Singapore", service_type: "GPO", service_name: "Payroll Monthly Service", project: "APAC Talent Expansion Project", status: "Waiting Approval" as OrderStatus, current_stage: "Payroll Processing", current_node: "Review Draft Payroll Report", total_nodes: 4, completed_nodes: 1, employee_count: 86 },
  { order_id: "ORD-RPO-VN-001", order_name: "Vietnam Candidate Hiring Order", client: "Demo Client A", country: "Vietnam", service_type: "RPO", service_name: "Candidate Recruitment", project: "Vietnam Hiring Sprint", status: "Overdue" as OrderStatus, current_stage: "Candidate Review", current_node: "Review Candidate List", total_nodes: 6, completed_nodes: 3, employee_count: 9 },
  { order_id: "ORD-HRO-CN-001", order_name: "China HRO Service Order", client: "BrightHire CN", country: "China", service_type: "HRO", service_name: "HR Operations Service", project: "China HR Ops Retainer", status: "Completed" as OrderStatus, current_stage: "Service Delivery", current_node: "Monthly HR Report", total_nodes: 5, completed_nodes: 5, employee_count: 38 },
  { order_id: "ORD-BEN-MY-001", order_name: "Malaysia Benefits Setup", client: "Demo Client A", country: "Malaysia", service_type: "Benefits", service_name: "Benefits Administration", project: "Malaysia Benefits Launch", status: "Submitted" as OrderStatus, current_stage: "Plan Setup", current_node: "Collect Benefits Policy", total_nodes: 5, completed_nodes: 1, employee_count: 24 },
];

const dashboardTasks = [
  { task_id: "task_upload_employee_info", task_name: "Upload Employee Basic Information", order_id: "ORD-EOR-ONB-001", target_order_id: "ORD-EOR-ONB-001", client: "Demo Client B", country: "Japan", service_type: "EOR", project: "Japan EOR Onboarding Project", stage: "Employee", node: "Upload Employee Basic Information", due_date: "2026-07-05", status: "Waiting Client", owner_role: "客户" as DashboardRole, action_type: "upload_attachment" },
  { task_id: "task_review_report", task_name: "Review Draft Payroll Report", order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", project: "APAC Talent Expansion Project", stage: "Payroll Processing", node: "Review Draft Payroll Report", due_date: "2026-07-04", status: "Waiting Approval", owner_role: "客户" as DashboardRole, action_type: "approve" },
  { task_id: "task_prepare_contract", task_name: "Prepare Employment Contract", order_id: "ORD-EOR-ONB-001", target_order_id: "ORD-EOR-ONB-001", client: "Demo Client B", country: "Japan", service_type: "EOR", project: "Japan EOR Onboarding Project", stage: "Contract", node: "Prepare Employment Contract", due_date: "2026-07-10", status: "In Progress", owner_role: "当地实操人员" as DashboardRole, action_type: "mark_complete" },
  { task_id: "task_invoice", task_name: "Upload Payroll Invoice", order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", project: "APAC Talent Expansion Project", stage: "Payment", node: "Upload Payroll Invoice", due_date: "2026-07-07", status: "Due Soon", owner_role: "财务" as DashboardRole, action_type: "upload_attachment" },
  { task_id: "task_payment", task_name: "Confirm Payment", order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", project: "APAC Talent Expansion Project", stage: "Payment", node: "Confirm Payment", due_date: "2026-07-08", status: "Due Soon", owner_role: "财务" as DashboardRole, action_type: "confirm_payment" },
  { task_id: "task_candidate", task_name: "Review Candidate List", order_id: "ORD-RPO-VN-001", client: "Demo Client A", country: "Vietnam", service_type: "RPO", project: "Vietnam Hiring Sprint", stage: "Candidate Review", node: "Review Candidate List", due_date: "2026-07-01", status: "Overdue", owner_role: "总部项目对接人" as DashboardRole, action_type: "review" },
  { task_id: "task_local_review", task_name: "Review Employee Information", order_id: "ORD-EOR-ONB-001", target_order_id: "ORD-EOR-ONB-001", client: "Demo Client B", country: "Japan", service_type: "EOR", project: "Japan EOR Onboarding Project", stage: "Employee", node: "Validate Employee Information", due_date: "2026-07-07", status: "Not Started", owner_role: "当地实操人员" as DashboardRole, action_type: "review" },
  { task_id: "task_sd_follow", task_name: "Follow up Missing Documents", order_id: "ORD-EOR-ONB-001", target_order_id: "ORD-EOR-ONB-001", client: "Demo Client B", country: "Japan", service_type: "EOR", project: "Japan EOR Onboarding Project", stage: "Employee", node: "Upload Employee Basic Information", due_date: "2026-07-05", status: "Due Soon", owner_role: "总部项目对接人" as DashboardRole, action_type: "remind" },
];

const dashboardDocuments = [
  { order_id: "ORD-EOR-ONB-001", target_order_id: "ORD-EOR-ONB-001", client: "Demo Client B", country: "Japan", service_type: "EOR", service_name: "Onboarding Service", required: 6, uploaded: 3, confirmed: 2, rejected: 1, names: "Passport / ID Card / Employment Contract" },
  { order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", service_name: "Payroll Monthly Service", required: 4, uploaded: 3, confirmed: 2, rejected: 0, names: "Payroll Movement Data / Payroll Report" },
  { order_id: "ORD-RPO-VN-001", client: "Demo Client A", country: "Vietnam", service_type: "RPO", service_name: "Candidate Recruitment", required: 5, uploaded: 4, confirmed: 3, rejected: 1, names: "Candidate List / Interview Notes" },
  { order_id: "ORD-HRO-CN-001", client: "BrightHire CN", country: "China", service_type: "HRO", service_name: "HR Operations Service", required: 3, uploaded: 3, confirmed: 3, rejected: 0, names: "Monthly HR Report / Policy File" },
];

const dashboardOnboarding = [
  { stage: "信息待提交", count: 3, roleWeight: { 客户: 1.4, 总部项目对接人: 1, 财务: 0.4, 当地实操人员: 0.8 } },
  { stage: "信息已提交", count: 5, roleWeight: { 客户: 1.1, 总部项目对接人: 1, 财务: 0.5, 当地实操人员: 1 } },
  { stage: "信息审核中", count: 4, roleWeight: { 客户: 0.8, 总部项目对接人: 1, 财务: 0.4, 当地实操人员: 1.5 } },
  { stage: "合同准备中", count: 2, roleWeight: { 客户: 0.7, 总部项目对接人: 1, 财务: 0.4, 当地实操人员: 1.6 } },
  { stage: "合同待签署", count: 3, roleWeight: { 客户: 1.5, 总部项目对接人: 1, 财务: 0.4, 当地实操人员: 0.7 } },
  { stage: "已签署", count: 6, roleWeight: { 客户: 1, 总部项目对接人: 1, 财务: 0.8, 当地实操人员: 1 } },
  { stage: "已入职", count: 8, roleWeight: { 客户: 1.1, 总部项目对接人: 1, 财务: 1.1, 当地实操人员: 1.1 } },
  { stage: "入职异常", count: 1, roleWeight: { 客户: 1.2, 总部项目对接人: 1.4, 财务: 0.5, 当地实操人员: 1.3 } },
];

const dashboardPayroll = [
  { order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", pay_period: "2026-07", label: "Payroll Data Due", date: "2026-07-03", status: "Data Collection", owner_role: "客户" as DashboardRole },
  { order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", pay_period: "2026-07", label: "Payroll Report Due", date: "2026-07-04", status: "Report Review", owner_role: "客户" as DashboardRole },
  { order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", pay_period: "2026-07", label: "Payroll Invoice Due", date: "2026-07-07", status: "Invoice Review", owner_role: "财务" as DashboardRole },
  { order_id: "ORD-GPO-SG-001", target_order_id: "ORD-GPO-202607-001", client: "Nekie Group", country: "Singapore", service_type: "GPO", pay_period: "2026-07", label: "Pay Date", date: "2026-07-30", status: "Payment Pending", owner_role: "财务" as DashboardRole },
  { order_id: "ORD-HRO-CN-001", client: "BrightHire CN", country: "China", service_type: "HRO", pay_period: "2026-07", label: "Local Payroll Submission", date: "2026-07-12", status: "Processing", owner_role: "当地实操人员" as DashboardRole },
];

const dashboardDistribution = [
  { country: "Singapore", service_type: "GPO", order_count: 8, project_count: 3, employee_count: 120, client: "Nekie Group" },
  { country: "Japan", service_type: "EOR", order_count: 5, project_count: 2, employee_count: 18, client: "Demo Client B" },
  { country: "Vietnam", service_type: "RPO", order_count: 3, project_count: 1, employee_count: 9, client: "Demo Client A" },
  { country: "China", service_type: "HRO", order_count: 4, project_count: 1, employee_count: 38, client: "BrightHire CN" },
  { country: "Malaysia", service_type: "Benefits", order_count: 2, project_count: 1, employee_count: 24, client: "Demo Client A" },
  { country: "Singapore", service_type: "Contractor", order_count: 2, project_count: 1, employee_count: 16, client: "Demo Client A" },
];

const dashboardStatusLabelMap: Record<OrderStatus, string> = {
  Draft: "草稿",
  Submitted: "已提交",
  "In Progress": "进行中",
  "Waiting Client": "等待客户",
  "Waiting Approval": "等待审批",
  Completed: "已完成",
  Overdue: "已逾期",
  Cancelled: "已取消",
};

function HomeDashboard({ onNavigateOrders }: { onNavigateOrders: (intent: Omit<DashboardOrderIntent, "stamp">) => void }) {
  const todos = dashboardTasks.filter((task) => task.owner_role === "客户").slice(0, 4);
  const calendarItems = dashboardPayroll.slice(0, 4);
  const chartProps = {
    role: "客户" as DashboardRole,
    orders: dashboardOrders,
    tasks: [],
    riskTasks: [],
    documents: [],
    payrollRows: [],
    distributionRows: [],
    onboardingRows: [],
    statusCounts: [],
    onNavigateOrders,
  };

  return (
    <section className="page home-page">
      <PageHeader title="首页" compact />
      <div className="order-summary-grid home-summary-grid">
        <ReadonlyMetric label="今日待办" value="8" />
        <ReadonlyMetric label="本周截止" value="14" />
      </div>
      <div className="home-grid">
        <section className="home-panel">
          <div className="home-panel-head">
            <h2>服务日历</h2>
            <button className="link-btn" onClick={() => onNavigateOrders({ selectedOrderId: "ORD-GPO-202607-001" })}>查看全部</button>
          </div>
          <div className="calendar-list">
            {calendarItems.map((item) => (
              <button key={`${item.order_id}-${item.label}`} className="calendar-item" onClick={() => onNavigateOrders({ selectedOrderId: item.target_order_id ?? item.order_id })}>
                <div className="calendar-date"><strong>{item.date.slice(8)}</strong><span>{item.date.slice(5, 7)}月</span></div>
                <div><h3>{item.label}</h3><p>{item.country} · {item.pay_period}</p></div>
              </button>
            ))}
          </div>
        </section>
        <section className="home-panel">
          <div className="home-panel-head">
            <h2>我的待办</h2>
            <button className="link-btn" onClick={() => onNavigateOrders({ selectedOrderId: "ORD-EOR-ONB-001" })}>批量处理</button>
          </div>
          <div className="todo-list">
            {todos.map((todo) => (
              <button key={todo.task_id} className="todo-item" onClick={() => onNavigateOrders({ selectedOrderId: todo.target_order_id ?? todo.order_id })}>
                <div><h3>{todo.task_name}</h3><p>{todo.order_id} · {todo.due_date}</p></div>
                <Tag>{todo.status}</Tag>
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="dashboard-chart-grid home-workbench-grid">
        <WorkflowProgressChart {...chartProps} />
      </div>
    </section>
  );
}

type DashboardOrderRow = (typeof dashboardOrders)[number];
type DashboardTaskRow = (typeof dashboardTasks)[number];
type DashboardDocumentRow = (typeof dashboardDocuments)[number];
type DashboardPayrollRow = (typeof dashboardPayroll)[number];
type DashboardDistributionRow = (typeof dashboardDistribution)[number];
type DashboardChartProps = {
  role: DashboardRole;
  orders: DashboardOrderRow[];
  tasks: DashboardTaskRow[];
  riskTasks: DashboardTaskRow[];
  documents: DashboardDocumentRow[];
  payrollRows: DashboardPayrollRow[];
  distributionRows: DashboardDistributionRow[];
  onboardingRows: Array<{ stage: string; count: number }>;
  statusCounts: Array<{ status: OrderStatus; label: string; value: number }>;
  onNavigateOrders: (intent: Omit<DashboardOrderIntent, "stamp">) => void;
};

function DashboardCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusOverviewChart({ statusCounts, onNavigateOrders }: DashboardChartProps) {
  const total = Math.max(1, statusCounts.reduce((sum, item) => sum + item.value, 0));
  let offset = 0;
  const segments = statusCounts.filter((item) => item.value > 0).map((item) => {
    const dash = (item.value / total) * 100;
    const segment = { ...item, dash, offset };
    offset += dash;
    return segment;
  });
  return (
    <DashboardCard title="订单状态总览">
      <div className="status-overview-layout">
        <svg className="donut-chart" viewBox="0 0 120 120" role="img" aria-label="订单状态环形图">
          <circle cx="60" cy="60" r="42" className="donut-bg" />
          {segments.map((item) => (
            <circle
              key={item.status}
              cx="60"
              cy="60"
              r="42"
              className={`donut-segment status-${orderStatusClass(item.status)}`}
              strokeDasharray={`${item.dash} ${100 - item.dash}`}
              strokeDashoffset={-item.offset}
              onClick={() => onNavigateOrders({ status: item.status })}
            />
          ))}
          <text x="60" y="57" textAnchor="middle" className="donut-total">{total}</text>
          <text x="60" y="75" textAnchor="middle" className="donut-caption">Orders</text>
        </svg>
        <div className="status-list">
          {statusCounts.map((item) => (
            <button key={item.status} className="status-row" onClick={() => onNavigateOrders({ status: item.status })} title={`${item.label}: ${item.value} (${Math.round((item.value / total) * 100)}%)`}>
              <span className={`status-dot-mini ${orderStatusClass(item.status)}`} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </button>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

function TodoChart({ tasks, onNavigateOrders }: DashboardChartProps) {
  return (
    <DashboardCard title="我的待办事项" action={<span className="dashboard-count">{tasks.length}</span>}>
      <div className="dashboard-task-list">
        {tasks.slice(0, 5).map((task) => (
          <button key={task.task_id} className="dashboard-task-row" onClick={() => onNavigateOrders({ selectedOrderId: task.target_order_id ?? task.order_id })}>
            <div>
              <strong>{task.task_name}</strong>
              <span>{task.order_id} · {task.stage} · {task.project}</span>
            </div>
            <em className={task.status === "Overdue" ? "risk-overdue" : task.status === "Due Soon" ? "risk-soon" : ""}>{task.due_date}</em>
          </button>
        ))}
        {!tasks.length && <EmptyState text="当前筛选下暂无待办" />}
      </div>
    </DashboardCard>
  );
}

function DueTaskChart({ riskTasks, onNavigateOrders }: DashboardChartProps) {
  const groupLabel = (status: string) => (status === "Overdue" ? "已逾期" : status === "Due Soon" ? "3 天内到期" : "7 天内到期");
  return (
    <DashboardCard title="即将到期 / 已逾期任务">
      <div className="risk-task-list">
        {riskTasks.map((task) => (
          <button key={task.task_id} className={`risk-task-row ${task.status === "Overdue" ? "overdue" : "soon"}`} onClick={() => onNavigateOrders({ selectedOrderId: task.target_order_id ?? task.order_id })}>
            <span>{groupLabel(task.status)}</span>
            <strong>{task.task_name}</strong>
            <em>{task.order_id} · {task.client} · {task.due_date}</em>
          </button>
        ))}
        {!riskTasks.length && <EmptyState text="当前筛选下暂无临期任务" />}
      </div>
    </DashboardCard>
  );
}

function WorkflowProgressChart({ orders, onNavigateOrders }: DashboardChartProps) {
  return (
    <DashboardCard title="订单流程进度">
      <div className="workflow-progress-list">
        {orders.slice(0, 5).map((order) => {
          const rate = Math.round((order.completed_nodes / order.total_nodes) * 100);
          return (
            <button key={order.order_id} className="workflow-progress-row" onClick={() => onNavigateOrders({ selectedOrderId: order.target_order_id ?? order.order_id })} title={`${order.current_node} · Due Date follows current node`}>
              <div>
                <strong>{order.order_name}</strong>
                <span>{order.order_id} · {order.service_type} · {order.current_stage}</span>
              </div>
              <div className="progress-cell">
                <span>{order.completed_nodes}/{order.total_nodes}</span>
                <div className="progress-track"><i style={{ width: `${rate}%` }} /></div>
              </div>
            </button>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function OnboardingProgressChart({ onboardingRows }: DashboardChartProps) {
  const max = Math.max(1, ...onboardingRows.map((item) => item.count));
  return (
    <DashboardCard title="员工入职进度">
      <div className="onboarding-bars">
        {onboardingRows.map((item) => (
          <div key={item.stage} className={item.stage === "入职异常" ? "onboarding-bar danger" : "onboarding-bar"}>
            <span>{item.stage}</span>
            <div><i style={{ width: `${(item.count / max) * 100}%` }} /></div>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function DocumentCompletionChart({ documents, onNavigateOrders }: DashboardChartProps) {
  return (
    <DashboardCard title="材料上传完成率">
      <div className="document-list">
        {documents.map((doc) => {
          const rate = Math.round((doc.confirmed / doc.required) * 100);
          const state = doc.rejected > 0 ? "danger" : rate < 80 ? "warning" : "done";
          return (
            <button key={doc.order_id} className={`document-row ${state}`} onClick={() => onNavigateOrders({ selectedOrderId: doc.target_order_id ?? doc.order_id, tab: "attachments" })} title={doc.names}>
              <div>
                <strong>{doc.service_name}</strong>
                <span>{doc.order_id} · Required {doc.required} · Uploaded {doc.uploaded} · Rejected {doc.rejected}</span>
              </div>
              <div className="progress-cell">
                <span>{rate}%</span>
                <div className="progress-track"><i style={{ width: `${rate}%` }} /></div>
              </div>
            </button>
          );
        })}
      </div>
    </DashboardCard>
  );
}

function PayrollCalendarChart({ payrollRows, onNavigateOrders }: DashboardChartProps) {
  return (
    <DashboardCard title="Payroll Calendar / Pay Period 状态">
      <div className="payroll-timeline">
        {payrollRows.map((item) => (
          <button key={`${item.order_id}-${item.label}`} className={`payroll-event ${item.status === "Overdue" ? "overdue" : item.date <= "2026-07-08" ? "soon" : ""}`} onClick={() => onNavigateOrders({ selectedOrderId: item.target_order_id ?? item.order_id })}>
            <span>{item.date.slice(5)}</span>
            <div>
              <strong>{item.label}</strong>
              <em>{item.pay_period} · {item.status}</em>
            </div>
          </button>
        ))}
        {!payrollRows.length && <EmptyState text="当前筛选下暂无 Payroll 节点" />}
      </div>
    </DashboardCard>
  );
}

function DistributionChart({ distributionRows, onNavigateOrders }: DashboardChartProps) {
  const countries = ["Singapore", "Japan", "Vietnam", "China", "Malaysia"];
  const services = ["EOR", "GPO", "HRO", "RPO", "Contractor", "Benefits"];
  const max = Math.max(1, ...distributionRows.map((item) => item.order_count));
  return (
    <DashboardCard title="国家 + 服务类型分布">
      <div className="distribution-matrix">
        <span />
        {services.map((service) => <strong key={service}>{service}</strong>)}
        {countries.map((itemCountry) => (
          <div className="distribution-row" key={itemCountry}>
            <strong>{itemCountry}</strong>
            {services.map((service) => {
              const item = distributionRows.find((row) => row.country === itemCountry && row.service_type === service);
              const intensity = item ? 0.16 + (item.order_count / max) * 0.54 : 0;
              return (
                <button
                  key={`${itemCountry}-${service}`}
                  style={{ background: item ? `rgba(44, 95, 121, ${intensity})` : "transparent" }}
                  disabled={!item}
                  onClick={() => onNavigateOrders({ country: itemCountry, serviceType: service })}
                  title={item ? `${item.order_count} orders · ${item.project_count} projects · ${item.employee_count} employees` : ""}
                >
                  {item?.order_count ?? ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

const orderStatusLabels: Record<OrderStatus, string> = {
  Draft: "草稿",
  Submitted: "已提交",
  "In Progress": "进行中",
  "Waiting Client": "等待客户",
  "Waiting Approval": "等待审批",
  Completed: "已完成",
  Overdue: "已逾期",
  Cancelled: "已取消",
};

const orderNodeStatusLabels: Record<OrderNodeStatus, string> = {
  "Not Started": "未开始",
  "In Progress": "进行中",
  "Waiting Client": "等待客户",
  "Waiting SD": "等待交付",
  "Waiting Approval": "等待审批",
  Completed: "已完成",
  Rejected: "已驳回",
  Overdue: "已逾期",
};

const orderStageStatusLabels: Record<OrderStageStatus, string> = {
  "Not Started": "未开始",
  "In Progress": "进行中",
  Completed: "已完成",
};

const orderStatusClass = (status: OrderStatus | OrderNodeStatus | OrderStageStatus | OrderAttachmentStatus | OrderFormStatus | string) => {
  if (status === "Completed" || status === "Confirmed" || status === "Uploaded" || status === "Submitted") return "done";
  if (status === "In Progress") return "doing";
  if (status === "Waiting Client") return "client";
  if (status === "Waiting Approval" || status === "Draft" || status === "Pending Upload") return "warning";
  if (status === "Rejected" || status === "Overdue" || status === "Cancelled") return "danger";
  return "todo";
};

const dueDateState = (dueDate: string, status: OrderNodeStatus) => {
  if (!dueDate || dueDate === "-" || status === "Completed") return "normal";
  const current = new Date("2026-07-02T00:00:00");
  const due = new Date(`${dueDate}T00:00:00`);
  const diffDays = Math.ceil((due.getTime() - current.getTime()) / 86400000);
  if (diffDays < 0 || status === "Overdue") return "overdue";
  if (diffDays <= 3) return "soon";
  return "normal";
};

const dueDateHint = (dueDate: string, status: OrderNodeStatus) => {
  const state = dueDateState(dueDate, status);
  if (state === "overdue") {
    const current = new Date("2026-07-02T00:00:00");
    const due = new Date(`${dueDate}T00:00:00`);
    const days = Math.max(1, Math.ceil((current.getTime() - due.getTime()) / 86400000));
    return `Overdue by ${days} day${days > 1 ? "s" : ""}`;
  }
  if (state === "soon") return "Due soon";
  return "";
};

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${size} B`;
};

const fileExtension = (fileName: string) => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
};

function OrderManagement({ countryRules, dashboardIntent }: { countryRules: CountryRule[]; dashboardIntent?: DashboardOrderIntent | null }) {
  const [orders, setOrders] = useState<ServiceOrder[]>(() => createInitialOrders());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<OrderDetailTab>("workflow");
  const [filters, setFilters] = useState({ client: "", status: "", dueDate: "", country: "", serviceType: "" });
  const selectedOrder = orders.find((order) => order.order_id === selectedOrderId) ?? null;

  useEffect(() => {
    if (!dashboardIntent) return;
    setFilters((prev) => ({
      ...prev,
      status: dashboardIntent.status ?? "",
      country: dashboardIntent.country && dashboardIntent.country !== "All" ? dashboardIntent.country : "",
      serviceType: dashboardIntent.serviceType && dashboardIntent.serviceType !== "All" ? dashboardIntent.serviceType : "",
    }));
    setDetailTab(dashboardIntent.tab ?? "workflow");
    setSelectedOrderId(dashboardIntent.selectedOrderId ?? null);
  }, [dashboardIntent]);

  const updateOrder = (orderId: string, updater: (order: ServiceOrder) => ServiceOrder) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.order_id !== orderId) return order;
        return withOrderProgress({ ...updater(order), updated_time: orderNowText });
      }),
    );
  };

  const filteredOrders = orders.filter((order) => {
    if (filters.client && !order.client.toLowerCase().includes(filters.client.toLowerCase())) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.dueDate && order.due_date !== filters.dueDate) return false;
    if (filters.country && order.country_location !== filters.country) return false;
    if (filters.serviceType && order.service_type !== filters.serviceType) return false;
    return true;
  });

  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => setSelectedOrderId(null)}
        onChange={(updater) => updateOrder(selectedOrder.order_id, updater)}
        initialTab={detailTab}
      />
    );
  }

  const waitingClient = orders.filter((order) => order.status === "Waiting Client" || order.current_node.toLowerCase().includes("upload")).length;

  return (
    <section className="page order-page">
      <PageHeader title="订单管理" action={<button className="primary-btn">创建</button>} />
      <div className="order-summary-grid">
        <ReadonlyMetric label="进行中订单" value={String(orders.filter((order) => order.status === "In Progress").length)} />
        <ReadonlyMetric label="待客户动作" value={String(waitingClient)} />
        <ReadonlyMetric label="需人工复核" value={String(countryRules.filter((rule) => rule.support_status === "Need Review").length)} />
        <ReadonlyMetric label="国家规则覆盖" value={String(countryRules.length)} />
      </div>
      <div className="filter-bar order-filter-bar">
        <LabeledInput label="Client" value={filters.client} onChange={(client) => setFilters((prev) => ({ ...prev, client }))} placeholder="Client" />
        <LabeledSelect label="Order Status" value={filters.status} options={["", ...Object.keys(orderStatusLabels)]} labels={{ "": "全部", ...orderStatusLabels }} onChange={(status) => setFilters((prev) => ({ ...prev, status }))} />
        <LabeledInput label="Due Date" value={filters.dueDate} onChange={(dueDate) => setFilters((prev) => ({ ...prev, dueDate }))} placeholder="2026-07-05" />
      </div>
      <div className="table-wrap order-table-wrap">
        <table className="wide-table order-list-table">
          <thead>
            <tr>
              <th>订单编号</th>
              <th>订单名称</th>
              <th>Client</th>
              <th>Country / Location</th>
              <th>Service Type</th>
              <th>Service Name</th>
              <th>Project</th>
              <th>Current Stage</th>
              <th>Current Node</th>
              <th>Order Status</th>
              <th>Due Date</th>
              <th>Created Time</th>
              <th>Updated Time</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.order_id}>
                <td className="mono nowrap-cell">{order.order_id}</td>
                <td className="project-name-cell"><button className="link-btn" onClick={() => setSelectedOrderId(order.order_id)}>{order.order_name}</button></td>
                <td className="nowrap-cell">{order.client}</td>
                <td className="nowrap-cell">{order.country_location}</td>
                <td><Tag>{order.service_type}</Tag></td>
                <td className="nowrap-cell">{order.service_name}</td>
                <td className="nowrap-cell">{order.project}</td>
                <td className="nowrap-cell">{order.current_stage}</td>
                <td className="nowrap-cell">{order.current_node}</td>
                <td className="nowrap-cell"><OrderStatusTag status={order.status} /></td>
                <td className="nowrap-cell">{order.due_date}</td>
                <td className="nowrap-cell">{order.created_time}</td>
                <td className="nowrap-cell">{order.updated_time}</td>
                <td className="actions">
                  <button className="link-btn" onClick={() => setSelectedOrderId(order.order_id)}>查看详情</button>
                  <button className="link-btn" onClick={() => setSelectedOrderId(order.order_id)}>继续处理</button>
                  <button className="danger-link" onClick={() => updateOrder(order.order_id, (item) => ({ ...item, status: "Cancelled", operation_logs: [makeOperationLog("取消订单", item.order_name, "Order cancelled."), ...item.operation_logs] }))}>取消订单</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrderDetail({ order, onBack, onChange, initialTab }: { order: ServiceOrder; onBack: () => void; onChange: (updater: (order: ServiceOrder) => ServiceOrder) => void; initialTab?: OrderDetailTab }) {
  const [tab, setTab] = useState<OrderDetailTab>("workflow");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [uploadNodeId, setUploadNodeId] = useState<string | null>(null);
  const [formNodeId, setFormNodeId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const nodes = order.workflow.stages.flatMap((stage) => stage.nodes.map((node) => ({ node, stage })));
  const selected = nodes.find((item) => item.node.node_id === selectedNodeId) ?? null;

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  const uploadTarget = nodes.find((item) => item.node.node_id === uploadNodeId) ?? null;
  const formTarget = nodes.find((item) => item.node.node_id === formNodeId) ?? null;

  const updateNode = (nodeId: string, updater: (node: OrderWorkflowNode) => OrderWorkflowNode, log?: OperationLog, extra?: Partial<ServiceOrder>) => {
    onChange((current) => ({
      ...current,
      ...extra,
      workflow: {
        ...current.workflow,
        stages: current.workflow.stages.map((stage) => ({
          ...stage,
          nodes: stage.nodes.map((node) => (node.node_id === nodeId ? updater(node) : node)),
        })),
      },
      operation_logs: log ? [log, ...current.operation_logs] : current.operation_logs,
    }));
  };

  const completeNode = (node: OrderWorkflowNode) => {
    updateNode(
      node.node_id,
      (item) => ({ ...item, status: "Completed", completion_date: orderNowText }),
      makeOperationLog("节点完成", node.node_name, `${node.node_name} marked as completed.`),
    );
  };

  const submitNode = (node: OrderWorkflowNode) => {
    if (node.requires_approval) {
      updateNode(
        node.node_id,
        (item) => ({ ...item, status: "Waiting Approval" }),
        makeOperationLog("提交节点", node.node_name, `${node.node_name} submitted for approval.`),
        { status: "Waiting Approval" },
      );
      return;
    }
    completeNode(node);
  };

  const approveNode = (node: OrderWorkflowNode, approved: boolean) => {
    const action = approved ? "Approve" : "Reject";
    onChange((current) => ({
      ...current,
      status: approved ? "In Progress" : "Waiting Client",
      workflow: {
        ...current.workflow,
        stages: current.workflow.stages.map((stage) => ({
          ...stage,
          nodes: stage.nodes.map((item) => (item.node_id === node.node_id ? { ...item, status: approved ? "Completed" : "Rejected", completion_date: approved ? orderNowText : item.completion_date } : item)),
        })),
      },
      approval_records: [
        {
          id: `approval_${Date.now()}`,
          node_name: node.node_name,
          approver: "Client Legal Approver",
          action,
          comment: approved ? "Approved." : "Rejected. Please revise and resubmit.",
          approval_time: orderNowText,
          status: approved ? "Approved" : "Rejected",
        },
        ...current.approval_records,
      ],
      operation_logs: [
        makeOperationLog(approved ? "审批通过" : "审批驳回", node.node_name, approved ? "Approval passed." : "Approval rejected."),
        ...current.operation_logs,
      ],
    }));
  };

  const uploadFiles = (target: { node: OrderWorkflowNode; stage: OrderWorkflowStage }, files: Array<{ name: string; size: number }>) => {
    const attachments: OrderAttachment[] = files.map((file) => ({
      id: `att_${Date.now()}_${file.name}`,
      file_name: file.name,
      file_type: fileExtension(file.name),
      file_size: formatFileSize(file.size),
      stage_name: target.stage.stage_name,
      node_id: target.node.node_id,
      node_name: target.node.node_name,
      uploaded_by: "Admin",
      uploaded_time: orderNowText,
      status: "Uploaded",
    }));
    onChange((current) => ({
      ...current,
      status: "In Progress",
      attachments: [...attachments, ...current.attachments],
      workflow: {
        ...current.workflow,
        stages: current.workflow.stages.map((stage) => ({
          ...stage,
          nodes: stage.nodes.map((node) => (node.node_id === target.node.node_id && node.status === "Not Started" ? { ...node, status: "In Progress" } : node)),
        })),
      },
      operation_logs: [makeOperationLog("上传附件", target.node.node_name, `Uploaded ${files.map((file) => file.name).join(", ")}.`), ...current.operation_logs],
    }));
    setUploadNodeId(null);
  };

  const saveForm = (target: { node: OrderWorkflowNode; stage: OrderWorkflowStage }, status: "Draft" | "Submitted") => {
    const record: OrderFormRecord = {
      id: `form_record_${target.node.node_id}`,
      form_id: target.node.form_id,
      form_name: formNameMap[target.node.form_id] ?? target.node.form_id,
      stage_name: target.stage.stage_name,
      node_id: target.node.node_id,
      node_name: target.node.node_name,
      filled_by: "Admin",
      status,
      submitted_time: status === "Submitted" ? orderNowText : "-",
    };
    onChange((current) => ({
      ...current,
      status: status === "Submitted" ? "In Progress" : current.status,
      forms: [record, ...current.forms.filter((form) => form.node_id !== target.node.node_id)],
      workflow: {
        ...current.workflow,
        stages: current.workflow.stages.map((stage) => ({
          ...stage,
          nodes: stage.nodes.map((node) => (node.node_id === target.node.node_id && node.status === "Not Started" ? { ...node, status: "In Progress" } : node)),
        })),
      },
      operation_logs: [
        makeOperationLog(status === "Submitted" ? "提交表单" : "填写表单", target.node.node_name, `${record.form_name} ${status === "Submitted" ? "submitted" : "saved as draft"}.`),
        ...current.operation_logs,
      ],
    }));
    setFormNodeId(null);
  };

  const sendMessage = () => {
    if (!messageDraft.trim()) return;
    onChange((current) => ({
      ...current,
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: "Admin",
          sent_time: orderNowText,
          content: messageDraft.trim(),
          linked_node: selected?.node.node_name ?? current.current_node,
        },
        ...current.messages,
      ],
      operation_logs: [makeOperationLog("沟通记录", selected?.node.node_name ?? current.order_name, "Sent an order message."), ...current.operation_logs],
    }));
    setMessageDraft("");
  };

  const baseInfo = [
    ["Client", order.client],
    ["Country / Location", order.country_location],
    ["Service Type", order.service_type],
    ["Service Name", order.service_name],
    ["Project", order.project],
  ];
  const detailTabs: Array<{ key: OrderDetailTab; label: string }> = [
    { key: "workflow", label: "服务流程" },
    { key: "attachments", label: "附件信息" },
    { key: "logs", label: "操作日志" },
  ];

  return (
    <section className="page detail-page order-detail-page">
      <div className="detail-title order-detail-title">
        <button className="icon-btn" onClick={onBack} title="返回">{"<"}</button>
        <div className="title-stack">
          <h1>{order.order_name}</h1>
          <span className="muted mono">{order.order_id}</span>
        </div>
        <OrderStatusTag status={order.status} />
        <div className="detail-actions">
          <button className="secondary-btn" onClick={() => onChange((current) => ({ ...current, operation_logs: [makeOperationLog("保存订单", current.order_name, "Order saved."), ...current.operation_logs] }))}>保存</button>
          <button className="primary-btn" onClick={() => onChange((current) => ({ ...current, status: "Submitted", operation_logs: [makeOperationLog("提交订单", current.order_name, "Order submitted."), ...current.operation_logs] }))}>提交</button>
          <button className="secondary-btn" onClick={() => onChange((current) => ({ ...current, operation_logs: [makeOperationLog("催办", current.current_node, "Reminder sent."), ...current.operation_logs] }))}>催办</button>
          <button className="secondary-btn">导出</button>
          <button className="icon-btn" title="更多操作">⋯</button>
        </div>
      </div>

      <section className="order-info-card">
        {baseInfo.map(([label, value]) => (
          <div key={label} className="order-info-item">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <div className="detail-tabs order-detail-tabs">
        {detailTabs.map((item) => (
          <button key={item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}>{item.label}</button>
        ))}
      </div>

      {tab === "workflow" && (
        <OrderWorkflowView
          order={order}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onOpenUpload={setUploadNodeId}
          onOpenForm={setFormNodeId}
          onSubmitNode={submitNode}
          onCompleteNode={completeNode}
          onApproveNode={approveNode}
        />
      )}
      {tab === "attachments" && <OrderAttachmentsTab order={order} onOpenUpload={setUploadNodeId} />}
      {tab === "logs" && <OrderLogsTab order={order} />}

      {selected && (
        <OrderNodeDrawer
          stage={selected.stage}
          node={selected.node}
          logs={order.operation_logs.filter((log) => log.target === selected.node.node_name)}
          onClose={() => setSelectedNodeId(null)}
          onUpload={() => setUploadNodeId(selected.node.node_id)}
          onForm={() => setFormNodeId(selected.node.node_id)}
          onSubmit={() => submitNode(selected.node)}
          onComplete={() => completeNode(selected.node)}
          onApprove={(approved) => approveNode(selected.node, approved)}
          onRemind={() => onChange((current) => ({ ...current, operation_logs: [makeOperationLog("催办", selected.node.node_name, "Reminder sent."), ...current.operation_logs] }))}
        />
      )}

      {uploadTarget && <UploadAttachmentModal target={uploadTarget} onClose={() => setUploadNodeId(null)} onUpload={(files) => uploadFiles(uploadTarget, files)} />}
      {formTarget && <OrderFormModal target={formTarget} onClose={() => setFormNodeId(null)} onSave={(status) => saveForm(formTarget, status)} />}
    </section>
  );
}

function OrderStatusTag({ status }: { status: OrderStatus | OrderNodeStatus | OrderStageStatus | OrderAttachmentStatus | OrderFormStatus | string }) {
  const label = orderStatusLabels[status as OrderStatus] ?? orderNodeStatusLabels[status as OrderNodeStatus] ?? orderStageStatusLabels[status as OrderStageStatus] ?? status;
  return <span className={`order-status-tag ${orderStatusClass(status)}`}>{label}</span>;
}

function OrderWorkflowView(props: {
  order: ServiceOrder;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onOpenUpload: (nodeId: string) => void;
  onOpenForm: (nodeId: string) => void;
  onSubmitNode: (node: OrderWorkflowNode) => void;
  onCompleteNode: (node: OrderWorkflowNode) => void;
  onApproveNode: (node: OrderWorkflowNode, approved: boolean) => void;
}) {
  const currentStageIndex = props.order.workflow.stages.findIndex((stage) => stage.stage_status === "In Progress");
  const highlightedStageIndex = currentStageIndex >= 0 ? currentStageIndex : props.order.workflow.stages.findIndex((stage) => stage.stage_status !== "Completed");

  return (
    <section className="order-workflow-area">
      <div className="order-stage-rail">
        {props.order.workflow.stages.map((stage, index) => (
          <div key={stage.stage_id} className={`order-stage-step ${stage.stage_status === "Completed" ? "completed" : index === highlightedStageIndex ? "current" : "todo"}`}>
            <span>{index + 1}</span>
            <strong>{stage.stage_name}</strong>
          </div>
        ))}
      </div>
      <div className="order-stage-columns">
        {props.order.workflow.stages.map((stage) => (
          <section key={stage.stage_id} className={`order-stage-column ${stage.stage_status.toLowerCase().replace(" ", "-")}`}>
            <div className="order-stage-column-head">
              <h2>{stage.stage_name}</h2>
              <OrderStatusTag status={stage.stage_status} />
            </div>
            <div className="order-node-timeline">
              {stage.nodes.map((node) => (
                <OrderNodeCard
                  key={node.node_id}
                  node={node}
                  current={node.node_name === props.order.current_node}
                  selected={props.selectedNodeId === node.node_id}
                  onSelect={() => props.onSelectNode(node.node_id)}
                  onOpenUpload={() => props.onOpenUpload(node.node_id)}
                  onOpenForm={() => props.onOpenForm(node.node_id)}
                  onSubmit={() => props.onSubmitNode(node)}
                  onComplete={() => props.onCompleteNode(node)}
                  onApprove={(approved) => props.onApproveNode(node, approved)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function OrderNodeCard(props: {
  node: OrderWorkflowNode;
  current: boolean;
  selected: boolean;
  onSelect: () => void;
  onOpenUpload: () => void;
  onOpenForm: () => void;
  onSubmit: () => void;
  onComplete: () => void;
  onApprove: (approved: boolean) => void;
}) {
  const dueState = dueDateState(props.node.due_date, props.node.status);
  const hint = dueDateHint(props.node.due_date, props.node.status);

  return (
    <article className={`order-node-card ${props.selected ? "selected" : ""} ${props.current ? "current" : ""} ${props.node.is_client_action ? "client-action" : ""}`} onClick={props.onSelect}>
      <div className="order-node-marker">
        <span className={`status-dot ${orderStatusClass(props.node.status)}`} />
      </div>
      <div className="order-node-content">
        <div className="order-node-head">
          <h3>{props.node.node_name}</h3>
          <OrderStatusTag status={props.node.status} />
        </div>
        <div className="order-node-meta">
          <span>{props.node.executor_role}</span>
          <span>{props.node.assignee}</span>
        </div>
        <div className={`order-due-line ${dueState}`}>
          <span>Due Date: {props.node.due_date}</span>
          {props.node.completion_date && <span>Completion Date: {props.node.completion_date}</span>}
          {hint && <strong>{hint}</strong>}
        </div>
        <div className="tag-row">
          {props.node.is_client_action && <span className="client-action-tag">Client Action</span>}
          {props.node.requires_attachment && <Tag>Attachment</Tag>}
          {props.node.requires_form && <Tag>Form</Tag>}
          {props.node.requires_approval && <Tag>Approval</Tag>}
        </div>
        <div className="node-icon-actions">
          {props.node.requires_attachment && <button className="icon-action-btn" title="上传附件" onClick={(event) => { event.stopPropagation(); props.onOpenUpload(); }}>↑</button>}
          {props.node.requires_form && <button className="icon-action-btn" title="填写表单" onClick={(event) => { event.stopPropagation(); props.onOpenForm(); }}>✎</button>}
          {props.node.requires_approval && props.node.status === "Waiting Approval" && (
            <>
              <button className="icon-action-btn" title="审批通过" onClick={(event) => { event.stopPropagation(); props.onApprove(true); }}>✓</button>
              <button className="icon-action-btn danger" title="审批驳回" onClick={(event) => { event.stopPropagation(); props.onApprove(false); }}>!</button>
            </>
          )}
          <button className="secondary-btn small" onClick={(event) => { event.stopPropagation(); props.onSubmit(); }}>{props.node.requires_approval ? "提交节点" : "标记完成"}</button>
        </div>
      </div>
    </article>
  );
}

function OrderNodeDrawer(props: {
  stage: OrderWorkflowStage;
  node: OrderWorkflowNode;
  logs: OperationLog[];
  onClose: () => void;
  onUpload: () => void;
  onForm: () => void;
  onSubmit: () => void;
  onComplete: () => void;
  onApprove: (approved: boolean) => void;
  onRemind: () => void;
}) {
  const fields = [
    ["节点名称", props.node.node_name],
    ["所属阶段", props.stage.stage_name],
    ["节点状态", orderNodeStatusLabels[props.node.status]],
    ["执行角色", props.node.executor_role],
    ["负责人", props.node.assignee],
    ["Due Date", props.node.due_date],
    ["Completion Date", props.node.completion_date ?? "-"],
    ["是否客户动作节点", props.node.is_client_action ? "是" : "否"],
    ["是否需要附件", props.node.requires_attachment ? "是" : "否"],
    ["允许上传格式", props.node.accepted_format.join(" / ") || "-"],
    ["所需文件", props.node.required_documents.join(" / ") || "-"],
    ["是否需要表单", props.node.requires_form ? "是" : "否"],
    ["关联表单", (formNameMap[props.node.form_id] ?? props.node.form_id) || "-"],
    ["是否需要审批", props.node.requires_approval ? "是" : "否"],
  ];

  return (
    <Drawer title="节点详情" onClose={props.onClose}>
      <div className="order-node-drawer">
        <div className="drawer-info-list">
          {fields.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="drawer-action-grid">
          {props.node.requires_attachment && <button className="secondary-btn" onClick={props.onUpload}>上传附件</button>}
          {props.node.requires_form && <button className="secondary-btn" onClick={props.onForm}>填写表单</button>}
          {props.node.requires_form && <button className="secondary-btn" onClick={props.onForm}>查看表单</button>}
          <button className="secondary-btn" onClick={props.onSubmit}>提交节点</button>
          {props.node.requires_approval && <button className="secondary-btn" onClick={() => props.onApprove(true)}>审批通过</button>}
          {props.node.requires_approval && <button className="secondary-btn danger-btn" onClick={() => props.onApprove(false)}>审批驳回</button>}
          <button className="primary-btn" onClick={props.onComplete}>标记完成</button>
          <button className="secondary-btn" onClick={props.onRemind}>催办</button>
        </div>
        <div className="drawer-section-title">操作记录</div>
        <div className="drawer-log-list">
          {props.logs.length ? props.logs.map((log) => (
            <article key={log.id}>
              <strong>{log.type}</strong>
              <span>{log.time} · {log.actor}</span>
              <p>{log.content}</p>
            </article>
          )) : <EmptyState text="暂无操作记录" />}
        </div>
      </div>
    </Drawer>
  );
}

function UploadAttachmentModal({ target, onClose, onUpload }: { target: { node: OrderWorkflowNode; stage: OrderWorkflowStage }; onClose: () => void; onUpload: (files: Array<{ name: string; size: number }>) => void }) {
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [error, setError] = useState("");
  const allowed = target.node.accepted_format;
  const accept = allowed.map((item) => `.${item.toLowerCase()}`).join(",");

  const appendFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    const nextFiles = Array.from(incoming).map((file) => ({ name: file.name, size: file.size }));
    const invalid = nextFiles.find((file) => !allowed.includes(fileExtension(file.name)));
    if (invalid) {
      setError(`当前节点仅支持上传 ${allowed.join("、")} 文件`);
      return;
    }
    setError("");
    setFiles((prev) => [...prev, ...nextFiles]);
  };

  return (
    <Modal title="上传附件" onClose={onClose} footer={<><button className="secondary-btn" onClick={onClose}>取消</button><button className="primary-btn" disabled={!files.length} onClick={() => onUpload(files)}>上传</button></>}>
      <div className="upload-node-summary">
        <span>节点名称</span>
        <strong>{target.node.node_name}</strong>
        <span>允许上传</span>
        <strong>{allowed.join(" / ")}</strong>
      </div>
      <div
        className="upload-drop-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          appendFiles(event.dataTransfer.files);
        }}
      >
        <strong>拖拽文件到此处</strong>
        <span>或点击选择文件</span>
        <input type="file" multiple accept={accept} onChange={(event) => appendFiles(event.target.files)} />
      </div>
      {error && <div className="alert danger">{error}</div>}
      <div className="upload-file-list">
        {files.map((file) => (
          <div key={`${file.name}_${file.size}`}>
            <span>{file.name}</span>
            <strong>{formatFileSize(file.size)}</strong>
            <em>Ready</em>
            <button className="link-btn" onClick={() => setFiles((prev) => prev.filter((item) => item !== file))}>删除</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function OrderFormModal({ target, onClose, onSave }: { target: { node: OrderWorkflowNode; stage: OrderWorkflowStage }; onClose: () => void; onSave: (status: "Draft" | "Submitted") => void }) {
  const [employeeName, setEmployeeName] = useState("Yuki Tanaka");
  const [effectiveDate, setEffectiveDate] = useState("2026-07-20");
  const [remark, setRemark] = useState("");
  return (
    <Modal title="填写表单" onClose={onClose} footer={<><button className="secondary-btn" onClick={() => onSave("Draft")}>保存草稿</button><button className="primary-btn" onClick={() => onSave("Submitted")}>提交表单</button></>}>
      <div className="upload-node-summary">
        <span>关联节点</span>
        <strong>{target.node.node_name}</strong>
        <span>表单名称</span>
        <strong>{formNameMap[target.node.form_id] ?? target.node.form_id}</strong>
      </div>
      <div className="form-grid-2">
        <LabeledInput label="Employee Name" value={employeeName} onChange={setEmployeeName} />
        <LabeledInput label="Effective Date" value={effectiveDate} onChange={setEffectiveDate} />
      </div>
      <label className="form-row"><span>Remark</span><textarea rows={4} value={remark} onChange={(event) => setRemark(event.target.value)} /></label>
    </Modal>
  );
}

const orderFormRows = (order: ServiceOrder) =>
  order.workflow.stages.flatMap((stage) =>
    stage.nodes
      .filter((node) => node.requires_form)
      .map((node) => {
        const record = order.forms.find((form) => form.node_id === node.node_id);
        return {
          id: node.node_id,
          form_id: node.form_id,
          form_name: formNameMap[node.form_id] ?? node.form_id,
          stage_name: stage.stage_name,
          node_id: node.node_id,
          node_name: node.node_name,
          filled_by: record?.filled_by ?? "-",
          status: record?.status ?? "Not Started",
          submitted_time: record?.submitted_time ?? "-",
        };
      }),
  );

function OrderFormsTab({ order, onOpenForm }: { order: ServiceOrder; onOpenForm: (nodeId: string) => void }) {
  const rows = orderFormRows(order);
  return (
    <div className="table-wrap order-tab-table">
      <table>
        <thead>
          <tr>
            <th>表单名称</th>
            <th>关联阶段</th>
            <th>关联节点</th>
            <th>填写人</th>
            <th>状态</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.form_name}</td>
              <td>{row.stage_name}</td>
              <td>{row.node_name}</td>
              <td>{row.filled_by}</td>
              <td><OrderStatusTag status={row.status} /></td>
              <td>{row.submitted_time}</td>
              <td className="actions"><button className="link-btn" onClick={() => onOpenForm(row.node_id)}>填写</button><button className="link-btn" onClick={() => onOpenForm(row.node_id)}>查看</button><button className="link-btn" onClick={() => onOpenForm(row.node_id)}>编辑</button><button className="link-btn" onClick={() => onOpenForm(row.node_id)}>重新提交</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const attachmentRows = (order: ServiceOrder) => {
  const pending = order.workflow.stages.flatMap((stage) =>
    stage.nodes
      .filter((node) => node.requires_attachment && !order.attachments.some((attachment) => attachment.node_id === node.node_id))
      .flatMap((node) =>
        (node.required_documents.length ? node.required_documents : ["Required Attachment"]).map((document) => ({
          id: `${node.node_id}_${document}`,
          file_name: document,
          file_type: node.accepted_format.join(" / "),
          file_size: "-",
          stage_name: stage.stage_name,
          node_id: node.node_id,
          node_name: node.node_name,
          uploaded_by: "-",
          uploaded_time: "-",
          status: "Pending Upload" as OrderAttachmentStatus,
        })),
      ),
  );
  return [...order.attachments, ...pending];
};

function OrderAttachmentsTab({ order, onOpenUpload }: { order: ServiceOrder; onOpenUpload: (nodeId: string) => void }) {
  const rows = attachmentRows(order);
  return (
    <div className="table-wrap order-tab-table">
      <table>
        <thead>
          <tr>
            <th>文件名称</th>
            <th>文件类型</th>
            <th>文件大小</th>
            <th>关联阶段</th>
            <th>关联节点</th>
            <th>上传人</th>
            <th>上传时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.file_name}</td>
              <td>{row.file_type}</td>
              <td>{row.file_size}</td>
              <td>{row.stage_name}</td>
              <td>{row.node_name}</td>
              <td>{row.uploaded_by}</td>
              <td>{row.uploaded_time}</td>
              <td><OrderStatusTag status={row.status} /></td>
              <td className="actions"><button className="link-btn">预览</button><button className="link-btn">下载</button><button className="link-btn">删除</button><button className="link-btn" onClick={() => onOpenUpload(row.node_id)}>重新上传</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderApprovalsTab({ order }: { order: ServiceOrder }) {
  const rows = [
    ...order.approval_records,
    ...order.workflow.stages.flatMap((stage) =>
      stage.nodes
        .filter((node) => node.requires_approval && !order.approval_records.some((record) => record.node_name === node.node_name))
        .map((node) => ({
          id: `pending_${node.node_id}`,
          node_name: node.node_name,
          approver: node.assignee,
          action: "Approve" as const,
          comment: "-",
          approval_time: "-",
          status: node.status === "Waiting Approval" ? "Pending" : "Not Started",
        })),
    ),
  ];
  return (
    <div className="table-wrap order-tab-table">
      <table>
        <thead>
          <tr>
            <th>审批节点</th>
            <th>审批人</th>
            <th>审批动作</th>
            <th>审批意见</th>
            <th>审批时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.node_name}</td>
              <td>{row.approver}</td>
              <td>{row.action}</td>
              <td>{row.comment}</td>
              <td>{row.approval_time}</td>
              <td><OrderStatusTag status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderMessagesTab({ order, draft, onDraft, onSend }: { order: ServiceOrder; draft: string; onDraft: (value: string) => void; onSend: () => void }) {
  return (
    <section className="order-message-panel">
      <div className="message-list">
        {order.messages.map((message) => (
          <article key={message.id} className="message-item">
            <div><strong>{message.sender}</strong><span>{message.sent_time}</span></div>
            <p>{message.content}</p>
            <Tag>{message.linked_node}</Tag>
          </article>
        ))}
        {!order.messages.length && <EmptyState text="暂无沟通记录" />}
      </div>
      <div className="message-composer">
        <textarea rows={3} value={draft} onChange={(event) => onDraft(event.target.value)} placeholder="输入沟通内容" />
        <button className="primary-btn" onClick={onSend}>发送</button>
      </div>
    </section>
  );
}

function OrderLogsTab({ order }: { order: ServiceOrder }) {
  return (
    <div className="table-wrap order-tab-table">
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>操作人</th>
            <th>操作类型</th>
            <th>操作对象</th>
            <th>操作内容</th>
          </tr>
        </thead>
        <tbody>
          {order.operation_logs.map((log) => (
            <tr key={log.id}>
              <td className="nowrap-cell">{log.time}</td>
              <td>{log.actor}</td>
              <td>{log.type}</td>
              <td>{log.target}</td>
              <td>{log.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const projectSchemeNodeCount = (scheme: ProjectSchemeInstance) => scheme.stages.reduce((sum, stage) => sum + stage.nodes.length, 0);

function ProjectManagement({ projects, onCreate, onOpen }: { projects: Project[]; onCreate: () => void; onOpen: (project: Project) => void }) {
  return (
    <section className="page">
      <PageHeader title="项目管理" action={<button className="primary-btn" onClick={onCreate}>创建</button>} />
      <div className="table-wrap">
        <table className="project-table">
          <thead>
            <tr>
              <th>项目编码</th>
              <th>项目名称</th>
              <th>客户</th>
              <th>国家</th>
              <th>服务方案</th>
              <th>项目负责人</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th>项目状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.code}>
                <td className="mono nowrap-cell">{project.code}</td>
                <td className="project-name-cell"><button className="link-btn" onClick={() => onOpen(project)}>{project.name}</button></td>
                <td className="nowrap-cell">{project.customer}</td>
                <td className="nowrap-cell">{project.country}</td>
                <td className="project-scheme-summary">
                  <div className="tag-row">
                    {project.schemes.length ? project.schemes.map((scheme) => <Tag key={scheme.id}>{scheme.name}</Tag>) : "-"}
                  </div>
                </td>
                <td className="nowrap-cell">{project.owner}</td>
                <td className="nowrap-cell">{project.createdAt}</td>
                <td className="nowrap-cell">{project.updatedAt}</td>
                <td className="nowrap-cell"><StatusPill status={project.status} /></td>
                <td className="actions"><button className="link-btn" onClick={() => onOpen(project)}>查看</button><button className="link-btn" onClick={() => onOpen(project)}>编辑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProjectDetail(props: {
  project: Project;
  selectedSchemeId: string | null;
  selectedNodeId: string | null;
  onBack: () => void;
  onChange: (patch: Partial<Project>) => void;
  onActivate: () => void;
  onAddScheme: () => void;
  onSelectScheme: (schemeId: string) => void;
  onRemoveScheme: (schemeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onConfigNode: (nodeId: string) => void;
  onClearNode: (nodeId: string) => void;
}) {
  const selectedScheme = props.project.schemes.find((scheme) => scheme.id === props.selectedSchemeId) ?? props.project.schemes[0] ?? null;
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({});
  const toggleStage = (stageId: string) => setCollapsedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));

  return (
    <section className="page detail-page project-detail-page">
      <div className="detail-title">
        <button className="icon-btn" onClick={props.onBack} title="返回">{"<"}</button>
        <div className="title-stack">
          <h1>{props.project.name}</h1>
          <span className="muted mono">{props.project.code}</span>
        </div>
        <StatusPill status={props.project.status} />
        <div className="detail-actions">
          <button className="secondary-btn" onClick={() => props.onChange({ updatedAt: "2026-07-01 11:20" })}>保存</button>
          <button className="primary-btn" onClick={props.onActivate}>启用项目</button>
        </div>
      </div>

      <div className="flow-card">
        <div className="section-head"><h2>项目基础信息</h2></div>
        <div className="form-grid-2">
          <LabeledInput label="客户" value={props.project.customer} onChange={(value) => props.onChange({ customer: value })} />
          <LabeledSelect label="国家" value={props.project.country} options={countryOptions} onChange={(value) => props.onChange({ country: value })} />
          <MultiSelectDropdown label="服务类型" options={projectServiceTypeOptions} values={props.project.serviceTypes} onChange={(values) => props.onChange({ serviceTypes: values as ProjectServiceType[] })} />
          <LabeledSelect label="项目负责人" value={props.project.owner} options={projectOwnerOptions} onChange={(value) => props.onChange({ owner: value })} />
        </div>
        <label className="form-row"><span>项目说明</span><textarea value={props.project.description} rows={3} onChange={(event) => props.onChange({ description: event.target.value })} /></label>
      </div>

      <div className="flow-card">
        <div className="section-head">
          <div>
            <h2>项目方案配置</h2>
            <p>从方案库中选择一个或多个标准服务方案，组装成本项目的交付范围。</p>
          </div>
          <button className="secondary-btn" onClick={props.onAddScheme}>+ 添加方案</button>
        </div>
        <div className="project-scheme-grid">
          {props.project.schemes.length ? props.project.schemes.map((scheme) => (
            <article key={scheme.id} className={selectedScheme?.id === scheme.id ? "project-scheme-card selected" : "project-scheme-card"} onClick={() => props.onSelectScheme(scheme.id)}>
              <div className="project-scheme-card-head">
                <h3>{scheme.name}</h3>
                <StatusPill status={schemeConfigStatus(scheme)} />
              </div>
              <p className="mono">{scheme.code}</p>
              <div className="tag-row">{scheme.serviceTypes.map((type) => <Tag key={type}>{type}</Tag>)}</div>
              <div className="project-scheme-meta">
                <span>{scheme.country}</span>
                <span>{scheme.stages.length} 阶段</span>
                <span>{projectSchemeNodeCount(scheme)} 节点</span>
              </div>
              <div className="card-actions">
                <button className="link-btn" onClick={(event) => { event.stopPropagation(); props.onSelectScheme(scheme.id); }}>配置时间</button>
                <button className="link-btn" onClick={(event) => { event.stopPropagation(); props.onSelectScheme(scheme.id); }}>查看方案</button>
                <button className="danger-link" onClick={(event) => { event.stopPropagation(); props.onRemoveScheme(scheme.id); }}>移除</button>
              </div>
            </article>
          )) : <EmptyState text="暂无方案，请点击添加方案。" />}
        </div>
      </div>

      <div className="workflow-area project-time-area">
        <div className="section-head">
          <div>
            <h2>方案节点时间配置</h2>
            <p>{selectedScheme ? `当前方案：${selectedScheme.name}` : "请先在上方添加并选择一个方案。"}</p>
          </div>
        </div>
        {selectedScheme ? (
          <div className="project-stage-timeline-list">
            {selectedScheme.stages.map((stage, index) => (
              <ProjectStageTimeGroup
                key={stage.id}
                stage={stage}
                index={index}
                collapsed={Boolean(collapsedStages[stage.id])}
                selectedNodeId={props.selectedNodeId}
                onToggle={() => toggleStage(stage.id)}
                onSelectNode={props.onSelectNode}
                onConfigNode={props.onConfigNode}
                onClearNode={props.onClearNode}
              />
            ))}
          </div>
        ) : <EmptyState text="请先在上方添加并选择一个方案。" />}
      </div>
    </section>
  );
}

function ProjectStageTimeGroup(props: {
  stage: ProjectStage;
  index: number;
  collapsed: boolean;
  selectedNodeId: string | null;
  onToggle: () => void;
  onSelectNode: (nodeId: string) => void;
  onConfigNode: (nodeId: string) => void;
  onClearNode: (nodeId: string) => void;
}) {
  return (
    <section className="project-stage-time-group">
      <button className="project-stage-time-head" onClick={props.onToggle} aria-expanded={!props.collapsed}>
        <span className="stage-toggle">{props.collapsed ? "›" : "⌄"}</span>
        <span className="stage-order">阶段 {props.index + 1}</span>
        <strong>{props.stage.name}</strong>
        <span className="stage-node-count">{props.stage.nodes.length} 节点</span>
        <StatusPill status={stageConfigStatus(props.stage)} />
      </button>
      {!props.collapsed && (
        props.stage.nodes.length ? (
          <div className="workflow-list project-timeline-list">
            {props.stage.nodes.map((node) => (
              <ProjectTimeNodeCard
                key={node.id}
                node={node}
                selected={props.selectedNodeId === node.id}
                onSelect={() => props.onSelectNode(node.id)}
                onConfig={() => props.onConfigNode(node.id)}
                onClear={() => props.onClearNode(node.id)}
              />
            ))}
          </div>
        ) : <EmptyState text="该阶段暂无节点。" />
      )}
    </section>
  );
}

function ProjectTimeNodeCard({ node, selected, onSelect, onConfig, onClear }: { node: ProjectNode; selected: boolean; onSelect: () => void; onConfig: () => void; onClear: () => void }) {
  const nodeStatus = node.timeRule ? "已配置" : node.status === "配置缺失" ? "配置缺失" : "未配置";
  const dotClass = node.timeRule ? "done" : nodeStatus === "配置缺失" ? "doing" : "todo";
  return (
    <article className={`workflow-node ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="timeline-marker">
        <div className={`status-dot ${dotClass}`} />
      </div>
      <div className="node-card project-time-node-card">
        <div className="node-main">
          <div className="node-title-row">
            <h3>{node.name}</h3>
            <Tag>{nodeStatus}</Tag>
          </div>
          <p>{node.stageName}</p>
          <p>{node.roles.join(" / ")}</p>
          <p className="time-summary">{node.timeRuleSummary}</p>
        </div>
        <div className="node-actions">
          <button className="secondary-btn small" onClick={(event) => { event.stopPropagation(); onConfig(); }}>配置时间</button>
          <button className="secondary-btn small" onClick={(event) => { event.stopPropagation(); onClear(); }}>清空</button>
          <button className="link-btn" onClick={(event) => event.stopPropagation()}>查看</button>
        </div>
      </div>
    </article>
  );
}

function ProjectSchemePickerModal({ project, templates, onClose, onAdd }: { project: Project; templates: ProjectSchemeInstance[]; onClose: () => void; onAdd: (template: ProjectSchemeInstance) => void }) {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [serviceType, setServiceType] = useState("");
  const addedSourceIds = new Set(project.schemes.map((scheme) => scheme.sourceSchemeId));
  const filtered = templates.filter((template) => {
    if (keyword && !template.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (country && template.country !== country) return false;
    if (serviceType && !template.serviceTypes.includes(serviceType as ProjectServiceType)) return false;
    return true;
  });

  return (
    <Modal title="添加方案" wide onClose={onClose}>
      <div className="filter-bar compact-filter">
        <LabeledInput label="搜索方案名称" value={keyword} onChange={setKeyword} placeholder="请输入方案名称" />
        <LabeledSelect label="按国家筛选" value={country} options={["", ...countryOptions]} labels={{ "": "全部" }} onChange={setCountry} />
        <LabeledSelect label="按服务类型筛选" value={serviceType} options={["", ...projectServiceTypeOptions]} labels={{ "": "全部" }} onChange={setServiceType} />
      </div>
      <div className="table-wrap modal-table-wrap">
        <table>
          <thead>
            <tr>
              <th>方案编码</th>
              <th>方案名称</th>
              <th>适用国家</th>
              <th>服务类型</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((template) => {
              const added = addedSourceIds.has(template.sourceSchemeId);
              return (
                <tr key={template.id}>
                  <td className="mono">{template.code}</td>
                  <td>{template.name}</td>
                  <td>{template.country}</td>
                  <td><div className="tag-row">{template.serviceTypes.map((type) => <Tag key={type}>{type}</Tag>)}</div></td>
                  <td><StatusPill status="启用" /></td>
                  <td><button className="link-btn" disabled={added} onClick={() => onAdd(template)}>{added ? "已添加" : "添加"}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

function ProjectTimeDrawer({ projectScheme, node, onClose, onSave }: { projectScheme: ProjectSchemeInstance; node: ProjectNode; onClose: () => void; onSave: (rule: ProjectTimeRule) => void }) {
  const allNodes = projectScheme.stages.flatMap((stage) => stage.nodes);
  const currentIndex = allNodes.findIndex((item) => item.id === node.id);
  const fallbackDependency = allNodes[Math.max(0, currentIndex - 1)]?.id ?? "";
  const [rule, setRule] = useState<ProjectTimeRule>(() => node.timeRule ? clone(node.timeRule) : defaultTimeRule(fallbackDependency));
  const dependencyLabels = Object.fromEntries(allNodes.map((item) => [item.id, item.name]));
  const updateRule = (patch: Partial<ProjectTimeRule>) => setRule((prev) => ({ ...prev, ...patch }));

  return (
    <Drawer title="配置节点时间" onClose={onClose}>
      <div className="time-drawer-summary">
        <span>当前方案</span><strong>{projectScheme.name}</strong>
        <span>当前阶段</span><strong>{node.stageName}</strong>
        <span>当前节点</span><strong>{node.name}</strong>
        <span>处理角色</span><strong>{node.roles.join(" / ")}</strong>
      </div>
      <LabeledSelect label="时区" value={rule.timezone} options={timezoneOptions} onChange={(value) => updateRule({ timezone: value })} />
      <div className="form-row">
        <span>时间规则类型</span>
        <div className="segmented-row vertical">
          {(Object.keys(timeRuleTypeLabels) as TimeRuleType[]).map((type) => (
            <button key={type} className={rule.type === type ? "active" : ""} onClick={() => updateRule({ type })}>{timeRuleTypeLabels[type]}</button>
          ))}
        </div>
      </div>

      {rule.type === "fixed" && (
        <>
          <LabeledInput label="截止日期" value={rule.fixedDate} onChange={(value) => updateRule({ fixedDate: value })} />
          <LabeledInput label="截止时间" value={rule.fixedTime} onChange={(value) => updateRule({ fixedTime: value })} />
          <SwitchRow label="是否允许超期" checked={rule.allowOverdue} onChange={(checked) => updateRule({ allowOverdue: checked })} />
          <LabeledSelect label="超期提醒" value={rule.reminder} options={["不提醒", "截止前 1 天提醒", "截止前 3 天提醒", "截止当天提醒"]} onChange={(value) => updateRule({ reminder: value })} />
        </>
      )}

      {rule.type === "recurring" && (
        <>
          <LabeledSelect label="频率" value={rule.frequency} options={["每天", "每周", "每月", "每季度", "每年"]} onChange={(value) => updateRule({ frequency: value })} />
          {rule.frequency === "每周" && <LabeledSelect label="每周几" value={rule.weekDay} options={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]} onChange={(value) => updateRule({ weekDay: value })} />}
          {rule.frequency === "每季度" && <LabeledInput label="每季度第几个月" value={rule.quarterMonth} onChange={(value) => updateRule({ quarterMonth: value })} />}
          {(rule.frequency === "每月" || rule.frequency === "每季度" || rule.frequency === "每年") && <LabeledInput label="每月第几日" value={rule.monthDay} onChange={(value) => updateRule({ monthDay: value })} />}
          <LabeledInput label="截止时间" value={rule.fixedTime} onChange={(value) => updateRule({ fixedTime: value })} />
          <LabeledInput label="生效开始日期" value={rule.startDate} onChange={(value) => updateRule({ startDate: value })} />
          <LabeledInput label="生效结束日期" value={rule.endDate} onChange={(value) => updateRule({ endDate: value })} />
        </>
      )}

      {rule.type === "relative" && (
        <>
          <LabeledSelect label="依赖节点" value={rule.dependencyNodeId} options={allNodes.map((item) => item.id)} labels={dependencyLabels} onChange={(value) => updateRule({ dependencyNodeId: value })} />
          <SegmentedRow label="偏移方向" options={["T+", "T-"]} value={rule.offsetDirection} onChange={(value) => updateRule({ offsetDirection: value as "T+" | "T-" })} />
          <LabeledInput label="偏移数值" value={rule.offsetValue} onChange={(value) => updateRule({ offsetValue: value })} />
          <LabeledSelect label="偏移单位" value={rule.offsetUnit} options={["小时", "天", "工作日", "周", "月"]} onChange={(value) => updateRule({ offsetUnit: value })} />
          <LabeledInput label="截止时间" value={rule.fixedTime} onChange={(value) => updateRule({ fixedTime: value })} />
          <LabeledSelect label="遇到周末或节假日" value={rule.weekendHandling} options={["顺延到下一个工作日", "提前到上一个工作日", "不处理"]} onChange={(value) => updateRule({ weekendHandling: value })} />
        </>
      )}

      {rule.type === "manual" && (
        <>
          <div className="manual-time-note">不自动计算截止时间，由项目负责人在订单执行过程中手动填写。</div>
          <LabeledSelect label="默认提醒规则" value={rule.manualReminder} options={["不提醒", "截止前 1 天提醒", "截止前 3 天提醒", "截止当天提醒"]} onChange={(value) => updateRule({ manualReminder: value })} />
        </>
      )}

      <div className="time-summary-preview">{buildTimeRuleSummary(rule)}</div>
      <div className="drawer-footer-actions">
        <button className="secondary-btn" onClick={onClose}>取消</button>
        <button className="primary-btn" onClick={() => onSave(rule)}>保存配置</button>
      </div>
    </Drawer>
  );
}

function formatSchemeListCode(code: string) {
  return code.replace(/^SCHEME-(EOR|GPO|HRO|RPO)-/, "SCHEME-");
}

function formatSchemeListName(name: string) {
  return name.replace(/^(EOR|GPO|HRO|RPO|Global)\s+/, "");
}

function SchemeList({ schemes, onCreate, onOpen, onDelete }: { schemes: Scheme[]; onCreate: () => void; onOpen: (scheme: Scheme) => void; onDelete: (id: string) => void }) {
  return (
    <section className="page">
      <PageHeader title="方案设置" action={<button className="primary-btn" onClick={onCreate}>+ 创建</button>} />
      <div className="table-wrap">
        <table className="scheme-table">
          <thead>
            <tr>
              <th>方案编码</th>
              <th>方案名称</th>
              <th>创建人</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {schemes.map((scheme) => (
              <tr key={scheme.id}>
                <td className="mono nowrap-cell">{formatSchemeListCode(scheme.code)}</td>
                <td className="scheme-name-cell"><button className="link-btn" onClick={() => onOpen(scheme)}>{formatSchemeListName(scheme.name)}</button></td>
                <td className="nowrap-cell">{scheme.creator}</td>
                <td className="nowrap-cell">{scheme.createdAt}</td>
                <td className="nowrap-cell">{scheme.updatedAt}</td>
                <td className="nowrap-cell"><StatusPill status={scheme.status} /></td>
                <td className="actions">
                  <button className="link-btn" disabled={!scheme.name.includes("Onboarding Service")} onClick={() => onOpen(scheme)}>查看</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SchemeDetail(props: {
  scheme: Scheme;
  countryRules: CountryRule[];
  selectedStage: Stage | null;
  selectedNodeId: string | null;
  onBack: () => void;
  onSchemeNameBlur: (name: string) => void;
  onApplicableCountryChange: (patch: Partial<Scheme["applicableCountry"]>) => void;
  onStageSelect: (stageId: string) => void;
  onAddStage: () => void;
  onStageEdit: (stage: Stage) => void;
  onDeleteStage: (stageId: string) => void;
  onAddNode: () => void;
  onNodeSelect: (nodeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeSettings: (nodeId: string) => void;
}) {
  const { scheme, selectedStage } = props;
  const matchedCountryRules = findCountryRules(props.countryRules, scheme.applicableCountry.country, scheme.applicableCountry.serviceType);
  const hasNeedReviewRule = matchedCountryRules.some((rule) => rule.support_status === "Need Review");
  const hasNotSupportedRule = matchedCountryRules.some((rule) => rule.support_status === "Not Supported");
  return (
    <section className="page detail-page">
      <div className="detail-title">
        <button className="icon-btn" onClick={props.onBack} title="返回">{"<"}</button>
        <input className="title-input" defaultValue={formatSchemeListName(scheme.name)} onBlur={(event) => props.onSchemeNameBlur(event.currentTarget.value)} />
        <span className="muted mono">{formatSchemeListCode(scheme.code)}</span>
      </div>

      <div className="flow-card">
        <div className="section-head">
          <div>
            <h2>适用国家</h2>
          </div>
        </div>
        <div className="country-reference-grid">
          <LabeledSelect label="Country" value={scheme.applicableCountry.country} options={countryOptions} onChange={(value) => props.onApplicableCountryChange({ country: value })} />
          <MultiSelectDropdown label="Service Type" options={businessTypes} values={scheme.applicableCountry.serviceType} onChange={(values) => props.onApplicableCountryChange({ serviceType: values as BusinessType[] })} />
        </div>
        {hasNeedReviewRule && <div className="alert warning">该国家服务需要人工复核</div>}
        {hasNotSupportedRule && <div className="alert danger">该国家当前不支持该服务类型，并禁止发布方案</div>}
      </div>

      <div className="flow-card">
        <div className="section-head">
          <div>
            <h2>流程配置</h2>
            <p>配置服务阶段，选中阶段后维护下方工作流节点。</p>
          </div>
          <button className="secondary-btn" onClick={props.onAddStage}>+ 新增步骤</button>
        </div>
        <div className="stage-flow">
          {scheme.stages.map((stage, index) => (
            <div className="stage-flow-item" key={stage.id}>
              <div className={selectedStage?.id === stage.id ? "stage-node selected" : "stage-node"} onClick={() => props.onStageSelect(stage.id)}>
                <span className="stage-name">{stage.name}</span>
                <button className="mini-action" title="编辑步骤" onClick={(event) => { event.stopPropagation(); props.onStageEdit(stage); }}>✎</button>
                <button className="mini-danger" onClick={(event) => { event.stopPropagation(); props.onDeleteStage(stage.id); }}>×</button>
              </div>
              {index < scheme.stages.length - 1 && <div className="stage-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="workflow-area">
        <div className="section-head">
          <div>
            <h2>节点配置</h2>
            <p>{selectedStage ? `当前阶段：${selectedStage.name}` : "暂无阶段"}</p>
          </div>
          <button className="primary-btn" onClick={props.onAddNode} disabled={!selectedStage}>+ 新增节点</button>
        </div>
        <div className="workflow-list">
          {selectedStage?.nodes.length ? selectedStage.nodes.map((node) => (
            <WorkflowNodeCard
              key={node.id}
              node={node}
              selected={props.selectedNodeId === node.id}
              onSelect={() => props.onNodeSelect(node.id)}
              onDelete={() => props.onNodeDelete(node.id)}
              onSettings={() => props.onNodeSettings(node.id)}
            />
          )) : <EmptyState text="当前阶段暂无工作流节点，可点击新增节点开始配置。" />}
        </div>
      </div>
    </section>
  );
}

function WorkflowNodeCard({ node, selected, onSelect, onDelete, onSettings }: { node: WorkflowNode; selected: boolean; onSelect: () => void; onDelete: () => void; onSettings: () => void }) {
  return (
    <article className={`workflow-node ${selected ? "selected" : ""} ${node.isClientAction ? "client-action" : ""}`} onClick={onSelect}>
      <div className="timeline-marker">
        <div className={`status-dot ${nodeStatusClass(node.status)}`} />
      </div>
      <div className="node-card">
        <div className="node-main">
          <div className="node-title-row">
            <h3>{node.name}</h3>
            <Tag>{node.status}</Tag>
          </div>
          <p>{node.owner}</p>
        </div>
        <div className="node-actions">
          <button className="secondary-btn small" onClick={(event) => { event.stopPropagation(); onSettings(); }}>设置</button>
          <button className="icon-btn danger" onClick={(event) => { event.stopPropagation(); onDelete(); }}>×</button>
        </div>
      </div>
    </article>
  );
}

function NodeConfigDrawer({ node, onClose, onChange }: { node: WorkflowNode; onClose: () => void; onChange: (patch: Partial<WorkflowNode>) => void }) {
  return (
    <Drawer title="节点设置" onClose={onClose}>
      <LabeledInput label="节点名称" value={node.name} onChange={(value) => onChange({ name: value })} />
      <LabeledInput label="节点编码" value={node.code} readOnly onChange={() => undefined} />
      <label className="form-row">
        <span>节点说明</span>
        <textarea value={node.description} onChange={(event) => onChange({ description: event.target.value })} rows={4} />
      </label>
      <MultiSelectDropdown label="节点权限" options={roleNames} values={node.roles} onChange={(roles) => onChange({ roles, onlyOneRequired: roles.length > 1 ? node.onlyOneRequired : false })} />
      {node.roles.length > 1 && (
        <SwitchRow label="是否只需一人完成即可" checked={node.onlyOneRequired} onChange={(checked) => onChange({ onlyOneRequired: checked })} />
      )}
      <SwitchRow label="是否需要上传附件" checked={node.requiresAttachment} onChange={(checked) => onChange({ requiresAttachment: checked })} />
      {node.requiresAttachment && (
        <div className="form-row">
          <span>附件格式</span>
          <div className="check-grid">
            {attachmentFormats.map((format) => (
              <label key={format} className="check-item">
                <input
                  type="checkbox"
                  checked={node.attachmentFormats.includes(format)}
                  onChange={() => {
                    const next = node.attachmentFormats.includes(format) ? node.attachmentFormats.filter((item) => item !== format) : [...node.attachmentFormats, format];
                    onChange({ attachmentFormats: next });
                  }}
                />
                {format}
              </label>
            ))}
          </div>
        </div>
      )}
      <SwitchRow label="是否客户动作节点" checked={node.isClientAction} onChange={(checked) => onChange({ isClientAction: checked })} />
      <button className="primary-btn full" onClick={onClose}>保存</button>
    </Drawer>
  );
}

function FormList({ forms, onCreate, onOpen, onDelete }: { forms: FormDefinition[]; onCreate: () => void; onOpen: (form: FormDefinition) => void; onDelete: (id: string) => void }) {
  return (
    <section className="page">
      <PageHeader title="表单设置" action={<button className="primary-btn" onClick={onCreate}>+ 创建表单</button>} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>表单编码</th>
              <th>表单名称</th>
              <th>业务类型</th>
              <th>字段数量</th>
              <th>创建人</th>
              <th>更新时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form.id}>
                <td className="mono">{form.code}</td>
                <td><button className="link-btn" onClick={() => onOpen(form)}>{form.name}</button></td>
                <td><Tag>{form.businessType}</Tag></td>
                <td>{form.fields.length}</td>
                <td>{form.creator}</td>
                <td>{form.updatedAt}</td>
                <td><StatusPill status={form.status} /></td>
                <td className="actions">
                  <button className="link-btn" onClick={() => onOpen(form)}>设计</button>
                  <button className="link-btn" onClick={() => onOpen(form)}>预览</button>
                  <button className="danger-link" onClick={() => onDelete(form.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormDesigner(props: {
  form: FormDefinition;
  countryRules: CountryRule[];
  selectedField: FormField | null | undefined;
  selectedFieldId: string | null;
  panelTab: "field" | "form" | "rule";
  onBack: () => void;
  onSelectField: (id: string) => void;
  onAddField: (type: FieldType, label: string) => void;
  onDeleteField: (id: string) => void;
  onCopyField: (field: FormField) => void;
  onClear: () => void;
  onGenerateJson: () => void;
  onPreview: (mode: "PC" | "Mobile") => void;
  onSave: () => void;
  onPanelTabChange: (tab: "field" | "form" | "rule") => void;
  onUpdateField: (id: string, updater: (field: FormField) => FormField) => void;
  onUpdateForm: (patch: Partial<FormDefinition>) => void;
}) {
  return (
    <section className="designer-page">
      <div className="designer-top">
        <button className="icon-btn" onClick={props.onBack}>{"<"}</button>
        <input className="designer-name" value={props.form.name} onChange={(event) => props.onUpdateForm({ name: event.target.value })} />
        <div className="designer-actions">
          <button className="toolbar-btn">↥ 导入 JSON</button>
          <button className="toolbar-btn" onClick={props.onClear}>⌫ 清空</button>
          <button className="toolbar-btn" onClick={() => props.onPreview("PC")}>◎ PC 预览</button>
          <button className="toolbar-btn" onClick={() => props.onPreview("Mobile")}>□ Mobile 预览</button>
          <button className="toolbar-btn" onClick={props.onGenerateJson}>▤ 生成 JSON</button>
          <button className="primary-btn small" onClick={props.onSave}>保存</button>
        </div>
      </div>
      <div className="designer-layout">
        <aside className="component-panel">
          <ComponentGroup title="基础字段" items={basicFieldComponents} onAdd={props.onAddField} />
          <ComponentGroup title="高级字段" items={advancedFieldComponents} onAdd={props.onAddField} />
        </aside>
        <main className="canvas-panel">
          <div className="canvas-grid">
            {props.form.fields.length ? props.form.fields.map((field) => (
              <div key={field.id} className={props.selectedFieldId === field.id ? "canvas-field selected" : "canvas-field"} onClick={() => props.onSelectField(field.id)}>
                <FieldRenderer field={field} />
                <div className="field-tools">
                  <button onClick={(event) => { event.stopPropagation(); props.onCopyField(field); }}>⧉</button>
                  <button onClick={(event) => { event.stopPropagation(); props.onDeleteField(field.id); }}>⌫</button>
                </div>
              </div>
            )) : <EmptyState text="从左侧点击字段组件即可添加到画布。" />}
          </div>
        </main>
        <aside className="property-panel">
          <div className="tab-strip">
            <button className={props.panelTab === "field" ? "active" : ""} onClick={() => props.onPanelTabChange("field")}>字段属性</button>
            <button className={props.panelTab === "form" ? "active" : ""} onClick={() => props.onPanelTabChange("form")}>表单属性</button>
            <button className={props.panelTab === "rule" ? "active" : ""} onClick={() => props.onPanelTabChange("rule")}>业务规则</button>
          </div>
          {props.panelTab === "field" && props.selectedField ? (
            <FieldPropertyPanel field={props.selectedField} countryRules={props.countryRules} onChange={(updater) => props.onUpdateField(props.selectedField!.id, updater)} />
          ) : props.panelTab === "form" ? (
            <FormPropertyPanel form={props.form} onChange={props.onUpdateForm} />
          ) : props.panelTab === "rule" ? (
            <RulesPanel />
          ) : (
            <EmptyState text="请选择画布中的字段。" />
          )}
        </aside>
      </div>
    </section>
  );
}

function ComponentGroup({ title, items, onAdd }: { title: string; items: readonly (readonly [FieldType, string])[]; onAdd: (type: FieldType, label: string) => void }) {
  return (
    <div className="component-group">
      <h3>{title}</h3>
      <div className="component-grid">
        {items.map(([type, label]) => (
          <button key={type} onClick={() => onAdd(type, label)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function FieldRenderer({ field }: { field: FormField }) {
  return (
    <>
      {field.display.show_label && <label>{field.validation.required && <b>*</b>} {field.label}</label>}
      {field.type === "select" || field.type === "radio" || field.type === "checkbox" || field.type === "tree" || field.type === "department" ? (
        <select disabled={field.operation.disabled} style={{ width: field.display.width }}>
          <option>{field.display.placeholder}</option>
        </select>
      ) : field.type === "date" ? (
        <input disabled={field.operation.disabled} style={{ width: field.display.width }} placeholder={field.display.placeholder} type="date" />
      ) : field.type === "textarea" ? (
        <textarea disabled={field.operation.disabled} style={{ width: field.display.width }} placeholder={field.display.placeholder} rows={2} />
      ) : field.type === "switch" ? (
        <label className="switch"><input type="checkbox" disabled={field.operation.disabled} /><span /></label>
      ) : field.type === "text" || field.type === "group" ? (
        <div className="text-widget">{field.display.placeholder || field.label}</div>
      ) : field.type === "file" || field.type === "image" ? (
        <button className="upload-box" disabled={field.operation.disabled}>上传{field.label}</button>
      ) : (
        <input disabled={field.operation.disabled} style={{ width: field.display.width }} placeholder={field.display.placeholder} type={field.type === "number" || field.type === "money" ? "number" : "text"} />
      )}
    </>
  );
}

function FieldPropertyPanel({ field, countryRules, onChange }: { field: FormField; countryRules: CountryRule[]; onChange: (updater: (field: FormField) => FormField) => void }) {
  const countryDataPreview = useMemo(() => {
    if (!field.data?.country_config_field) return "";
    const valueSet = new Set<string>();
    countryRules.forEach((rule) => {
      if (field.data?.country_config_field === "Country") valueSet.add(rule.country);
      if (field.data?.country_config_field === "Service Type") valueSet.add(rule.service_type);
      if (field.data?.country_config_field === "Statutory Items") rule.statutory_items.forEach((item) => valueSet.add(item.item_name));
      if (field.data?.country_config_field === "Required Documents") rule.required_documents.forEach((item) => valueSet.add(item.document_name));
      if (field.data?.country_config_field === "Holiday Calendar") valueSet.add(rule.holiday_calendar.holiday_calendar_name);
    });
    return Array.from(valueSet).filter(Boolean).slice(0, 8).join("、");
  }, [countryRules, field.data?.country_config_field]);
  return (
    <div className="property-body">
      <LabeledInput label="唯一标识" value={field.id} readOnly onChange={() => undefined} />
      <LabeledInput label="类型" value={field.type} readOnly onChange={() => undefined} />
      <LabeledInput label="字段标识" value={field.field_key} onChange={(value) => onChange((item) => ({ ...item, field_key: value }))} />
      <LabeledInput label="标题" value={field.label} onChange={(value) => onChange((item) => ({ ...item, label: value }))} />
      <SwitchRow label="显示开关" checked={field.display.visible} onChange={(checked) => onChange((item) => ({ ...item, display: { ...item.display, visible: checked } }))} />
      <SwitchRow label="是否显示标签" checked={field.display.show_label} onChange={(checked) => onChange((item) => ({ ...item, display: { ...item.display, show_label: checked } }))} />
      <LabeledInput label="默认值" value={String(field.display.default_value ?? "")} onChange={(value) => onChange((item) => ({ ...item, display: { ...item.display, default_value: value } }))} />
      <LabeledInput label="占位内容" value={field.display.placeholder} onChange={(value) => onChange((item) => ({ ...item, display: { ...item.display, placeholder: value } }))} />
      <LabeledInput label="宽度" value={field.display.width} onChange={(value) => onChange((item) => ({ ...item, display: { ...item.display, width: value } }))} />
      {field.validation.max_length !== null && <LabeledInput label="最大长度" value={String(field.validation.max_length)} onChange={(value) => onChange((item) => ({ ...item, validation: { ...item.validation, max_length: Number(value) || 0 } }))} />}
      {field.show_word_count !== undefined && <SwitchRow label="是否显示字数统计" checked={Boolean(field.show_word_count)} onChange={(checked) => onChange((item) => ({ ...item, show_word_count: checked }))} />}
      <SwitchRow label="禁用" checked={field.operation.disabled} onChange={(checked) => onChange((item) => ({ ...item, operation: { ...item.operation, disabled: checked } }))} />
      <SwitchRow label="必填" checked={field.validation.required} onChange={(checked) => onChange((item) => ({ ...item, validation: { ...item.validation, required: checked } }))} />
      {field.type === "date" && <LabeledInput label="日期格式" value={field.date_format ?? "YYYY-MM-DD"} onChange={(value) => onChange((item) => ({ ...item, date_format: value }))} />}
      {field.data && (
        <>
          <SwitchRow label="是否多选" checked={field.data.multiple} onChange={(checked) => onChange((item) => ({ ...item, data: item.data ? { ...item.data, multiple: checked } : null }))} />
          <LabeledSelect label="数据来源类型" value={field.data.data_source_type} options={["country_config", "static", "remote", "odoo"]} labels={{ country_config: "国家配置", static: "静态数据", remote: "远端数据", odoo: "Odoo 数据" }} onChange={(value) => onChange((item) => ({ ...item, data: item.data ? { ...item.data, data_source_type: value as "country_config" | "static" | "remote" | "odoo" } : null }))} />
          {field.data.data_source_type === "country_config" && (
            <>
              <LabeledSelect label="国家配置字段" value={field.data.country_config_field ?? "Country"} options={countryConfigDataFields} onChange={(value) => onChange((item) => ({ ...item, data: item.data ? { ...item.data, country_config_field: value as CountryConfigDataField } : null }))} />
              <div className="reference-box compact">
                <strong>数据预览</strong>
                <span>{countryDataPreview || "暂无可用国家配置数据"}</span>
              </div>
            </>
          )}
          <LabeledSelect label="数据源模式" value={field.data.data_source.mode} options={["Model", "Selection"]} onChange={(value) => onChange((item) => ({ ...item, data: item.data ? { ...item.data, data_source: { ...item.data.data_source, mode: value as "Model" | "Selection" } } : null }))} />
          <LabeledInput label="模型" value={field.data.data_source.model} onChange={(value) => onChange((item) => ({ ...item, data: item.data ? { ...item.data, data_source: { ...item.data.data_source, model: value } } : null }))} />
          <LabeledSelect label="数据权限" value={field.data.data_permission} options={["follow_role", "follow_feature", "all_data"]} labels={{ follow_role: "跟随角色", follow_feature: "跟随功能点", all_data: "全部数据" }} onChange={(value) => onChange((item) => ({ ...item, data: item.data ? { ...item.data, data_permission: value as "follow_role" | "follow_feature" | "all_data" } : null }))} />
        </>
      )}
      <LabeledInput label="校验类型" value={field.validation.validation_type ?? ""} onChange={(value) => onChange((item) => ({ ...item, validation: { ...item.validation, validation_type: value || null } }))} />
      <LabeledInput label="正则表达式" value={field.validation.regex} onChange={(value) => onChange((item) => ({ ...item, validation: { ...item.validation, regex: value } }))} />
      <SwitchRow label="是否联动" checked={field.linkage.enabled} onChange={(checked) => onChange((item) => ({ ...item, linkage: { ...item.linkage, enabled: checked } }))} />
      <LabeledInput label="关联规则" value={field.linkage.rule ?? ""} onChange={(value) => onChange((item) => ({ ...item, linkage: { ...item.linkage, rule: value || null } }))} />
      <SwitchRow label="手动更改触发规则" checked={field.linkage.trigger_on_manual_change} onChange={(checked) => onChange((item) => ({ ...item, linkage: { ...item.linkage, trigger_on_manual_change: checked } }))} />
      <SwitchRow label="值变动触发规则" checked={field.linkage.trigger_on_value_change} onChange={(checked) => onChange((item) => ({ ...item, linkage: { ...item.linkage, trigger_on_value_change: checked } }))} />
      <LabeledInput label="组件样式" value={field.display.component_style ?? ""} onChange={(value) => onChange((item) => ({ ...item, display: { ...item.display, component_style: value || null } }))} />
    </div>
  );
}

function FormPropertyPanel({ form, onChange }: { form: FormDefinition; onChange: (patch: Partial<FormDefinition>) => void }) {
  return (
    <div className="property-body">
      <LabeledInput label="表单编码" value={form.code} readOnly onChange={() => undefined} />
      <LabeledInput label="表单名称" value={form.name} onChange={(value) => onChange({ name: value })} />
      <LabeledSelect label="业务类型" value={form.businessType} options={businessTypes} onChange={(value) => onChange({ businessType: value as BusinessType })} />
      <LabeledSelect label="状态" value={form.status} options={["启用", "草稿", "停用"]} onChange={(value) => onChange({ status: value as FormDefinition["status"] })} />
    </div>
  );
}

function RulesPanel() {
  return (
    <div className="placeholder-panel">
      <h3>业务规则</h3>
      <p>可在此配置字段联动、显隐条件、默认值计算与提交校验规则。</p>
      <button className="secondary-btn full">+ 新增规则</button>
    </div>
  );
}

function FormPreview({ fields }: { fields: FormField[] }) {
  return (
    <div className="preview-form">
      {fields.map((field) => field.display.visible && <div key={field.id} className="preview-field"><FieldRenderer field={field} /></div>)}
    </div>
  );
}

function CountryConfigList(props: {
  rules: CountryRule[];
  filters: CountryFilters;
  onFiltersChange: (filters: CountryFilters) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (rule: CountryRule) => void;
}) {
  const filteredRules = useMemo(
    () =>
      props.rules.filter((rule) => {
        if (props.filters.country && rule.country !== props.filters.country) return false;
        if (props.filters.serviceType && rule.service_type !== props.filters.serviceType) return false;
        if (props.filters.supportStatus && rule.support_status !== props.filters.supportStatus) return false;
        if (props.filters.localEntity && rule.local_entity !== props.filters.localEntity) return false;
        if (props.filters.status && rule.status !== props.filters.status) return false;
        return true;
      }),
    [props.filters, props.rules],
  );
  const updateFilter = (key: keyof CountryFilters, value: string) => props.onFiltersChange({ ...props.filters, [key]: value });

  return (
    <section className="page">
      <PageHeader title="国家配置" action={<button className="primary-btn" onClick={props.onCreate}>+ 新增</button>} />
      <div className="filter-bar country-filter-bar">
        <LabeledSelect label="Country" value={props.filters.country} options={["", ...countryOptions]} labels={{ "": "全部" }} onChange={(value) => updateFilter("country", value)} />
        <LabeledSelect label="Local Entity" value={props.filters.localEntity} options={["", ...localEntityOptions]} labels={{ "": "全部" }} onChange={(value) => updateFilter("localEntity", value)} />
        <LabeledSelect label="状态" value={props.filters.status} options={["", "active", "draft", "inactive"]} labels={{ "": "全部", active: "启用", draft: "草稿", inactive: "停用" }} onChange={(value) => updateFilter("status", value)} />
      </div>
      <div className="table-wrap">
        <table className="compact-table">
          <thead>
            <tr>
              <th>国家 / Country</th>
              <th>本地实体 / Local Entity</th>
              <th>更新时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule) => (
              <tr key={rule.id}>
                <td><button className="link-btn" onClick={() => props.onOpen(rule.id)}>{rule.country}</button></td>
                <td><LocalEntityTag value={rule.local_entity} /></td>
                <td>{rule.updated_at}</td>
                <td><CountryRuleStatusTag status={rule.status} /></td>
                <td className="actions">
                  <button className="link-btn" onClick={() => props.onOpen(rule.id)}>查看</button>
                  <button className="link-btn" onClick={() => props.onOpen(rule.id)}>编辑</button>
                  <button className="danger-link" onClick={() => props.onDelete(rule.id)}>删除</button>
                  <button className="link-btn" onClick={() => props.onCopy(rule)}>复制规则</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CountryRuleDetail(props: {
  rule: CountryRule;
  allRules: CountryRule[];
  error: string;
  onBack: () => void;
  onChange: (updater: (rule: CountryRule) => CountryRule) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDeactivate: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"base" | "documents" | "rules">("base");
  const rule = props.rule;
  const isDisabledBySupport = rule.support_status === "Not Supported";
  const duplicate = props.allRules.some((item) => item.id !== rule.id && item.country === rule.country && item.service_type === rule.service_type && item.status !== "inactive");
  const update = (patch: Partial<CountryRule>) => props.onChange((current) => ({ ...current, ...patch }));
  const updatePayroll = (patch: Partial<CountryRule["payroll_rules"]>) => props.onChange((current) => ({ ...current, payroll_rules: { ...current.payroll_rules, ...patch } }));
  const updateTermination = (patch: Partial<CountryRule["termination_rules"]>) => props.onChange((current) => ({ ...current, termination_rules: { ...current.termination_rules, ...patch } }));
  const updateHolidayCalendar = (patch: Partial<CountryRule["holiday_calendar"]>) => props.onChange((current) => ({ ...current, holiday_calendar: { ...current.holiday_calendar, ...patch } }));

  return (
    <section className="page country-detail-page">
      <div className="detail-title sticky-title">
        <button className="icon-btn" onClick={props.onBack} title="返回">{"<"}</button>
        <div className="title-stack">
          <h1>国家规则详情</h1>
          <span>{rule.country}</span>
        </div>
        <div className="detail-actions">
          <button className="secondary-btn" onClick={props.onSaveDraft}>保存</button>
          <button className="primary-btn" onClick={props.onPublish}>发布</button>
          <button className="secondary-btn" onClick={props.onDeactivate}>停用规则</button>
          <button className="secondary-btn" onClick={props.onBack}>取消</button>
        </div>
      </div>
      {(props.error || duplicate) && <div className="alert danger">{props.error || "Country + Service Type 不能重复"}</div>}

      <div className="detail-tabs">
        <button className={activeTab === "base" ? "active" : ""} onClick={() => setActiveTab("base")}>基础规则</button>
        <button className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>所需文件配置</button>
        <button className={activeTab === "rules" ? "active" : ""} onClick={() => setActiveTab("rules")}>节假日配置</button>
      </div>

      <div className="detail-tab-content">
        {activeTab === "base" && (
          <ConfigCard title="基础规则">
            <div className="form-grid-3">
              <LabeledSelect label="Country" value={rule.country} options={countryOptions} onChange={(value) => update({ country: value })} />
              <LabeledInput label="Effective Date" value={rule.effective_date} onChange={(value) => update({ effective_date: value })} />
            </div>
            <SegmentedRow label="Local Entity" options={localEntityOptions} value={rule.local_entity} onChange={(value) => update({ local_entity: value as LocalEntity })} />
            {rule.local_entity === "Partner" && <LabeledInput label="Partner Name" value={rule.partner_name} onChange={(value) => update({ partner_name: value })} />}
            <SwitchRow label="Status 启用 / 停用" checked={rule.status === "active"} onChange={(checked) => update({ status: checked ? "active" : "inactive" })} />
          </ConfigCard>
        )}

        {activeTab === "documents" && (
          <ConfigCard title="所需文件配置" disabled={isDisabledBySupport}>
            <RequiredDocumentsTable rows={rule.required_documents} disabled={isDisabledBySupport} onChange={(rows) => update({ required_documents: rows })} />
          </ConfigCard>
        )}

        {activeTab === "rules" && (
          <ConfigCard title="节假日配置">
            <HolidayTable rows={rule.holiday_calendar.holiday_list} onChange={(rows) => updateHolidayCalendar({ holiday_list: rows })} />
          </ConfigCard>
        )}
      </div>
    </section>
  );
}

function createStatutoryRow(itemName = "CPF", index = Date.now()): StatutoryItemDetail {
  return {
    id: `statutory-${Date.now()}-${index}`,
    item_name: itemName,
    employee_type: "All",
    residency: "All",
    employer_contribution_rate: "",
    employee_contribution_rate: "",
    calculation_base: "Monthly Wage",
    cap: "",
    effective_date: "2026-07-01",
    remark: "",
  };
}

function createDocumentRow(index = Date.now()): RequiredDocumentRule {
  return {
    id: `document-${Date.now()}-${index}`,
    document_name: "Passport",
    required_for: "Employee",
    required_type: "Required",
    accepted_format: ["PDF"],
    max_file_size: "10MB",
    template_available: false,
    remark: "",
  };
}

function createHolidayRow(index = Date.now()): HolidayItem {
  return {
    id: `holiday-${Date.now()}-${index}`,
    holiday_name: "New Holiday",
    date: "2026-01-01",
    type: "Public Holiday",
    is_working_day: false,
    remark: "",
  };
}

function StatutoryTable({ rows, disabled, onChange }: { rows: StatutoryItemDetail[]; disabled?: boolean; onChange: (rows: StatutoryItemDetail[]) => void }) {
  const updateRow = (id: string, patch: Partial<StatutoryItemDetail>) => onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  return (
    <EditableTable title="Statutory Item Detail" disabled={disabled} onAdd={() => onChange([...rows, createStatutoryRow("New Item", rows.length)])}>
      <thead>
        <tr>
          {["Item Name", "Employee Type", "Residency", "Employer Contribution Rate", "Employee Contribution Rate", "Calculation Base", "Cap / Ceiling", "Effective Date", "Remark", "操作"].map((head) => <th key={head}>{head}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <EditableCell disabled={disabled} value={row.item_name} onChange={(value) => updateRow(row.id, { item_name: value })} />
            <EditableCell disabled={disabled} value={row.employee_type} onChange={(value) => updateRow(row.id, { employee_type: value })} />
            <EditableCell disabled={disabled} value={row.residency} onChange={(value) => updateRow(row.id, { residency: value })} />
            <EditableCell disabled={disabled} value={row.employer_contribution_rate} onChange={(value) => updateRow(row.id, { employer_contribution_rate: value })} />
            <EditableCell disabled={disabled} value={row.employee_contribution_rate} onChange={(value) => updateRow(row.id, { employee_contribution_rate: value })} />
            <EditableCell disabled={disabled} value={row.calculation_base} onChange={(value) => updateRow(row.id, { calculation_base: value })} />
            <EditableCell disabled={disabled} value={row.cap} onChange={(value) => updateRow(row.id, { cap: value })} />
            <EditableCell disabled={disabled} value={row.effective_date} onChange={(value) => updateRow(row.id, { effective_date: value })} />
            <EditableCell disabled={disabled} value={row.remark} onChange={(value) => updateRow(row.id, { remark: value })} />
            <td><button disabled={disabled} className="danger-link" onClick={() => onChange(rows.filter((item) => item.id !== row.id))}>删除</button></td>
          </tr>
        ))}
      </tbody>
    </EditableTable>
  );
}

function RequiredDocumentsTable({ rows, disabled, onChange }: { rows: RequiredDocumentRule[]; disabled?: boolean; onChange: (rows: RequiredDocumentRule[]) => void }) {
  const updateRow = (id: string, patch: Partial<RequiredDocumentRule>) => onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  return (
    <EditableTable title="Required Documents" disabled={disabled} onAdd={() => onChange([...rows, createDocumentRow(rows.length)])}>
      <thead>
        <tr>
          {["Document Name", "Required For", "Required / Optional", "Accepted Format", "Max File Size", "Template Available", "Remark", "操作"].map((head) => <th key={head}>{head}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <EditableCell disabled={disabled} value={row.document_name} onChange={(value) => updateRow(row.id, { document_name: value })} />
            <EditableCell disabled={disabled} value={row.required_for} onChange={(value) => updateRow(row.id, { required_for: value })} />
            <td><select disabled={disabled} value={row.required_type} onChange={(event) => updateRow(row.id, { required_type: event.target.value as "Required" | "Optional" })}><option>Required</option><option>Optional</option></select></td>
            <EditableCell disabled={disabled} value={row.accepted_format.join(", ")} onChange={(value) => updateRow(row.id, { accepted_format: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
            <EditableCell disabled={disabled} value={row.max_file_size} onChange={(value) => updateRow(row.id, { max_file_size: value })} />
            <td><input type="checkbox" disabled={disabled} checked={row.template_available} onChange={(event) => updateRow(row.id, { template_available: event.target.checked })} /></td>
            <EditableCell disabled={disabled} value={row.remark} onChange={(value) => updateRow(row.id, { remark: value })} />
            <td><button disabled={disabled} className="danger-link" onClick={() => onChange(rows.filter((item) => item.id !== row.id))}>删除</button></td>
          </tr>
        ))}
      </tbody>
    </EditableTable>
  );
}

function HolidayTable({ rows, onChange }: { rows: HolidayItem[]; onChange: (rows: HolidayItem[]) => void }) {
  const updateRow = (id: string, patch: Partial<HolidayItem>) => onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  return (
    <EditableTable title="Holiday List" onAdd={() => onChange([...rows, createHolidayRow(rows.length)])}>
      <thead>
        <tr>
          {["Holiday Name", "Date", "Type", "Is Working Day", "Remark", "操作"].map((head) => <th key={head}>{head}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <EditableCell value={row.holiday_name} onChange={(value) => updateRow(row.id, { holiday_name: value })} />
            <EditableCell value={row.date} onChange={(value) => updateRow(row.id, { date: value })} />
            <EditableCell value={row.type} onChange={(value) => updateRow(row.id, { type: value })} />
            <td><input type="checkbox" checked={row.is_working_day} onChange={(event) => updateRow(row.id, { is_working_day: event.target.checked })} /></td>
            <EditableCell value={row.remark} onChange={(value) => updateRow(row.id, { remark: value })} />
            <td><button className="danger-link" onClick={() => onChange(rows.filter((item) => item.id !== row.id))}>删除</button></td>
          </tr>
        ))}
      </tbody>
    </EditableTable>
  );
}

function EditableTable({ title, children, onAdd, disabled }: { title: string; children: React.ReactNode; onAdd: () => void; disabled?: boolean }) {
  return (
    <div className="editable-table-block">
      <div className="editable-table-head">
        <h3>{title}</h3>
        <button className="secondary-btn small" disabled={disabled} onClick={onAdd}>+ 新增行</button>
      </div>
      <div className="table-wrap inner-table">
        <table>{children}</table>
      </div>
    </div>
  );
}

function EditableCell({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <td><input className="table-input" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} /></td>;
}

function PermissionSettings(props: {
  tab: PermissionTab;
  roles: RolePermission[];
  features: FeaturePermission[];
  countryRules: CountryRule[];
  selectedRoleId: string | null;
  selectedFeatureId: string | null;
  onTabChange: (tab: PermissionTab) => void;
  onRoleSelect: (id: string | null) => void;
  onFeatureSelect: (id: string | null) => void;
  onRoleChange: (roleId: string, patch: Partial<RolePermission>) => void;
  onFeatureChange: (featureId: string, patch: Partial<FeaturePermission>) => void;
}) {
  const role = props.roles.find((item) => item.id === props.selectedRoleId) ?? null;
  const feature = props.features.find((item) => item.id === props.selectedFeatureId) ?? null;
  return (
    <section className="page">
      <PageHeader title="权限设置" />
      <div className="top-tabs">
        <button className={props.tab === "role" ? "active" : ""} onClick={() => props.onTabChange("role")}>角色权限</button>
        <button className={props.tab === "feature" ? "active" : ""} onClick={() => props.onTabChange("feature")}>功能权限</button>
        <button className={props.tab === "data" ? "active" : ""} onClick={() => props.onTabChange("data")}>数据权限</button>
      </div>
      {props.tab === "role" && (
        <div className="split-layout">
          <PermissionRoleList roles={props.roles} onOpen={props.onRoleSelect} />
          {role && <RoleDetail role={role} countryRules={props.countryRules} onClose={() => props.onRoleSelect(null)} onChange={(patch) => props.onRoleChange(role.id, patch)} />}
        </div>
      )}
      {props.tab === "feature" && (
        <div className="split-layout">
          <FeatureList features={props.features} onOpen={props.onFeatureSelect} />
          {feature && <FeatureDetail feature={feature} onClose={() => props.onFeatureSelect(null)} onChange={(patch) => props.onFeatureChange(feature.id, patch)} />}
        </div>
      )}
      {props.tab === "data" && <DataPermissionDisabled />}
    </section>
  );
}

function PermissionRoleList({ roles, onOpen }: { roles: RolePermission[]; onOpen: (id: string) => void }) {
  return (
    <div className="table-wrap fill">
      <table>
        <thead>
          <tr>
            <th>角色编码</th>
            <th>角色名称</th>
            <th>角色说明</th>
            <th>成员数量</th>
            <th>状态</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <td className="mono">{role.code}</td>
              <td>{role.name}</td>
              <td>{role.description}</td>
              <td>{role.memberCount}</td>
              <td><StatusPill status={role.status} /></td>
              <td>{role.updatedAt}</td>
              <td><button className="link-btn" onClick={() => onOpen(role.id)}>详情</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoleDetail({ role, countryRules, onClose, onChange }: { role: RolePermission; countryRules: CountryRule[]; onClose: () => void; onChange: (patch: Partial<RolePermission>) => void }) {
  const countries = Array.from(new Set(countryRules.map((rule) => rule.country)));
  return (
    <aside className="side-detail">
      <div className="side-detail-head"><h2>角色详情</h2><button className="icon-btn" onClick={onClose}>×</button></div>
      <LabeledInput label="角色名称" value={role.name} onChange={(value) => onChange({ name: value })} />
      <LabeledInput label="角色编码" value={role.code} readOnly onChange={() => undefined} />
      <label className="form-row"><span>角色说明</span><textarea value={role.description} onChange={(event) => onChange({ description: event.target.value })} rows={3} /></label>
      <LabeledInput label="关联成员" value={role.members.join(", ")} onChange={(value) => onChange({ members: value.split(",").map((item) => item.trim()).filter(Boolean), memberCount: value.split(",").filter(Boolean).length })} />
      <LabeledInput label="可访问方案" value={role.schemes.join(", ")} onChange={(value) => onChange({ schemes: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
      <LabeledInput label="可访问表单" value={role.forms.join(", ")} onChange={(value) => onChange({ forms: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
      <MultiCheckRow label="可访问国家" options={countries} values={role.accessibleCountries} onChange={(values) => onChange({ accessibleCountries: values })} />
      <MultiCheckRow label="可访问服务类型" options={businessTypes} values={role.accessibleServiceTypes} onChange={(values) => onChange({ accessibleServiceTypes: values as BusinessType[] })} />
      <SwitchRow label="可编辑国家配置" checked={role.canEditCountryConfig} onChange={(checked) => onChange({ canEditCountryConfig: checked })} />
      <SwitchRow label="可发布国家配置" checked={role.canPublishCountryConfig} onChange={(checked) => onChange({ canPublishCountryConfig: checked })} />
      <button className="primary-btn full">保存</button>
    </aside>
  );
}

function FeatureList({ features, onOpen }: { features: FeaturePermission[]; onOpen: (id: string) => void }) {
  return (
    <div className="table-wrap fill">
      <table>
        <thead>
          <tr>
            <th>权限编码</th>
            <th>权限名称</th>
            <th>所属业务</th>
            <th>权限说明</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr key={feature.id}>
              <td className="mono">{feature.code}</td>
              <td>{feature.name}</td>
              <td>
                <div className="tag-row">
                  {(feature.businessTypes ?? [feature.businessType]).map((type) => <Tag key={type}>{type}</Tag>)}
                </div>
              </td>
              <td>{feature.description}</td>
              <td><StatusPill status={feature.status} /></td>
              <td><button className="link-btn" onClick={() => onOpen(feature.id)}>详情</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureDetail({ feature, onClose, onChange }: { feature: FeaturePermission; onClose: () => void; onChange: (patch: Partial<FeaturePermission>) => void }) {
  return (
    <aside className="side-detail">
      <div className="side-detail-head"><h2>功能权限详情</h2><button className="icon-btn" onClick={onClose}>×</button></div>
      <LabeledInput label="权限名称" value={feature.name} onChange={(value) => onChange({ name: value })} />
      <LabeledInput label="权限编码" value={feature.code} readOnly onChange={() => undefined} />
      <MultiSelectDropdown
        label="所属业务类型"
        options={businessTypes}
        values={feature.businessTypes ?? [feature.businessType]}
        onChange={(values) => {
          const nextValues = values.length ? values as BusinessType[] : [feature.businessType];
          onChange({ businessTypes: nextValues, businessType: nextValues[0] });
        }}
      />
      <label className="form-row"><span>权限说明</span><textarea value={feature.description} onChange={(event) => onChange({ description: event.target.value })} rows={3} /></label>
      <LabeledInput label="关联角色" value={feature.roles.join(", ")} onChange={(value) => onChange({ roles: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
      <button className="primary-btn full">保存</button>
    </aside>
  );
}

function DataPermissionDisabled() {
  return (
    <div className="disabled-data">
      <h2>数据权限模块</h2>
      <p>数据权限将在后续版本开放配置</p>
      <div className="disabled-options">
        {["跟随角色", "跟随功能点", "全部数据"].map((item) => (
          <label key={item}><input type="radio" disabled /> {item}</label>
        ))}
      </div>
    </div>
  );
}

function PageHeader({ title, action }: { title: string; action?: React.ReactNode; compact?: boolean }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
      </div>
      {action}
    </header>
  );
}

function GlobalWatermark({ text }: { text: string }) {
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const items = useMemo(() => {
    const columns = Math.ceil(viewport.width / 220) + 6;
    const rows = Math.ceil(viewport.height / 120) + 8;
    return Array.from({ length: columns * rows }, (_, index) => index);
  }, [viewport.height, viewport.width]);

  return (
    <div className="global-watermark" aria-hidden="true">
      <div className="global-watermark-inner">
        {items.map((item) => (
          <span className="global-watermark-item" key={item}>{text}</span>
        ))}
      </div>
    </div>
  );
}

function Modal({ title, children, footer, onClose, wide }: { title: string; children: React.ReactNode; footer?: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="modal-mask">
      <div className={wide ? "modal wide" : "modal"}>
        <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>×</button></div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function Drawer({ title, children, onClose, narrow, fromLeft, plain }: { title: string; children: React.ReactNode; onClose: () => void; narrow?: boolean; fromLeft?: boolean; plain?: boolean }) {
  return (
    <aside className={`${narrow ? "drawer narrow" : "drawer"} ${fromLeft ? "from-left" : ""} ${plain ? "plain" : ""}`}>
      {!plain && <div className="drawer-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>×</button></div>}
      <div className="drawer-body">{children}</div>
    </aside>
  );
}

function LabeledInput({ label, value, onChange, placeholder, required, readOnly }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; readOnly?: boolean }) {
  return (
    <label className="form-row">
      <span>{required && <b>*</b>} {label}</span>
      <input value={value} readOnly={readOnly} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function LabeledSelect({ label, value, options, labels, onChange }: { label: string; value: string; options: readonly string[]; labels?: Record<string, string>; onChange: (value: string) => void }) {
  return (
    <label className="form-row">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {!value && <option value="">请选择</option>}
        {options.map((option) => <option value={option} key={option}>{labels?.[option] ?? option}</option>)}
      </select>
    </label>
  );
}

function MultiSelectDropdown({ label, options, values, onChange }: { label: string; options: readonly string[]; values: string[]; onChange: (values: string[]) => void }) {
  const toggle = (option: string) => onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
  return (
    <div className="form-row">
      <span>{label}</span>
      <details className="multi-select-dropdown">
        <summary>
          <span>{values.length ? values.join("、") : "请选择"}</span>
          <b>⌄</b>
        </summary>
        <div className="multi-select-menu">
          {options.map((option) => (
            <label key={option} className="multi-select-option">
              <input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option)} />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
}

function SwitchRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="switch-row">
      <span>{label}</span>
      <span className="switch"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span /></span>
    </label>
  );
}

function MultiCheckRow({ label, options, values, onChange }: { label: string; options: readonly string[]; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="form-row">
      <span>{label}</span>
      <div className="check-grid">
        {options.map((option) => (
          <label key={option} className="check-item">
            <input
              type="checkbox"
              checked={values.includes(option)}
              onChange={() => onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option])}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

function SegmentedRow({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="form-row">
      <span>{label}</span>
      <div className="segmented-row">
        {options.map((option) => (
          <button key={option} className={value === option ? "active" : ""} onClick={() => onChange(option)}>{option}</button>
        ))}
      </div>
    </div>
  );
}

function TagPicker({ label, options, values, onChange, disabled }: { label: string; options: readonly string[]; values: string[]; onChange: (values: string[]) => void; disabled?: boolean }) {
  return (
    <div className="form-row">
      <span>{label}</span>
      <div className="tag-picker">
        {options.map((option) => (
          <button
            key={option}
            disabled={disabled}
            className={values.includes(option) ? "active" : ""}
            onClick={() => onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option])}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfigCard({ title, disabled, children }: { title: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <section className={disabled ? "config-card disabled-config" : "config-card"}>
      <div className="config-card-head">
        <h2>{title}</h2>
        {disabled && <span>Support Status = Not Supported，当前配置置灰</span>}
      </div>
      {children}
    </section>
  );
}

function ReadonlyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="readonly-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const statusClass = status === "启用" || status === "已配置" ? "ok" : status === "草稿" || status === "部分配置" ? "draft" : "off";
  return <span className={`status-pill ${statusClass}`}>{status}</span>;
}

function SupportTag({ status }: { status: SupportStatus }) {
  return <span className={`support-tag ${status === "Supported" ? "supported" : status === "Need Review" ? "review" : "unsupported"}`}>{status}</span>;
}

function LocalEntityTag({ value }: { value: LocalEntity }) {
  return <span className={`local-entity-tag ${value === "Yes" ? "yes" : value === "Partner" ? "partner" : "no"}`}>{value}</span>;
}

function CountryRuleStatusTag({ status }: { status: CountryRuleStatus }) {
  const labels: Record<CountryRuleStatus, string> = { active: "启用", draft: "草稿", inactive: "停用" };
  return <span className={`status-pill ${status === "active" ? "ok" : status === "draft" ? "draft" : "off"}`}>{labels[status]}</span>;
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>;
}

function nodeStatusClass(status: NodeStatus) {
  if (status === "已完成") return "done";
  if (status === "进行中") return "doing";
  return "todo";
}

export default App;
