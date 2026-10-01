import { useState, useEffect } from 'react';
import {
  Grid,
  Column,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
  InlineLoading,
  InlineNotification,
  Stack,
} from '@carbon/react';
import { Checkmark } from '@carbon/icons-react';
import { api } from '../services/api';
import type { Transaction } from '../types';

function OverdueBooksPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [overdueTransactions, setOverdueTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadOverdueTransactions();
  }, []);

  const loadOverdueTransactions = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.getOverdueTransactions();
      if (response.success && response.data) {
        setOverdueTransactions(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load overdue books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnBook = async (transactionId: number) => {
    try {
      setError('');
      setSuccess('');
      await api.returnBook(transactionId);
      setSuccess('Book returned successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadOverdueTransactions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to return book');
    }
  };

  const headers = [
    { key: 'book_title', header: 'Book Title' },
    { key: 'member_name', header: 'Member Name' },
    { key: 'issue_date', header: 'Issue Date' },
    { key: 'due_date', header: 'Due Date' },
    { key: 'days_overdue', header: 'Days Overdue' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = overdueTransactions.map((transaction) => ({
    id: transaction.id.toString(),
    book_title: transaction.book_title,
    member_name: transaction.member_name,
    issue_date: new Date(transaction.issue_date).toLocaleDateString(),
    due_date: new Date(transaction.due_date).toLocaleDateString(),
    days_overdue: Math.floor(
      (new Date().getTime() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24)
    ),
    actions: transaction.id,
  }));

  if (isLoading) {
    return (
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <Stack gap={5}>
            <h1 className="cds--type-productive-heading-05">Overdue Books</h1>
            <InlineLoading description="Loading overdue books..." />
          </Stack>
        </Column>
      </Grid>
    );
  }

  return (
    <Grid fullWidth>
      <Column lg={16} md={8} sm={4}>
        <Stack gap={5}>
          <h1 className="cds--type-productive-heading-05">Overdue Books</h1>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError('')}
              lowContrast
            />
          )}

          {success && (
            <InlineNotification
              kind="success"
              title="Success"
              subtitle={success}
              onCloseButtonClick={() => setSuccess('')}
              lowContrast
            />
          )}

          {overdueTransactions.length === 0 ? (
            <div style={{ padding: 'var(--cds-spacing-07)', textAlign: 'center' }}>
              <p className="cds--type-body-compact-01">No Book is currently Overdue</p>
            </div>
          ) : (
            <DataTable rows={rows} headers={headers}>
              {({ rows, headers, getTableProps, getHeaderProps, getRowProps }: any) => (
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header: any) => (
                        <TableHeader {...getHeaderProps({ header })} key={header.key}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row: any) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell: any) => {
                          if (cell.info.header === 'actions') {
                            return (
                              <TableCell key={cell.id}>
                                <Button
                                  kind="primary"
                                  size="sm"
                                  renderIcon={Checkmark}
                                  onClick={() => handleReturnBook(cell.value)}
                                >
                                  Return
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
        </Stack>
      </Column>
    </Grid>
  );
}

export default OverdueBooksPage;
