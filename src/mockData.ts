import type {
  BusinessType,
  CountryRule,
  FeaturePermission,
  FieldType,
  FormDefinition,
  FormField,
  RolePermission,
  Scheme,
  WorkflowNode,
} from "./types";

export const businessTypes: BusinessType[] = ["EOR", "GPO", "HRO", "RPO"];
export const roleNames = ["客户", "总部项目对接人", "财务", "当地实操人员"];
export const attachmentFormats = ["PDF", "DOC / DOCX", "XLS / XLSX", "PNG / JPG", "ZIP"];
export const countryOptions = ["Singapore", "Malaysia", "Japan", "China", "Indonesia", "Vietnam", "Thailand", "Philippines", "United States"];
export const supportStatusOptions = ["Supported", "Need Review", "Not Supported"] as const;
export const localEntityOptions = ["Yes", "Partner", "No"] as const;
export const statutoryItemOptions = ["CPF", "Tax", "Levy", "Social Security", "Medical Insurance", "Pension", "Unemployment Insurance", "Housing Fund", "Social Insurance", "Employment Insurance", "Not Applicable"];
export const terminationDocumentOptions = ["Resignation Letter", "Termination Letter", "Final Payroll Confirmation"];
export const countryRuleReferenceFields = ["Required Documents", "Payroll Cutoff Rule", "Final Pay Rule", "Notice Period Rule", "Holiday Calendar", "Statutory Items"] as const;
export const countryConfigDataFields = ["Country", "Service Type", "Statutory Items", "Required Documents", "Holiday Calendar"] as const;

export const createCode = (prefix: string, index: number) => {
  const stamp = "20260701";
  return `${prefix}-${stamp}-${String(index).padStart(3, "0")}`;
};

export const createField = (type: FieldType, label: string, index = Date.now()): FormField => {
  const normalized = label
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w\u4e00-\u9fa5]/g, "");
  const key = `${type}_${normalized}_${String(index).slice(-4)}`;
  const isSelect = type === "select" || type === "radio" || type === "checkbox" || type === "tree" || type === "department";
  const isDate = type === "date";
  const isTextLike = type === "input" || type === "textarea";

  return {
    id: key,
    type,
    field_key: key,
    label,
    display: {
      visible: true,
      show_label: true,
      placeholder: isDate || isSelect ? "请选择" : "请输入",
      width: "90%",
      default_value: type === "switch" ? false : null,
      component_style: null,
    },
    operation: {
      disabled: false,
      show_clear_button: isSelect,
    },
    validation: {
      required: false,
      validation_type: isDate ? "date" : isTextLike ? "string" : null,
      regex: "",
      max_length: isTextLike ? 0 : null,
    },
    data: isSelect
      ? {
          multiple: type === "checkbox",
          data_source_type: "odoo",
          country_config_field: "Country",
          data_source: {
            mode: "Model",
            model: "res.selection",
            args: [],
            context: {},
          },
          data_permission: "follow_role",
        }
      : null,
    linkage: {
      enabled: false,
      rule: null,
      trigger_on_manual_change: true,
      trigger_on_value_change: false,
    },
    date_format: isDate ? "YYYY-MM-DD" : undefined,
    show_word_count: isTextLike ? false : undefined,
  };
};

const node = (
  code: string,
  name: string,
  roles: string[],
  status: WorkflowNode["status"],
  isClientAction = false,
): WorkflowNode => ({
  id: code,
  code,
  name,
  description: "服务交付流程节点，可配置执行角色、附件、表单与完成规则。",
  roles,
  owner: roles.join(" / "),
  dueDate: "-",
  completionDate: status === "已完成" ? "2026-07-01 15:48" : "-",
  status,
  onlyOneRequired: roles.length > 1,
  requiresAttachment: false,
  attachmentFormats: ["PDF", "XLS / XLSX"],
  requiresForm: isClientAction,
  linkedFormId: isClientAction ? "FORM-GPO-002" : "",
  isClientAction,
  countryRuleReference: {
    enabled: false,
    fields: [],
    allowSupplementDocuments: true,
  },
});

