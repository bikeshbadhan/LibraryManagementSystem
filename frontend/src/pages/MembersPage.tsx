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
  Search,
  Modal,
  TextInput,
  Select,
  SelectItem,
  InlineLoading,
  Pagination,
  Tile,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/icons-react';
import { api } from '../services/api';
import type { Member, Transaction, Fine } from '../types';

interface MembersPageProps {
  memberId?: number;
  readOnly?: boolean;
}

function MembersPage({ memberId }: MembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberTransactions, setMemberTransactions] = useState<Transaction[]>([]);
  const [memberFines, setMemberFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    member_type: 'student',
    status: 'active',
  });

  useEffect(() => {
    if (memberId) {
      loadMemberDetails(memberId);
    } else {
      loadMembers();
    }
  }, [page, searchTerm, memberId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMembers({ search: searchTerm, page, limit: 10 });
      if (response.success && response.data) {
        setMembers(response.data.members);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMemberDetails = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.getMember(id);
      if (response.success && response.data) {
        setSelectedMember(response.data.member);
        setMemberTransactions(response.data.recentTransactions);
        setMemberFines(response.data.outstandingFines);
      }
    } catch (err) {
      console.error('Failed to load member details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      member_type: 'student',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      address: member.address || '',
      member_type: member.member_type,
      status: member.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await api.deleteMember(id);
        loadMembers();
      } catch (err) {
        alert('Failed to delete member');
      }
    }
  };

  const handleViewDetails = async (member: Member) => {
    await loadMemberDetails(member.id);
    setIsDetailsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        member_type: formData.member_type as 'student' | 'faculty' | 'public',
        status: formData.status as 'active' | 'inactive' | 'suspended',
      };
      
      if (editingMember) {
        await api.updateMember(editingMember.id, data);
      } else {
        await api.createMember(data);
      }
      setIsModalOpen(false);
      loadMembers();
    } catch (err) {
      alert('Failed to save member');
    }
  };

  if (memberId && selectedMember) {
    return (
      <div className="member-details-page">
        <h1 className="cds--type-productive-heading-05">My Account</h1>
        <Tile className="member-info-tile">
          <h2>Member Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Member ID:</strong> {selectedMember.id}
            </div>
            <div className="info-item">
              <strong>Name:</strong> {selectedMember.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {selectedMember.email}
            </div>
            <div className="info-item">
              <strong>Phone:</strong> {selectedMember.phone || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Member Type:</strong> {selectedMember.member_type}
            </div>
            <div className="info-item">
              <strong>Status:</strong> {selectedMember.status}
            </div>
          </div>
        </Tile>

        <h2 className="cds--type-productive-heading-03">Recent Transactions</h2>
        <DataTable
          rows={memberTransactions.map((t) => ({
            id: t.id.toString(),
            book: t.book_title,
            issue_date: new Date(t.issue_date).toLocaleDateString(),
            due_date: new Date(t.due_date).toLocaleDateString(),
            status: t.status,
          }))}
          headers={[
            { key: 'book', header: 'Book' },
            { key: 'issue_date', header: 'Issue Date' },
            { key: 'due_date', header: 'Due Date' },
            { key: 'status', header: 'Status' },
          ]}
        >
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
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DataTable>

        {memberFines.length > 0 && (
          <>
            <h2 className="cds--type-productive-heading-03">Outstanding Fines</h2>
            <DataTable
              rows={memberFines.map((f) => ({
                id: f.id.toString(),
                book: f.book_title,
                amount: `₹${f.amount.toFixed(2)}`,
                paid: `₹${f.paid_amount.toFixed(2)}`,
                remaining: `₹${(f.amount - f.paid_amount).toFixed(2)}`,
                status: f.status,
              }))}
              headers={[
                { key: 'book', header: 'Book' },
                { key: 'amount', header: 'Amount' },
                { key: 'paid', header: 'Paid' },
                { key: 'remaining', header: 'Remaining' },
                { key: 'status', header: 'Status' },
              ]}
            >
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
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </DataTable>
          </>
        )}
      </div>
    );
  }

  const headers = [
    { key: 'member_id', header: 'Member ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'member_type', header: 'Type' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = members.map((member) => ({
    id: member.id.toString(),
    member_id: member.id,
    name: member.name,
    email: member.email,
    member_type: member.member_type,
    status: member.status,
    actions: member,
  }));

  return (
    <div className="members-page">
      <div className="page-header">
        <h1 className="cds--type-productive-heading-05">Members Management</h1>
        <Button renderIcon={Add} onClick={handleAdd}>
          Add Member
        </Button>
      </div>

      <div className="search-bar">
        <Search
          labelText="Search members"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="loading-container">
          <InlineLoading description="Loading members..." />
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
                          const member = cell.value as Member;
                          return (
                            <TableCell key={cell.id}>
                              <Button
                                size="sm"
                                kind="ghost"
                                onClick={() => handleViewDetails(member)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                kind="ghost"
                                renderIcon={Edit}
                                iconDescription="Edit"
                                hasIconOnly
                                onClick={() => handleEdit(member)}
                              />
                              <Button
                                size="sm"
                                kind="danger"
                                renderIcon={TrashCan}
                                iconDescription="Delete"
                                hasIconOnly
                                onClick={() => handleDelete(member.id)}
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

      <Modal
        open={isModalOpen}
        modalHeading={editingMember ? 'Edit Member' : 'Add Member'}
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSubmit}
        size="lg"
      >
        <div className="member-form">
          <TextInput
            id="name"
            labelText="Name *"
            placeholder="Enter name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextInput
            id="email"
            labelText="Email *"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <TextInput
            id="phone"
            labelText="Phone"
            placeholder="Enter phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextInput
            id="address"
            labelText="Address"
            placeholder="Enter address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Select
            id="member_type"
            labelText="Member Type *"
            value={formData.member_type}
            onChange={(e) => setFormData({ ...formData, member_type: e.target.value as any })}
          >
            <SelectItem value="student" text="Student" />
            <SelectItem value="faculty" text="Faculty" />
            <SelectItem value="public" text="Public" />
          </Select>
          <Select
            id="status"
            labelText="Status *"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <SelectItem value="active" text="Active" />
            <SelectItem value="inactive" text="Inactive" />
            <SelectItem value="suspended" text="Suspended" />
          </Select>
        </div>
      </Modal>

      <Modal
        open={isDetailsModalOpen}
        modalHeading="Member Details"
        passiveModal
        onRequestClose={() => setIsDetailsModalOpen(false)}
        size="lg"
      >
        {selectedMember && (
          <div className="member-details">
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div><strong>Name:</strong> {selectedMember.name}</div>
                <div><strong>Email:</strong> {selectedMember.email}</div>
                <div><strong>Phone:</strong> {selectedMember.phone || 'N/A'}</div>
                <div><strong>Address:</strong> {selectedMember.address || 'N/A'}</div>
                <div><strong>Type:</strong> {selectedMember.member_type}</div>
                <div><strong>Status:</strong> {selectedMember.status}</div>
              </div>
            </div>

            <div className="info-section">
              <h3>Recent Transactions</h3>
              {memberTransactions.length > 0 ? (
                <ul>
                  {memberTransactions.map((t) => (
                    <li key={t.id}>
                      {t.book_title} - {t.status} (Due: {new Date(t.due_date).toLocaleDateString()})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent transactions</p>
              )}
            </div>

            <div className="info-section">
              <h3>Outstanding Fines</h3>
              {memberFines.length > 0 ? (
                <ul>
                  {memberFines.map((f) => (
                    <li key={f.id}>
                      {f.book_title} - ₹{(f.amount - f.paid_amount).toFixed(2)} ({f.status})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No outstanding fines</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MembersPage;
