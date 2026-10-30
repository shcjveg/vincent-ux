// vincent-ux v1.5.0 · components/react/index.ts
// React 组件：只收需要状态或可访问性逻辑的组件，以及用来固定一条容易写走样的规则的组件；纯外观直接用 CSS 类名（见 components/css/）。
export { Icon, type IconName } from './Icon'
export { Fold } from './Fold'
export { Segmented } from './Segmented'
export { Select, type SelectOption } from './Select'
export { Tip, TipProvider } from './Tip'
export { Metric, DataTip, type MetricComparison } from './Metric'
export { SectionHeader } from './SectionHeader'
export { DecisionCard, type DecisionOption } from './DecisionCard'
export { ActionBar, executionLabels, type ExecutionMode, type ExecutionPlan } from './ActionBar'
export { Guide, type GuideStep } from './Guide'
export { AgentAction } from './AgentAction'

export { Button, type ButtonProps } from './Button'
export { Field } from './Field'
export { Checkbox } from './Checkbox'
export { Switch } from './Switch'
export { RadioGroup } from './RadioGroup'
export { Dialog } from './Dialog'
export { Tabs, type TabItem, type TabLink } from './Tabs'
export { TableScroll } from './TableScroll'
export { SearchField } from './SearchField'
export { FilterBar, type ActiveFilter } from './FilterBar'
export { Collection } from './Collection'
export { SelectionBar } from './SelectionBar'
export { Pagination } from './Pagination'

export { ObjectPreview } from './ObjectPreview'

export { ActionSummary } from './ActionSummary'

export { TextTip } from './TextTip'

export { SectionCard, SectionAction } from './SectionCard'

export { WorkspaceOverlay } from './WorkspaceOverlay'
export { useViewportQuery } from './useViewportQuery'

export { Attention, AttentionMark, AttentionTitle } from './Attention'
export { DetailDrawer, DrawerSection, Property } from './Detail'
export { ActionMenu } from './ActionMenu'
export { UserMenu } from './UserMenu'
export { ThemeToggle } from './ThemeToggle'
export { PortalFeed } from './PortalFeed'
export { TaskCard, type TaskCardOption, type TaskCardChoice } from './TaskCard'
export { SortMenu } from './SortMenu'
export { DateFilter, type DateFilterValue } from './DateFilter'
export { TaskStatus, type TaskTimestamp } from './TaskStatus'
export { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs'

export { EmptyState } from './EmptyState'
export { DataTime, type DataTimeValue } from './DataTime'