export const initialSchemes: Scheme[] = [
  {
    id: "scheme-gpo-001",
    code: "SCHEME-GPO-001",
    name: "Global Payroll Monthly Service",
    businessType: "GPO",
    creator: "Admin",
    createdAt: "2026-06-18 10:16",
    updatedAt: "2026-07-01 09:30",
    status: "启用",
    applicableCountry: {
      country: "Singapore",
      serviceType: ["GPO"],
    },
    stages: [
      { id: "stage-gpo-place", name: "Place Order", nodes: [] },
      {
        id: "stage-gpo-data",
        name: "Data Collection",
        nodes: [
          node("NODE-GPO-001", "Input Movement Data", ["客户"], "已完成", true),
          node("NODE-GPO-002", "Movement Data Validation and Process Payroll", ["当地实操人员"], "已完成"),
        ],
      },
      {
        id: "stage-gpo-payroll",
        name: "Payroll Processing",
        nodes: [
          node("NODE-GPO-003", "Upload Draft Payroll Report", ["当地实操人员"], "已完成"),
          node("NODE-GPO-004", "Review Draft Payroll Report", ["客户"], "已完成", true),
          node("NODE-GPO-005", "Upload Payroll Invoice", ["财务"], "进行中"),
          node("NODE-GPO-006", "Review Payroll Invoice", ["客户"], "未开始", true),
        ],
      },
      {
        id: "stage-gpo-payment",
        name: "Payment",
        nodes: [
          node("NODE-GPO-007", "Process Invoice Payment", ["客户"], "未开始", true),
          node("NODE-GPO-008", "Review Payment Status", ["财务"], "未开始"),
          node("NODE-GPO-009", "Salary Payday", ["当地实操人员", "财务"], "未开始"),
        ],
      },
    ],
  },
  {
    id: "scheme-eor-001",
    code: "SCHEME-EOR-001",
    name: "EOR Onboarding Service",
    businessType: "EOR",
    creator: "Admin",
    createdAt: "2026-06-20 14:22",
    updatedAt: "2026-06-29 11:12",
    status: "启用",
    applicableCountry: {
      country: "Singapore",
      serviceType: ["EOR", "GPO"],
    },
    stages: [
      {
        id: "stage-eor-info",
        name: "Employee Information Collection",
        nodes: [
          node("NODE-EOR-002", "Upload Employee Basic Information", ["客户"], "进行中", true),
          node("NODE-EOR-003", "Validate Employee Documents", ["当地实操人员"], "未开始"),
        ],
      },
      { id: "stage-eor-contract", name: "Contract Preparation", nodes: [node("NODE-EOR-004", "Prepare Local Employment Contract", ["当地实操人员"], "未开始")] },
      {
        id: "stage-eor-resignation",
        name: "Contract Resignation",
        nodes: [
          node("NODE-EOR-005", "Upload Resigned Contract", ["客户"], "未开始", true),
          node("NODE-EOR-006", "Complete Onboarding Confirmation", ["客户", "总部项目对接人"], "未开始", true),
        ],
      },
    ],
  },
];

export const initialForms: FormDefinition[] = [
  {
    id: "FORM-EOR-001",
    code: "FORM-EOR-001",
    name: "Employee Basic Information Form",
    businessType: "EOR",
    creator: "Admin",
    updatedAt: "2026-06-30 17:20",
    status: "启用",
    fields: [
      createField("date", "生效时间", 1001),
      createField("input", "姓", 1002),
      createField("input", "名", 1003),
      createField("input", "英文中间名", 1004),
      createField("select", "性别", 1005),
      createField("select", "户口类型", 1006),
    ],
  },
  {
    id: "FORM-GPO-002",
    code: "FORM-GPO-002",
    name: "Payroll Movement Data Form",
    businessType: "GPO",
    creator: "Admin",
    updatedAt: "2026-07-01 08:55",
    status: "启用",
    fields: [createField("select", "Movement Type", 2001), createField("number", "Employee Count", 2002), createField("file", "Payroll Attachment", 2003)],
  },
  {
    id: "FORM-GPO-003",
    code: "FORM-GPO-003",
    name: "Invoice Confirmation Form",
    businessType: "GPO",
    creator: "Admin",
    updatedAt: "2026-06-28 16:35",
    status: "草稿",
    fields: [createField("money", "Invoice Amount", 3001), createField("date", "Payment Date", 3002), createField("textarea", "Confirmation Note", 3003)],
  },
];

