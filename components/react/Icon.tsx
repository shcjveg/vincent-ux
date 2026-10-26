// vincent-ux v1.4.3 · components/react/Icon.tsx
// 按含义引用图标：<Icon name="chat" />。含义表见 icons/icons.json；新增含义先登记再用。
// 依赖：lucide-react
import type { SVGProps } from 'react'
import {
  History, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, BadgeCheck, ArrowUpDown, Blocks, BriefcaseBusiness, Cloud, GitBranch, GitCommitHorizontal, Globe, Laptop, LayoutGrid, Pin, User, Users, Calendar, ChartPie, Check, ChevronDown, ChevronLeft, ChevronRight, CircleX, Clapperboard,
  ClipboardCheck, Clock, Compass, Copy, CornerDownLeft, Download, Ellipsis, ExternalLink, Eye, Factory, Headset, Info, LayoutList,
  ListFilter, ListTodo, LoaderCircle, Lock, Megaphone, MessageCircle, MessageCirclePlus, Package,
  PanelRightOpen, Pencil, Play, Plus, RotateCcw, Search, Settings, ShieldAlert, ShoppingCart, Signpost, SlidersHorizontal, Store, Trash2,
  TriangleAlert, Truck, Upload, UserRoundCog, Wallet, X,
  type LucideIcon,
} from 'lucide-react'

const ICONS = {
  // 导航
  todo: ListTodo, home: LayoutList, product: Package, store: Store, explore: Compass, checklist: ClipboardCheck,
  publish: Upload, promote: Megaphone, ship: Truck, support: Headset, risk: ShieldAlert, wallet: Wallet, report: ChartPie,
  settings: Settings, apps: LayoutGrid, build: Blocks,
  // 动作
  chat: MessageCircle, 'new-chat': MessageCirclePlus, send: CornerDownLeft, add: Plus, edit: Pencil, delete: Trash2,
  search: Search, filter: ListFilter, sort: ArrowUpDown, 'sort-desc': ArrowDown, 'sort-asc': ArrowUp, download: Download, upload: Upload, external: ExternalLink,
  copy: Copy, refresh: RotateCcw, play: Play, guide: Signpost, 'switch-user': UserRoundCog, close: X, back: ArrowLeft,
  next: ArrowRight, expand: ChevronDown, more: Ellipsis, 'collapse-sidebar': ChevronLeft, 'expand-sidebar': ChevronRight,
  'open-workspace': PanelRightOpen, calendar: Calendar, watch: Eye, pin: Pin, history: History,
  // 状态
  done: Check, pending: Clock, warning: TriangleAlert, blocked: CircleX, verified: BadgeCheck, info: Info, locked: Lock,
  running: LoaderCircle,
  // 对象与身份
  maker: Factory, reseller: ShoppingCart, creator: Clapperboard, owner: BriefcaseBusiness, operator: SlidersHorizontal,
  personal: User, team: Users, public: Globe, local: Laptop, cloud: Cloud, fork: GitBranch, version: GitCommitHorizontal,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS
const SIZE = { sm: 14, md: 16, lg: 18 } as const

type IconProps = { name: IconName; size?: keyof typeof SIZE; label?: string } & Omit<SVGProps<SVGSVGElement>, 'name' | 'ref'>

// label：纯图标、需要读屏读出时才给；其余情况图标只是装饰，对读屏隐藏
export function Icon({ name, size = 'md', label, ...rest }: IconProps) {
  const C = ICONS[name]
  // data-icon 写含义名：规则检查（scripts/audit.js）按含义找图标，不依赖 lucide 的类名
  return <C {...rest} data-icon={name} size={SIZE[size]} strokeWidth={1.75} aria-hidden={label ? undefined : true} aria-label={label} />
}
