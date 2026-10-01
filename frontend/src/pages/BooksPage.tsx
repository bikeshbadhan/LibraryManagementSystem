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
  InlineLoading,
  Pagination,
} from '@carbon/react';
import { Add, Edit, TrashCan, View } from '@carbon/icons-react';
import { api } from '../services/api';
import type { Book } from '../types';

interface BooksPageProps {
  readOnly?: boolean;
}

function BooksPage({ readOnly = false }: BooksPageProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isbnFetched, setIsbnFetched] = useState(false);
  const [isFetchingIsbn, setIsFetchingIsbn] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    title: '',
    author: '',
    publisher: '',
    publication_year: '',
    category: '',
    location: '',
    total_copies: 1,
    description: '',
  });

  useEffect(() => {
    loadBooks();
  }, [page, searchTerm]);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const response = await api.getBooks({ search: searchTerm, page, limit: 10 });
      if (response.success && response.data) {
        setBooks(response.data.books);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (book: Book) => {
    setViewingBook(book);
    setIsViewModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBook(null);
    setIsbnFetched(false);
    setFormData({
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      publication_year: '',
      category: '',
      location: '',
      total_copies: 1,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleFetchIsbn = async () => {
    if (!formData.isbn || formData.isbn.trim() === '') {
      alert('Please enter an ISBN first');
      return;
    }

    try {
      setIsFetchingIsbn(true);
      const response = await api.lookupISBN(formData.isbn);
      if (response.success && response.data) {
        const bookData = response.data;
        setFormData({
          ...formData,
          title: bookData.title || formData.title,
          author: bookData.author || formData.author,
          publisher: bookData.publisher || formData.publisher,
          publication_year: bookData.publication_year?.toString() || formData.publication_year,
          description: bookData.description || formData.description,
        });
        setIsbnFetched(true);
      } else {
        alert('Could not fetch book data from ISBN. Please enter details manually.');
      }
    } catch (err) {
      alert('Failed to fetch ISBN data. Please enter details manually.');
    } finally {
      setIsFetchingIsbn(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      isbn: book.isbn || '',
      title: book.title,
      author: book.author,
      publisher: book.publisher || '',
      publication_year: book.publication_year?.toString() || '',
      category: book.category || '',
      location: book.location,
      total_copies: book.total_copies,
      description: book.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.deleteBook(id);
        loadBooks();
      } catch (err) {
        alert('Failed to delete book');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : undefined,
      };

      if (editingBook) {
        await api.updateBook(editingBook.id, data);
      } else {
        await api.createBook(data);
      }
      setIsModalOpen(false);
      loadBooks();
    } catch (err) {
      alert('Failed to save book');
    }
  };

  const headers = [
    { key: 'book_id', header: 'Book ID' },
    { key: 'isbn', header: 'ISBN' },
    { key: 'title', header: 'Title' },
    { key: 'author', header: 'Author' },
    { key: 'location', header: 'Location' },
    { key: 'available_copies', header: 'Available/Total' },
    ...(readOnly ? [] : [{ key: 'actions', header: 'Actions' }]),
  ];

  const rows = books.map((book) => ({
    id: book.id.toString(),
    book_id: book.id,
    isbn: book.isbn || 'N/A',
    title: book.title,
    author: book.author,
    location: book.location,
    available_copies: `${book.available_copies}/${book.total_copies}`,
    actions: book,
  }));

  return (
    <div className="books-page">
      <div className="page-header">
        <h1 className="cds--type-productive-heading-05">{readOnly ? 'Book Catalog' : 'Books Management'}</h1>
        {!readOnly && (
          <Button renderIcon={Add} onClick={handleAdd}>
            Add Book
          </Button>
        )}
      </div>

      <div className="search-bar">
        <Search
          labelText="Search books"
          placeholder="Search by title, author, or ISBN"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className="loading-container">
          <InlineLoading description="Loading books..." />
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
                        if (cell.info.header === 'actions' && !readOnly) {
                          const book = cell.value as Book;
                          return (
                            <TableCell key={cell.id}>
                              <Button
                                size="sm"
                                kind="ghost"
                                renderIcon={View}
                                iconDescription="View"
                                hasIconOnly
                                onClick={() => handleView(book)}
                              />
                              <Button
                                size="sm"
                                kind="ghost"
                                renderIcon={Edit}
                                iconDescription="Edit"
                                hasIconOnly
                                onClick={() => handleEdit(book)}
                              />
                              <Button
                                size="sm"
                                kind="danger"
                                renderIcon={TrashCan}
                                iconDescription="Delete"
                                hasIconOnly
                                onClick={() => handleDelete(book.id)}
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
        modalHeading={editingBook ? 'Edit Book' : 'Add Book'}
        primaryButtonText="Save"
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSubmit}
        size="lg"
      >
        <div className="book-form">
          {editingBook && (
            <TextInput
              id="book_id"
              labelText="Book ID"
              value={editingBook.id.toString()}
              disabled
              readOnly
            />
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <TextInput
                id="isbn"
                labelText="ISBN"
                placeholder="Enter ISBN"
                value={formData.isbn}
                onChange={(e) => {
                  setFormData({ ...formData, isbn: e.target.value });
                  setIsbnFetched(false);
                }}
              />
            </div>
            <Button 
              onClick={handleFetchIsbn} 
              disabled={!formData.isbn || isFetchingIsbn}
              style={{ marginBottom: '1rem' }}
            >
              {isFetchingIsbn ? 'Fetching...' : 'Fetch Details'}
            </Button>
          </div>
          <TextInput
            id="title"
            labelText="Title *"
            placeholder="Enter title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={isbnFetched}
            required
          />
          <TextInput
            id="author"
            labelText="Author *"
            placeholder="Enter author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            disabled={isbnFetched}
            required
          />
          <TextInput
            id="publisher"
            labelText="Publisher"
            placeholder="Enter publisher"
            value={formData.publisher}
            onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            disabled={isbnFetched}
          />
          <TextInput
            id="publication_year"
            labelText="Publication Year"
            placeholder="Enter publication year"
            value={formData.publication_year}
            onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
            disabled={isbnFetched}
          />
          <TextInput
            id="category"
            labelText="Category"
            placeholder="Enter category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <TextInput
            id="location"
            labelText="Location *"
            placeholder="Enter location (e.g., A-101)"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
          <TextInput
            id="total_copies"
            labelText="Total Copies *"
            type="number"
            placeholder="Enter total copies"
            value={formData.total_copies.toString()}
            onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) || 1 })}
            required
          />
          <TextInput
            id="description"
            labelText="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </Modal>

      <Modal
        open={isViewModalOpen}
        modalHeading="Book Details"
        passiveModal
        onRequestClose={() => setIsViewModalOpen(false)}
        size="lg"
      >
        {viewingBook && (
          <div className="book-details">
            <div className="detail-row">
              <strong>Book ID:</strong> <span>{viewingBook.id}</span>
            </div>
            <div className="detail-row">
              <strong>ISBN:</strong> <span>{viewingBook.isbn || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>Title:</strong> <span>{viewingBook.title}</span>
            </div>
            <div className="detail-row">
              <strong>Author:</strong> <span>{viewingBook.author}</span>
            </div>
            <div className="detail-row">
              <strong>Publisher:</strong> <span>{viewingBook.publisher || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>Publication Year:</strong> <span>{viewingBook.publication_year || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>Category:</strong> <span>{viewingBook.category || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <strong>Location:</strong> <span>{viewingBook.location}</span>
            </div>
            <div className="detail-row">
              <strong>Total Copies:</strong> <span>{viewingBook.total_copies}</span>
            </div>
            <div className="detail-row">
              <strong>Available Copies:</strong> <span>{viewingBook.available_copies}</span>
            </div>
            {viewingBook.description && (
              <div className="detail-row">
                <strong>Description:</strong> <span>{viewingBook.description}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default BooksPage;
