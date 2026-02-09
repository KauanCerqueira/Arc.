"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWorkspaceStore } from "@/core/store/workspaceStore"
import { useAuthStore } from "@/core/store/authStore"
import { useTheme } from "@/core/context/ThemeContext"
import masterService from "@/core/services/master.service"
import workspaceInviteService from "@/core/services/workspace-invite.service"
import teamService from "@/core/services/team.service"
import type { WorkspaceInvite, WorkspaceRole } from "@/core/types/workspace.types"
import {
  Users,
  Settings,
  Trash2,
  Upload,
  Mail,
  Shield,
  Copy,
  Check,
  Crown,
  UserPlus,
  X,
  Database,
  Palette,
  Bell,
  Zap,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Save,
  Search,
  MoreVertical,
  Info,
  Eye,
  EyeOff,
  LogOut,
  Briefcase,
  Target,
  Rocket,
  Heart,
  Star,
  Sparkles,
  Flame,
  Coffee,
  Code,
  Lightbulb,
  TrendingUp,
  Award,
  BookOpen,
  Aperture,
  Activity,
  Key,
  Download,
  FileText,
  Tag,
  Globe,
  Clock,
  Archive,
  Link2,
  Layers,
  Calendar,
  Plus,
  Music,
  Video,
  Image,
  Mic,
  Camera,
  Film,
  Radio,
  Headphones,
  Gamepad2,
  Trophy,
  Medal,
  Flag,
  Gift,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  DollarSign,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  Package,
  Truck,
  Plane,
  Ship,
  Car,
  Bike,
  Map,
  MapPin,
  Compass,
  Home,
  Building,
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
  Edit,
  Feather,
  Type,
  AlignLeft,
  MessageSquare,
  MessageCircle,
  Send,
  Phone,
  PhoneCall,
  Smartphone,
  Tablet,
  Laptop,
  Monitor as MonitorIcon,
  Cpu,
  HardDrive,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  Bluetooth,
  Cast,
  Printer,
  Scan,
  Keyboard,
  Mouse,
  Hammer,
  Wrench,
  Scissors,
  Ruler,
  PaintBucket,
  Droplet,
  Waves,
  Wind,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Umbrella,
  Thermometer,
  Sunrise,
  Sunset,
  Leaf,
  Trees as Tree,
  Flower2,
  Sprout,
  Bug,
  Bird,
  Cat,
  Dog,
  Fish,
  Footprints,
  PawPrint,
  Pizza,
  Soup,
  Cookie,
  Cake,
  IceCream as IceCream2,
  Apple,
  Cherry,
  Grape,
  Salad,
  Sandwich,
  Utensils,
  UtensilsCrossed,
  Wine,
  Beer,
  Milk,
  Droplets,
  Dumbbell,
  Activity as Pulse,
  Stethoscope,
  Pill,
  Syringe,
  Bandage,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  User,
  UserCircle,
  UserCheck,
  UserX,
  UsersRound,
  Smile,
  Laugh,
  Frown,
  Meh,
  Heart as HeartIcon,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Lock,
  Unlock,
  Shield as ShieldIcon,
  ShieldCheck,
  AlertCircle,
  AlertOctagon,
  AlertTriangle as WarningIcon,
  Info as InfoIcon,
  HelpCircle,
  CheckCircle,
  XCircle,
  MinusCircle,
  PlusCircle,
  Circle,
  Square,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
  Gem,
  Box,
  Container,
  Repeat,
  RotateCw,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  StopCircle,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Filter,
  Sliders,
  Layout,
  Grid,
  List,
  Columns,
  Rows,
  Sidebar,
  PanelLeft,
  PanelRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  ArrowUpLeft,
  Move,
  Crosshair,
  Focus,
  Anchor,
  Navigation,
  Navigation2,
  Locate,
  LocateFixed,
  Pin,
  PinOff,
  Paperclip,
  FileQuestion,
  FilePlus,
  FileMinus,
  FileEdit,
  FolderOpen,
  Folder,
  FolderPlus,
  FolderMinus,
  Files,
  Inbox,
  MailOpen,
  MailPlus,
  Voicemail,
  AtSign,
  Hash,
  Percent,
  Slash,
  Asterisk,
  Equal,
  Binary,
  Braces,
  Brackets,
  Terminal,
  Command,
  Option,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Figma,
  Chrome,
  Codesandbox,
  Dribbble,
  Twitch,
  Twitter,
  Youtube,
  Linkedin,
  Facebook,
  Instagram,
  TrendingUp as ChartUp,
} from "lucide-react"

