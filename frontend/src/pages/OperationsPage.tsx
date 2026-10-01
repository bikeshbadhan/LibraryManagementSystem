import { useState, useEffect } from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
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
  InlineLoading,
  ComboBox,
} from '@carbon/react';
import { api } from '../services/api';
import type { Transaction, Fine, Book, Member } from '../types';

function OperationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [issueDays, setIssueDays] = useState(14);

  const [overdueTransactions, setOverdueTransactions] = useState<Transaction[]>([]);

  const [fines, setFines] = useState<Fine[]>([]);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    loadTransactions();
    loadOverdueTransactions();
    loadFines();
    loadBooksAndMembers();
  }, []);

  const loadBooksAndMembers = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([
        api.getBooks({ limit: 100 }),
        api.getMembers({ limit: 100 }),
      ]);
      if (booksRes.success && booksRes.data) {
        setBooks(booksRes.data.books.filter(b => b.available_copies > 0));
      }
      if (membersRes.success && membersRes.data) {
        setMembers(membersRes.data.members.filter(m => m.status === 'active'));
      }
    } catch (err) {
      console.error('Failed to load books/members:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTransactions({ status: 'issued', limit: 50 });
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOverdueTransactions = async () => {
    try {
      const response = await api.getOverdueTransactions();
      if (response.success && response.data) {
        setOverdueTransactions(response.data);
      }
    } catch (err) {
      console.error('Failed to load overdue transactions:', err);
    }
  };

  const loadFines = async () => {
    try {
      const response = await api.getFines({ limit: 50 });
      if (response.success && response.data) {
        setFines(response.data.fines);
      }
    } catch (err) {
      console.error('Failed to load fines:', err);
    }
  };

  const handleIssueBook = async () => {
    if (!selectedBook || !selectedMember) {
      alert('Please select both a book and a member');
      return;
    }

    try {
      await api.issueBook(selectedBook.id, selectedMember.id, issueDays);
      setIsIssueModalOpen(false);
      setSelectedBook(null);
      setSelectedMember(null);
      loadTransactions();
      loadBooksAndMembers();
    } catch (err) {
      alert('Failed to issue book');
    }
  };

  const handleReturnBook = async (transactionId: number) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      try {
        const response = await api.returnBook(transactionId);
        if (response.success && response.data) {
          if (response.data.fine > 0) {
            alert(`Book returned successfully. Fine: ₹${response.data.fine.toFixed(2)}`);
          } else {
            alert('Book returned successfully');
          }
          loadTransactions();
          loadOverdueTransactions();
          loadFines();
          loadBooksAndMembers();
        }
      } catch (err) {
        alert('Failed to return book');
      }
    }
  };

  const handleCollectFine = async () => {
    if (!selectedFine || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      await api.collectFine(selectedFine.id, paymentAmount);
      setIsCollectModalOpen(false);
      setSelectedFine(null);
      setPaymentAmount(0);
      loadFines();
    } catch (err) {
      alert('Failed to collect fine');
    }
  };

  const openCollectModal = (fine: Fine) => {
    setSelectedFine(fine);
    setPaymentAmount(fine.amount - fine.paid_amount);
    setIsCollectModalOpen(true);
  };

  return (
    <div className="operations-page">
      <h1 className="cds--type-productive-heading-05">Operations</h1>

      <Tabs selectedIndex={activeTab} onChange={({ selectedIndex }) => setActiveTab(selectedIndex)}>
        <TabList aria-label="Operations tabs">
          <Tab>Issue Books</Tab>
          <Tab>Receive Books</Tab>
          <Tab>Fines</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="tab-content">
              <div className="tab-header">
                <h2>Issue Books to Members</h2>
                <Button onClick={() => setIsIssueModalOpen(true)}>
                  Issue Book
                </Button>
              </div>

              {isLoading ? (
                <InlineLoading description="Loading active loans..." />
              ) : (
                <DataTable
                  rows={transactions.map((t) => ({
                    id: t.id.toString(),
                    book: t.book_title,
                    member: t.member_name,
                    issue_date: new Date(t.issue_date).toLocaleDateString(),
                    due_date: new Date(t.due_date).toLocaleDateString(),
                  }))}
                  headers={[
                    { key: 'book', header: 'Book' },
                    { key: 'member', header: 'Member' },
                    { key: 'issue_date', header: 'Issue Date' },
                    { key: 'due_date', header: 'Due Date' },
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
              )}
            </div>
          </TabPanel>

          <TabPanel>
            <div className="tab-content">
              <h2>Receive Books (Check-in)</h2>
              <p className="tab-description">Return books that were issued to members. Enter the Book ID to check in.</p>
              
              {isLoading ? (
                <InlineLoading description="Loading transactions..." />
              ) : (
                <DataTable
                  rows={transactions.map((t) => ({
                    id: t.id.toString(),
                    book_id: t.book_id,
                    book: t.book_title,
                    member: t.member_name,
                    issue_date: new Date(t.issue_date).toLocaleDateString(),
                    due_date: new Date(t.due_date).toLocaleDateString(),
                    actions: t,
                  }))}
                  headers={[
                    { key: 'book_id', header: 'Book ID' },
                    { key: 'book', header: 'Book Title' },
                    { key: 'member', header: 'Member' },
                    { key: 'issue_date', header: 'Issue Date' },
                    { key: 'due_date', header: 'Due Date' },
                    { key: 'actions', header: 'Actions' },
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
                            {row.cells.map((cell) => {
                              if (cell.info.header === 'actions') {
                                const transaction = cell.value as Transaction;
                                return (
                                  <TableCell key={cell.id}>
                                    <Button
                                      size="sm"
                                      onClick={() => handleReturnBook(transaction.id)}
                                    >
                                      Check In
                                    </Button>
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
              )}
              
              <div className="overdue-section">
                <h3>Overdue Books</h3>
                <DataTable
                  rows={overdueTransactions.map((t) => {
                    const dueDate = new Date(t.due_date);
                    const today = new Date();
                    const diffTime = today.getTime() - dueDate.getTime();
                    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    return {
                      id: t.id.toString(),
                      book_id: t.book_id,
                      book: t.book_title,
                      member: t.member_name,
                      email: t.member_email,
                      due_date: dueDate.toLocaleDateString(),
                      days_overdue: daysOverdue,
                    };
                  })}
                  headers={[
                    { key: 'book_id', header: 'Book ID' },
                    { key: 'book', header: 'Book' },
                    { key: 'member', header: 'Member' },
                    { key: 'email', header: 'Email' },
                    { key: 'due_date', header: 'Due Date' },
                    { key: 'days_overdue', header: 'Days Overdue' },
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
              </div>
            </div>
          </TabPanel>

          <TabPanel>
            <div className="tab-content">
              <h2>Fine Collection and Management</h2>
              <DataTable
                rows={fines.map((f) => ({
                  id: f.id.toString(),
                  book: f.book_title,
                  member: f.member_name,
                  amount: `₹${f.amount.toFixed(2)}`,
                  paid: `₹${f.paid_amount.toFixed(2)}`,
                  remaining: `₹${(f.amount - f.paid_amount).toFixed(2)}`,
                  status: f.status,
                  actions: f,
                }))}
                headers={[
                  { key: 'book', header: 'Book' },
                  { key: 'member', header: 'Member' },
                  { key: 'amount', header: 'Total Amount' },
                  { key: 'paid', header: 'Paid' },
                  { key: 'remaining', header: 'Remaining' },
                  { key: 'status', header: 'Status' },
                  { key: 'actions', header: 'Actions' },
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
                          {row.cells.map((cell) => {
                            if (cell.info.header === 'actions') {
                              const fine = cell.value as Fine;
                              return (
                                <TableCell key={cell.id}>
                                  {fine.status !== 'paid' && (
                                    <Button
                                      size="sm"
                                      onClick={() => openCollectModal(fine)}
                                    >
                                      Collect Fine
                                    </Button>
                                  )}
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
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal
        open={isIssueModalOpen}
        modalHeading="Issue Book"
        primaryButtonText="Issue"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsIssueModalOpen(false)}
        onRequestSubmit={handleIssueBook}
      >
        <div className="issue-form">
          <ComboBox
            id="book-select"
            titleText="Select Book"
            placeholder="Search for a book"
            items={books}
            itemToString={(item) => (item ? `${item.title} by ${item.author} (${item.available_copies} available)` : '')}
            onChange={({ selectedItem }) => setSelectedBook(selectedItem || null)}
          />
          <ComboBox
            id="member-select"
            titleText="Select Member"
            placeholder="Search for a member"
            items={members}
            itemToString={(item) => (item ? `${item.name} (${item.email})` : '')}
            onChange={({ selectedItem }) => setSelectedMember(selectedItem || null)}
          />
          <TextInput
            id="issue-days"
            labelText="Loan Period (days)"
            type="number"
            value={issueDays.toString()}
            onChange={(e) => setIssueDays(parseInt(e.target.value) || 14)}
          />
        </div>
      </Modal>

      <Modal
        open={isCollectModalOpen}
        modalHeading="Collect Fine"
        primaryButtonText="Collect"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsCollectModalOpen(false)}
        onRequestSubmit={handleCollectFine}
      >
        {selectedFine && (
          <div className="collect-form">
            <p><strong>Book:</strong> {selectedFine.book_title}</p>
            <p><strong>Member:</strong> {selectedFine.member_name}</p>
            <p><strong>Total Fine:</strong> ₹{selectedFine.amount.toFixed(2)}</p>
            <p><strong>Already Paid:</strong> ₹{selectedFine.paid_amount.toFixed(2)}</p>
            <p><strong>Remaining:</strong> ₹{(selectedFine.amount - selectedFine.paid_amount).toFixed(2)}</p>
            <TextInput
              id="payment-amount"
              labelText="Payment Amount"
              type="number"
              value={paymentAmount.toString()}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default OperationsPage;
