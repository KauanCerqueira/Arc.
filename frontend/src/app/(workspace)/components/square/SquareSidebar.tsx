"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkspaceStore } from "@/core/store/workspaceStore";
import ThemeToggle from "@/shared/components/ui/ThemeToggle";
import { useNotifications } from "@/core/hooks/useNotifications";
import { useAuthStore } from "@/core/store/authStore";
import {
  Bell,
  LayoutGrid,
  Circle,
  Star,
  FileCheck,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Building,
  ChevronDown,
  Paperclip,
  Folder,
  Mail,
  MoreHorizontal,
  Briefcase,
  Rocket,
  Tag,
  ListChecks,
  HelpCircle,
  ArrowUpRight,
  Layers,
  CreditCard,
  Navigation,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Zap,
  Trash2,
  MoreVertical,
  Target,
  TrendingUp,
  Award,
  Heart,
  Sparkles,
  Flame,
  Coffee,
  Code,
  Lightbulb,
  Database,
  BookOpen,
  Aperture,
  Palette,
  Trophy,
  Medal,
  Flag,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Building2,
  Store,
  Warehouse,
  Factory,
  School,
  GraduationCap,
  Book,
  Library,
  Pencil,
  Pen,
  Feather,
  Mic,
  Music,
  Video,
  Image,
  Film,
  Radio,
  Headphones,
  Gamepad2,
  Gift,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Package,
  Plane,
  Car,
  Bike,
  Truck,
  Ship,
  Map,
  MapPin,
  Compass,
  Globe,
  Leaf,
  Trees as Tree,
  Flower2,
  Sprout,
  CloudRain,
  CloudSnow,
  Droplet,
  Waves,
  Wind,
  Umbrella,
  Bug,
  Bird,
  Cat,
  Dog,
  Fish,
  Hammer,
  Wrench,
  Scissors,
  Ruler,
  PaintBucket,
  Lock,
  Unlock,
  Key,
  Shield as ShieldIcon,
  ShieldCheck,
  Bookmark,
  Files,
  FolderOpen,
  Inbox,
  Download,
  Square,
  Triangle,
  Diamond,
  Gem,
  Box,
  Hexagon,
  Octagon,
  Crown,
  Terminal,
  Cpu,
  Server,
  HardDrive,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  Bluetooth,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as MonitorIcon,
  Keyboard,
  Mouse,
  Printer,
  Camera,
  GitBranch,
  GitCommit,
  Github,
  Gitlab,
  Figma,
  Dribbble,
  MessageSquare,
  MessageCircle,
  Send,
  Phone,
  Smile,
  Laugh,
  ThumbsUp,
  Share2,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Pizza,
  Cake,
  Wine,
  Beer,
  Utensils,
  Home,
  Dumbbell,
  HeartPulse,
  Stethoscope,
  Pill,
  Sun,
  Moon,
  Archive,
  Clock,
  UsersRound,
  Brain,
} from "lucide-react";
import { getPageIcon } from "@/app/(workspace)/components/sidebar/pageIcons";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/DropdownMenu";