// ===== ICON LIBRARY =====
const WORKSPACE_ICONS = [
  // Business & Work
  { id: 'briefcase', icon: Briefcase, label: 'Maleta', category: 'business' },
  { id: 'target', icon: Target, label: 'Alvo', category: 'business' },
  { id: 'trophy', icon: Trophy, label: 'Troféu', category: 'business' },
  { id: 'medal', icon: Medal, label: 'Medalha', category: 'business' },
  { id: 'award', icon: Award, label: 'Prêmio', category: 'business' },
  { id: 'flag', icon: Flag, label: 'Bandeira', category: 'business' },
  { id: 'trending-up', icon: TrendingUp, label: 'Crescimento', category: 'business' },
  { id: 'trending-down', icon: TrendingDown, label: 'Queda', category: 'business' },
  { id: 'bar-chart', icon: BarChart, label: 'Gráfico Barras', category: 'business' },
  { id: 'pie-chart', icon: PieChart, label: 'Gráfico Pizza', category: 'business' },
  { id: 'line-chart', icon: LineChart, label: 'Gráfico Linha', category: 'business' },
  { id: 'building', icon: Building, label: 'Edifício', category: 'business' },
  { id: 'building2', icon: Building2, label: 'Escritório', category: 'business' },
  { id: 'store', icon: Store, label: 'Loja', category: 'business' },
  { id: 'warehouse', icon: Warehouse, label: 'Armazém', category: 'business' },
  { id: 'factory', icon: Factory, label: 'Fábrica', category: 'business' },

  // Technology & Dev
  { id: 'code', icon: Code, label: 'Código', category: 'tech' },
  { id: 'terminal', icon: Terminal, label: 'Terminal', category: 'tech' },
  { id: 'cpu', icon: Cpu, label: 'CPU', category: 'tech' },
  { id: 'server', icon: Server, label: 'Servidor', category: 'tech' },
  { id: 'database', icon: Database, label: 'Banco de Dados', category: 'tech' },
  { id: 'cloud', icon: Cloud, label: 'Nuvem', category: 'tech' },
  { id: 'cloud-upload', icon: CloudUpload, label: 'Upload', category: 'tech' },
  { id: 'cloud-download', icon: CloudDownload, label: 'Download', category: 'tech' },
  { id: 'hard-drive', icon: HardDrive, label: 'HD', category: 'tech' },
  { id: 'zap', icon: Zap, label: 'Raio', category: 'tech' },
  { id: 'wifi', icon: Wifi, label: 'WiFi', category: 'tech' },
  { id: 'bluetooth', icon: Bluetooth, label: 'Bluetooth', category: 'tech' },
  { id: 'smartphone', icon: Smartphone, label: 'Celular', category: 'tech' },
  { id: 'tablet', icon: Tablet, label: 'Tablet', category: 'tech' },
  { id: 'laptop', icon: Laptop, label: 'Laptop', category: 'tech' },
  { id: 'monitor', icon: MonitorIcon, label: 'Monitor', category: 'tech' },
  { id: 'keyboard', icon: Keyboard, label: 'Teclado', category: 'tech' },
  { id: 'mouse', icon: Mouse, label: 'Mouse', category: 'tech' },
  { id: 'printer', icon: Printer, label: 'Impressora', category: 'tech' },
  { id: 'git-branch', icon: GitBranch, label: 'Git Branch', category: 'tech' },
  { id: 'git-commit', icon: GitCommit, label: 'Git Commit', category: 'tech' },
  { id: 'github', icon: Github, label: 'GitHub', category: 'tech' },
  { id: 'gitlab', icon: Gitlab, label: 'GitLab', category: 'tech' },

  // Creative & Design
  { id: 'palette', icon: Palette, label: 'Paleta', category: 'creative' },
  { id: 'aperture', icon: Aperture, label: 'Abertura', category: 'creative' },
  { id: 'layers', icon: Layers, label: 'Camadas', category: 'creative' },
  { id: 'camera', icon: Camera, label: 'Câmera', category: 'creative' },
  { id: 'video', icon: Video, label: 'Vídeo', category: 'creative' },
  { id: 'film', icon: Film, label: 'Filme', category: 'creative' },
  { id: 'image', icon: Image, label: 'Imagem', category: 'creative' },
  { id: 'music', icon: Music, label: 'Música', category: 'creative' },
  { id: 'mic', icon: Mic, label: 'Microfone', category: 'creative' },
  { id: 'headphones', icon: Headphones, label: 'Fones', category: 'creative' },
  { id: 'radio', icon: Radio, label: 'Rádio', category: 'creative' },
  { id: 'feather', icon: Feather, label: 'Pena', category: 'creative' },
  { id: 'pen', icon: Pen, label: 'Caneta', category: 'creative' },
  { id: 'pencil', icon: Pencil, label: 'Lápis', category: 'creative' },
  { id: 'paintbucket', icon: PaintBucket, label: 'Balde Tinta', category: 'creative' },
  { id: 'figma', icon: Figma, label: 'Figma', category: 'creative' },
  { id: 'dribbble', icon: Dribbble, label: 'Dribbble', category: 'creative' },

  // Education & Learning
  { id: 'book', icon: BookOpen, label: 'Livro', category: 'education' },
  { id: 'book-closed', icon: Book, label: 'Livro Fechado', category: 'education' },
  { id: 'library', icon: Library, label: 'Biblioteca', category: 'education' },
  { id: 'graduation-cap', icon: GraduationCap, label: 'Formatura', category: 'education' },
  { id: 'school', icon: School, label: 'Escola', category: 'education' },
  { id: 'lightbulb', icon: Lightbulb, label: 'Lâmpada', category: 'education' },
  { id: 'brain', icon: Brain, label: 'Cérebro', category: 'education' },

  // Social & Communication
  { id: 'heart', icon: Heart, label: 'Coração', category: 'social' },
  { id: 'star', icon: Star, label: 'Estrela', category: 'social' },
  { id: 'sparkles', icon: Sparkles, label: 'Brilho', category: 'social' },
  { id: 'users', icon: Users, label: 'Usuários', category: 'social' },
  { id: 'user', icon: User, label: 'Usuário', category: 'social' },
  { id: 'users-round', icon: UsersRound, label: 'Grupo', category: 'social' },
  { id: 'message-square', icon: MessageSquare, label: 'Mensagem', category: 'social' },
  { id: 'message-circle', icon: MessageCircle, label: 'Chat', category: 'social' },
  { id: 'mail', icon: Mail, label: 'Email', category: 'social' },
  { id: 'send', icon: Send, label: 'Enviar', category: 'social' },
  { id: 'phone', icon: Phone, label: 'Telefone', category: 'social' },
  { id: 'smile', icon: Smile, label: 'Sorriso', category: 'social' },
  { id: 'laugh', icon: Laugh, label: 'Risada', category: 'social' },
  { id: 'thumbs-up', icon: ThumbsUp, label: 'Curtir', category: 'social' },
  { id: 'share', icon: Share2, label: 'Compartilhar', category: 'social' },
  { id: 'twitter', icon: Twitter, label: 'Twitter', category: 'social' },
  { id: 'facebook', icon: Facebook, label: 'Facebook', category: 'social' },
  { id: 'instagram', icon: Instagram, label: 'Instagram', category: 'social' },
  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', category: 'social' },
  { id: 'youtube', icon: Youtube, label: 'YouTube', category: 'social' },

  // Lifestyle & Personal
  { id: 'coffee', icon: Coffee, label: 'Café', category: 'lifestyle' },
  { id: 'pizza', icon: Pizza, label: 'Pizza', category: 'lifestyle' },
  { id: 'cake', icon: Cake, label: 'Bolo', category: 'lifestyle' },
  { id: 'wine', icon: Wine, label: 'Vinho', category: 'lifestyle' },
  { id: 'beer', icon: Beer, label: 'Cerveja', category: 'lifestyle' },
  { id: 'utensils', icon: Utensils, label: 'Talheres', category: 'lifestyle' },
  { id: 'home', icon: Home, label: 'Casa', category: 'lifestyle' },
  { id: 'gamepad', icon: Gamepad2, label: 'Jogo', category: 'lifestyle' },
  { id: 'gift', icon: Gift, label: 'Presente', category: 'lifestyle' },
  { id: 'dumbbell', icon: Dumbbell, label: 'Fitness', category: 'lifestyle' },
  { id: 'heart-pulse', icon: HeartPulse, label: 'Saúde', category: 'lifestyle' },
  { id: 'stethoscope', icon: Stethoscope, label: 'Médico', category: 'lifestyle' },
  { id: 'pill', icon: Pill, label: 'Remédio', category: 'lifestyle' },

  // Shopping & Finance
  { id: 'shopping-cart', icon: ShoppingCart, label: 'Carrinho', category: 'finance' },
  { id: 'shopping-bag', icon: ShoppingBag, label: 'Sacola', category: 'finance' },
  { id: 'credit-card', icon: CreditCard, label: 'Cartão', category: 'finance' },
  { id: 'dollar', icon: DollarSign, label: 'Dólar', category: 'finance' },
  { id: 'package', icon: Package, label: 'Pacote', category: 'finance' },

  // Travel & Transport
  { id: 'plane', icon: Plane, label: 'Avião', category: 'travel' },
  { id: 'car', icon: Car, label: 'Carro', category: 'travel' },
  { id: 'bike', icon: Bike, label: 'Bicicleta', category: 'travel' },
  { id: 'truck', icon: Truck, label: 'Caminhão', category: 'travel' },
  { id: 'ship', icon: Ship, label: 'Navio', category: 'travel' },
  { id: 'map', icon: Map, label: 'Mapa', category: 'travel' },
  { id: 'map-pin', icon: MapPin, label: 'Localização', category: 'travel' },
  { id: 'compass', icon: Compass, label: 'Bússola', category: 'travel' },
  { id: 'globe', icon: Globe, label: 'Globo', category: 'travel' },

  // Nature & Weather
  { id: 'leaf', icon: Leaf, label: 'Folha', category: 'nature' },
  { id: 'tree', icon: Tree, label: 'Árvore', category: 'nature' },
  { id: 'flower', icon: Flower2, label: 'Flor', category: 'nature' },
  { id: 'sprout', icon: Sprout, label: 'Broto', category: 'nature' },
  { id: 'sun', icon: Sun, label: 'Sol', category: 'nature' },
  { id: 'moon', icon: Moon, label: 'Lua', category: 'nature' },
  { id: 'cloud-rain', icon: CloudRain, label: 'Chuva', category: 'nature' },
  { id: 'cloud-snow', icon: CloudSnow, label: 'Neve', category: 'nature' },
  { id: 'droplet', icon: Droplet, label: 'Gota', category: 'nature' },
  { id: 'waves', icon: Waves, label: 'Ondas', category: 'nature' },
  { id: 'wind', icon: Wind, label: 'Vento', category: 'nature' },
  { id: 'umbrella', icon: Umbrella, label: 'Guarda-chuva', category: 'nature' },
  { id: 'bug', icon: Bug, label: 'Inseto', category: 'nature' },
  { id: 'bird', icon: Bird, label: 'Pássaro', category: 'nature' },
  { id: 'cat', icon: Cat, label: 'Gato', category: 'nature' },
  { id: 'dog', icon: Dog, label: 'Cachorro', category: 'nature' },
  { id: 'fish', icon: Fish, label: 'Peixe', category: 'nature' },

  // Objects & Tools
  { id: 'hammer', icon: Hammer, label: 'Martelo', category: 'tools' },
  { id: 'wrench', icon: Wrench, label: 'Chave', category: 'tools' },
  { id: 'scissors', icon: Scissors, label: 'Tesoura', category: 'tools' },
  { id: 'ruler', icon: Ruler, label: 'Régua', category: 'tools' },
  { id: 'lock', icon: Lock, label: 'Cadeado', category: 'tools' },
  { id: 'unlock', icon: Unlock, label: 'Desbloqueado', category: 'tools' },
  { id: 'key', icon: Key, label: 'Chave', category: 'tools' },
  { id: 'shield', icon: ShieldIcon, label: 'Escudo', category: 'tools' },
  { id: 'bell', icon: Bell, label: 'Sino', category: 'tools' },
  { id: 'clock', icon: Clock, label: 'Relógio', category: 'tools' },
  { id: 'calendar', icon: Calendar, label: 'Calendário', category: 'tools' },
  { id: 'bookmark', icon: Bookmark, label: 'Marcador', category: 'tools' },
  { id: 'tag', icon: Tag, label: 'Tag', category: 'tools' },
  { id: 'paperclip', icon: Paperclip, label: 'Clipe', category: 'tools' },
  { id: 'archive', icon: Archive, label: 'Arquivo', category: 'tools' },
  { id: 'trash', icon: Trash2, label: 'Lixeira', category: 'tools' },

  // Files & Folders
  { id: 'file', icon: FileText, label: 'Arquivo', category: 'files' },
  { id: 'files', icon: Files, label: 'Arquivos', category: 'files' },
  { id: 'folder', icon: Folder, label: 'Pasta', category: 'files' },
  { id: 'folder-open', icon: FolderOpen, label: 'Pasta Aberta', category: 'files' },
  { id: 'inbox', icon: Inbox, label: 'Caixa Entrada', category: 'files' },
  { id: 'download', icon: Download, label: 'Download', category: 'files' },

  // Shapes & Symbols
  { id: 'circle', icon: Circle, label: 'Círculo', category: 'shapes' },
  { id: 'square', icon: Square, label: 'Quadrado', category: 'shapes' },
  { id: 'triangle', icon: Triangle, label: 'Triângulo', category: 'shapes' },
  { id: 'diamond', icon: Diamond, label: 'Diamante', category: 'shapes' },
  { id: 'gem', icon: Gem, label: 'Gema', category: 'shapes' },
  { id: 'box', icon: Box, label: 'Caixa', category: 'shapes' },
  { id: 'hexagon', icon: Hexagon, label: 'Hexágono', category: 'shapes' },
  { id: 'octagon', icon: Octagon, label: 'Octógono', category: 'shapes' },

  // Popular & Featured
  { id: 'rocket', icon: Rocket, label: 'Foguete', category: 'popular' },
  { id: 'flame', icon: Flame, label: 'Fogo', category: 'popular' },
  { id: 'crown', icon: Crown, label: 'Coroa', category: 'popular' },
]

