import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShellProvider, useAppShell } from '../context/AppShellContext';
import { AuthProfileProvider } from '../context/AuthProfileContext';
import { ChatSessionProvider } from '../context/ChatSessionContext';
import { I18nProvider } from '../context/I18nContext';
import { ThemeProvider } from '../context/ThemeContext';
import { DeleteAccountModal } from '../components/modals/DeleteAccountModal';
import { FeedbackModal } from '../components/modals/FeedbackModal';
import { PlanSelectionModal } from '../components/modals/PlanSelectionModal';
import { SettingsModal } from '../components/modals/SettingsModal';

const ModalHarness: React.FC = () => {
  const { openModal } = useAppShell();
  return (
    <div>
      <button type="button" onClick={() => openModal('settings')}>
        Open Settings
      </button>
      <button type="button" onClick={() => openModal('upgrade')}>
        Open Upgrade
      </button>
      <button type="button" onClick={() => openModal('feedback')}>
        Open Feedback
      </button>
      <SettingsModal />
      <PlanSelectionModal />
      <DeleteAccountModal />
      <FeedbackModal />
    </div>
  );
};

const renderModals = () =>
  render(
    <ThemeProvider>
      <I18nProvider>
        <AuthProfileProvider>
          <AppShellProvider>
            <ChatSessionProvider>
              <ModalHarness />
            </ChatSessionProvider>
          </AppShellProvider>
        </AuthProfileProvider>
      </I18nProvider>
    </ThemeProvider>
  );

describe('Shared Modals (Settings, Plan Selection, Delete Account, Feedback)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.dir = 'ltr';
  });

  it('switches Settings tabs, updates theme and RTL language, and opens Delete Account modal', () => {
    renderModals();

    fireEvent.click(screen.getByText('Open Settings'));
    expect(document.getElementById('settings-modal')).not.toBeNull();

    // Appearance tab -> Dark mode
    fireEvent.click(screen.getByText('Appearance'));
    fireEvent.click(document.querySelector('[data-theme="dark"]')!);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Language tab -> Arabic RTL
    fireEvent.click(screen.getByText('Language'));
    fireEvent.click(screen.getByText('العربية'));
    expect(document.documentElement.dir).toBe('rtl');

    // Account tab -> Delete Account modal
    fireEvent.click(screen.getByText('Account'));
    fireEvent.click(document.getElementById('settings-account-delete-btn')!);
    expect(document.getElementById('delete-account-modal')).not.toBeNull();
    fireEvent.click(document.getElementById('delete-account-cancel-btn')!);
    expect(document.getElementById('delete-account-modal')).toBeNull();
  });

  it('toggles monthly/annual billing and selects a plan in PlanSelectionModal', () => {
    renderModals();

    fireEvent.click(screen.getByText('Open Upgrade'));
    expect(document.getElementById('plan-pro-price')?.textContent).toBe('$20');

    fireEvent.click(document.getElementById('upgrade-toggle-annual')!);
    expect(document.getElementById('plan-pro-price')?.textContent).toBe('$16');

    fireEvent.click(screen.getByText('Get Pro'));
    expect(window.localStorage.getItem('ai_user_plan')).toBe('Pro');
    expect(document.getElementById('plan-selection-modal')).toBeNull();
  });
});
