/**
 * All AgentOS API route builders.
 *
 * Each function takes the base URL (e.g. "http://localhost:7777") and any
 * required path parameters, returning the full endpoint URL.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const u = (base: string, path: string) => `${base}${path}`

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

export const APIRoutes = {
  // -- Core ----------------------------------------------------------------
  Health: (base: string) => u(base, '/health'),
  Home: (base: string) => u(base, '/'),
  Config: (base: string) => u(base, '/config'),
  Models: (base: string) => u(base, '/models'),

  // -- Agents --------------------------------------------------------------
  GetAgents: (base: string) => u(base, '/agents'),
  GetAgent: (base: string, agentId: string) => u(base, `/agents/${agentId}`),
  AgentRun: (base: string, agentId: string) =>
    u(base, `/agents/${agentId}/runs`),
  CancelAgentRun: (base: string, agentId: string, runId: string) =>
    u(base, `/agents/${agentId}/runs/${runId}/cancel`),
  ContinueAgentRun: (base: string, agentId: string, runId: string) =>
    u(base, `/agents/${agentId}/runs/${runId}/continue`),
  GetAgentRun: (base: string, agentId: string, runId: string) =>
    u(base, `/agents/${agentId}/runs/${runId}`),
  ListAgentRuns: (base: string, agentId: string) =>
    u(base, `/agents/${agentId}/runs`),

  // -- Teams ---------------------------------------------------------------
  GetTeams: (base: string) => u(base, '/teams'),
  GetTeam: (base: string, teamId: string) => u(base, `/teams/${teamId}`),
  TeamRun: (base: string, teamId: string) => u(base, `/teams/${teamId}/runs`),
  CancelTeamRun: (base: string, teamId: string, runId: string) =>
    u(base, `/teams/${teamId}/runs/${runId}/cancel`),
  GetTeamRun: (base: string, teamId: string, runId: string) =>
    u(base, `/teams/${teamId}/runs/${runId}`),
  ListTeamRuns: (base: string, teamId: string) =>
    u(base, `/teams/${teamId}/runs`),

  // -- Workflows -----------------------------------------------------------
  GetWorkflows: (base: string) => u(base, '/workflows'),
  GetWorkflow: (base: string, workflowId: string) =>
    u(base, `/workflows/${workflowId}`),
  WorkflowRun: (base: string, workflowId: string) =>
    u(base, `/workflows/${workflowId}/runs`),
  CancelWorkflowRun: (base: string, workflowId: string, runId: string) =>
    u(base, `/workflows/${workflowId}/runs/${runId}/cancel`),
  GetWorkflowRun: (base: string, workflowId: string, runId: string) =>
    u(base, `/workflows/${workflowId}/runs/${runId}`),

  // -- Sessions ------------------------------------------------------------
  GetSessions: (base: string) => u(base, '/sessions'),
  CreateSession: (base: string) => u(base, '/sessions'),
  GetSession: (base: string, sessionId: string) =>
    u(base, `/sessions/${sessionId}`),
  GetSessionRuns: (base: string, sessionId: string) =>
    u(base, `/sessions/${sessionId}/runs`),
  GetSessionRun: (base: string, sessionId: string, runId: string) =>
    u(base, `/sessions/${sessionId}/runs/${runId}`),
  DeleteSession: (base: string, sessionId: string) =>
    u(base, `/sessions/${sessionId}`),
  DeleteSessions: (base: string) => u(base, '/sessions'),
  RenameSession: (base: string, sessionId: string) =>
    u(base, `/sessions/${sessionId}/rename`),
  UpdateSession: (base: string, sessionId: string) =>
    u(base, `/sessions/${sessionId}`),

  // -- Traces --------------------------------------------------------------
  GetTraces: (base: string) => u(base, '/traces'),
  GetTrace: (base: string, traceId: string) => u(base, `/traces/${traceId}`),
  GetTracesFilterSchema: (base: string) => u(base, '/traces/filter-schema'),
  GetTraceStats: (base: string) => u(base, '/trace_session_stats'),
  SearchTraces: (base: string) => u(base, '/traces/search'),

  // -- Memory --------------------------------------------------------------
  GetMemories: (base: string) => u(base, '/memories'),
  GetMemory: (base: string, memoryId: string) =>
    u(base, `/memories/${memoryId}`),
  CreateMemory: (base: string) => u(base, '/memories'),
  DeleteMemory: (base: string, memoryId: string) =>
    u(base, `/memories/${memoryId}`),
  DeleteMemories: (base: string) => u(base, '/memories'),
  UpdateMemory: (base: string, memoryId: string) =>
    u(base, `/memories/${memoryId}`),
  GetMemoryTopics: (base: string) => u(base, '/memory_topics'),
  GetUserMemoryStats: (base: string) => u(base, '/user_memory_stats'),
  OptimizeMemories: (base: string) => u(base, '/optimize-memories'),

  // -- Knowledge -----------------------------------------------------------
  GetKnowledgeConfig: (base: string) => u(base, '/knowledge/config'),
  UploadContent: (base: string) => u(base, '/knowledge/content'),
  UploadRemoteContent: (base: string) => u(base, '/knowledge/remote-content'),
  GetContent: (base: string) => u(base, '/knowledge/content'),
  GetContentById: (base: string, contentId: string) =>
    u(base, `/knowledge/content/${contentId}`),
  UpdateContent: (base: string, contentId: string) =>
    u(base, `/knowledge/content/${contentId}`),
  DeleteContentById: (base: string, contentId: string) =>
    u(base, `/knowledge/content/${contentId}`),
  DeleteAllContent: (base: string) => u(base, '/knowledge/content'),
  GetContentStatus: (base: string, contentId: string) =>
    u(base, `/knowledge/content/${contentId}/status`),
  SearchKnowledge: (base: string) => u(base, '/knowledge/search'),
  ListKnowledgeSources: (base: string, knowledgeId: string) =>
    u(base, `/knowledge/${knowledgeId}/sources`),
  ListSourceFiles: (base: string, knowledgeId: string, sourceId: string) =>
    u(base, `/knowledge/${knowledgeId}/sources/${sourceId}/files`),

  // -- Evals ---------------------------------------------------------------
  GetEvalRuns: (base: string) => u(base, '/eval-runs'),
  GetEvalRun: (base: string, evalRunId: string) =>
    u(base, `/eval-runs/${evalRunId}`),
  DeleteEvalRuns: (base: string) => u(base, '/eval-runs'),
  UpdateEvalRun: (base: string, evalRunId: string) =>
    u(base, `/eval-runs/${evalRunId}`),
  RunEval: (base: string) => u(base, '/eval-runs'),

  // -- Schedules -----------------------------------------------------------
  GetSchedules: (base: string) => u(base, '/schedules'),
  CreateSchedule: (base: string) => u(base, '/schedules'),
  GetSchedule: (base: string, scheduleId: string) =>
    u(base, `/schedules/${scheduleId}`),
  UpdateSchedule: (base: string, scheduleId: string) =>
    u(base, `/schedules/${scheduleId}`),
  DeleteSchedule: (base: string, scheduleId: string) =>
    u(base, `/schedules/${scheduleId}`),
  EnableSchedule: (base: string, scheduleId: string) =>
    u(base, `/schedules/${scheduleId}/enable`),
  DisableSchedule: (base: string, scheduleId: string) =>
    u(base, `/schedules/${scheduleId}/disable`),
  TriggerSchedule: (base: string, scheduleId: string) =>
    u(base, `/schedules/${scheduleId}/trigger`),
  GetScheduleRuns: (base: string, scheduleId: string) =>
    u(base, `/schedules/${scheduleId}/runs`),
  GetScheduleRun: (base: string, scheduleId: string, runId: string) =>
    u(base, `/schedules/${scheduleId}/runs/${runId}`),

  // -- Approvals -----------------------------------------------------------
  GetApprovals: (base: string) => u(base, '/approvals'),
  GetApproval: (base: string, approvalId: string) =>
    u(base, `/approvals/${approvalId}`),
  GetApprovalStatus: (base: string, approvalId: string) =>
    u(base, `/approvals/${approvalId}/status`),
  GetApprovalCount: (base: string) => u(base, '/approvals/count'),
  ResolveApproval: (base: string, approvalId: string) =>
    u(base, `/approvals/${approvalId}/resolve`),
  DeleteApproval: (base: string, approvalId: string) =>
    u(base, `/approvals/${approvalId}`),

  // -- Metrics -------------------------------------------------------------
  GetMetrics: (base: string) => u(base, '/metrics'),
  RefreshMetrics: (base: string) => u(base, '/metrics/refresh'),

  // -- Components / Studio -------------------------------------------------
  ListComponents: (base: string) => u(base, '/components'),
  CreateComponent: (base: string) => u(base, '/components'),
  GetComponent: (base: string, componentId: string) =>
    u(base, `/components/${componentId}`),
  UpdateComponent: (base: string, componentId: string) =>
    u(base, `/components/${componentId}`),
  DeleteComponent: (base: string, componentId: string) =>
    u(base, `/components/${componentId}`),
  ListConfigs: (base: string, componentId: string) =>
    u(base, `/components/${componentId}/configs`),
  CreateConfig: (base: string, componentId: string) =>
    u(base, `/components/${componentId}/configs`),
  UpdateConfig: (base: string, componentId: string, version: number) =>
    u(base, `/components/${componentId}/configs/${version}`),
  GetCurrentConfig: (base: string, componentId: string) =>
    u(base, `/components/${componentId}/configs/current`),
  GetConfigVersion: (base: string, componentId: string, version: number) =>
    u(base, `/components/${componentId}/configs/${version}`),
  DeleteConfigVersion: (base: string, componentId: string, version: number) =>
    u(base, `/components/${componentId}/configs/${version}`),
  SetCurrentConfig: (base: string, componentId: string, version: number) =>
    u(base, `/components/${componentId}/configs/${version}/set-current`),

  // -- Registry ------------------------------------------------------------
  ListRegistry: (base: string) => u(base, '/registry'),

  // -- Database Migrations -------------------------------------------------
  DatabaseMigrateAll: (base: string) => u(base, '/databases/all/migrate'),
  DatabaseMigrate: (base: string, dbId: string) =>
    u(base, `/databases/${dbId}/migrate`),

  // -- API Info -------------------------------------------------------------
  APIInfo: (base: string) => u(base, '/'),

  // -- Status (legacy alias) -----------------------------------------------
  Status: (base: string) => u(base, '/health')
}
