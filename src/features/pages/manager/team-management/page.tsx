"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Plus,
  Search,
  RefreshCw,
  Edit3,
  KeyRound,
  UserCheck,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  Users,
  CheckCircle2,
  AlertCircle,
  Shield,
  Mail,
  Lock,
  MoreVertical,
  UserPlus,
  TrendingUp,
  UserMinus,
  LogIn,
  LogOut,
  Clock,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
type AttendanceToday = "checked-in" | "checked-out" | null;

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER";
  isActive: boolean;
  createdAt: string;
  attendanceToday: AttendanceToday;
  checkIn?: string | null;
  checkOut?: string | null;
  leadsAssigned?: number;
  _count?: { assignedLeads?: number };
}

interface CreateForm {
  name: string;
  email: string;
  password: string;
  role: "EMPLOYEE" | "MANAGER";
}

interface EditForm {
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER";
}

interface ToastItem {
  id: number;
  msg: string;
  type: "success" | "warning" | "error";
}

/* ════════════════════════════════════════════════════════════════
   CONSTANTS / HELPERS
   ════════════════════════════════════════════════════════════════ */
const GOLD = "#b98b08";
const AVATAR_COLORS = [
  "#b98b08",
  "#0d7a5f",
  "#2563eb",
  "#7c3aed",
  "#be123c",
  "#0369a1",
  "#0f766e",
];

const avatarColor = (id = "") =>
  AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const formatTime = (d?: string | null) =>
  d
    ? new Date(d).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