// Mapeamento de ícones do workspace
const WORKSPACE_ICON_MAP: Record<string, any> = {
  'briefcase': Briefcase,
  'target': Target,
  'trophy': Trophy,
  'medal': Medal,
  'award': Award,
  'flag': Flag,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'bar-chart': BarChart,
  'pie-chart': PieChart,
  'line-chart': LineChart,
  'building': Building,
  'building2': Building2,
  'store': Store,
  'warehouse': Warehouse,
  'factory': Factory,
  'code': Code,
  'terminal': Terminal,
  'cpu': Cpu,
  'server': Server,
  'database': Database,
  'cloud': Cloud,
  'cloud-upload': CloudUpload,
  'cloud-download': CloudDownload,
  'hard-drive': HardDrive,
  'zap': Zap,
  'wifi': Wifi,
  'bluetooth': Bluetooth,
  'smartphone': Smartphone,
  'tablet': Tablet,
  'laptop': Laptop,
  'monitor': MonitorIcon,
  'keyboard': Keyboard,
  'mouse': Mouse,
  'printer': Printer,
  'git-branch': GitBranch,
  'git-commit': GitCommit,
  'github': Github,
  'gitlab': Gitlab,
  'palette': Palette,
  'aperture': Aperture,
  'layers': Layers,
  'camera': Camera,
  'video': Video,
  'film': Film,
  'image': Image,
  'music': Music,
  'mic': Mic,
  'headphones': Headphones,
  'radio': Radio,
  'feather': Feather,
  'pen': Pen,
  'pencil': Pencil,
  'paintbucket': PaintBucket,
  'figma': Figma,
  'dribbble': Dribbble,
  'book': BookOpen,
  'book-closed': Book,
  'library': Library,
  'graduation-cap': GraduationCap,
  'school': School,
  'lightbulb': Lightbulb,
  'brain': Brain,
  'heart': Heart,
  'star': Star,
  'sparkles': Sparkles,
  'users': Users,
  'user': Users,
  'users-round': UsersRound,
  'message-square': MessageSquare,
  'message-circle': MessageCircle,
  'mail': Mail,
  'send': Send,
  'phone': Phone,
  'smile': Smile,
  'laugh': Laugh,
  'thumbs-up': ThumbsUp,
  'share': Share2,
  'twitter': Twitter,
  'facebook': Facebook,
  'instagram': Instagram,
  'linkedin': Linkedin,
  'youtube': Youtube,
  'coffee': Coffee,
  'pizza': Pizza,
  'cake': Cake,
  'wine': Wine,
  'beer': Beer,
  'utensils': Utensils,
  'home': Home,
  'gamepad': Gamepad2,
  'gift': Gift,
  'dumbbell': Dumbbell,
  'heart-pulse': HeartPulse,
  'stethoscope': Stethoscope,
  'pill': Pill,
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  'credit-card': CreditCard,
  'dollar': DollarSign,
  'package': Package,
  'plane': Plane,
  'car': Car,
  'bike': Bike,
  'truck': Truck,
  'ship': Ship,
  'map': Map,
  'map-pin': MapPin,
  'compass': Compass,
  'globe': Globe,
  'leaf': Leaf,
  'tree': Tree,
  'flower': Flower2,
  'sprout': Sprout,
  'sun': Sun,
  'moon': Moon,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'droplet': Droplet,
  'waves': Waves,
  'wind': Wind,
  'umbrella': Umbrella,
  'bug': Bug,
  'bird': Bird,
  'cat': Cat,
  'dog': Dog,
  'fish': Fish,
  'hammer': Hammer,
  'wrench': Wrench,
  'scissors': Scissors,
  'ruler': Ruler,
  'lock': Lock,
  'unlock': Unlock,
  'key': Key,
  'shield': ShieldIcon,
  'bell': Bell,
  'clock': Clock,
  'calendar': CalendarIcon,
  'bookmark': Bookmark,
  'tag': Tag,
  'paperclip': Paperclip,
  'archive': Archive,
  'trash': Trash2,
  'file': FileText,
  'files': Files,
  'folder': Folder,
  'folder-open': FolderOpen,
  'inbox': Inbox,
  'download': Download,
  'circle': Circle,
  'square': Square,
  'triangle': Triangle,
  'diamond': Diamond,
  'gem': Gem,
  'box': Box,
  'hexagon': Hexagon,
  'octagon': Octagon,
  'rocket': Rocket,
  'flame': Flame,
  'crown': Crown,
};

type SidebarPage = {
  id: string;
  name: string;
  template?: string;
  favorite?: boolean;
};

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onAddGroup?: () => void;
  onAddPage?: (groupId: string) => void;
  onCreateWorkspace?: () => void;
}

function SidebarItem({
  icon,
  label,
  badge,
  active,
  collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  collapsed?: boolean;
}) {
  return (
    <button
      className={[
        "w-full flex items-center justify-between px-2 py-1.5 h-auto text-xs rounded-lg transition-colors",
        active
          ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
        collapsed ? "justify-center" : "",
      ].join(" ")}
      type="button"
    >
      <div className="flex items-center gap-2">
        {icon}
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && badge && (
        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge}
        </div>
      )}
    </button>
  );
}

