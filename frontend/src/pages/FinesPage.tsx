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
} from '@carbon/react';
import { api } from '../services/api';
import type { Fine } from '../types';

function FinesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [fines, setFines] = useState<Fine[]>([]);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    try {
      setIsLoading(true);
      const response = await api.getFines({ limit: 50 });
      if (response.success && response.data) {
        setFines(response.data.fines);
      }
    } catch (err) {
      console.error('Failed to load fines:', err);
    } finally {
      setIsLoading(false);
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
      alert('Fine collected successfully');
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
    <div className="fines-page">
      <h1 className="cds--type-productive-heading-05">Fine Collection and Management</h1>
      <p className="cds--type-body-compact-01 cds--text-secondary">
        Manage and collect fines for overdue books. Track payment status and outstanding amounts.
      </p>

      {isLoading ? (
        <InlineLoading description="Loading fines..." />
      ) : (
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
      )}

      <Modal
        open={isCollectModalOpen}
        modalHeading="Collect Fine Payment"
        primaryButtonText="Collect Payment"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsCollectModalOpen(false)}
        onRequestSubmit={handleCollectFine}
      >
        {selectedFine && (
          <div className="collect-form">
            <p className="cds--type-body-compact-01 cds--text-secondary" style={{ margin: 'var(--cds-spacing-02) 0' }}><strong className="cds--text-primary" style={{ fontWeight: 600 }}>Book:</strong> {selectedFine.book_title}</p>
            <p className="cds--type-body-compact-01 cds--text-secondary" style={{ margin: 'var(--cds-spacing-02) 0' }}><strong className="cds--text-primary" style={{ fontWeight: 600 }}>Member:</strong> {selectedFine.member_name}</p>
            <p className="cds--type-body-compact-01 cds--text-secondary" style={{ margin: 'var(--cds-spacing-02) 0' }}><strong className="cds--text-primary" style={{ fontWeight: 600 }}>Total Fine:</strong> ₹{selectedFine.amount.toFixed(2)}</p>
            <p className="cds--type-body-compact-01 cds--text-secondary" style={{ margin: 'var(--cds-spacing-02) 0' }}><strong className="cds--text-primary" style={{ fontWeight: 600 }}>Already Paid:</strong> ₹{selectedFine.paid_amount.toFixed(2)}</p>
            <p className="cds--type-body-compact-01 cds--text-secondary" style={{ margin: 'var(--cds-spacing-02) 0' }}><strong className="cds--text-primary" style={{ fontWeight: 600 }}>Remaining:</strong> ₹{(selectedFine.amount - selectedFine.paid_amount).toFixed(2)}</p>
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

export default FinesPage;
