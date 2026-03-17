/**
 * NEXUS Console - TypeScript types for all AgentOS API modules.
 *
 * Derived from the Agno AgentOS Python schemas (agno.os.routers schemas
 * and agno.os.schema). These types mirror the JSON shapes returned by the
 * AgentOS REST API so the frontend can consume them with full type safety.
 */

// ---------------------------------------------------------------------------
// Generic / Shared
// ---------------------------------------------------------------------------

export interface PaginationInfo {
  page: number
  limit: number
  total_pages: number
  total_count: number
  search_time_ms?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationInfo
}

export type SortOrder = 'asc' | 'desc'

// ---------------------------------------------------------------------------
// Config (GET /config)
// ---------------------------------------------------------------------------

export interface DomainDbConfig {
  db_id: string
  domain_config?: Record<string, unknown>
}

export interface DomainConfig {
  dbs: DomainDbConfig[]
}

export interface AgentSummary {
  id?: string
  name?: string
  description?: string
  db_id?: string
}

export interface TeamSummary {
  id?: string
  name?: string
  description?: string
  db_id?: string
  mode?: string
}

export interface WorkflowSummary {
  id?: string
  name?: string
  description?: string
  db_id?: string
  is_component?: boolean
  current_version?: number
  stage?: string
}

export interface InterfaceInfo {
  type: string
  version: string
  route: string
}

export interface OSConfigResponse {
  os_id: string
  name?: string
  description?: string
  available_models?: string[]
  os_database?: string
  databases: string[]
  chat?: Record<string, unknown>
  session?: DomainConfig
  metrics?: DomainConfig
  memory?: DomainConfig
  knowledge?: DomainConfig
  evals?: DomainConfig
  traces?: DomainConfig
  agents: AgentSummary[]
  teams: TeamSummary[]
  workflows: WorkflowSummary[]
  interfaces: InterfaceInfo[]
}

export interface OSModel {
  id?: string
  provider?: string
}

// ---------------------------------------------------------------------------
// Traces
// ---------------------------------------------------------------------------

export interface TraceNode {
  id: string
  name: string
  type: string // AGENT | TEAM | WORKFLOW | LLM | TOOL | ...
  duration: string
  start_time: string // ISO 8601
  end_time: string
  status: string // OK | ERROR
  input?: string | null
  output?: string | null
  error?: string | null
  spans?: TraceNode[] | null
  step_type?: string | null
  metadata?: Record<string, unknown> | null
  extra_data?: Record<string, unknown> | null
}

export interface TraceSummary {
  trace_id: string
  name: string
  status: string
  duration: string
  start_time: string
  end_time: string
  total_spans: number
  error_count: number
  input?: string | null
  run_id?: string | null
  session_id?: string | null
  user_id?: string | null
  agent_id?: string | null
  team_id?: string | null
  workflow_id?: string | null
  created_at: string
}

export interface TraceDetail {
  trace_id: string
  name: string
  status: string
  duration: string
  start_time: string
  end_time: string
  total_spans: number
  error_count: number
  input?: string | null
  output?: string | null
  error?: string | null
  run_id?: string | null
  session_id?: string | null
  user_id?: string | null
  agent_id?: string | null
  team_id?: string | null
  workflow_id?: string | null
  created_at: string
  tree: TraceNode[]
}

export interface TraceSessionStats {
  session_id: string
  user_id?: string | null
  agent_id?: string | null
  team_id?: string | null
  workflow_id?: string | null
  total_traces: number
  first_trace_at: string
  last_trace_at: string
}

export type TraceSearchGroupBy = 'run' | 'session'

export interface TraceSearchRequest {
  filter?: Record<string, unknown> | null
  group_by?: TraceSearchGroupBy
  page?: number
  limit?: number
}

export interface FilterFieldSchema {
  key: string
  label: string
  type: string // string | number | datetime | enum
  operators: string[]
  values?: string[] | null
}