const ICON_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'popular', label: '⭐ Popular' },
  { id: 'business', label: '💼 Negócios' },
  { id: 'tech', label: '💻 Tecnologia' },
  { id: 'creative', label: '🎨 Criativo' },
  { id: 'education', label: '📚 Educação' },
  { id: 'social', label: '👥 Social' },
  { id: 'lifestyle', label: '☕ Lifestyle' },
  { id: 'finance', label: '💰 Finanças' },
  { id: 'travel', label: '✈️ Viagem' },
  { id: 'nature', label: '🌿 Natureza' },
  { id: 'tools', label: '🔧 Ferramentas' },
  { id: 'files', label: '📁 Arquivos' },
  { id: 'shapes', label: '⬛ Formas' },
]

interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: "owner" | "admin" | "member" | "guest"
  avatar?: string
  joinedAt: Date
}

interface PermissionSettings {
  membersCanCreateGroups: boolean
  membersCanInvite: boolean
  isPublic: boolean
  guestsCanComment: boolean
  membersCanDelete: boolean
  requireApproval: boolean
}

interface MasterUser {
  userId: string
  nome: string
  sobrenome: string
  email: string
  ativo: boolean
  isMaster: boolean
}

interface ActivityLog {
  id: string
  type: 'member_added' | 'page_created' | 'settings_changed' | 'group_created'
  description: string
  timestamp: Date
  user: string
}

