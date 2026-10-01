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
  InlineLoading,
} from '@carbon/react';
import { api } from '../services/api';
import type { Transaction } from '../types';

function ReceiveBooksPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

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

  const handleReturnBook = async (transactionId: number) => {
    if (window.confirm('Are you sure you want to check in this book?')) {
      try {
        const response = await api.returnBook(transactionId);
        if (response.success && response.data) {
          if (response.data.fine > 0) {
            alert(`Book returned successfully. Fine generated: ₹${response.data.fine.toFixed(2)}`);
          } else {
            alert('Book returned successfully');
          }
          loadTransactions();
        }
      } catch (err) {
        alert('Failed to return book');
      }
    }
  };

  return (
    <div className="receive-books-page">
      <h1 className="cds--type-productive-heading-05">Receive Books (Check-in)</h1>
      <p className="cds--type-body-compact-01 cds--text-secondary">
        Check in books that were issued to members. Use the Book ID to quickly find and return a book.
      </p>

      {isLoading ? (
        <InlineLoading description="Loading transactions..." />
      ) : (
        <>
          <div className="section">
            <h2 className="cds--type-productive-heading-03">Currently Issued Books</h2>
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
          </div>
        </>
      )}
    </div>
  );
}

export default ReceiveBooksPage;
