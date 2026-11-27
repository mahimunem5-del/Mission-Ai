import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShellProvider } from '../context/AppShellContext';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { ProjectsWorkspace } from '../components/projects/ProjectsWorkspace';
import { PROJECTS_STORAGE_KEY } from '../services/projectsStorage';

describe('Projects Workspace', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders seed projects, creates a new project, opens detail view, pins, and deletes', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AppShellProvider>
            <ProjectsWorkspace />
          </AppShellProvider>
        </I18nProvider>
      </ThemeProvider>
    );

    // Seed projects loaded
    expect(screen.getByText('Mahi Testing')).toBeInTheDocument();
    expect(document.getElementById('projects-count-badge')?.textContent).toBe('2');

    // Create a new project
    fireEvent.click(document.getElementById('btn-create-project-header')!);
    const nameInput = document.getElementById('project-modal-name') as HTMLInputElement;
    const instrInput = document.getElementById('project-modal-instructions') as HTMLTextAreaElement;
    fireEvent.change(nameInput, { target: { value: 'Alpha Launch' } });
    fireEvent.change(instrInput, { target: { value: 'Be concise and technical.' } });
    fireEvent.submit(document.getElementById('project-create-form')!);

    expect(screen.getByText('Alpha Launch')).toBeInTheDocument();
    expect(document.getElementById('projects-count-badge')?.textContent).toBe('3');
    expect(window.localStorage.getItem(PROJECTS_STORAGE_KEY)).toContain('Alpha Launch');

    // Open project detail view
    fireEvent.click(screen.getByText('Alpha Launch'));
    expect(document.getElementById('project-detail-title')?.textContent).toBe('Alpha Launch');

    // Toggle pin
    fireEvent.click(document.getElementById('btn-project-pin')!);
    expect(window.localStorage.getItem(PROJECTS_STORAGE_KEY)).toContain('"isPinned":true');

    // Back to list & delete Alpha Launch
    fireEvent.click(document.getElementById('btn-back-to-projects')!);
    const deleteBtn = screen.getByLabelText('Delete Alpha Launch');
    fireEvent.click(deleteBtn);
    fireEvent.click(document.getElementById('project-delete-confirm-btn')!);

    expect(screen.queryByText('Alpha Launch')).not.toBeInTheDocument();
    expect(document.getElementById('projects-count-badge')?.textContent).toBe('2');
  });
});
