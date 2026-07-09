import { useState, useEffect } from 'react';
import { localDB } from '../db/localDB';
import type { ReadingBook } from '../types';
import { DEFAULT_BOOKS } from '../utils/helpers';
import { Check, Search, Trophy, BookMarked, Bookmark } from 'lucide-react';

interface ReadingLibraryProps {
  onSelectBook?: (title: string) => void;
  selectedBookTitle?: string;
}

export const ReadingLibrary: React.FC<ReadingLibraryProps> = ({ onSelectBook, selectedBookTitle }) => {
  const [books, setBooks] = useState<ReadingBook[]>([]);
  const [search, setSearch] = useState('');

  // Load books
  useEffect(() => {
    async function loadBooks() {
      const stored = await localDB.getConfig<ReadingBook[]>('reading_books');
      if (stored && stored.length > 0) {
        setBooks(stored);
      } else {
        setBooks(DEFAULT_BOOKS);
        await localDB.saveConfig('reading_books', DEFAULT_BOOKS);
      }
    }
    loadBooks();
  }, []);

  const handleToggleRead = async (index: number) => {
    const updated = [...books];
    updated[index].isRead = !updated[index].isRead;
    setBooks(updated);
    await localDB.saveConfig('reading_books', updated);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const readCount = books.filter(b => b.isRead).length;
  const progressPercent = books.length > 0 ? Math.round((readCount / books.length) * 100) : 0;

  return (
    <div className="card glass-card reading-library">
      <div className="card-header flex-column md-flex-row md-justify-between">
        <div className="card-title-icon">
          <BookMarked className="icon-blue" size={20} />
          <h3>Biblioteca do Rubicão</h3>
        </div>
        <div className="progress-container flex items-center gap-2">
          <Trophy className="icon-gold" size={16} />
          <span className="text-sm font-medium">{readCount} / {books.length} lidos ({progressPercent}%)</span>
          <div className="progress-bar-bg w-24 h-2 bg-dark rounded-full overflow-hidden">
            <div className="progress-bar-fg h-full bg-blue transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="search-bar-wrapper">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por título ou autor..." 
            className="form-input search-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="books-list-container">
          {filteredBooks.length === 0 ? (
            <div className="no-results py-8 text-center text-muted">
              Nenhum livro encontrado para "{search}"
            </div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map((book, idx) => {
                const globalIdx = books.findIndex(b => b.title === book.title);
                const isSelected = selectedBookTitle === book.title;

                return (
                  <div key={idx} className={`book-item-card ${book.isRead ? 'read' : ''} ${isSelected ? 'selected' : ''}`}>
                    <div className="book-info">
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-author">{book.author}</p>
                    </div>

                    <div className="book-actions">
                      {onSelectBook && (
                        <button
                          type="button"
                          onClick={() => onSelectBook(book.title)}
                          className={`btn-icon ${isSelected ? 'btn-icon-blue' : 'btn-icon-muted'}`}
                          title={isSelected ? "Livro selecionado para hoje" : "Selecionar para leitura de hoje"}
                        >
                          <Bookmark size={16} fill={isSelected ? "currentColor" : "none"} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleRead(globalIdx)}
                        className={`btn-icon-checkbox ${book.isRead ? 'checked' : ''}`}
                        title={book.isRead ? "Marcar como não lido" : "Marcar como lido"}
                      >
                        {book.isRead && <Check size={12} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ReadingLibrary;
