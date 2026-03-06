/* ─── School Admin barrel exports ─── */
export { DataTable, type Column, type DataTableAction } from './DataTable';
export { KanbanBoard, type KanbanCard, type KanbanColumn } from './KanbanBoard';
export {
  ApprovalCard, type ApprovalItem,
  ActionInboxItem, type ActionItem,
  StatusBadge, OperationBlock, WorkflowStepper,
  type QuickCreateAction,
} from './AdminComponents';
export { FormDialog, type FormField, type FormFieldOption, type FormDialogProps } from './FormDialog';
export { DetailPanel, DetailFields, type DetailTab, type DetailAction, type DetailField, type DetailPanelProps } from './DetailPanel';
