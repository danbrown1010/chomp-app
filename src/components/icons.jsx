import {
  PawPrint, Mountain, Route, Shield, Truck, MoreHorizontal,
  Tent, Clock, Flame, ChefHat, Beef, Package, Zap, Snowflake,
  Wrench, Lock, Battery, Check, PenLine, X, Plus, Upload, Download,
  ShieldCheck, BookOpen, Sun, Cloud, CloudSun, CloudRain, CloudSnow,
  Wind, Thermometer, Droplets, MapPin, Users,
  Calendar, Star, Backpack, Utensils, Bell, Folder, Wifi, Settings2,
  ChevronRight, ChevronLeft, ChevronDown,
  ArrowLeft, Trash2, AlertTriangle, Search, Send, ExternalLink,
  RefreshCw, FileText, PlugZap, Usb, Car, Camera,
} from 'lucide-react'

const W = 1.75

// ─── Navigation ───────────────────────────────────────────────────────────────
export const IconPaw      = (p) => <PawPrint       strokeWidth={W} {...p} />
export const IconHome     = (p) => <Mountain       strokeWidth={W} {...p} />
export const IconMap      = (p) => <Route          strokeWidth={W} {...p} />
export const IconFlame    = (p) => <Shield         strokeWidth={W} {...p} />
export const IconSignal   = (p) => <Truck          strokeWidth={W} {...p} />
export const IconMore     = (p) => <MoreHorizontal strokeWidth={W} {...p} />

// ─── Utility ──────────────────────────────────────────────────────────────────
export const IconCampsite     = (p) => <Tent          strokeWidth={W} {...p} />
export const IconClock        = (p) => <Clock         strokeWidth={W} {...p} />
export const IconFire         = (p) => <Flame         strokeWidth={W} {...p} />
export const IconChef         = (p) => <ChefHat       strokeWidth={W} {...p} />
export const IconProtein      = (p) => <Beef          strokeWidth={W} {...p} />
export const IconPackage      = (p) => <Package       strokeWidth={W} {...p} />
export const IconZap          = (p) => <Zap           strokeWidth={W} {...p} />
export const IconSnowflake    = (p) => <Snowflake     strokeWidth={W} {...p} />
export const IconTool         = (p) => <Wrench        strokeWidth={W} {...p} />
export const IconLock         = (p) => <Lock          strokeWidth={W} {...p} />
export const IconBattery      = (p) => <Battery       strokeWidth={W} {...p} />
export const IconCheck        = (p) => <Check         strokeWidth={W} {...p} />
export const IconEdit         = (p) => <PenLine       strokeWidth={W} {...p} />
export const IconX            = (p) => <X             strokeWidth={W} {...p} />
export const IconPlus         = (p) => <Plus          strokeWidth={W} {...p} />
export const IconUpload       = (p) => <Upload        strokeWidth={W} {...p} />
export const IconDownload     = (p) => <Download      strokeWidth={W} {...p} />
export const IconShield       = (p) => <ShieldCheck   strokeWidth={W} {...p} />
export const IconBook         = (p) => <BookOpen      strokeWidth={W} {...p} />
export const IconPeople       = (p) => <Users         strokeWidth={W} {...p} />
export const IconTent         = (p) => <Tent          strokeWidth={W} {...p} />
export const IconMapPin       = (p) => <MapPin        strokeWidth={W} {...p} />
export const IconCalendar     = (p) => <Calendar      strokeWidth={W} {...p} />
export const IconStar         = (p) => <Star          strokeWidth={W} {...p} />
export const IconBackpack     = (p) => <Backpack      strokeWidth={W} {...p} />
export const IconUtensils     = (p) => <Utensils      strokeWidth={W} {...p} />
export const IconBell         = (p) => <Bell          strokeWidth={W} {...p} />
export const IconFolder       = (p) => <Folder        strokeWidth={W} {...p} />
export const IconWifi         = (p) => <Wifi          strokeWidth={W} {...p} />
export const IconCog          = (p) => <Settings2     strokeWidth={W} {...p} />
export const IconChevronRight = (p) => <ChevronRight  strokeWidth={W} {...p} />
export const IconChevronLeft  = (p) => <ChevronLeft   strokeWidth={W} {...p} />
export const IconChevronDown  = (p) => <ChevronDown   strokeWidth={W} {...p} />
export const IconArrowLeft    = (p) => <ArrowLeft     strokeWidth={W} {...p} />
export const IconTrash        = (p) => <Trash2        strokeWidth={W} {...p} />
export const IconAlert        = (p) => <AlertTriangle strokeWidth={W} {...p} />
export const IconSearch       = (p) => <Search        strokeWidth={W} {...p} />
export const IconSend         = (p) => <Send          strokeWidth={W} {...p} />
export const IconExternalLink = (p) => <ExternalLink  strokeWidth={W} {...p} />
export const IconRefresh      = (p) => <RefreshCw     strokeWidth={W} {...p} />
export const IconFileText     = (p) => <FileText      strokeWidth={W} {...p} />
export const IconPlugZap      = (p) => <PlugZap       strokeWidth={W} {...p} />
export const IconUsb          = (p) => <Usb           strokeWidth={W} {...p} />
export const IconCar          = (p) => <Car           strokeWidth={W} {...p} />
export const IconCamera       = (p) => <Camera        strokeWidth={W} {...p} />

// ─── Weather ──────────────────────────────────────────────────────────────────
export const IconSun         = (p) => <Sun         strokeWidth={W} {...p} />
export const IconCloud       = (p) => <Cloud       strokeWidth={W} {...p} />
export const IconCloudSun    = (p) => <CloudSun    strokeWidth={W} {...p} />
export const IconCloudRain   = (p) => <CloudRain   strokeWidth={W} {...p} />
export const IconCloudSnow   = (p) => <CloudSnow   strokeWidth={W} {...p} />
export const IconWind        = (p) => <Wind        strokeWidth={W} {...p} />
export const IconThermometer = (p) => <Thermometer strokeWidth={W} {...p} />
export const IconDroplets    = (p) => <Droplets    strokeWidth={W} {...p} />