export const initialRoles: RolePermission[] = [
  {
    id: "role-client",
    code: "ROLE-CLIENT",
    name: "客户",
    description: "外部客户操作与确认节点。",
    memberCount: 18,
    status: "启用",
    updatedAt: "2026-06-30 14:00",
    members: ["Nekie", "Client Admin"],
    schemes: ["Global Payroll Monthly Service", "EOR Onboarding Service"],
    forms: ["Employee Basic Information Form", "Payroll Movement Data Form"],
    accessibleCountries: [],
    accessibleServiceTypes: [],
    canEditCountryConfig: false,
    canPublishCountryConfig: false,
  },
  {
    id: "role-pm",
    code: "ROLE-PM",
    name: "总部项目对接人",
    description: "总部项目协调、方案维护与客户沟通。",
    memberCount: 8,
    status: "启用",
    updatedAt: "2026-06-30 14:20",
    members: ["Project Owner"],
    schemes: ["Global Payroll Monthly Service", "EOR Onboarding Service"],
    forms: ["Invoice Confirmation Form"],
    accessibleCountries: ["Singapore", "Japan", "Vietnam", "United States"],
    accessibleServiceTypes: ["EOR", "GPO", "HRO", "RPO"],
    canEditCountryConfig: true,
    canPublishCountryConfig: true,
  },
  {
    id: "role-finance",
    code: "ROLE-FINANCE",
    name: "财务",
    description: "账单、发票、付款状态处理。",
    memberCount: 6,
    status: "启用",
    updatedAt: "2026-06-29 13:12",
    members: ["Finance CN"],
    schemes: ["Global Payroll Monthly Service"],
    forms: ["Invoice Confirmation Form"],
    accessibleCountries: ["Singapore", "Japan"],
    accessibleServiceTypes: ["GPO", "EOR"],
    canEditCountryConfig: false,
    canPublishCountryConfig: false,
  },
  {
    id: "role-ops",
    code: "ROLE-LOCAL-OPS",
    name: "当地实操人员",
    description: "当地交付团队处理资料、薪资与员工服务。",
    memberCount: 21,
    status: "启用",
    updatedAt: "2026-06-28 09:45",
    members: ["Local Ops"],
    schemes: ["Global Payroll Monthly Service", "EOR Onboarding Service"],
    forms: ["Employee Basic Information Form", "Payroll Movement Data Form"],
    accessibleCountries: ["Singapore", "Japan", "Vietnam"],
    accessibleServiceTypes: ["EOR", "GPO", "RPO"],
    canEditCountryConfig: true,
    canPublishCountryConfig: false,
  },
];

const featureNames: Record<BusinessType, string[]> = {
  EOR: ["查看 EOR 订单", "创建 EOR 订单", "填写员工信息", "上传雇佣资料", "审核员工信息", "查看合同", "查看账单", "确认付款"],
  GPO: ["查看 GPO 订单", "上传薪资变动数据", "审核薪资数据", "上传 Payroll Report", "审核 Payroll Report", "上传 Payroll Invoice", "审核 Payroll Invoice", "确认付款"],
  HRO: ["查看 HRO 订单", "提交服务需求", "上传员工资料", "查看处理进度", "审核服务结果"],
  RPO: ["查看 RPO 订单", "创建招聘需求", "提交 JD", "查看候选人", "面试反馈", "Offer 确认", "入职确认"],
};

const normalizeFeatureName = (name: string) =>
  name
    .replace(/^(查看|查询)\s+(EOR|GPO|HRO|RPO)\s+订单$/, "查看订单")
    .replace(/^创建\s+(EOR|GPO|HRO|RPO)\s+订单$/, "创建订单");
const featureCodeSegment = (name: string) =>
  name === "查看订单"
    ? "ORDER-VIEW"
    : name === "创建订单"
      ? "ORDER-CREATE"
    : name
        .replace(/\s+/g, "-")
        .replace(/[^\w\u4e00-\u9fa5-]/g, "")
        .toUpperCase();

const featureMap = new Map<string, FeaturePermission>();

Object.entries(featureNames).forEach(([type, names]) => {
  names.forEach((rawName, index) => {
    const businessType = type as BusinessType;
    const name = normalizeFeatureName(rawName);
    const existing = featureMap.get(name);

    if (existing) {
      if (!existing.businessTypes.includes(businessType)) existing.businessTypes.push(businessType);
      existing.description = `${existing.businessTypes.join(" / ")} 服务交付中的功能点权限。`;
      return;
    }

    featureMap.set(name, {
      id: `feature-${featureCodeSegment(name).toLowerCase()}`,
      code: `PERM-${featureCodeSegment(name)}`,
      name,
      businessType,
      businessTypes: [businessType],
      description: `${businessType} 服务交付中的功能点权限。`,
      status: "启用",
      roles: index % 3 === 0 ? ["客户"] : index % 3 === 1 ? ["总部项目对接人", "当地实操人员"] : ["财务"],
    });
  });
});

