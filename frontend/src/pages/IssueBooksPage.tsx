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
  InlineLoading,
  ComboBox,
} from '@carbon/react';
import { api } from '../services/api';
import type { Transaction, Book, Member } from '../types';

function IssueBooksPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [issueDays, setIssueDays] = useState(14);

  useEffect(() => {
    loadTransactions();
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

  return (
    <div className="issue-books-page">
      <div className="page-header">
        <h1 className="cds--type-productive-heading-05">Issue Books</h1>
        <Button onClick={() => setIsIssueModalOpen(true)}>
          Issue New Book
        </Button>
      </div>

      <p className="cds--type-body-compact-01 cds--text-secondary">
        Issue books to library members. View all currently issued books below.
      </p>

      {isLoading ? (
        <InlineLoading description="Loading active loans..." />
      ) : (
        <DataTable
          rows={transactions.map((t) => ({
            id: t.id.toString(),
            book_id: t.book_id,
            book: t.book_title,
            member: t.member_name,
            issue_date: new Date(t.issue_date).toLocaleDateString(),
            due_date: new Date(t.due_date).toLocaleDateString(),
          }))}
          headers={[
            { key: 'book_id', header: 'Book ID' },
            { key: 'book', header: 'Book Title' },
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

      <Modal
        open={isIssueModalOpen}
        modalHeading="Issue Book to Member"
        primaryButtonText="Issue Book"
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
            itemToString={(item) => (item ? `[${item.id}] ${item.title} by ${item.author} (${item.available_copies} available)` : '')}
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
    </div>
  );
}

export default IssueBooksPage;
