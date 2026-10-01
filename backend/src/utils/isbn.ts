// ISBN lookup utility using Open Library API
export interface ISBNBookData {
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  description?: string;
  cover_image?: string;
}

interface OpenLibraryAuthor {
  name: string;
}

interface OpenLibraryPublisher {
  name: string;
}

interface OpenLibraryCover {
  small?: string;
  medium?: string;
  large?: string;
}

interface OpenLibraryBook {
  title?: string;
  authors?: OpenLibraryAuthor[];
  publishers?: OpenLibraryPublisher[];
  publish_date?: string;
  notes?: string;
  subtitle?: string;
  cover?: OpenLibraryCover;
}

interface OpenLibraryResponse {
  [key: string]: OpenLibraryBook;
}

export async function lookupISBN(isbn: string): Promise<ISBNBookData | null> {
  try {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    // Use Open Library Search API as per requirements
    const response = await fetch(
      `https://openlibrary.org/search.json?isbn=${encodeURIComponent(cleanISBN)}&limit=1`,
      {
        headers: {
          'User-Agent': 'LibraryManagementSystem/1.0'
        }
      }
    );
    
    if (!response.ok) {
      console.error(`ISBN lookup failed with status: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as any;
    
    if (!data.docs || data.docs.length === 0) {
      console.log('No books found for ISBN:', cleanISBN);
      return null;
    }
    
    const book = data.docs[0];
    
    // Extract publication year from various possible fields
    let pubYear = book.first_publish_year;
    if (!pubYear && book.publish_year && book.publish_year.length > 0) {
      pubYear = book.publish_year[0];
    }
    if (!pubYear && book.publish_date && book.publish_date.length > 0) {
      const yearMatch = book.publish_date[0].match(/\d{4}/);
      if (yearMatch) {
        pubYear = parseInt(yearMatch[0]);
      }
    }
    
    return {
      title: book.title || '',
      author: (book.author_name && book.author_name.length > 0) ? book.author_name[0] : 'Unknown',
      publisher: (book.publisher && book.publisher.length > 0) ? book.publisher[0] : undefined,
      publication_year: pubYear,
      description: book.subtitle || book.first_sentence?.[0],
      cover_image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : undefined
    };
  } catch (error) {
    console.error('ISBN lookup error:', error);
    return null;
  }
}