export const initialFeatures: FeaturePermission[] = Array.from(featureMap.values());

const statutory = (
  id: string,
  item_name: string,
  employee_type = "All",
  residency = "All",
  employer_contribution_rate = "",
  employee_contribution_rate = "",
  calculation_base = "Monthly Wage",
  cap = "",
): CountryRule["statutory_items"][number] => ({
  id,
  item_name,
  employee_type,
  residency,
  employer_contribution_rate,
  employee_contribution_rate,
  calculation_base,
  cap,
  effective_date: "2026-01-01",
  remark: "",
});

const requiredDocument = (
  id: string,
  document_name: string,
  required_for = "Employee",
  accepted_format = ["PDF", "PNG", "JPG"],
  template_available = false,
): CountryRule["required_documents"][number] => ({
  id,
  document_name,
  required_for,
  required_type: "Required",
  accepted_format,
  max_file_size: "10MB",
  template_available,
  remark: "",
});

const holiday = (id: string, holiday_name: string, date: string): CountryRule["holiday_calendar"]["holiday_list"][number] => ({
  id,
  holiday_name,
  date,
  type: "Public Holiday",
  is_working_day: false,
  remark: "",
});

const countryRuleBase = {
  effective_date: "2026-07-01",
  status: "active" as const,
  payroll_rules: {
    payroll_cutoff_rule: "每月 15 日",
    payroll_frequency: "Monthly" as const,
    salary_payment_date: "每月最后一个工作日",
    payroll_data_submission_deadline: "每月 15 日前提交薪资变动数据",
    late_submission_handling: "超过截止日提交的数据顺延至下个薪资周期处理",
  },
  termination_rules: {
    final_pay_rule: "离职后 X 天内",
    notice_period_rule: "按合同或法律",
    termination_document_required: ["Resignation Letter", "Final Payroll Confirmation"],
    unused_leave_payout_rule: "按当地法律或合同约定处理",
    severance_pay_rule: "按当地法律判断",
    remark: "",
  },
  holiday_calendar: {
    holiday_calendar_name: "本地节假日",
    holiday_source: "System Default" as const,
    holiday_list: [holiday("holiday-new-year", "New Year's Day", "2026-01-01")],
  },
  risk_notes: "",
  operation_notes: "",
  review_required: false,
  reviewer_role: [],
  created_by: "Admin",
  created_at: "2026-07-01 10:00:00",
  updated_at: "2026-07-01 10:00:00",
};

