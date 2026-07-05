'use client';

import { useState, useMemo } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role_id: string;
  last_login?: string;
  is_active: boolean;
}

const permissions: Permission[] = [
  // Users
  { id: 'users.view', name: 'View Users', description: 'View user profiles and lists', category: 'Users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Modify user details and settings', category: 'Users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'Users' },
  { id: 'users.impersonate', name: 'Impersonate Users', description: 'View platform as a user', category: 'Users' },
  { id: 'users.bulk_actions', name: 'Bulk Actions', description: 'Perform bulk operations on users', category: 'Users' },

  // Exchanges
  { id: 'exchanges.view', name: 'View Exchanges', description: 'View exchange details', category: 'Exchanges' },
  { id: 'exchanges.manage', name: 'Manage Exchanges', description: 'Modify or cancel exchanges', category: 'Exchanges' },
  { id: 'exchanges.disputes', name: 'Handle Disputes', description: 'Resolve exchange disputes', category: 'Exchanges' },

  // Content
  { id: 'content.moderate', name: 'Moderate Content', description: 'Review and moderate listings/reviews', category: 'Content' },
  { id: 'content.reports', name: 'View Reports', description: 'Access reported content', category: 'Content' },

  // Financial
  { id: 'finance.view', name: 'View Financials', description: 'Access financial dashboards', category: 'Financial' },
  { id: 'finance.payouts', name: 'Process Payouts', description: 'Approve and process payouts', category: 'Financial' },
  { id: 'finance.promo_codes', name: 'Manage Promo Codes', description: 'Create and manage promotional codes', category: 'Financial' },

  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'Access system settings', category: 'Settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify system configuration', category: 'Settings' },
  { id: 'settings.feature_flags', name: 'Manage Feature Flags', description: 'Toggle feature flags', category: 'Settings' },
  { id: 'settings.roles', name: 'Manage Roles', description: 'Create and edit roles', category: 'Settings' },

  // Analytics
  { id: 'analytics.view', name: 'View Analytics', description: 'Access analytics dashboards', category: 'Analytics' },
  { id: 'analytics.export', name: 'Export Data', description: 'Export analytics data', category: 'Analytics' },

  // Safety
  { id: 'safety.incidents', name: 'Manage Incidents', description: 'Handle safety incidents', category: 'Safety' },
  { id: 'safety.spots', name: 'Manage Spots', description: 'Approve exchange locations', category: 'Safety' },
];

const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Super Admin',
    description: 'Full access to all features and settings',
    permissions: permissions.map((p) => p.id),
    user_count: 2,
    is_system: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'role-2',
    name: 'Admin',
    description: 'Standard admin access with most permissions',
    permissions: permissions.filter((p) => !['settings.roles', 'users.delete', 'settings.edit'].includes(p.id)).map((p) => p.id),
    user_count: 5,
    is_system: true,
    created_at: '2024-01-01',
    updated_at: '2024-03-15',
  },
  {
    id: 'role-3',
    name: 'Moderator',
    description: 'Content moderation and user support',
    permissions: ['users.view', 'exchanges.view', 'content.moderate', 'content.reports', 'exchanges.disputes'],
    user_count: 8,
    is_system: false,
    created_at: '2024-02-10',
    updated_at: '2024-05-20',
  },
  {
    id: 'role-4',
    name: 'Finance Manager',
    description: 'Financial operations and reporting',
    permissions: ['finance.view', 'finance.payouts', 'finance.promo_codes', 'analytics.view', 'analytics.export'],
    user_count: 3,
    is_system: false,
    created_at: '2024-03-01',
    updated_at: '2024-05-10',
  },
  {
    id: 'role-5',
    name: 'Support Agent',
    description: 'Basic user support capabilities',
    permissions: ['users.view', 'exchanges.view', 'content.reports'],
    user_count: 12,
    is_system: false,
    created_at: '2024-04-15',
    updated_at: '2024-06-01',
  },
];

const mockAdmins: AdminUser[] = [
  { id: 'admin-1', name: 'Sarah Johnson', email: 'sarah@bookloop.com', role_id: 'role-1', last_login: '2024-06-02T14:30:00Z', is_active: true },
  { id: 'admin-2', name: 'Michael Chen', email: 'michael@bookloop.com', role_id: 'role-1', last_login: '2024-06-02T10:00:00Z', is_active: true },
  { id: 'admin-3', name: 'Emma Williams', email: 'emma@bookloop.com', role_id: 'role-2', last_login: '2024-06-01T16:00:00Z', is_active: true },
  { id: 'admin-4', name: 'David Osei', email: 'david@bookloop.com', role_id: 'role-3', last_login: '2024-06-02T09:00:00Z', is_active: true },
  { id: 'admin-5', name: 'Ama Mensah', email: 'ama@bookloop.com', role_id: 'role-4', last_login: '2024-05-30T11:00:00Z', is_active: true },
  { id: 'admin-6', name: 'Kofi Asante', email: 'kofi@bookloop.com', role_id: 'role-5', last_login: '2024-05-28T14:00:00Z', is_active: false },
];