export interface FilterSchemaResponse {
  fields: FilterFieldSchema[]
  logical_operators: string[]
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

export interface UserMemory {
  memory_id: string
  memory: string
  topics?: string[] | null
  agent_id?: string | null
  team_id?: string | null
  user_id?: string | null
  updated_at?: string | null
}

export interface UserMemoryCreate {
  memory: string
  user_id?: string | null
  topics?: string[] | null
}

export interface UserStats {
  user_id: string
  total_memories: number
  last_memory_updated_at?: string | null
}

export interface DeleteMemoriesRequest {
  memory_ids: string[]
  user_id?: string | null
}

export interface OptimizeMemoriesRequest {
  user_id: string
  model?: string | null
  apply?: boolean
}

export interface OptimizeMemoriesResponse {
  memories: UserMemory[]
  memories_before: number
  memories_after: number
  tokens_before: number
  tokens_after: number
  tokens_saved: number
  reduction_percentage: number
}

// ---------------------------------------------------------------------------
// Knowledge
// ---------------------------------------------------------------------------

export type ContentStatus = 'processing' | 'completed' | 'failed'

export interface ContentResponse {
  id: string
  name?: string | null
  description?: string | null
  type?: string | null
  size?: string | null
  linked_to?: string | null
  metadata?: Record<string, unknown> | null
  access_count?: number | null
  status?: ContentStatus | null
  status_message?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface ContentStatusResponse {
  id?: string | null
  status: ContentStatus
  status_message: string
}

export interface ContentUpdate {
  name?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
  reader_id?: string | null
}

export interface ReaderSchema {
  id: string
  name?: string | null
  description?: string | null
  chunkers?: string[] | null
}

export interface ChunkerSchema {
  key: string
  name?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
}

export interface VectorDbSchema {
  id: string
  name?: string | null
  description?: string | null
  search_types?: string[] | null
}

export interface VectorSearchResult {
  id: string
  content: string
  name?: string | null
  meta_data?: Record<string, unknown> | null
  usage?: Record<string, unknown> | null
  reranking_score?: number | null
  content_id?: string | null
  content_origin?: string | null
  size?: number | null
}

export interface VectorSearchRequest {
  query: string
  db_id?: string | null
  knowledge_id?: string | null
  vector_db_ids?: string[] | null
  search_type?: string | null
  max_results?: number | null
  filters?: Record<string, unknown> | null
  meta?: { limit?: number; page?: number } | null
}

export interface RemoteContentSource {
  id: string
  name: string
  type: string // s3 | gcs | sharepoint | github | azureblob
  metadata?: Record<string, unknown> | null
  prefix?: string | null
}

export interface SourceFile {
  key: string
  name: string
  size?: number | null
  last_modified?: string | null
  content_type?: string | null
}

export interface SourceFolder {
  prefix: string
  name: string
  is_empty: boolean
}

export interface SourceFilesResponse {
  source_id: string
  source_name: string
  prefix?: string | null
  folders: SourceFolder[]
  files: SourceFile[]
  meta: PaginationInfo
}

export interface KnowledgeConfigResponse {
  readers?: Record<string, ReaderSchema> | null
  readersForType?: Record<string, string[]> | null
  chunkers?: Record<string, ChunkerSchema> | null
  filters?: string[] | null
  vector_dbs?: VectorDbSchema[] | null
  remote_content_sources?: RemoteContentSource[] | null
}

// ---------------------------------------------------------------------------
// Evals
// ---------------------------------------------------------------------------

export type EvalType =
  | 'accuracy'
  | 'performance'
  | 'reliability'
  | 'agent_as_judge'

export interface EvalRunInput {
  agent_id?: string | null
  team_id?: string | null
  model_id?: string | null
  model_provider?: string | null
  eval_type: EvalType
  input: string
  additional_guidelines?: string | null
  additional_context?: string | null
  num_iterations?: number
  name?: string | null
  // Accuracy
  expected_output?: string | null
  // Agent-as-judge
  criteria?: string | null
  scoring_strategy?: 'numeric' | 'binary'
  threshold?: number
  // Performance
  warmup_runs?: number
  // Reliability
  expected_tool_calls?: string[] | null
}

export interface EvalSchema {
  id: string
  agent_id?: string | null
  model_id?: string | null
  model_provider?: string | null
  team_id?: string | null
  workflow_id?: string | null
  name?: string | null
  evaluated_component_name?: string | null
  eval_type: EvalType
  eval_data: Record<string, unknown>
  eval_input?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DeleteEvalRunsRequest {
  eval_run_ids: string[]
}

export interface UpdateEvalRunRequest {
  name: string
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------

export interface ScheduleCreate {
  name: string
  cron_expr: string
  endpoint: string
  method?: string
  description?: string | null
  payload?: Record<string, unknown> | null
  timezone?: string
  timeout_seconds?: number
  max_retries?: number
  retry_delay_seconds?: number
}

export interface ScheduleUpdate {
  name?: string | null
  cron_expr?: string | null
  endpoint?: string | null
  method?: string | null
  description?: string | null
  payload?: Record<string, unknown> | null
  timezone?: string | null
  timeout_seconds?: number | null
  max_retries?: number | null
  retry_delay_seconds?: number | null
}

export interface ScheduleResponse {
  id: string
  name: string
  description?: string | null
  method: string
  endpoint: string
  payload?: Record<string, unknown> | null
  cron_expr: string
  timezone: string
  timeout_seconds: number
  max_retries: number
  retry_delay_seconds: number
  enabled: boolean
  next_run_at?: number | null
  created_at?: number | null
  updated_at?: number | null
}

export interface ScheduleStateResponse {
  id: string
  name: string
  enabled: boolean
  next_run_at?: number | null
  updated_at?: number | null
}

export interface ScheduleRunResponse {
  id: string
  schedule_id: string
  attempt: number
  triggered_at?: number | null
  completed_at?: number | null
  status: string
  status_code?: number | null
  run_id?: string | null
  session_id?: string | null
  error?: string | null
  input?: Record<string, unknown> | null
  output?: Record<string, unknown> | null
  requirements?: Record<string, unknown>[] | null
  created_at?: number | null
}

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------

export interface ApprovalResolve {
  status: 'approved' | 'rejected'
  resolved_by?: string | null
  resolution_data?: Record<string, unknown> | null
}

export interface ApprovalResponse {
  id: string
  run_id: string
  session_id: string
  status: string
  source_type: string
  approval_type?: string | null
  pause_type?: string | null
  tool_name?: string | null
  tool_args?: Record<string, unknown> | null
  expires_at?: number | null
  agent_id?: string | null
  team_id?: string | null
  workflow_id?: string | null
  user_id?: string | null
  schedule_id?: string | null
  schedule_run_id?: string | null
  source_name?: string | null
  requirements?: Record<string, unknown>[] | null
  context?: Record<string, unknown> | null
  resolution_data?: Record<string, unknown> | null
  resolved_by?: string | null
  resolved_at?: number | null
  created_at?: number | null
  updated_at?: number | null
  run_status?: string | null
}

export interface ApprovalCountResponse {
  count: number
}

export interface ApprovalStatusResponse {
  approval_id: string
  status: string
  run_id: string
  resolved_at?: number | null
  resolved_by?: string | null
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export interface TokenMetrics {
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  audio_tokens?: number
  input_audio_tokens?: number
  output_audio_tokens?: number
  cached_tokens?: number
  cache_read_tokens?: number
  cache_write_tokens?: number
  reasoning_tokens?: number
  [key: string]: number | undefined
}

export interface ModelMetric {
  model_id: string
  model_provider?: string
  count: number
}

export interface DayAggregatedMetrics {
  id: string
  agent_runs_count: number
  agent_sessions_count: number
  team_runs_count: number
  team_sessions_count: number
  workflow_runs_count: number
  workflow_sessions_count: number
  users_count: number
  token_metrics: TokenMetrics
  model_metrics: ModelMetric[]
  date: string
  created_at: string
  updated_at: string
}

export interface MetricsResponse {
  metrics: DayAggregatedMetrics[]
  updated_at?: string | null
}

// ---------------------------------------------------------------------------
// Components / Studio
// ---------------------------------------------------------------------------

export type ComponentType = 'agent' | 'team' | 'workflow'

export interface ComponentCreate {
  name: string
  component_id?: string | null
  component_type: ComponentType
  description?: string | null
  metadata?: Record<string, unknown> | null
  config?: Record<string, unknown> | null
  label?: string | null
  stage?: string
  notes?: string | null
  set_current?: boolean
}

export interface ComponentResponse {
  component_id: string
  component_type: ComponentType
  name?: string | null
  description?: string | null
  current_version?: number | null
  metadata?: Record<string, unknown> | null
  created_at: number
  updated_at?: number | null
}

export interface ComponentUpdate {
  name?: string | null
  description?: string | null
  component_type?: string | null
  metadata?: Record<string, unknown> | null
  current_version?: number | null
}

export interface ConfigCreate {
  config: Record<string, unknown>
  version?: number | null
  label?: string | null
  stage?: string
  notes?: string | null
  links?: Record<string, unknown>[] | null
  set_current?: boolean
}

export interface ComponentConfigResponse {
  component_id: string
  version: number
  label?: string | null
  stage: string
  config: Record<string, unknown>
  notes?: string | null
  created_at: number
  updated_at?: number | null
}

export interface ConfigUpdate {
  config?: Record<string, unknown> | null
  label?: string | null
  stage?: string | null
  notes?: string | null
  links?: Record<string, unknown>[] | null
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export type RegistryResourceType =
  | 'tool'
  | 'model'
  | 'db'
  | 'vector_db'
  | 'schema'
  | 'function'
  | 'agent'
  | 'team'

export interface RegistryContentResponse {
  name: string
  type: RegistryResourceType
  id?: string | null
  description?: string | null
  metadata?: Record<string, unknown> | null
}

// ---------------------------------------------------------------------------
// Sessions (extended)
// ---------------------------------------------------------------------------

export interface SessionSchema {
  session_id: string
  session_name: string
  session_state?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CreateSessionRequest {
  session_id?: string | null
  session_name?: string | null
  session_state?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  user_id?: string | null
  agent_id?: string | null
  team_id?: string | null
  workflow_id?: string | null
}

export interface UpdateSessionRequest {
  session_name?: string | null
  session_state?: Record<string, unknown> | null
  metadata?: Record<string, unknown> | null
  summary?: Record<string, unknown> | null
}

export interface DeleteSessionRequest {
  session_ids: string[]
  session_types: string[]
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

export interface RunSchema {
  run_id: string
  parent_run_id?: string | null
  agent_id?: string | null
  user_id?: string | null
  status?: string | null
  run_input?: string | null
  content?: string | Record<string, unknown> | null
  run_response_format?: string | null
  reasoning_content?: string | null
  reasoning_steps?: Record<string, unknown>[] | null
  metrics?: Record<string, unknown> | null
  messages?: Record<string, unknown>[] | null
  tools?: Record<string, unknown>[] | null
  events?: Record<string, unknown>[] | null
  created_at?: string | null
  references?: Record<string, unknown>[] | null
  citations?: Record<string, unknown> | null
  reasoning_messages?: Record<string, unknown>[] | null
  session_state?: Record<string, unknown> | null
  images?: Record<string, unknown>[] | null
  videos?: Record<string, unknown>[] | null
  audio?: Record<string, unknown>[] | null
  files?: Record<string, unknown>[] | null
  response_audio?: Record<string, unknown> | null
  input_media?: Record<string, unknown> | null
  followups?: string[] | null
}

export interface TeamRunSchema {
  run_id: string
  parent_run_id?: string | null
  team_id?: string | null
  status?: string | null
  content?: string | Record<string, unknown> | null
  reasoning_content?: string | null
  reasoning_steps?: Record<string, unknown>[] | null
  run_input?: string | null
  run_response_format?: string | null
  metrics?: Record<string, unknown> | null
  tools?: Record<string, unknown>[] | null
  messages?: Record<string, unknown>[] | null
  events?: Record<string, unknown>[] | null
  created_at?: string | null
  references?: Record<string, unknown>[] | null
  citations?: Record<string, unknown> | null
  reasoning_messages?: Record<string, unknown>[] | null
  session_state?: Record<string, unknown> | null
  input_media?: Record<string, unknown> | null
  images?: Record<string, unknown>[] | null
  videos?: Record<string, unknown>[] | null
  audio?: Record<string, unknown>[] | null
  files?: Record<string, unknown>[] | null
  response_audio?: Record<string, unknown> | null
  followups?: string[] | null
}

export interface WorkflowRunSchema {
  run_id: string
  run_input?: string | null
  events?: Record<string, unknown>[] | null
  workflow_id?: string | null
  user_id?: string | null
  content?: string | Record<string, unknown> | null
  content_type?: string | null
  status?: string | null
  step_results?: Record<string, unknown>[] | null
  step_executor_runs?: Record<string, unknown>[] | null
  metrics?: Record<string, unknown> | null
  created_at?: string | null
  reasoning_content?: string | null
  reasoning_steps?: Record<string, unknown>[] | null
  references?: Record<string, unknown>[] | null
  citations?: Record<string, unknown> | null
  reasoning_messages?: Record<string, unknown>[] | null
  images?: Record<string, unknown>[] | null
  videos?: Record<string, unknown>[] | null
  audio?: Record<string, unknown>[] | null
  files?: Record<string, unknown>[] | null
  response_audio?: Record<string, unknown> | null
}

// ---------------------------------------------------------------------------
// Shared model response (used by agents, teams, memory, reasoning, etc.)
// ---------------------------------------------------------------------------

export interface ModelResponse {
  name?: string | null
  model?: string | null
  provider?: string | null
}

// ---------------------------------------------------------------------------
// Agent tool metadata (from format_tools helper)
// ---------------------------------------------------------------------------

export interface AgentToolInfo {
  name: string
  description?: string | null
  parameters?: Record<string, unknown> | null
  requires_confirmation?: boolean | null
  external_execution?: boolean | null
}

// ---------------------------------------------------------------------------
// Agent sub-config sections (mirrors AgentResponse.from_agent output)
// ---------------------------------------------------------------------------

export interface AgentToolsConfig {
  tools?: AgentToolInfo[] | null
  tool_call_limit?: number | null
  tool_choice?: string | null
}

export interface AgentSessionsConfig {
  session_table?: string | null
  add_history_to_context?: boolean
  enable_session_summaries?: boolean
  num_history_runs?: number
  search_past_sessions?: boolean
  num_past_sessions_to_search?: number | null
  num_past_session_runs_in_search?: number | null
  cache_session?: boolean
}

export interface AgentKnowledgeConfig {
  db_id?: string | null
  knowledge_table?: string | null
  enable_agentic_knowledge_filters?: boolean
  knowledge_filters?: Record<string, unknown>[] | null
  references_format?: string | null
}

export interface AgentMemoryConfig {
  enable_agentic_memory?: boolean
  update_memory_on_run?: boolean
  enable_user_memories?: boolean
  metadata?: Record<string, unknown> | null
  memory_table?: string | null
  model?: ModelResponse | null
}

export interface AgentReasoningConfig {
  reasoning?: boolean
  reasoning_agent_id?: string | null
  reasoning_model?: ModelResponse | null
  reasoning_min_steps?: number
  reasoning_max_steps?: number
}

export interface AgentDefaultToolsConfig {
  read_chat_history?: boolean
  search_knowledge?: boolean
  update_knowledge?: boolean
  read_tool_call_history?: boolean
}

export interface AgentSystemMessageConfig {
  system_message?: string | null
  system_message_role?: string
  build_context?: boolean
  description?: string | null
  instructions?: string | string[] | null
  expected_output?: string | null
  additional_context?: string | null
  markdown?: boolean
  add_name_to_context?: boolean
  add_datetime_to_context?: boolean
  add_location_to_context?: boolean
  timezone_identifier?: string | null
  resolve_in_context?: boolean
}

export interface AgentExtraMessagesConfig {
  additional_input?: Record<string, unknown>[] | null
  user_message_role?: string
  build_user_context?: boolean
}

export interface AgentResponseSettingsConfig {
  retries?: number
  delay_between_retries?: number
  exponential_backoff?: boolean
  output_schema_name?: string | null
  parser_model_prompt?: string | null
  parse_response?: boolean
  structured_outputs?: boolean
  use_json_mode?: boolean
  save_response_to_file?: string | null
  parser_model?: ModelResponse | null
}

export interface AgentStreamingConfig {
  stream?: boolean
  stream_events?: boolean
}

// ---------------------------------------------------------------------------
// Agents (response from GET /agents, GET /agents/{id})
// ---------------------------------------------------------------------------

export interface AgentResponse {
  id?: string | null
  name?: string | null
  db_id?: string | null
  description?: string | null
  role?: string | null
  model?: ModelResponse | null
  tools?: AgentToolsConfig | null
  sessions?: AgentSessionsConfig | null
  knowledge?: AgentKnowledgeConfig | null
  memory?: AgentMemoryConfig | null
  reasoning?: AgentReasoningConfig | null
  default_tools?: AgentDefaultToolsConfig | null
  system_message?: AgentSystemMessageConfig | null
  extra_messages?: AgentExtraMessagesConfig | null
  response_settings?: AgentResponseSettingsConfig | null
  introduction?: string | null
  streaming?: AgentStreamingConfig | null
  metadata?: Record<string, unknown> | null
  input_schema?: Record<string, unknown> | null
  is_component?: boolean
  current_version?: number | null
  stage?: string | null
}

// ---------------------------------------------------------------------------
// Teams (response from GET /teams, GET /teams/{id})
// ---------------------------------------------------------------------------

export interface TeamResponse {
  id?: string | null
  name?: string | null
  db_id?: string | null
  description?: string | null
  role?: string | null
  mode?: string | null
  model?: ModelResponse | null
  tools?: AgentToolsConfig | null
  sessions?: AgentSessionsConfig | null
  knowledge?: AgentKnowledgeConfig | null
  memory?: AgentMemoryConfig | null
  reasoning?: AgentReasoningConfig | null
  default_tools?: AgentDefaultToolsConfig | null
  system_message?: AgentSystemMessageConfig | null
  response_settings?: AgentResponseSettingsConfig | null
  introduction?: string | null
  streaming?: AgentStreamingConfig | null
  members?: (AgentResponse | TeamResponse)[] | null
  metadata?: Record<string, unknown> | null
  input_schema?: Record<string, unknown> | null
  is_component?: boolean
  current_version?: number | null
  stage?: string | null
}

// ---------------------------------------------------------------------------
// Workflows (response from GET /workflows, GET /workflows/{id})
// ---------------------------------------------------------------------------

export interface WorkflowDetailResponse {
  id?: string | null
  name?: string | null
  db_id?: string | null
  description?: string | null
  input_schema?: Record<string, unknown> | null
  steps?: Record<string, unknown>[] | null
  agent?: AgentResponse | null
  team?: TeamResponse | null
  metadata?: Record<string, unknown> | null
  workflow_agent?: boolean
  is_component?: boolean
  current_version?: number | null
  stage?: string | null
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: string
  instantiated_at?: string
}

// ---------------------------------------------------------------------------
// Workflow Run Request
// ---------------------------------------------------------------------------

export interface WorkflowRunRequest {
  input: Record<string, unknown>
  user_id?: string | null
  session_id?: string | null
}
