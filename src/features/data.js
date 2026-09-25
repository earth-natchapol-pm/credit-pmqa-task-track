export const initialFeatures = [
  {
    name: 'Credit limit increase', description: '', prdDocuments: [], product: 'Credit Platform', priority: 'P0', pmPic: 'Alex Kim', qaPic: 'Jamie Morgan',
    uatStart: '2026-09-21', uatEnd: '2026-09-25', uatStatus: 'In progress', uatSignedOff: '',
    liveStart: '2026-09-29', liveEnd: '2026-09-30', liveStatus: 'Planned', liveSignedOff: '', status: 'uat',
    subtasks: [
      { id: 'subtask-1', name: 'Scope alignment', status: 'in-progress', startDate: '2026-09-21', endDate: '2026-09-23', tasks: [{ id: 'task-1', name: 'Set up meeting', done: false }, { id: 'task-2', name: 'Create alignment deck', done: true }] },
      { id: 'subtask-2', name: 'QA readiness', status: 'not-started', startDate: '2026-09-24', endDate: '2026-09-26', tasks: [{ id: 'task-3', name: 'Confirm release checklist', done: false }] },
    ],
  },
  {
    name: 'Application onboarding refresh', description: '', prdDocuments: [], product: 'Applications', priority: 'P1', pmPic: 'Maya Lopez', qaPic: 'Tessa Chen',
    uatStart: '2026-09-28', uatEnd: '2026-10-02', uatStatus: 'Planned', uatSignedOff: '',
    liveStart: '2026-10-07', liveEnd: '2026-10-08', liveStatus: 'Planned', liveSignedOff: '', status: 'planned',
    subtasks: [
      { id: 'subtask-3', name: 'Requirements review', status: 'not-started', tasks: [] },
    ],
  },
  {
    name: 'Statement history export', description: '', prdDocuments: [], product: 'Servicing', priority: 'P2', pmPic: 'Maya Lopez', qaPic: 'Ravi Shah',
    uatStart: '2026-09-14', uatEnd: '2026-09-18', uatStatus: 'Signed off', uatSignedOff: '2026-09-18',
    liveStart: '2026-09-23', liveEnd: '2026-09-24', liveStatus: 'Planned', liveSignedOff: '', status: 'ready',
    subtasks: [
      { id: 'subtask-4', name: 'Release preparation', status: 'done', tasks: [{ id: 'task-4', name: 'Confirm sign-off', done: true }] },
    ],
  },
  {
    name: 'Risk band regression', description: '', prdDocuments: [], product: 'Risk decisioning', priority: 'P1', pmPic: 'Alex Kim', qaPic: 'Ravi Shah',
    uatStart: '2026-09-15', uatEnd: '2026-09-19', uatStatus: 'Blocked', uatSignedOff: '',
    liveStart: '2026-09-26', liveEnd: '2026-09-27', liveStatus: 'At risk', liveSignedOff: '', status: 'blocked',
    subtasks: [
      { id: 'subtask-5', name: 'Dependency follow-up', status: 'on-hold', tasks: [{ id: 'task-5', name: 'Resolve blocker with engineering', done: false }] },
    ],
  },
];
