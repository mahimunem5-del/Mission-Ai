import React from 'react';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AppShellProvider } from '../context/AppShellContext';
import { ThemeProvider } from '../context/ThemeContext';
import { I18nProvider } from '../context/I18nContext';
import { ImagesWorkspaceContainer } from '../components/images/ImagesWorkspaceContainer';

function renderImagesWorkspace() {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <AppShellProvider>
          <ImagesWorkspaceContainer />
        </AppShellProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

describe('Images Workspace (Ideogram Studio)', () => {
  it('renders View 1 home canvas with 4 workflow cards and Templates', () => {
    renderImagesWorkspace();

    expect(document.getElementById('images-workspace-root')).not.toBeNull();
    expect(document.getElementById('image-home-view')).not.toBeNull();
    expect(screen.getByText(/Imagine it\./i)).toBeInTheDocument();
    expect(screen.getByText(/Craft it\./i)).toBeInTheDocument();

    const workflowsGrid = document.getElementById('creative-workflows-grid')!;
    expect(within(workflowsGrid).getByText('Generate Image')).toBeInTheDocument();
    expect(within(workflowsGrid).getByText('Remove Background')).toBeInTheDocument();
    expect(within(workflowsGrid).getByText('Precise Edit')).toBeInTheDocument();
    expect(within(workflowsGrid).getByText('Upscale Image')).toBeInTheDocument();
    expect(screen.getAllByText('Templates').length).toBeGreaterThan(0);
    expect(document.getElementById('image-home-templates-grid')).not.toBeNull();
  });

  it('switches across all 4 studio modes in View 2 without Vectorize', () => {
    renderImagesWorkspace();

    const workflowsGrid = document.getElementById('creative-workflows-grid')!;
    fireEvent.click(within(workflowsGrid).getByText('Generate Image'));

    expect(document.getElementById('image-studio-workspace')).not.toBeNull();
    expect(document.getElementById('ideogram-sidebar-resizer')).not.toBeNull();
    expect(screen.getByText('Style Presets')).toBeInTheDocument();
    const generateBtn = document.getElementById('studio-generate-btn') as HTMLButtonElement;
    expect(generateBtn).toBeDisabled();

    // Switch via workflow dropdown and confirm only the 4 finalized modes exist
    fireEvent.click(document.getElementById('workspace-tool-switcher-btn')!);
    const flyout = document.getElementById('workspace-tool-flyout')!;
    expect(within(flyout).queryByText('Vector Illustration')).toBeNull();
    expect(within(flyout).getByText('Precise Edit')).toBeInTheDocument();
    expect(within(flyout).getByText('Upscale Image')).toBeInTheDocument();
    expect(within(flyout).getByText('Remove Background')).toBeInTheDocument();

    fireEvent.click(within(flyout).getByText('Precise Edit'));
    expect(screen.getByText('What should change?')).toBeInTheDocument();
    expect(screen.getByText('Quality')).toBeInTheDocument();
    expect(screen.getByText('Variations')).toBeInTheDocument();

    fireEvent.click(document.getElementById('workspace-tool-switcher-btn')!);
    fireEvent.click(within(document.getElementById('workspace-tool-flyout')!).getByText('Upscale Image'));
    expect(screen.getByText('Target Scale')).toBeInTheDocument();
    expect(screen.getByText('Upscale')).toBeInTheDocument();
  });

  it('opens TemplatePreviewModal on template click and loads prompt into View 2', () => {
    renderImagesWorkspace();

    const templatesGrid = document.getElementById('image-home-templates-grid')!;
    fireEvent.click(within(templatesGrid).getByText('Amber Glass Luxury Perfume'));

    const modal = document.getElementById('template-white-preview-modal');
    expect(modal).not.toBeNull();
    expect(within(modal!).getByText('Use Prompt')).toBeInTheDocument();

    fireEvent.click(document.getElementById('tmpl-modal-cta-btn')!);
    expect(document.getElementById('image-studio-workspace')).not.toBeNull();
    const promptInput = document.getElementById('studio-prompt-input') as HTMLTextAreaElement;
    expect(promptInput.value).toContain('amber glass perfume bottle');
  });
});
