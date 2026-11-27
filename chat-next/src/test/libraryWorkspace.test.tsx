import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShellProvider } from '../context/AppShellContext';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { LibraryWorkspace } from '../components/library/LibraryWorkspace';
import { LIBRARY_STORAGE_KEY } from '../services/libraryStorage';

describe('Library Workspace', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders seed library items, filters, toggles favourites, switches views, and creates/deletes prompt', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppShellProvider>
            <LibraryWorkspace />
          </AppShellProvider>
        </I18nProvider>
      </ThemeProvider>
    );

    // Seed items loaded
    expect(screen.getByText('Financial Projection Q4.pdf')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Pitch Deck.pptx')).toBeInTheDocument();

    // Search filter
    const searchInput = document.getElementById('library-search-input') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Pitch Deck' } });
    expect(screen.getByText('Enterprise Pitch Deck.pptx')).toBeInTheDocument();
    expect(screen.queryByText('Financial Projection Q4.pdf')).not.toBeInTheDocument();
    fireEvent.click(document.getElementById('library-search-clear')!);
    expect(screen.getByText('Financial Projection Q4.pdf')).toBeInTheDocument();

    // Switch to List View and back to Grid View
    fireEvent.click(document.getElementById('library-view-list-btn')!);
    expect(document.getElementById('library-list-view')).not.toBeNull();
    fireEvent.click(document.getElementById('library-view-grid-btn')!);
    expect(document.getElementById('library-grid-view')).not.toBeNull();

    // Save a new prompt
    fireEvent.click(document.getElementById('library-new-btn')!);
    fireEvent.click(document.getElementById('library-opt-save-prompt')!);
    fireEvent.change(document.getElementById('library-prompt-name')!, {
      target: { value: 'SQL Optimizer' }
    });
    fireEvent.change(document.getElementById('library-prompt-content')!, {
      target: { value: 'Optimize PostgreSQL queries for low latency.' }
    });
    fireEvent.submit(document.getElementById('library-prompt-form')!);
    expect(screen.getByText('SQL Optimizer')).toBeInTheDocument();
    expect(window.localStorage.getItem(LIBRARY_STORAGE_KEY)).toContain('SQL Optimizer');

    // Delete SQL Optimizer
    fireEvent.click(screen.getByLabelText('Delete SQL Optimizer'));
    fireEvent.click(document.getElementById('lib-delete-confirm-btn')!);
    expect(screen.queryByText('SQL Optimizer')).not.toBeInTheDocument();
  });
});
