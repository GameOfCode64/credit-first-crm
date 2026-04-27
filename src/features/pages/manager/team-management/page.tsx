"use client";

import { useState, useEffect, ReactNode } from "react";
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
  AtSign,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ════════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════════ */
type AttendanceToday = "checked-in" | "checked-out" | null;

interface Employee {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  role: "EMPLOYEE" | "MANAGER";
  isActive: boolean;
  createdAt: string;
  attendanceToday: AttendanceToday;
  checkIn?: string | null;
  checkOut?: string | null;
  leadsAssigned?: number;
  phone?: string;
  _count?: { assignedLeads?: number };
}

interface CreateForm {
  name: string;
  phone: number | string;
  email: string;
  username: string;
  password: string;
  role: "EMPLOYEE" | "MANAGER";
}
interface EditForm {
  name: string;
  email: string;
  username: string;
  phone: string;
  role: "EMPLOYEE" | "MANAGER";
}
interface ToastItem {
  id: number;
  msg: string;
  type: "success" | "warning" | "error";
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
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
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg text-[13px] font-medium border pointer-events-auto
          ${t.type === "error" ? "bg-red-50 border-red-200 text-red-700" : t.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}
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
   FORM PRIMITIVES
   ════════════════════════════════════════════════════════════════ */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function IconInput({
  icon: Icon,
  ...props
}: { icon?: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none z-10" />
      )}
      <Input
        {...props}
        className={`h-10 text-sm border-zinc-200 ${Icon ? "pl-9" : ""}`}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CREATE DIALOG
   ════════════════════════════════════════════════════════════════ */
function CreateDialog({
  open,
  onClose,
  onSave,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (f: CreateForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<CreateForm>({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    role: "EMPLOYEE",
  });
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        role: "EMPLOYEE",
      });
      setShowPw(false);
    }
  }, [open]);

  const set =
    (k: keyof CreateForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const valid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length >= 6;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#fef9ee]">
              <UserPlus className="w-4 h-4" style={{ color: GOLD }} />
            </div>
            <div>
              <DialogTitle className="text-[15px]">Add Team Member</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Create a new employee account
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Full Name" required>
              <IconInput
                icon={Users}
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={set("name")}
              />
            </Field>
          </div>
          <Field label="Email" required>
            <IconInput
              icon={Mail}
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={set("email")}
            />
          </Field>
          <Field label="Username">
            <IconInput
              icon={AtSign}
              placeholder="rahul.sharma"
              value={form.username}
              onChange={set("username")}
            />
          </Field>
          <Field label="phone">
            <IconInput
              icon={Phone}
              placeholder="123-456-7890"
              value={form.phone}
              onChange={set("phone")}
            />
          </Field>
          <Field label="Role" required>
            <Select
              value={form.role}
              onValueChange={(v) => setForm((p) => ({ ...p, role: v as any }))}
            >
              <SelectTrigger className="h-10 border-zinc-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none z-10" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set("password")}
                className="pl-9 pr-9 h-10 border-zinc-200"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPw ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </Field>
          {form.password.length > 0 && form.password.length < 6 && (
            <div className="col-span-2">
              <p className="text-xs text-red-500 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Password must be at
                least 6 characters
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={loading || !valid}
            className="text-white font-semibold"
            style={{ backgroundColor: GOLD }}
          >
            {loading ? "Creating…" : "Create Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════════════════════════
   EDIT DIALOG
   ════════════════════════════════════════════════════════════════ */
function EditDialog({
  user,
  open,
  onClose,
  onSave,
  loading,
}: {
  user: Employee | null;
  open: boolean;
  onClose: () => void;
  onSave: (f: EditForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<EditForm>({
    name: "",
    email: "",
    username: "",
    phone: "",
    role: "EMPLOYEE",
  });

  useEffect(() => {
    if (user && open)
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        username: user.username ?? "",
        role: user.role,
      });
  }, [user, open]);

  const set = (k: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const valid = form.name.trim().length > 0 && form.email.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            {user && (
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: avatarColor(user.id) }}
              >
                {initials(user.name)}
              </span>
            )}
            <div>
              <DialogTitle className="text-[15px]">Edit Member</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Updating {user?.name.split(" ")[0]}'s profile
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Full Name" required>
              <IconInput
                icon={Users}
                value={form.name}
                onChange={set("name")}
                placeholder="Rahul Sharma"
              />
            </Field>
          </div>
          <Field label="Email" required>
            <IconInput
              icon={Mail}
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="email@company.com"
            />
          </Field>
          <Field label="Username">
            <IconInput
              icon={AtSign}
              value={form.username}
              onChange={set("username")}
              placeholder="rahul.sharma"
            />
          </Field>

          <Field label="Phone">
            <IconInput
              icon={Phone}
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="123-456-7890"
            />
          </Field>
          <div className="col-span-2">
            <Field label="Role">
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, role: v as any }))
                }
              >
                <SelectTrigger className="h-10 border-zinc-200">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            disabled={loading || !valid}
            className="text-white font-semibold"
            style={{ backgroundColor: GOLD }}
          >
            {loading ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════════════════════════
   RESET PASSWORD DIALOG
   ════════════════════════════════════════════════════════════════ */
function ResetPasswordDialog({
  user,
  open,
  onClose,
  onSave,
  loading,
}: {
  user: Employee | null;
  open: boolean;
  onClose: () => void;
  onSave: (pw: string) => void;
  loading: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
      setConfirm("");
      setShowPw(false);
    }
  }, [open]);

  const valid = password.length >= 6 && password === confirm;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
              <KeyRound className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-[15px]">Reset Password</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {user?.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <Field label="New Password" required>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none z-10" />
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 h-10 border-zinc-200"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
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
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none z-10" />
              <Input
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pl-9 h-10 border-zinc-200"
              />
            </div>
          </Field>
          {password.length > 0 && password.length < 6 && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Min. 6 characters
            </p>
          )}
          {confirm.length > 0 && password !== confirm && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Passwords don't match
            </p>
          )}
          {valid && (
            <p className="text-xs text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
            </p>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(password)}
            disabled={loading || !valid}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Resetting…" : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════════════════════════
   LEAVE STATUS DIALOG
   ════════════════════════════════════════════════════════════════ */
function LeaveDialog({
  user,
  open,
  onClose,
  onConfirm,
  loading,
}: {
  user: Employee | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const activate = !user?.isActive;
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-sm gap-0 p-0 overflow-hidden">
        <div className="px-6 pt-8 pb-5 flex flex-col items-center text-center">
          <div
            className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${activate ? "bg-emerald-50" : "bg-amber-50"}`}
          >
            {activate ? (
              <UserCheck className="w-5 h-5 text-emerald-600" />
            ) : (
              <UserMinus className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <DialogTitle className="text-[15px] mb-2">
            {activate ? "Restore to Active?" : "Mark as On Leave?"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {activate
              ? `${user?.name} will be restored and available for lead assignments.`
              : `${user?.name} will be marked on leave. This is separate from attendance check-in.`}
          </DialogDescription>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="text-white"
            style={{ backgroundColor: activate ? "#059669" : "#d97706" }}
          >
            {loading ? "Saving…" : activate ? "Activate" : "Mark Leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ════════════════════════════════════════════════════════════════
   ACTION MENU  — shadcn DropdownMenu (fixes event bubbling issue)
   ════════════════════════════════════════════════════════════════ */
function ActionMenu({
  member,
  onEdit,
  onReset,
  onLeave,
  onCheckIn,
  onCheckOut,
  checkInLoading,
  checkOutLoading,
}: {
  member: Employee;
  onEdit: () => void;
  onReset: () => void;
  onLeave: () => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
  checkInLoading: boolean;
  checkOutLoading: boolean;
}) {
  const canCheckIn = member.attendanceToday !== "checked-in";
  const canCheckOut = member.attendanceToday === "checked-in";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600 outline-none focus:outline-none">
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 py-1 z-50">
        {/* onSelect fires AFTER the dropdown closes — this is key to avoiding the race condition */}
        <DropdownMenuItem
          onSelect={onEdit}
          className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-zinc-700 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 flex-shrink-0" /> Edit Details
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={onReset}
          className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-blue-600 cursor-pointer focus:text-blue-600 focus:bg-blue-50"
        >
          <KeyRound className="w-3.5 h-3.5 flex-shrink-0" /> Reset Password
        </DropdownMenuItem>

        {canCheckIn && (
          <DropdownMenuItem
            onSelect={onCheckIn}
            disabled={checkInLoading}
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-emerald-600 cursor-pointer focus:text-emerald-600 focus:bg-emerald-50"
          >
            <LogIn className="w-3.5 h-3.5 flex-shrink-0" />{" "}
            {checkInLoading ? "Checking in…" : "Check In"}
          </DropdownMenuItem>
        )}

        {canCheckOut && (
          <DropdownMenuItem
            onSelect={onCheckOut}
            disabled={checkOutLoading}
            className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-orange-600 cursor-pointer focus:text-orange-600 focus:bg-orange-50"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />{" "}
            {checkOutLoading ? "Checking out…" : "Check Out"}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onSelect={onLeave}
          className={`flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium cursor-pointer
            ${member.isActive ? "text-amber-600 focus:text-amber-600 focus:bg-amber-50" : "text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"}`}
        >
          {member.isActive ? (
            <>
              <UserMinus className="w-3.5 h-3.5 flex-shrink-0" /> Mark On Leave
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 flex-shrink-0" /> Restore Active
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ════════════════════════════════════════════════════════════════
   SKELETON / STAT CARD / ATTENDANCE CELL
   ════════════════════════════════════════════════════════════════ */
function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-50">
      {["w-40", "w-48", "w-24", "w-12", "w-28", "w-20", "w-8"].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className={`h-3 ${w} rounded bg-gradient-to-r from-zinc-100 via-zinc-50 to-zinc-100 bg-[length:200%_100%] animate-[shimmer_1.4s_ease_infinite]`}
          />
        </td>
      ))}
    </tr>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  loading: boolean;
  accent: string;
}) {
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

function AttendanceCell({ member }: { member: Employee }) {
  const att = member.attendanceToday;
  const checkInTime = formatTime(member.checkIn);
  const checkOutTime = formatTime(member.checkOut);
  if (att === "checked-in")
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
  if (att === "checked-out")
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

  // Separate open flags per dialog
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showLeave, setShowLeave] = useState(false);

  // Single shared "active user" — set before opening any dialog
  const [activeUser, setActiveUser] = useState<Employee | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const addToast = (msg: string, type: ToastItem["type"] = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  // These helpers set the user THEN open — called from onSelect (fires after dropdown closes)
  const openEdit = (m: Employee) => {
    setActiveUser(m);
    setShowEdit(true);
  };
  const openReset = (m: Employee) => {
    setActiveUser(m);
    setShowReset(true);
  };
  const openLeave = (m: Employee) => {
    setActiveUser(m);
    setShowLeave(true);
  };

  /* ── Fetch ── */
  const {
    data: raw = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => (await api.get("/users/team-members")).data,
    refetchInterval: 60_000,
  });
  const employees: Employee[] = Array.isArray(raw)
    ? raw
    : ((raw as any)?.employees ?? []);

  /* ── Mutations ── */
  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => api.post("/users/team-members", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast("Member created successfully");
      setShowCreate(false);
    },
    onError: (e: any) =>
      addToast(e?.response?.data?.error ?? "Failed to create member", "error"),
  });

  const editMutation = useMutation({
    mutationFn: ({
      id,
      name,
      email,
      username,
      phone,
      role,
    }: EditForm & { id: string }) =>
      api.patch(`/users/team-members/${id}`, {
        name,
        email,
        phone: phone.trim() ? phone.trim() : null,
        role,
        ...(username?.trim()
          ? { username: username.trim() }
          : { username: null }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast("Member details updated");
      setShowEdit(false);
    },
    onError: (e: any) =>
      addToast(e?.response?.data?.error ?? "Failed to update member", "error"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.patch(`/users/team-members/${id}/reset-password`, { password }),
    onSuccess: () => {
      addToast("Password reset successfully");
      setShowReset(false);
    },
    onError: (e: any) =>
      addToast(e?.response?.data?.error ?? "Failed to reset password", "error"),
  });

  const leaveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/team-members/${id}/leave-status`, { isActive }),
    onSuccess: (_: any, vars: any) => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      addToast(
        vars.isActive ? "Member activated" : "Marked on leave",
        vars.isActive ? "success" : "warning",
      );
      setShowLeave(false);
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

  /* ── Derived ── */
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
      m.email?.toLowerCase().includes(q) ||
      m.username?.toLowerCase().includes(q);
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

  const FILTERS = [
    { key: "ALL" as const, label: "All", count: employees.length },
    { key: "ACTIVE" as const, label: "Active", count: activeCount },
    { key: "INACTIVE" as const, label: "On Leave", count: inactiveCount },
    { key: "PRESENT" as const, label: "Present Today", count: presentCount },
  ];

  return (
    <div className="min-h-full bg-[#f4f3f0] p-6">
      <Toast toasts={toasts} />

      {/* ── Dialogs ── */}
      <CreateDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={(form) => createMutation.mutate(form)}
        loading={createMutation.isPending}
      />
      <EditDialog
        user={activeUser}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={(form) =>
          activeUser && editMutation.mutate({ id: activeUser.id, ...form })
        }
        loading={editMutation.isPending}
      />
      <ResetPasswordDialog
        user={activeUser}
        open={showReset}
        onClose={() => setShowReset(false)}
        onSave={(pw) =>
          activeUser &&
          resetPasswordMutation.mutate({ id: activeUser.id, password: pw })
        }
        loading={resetPasswordMutation.isPending}
      />
      <LeaveDialog
        user={activeUser}
        open={showLeave}
        onClose={() => setShowLeave(false)}
        onConfirm={() =>
          activeUser &&
          leaveMutation.mutate({
            id: activeUser.id,
            isActive: !activeUser.isActive,
          })
        }
        loading={leaveMutation.isPending}
      />

      {/* Header */}
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

      {/* Stat Cards */}
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
          label="On Leave"
          value={inactiveCount}
          icon={UserMinus}
          loading={isLoading}
          accent="#d97706"
        />
        <StatCard
          label="Present Today"
          value={presentCount}
          icon={Clock}
          loading={isLoading}
          accent="#2563eb"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-300 pointer-events-none" />
          <input
            placeholder="Search name, email or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-zinc-200 rounded-lg outline-none focus:border-[#b98b08] focus:ring-2 focus:ring-[#b98b08]/10 placeholder:text-zinc-300 transition-all"
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

      {/* Table */}
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
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor(member.id) }}
                        >
                          {initials(member.name)}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white
                            ${member.attendanceToday === "checked-in" ? "bg-emerald-500" : member.isActive ? "bg-zinc-400" : "bg-amber-400"}`}
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

                    <td className="px-4 py-3.5">
                      <div className="text-[13px] font-bold text-zinc-600">
                        +91 {member.phone! ?? "—"}
                      </div>
                      {member.username && (
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-0.5">
                          {/* <AtSign className="w-2.5 h-2.5" /> */}
                          {member.email ? member.email : member.username}
                        </div>
                      )}
                    </td>

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

                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-semibold text-zinc-700">
                        {member._count?.assignedLeads ??
                          member.leadsAssigned ??
                          0}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <AttendanceCell member={member} />
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => openLeave(member)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors hover:opacity-75"
                        style={
                          member.isActive
                            ? {
                                backgroundColor: "#f0fdf4",
                                color: "#16a34a",
                                borderColor: "#bbf7d0",
                              }
                            : {
                                backgroundColor: "#fffbeb",
                                color: "#b45309",
                                borderColor: "#fde68a",
                              }
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        {member.isActive ? "Active" : "On Leave"}
                      </button>
                    </td>

                    <td className="px-4 py-3.5">
                      <ActionMenu
                        member={member}
                        onEdit={() => openEdit(member)}
                        onReset={() => openReset(member)}
                        onLeave={() => openLeave(member)}
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
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
