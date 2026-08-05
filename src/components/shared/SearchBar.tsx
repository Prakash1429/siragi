'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search poems...', initialValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative w-full">
        <Search className="absolute top-1/2 left-4 w-5 h-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 pl-11 pr-24 rounded-2xl bg-secondary/40 border border-border/50 text-sm focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/45 transition-all text-foreground"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-2 h-8 px-4 -translate-y-1/2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold rounded-xl transition-all"
        >
          Search
        </button>
      </div>
    </form>
  );
}