/* ════════════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════════════ */
function Toast({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium
            border pointer-events-auto animate-[slideIn_0.18s_ease]
            ${
              t.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : t.type === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor:
                t.type === "error"
                  ? "#ef4444"
                  : t.type === "warning"
                    ? "#f59e0b"
                    : "#10b981",
            }}
          />
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MODAL WRAPPER
   ════════════════════════════════════════════════════════════════ */
interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  width?: string;
}
function Modal({ onClose, children, width = "max-w-md" }: ModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${width} animate-[modalIn_0.18s_ease] overflow-hidden border border-zinc-200`}
      >
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FORM PRIMITIVES
   ════════════════════════════════════════════════════════════════ */
interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}
function Field({ label, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
const inputBase =
  "w-full border border-zinc-200 rounded-lg py-2.5 text-sm text-zinc-800 bg-white outline-none " +
  "focus:border-[#b98b08] focus:ring-2 focus:ring-[#b98b08]/10 transition-all placeholder:text-zinc-300";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
}
function TextInput({ icon: Icon, ...props }: TextInputProps) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
      )}
      <input
        {...props}
        className={`${inputBase} ${Icon ? "pl-9 pr-3" : "px-3"}`}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MODAL HEADER / FOOTER
   ════════════════════════════════════════════════════════════════ */
interface ModalHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClose: () => void;
}
function ModalHeader({ icon, title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#fef9ee]">
          {icon}
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900">{title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-colors text-zinc-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ModalFooterProps {
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  disabled?: boolean;
  confirmLabel: string;
  confirmColor?: string;
}
function ModalFooter({
  onClose,
  onConfirm,
  loading,
  disabled,
  confirmLabel,
  confirmColor = GOLD,
}: ModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
      <button
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 rounded-lg text-sm text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading || disabled}
        className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
        style={{ backgroundColor: confirmColor }}
      >
        {loading ? "Saving…" : confirmLabel}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CREATE MODAL
   ════════════════════════════════════════════════════════════════ */
interface CreateModalProps {
  onClose: () => void;
  onSave: (f: CreateForm) => void;
  loading: boolean;
}
function CreateModal({ onClose, onSave, loading }: CreateModalProps) {
  const [form, setForm] = useState<CreateForm>({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });
  const [showPw, setShowPw] = useState(false);
  const set =
    (k: keyof CreateForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  const valid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length >= 6;

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        icon={<UserPlus className="w-4 h-4" style={{ color: GOLD }} />}
        title="Add Team Member"
        subtitle="Create a new employee account"
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Full Name" required>
              <TextInput
                icon={Users}
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={set("name")}
              />
            </Field>
          </div>
          <Field label="Email" required>
            <TextInput
              icon={Mail}
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={set("email")}
            />
          </Field>
          <Field label="Role" required>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
              <select
                value={form.role}
                onChange={set("role")}
                className={`${inputBase} pl-9 pr-8 appearance-none`}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
            </div>
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set("password")}
                className={`${inputBase} pl-9 pr-9`}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
              >
                {showPw ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </Field>
        </div>
        {form.password.length > 0 && form.password.length < 6 && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Password must be at least 6
            characters
          </p>
        )}
      </div>
      <ModalFooter
        onClose={onClose}
        onConfirm={() => onSave(form)}
        loading={loading}
        disabled={!valid}
        confirmLabel="Create Member"
      />
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════
   EDIT MODAL
   ════════════════════════════════════════════════════════════════ */
interface EditModalProps {
  user: Employee;
  onClose: () => void;
  onSave: (f: EditForm) => void;
  loading: boolean;
}
function EditModal({ user, onClose, onSave, loading }: EditModalProps) {
  const [form, setForm] = useState<EditForm>({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const set =
    (k: keyof EditForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Modal onClose={onClose}>
      <ModalHeader
        icon={
          <span
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: avatarColor(user.id) }}
          >
            {initials(user.name)}
          </span>
        }
        title="Edit Member"
        subtitle={`Updating ${user.name.split(" ")[0]}'s profile`}
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Full Name" required>
              <TextInput
                icon={Users}
                value={form.name}
                onChange={set("name")}
              />
            </Field>
          </div>
          <Field label="Email" required>
            <TextInput
              icon={Mail}
              type="email"
              value={form.email}
              onChange={set("email")}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Role">
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
                <select
                  value={form.role}
                  onChange={set("role")}
                  className={`${inputBase} pl-9 pr-8 appearance-none`}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
              </div>
            </Field>
          </div>
        </div>
      </div>
      <ModalFooter
        onClose={onClose}
        onConfirm={() => onSave(form)}
        loading={loading}
        confirmLabel="Save Changes"
      />
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════
   RESET PASSWORD MODAL
   ════════════════════════════════════════════════════════════════ */
interface ResetPasswordModalProps {
  user: Employee;
  onClose: () => void;
  onSave: (pw: string) => void;
  loading: boolean;
}
function ResetPasswordModal({
  user,
  onClose,
  onSave,
  loading,
}: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const valid = password.length >= 6 && password === confirm;

  return (
    <Modal onClose={onClose} width="max-w-sm">
      <ModalHeader
        icon={<KeyRound className="w-4 h-4 text-blue-600" />}
        title="Reset Password"
        subtitle={user.name}
        onClose={onClose}
      />
      <div className="px-6 py-5 space-y-4">
        <Field label="New Password" required>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputBase} px-3 pr-9`}
            />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500 transition-colors"
            >
              {showPw ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </Field>
        <Field label="Confirm Password" required>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`${inputBase} px-3`}
          />
        </Field>
        {confirm.length > 0 && password !== confirm && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Passwords don't match
          </p>
        )}
      </div>
      <ModalFooter
        onClose={onClose}
        onConfirm={() => onSave(password)}
        loading={loading}
        disabled={!valid}
        confirmLabel="Reset Password"
        confirmColor="#2563eb"
      />
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════
   LEAVE STATUS CONFIRM MODAL
   ════════════════════════════════════════════════════════════════ */
interface LeaveModalProps {
  user: Employee;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}
function LeaveModal({ user, onClose, onConfirm, loading }: LeaveModalProps) {
  const activate = !user.isActive;
  return (
    <Modal onClose={onClose} width="max-w-sm">
      <div className="px-6 pt-7 pb-5 text-center">
        <div
          className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center
          ${activate ? "bg-emerald-50" : "bg-rose-50"}`}
        >
          {activate ? (
            <UserCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <UserMinus className="w-5 h-5 text-rose-500" />
          )}
        </div>
        <h3 className="text-[15px] font-semibold text-zinc-900 mb-2">
          {activate ? "Restore to Active?" : "Mark user as Inactive?"}
        </h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
          {activate
            ? `${user.name} will be restored and available for lead assignments.`
            : `${user.name} will be marked as inactive. This user can't be able to login in CRM.`}
        </p>
      </div>
      <ModalFooter
        onClose={onClose}
        onConfirm={onConfirm}
        loading={loading}
        confirmLabel={activate ? "Activate" : "Inactivate"}
        confirmColor={activate ? "#059669" : "#FF0000"}
      />
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════════
   ACTION MENU
   ════════════════════════════════════════════════════════════════ */
interface ActionMenuProps {
  member: Employee;
  onEdit: () => void;
  onReset: () => void;
  onLeave: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  checkInLoading: boolean;
  checkOutLoading: boolean;
}
function ActionMenu({
  member,
  onEdit,
  onReset,
  onLeave,
  onCheckIn,
  onCheckOut,
  checkInLoading,
  checkOutLoading,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const canCheckIn = member.attendanceToday !== "checked-in";
  const canCheckOut = member.attendanceToday === "checked-in";

  const items: {
    icon: React.ElementType;
    label: string;
    action: () => void;
    cls: string;
    loading?: boolean;
  }[] = [
    {
      icon: Edit3,
      label: "Edit Details",
      action: onEdit,
      cls: "text-zinc-700 hover:bg-zinc-50",
    },
    {
      icon: KeyRound,
      label: "Reset Password",
      action: onReset,
      cls: "text-blue-600 hover:bg-blue-50",
    },
    ...(canCheckIn
      ? [
          {
            icon: LogIn,
            label: "Check In",
            action: onCheckIn,
            cls: "text-emerald-600 hover:bg-emerald-50",
            loading: checkInLoading,
          },
        ]
      : []),
    ...(canCheckOut
      ? [
          {
            icon: LogOut,
            label: "Check Out",
            action: onCheckOut,
            cls: "text-orange-600 hover:bg-orange-50",
            loading: checkOutLoading,
          },
        ]
      : []),
    {
      icon: member.isActive ? UserMinus : UserCheck,
      label: member.isActive ? "Mark On Leave" : "Restore Active",
      action: onLeave,
      cls: member.isActive
        ? "text-amber-600 hover:bg-amber-50"
        : "text-emerald-600 hover:bg-emerald-50",
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 w-44 bg-white border border-zinc-200 rounded-lg shadow-xl py-1 animate-[fadeIn_0.1s_ease]">
          {items.map(({ icon: Icon, label, action, cls, loading }) => (
            <button
              key={label}
              disabled={loading}
              onClick={() => {
                action();
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors disabled:opacity-50 ${cls}`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {loading ? "…" : label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   SKELETON ROW
   ════════════════════════════════════════════════════════════════ */
function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-50">
      {["w-40", "w-48", "w-24", "w-12", "w-28", "w-20", "w-8"].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className={`h-3 ${w} rounded bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100
            bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]`}
          />
        </td>
      ))}
    </tr>
  );
}

/* ════════════════════════════════════════════════════════════════
   STAT CARD
   ════════════════════════════════════════════════════════════════ */
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
  accent: string;
}
function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent,
}: StatCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl px-5 py-4 flex items-center gap-4">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accent + "18" }}
      >
        <Icon className="w-[18px] h-[18px]" style={{ color: accent }} />
      </div>
      <div>
        {loading ? (
          <div className="w-8 h-5 rounded bg-zinc-100 animate-pulse mb-1" />
        ) : (
          <div className="text-xl font-bold text-zinc-900 leading-none">
            {value}
          </div>
        )}
        <div className="text-xs text-zinc-400 mt-1">{label}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ATTENDANCE CELL
   ════════════════════════════════════════════════════════════════ */
function AttendanceCell({ member }: { member: Employee }) {
  const att = member.attendanceToday;
  const checkInTime = formatTime(member.checkIn);
  const checkOutTime = formatTime(member.checkOut);

  if (att === "checked-in") {
    return (
      <div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 className="w-3 h-3" /> Checked In
        </span>
        {checkInTime && (
          <div className="text-[10px] text-zinc-400 mt-0.5">{checkInTime}</div>
        )}
      </div>
    );
  }
  if (att === "checked-out") {
    return (
      <div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
          <LogOut className="w-3 h-3" /> Checked Out
        </span>
        {checkOutTime && (
          <div className="text-[10px] text-zinc-400 mt-0.5">{checkOutTime}</div>
        )}
      </div>
    );
  }
  return <span className="text-[11px] text-zinc-300">—</span>;
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function ManagerTeamManagement() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "PRESENT"
  >("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<Employee | null>(null);
  const [resetUser, setResetUser] = useState<Employee | null>(null);
  const [leaveUser, setLeaveUser] = useState<Employee | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Track which member's check-in/out is loading
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const addToast = (msg: string, type: ToastItem["type"] = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  /* ── Fetch team members ── */
  const {
    data: raw = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => (await api.get("/users/team-members")).data,
    refetchInterval: 60_000, // refresh every minute for live attendance
  });

  const employees: Employee[] = Array.isArray(raw)
    ? raw
    : ((raw as any)?.employees ?? []);

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => api.post("/users/team-members", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast("Member created");
      setShowCreate(false);
    },
    onError: (e: any) =>
      addToast(e?.response?.data?.error ?? "Failed to create member", "error"),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, ...data }: EditForm & { id: string }) =>
      api.patch(`/users/team-members/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast("Details updated");
      setEditUser(null);
    },
    onError: (e: any) =>
      addToast(e?.response?.data?.error ?? "Failed to update", "error"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.patch(`/users/team-members/${id}/reset-password`, { password }),
    onSuccess: () => {
      addToast("Password reset");
      setResetUser(null);
    },
    onError: () => addToast("Failed to reset password", "error"),
  });

  const leaveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/team-members/${id}/leave-status`, { isActive }),
    onSuccess: (_: any, vars: { id: string; isActive: boolean }) => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast(
        vars.isActive ? "Member activated" : "Marked on leave",
        vars.isActive ? "success" : "warning",
      );
      setLeaveUser(null);
    },
    onError: () => addToast("Failed to update status", "error"),
  });

  const handleCheckIn = async (member: Employee) => {
    setCheckingIn(member.id);
    try {
      await api.post(`/users/team-members/${member.id}/check-in`);
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast(`${member.name.split(" ")[0]} checked in`);
    } catch {
      addToast("Failed to check in", "error");
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckOut = async (member: Employee) => {
    setCheckingOut(member.id);
    try {
      await api.post(`/users/team-members/${member.id}/check-out`);
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast(`${member.name.split(" ")[0]} checked out`, "warning");
    } catch {
      addToast("Failed to check out", "error");
    } finally {
      setCheckingOut(null);
    }
  };

  /* ── Derived counts ── */
  const activeCount = employees.filter((m) => m.isActive).length;
  const inactiveCount = employees.filter((m) => !m.isActive).length;
  const presentCount = employees.filter(
    (m) => m.attendanceToday === "checked-in",
  ).length;

  const filtered = employees.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q);
    const matchFilter =
      filter === "ACTIVE"
        ? m.isActive
        : filter === "INACTIVE"
          ? !m.isActive
          : filter === "PRESENT"
            ? m.attendanceToday === "checked-in"
            : true;
    return matchSearch && matchFilter;
  });

  const FILTERS: { key: typeof filter; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: employees.length },
    { key: "ACTIVE", label: "Active", count: activeCount },
    { key: "INACTIVE", label: "In Active", count: inactiveCount },
    { key: "PRESENT", label: "Present Today", count: presentCount },
  ];

  return (
    <div className="min-h-full bg-[#f4f3f0] p-6">
      <Toast toasts={toasts} />

      {/* Modals */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onSave={(form) => createMutation.mutate(form)}
          loading={createMutation.isPending}
        />
      )}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(form) => editMutation.mutate({ id: editUser.id, ...form })}
          loading={editMutation.isPending}
        />
      )}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSave={(pw) =>
            resetPasswordMutation.mutate({ id: resetUser.id, password: pw })
          }
          loading={resetPasswordMutation.isPending}
        />
      )}
      {leaveUser && (
        <LeaveModal
          user={leaveUser}
          onClose={() => setLeaveUser(null)}
          onConfirm={() =>
            leaveMutation.mutate({
              id: leaveUser.id,
              isActive: !leaveUser.isActive,
            })
          }
          loading={leaveMutation.isPending}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">
            Team Management
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Manage members, access and attendance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-500 bg-white border border-zinc-200 rounded-lg hover:text-zinc-700 hover:border-zinc-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total Members"
          value={employees.length}
          icon={Users}
          loading={isLoading}
          accent="#b98b08"
        />
        <StatCard
          label="Active"
          value={activeCount}
          icon={TrendingUp}
          loading={isLoading}
          accent="#059669"
        />
        <StatCard
          label="In Active"
          value={inactiveCount}
          icon={UserMinus}
          loading={isLoading}
          accent="#FF0000"
        />
        <StatCard
          label="Present Today"
          value={presentCount}
          icon={Clock}
          loading={isLoading}
          accent="#2563eb"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
          <input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-zinc-200 rounded-lg outline-none
              focus:border-[#b98b08] focus:ring-2 focus:ring-[#b98b08]/10 placeholder:text-zinc-300 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${filter === key ? "text-white" : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700"}`}
              style={filter === key ? { backgroundColor: GOLD } : {}}
            >
              {label}
              <span
                className={`text-[10px] rounded-full px-1.5 py-px font-semibold
                ${filter === key ? "bg-black/10 text-white" : "bg-zinc-100 text-zinc-500"}`}
              >
                {isLoading ? "—" : count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="font-semibold text-zinc-800 text-sm">
              Failed to load team members
            </p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">
              Check your connection and try again
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-semibold text-white rounded-lg"
              style={{ backgroundColor: GOLD }}
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                {[
                  "Member",
                  "Contact",
                  "Role",
                  "Leads",
                  "Attendance",
                  "Status",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-14">
                      <Search className="w-8 h-8 text-zinc-200 mb-3" />
                      <p className="font-medium text-zinc-500 text-sm">
                        No members found
                      </p>
                      <p className="text-xs text-zinc-300 mt-1">
                        Adjust your search or filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((member, idx) => (
                  <tr
                    key={member.id}
                    style={{ animationDelay: `${idx * 20}ms` }}
                    className="border-b border-zinc-50 hover:bg-[#fef9ee]/30 transition-colors animate-[fadeIn_0.2s_ease_both]"
                  >
                    {/* Member */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor(member.id) }}
                        >
                          {initials(member.name)}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white
                            ${
                              member.attendanceToday === "checked-in"
                                ? "bg-emerald-500"
                                : member.isActive
                                  ? "bg-zinc-400"
                                  : "bg-amber-400"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-800 text-[13px] leading-tight">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Joined {formatDate(member.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="text-[13px] text-zinc-600">
                        {member.email}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
                        style={
                          member.role === "MANAGER"
                            ? {
                                backgroundColor: "#eff6ff",
                                color: "#2563eb",
                                borderColor: "#bfdbfe",
                              }
                            : {
                                backgroundColor: "#fef9ee",
                                color: "#b98b08",
                                borderColor: "#f0d89a",
                              }
                        }
                      >
                        <Shield className="w-2.5 h-2.5" />
                        {member.role === "MANAGER" ? "Manager" : "Employee"}
                      </span>
                    </td>

                    {/* Leads */}
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-zinc-700">
                        {member._count?.assignedLeads ??
                          member.leadsAssigned ??
                          0}
                      </span>
                    </td>

                    {/* Attendance */}
                    <td className="px-4 py-3.5">
                      <AttendanceCell member={member} />
                    </td>

                    {/* Status — reflects isActive (manager leave toggle) */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setLeaveUser(member)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors hover:opacity-75"
                        style={
                          member.isActive
                            ? {
                                backgroundColor: "#f0fdf4",
                                color: "#16a34a",
                                borderColor: "#bbf7d0",
                              }
                            : {
                                backgroundColor: "#FF00001A",
                                color: "#FF0000",
                                borderColor: "#fde68a",
                              }
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        {member.isActive ? "Active" : "In Active"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        member={member}
                        onEdit={() => setEditUser(member)}
                        onReset={() => setResetUser(member)}
                        onLeave={() => setLeaveUser(member)}
                        onCheckIn={() => handleCheckIn(member)}
                        onCheckOut={() => handleCheckOut(member)}
                        checkInLoading={checkingIn === member.id}
                        checkOutLoading={checkingOut === member.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && !isError && (
        <p className="text-xs text-zinc-400 text-right mt-2">
          {filtered.length} of {employees.length} members
        </p>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(3px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