type SettingsSection =
  | "general"
  | "members"
  | "permissions"
  | "danger"
  | "master"
  | "activity"
  | "integrations"
  | "advanced"

export default function WorkspaceSettingsPage() {
  const router = useRouter()
  const { workspace, updateWorkspace, deleteWorkspace, initializeWorkspace } = useWorkspaceStore()
  const { user } = useAuthStore()

  const [activeSection, setActiveSection] = useState<SettingsSection>("general")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Ensure workspace is loaded
  useEffect(() => {
    if (!workspace) {
      initializeWorkspace()
    }
  }, [workspace, initializeWorkspace])

  // General Settings
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || "")
  const [workspaceDescription, setWorkspaceDescription] = useState("")
  const [workspaceIcon, setWorkspaceIcon] = useState<string>("briefcase")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [iconCategory, setIconCategory] = useState<string>('all')
  const [iconSearchQuery, setIconSearchQuery] = useState('')

  // Members
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "guest">("member")
  const [showInviteSuccess, setShowInviteSuccess] = useState(false)

  // Permissions
  const [permissions, setPermissions] = useState<PermissionSettings>({
    membersCanCreateGroups: true,
    membersCanInvite: true,
    isPublic: false,
    guestsCanComment: true,
    membersCanDelete: false,
    requireApproval: false
  })
  const [permissionsSaved, setPermissionsSaved] = useState(false)

  // Activity
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: '1', type: 'member_added', description: 'Você entrou no workspace', timestamp: new Date(), user: user?.nome || 'Você' },
    { id: '2', type: 'settings_changed', description: 'Workspace criado', timestamp: new Date(Date.now() - 86400000), user: user?.nome || 'Você' },
  ])

  // Master Settings
  const [masterUsers, setMasterUsers] = useState<MasterUser[]>([])
  const [loadingMasterUsers, setLoadingMasterUsers] = useState(false)
  const [seedingData, setSeedingData] = useState(false)

  // API Keys
  const [apiKeys, setApiKeys] = useState<Array<{ id: string, name: string, key: string, created: Date }>>([])
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")

  // Invite Links
  const [inviteLinks, setInviteLinks] = useState<WorkspaceInvite[]>([])
  const [showNewLinkModal, setShowNewLinkModal] = useState(false)
  const [newLinkRole, setNewLinkRole] = useState<WorkspaceRole>("member")
  const [newLinkExpireDays, setNewLinkExpireDays] = useState<number | undefined>(7)
  const [newLinkMaxUses, setNewLinkMaxUses] = useState<number | undefined>(undefined)
  const [creatingLink, setCreatingLink] = useState(false)
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name)
      setWorkspaceIcon(workspace.icon || "briefcase")
    }
  }, [workspace])

  // Load team members and invite links when members section is active
  useEffect(() => {
    if (workspace && activeSection === "members") {
      loadTeamMembers()
      loadInviteLinks()
    }
  }, [workspace, activeSection])

  const loadTeamMembers = async () => {
    if (!workspace) return
    setLoadingMembers(true)
    try {
      const teamData = await teamService.getTeam(workspace.id)

      // Convert backend members to frontend format
      const convertedMembers: WorkspaceMember[] = teamData.members.map(member => {
        // Map TeamRole enum to string
        let role: "owner" | "admin" | "member" | "guest" = "member"
        if (member.role === 0) role = "owner"  // TeamRole.Owner
        else if (member.role === 1) role = "admin"  // TeamRole.Admin
        else if (member.role === 2) role = "member" // TeamRole.Member

        return {
          id: member.id,
          name: member.userName,
          email: member.userEmail,
          role: role,
          avatar: member.userIcon || undefined,
          joinedAt: new Date(member.joinedAt)
        }
      })

      setMembers(convertedMembers)
    } catch (error) {
      console.error("Error loading team members:", error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const loadInviteLinks = async () => {
    if (!workspace) return
    try {
      const links = await workspaceInviteService.listInvites(workspace.id)
      setInviteLinks(links)
    } catch (error) {
      console.error("Error loading invite links:", error)
    }
  }

  // Load master users if user is master
  useEffect(() => {
    if (user?.isMaster && activeSection === "master") {
      loadMasterUsers()
    }
  }, [user, activeSection])

  const loadMasterUsers = async () => {
    setLoadingMasterUsers(true)
    try {
      const users = await masterService.getAllUsers()
      setMasterUsers(users)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoadingMasterUsers(false)
    }
  }

  const handleSaveGeneral = async () => {
    if (workspace && workspaceName.trim()) {
      try {
        await updateWorkspace(workspace.id, {
          name: workspaceName,
          description: workspaceDescription,
          icon: workspaceIcon
        })
        setSaveSuccess(true)
        setHasUnsavedChanges(false)
        setTimeout(() => setSaveSuccess(false), 3000)

        // Add to activity log
        const newLog: ActivityLog = {
          id: Date.now().toString(),
          type: 'settings_changed',
          description: 'Configurações gerais atualizadas',
          timestamp: new Date(),
          user: user?.nome || 'Você'
        }
        setActivityLogs(prev => [newLog, ...prev])
      } catch (error) {
        alert("Erro ao salvar configurações")
      }
    }
  }

  const handleSelectIcon = (iconId: string) => {
    setWorkspaceIcon(iconId)
    setShowIconPicker(false)
    setHasUnsavedChanges(true)
  }

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      alert("Por favor, insira um email válido")
      return
    }

    if (members.some(m => m.email === inviteEmail)) {
      alert("Este email já foi convidado")
      return
    }

    const newMember: WorkspaceMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date()
    }

    setMembers([...members, newMember])
    setInviteEmail("")
    setShowInviteSuccess(true)
    setTimeout(() => setShowInviteSuccess(false), 3000)

    // Add to activity log
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      type: 'member_added',
      description: `${inviteEmail} foi convidado como ${inviteRole}`,
      timestamp: new Date(),
      user: user?.nome || 'Você'
    }
    setActivityLogs(prev => [newLog, ...prev])
  }

  const handleRemoveMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (!member) return

    if (confirm(`Tem certeza que deseja remover ${member.name} do workspace?`)) {
      setMembers(members.filter(m => m.id !== memberId))

      // Add to activity log
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        type: 'settings_changed',
        description: `${member.name} foi removido do workspace`,
        timestamp: new Date(),
        user: user?.nome || 'Você'
      }
      setActivityLogs(prev => [newLog, ...prev])
    }
  }

  const handleChangeRole = (memberId: string, newRole: "admin" | "member" | "guest") => {
    setMembers(members.map(m =>
      m.id === memberId ? { ...m, role: newRole } : m
    ))
  }

  const handleCreateInviteLink = async () => {
    if (!workspace) return
    setCreatingLink(true)
    try {
      const response = await workspaceInviteService.createInvite({
        workspaceId: workspace.id,
        role: newLinkRole,
        expiresInDays: newLinkExpireDays,
        maxUses: newLinkMaxUses,
      })
      setInviteLinks([...inviteLinks, response.invite])
      setShowNewLinkModal(false)
      // Reset form
      setNewLinkRole("member")
      setNewLinkExpireDays(7)
      setNewLinkMaxUses(undefined)
    } catch (error) {
      console.error("Error creating invite link:", error)
      alert("Erro ao criar link de convite")
    } finally {
      setCreatingLink(false)
    }
  }

  const handleRevokeInviteLink = async (linkId: string) => {
    if (!workspace) return
    if (!confirm("Tem certeza que deseja revogar este convite?")) return
    try {
      await workspaceInviteService.revokeInvite(workspace.id, linkId)
      setInviteLinks(inviteLinks.filter(link => link.id !== linkId))
    } catch (error) {
      console.error("Error revoking invite link:", error)
      alert("Erro ao revogar convite")
    }
  }

  const copyInviteLink = (token: string, linkId: string) => {
    const url = workspaceInviteService.generateInviteUrl(token)
    navigator.clipboard.writeText(url)
    setCopiedLinkId(linkId)
    setTimeout(() => setCopiedLinkId(null), 2000)
  }

  const togglePermission = (key: keyof PermissionSettings) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSavePermissions = () => {
    console.log("Salvando permissões:", permissions)
    setPermissionsSaved(true)
    setTimeout(() => setPermissionsSaved(false), 3000)

    // Add to activity log
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      type: 'settings_changed',
      description: 'Permissões atualizadas',
      timestamp: new Date(),
      user: user?.nome || 'Você'
    }
    setActivityLogs(prev => [newLog, ...prev])
  }

  const handleDeleteWorkspace = async () => {
    if (!workspace) return

    const confirmation = prompt(
      `Para confirmar a exclusão, digite o nome do workspace: "${workspace.name}"`
    )

    if (confirmation === workspace.name) {
      try {
        await deleteWorkspace(workspace.id)
        router.push("/workspace")
      } catch (error) {
        alert("Erro ao excluir workspace")
      }
    } else if (confirmation !== null) {
      alert("Nome incorreto. Workspace não foi excluído.")
    }
  }

  const handleGenerateAPIKey = () => {
    if (!newKeyName.trim()) {
      alert("Digite um nome para a chave")
      return
    }

    const newKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `arc_${Math.random().toString(36).substr(2, 32)}`,
      created: new Date()
    }

    setApiKeys(prev => [...prev, newKey])
    setNewKeyName("")
    setShowNewKeyModal(false)

    // Add to activity log
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      type: 'settings_changed',
      description: `Chave API "${newKeyName}" criada`,
      timestamp: new Date(),
      user: user?.nome || 'Você'
    }
    setActivityLogs(prev => [newLog, ...prev])
  }

  const handleDeleteAPIKey = (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId)
    if (key && confirm(`Excluir a chave "${key.name}"?`)) {
      setApiKeys(prev => prev.filter(k => k.id !== keyId))
    }
  }

  // Master functions
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await masterService.toggleUserStatus(userId, !currentStatus)
      await loadMasterUsers()
    } catch (error) {
      alert("Erro ao alterar status do usuário")
    }
  }

  const handleToggleUserMaster = async (userId: string, currentMaster: boolean) => {
    try {
      await masterService.toggleUserMaster(userId, !currentMaster)
      await loadMasterUsers()
    } catch (error) {
      alert("Erro ao alterar permissões master")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      try {
        await masterService.deleteUser(userId)
        await loadMasterUsers()
      } catch (error) {
        alert("Erro ao excluir usuário")
      }
    }
  }

  const handleSeedMvpData = async () => {
    if (!confirm("Tem certeza que deseja popular o banco de dados com dados de exemplo?")) {
      return
    }

    setSeedingData(true)
    try {
      const result = await masterService.seedMvpDec()
      alert(`Dados criados com sucesso!\n\nWorkspace: ${result.workspaceId}\nGrupo: ${result.groupId}`)
      await initializeWorkspace()
    } catch (error) {
      alert("Erro ao criar dados de exemplo")
    } finally {
      setSeedingData(false)
    }
  }

  if (!workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700 opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-gray-900 dark:border-white border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">carregando workspace</p>
        </div>
      </div>
    )
  }

  const roleColors = {
    owner: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600",
    admin: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600",
    member: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600",
    guest: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
  }

  const roleLabels = {
    owner: "Proprietário",
    admin: "Administrador",
    member: "Membro",
    guest: "Convidado"
  }

  const tabs = [
    { id: "general", label: "Geral", icon: Settings },
    { id: "members", label: "Membros", icon: Users, badge: members.length },
    { id: "permissions", label: "Permissões", icon: Shield },
    { id: "danger", label: "Perigo", icon: AlertTriangle },
    ...(user?.isMaster ? [{ id: "master", label: "Master", icon: Crown }] : [])
  ]

  const selectedIcon = WORKSPACE_ICONS.find(i => i.id === workspaceIcon)
  const SelectedIconComponent = selectedIcon?.icon || Briefcase

  const filteredIcons = WORKSPACE_ICONS.filter(icon => {
    // Filter by category
    const matchesCategory = iconCategory === 'all' || icon.category === iconCategory

    // Filter by search query
    const matchesSearch = !iconSearchQuery ||
      icon.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      icon.id.toLowerCase().includes(iconSearchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8 lg:py-12">

        {/* HERO SECTION */}
        <div className="mb-12 lg:mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full">
                workspace
              </span>
              {user?.isMaster && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-900 dark:text-white bg-gray-200 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-full">
                  <Crown className="w-3 h-3" strokeWidth={2.5} />
                  master
                </span>
              )}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-gray-900 dark:text-white mb-6">
              Configurações do<br />workspace.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
              Gerencie membros, permissões, integrações e muito mais em um só lugar.
            </p>
          </div>

          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold">{workspace.name}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
              <Users className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{members.length} {members.length === 1 ? 'membro' : 'membros'}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-slate-800 rounded-full">
              <Database className="w-3.5 h-3.5 text-gray-900 dark:text-white" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{workspace.groups.length} grupos</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b-2 border-gray-200 dark:border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeSection === tab.id

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as SettingsSection)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-t-lg font-bold text-sm whitespace-nowrap transition-all duration-200 border-b-2
                    ${isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent hover:bg-gray-100 dark:hover:bg-slate-900'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 dark:bg-black/20' : 'bg-gray-200 dark:bg-slate-800'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="pb-12">
          {/* GENERAL SECTION */}
          {activeSection === "general" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Workspace Icon & Name */}
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b-2 border-gray-200 dark:border-slate-800">
                  <button
                    onClick={() => setShowIconPicker(true)}
                    className="w-24 h-24 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center border-2 border-gray-200 dark:border-slate-800 hover:scale-110 transition-transform cursor-pointer group"
                  >
                    <SelectedIconComponent className="w-12 h-12 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  </button>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                      {workspaceName || 'Meu Workspace'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {workspace.groups.length} grupos • {workspace.groups.reduce((sum, g) => sum + g.pages.length, 0)} páginas
                    </p>
                    <button
                      onClick={() => setShowIconPicker(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-slate-900 transition-all text-sm"
                    >
                      <Palette className="w-4 h-4" strokeWidth={2.5} />
                      Alterar Ícone
                    </button>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSaveGeneral(); }} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Nome do Workspace</label>
                      <input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => {
                          setWorkspaceName(e.target.value)
                          setHasUnsavedChanges(true)
                        }}
                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                        placeholder="Meu Workspace Incrível"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Descrição</label>
                      <textarea
                        value={workspaceDescription}
                        onChange={(e) => {
                          setWorkspaceDescription(e.target.value)
                          setHasUnsavedChanges(true)
                        }}
                        className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none resize-none"
                        rows={4}
                        placeholder="Descreva o propósito deste workspace..."
                      />
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Configurações salvas com sucesso!</span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={!workspaceName.trim() || !hasUnsavedChanges}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" strokeWidth={2.5} />
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: "Grupos", value: workspace.groups.length, icon: Database },
                  { label: "Páginas", value: workspace.groups.reduce((sum, g) => sum + g.pages.length, 0), icon: FileText },
                  { label: "Membros", value: members.length, icon: Users }
                ].map((stat, index) => {
                  const Icon = stat.icon

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 hover:scale-105 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white dark:text-gray-900" strokeWidth={2.5} />
                        </div>
                      </div>
                      <div className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{stat.label}</div>
                      <div className="text-4xl font-extrabold text-gray-900 dark:text-white">{stat.value}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* MEMBERS SECTION */}
          {activeSection === "members" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Invite Card */}
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <UserPlus className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Convidar Membros</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adicione pessoas ao workspace</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleInviteMember()}
                      className="px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                      placeholder="email@exemplo.com"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-bold focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                    >
                      <option value="member">Membro</option>
                      <option value="admin">Administrador</option>
                      <option value="guest">Convidado</option>
                    </select>
                    <button
                      onClick={handleInviteMember}
                      disabled={!inviteEmail.trim()}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <UserPlus className="w-5 h-5" strokeWidth={2.5} />
                      Convidar
                    </button>
                  </div>

                  {showInviteSuccess && (
                    <div className="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-xl animate-in fade-in slide-in-from-top-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Convite enviado com sucesso!</span>
                    </div>
                  )}

                  {/* Invite Links */}
                  <div className="pt-6 border-t-2 border-gray-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Link2 className="w-5 h-5 text-gray-500 dark:text-gray-400" strokeWidth={2.5} />
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Links de Convite</p>
                      </div>
                      <button
                        onClick={() => setShowNewLinkModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold hover:opacity-90 transition-all"
                      >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Gerar Link
                      </button>
                    </div>

                    {inviteLinks.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">Nenhum link de convite ativo</p>
                        <p className="text-xs mt-1">Clique em "Gerar Link" para criar um</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inviteLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                  link.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                  link.role === 'member' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                                }`}>
                                  {link.role}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Usado {link.currentUses} {link.maxUses ? `/ ${link.maxUses}` : ''} vezes
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {link.expiresAt && (
                                  <span>Expira em {new Date(link.expiresAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => copyInviteLink(link.token, link.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-slate-900 transition-all text-sm"
                            >
                              {copiedLinkId === link.id ? (
                                <>
                                  <Check className="w-4 h-4" strokeWidth={2.5} />
                                  Copiado
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" strokeWidth={2.5} />
                                  Copiar
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRevokeInviteLink(link.id)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
                              title="Revogar convite"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center justify-between mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                      <Users className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Membros Ativos</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{members.length} {members.length === 1 ? 'pessoa' : 'pessoas'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="group flex items-center justify-between p-6 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm flex-shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 dark:text-white truncate">{member.name}</span>
                            {member.role === "owner" && (
                              <Crown className="w-4 h-4 text-gray-900 dark:text-white flex-shrink-0" strokeWidth={2.5} />
                            )}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 truncate block">{member.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        {member.role !== "owner" ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border-2 cursor-pointer transition-all ${roleColors[member.role]}`}
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Membro</option>
                            <option value="guest">Convidado</option>
                          </select>
                        ) : (
                          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border-2 ${roleColors[member.role]}`}>
                            {roleLabels[member.role]}
                          </span>
                        )}

                        {member.role !== "owner" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
                            title="Remover membro"
                          >
                            <X className="w-5 h-5" strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PERMISSIONS SECTION */}
          {activeSection === "permissions" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Shield className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Controles de Acesso</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure permissões</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries({
                    membersCanCreateGroups: {
                      label: "Permitir membros criarem grupos",
                      description: "Membros podem criar novos grupos no workspace",
                      icon: Database
                    },
                    membersCanInvite: {
                      label: "Permitir membros convidarem outros",
                      description: "Membros podem enviar convites",
                      icon: UserPlus
                    },
                    isPublic: {
                      label: "Workspace público",
                      description: "Qualquer pessoa com o link pode visualizar",
                      icon: Globe
                    },
                    guestsCanComment: {
                      label: "Convidados podem comentar",
                      description: "Convidados têm permissão para comentar",
                      icon: Mail
                    },
                    membersCanDelete: {
                      label: "Membros podem deletar páginas",
                      description: "Permite que membros excluam páginas",
                      icon: Trash2
                    },
                    requireApproval: {
                      label: "Requer aprovação para novos membros",
                      description: "Convites precisam ser aprovados",
                      icon: Shield
                    }
                  }).map(([key, config]) => {
                    const Icon = config.icon
                    const isEnabled = permissions[key as keyof PermissionSettings]

                    return (
                      <button
                        key={key}
                        onClick={() => togglePermission(key as keyof PermissionSettings)}
                        className="w-full flex items-center gap-4 p-6 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white dark:text-gray-900" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white text-base mb-1">{config.label}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{config.description}</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={isEnabled} onChange={() => {}} className="sr-only peer" />
                          <div className="w-14 h-8 bg-gray-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-700 after:border-2 after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-gray-900 dark:peer-checked:bg-white"></div>
                        </label>
                      </button>
                    )
                  })}
                </div>

                {permissionsSaved && (
                  <div className="flex items-center gap-3 px-5 py-4 bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-xl mt-6 animate-in fade-in slide-in-from-top-2">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={2.5} />
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">Permissões salvas com sucesso!</span>
                  </div>
                )}

                <div className="pt-8 mt-8 border-t-2 border-gray-200 dark:border-slate-800">
                  <button
                    onClick={handleSavePermissions}
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all"
                  >
                    <Save className="w-5 h-5" strokeWidth={2.5} />
                    Salvar Permissões
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVITY SECTION */}
          {activeSection === "activity" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Activity className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Histórico de Atividades</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acompanhe mudanças recentes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {activityLogs.map((log) => {
                    const icons = {
                      member_added: UserPlus,
                      page_created: FileText,
                      settings_changed: Settings,
                      group_created: Database
                    }
                    const Icon = icons[log.type]

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-6 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white mb-1">{log.description}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {log.user} • {log.timestamp.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {activityLogs.length === 0 && (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                      <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                      <p className="text-xl font-bold">Nenhuma atividade recente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* INTEGRATIONS SECTION */}
          {activeSection === "integrations" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-16 text-center">
                <div className="w-24 h-24 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Zap className="w-12 h-12 text-white dark:text-gray-900" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Integrações</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
                  Conecte suas ferramentas favoritas. Em breve você poderá integrar com GitHub, Slack, Google Drive e muito mais.
                </p>
                <div className="inline-flex px-6 py-3 bg-gray-100 dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-full">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Em Breve</span>
                </div>
              </div>
            </div>
          )}

          {/* ADVANCED SECTION */}
          {activeSection === "advanced" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* API Keys */}
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center justify-between mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                      <Key className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Chaves API</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie acesso programático</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all"
                  >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                    Nova Chave
                  </button>
                </div>

                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="group flex items-center justify-between p-6 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white mb-2">{key.name}</p>
                        <p className="text-sm font-mono text-gray-500 dark:text-gray-400">{key.key}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Criada em {key.created.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAPIKey(key.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 text-white opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all"
                      >
                        <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}

                  {apiKeys.length === 0 && (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                      <Key className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                      <p className="text-xl font-bold">Nenhuma chave API criada</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Export & Backup */}
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Download className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Exportar & Backup</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Faça backup dos seus dados</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button className="p-8 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition-all text-left group">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Download className="w-6 h-6 text-white dark:text-gray-900" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Exportar JSON</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Baixe todos os dados em formato JSON</p>
                  </button>

                  <button className="p-8 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition-all text-left group">
                    <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Archive className="w-6 h-6 text-white dark:text-gray-900" strokeWidth={2.5} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Backup Automático</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure backups periódicos</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {activeSection === "danger" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-red-500">
                  <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-red-600 dark:text-red-400">Zona de Perigo</h2>
                    <p className="text-sm text-red-600/70 dark:text-red-400/70">Ações irreversíveis</p>
                  </div>
                </div>

                <div className="p-8 bg-white dark:bg-slate-900 border-2 border-red-300 dark:border-red-800 rounded-xl">
                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                      Excluir Workspace
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                      Esta ação não pode ser desfeita. Todos os dados serão permanentemente excluídos.
                    </p>
                  </div>

                  <ul className="space-y-3 text-base text-gray-600 dark:text-gray-300 mb-8">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <strong className="text-gray-900 dark:text-white font-bold">{workspace.groups.length} grupos</strong> e todo conteúdo
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <div>
                        <strong className="text-gray-900 dark:text-white font-bold">{workspace.groups.reduce((sum, g) => sum + g.pages.length, 0)} páginas</strong> criadas
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <div>Todos os dados e histórico</div>
                    </li>
                  </ul>

                  <button
                    onClick={handleDeleteWorkspace}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                    Excluir Workspace Permanentemente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MASTER SECTION */}
          {activeSection === "master" && user?.isMaster && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Seed Data */}
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                    <Database className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Dados de Demonstração</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Popular banco com exemplos</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Criar Dados MVP</h3>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      Popula o banco de dados com dados de exemplo para demonstração.
                    </p>
                  </div>
                  <button
                    onClick={handleSeedMvpData}
                    disabled={seedingData}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {seedingData ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Database className="w-5 h-5" strokeWidth={2.5} />
                        Criar Dados
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* User Management */}
              <div className="bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-2xl p-8 lg:p-12">
                <div className="flex items-center justify-between mb-8 pb-8 border-b-2 border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                      <Users className="w-7 h-7 text-white dark:text-gray-900" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Gerenciar Usuários</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Controle total do sistema</p>
                    </div>
                  </div>
                  <button
                    onClick={loadMasterUsers}
                    disabled={loadingMasterUsers}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-slate-900 transition-all disabled:opacity-50"
                  >
                    {loadingMasterUsers ? "Carregando..." : "Atualizar"}
                  </button>
                </div>

                {loadingMasterUsers ? (
                  <div className="text-center py-20">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700 opacity-20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-gray-900 dark:border-white border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xl font-bold text-gray-500 dark:text-gray-400">Carregando usuários...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {masterUsers.map((masterUser) => (
                      <div
                        key={masterUser.userId}
                        className="group flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl hover:border-gray-400 dark:hover:border-slate-600 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm flex-shrink-0">
                            {masterUser.nome.slice(0, 1)}{masterUser.sobrenome.slice(0, 1)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-gray-900 dark:text-white truncate">
                                {masterUser.nome} {masterUser.sobrenome}
                              </span>
                              {masterUser.isMaster && (
                                <span className="px-2 py-1 bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white rounded-full text-xs font-bold uppercase tracking-wider border border-gray-300 dark:border-slate-700">
                                  Master
                                </span>
                              )}
                              {!masterUser.ativo && (
                                <span className="px-2 py-1 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider border border-red-400 dark:border-red-600">
                                  Inativo
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate block">{masterUser.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleToggleUserStatus(masterUser.userId, masterUser.ativo)}
                            className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-900 transition-all"
                          >
                            {masterUser.ativo ? "Desativar" : "Ativar"}
                          </button>
                          <button
                            onClick={() => handleToggleUserMaster(masterUser.userId, masterUser.isMaster)}
                            className="px-4 py-2 rounded-xl border-2 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-100 dark:hover:bg-slate-900 transition-all"
                          >
                            {masterUser.isMaster ? "Remover Master" : "Tornar Master"}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(masterUser.userId)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
                          >
                            <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {masterUsers.length === 0 && (
                      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <Database className="w-16 h-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                        <p className="text-xl font-bold">Nenhum usuário encontrado</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ICON PICKER MODAL */}
      {showIconPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-5xl rounded-2xl border-2 border-gray-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-slate-800 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Escolher Ícone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredIcons.length} ícones disponíveis</p>
              </div>
              <button
                onClick={() => {
                  setShowIconPicker(false)
                  setIconSearchQuery('')
                  setIconCategory('all')
                }}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-900 transition-all"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" strokeWidth={2.5} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b-2 border-gray-200 dark:border-slate-800 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  placeholder="Buscar ícones... (ex: código, café, estrela)"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 p-6 border-b-2 border-gray-200 dark:border-slate-800 overflow-x-auto scrollbar-hide flex-shrink-0">
              {ICON_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setIconCategory(cat.id)
                    setIconSearchQuery('')
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    iconCategory === cat.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 scale-105'
                      : 'bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Icons Grid */}
            <div className="p-6 overflow-y-auto flex-1">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                  {filteredIcons.map((item) => {
                    const Icon = item.icon
                    const isSelected = workspaceIcon === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectIcon(item.id)}
                        className={`relative aspect-square p-3 rounded-xl border-2 transition-all group ${
                          isSelected
                            ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white scale-110 shadow-lg'
                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600 hover:scale-105 hover:shadow-md'
                        }`}
                        title={item.label}
                      >
                        <Icon
                          className={`w-full h-full ${
                            isSelected ? 'text-white dark:text-gray-900' : 'text-gray-900 dark:text-white'
                          }`}
                          strokeWidth={2}
                        />
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum ícone encontrado</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tente buscar com outro termo</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white dark:bg-slate-950 border-t-2 border-gray-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedIcon && (
                  <span>Selecionado: <strong className="text-gray-900 dark:text-white">{selectedIcon.label}</strong></span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowIconPicker(false)
                    setIconSearchQuery('')
                    setIconCategory('all')
                  }}
                  className="px-6 py-3 font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowIconPicker(false)
                    setIconSearchQuery('')
                    setIconCategory('all')
                  }}
                  className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW INVITE LINK MODAL */}
      {showNewLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-2xl border-2 border-gray-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-white dark:text-gray-900" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Gerar Link de Convite</h3>
              </div>
              <button
                onClick={() => setShowNewLinkModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-900 transition-all"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Função do Convite</label>
                <select
                  value={newLinkRole}
                  onChange={(e) => setNewLinkRole(e.target.value as WorkspaceRole)}
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-bold focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                >
                  <option value="viewer">Visualizador</option>
                  <option value="member">Membro</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Define as permissões que os novos membros terão
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Expiração (dias)</label>
                <input
                  type="number"
                  value={newLinkExpireDays || ''}
                  onChange={(e) => setNewLinkExpireDays(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="7"
                  min="1"
                  max="365"
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Deixe vazio para nunca expirar
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Máximo de Usos</label>
                <input
                  type="number"
                  value={newLinkMaxUses || ''}
                  onChange={(e) => setNewLinkMaxUses(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ilimitado"
                  min="1"
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Quantas pessoas podem usar este link
                </p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-950 border-t-2 border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setShowNewLinkModal(false)}
                className="flex-1 py-4 font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateInviteLink}
                disabled={creatingLink}
                className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingLink ? (
                  <>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>Gerar Link</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW API KEY MODAL */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 w-full max-w-md rounded-2xl border-2 border-gray-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-slate-800">
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Nova Chave API</h3>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-900 transition-all"
              >
                <X className="w-5 h-5 text-gray-900 dark:text-white" strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Nome da Chave</label>
                <input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Production API"
                  className="w-full px-5 py-3.5 bg-white dark:bg-slate-950 border-2 border-gray-200 dark:border-slate-800 rounded-xl text-gray-900 dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:border-gray-900 dark:focus:border-white transition-all outline-none"
                />
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-950 border-t-2 border-gray-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="flex-1 py-4 font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateAPIKey}
                className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Gerar Chave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
