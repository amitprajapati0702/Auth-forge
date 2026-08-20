"use client";

import React, { useState, useMemo } from "react";
import { AdminGuard } from "@/components/auth/admin-guard";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
  useAuditLogs,
} from "@/hooks/users/use-users";
import { useDebounce } from "@/hooks/use-debounce";
import type { User, UserRole, UserStatus } from "@/types/user";
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  UserX,
  UserCheck,
  Trash2,
  Activity,
  History,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Clock,
  Laptop,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminUsersContent />
    </AdminGuard>
  );
}

function AdminUsersContent() {
  const { user: currentUser } = useAuth();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 400);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Queries & Mutations
  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: debouncedSearch.trim() || undefined,
      role: selectedRole !== "ALL" ? selectedRole : undefined,
      status: selectedStatus !== "ALL" ? selectedStatus : undefined,
    };
  }, [page, limit, debouncedSearch, selectedRole, selectedStatus]);

  const { data, isLoading, isFetching, refetch } = useUsers(queryParams);
  const { data: auditLogsData, isLoading: isLoadingAudit, refetch: refetchAudit } = useAuditLogs();

  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  // Modal Dialog States
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<User | null>(null);
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [newTargetRole, setNewTargetRole] = useState<UserRole>("USER");

  const [confirmStatusModalOpen, setConfirmStatusModalOpen] = useState(false);
  const [newTargetStatus, setNewTargetStatus] = useState<UserStatus>("ACTIVE");

  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

  // Derived Users & Pagination
  const usersList = data?.users || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Calculate Metrics from current fetched data
  const totalCount = pagination.total;
  const activeCount = usersList.filter((u) => u.status !== "SUSPENDED").length;
  const suspendedCount = usersList.filter((u) => u.status === "SUSPENDED").length;
  const adminCount = usersList.filter((u) => u.role === "ADMIN").length;

  const handleRoleChangeSubmit = async () => {
    if (!selectedUserForAction) return;
    try {
      await updateRoleMutation.mutateAsync({
        id: selectedUserForAction.id,
        role: newTargetRole,
      });
      setRoleChangeModalOpen(false);
      setSelectedUserForAction(null);
    } catch {
      // Error handled in hook toast
    }
  };

  const handleStatusChangeSubmit = async () => {
    if (!selectedUserForAction) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: selectedUserForAction.id,
        status: newTargetStatus,
      });
      setConfirmStatusModalOpen(false);
      setSelectedUserForAction(null);
    } catch {
      // Error handled in hook toast
    }
  };

  const handleDeleteUserSubmit = async () => {
    if (!selectedUserForAction) return;
    try {
      await deleteUserMutation.mutateAsync(selectedUserForAction.id);
      setConfirmDeleteModalOpen(false);
      setSelectedUserForAction(null);
    } catch {
      // Error handled in hook toast
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUserForAction(user);
    setNewTargetRole(user.role === "ADMIN" ? "USER" : "ADMIN");
    setRoleChangeModalOpen(true);
  };

  const openStatusModal = (user: User) => {
    setSelectedUserForAction(user);
    setNewTargetStatus(user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED");
    setConfirmStatusModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUserForAction(user);
    setConfirmDeleteModalOpen(true);
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-300">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin Control Plane • Server-Side RBAC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            User Management & Access Control
          </h1>
          <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
            Oversee user identities, assign administrative roles, manage active accounts, and review real-time security audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setAuditModalOpen(true);
              refetchAudit();
            }}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl text-xs h-10 px-4"
          >
            <History className="w-4 h-4 mr-2" />
            Audit Logs
          </Button>

          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-white text-neutral-950 hover:bg-neutral-100 rounded-xl text-xs font-semibold h-10 px-4 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {isLoading ? "..." : totalCount}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Across all role permissions
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Active Accounts */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? "..." : activeCount}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Normal login and session access
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Suspended Accounts */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Suspended Users</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {isLoading ? "..." : suspendedCount}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Sessions revoked & blocked
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Administrators */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Administrators</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {isLoading ? "..." : adminCount}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Elevated system privileges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & Table Card */}
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {/* Table Controls / Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Debounced Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search by full name or email (debounced)..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-9 bg-white dark:bg-neutral-900 rounded-xl text-xs h-10 border-neutral-200 dark:border-neutral-700"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setPage(1);
                }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs h-10 px-3 font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-300"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Standard Users</option>
                <option value="ADMIN">Administrators</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs h-10 px-3 font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-950 dark:focus:ring-neutral-300"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchInput || selectedRole !== "ALL" || selectedStatus !== "ALL") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchInput("");
                  setSelectedRole("ALL");
                  setSelectedStatus("ALL");
                  setPage(1);
                }}
                className="text-xs h-10 px-3 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Email Verified</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
                      <span className="text-xs">Loading registered users...</span>
                    </div>
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
                      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        No users found
                      </p>
                      <p className="text-xs text-neutral-400">
                        Try adjusting your search query or role/status filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                usersList.map((userItem) => {
                  const isSelf = userItem.id === currentUser?.id;
                  const isAdmin = userItem.role === "ADMIN";
                  const isSuspended = userItem.status === "SUSPENDED";

                  return (
                    <tr
                      key={userItem.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-700 dark:from-neutral-700 dark:to-neutral-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {getInitials(userItem.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                {userItem.fullName}
                              </span>
                              {isSelf && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-neutral-500 dark:text-neutral-400 text-[11px] block truncate">
                              {userItem.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isAdmin
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                          }`}
                        >
                          {isAdmin && <Shield className="w-3 h-3 text-indigo-500" />}
                          {userItem.role}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isSuspended
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSuspended ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                            }`}
                          />
                          {userItem.status || "ACTIVE"}
                        </span>
                      </td>

                      {/* Email Verification */}
                      <td className="py-3.5 px-4">
                        {userItem.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 text-[11px]">
                        {userItem.createdAt
                          ? new Date(userItem.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Role Change Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRoleModal(userItem)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot change your own role" : "Change Role"}
                            className="text-[11px] h-7 px-2.5 rounded-lg border-neutral-200 dark:border-neutral-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Role
                          </Button>

                          {/* Status Toggle Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusModal(userItem)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot suspend yourself" : isSuspended ? "Reactivate User" : "Suspend User"}
                            className={`text-[11px] h-7 px-2.5 rounded-lg border-neutral-200 dark:border-neutral-700 ${
                              isSuspended
                                ? "hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600"
                                : "hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600"
                            }`}
                          >
                            {isSuspended ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Activate
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Suspend
                              </>
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteModal(userItem)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot delete yourself" : "Delete User"}
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 h-7 w-7 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Showing <span className="font-semibold text-neutral-900 dark:text-neutral-100">{usersList.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</span> to{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of <span className="font-semibold text-neutral-900 dark:text-neutral-100">{pagination.total}</span> users
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={pagination.page <= 1 || isLoading}
              className="h-8 px-3 rounded-lg text-xs border-neutral-200 dark:border-neutral-700"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>

            <span className="text-xs font-semibold px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="h-8 px-3 rounded-lg text-xs border-neutral-200 dark:border-neutral-700"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Role Change Modal */}
      {roleChangeModalOpen && selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => !updateRoleMutation.isPending && setRoleChangeModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Modify User Role
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {selectedUserForAction.fullName} ({selectedUserForAction.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRoleChangeModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Select New Access Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewTargetRole("USER")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    newTargetRole === "USER"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                      : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="font-semibold text-xs block">Standard USER</span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    Regular user privileges
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewTargetRole("ADMIN")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    newTargetRole === "ADMIN"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                      : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="font-semibold text-xs block text-indigo-600 dark:text-indigo-400">
                    ADMIN Role
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    Full management access
                  </span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-neutral-100/80 dark:bg-neutral-800/60 text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
                Role modifications are immediately recorded in the security audit log with actor attribution.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRoleChangeModalOpen(false)}
                disabled={updateRoleMutation.isPending}
                className="rounded-xl text-xs h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRoleChangeSubmit}
                disabled={updateRoleMutation.isPending || newTargetRole === selectedUserForAction.role}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm"
              >
                {updateRoleMutation.isPending ? "Applying Role..." : "Confirm Role Update"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmStatusModalOpen}
        onClose={() => setConfirmStatusModalOpen(false)}
        onConfirm={handleStatusChangeSubmit}
        title={newTargetStatus === "SUSPENDED" ? "Suspend User Account?" : "Reactivate User Account?"}
        description={
          newTargetStatus === "SUSPENDED"
            ? `Suspending ${selectedUserForAction?.fullName} will immediately revoke all their active login sessions across devices and block future sign-ins.`
            : `Reactivating ${selectedUserForAction?.fullName} will restore their login capabilities and allow normal dashboard access.`
        }
        variant={newTargetStatus === "SUSPENDED" ? "warning" : "primary"}
        confirmText={newTargetStatus === "SUSPENDED" ? "Suspend & Terminate Sessions" : "Reactivate Account"}
        isLoading={updateStatusMutation.isPending}
        icon={newTargetStatus === "SUSPENDED" ? UserX : UserCheck}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDeleteModalOpen}
        onClose={() => setConfirmDeleteModalOpen(false)}
        onConfirm={handleDeleteUserSubmit}
        title="Permanently Delete User?"
        description={`Are you sure you want to permanently delete the account of ${selectedUserForAction?.fullName} (${selectedUserForAction?.email})? All associated session records will be deleted. This action cannot be undone.`}
        variant="danger"
        confirmText="Permanently Delete"
        isLoading={deleteUserMutation.isPending}
        icon={Trash2}
      />

      {/* Audit Logs Drawer / Modal */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setAuditModalOpen(false)}
          />
          <div className="relative z-50 w-full max-w-2xl max-h-[85vh] bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Security Audit Trail
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Recent administrative security actions and role modifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {isLoadingAudit ? (
                <div className="py-12 text-center text-neutral-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <span className="text-xs">Fetching audit logs...</span>
                </div>
              ) : !auditLogsData || auditLogsData.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                  <Activity className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                  <p className="text-sm font-semibold">No audit logs recorded yet</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Admin actions such as role updates and suspensions will appear here.
                  </p>
                </div>
              ) : (
                auditLogsData.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-[10px]">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-neutral-800 dark:text-neutral-200">
                      Actor: <span className="font-semibold">{log.actorEmail}</span>
                      {log.targetUserEmail && (
                        <>
                          {" "}
                          → Target: <span className="font-semibold">{log.targetUserEmail}</span>
                        </>
                      )}
                    </p>

                    {log.details && (
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800 break-all">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setAuditModalOpen(false)}
                className="rounded-xl text-xs h-9 px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