export const initialCountryRules: CountryRule[] = [
  {
    ...countryRuleBase,
    id: "country_rule_sg_eor",
    country: "Singapore",
    service_type: "EOR",
    support_status: "Supported",
    local_entity: "Yes",
    partner_name: "",
    statutory_items: [
      statutory("sg-eor-cpf", "CPF", "Local", "Citizen / PR", "17%", "20%", "Monthly Ordinary Wage", "CPF wage ceiling"),
      statutory("sg-eor-tax", "Tax", "All", "All", "N/A", "Withholding / filing rules", "Taxable Income", ""),
      statutory("sg-eor-levy", "Levy", "Foreign Worker", "Non-local", "By worker category", "N/A", "Monthly", ""),
    ],
    required_documents: [
      requiredDocument("sg-eor-passport", "Passport"),
      requiredDocument("sg-eor-contract", "Employment Contract", "Employee", ["PDF", "DOC", "DOCX"], true),
    ],
  },
  {
    ...countryRuleBase,
    id: "country_rule_sg_gpo",
    country: "Singapore",
    service_type: "GPO",
    support_status: "Supported",
    local_entity: "Yes",
    partner_name: "",
    statutory_items: [
      statutory("sg-gpo-cpf", "CPF", "Local", "Citizen / PR", "17%", "20%", "Monthly Ordinary Wage", "CPF wage ceiling"),
      statutory("sg-gpo-tax", "Tax", "All", "All", "N/A", "N/A", "Payroll Data", ""),
    ],
    required_documents: [
      requiredDocument("sg-gpo-employee-list", "Employee List", "Payroll", ["XLS", "XLSX"], true),
      requiredDocument("sg-gpo-movement", "Payroll Movement Data", "Payroll", ["XLS", "XLSX"], true),
      requiredDocument("sg-gpo-bank", "Bank Account Proof"),
    ],
    termination_rules: {
      ...countryRuleBase.termination_rules,
      final_pay_rule: "不适用",
      notice_period_rule: "不适用",
      termination_document_required: [],
      unused_leave_payout_rule: "不适用",
      severance_pay_rule: "不适用",
    },
  },
  {
    ...countryRuleBase,
    id: "country_rule_jp_eor",
    country: "Japan",
    service_type: "EOR",
    support_status: "Need Review",
    local_entity: "Partner",
    partner_name: "Local Partner A",
    statutory_items: [
      statutory("jp-eor-social", "Social Insurance", "All", "Resident", "Company rate", "Employee rate", "Monthly Salary", ""),
      statutory("jp-eor-pension", "Pension", "All", "Resident", "Shared", "Shared", "Standard Monthly Remuneration", ""),
      statutory("jp-eor-employment", "Employment Insurance", "All", "Resident", "Applicable rate", "Applicable rate", "Monthly Salary", ""),
    ],
    required_documents: [
      requiredDocument("jp-eor-passport", "Passport"),
      requiredDocument("jp-eor-residence", "Residence Card"),
      requiredDocument("jp-eor-contract", "Employment Contract", "Employee", ["PDF", "DOC", "DOCX"], true),
    ],
    payroll_rules: {
      ...countryRuleBase.payroll_rules,
      payroll_cutoff_rule: "每月 10 日",
      payroll_data_submission_deadline: "每月 10 日前提交薪资变动数据",
    },
    termination_rules: {
      ...countryRuleBase.termination_rules,
      final_pay_rule: "按当地法律",
      notice_period_rule: "按合同或当地法律",
    },
    risk_notes: "涉及当地劳动法与社保规则，请发布前由当地伙伴复核。",
    review_required: true,
    reviewer_role: ["总部项目对接人", "当地实操人员"],
  },
  {
    ...countryRuleBase,
    id: "country_rule_vn_rpo",
    country: "Vietnam",
    service_type: "RPO",
    support_status: "Supported",
    local_entity: "Partner",
    partner_name: "Vietnam Recruiting Partner",
    statutory_items: [statutory("vn-rpo-na", "Not Applicable", "Candidate", "All", "N/A", "N/A", "N/A", "")],
    required_documents: [
      requiredDocument("vn-rpo-jd", "JD", "Recruitment", ["PDF", "DOC", "DOCX"], true),
      requiredDocument("vn-rpo-plan", "Hiring Plan", "Recruitment", ["PDF", "XLS", "XLSX"], false),
      requiredDocument("vn-rpo-feedback", "Interview Feedback", "Recruitment", ["PDF", "DOC", "DOCX"], true),
    ],
    payroll_rules: {
      ...countryRuleBase.payroll_rules,
      payroll_cutoff_rule: "不适用",
      salary_payment_date: "不适用",
      payroll_data_submission_deadline: "不适用",
      late_submission_handling: "不适用",
    },
    termination_rules: {
      ...countryRuleBase.termination_rules,
      final_pay_rule: "不适用",
      notice_period_rule: "不适用",
      termination_document_required: [],
      unused_leave_payout_rule: "不适用",
      severance_pay_rule: "不适用",
    },
  },
  {
    ...countryRuleBase,
    id: "country_rule_us_eor",
    country: "United States",
    service_type: "EOR",
    support_status: "Not Supported",
    local_entity: "No",
    partner_name: "",
    statutory_items: [],
    required_documents: [],
    payroll_rules: {
      ...countryRuleBase.payroll_rules,
      payroll_cutoff_rule: "-",
      salary_payment_date: "-",
      payroll_data_submission_deadline: "-",
      late_submission_handling: "-",
    },
    termination_rules: {
      ...countryRuleBase.termination_rules,
      final_pay_rule: "-",
      notice_period_rule: "-",
      termination_document_required: [],
      unused_leave_payout_rule: "-",
      severance_pay_rule: "-",
    },
    holiday_calendar: {
      ...countryRuleBase.holiday_calendar,
      holiday_calendar_name: "-",
      holiday_list: [],
    },
  },
];

export const basicFieldComponents = [
  ["input", "单行文本"],
  ["textarea", "多行文本"],
  ["select", "下拉选择框"],
  ["date", "日期选择器"],
  ["radio", "单选框组"],
  ["checkbox", "多选框组"],
  ["number", "数字"],
  ["money", "金额"],
  ["switch", "开关"],
  ["text", "文字"],
  ["group", "分组文字"],
] as const;

export const advancedFieldComponents = [
  ["image", "图片"],
  ["file", "文件"],
  ["table", "表格"],
  ["custom", "自定义区域"],
  ["employee", "员工"],
  ["department", "部门选择器"],
  ["tree", "树型选择器"],
] as const;