export default function RolesManagementPage() {
  const [roles, setRoles] = useState(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const permissionCategories = [...new Set(permissions.map((p) => p.category))];

  const togglePermission = (permissionId: string, isNewRole = false) => {
    if (isNewRole) {
      setNewRole((prev) => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter((p) => p !== permissionId)
          : [...prev.permissions, permissionId],
      }));
    } else if (selectedRole) {
      setSelectedRole({
        ...selectedRole,
        permissions: selectedRole.permissions.includes(permissionId)
          ? selectedRole.permissions.filter((p) => p !== permissionId)
          : [...selectedRole.permissions, permissionId],
      });
    }
  };

  const getRoleById = (roleId: string) => roles.find((r) => r.id === roleId);

  const stats = useMemo(() => ({
    totalRoles: roles.length,
    customRoles: roles.filter((r) => !r.is_system).length,
    totalAdmins: mockAdmins.length,
    activeAdmins: mockAdmins.filter((a) => a.is_active).length,
  }), [roles]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Role-Based Access Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage roles and permissions for admin users
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Role
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Total Roles</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.totalRoles}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Custom Roles</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.customRoles}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Total Admins</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.totalAdmins}</p>
        </div>
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-4">
          <p className="text-xs text-muted-foreground">Active Admins</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeAdmins}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#ECE6DC] dark:border-[#33291f]">
        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Admin Users
        </button>
      </div>

      {activeTab === 'roles' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selectedRole?.id === role.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-[#ECE6DC] hover:border-[#E4DED2]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      {role.is_system && (
                        <span className="px-2 py-0.5 bg-[#F1ECE3] text-muted-foreground text-xs rounded-full">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
                  <span>{role.permissions.length} permissions</span>
                  <span>{role.user_count} user{role.user_count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Role Detail */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedRole.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRole.description}</p>
                  </div>
                  {!selectedRole.is_system && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                      >
                        Edit Role
                      </button>
                      <button className="px-3 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <h4 className="font-medium text-foreground mb-4">Permissions</h4>
                <div className="space-y-6">
                  {permissionCategories.map((category) => {
                    const categoryPermissions = permissions.filter((p) => p.category === category);
                    return (
                      <div key={category}>
                        <h5 className="text-sm font-medium text-foreground mb-2">{category}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryPermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={`p-3 rounded-lg border ${
                                selectedRole.permissions.includes(permission.id)
                                  ? 'bg-indigo-50 border-indigo-200'
                                  : 'bg-background border-[#ECE6DC] dark:border-[#33291f]'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center ${
                                  selectedRole.permissions.includes(permission.id)
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-[#E4DED2]'
                                }`}>
                                  {selectedRole.permissions.includes(permission.id) && (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">{permission.name}</p>
                                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Users with this role */}
                <div className="mt-6 pt-6 border-t border-[#ECE6DC] dark:border-[#33291f]">
                  <h4 className="font-medium text-foreground mb-4">Users with this Role</h4>
                  <div className="space-y-2">
                    {mockAdmins
                      .filter((admin) => admin.role_id === selectedRole.id)
                      .map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-2 bg-background rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                              {admin.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{admin.name}</p>
                              <p className="text-xs text-muted-foreground">{admin.email}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            admin.is_active ? 'bg-green-100 text-green-700' : 'bg-[#F1ECE3] text-muted-foreground'
                          }`}>
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    {mockAdmins.filter((admin) => admin.role_id === selectedRole.id).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No users assigned to this role</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] p-6 text-center text-muted-foreground">
                <svg className="w-12 h-12 mx-auto text-muted-foreground mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p>Select a role to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Admin Users Tab */
        <div className="bg-white dark:bg-[#241c16] rounded-xl border border-[#ECE6DC] dark:border-[#33291f]">
          <div className="p-4 border-b border-[#ECE6DC] flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Admin Users</h3>
            <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              Invite Admin
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-background">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Last Login</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {mockAdmins.map((admin) => {
                const role = getRoleById(admin.role_id);
                return (
                  <tr key={admin.id} className="hover:bg-background">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{admin.name}</p>
                          <p className="text-xs text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {role?.name}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-foreground">
                        {admin.last_login
                          ? new Date(admin.last_login).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        admin.is_active ? 'bg-green-100 text-green-700' : 'bg-[#F1ECE3] text-muted-foreground'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <button className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded">
                          Edit
                        </button>
                        <button className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#241c16] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Create New Role</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-muted-foreground hover:text-muted-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Content Manager"
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe what this role is for..."
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E4DED2] rounded-lg"
                />
              </div>
            </div>

            <h4 className="font-medium text-foreground mb-4">Permissions</h4>
            <div className="space-y-4 mb-6">
              {permissionCategories.map((category) => {
                const categoryPermissions = permissions.filter((p) => p.category === category);
                return (
                  <div key={category}>
                    <h5 className="text-sm font-medium text-foreground mb-2">{category}</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryPermissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-start gap-2 p-2 rounded-lg border border-[#ECE6DC] hover:bg-background cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newRole.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id, true)}
                            className="mt-0.5 rounded border-[#E4DED2]"
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{permission.name}</p>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Role
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-[#E4DED2] text-foreground rounded-lg hover:bg-background"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
