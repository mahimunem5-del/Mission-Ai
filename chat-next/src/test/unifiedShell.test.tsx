import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getPathForWorkspace,
  isWorkspaceBlocked,
  isWorkspaceHiddenInSidebar,
  normalizeWorkspaceFromPath
} from '../config/workspaces';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { AuthProfileProvider } from '../context/AuthProfileContext';
import { AppShellProvider } from '../context/AppShellContext';
import { ChatSessionProvider } from '../context/ChatSessionContext';
import { MasterSidebar } from '../components/layout/MasterSidebar';

describe('Workspace Lock & Routing Guard', () => {
  it('unlocks images workspace routes and shows Images in sidebar', () => {
    expect(isWorkspaceBlocked('images')).toBe(false);
    expect(isWorkspaceHiddenInSidebar('images')).toBe(false);
    expect(isWorkspaceBlocked('chat')).toBe(false);
    expect(isWorkspaceBlocked('slides')).toBe(false);
    expect(isWorkspaceBlocked('projects')).toBe(false);
    expect(isWorkspaceBlocked('library')).toBe(false);

    expect(normalizeWorkspaceFromPath('/images')).toBe('images');
    expect(normalizeWorkspaceFromPath('/vectorize')).toBe('chat');
    expect(normalizeWorkspaceFromPath('/slides')).toBe('slides');
    expect(normalizeWorkspaceFromPath('/projects')).toBe('projects');
    expect(normalizeWorkspaceFromPath('/library')).toBe('library');
    expect(getPathForWorkspace('images')).toBe('/images');
  });
});

describe('MasterSidebar Component', () => {
  it('renders all navigation items including Images and toggles collapse state', () => {
    render(
      <ThemeProvider>
        <I18nProvider>
          <AuthProfileProvider>
            <AppShellProvider>
              <ChatSessionProvider>
                <MasterSidebar />
              </ChatSessionProvider>
            </AppShellProvider>
          </AuthProfileProvider>
        </I18nProvider>
      </ThemeProvider>
    );

    expect(screen.getByText('New chat')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Slides')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Images'));
    expect(window.location.pathname).toBe('/images');

    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    expect(sidebar).not.toBeNull();
    expect(toggleBtn).not.toBeNull();

    fireEvent.click(toggleBtn!);
    expect(sidebar?.classList.contains('sidebar-collapsed')).toBe(true);
    fireEvent.click(toggleBtn!);
    expect(sidebar?.classList.contains('sidebar-collapsed')).toBe(false);
  });
});
