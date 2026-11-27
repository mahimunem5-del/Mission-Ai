import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShellProvider } from '../context/AppShellContext';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { SlidesWorkspace } from '../components/slides/SlidesWorkspace';
import { buildDemoDeck, SLIDES_TEMPLATES } from '../services/slidesService';

describe('Slides Studio Service & Workspace', () => {
  it('builds a deck matching requested slide count and prompt', () => {
    const deck4 = buildDemoDeck('AI Platform Roadmap', 'Presentation', 'Professional', '4');
    expect(deck4).toHaveLength(4);
    expect(deck4[0].type).toBe('cover');
    expect(deck4[0].title).toContain('AI Platform Roadmap');

    const deckAuto = buildDemoDeck('Short Topic', 'Auto', 'Casual', 'Auto');
    expect(deckAuto).toHaveLength(6);
  });

  it('renders SlidesWorkspace, filters templates, and opens preview modal', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppShellProvider>
            <SlidesWorkspace />
          </AppShellProvider>
        </I18nProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('What presentation do you need?')).toBeInTheDocument();
    const generateBtn = document.getElementById('slides-generate-btn') as HTMLButtonElement;
    expect(generateBtn.disabled).toBe(true);

    // Search templates
    const searchInput = document.getElementById('slides-template-search') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Pitch Deck' } });
    expect(screen.getByText('Pitch Deck')).toBeInTheDocument();
    expect(screen.queryByText('Company Introduction')).not.toBeInTheDocument();

    // Open template preview modal and apply template
    fireEvent.click(screen.getByText('Pitch Deck'));
    expect(document.getElementById('slides-template-modal')).not.toBeNull();
    fireEvent.click(document.getElementById('slides-modal-use-btn')!);

    // Prompt is now populated and generate button is enabled
    const promptInput = document.getElementById('slides-prompt-input') as HTMLTextAreaElement;
    expect(promptInput.value).toContain('Series A Investor Pitch Deck');
    expect(generateBtn.disabled).toBe(false);
    expect(SLIDES_TEMPLATES.length).toBe(12);
  });
});
