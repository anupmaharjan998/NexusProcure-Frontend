import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, FormGroup, FormControlLabel, Checkbox, Select, MenuItem, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { Button } from '../components/UI/Button';
import { Role } from '../types/Role.ts';
import {
    getRoles,
} from '../services/roleService.ts';
import {Permission} from "../types/Permission.ts";
import {getPermissions, getRolePermissions, updateRolePermissions} from "../services/permissionService.ts";

export const Permissions = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
        try {
            const [rolesData, permissionsData] = await Promise.all([
                getRoles(),
                getPermissions()
            ]);

            const filteredRoles = rolesData.filter(role => role.name.toLowerCase() !== 'admin');

            setRoles(filteredRoles);
            setAllPermissions(permissionsData);

            if (filteredRoles.length > 0) {
                const first = filteredRoles[0];
                setSelectedRoleId(first.id);
                setSelectedPermissionIds((first.permissions || []).map(p => p.id));
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to load roles/permissions');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const currentRole = useMemo(() => roles.find(r => r.id === selectedRoleId), [roles, selectedRoleId]);

  // Ensure allowed permissions are check-marked by fetching roleName-specific permissions on roleName change
  useEffect(() => {
    const loadRolePerms = async () => {
      if (!selectedRoleId) return;
      try {
        const perms = await getRolePermissions(selectedRoleId);
        setSelectedPermissionIds(perms.map(p => p.id));
        setSuccess('');
        setError('');
      } catch (e: any) {
        // Fallback to any permissions embedded on the roleName object
        if (currentRole) {
          setSelectedPermissionIds((currentRole.permissions || []).map(p => p.id));
        }
      }
    };
    loadRolePerms();
  }, [selectedRoleId]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of allPermissions) {
      const key = p.group || 'General';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return groups;
  }, [allPermissions]);

  const onTogglePermission = (id: string) => {
    setSelectedPermissionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const onSave = async () => {
    if (!currentRole) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateRolePermissions(currentRole.id, selectedPermissionIds);

      setRoles(prev => prev.map(r => r.id === currentRole.id ? { ...r, permissions: allPermissions.filter(p => selectedPermissionIds.includes(p.id)) } : r));
      setSuccess('Permissions updated successfully');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const onRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  return (
    <DashboardLayout>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Permissions Management</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Select Role
                </Typography>
                <Select
                  size="small"
                  value={selectedRoleId}
                  onChange={(e) => onRoleChange(e.target.value as string)}
                  sx={{ minWidth: 260 }}
                >
                  {roles.map(r => (
                    <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                  ))}
                </Select>
              </CardContent>
            </Card>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2 }}>
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                <Card key={moduleName}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>{moduleName}</Typography>
                    <FormGroup>
                      {perms.map(p => (
                        <FormControlLabel
                          key={p.id}
                          control={<Checkbox checked={selectedPermissionIds.includes(p.id)} onChange={() => onTogglePermission(p.id)} />}
                          label={p.description}
                        />)
                      )}
                    </FormGroup>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={onSave} disabled={saving || !currentRole} loading={saving}>
                Save Changes
              </Button>
            </Box>
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};