function SidebarSection({
  title,
  children,
  collapsed,
}: {
  title: string;
  children: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <div className="mb-6">
      {!collapsed && (
        <div className="flex items-center gap-2 px-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{title}</span>
          <ChevronDown className="w-3 h-3" />
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SquarePageItem({
  page,
  groupId,
  pathname,
  onClose,
  onDeletePage,
  onToggleFavorite,
}: {
  page: SidebarPage;
  groupId: string;
  pathname: string;
  onClose: () => void;
  onDeletePage: (groupId: string, pageId: string) => Promise<void> | void;
  onToggleFavorite: (groupId: string, pageId: string) => Promise<void> | void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const iconCfg = getPageIcon(page.template || "blank");
  const Icon = iconCfg.icon;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(groupId, page.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(`excluir "${page.name}"?`);
    if (ok) {
      await onDeletePage(groupId, page.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Link
        href={`/workspace/group/${groupId}/page/${page.id}`}
        onClick={onClose}
        {...attributes}
        {...listeners}
        className={[
          "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm",
          pathname.includes(page.id)
            ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
        ].join(" ")}
      >
        <Icon className="w-4 h-4" />
        <span className="truncate flex-1">{page.name}</span>
        <div className="flex items-center gap-1 ml-1">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleFavorite}
            className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
            title={page.favorite ? "desfavoritar." : "favoritar."}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                page.favorite ? "fill-amber-400 text-amber-400" : "text-gray-400 dark:text-gray-500"
              }`}
            />
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleDelete}
            className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
            title="excluir página."
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </Link>
    </div>
  );
}

function DraggablePageRow({
  page,
  groupId,
  pathname,
  onClose,
  onDeletePage,
  onToggleFavorite,
}: {
  page: SidebarPage;
  groupId: string;
  pathname: string;
  onClose: () => void;
  onDeletePage: (groupId: string, pageId: string) => Promise<void> | void;
  onToggleFavorite: (groupId: string, pageId: string) => Promise<void> | void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  const iconCfg = getPageIcon(page.template || "blank");
  const Icon = iconCfg.icon;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Link
        href={`/workspace/group/${groupId}/page/${page.id}`}
        onClick={onClose}
        {...attributes}
        {...listeners}
        className={[
          "flex items-center justify-between px-2 py-1 rounded-md text-xs sm:text-sm",
          pathname.includes(page.id)
            ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
        ].join(" ")}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{page.name}</span>
        </div>
        <div className="flex items-center ml-1 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700"
                title="Mais opções"
              >
                <MoreVertical className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[9rem]">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(groupId, page.id);
                }}
                className="flex items-center gap-2 text-xs"
              >
                <Star
                  className={`w-3 h-3 ${
                    page.favorite ? "fill-amber-400 text-amber-400" : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                <span>{page.favorite ? "Desfavoritar" : "Favoritar"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const ok = window.confirm(`Excluir "${page.name}"?`);
                  if (ok) {
                    await onDeletePage(groupId, page.id);
                  }
                }}
                className="flex items-center gap-2 text-xs text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Link>
    </div>
  );
}

export default function SquareSidebar({
  sidebarOpen,
  sidebarCollapsed,
  onClose,
  onToggleCollapse,
  onAddGroup,
  onAddPage,
  onCreateWorkspace,
}: SidebarProps) {
  const pathname = usePathname();
  const {
    workspace,
    workspaces,
    switchWorkspace,
    getFavoritePages,
    toggleGroupExpanded,
    updateGroup,
    deletePage,
    togglePageFavorite,
  } = useWorkspaceStore();
  const favoritePages = getFavoritePages();
  const [favoritesExpanded, setFavoritesExpanded] = React.useState(true);
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();

  // OpÃ§Ãµes de Ã­cone e cor do grupo
  const iconOptions = [
    { key: 'folder', Icon: Folder, label: 'Pasta' },
    { key: 'briefcase', Icon: Briefcase, label: 'Projetos' },
    { key: 'rocket', Icon: Rocket, label: 'LanÃ§amentos' },
    { key: 'tag', Icon: Tag, label: 'Tags' },
    { key: 'list', Icon: ListChecks, label: 'Tarefas' },
    { key: 'users', Icon: Users, label: 'Equipe' },
    { key: 'calendar', Icon: CalendarIcon, label: 'Agenda' },
    { key: 'star', Icon: Star, label: 'Favoritos' },
  ];
  const colorOptions = ['#0ea5e9','#8b5cf6','#f59e0b','#10b981','#ef4444','#d946ef','#14b8a6','#64748b'];

  const getGroupIcon = (icon?: string) => {
    const found = iconOptions.find(o => o.key === icon);
    return found?.Icon || Folder;
  };

  // Editor flutuante do grupo
  const [editingGroupId, setEditingGroupId] = React.useState<string | null>(null);
  const [tempIcon, setTempIcon] = React.useState<string | undefined>(undefined);
  const [tempColor, setTempColor] = React.useState<string | undefined>(undefined);
  const editingGroup = workspace?.groups.find(g => g.id === editingGroupId);
  React.useEffect(() => {
    if (editingGroup) {
      setTempIcon(editingGroup.icon);
      setTempColor(editingGroup.color);
    }
  }, [editingGroupId]);

  // Fechar com ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditingGroupId(null);
    };
    if (editingGroupId) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editingGroupId]);
  const totalPages = workspace?.groups.reduce((sum, g) => sum + g.pages.length, 0) || 0;

  // Obter o ícone do workspace
  const WorkspaceIcon = workspace?.icon ? WORKSPACE_ICON_MAP[workspace.icon] || Briefcase : Briefcase;

  return (
    <aside
      className={[
        "fixed top-0 left-0 h-screen bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 flex-shrink-0 transition-all duration-300 overflow-visible flex flex-col z-40",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        sidebarCollapsed ? "md:w-20 w-64" : "w-64",
      ].join(" ")}
    >
      {/* Sidebar Header */}
      <div className={sidebarCollapsed ? "px-2 py-2" : "p-0"}>
        <div className="flex items-center justify-between px-3 pt-2 pb-2">
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 md:hidden"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Brand + workspace switcher */}
        <div className="px-4 pt-1 pb-2">
          <div className={["flex items-center gap-2", sidebarCollapsed ? "justify-center" : "justify-between"].join(" ") }>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-auto p-0 hover:opacity-70 transition-opacity min-w-0">
                  <div className="w-8 h-8 rounded-lg border-2 border-gray-900 dark:border-white bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 flex-shrink-0">
                    <WorkspaceIcon className="w-4 h-4" />
                  </div>
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-gray-900 dark:text-white truncate text-sm">
                        {workspace?.name || "workspace"}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">workspaces</DropdownMenuLabel>
                {workspaces.map(w => {
                  const WIcon = w.icon ? WORKSPACE_ICON_MAP[w.icon] || Briefcase : Briefcase;
                  return (
                    <DropdownMenuItem
                      key={w.id}
                      onClick={() => switchWorkspace(w.id)}
                      className={w.id === workspace?.id ? "bg-gray-100 dark:bg-slate-800" : ""}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                          w.id === workspace?.id
                          ? "border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                          : "border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                        }`}>
                          <WIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium flex-1">{w.name}</span>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                {workspace && (
                  <Link href="/workspace/settings" onClick={onClose}>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4" />
                      <span>configurações.</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <Link href="/workspace/create" onClick={onClose}>
                  <DropdownMenuItem>
                    <div className="w-7 h-7 rounded-lg border-2 border-gray-900 dark:border-white bg-gray-900 dark:bg-white flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white dark:text-gray-900" />
                    </div>
                    <span>criar workspace.</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            {!sidebarCollapsed && <ThemeToggle />}
          </div>

          {/* Quick stats */}
          {!sidebarCollapsed && workspace && (
            <div className="mt-3 text-xs text-arc-muted flex items-center gap-3">
              <span><strong>{workspace.groups.length}</strong> grupos.</span>
              <span className="w-px h-4 bg-arc-border inline-block" />
              <span><strong>{totalPages}</strong> páginas.</span>
            </div>
          )}

          {/* Search (sem suggestions por enquanto) */}
          {!sidebarCollapsed && (
            <div className="mt-4 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="search"
                placeholder="buscar"
                className="pl-8 pr-10 text-xs h-8 w-full rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-700"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded px-1 text-xs">/</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Top actions: Notifications, Dashboard, Settings */}
        <div className="space-y-1 mb-2">
          <Link
            href="/notifications"
            onClick={onClose}
            className={[
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname.startsWith("/notifications")
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "notificações." : ""}
          >
            <Bell className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">notificações.</span>}
            {!sidebarCollapsed && unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">{unreadCount}</span>
            )}
          </Link>

          <Link
            href="/workspace"
            onClick={onClose}
            className={[
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname === "/workspace"
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "início" : ""}
          >
            <LayoutGrid className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">início</span>}
          </Link>

          <Link
            href="/settings"
            onClick={onClose}
            className={[
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname.startsWith("/settings")
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "configurações." : ""}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">configurações.</span>}
          </Link>

          <Link
            href="/integrations"
            onClick={onClose}
            className={[
              "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              pathname.startsWith("/integrations")
                ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "integrações." : ""}
          >
            <Zap className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">integrações.</span>}
          </Link>
        </div>

        {/* Favoritos */}
        {favoritePages.length > 0 && (
          <div className={sidebarCollapsed ? "pt-2" : "pt-3"}>
            {!sidebarCollapsed && (
              <button
                onClick={() => setFavoritesExpanded((v) => !v)}
                className="flex items-center gap-2 px-2 py-1.5 mb-1 w-full text-left"
              >
                <Star className="w-4 h-4 text-gray-900 dark:text-gray-100 fill-current" />
                <span className="text-xs font-bold text-gray-900 dark:text-white">favoritos.</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800"></div>
                <ChevronDown className={["w-3 h-3 transition-transform", favoritesExpanded ? "rotate-0" : "-rotate-90"].join(" ")} />
              </button>
            )}
            {favoritesExpanded && (
              <div className="space-y-0.5">
                {favoritePages.map(({ group, page }) => (
                  <Link
                    key={page.id}
                    href={`/workspace/group/${group.id}/page/${page.id}`}
                    onClick={onClose}
                    className={[
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all duration-200",
                      pathname.includes(page.id)
                        ? "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50",
                      sidebarCollapsed ? "justify-center" : "",
                    ].join(" ")}
                    title={sidebarCollapsed ? page.name : ""}
                  >
                    {/* Removed unrelated icon; only page name */}
                    {!sidebarCollapsed && <span className="truncate flex-1 font-medium">{page.name}</span>}
                    {sidebarCollapsed && <span className="sr-only">{page.name}</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grupos */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-2 mb-1">
            {!sidebarCollapsed && (
              <span className="text-xs font-bold text-gray-900 dark:text-white">grupos.</span>
            )}
            <button
              onClick={() => onAddGroup && onAddGroup()}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              title="adicionar grupo."
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-0.5">
            {workspace?.groups.map((group) => (
              <div key={group.id} className="rounded-lg">
                <div
                  className={[
                    "w-full flex items-center justify-between px-2 py-2 h-auto text-sm rounded-lg transition-colors",
                    "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800/50",
                  ].join(" ")}
                >
                  <button
                    onClick={() => toggleGroupExpanded(group.id)}
                    className="flex items-center gap-2 min-w-0"
                    title={group.name}
                  >
                    <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0">
                      {React.createElement(getGroupIcon(group.icon), { className: 'w-4 h-4', style: { color: group.color || undefined } })}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="font-medium truncate max-w-[11rem]">{group.name}</span>
                    )}
                  </button>

                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-arc-muted">{group.pages.length}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" aria-label="OpÃ§Ãµes do grupo">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[12rem]">
                          <Link
                            href={`/workspace/group/${group.id}/manage`}
                            className="block px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-800 rounded"
                            onClick={onClose}
                          >
                            gerenciar grupo.
                          </Link>
                          <button
                            className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            onClick={async () => {
                              const ok = window.confirm('deseja excluir este grupo?');
                              if (ok) {
                                const fn = useWorkspaceStore.getState().deleteGroup;
                                if (fn) await fn(group.id);
                              }
                            }}
                          >
                            excluir grupo.
                          </button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                {group.expanded && (
                  <div className="ml-2 pl-2 border-l border-gray-200 dark:border-slate-800">
                    <SortableContext
                      items={group.pages.map((p) => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {group.pages.map((page) => (
                        <DraggablePageRow
                          key={page.id}
                          page={page as SidebarPage}
                          groupId={group.id}
                          pathname={pathname}
                          onClose={onClose}
                          onDeletePage={deletePage}
                          onToggleFavorite={togglePageFavorite}
                        />
                      ))}
                    </SortableContext>
                    <button
                      onClick={() => onAddPage && onAddPage(group.id)}
                      className="mt-1 mb-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" /> nova página.
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conta / SessÃ£o */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-800/10 dark:bg-white/10 flex items-center justify-center border border-arc overflow-hidden">
                {user?.icone ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.icone} alt="Perfil" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-[10px] font-semibold text-gray-400">
                    {`${user?.nome?.[0] ?? 'U'}${user?.sobrenome?.[0] ?? ''}`.toUpperCase()}
                  </span>
                )}
              </div>
            {!sidebarCollapsed && (
              <Link href="/profile" className="leading-tight hover:underline">
                <div className="text-sm font-medium text-arc">{user?.nome} {user?.sobrenome}</div>
                <div className="text-xs text-arc-muted">{user?.email}</div>
              </Link>
            )}
            </div>
            <button
              onClick={() => { logout(); location.href = '/login'; }}
              className="text-xs px-2 py-1 border border-arc rounded-md hover:bg-gray-50 dark:hover:bg-slate-800"
              title="Sair"
            >
              Sair
            </button>
          </div>
      </div>

      {/* Editor flutuante de Grupo (gloss overlay) */}
      {editingGroup && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setEditingGroupId(null)}
          />
          <div className="relative z-50 max-w-xl w-[92%] md:w-[560px] mx-auto mt-24 rounded-xl border border-arc bg-arc-secondary shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-arc">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shadow-sm ring-1 ring-arc bg-white/40 dark:bg-white/5">
                  {React.createElement(getGroupIcon(tempIcon), { className: 'w-4 h-4', style: { color: tempColor || undefined } })}
                </div>
                <span className="font-semibold text-arc truncate max-w-[18rem]">Editar grupo: {editingGroup.name}</span>
              </div>
              <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setEditingGroupId(null)} aria-label="Fechar">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3">
              <div className="text-xs text-arc-muted mb-2">Ãcone</div>
              <div className="grid grid-cols-10 gap-2 mb-4">
                {iconOptions.map(({ key, Icon }) => (
                  <button
                    key={key}
                    className={`flex items-center justify-center w-8 h-8 rounded-md border ${tempIcon===key? 'border-arc bg-arc-secondary' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                    onClick={() => setTempIcon(key)}
                    title={key}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              <div className="text-xs text-arc-muted mb-2">Cor do Ã­cone</div>
              <div className="grid grid-cols-10 gap-2 mb-4">
                {colorOptions.map((hex) => (
                  <button
                    key={hex}
                    className={`w-6 h-6 rounded-full border ${tempColor===hex? 'border-arc' : 'border-transparent'} hover:opacity-90`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setTempColor(hex)}
                    aria-label={`Cor ${hex}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-arc">
                <button
                  className="px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={async () => {
                    if (!editingGroup) return;
                    const ok = window.confirm('Tem certeza que deseja excluir este grupo? Todas as pÃ¡ginas dentro dele podem ser afetadas.');
                    if (ok) {
                      try {
                        const fn = useWorkspaceStore.getState().deleteGroup;
                        if (fn) await fn(editingGroup.id);
                      } catch {}
                      setEditingGroupId(null);
                    }
                  }}
                >
                  Excluir grupo
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md border border-arc hover:bg-gray-50 dark:hover:bg-slate-800"
                  onClick={() => setEditingGroupId(null)}
                >
                  Cancelar
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                  onClick={async () => {
                    await updateGroup(editingGroup.id, { icon: tempIcon, color: tempColor });
                    setEditingGroupId(null);
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
}
