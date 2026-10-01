import { useState, useEffect } from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  Modal,
  TextInput,
  Select,
  SelectItem,
  InlineLoading,
  Pagination,
  Stack,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import { api } from '../services/api';
import type { User } from '../types';

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff',
    member_id: '',
  });
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
    loadMembers();
  }, [page]);

  const loadMembers = async () => {
    try {
      const response = await api.getMembers({ limit: 1000 });
      if (response.success && response.data) {
        setMembers(response.data.members);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUsers({ page, limit: 10 });
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'staff',
      member_id: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      member_id: user.memberId?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        loadUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        username: formData.username,
        password: formData.password || undefined,
        role: formData.role,
        member_id: formData.member_id ? parseInt(formData.member_id) : undefined,
      };

      if (editingUser) {
        await api.updateUser(editingUser.id, data);
      } else {
        if (!data.password) {
          alert('Password is required for new users');
          return;
        }
        await api.createUser({ ...data, password: data.password! });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      alert('Failed to save user');
    }
  };

  const headers = [
    { key: 'username', header: 'Username' },
    { key: 'role', header: 'Role' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = users.map((user) => ({
    id: user.id.toString(),
    username: user.username,
    role: user.role,
    member_id: user.memberId ? user.memberId.toString() : 'N/A',
    actions: user,
  }));

  return (
    <div className="users-page">
      <Stack gap={6}>
        <div className="page-header">
          <h1 className="cds--type-productive-heading-05">User Management</h1>
          <Button renderIcon={Add} onClick={handleAdd}>
            Add User
          </Button>
        </div>

      {isLoading ? (
        <div className="loading-container">
          <InlineLoading description="Loading users..." />
        </div>
      ) : (
        <>
          <DataTable rows={rows} headers={headers}>
            {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })} key={row.id}>
                      {row.cells.map((cell) => {
                        if (cell.info.header === 'actions') {
                          const user = cell.value as User;
                          return (
                            <TableCell key={cell.id}>
                              <Button
                                size="sm"
                                kind="ghost"
                                renderIcon={Edit}
                                iconDescription="Edit"
                                hasIconOnly
                                onClick={() => handleEdit(user)}
                              />
                              <Button
                                size="sm"
                                kind="danger"
                                renderIcon={TrashCan}
                                iconDescription="Delete"
                                hasIconOnly
                                onClick={() => handleDelete(user.id)}
                              />
                            </TableCell>
                          );
                        }
                        return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DataTable>

          <Pagination
            page={page}
            totalItems={totalPages * 10}
            pageSize={10}
            pageSizes={[10]}
            onChange={({ page: newPage }) => setPage(newPage)}
          />
        </>
      )}
      </Stack>

      <Modal
        open={isModalOpen}
        modalHeading={editingUser ? 'Edit User' : 'Add User'}
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSubmit}
      >
        <Stack gap={5} className="user-form">
          <TextInput
            id="username"
            labelText="Username *"
            placeholder="Enter username or email"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            disabled={(formData.role === 'student' || formData.role === 'faculty') && formData.member_id !== ''}
            helperText={(formData.role === 'student' || formData.role === 'faculty') && formData.member_id !== '' ? "Auto-filled from member email" : ""}
          />
          <TextInput
            id="password"
            type="password"
            labelText={editingUser ? 'Password (leave blank to keep current)' : 'Password *'}
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
          />
          <Select
            id="role"
            labelText="Role *"
            value={formData.role}
            onChange={(e) => {
              const newRole = e.target.value as any;
              setFormData({ ...formData, role: newRole, username: '', member_id: '' });
            }}
          >
            <SelectItem value="admin" text="Admin" />
            <SelectItem value="staff" text="Staff" />
            <SelectItem value="student" text="Student" />
            <SelectItem value="faculty" text="Faculty" />
          </Select>
          <Select
            id="member_id"
            labelText={`Member ${(formData.role === 'student' || formData.role === 'faculty') ? '*' : ''}`}
            value={formData.member_id}
            onChange={(e) => {
              const memberId = e.target.value;
              const member = members.find(m => m.id.toString() === memberId);
              let newUsername = formData.username;
              
              if ((formData.role === 'student' || formData.role === 'faculty') && member && member.email) {
                newUsername = member.email;
              }
              
              setFormData({ ...formData, member_id: memberId, username: newUsername });
            }}
            disabled={formData.role !== 'student' && formData.role !== 'faculty' && formData.role !== 'admin' && formData.role !== 'staff'}
          >
            <SelectItem value="" text="Select member (optional)" />
            {members.map((member) => (
              <SelectItem 
                key={member.id} 
                value={member.id.toString()} 
                text={`${member.name} (${member.email}) - ID: ${member.id}`} 
              />
            ))}
          </Select>
          <p className="form-note">
            Note: Student and Faculty users must have a member account. Username will be auto-filled with member's email.
          </p>
        </Stack>
      </Modal>
    </div>
  );
}

export default UsersPage;
