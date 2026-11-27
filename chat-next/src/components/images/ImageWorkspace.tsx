import React, { useEffect, useState } from 'react';
import type { DesignTemplate } from '../../data/designTemplates';
import { ImageHomeView, type HomeGeneratePayload } from './ImageHomeView';
import { ImageLightboxModal } from './ImageLightboxModal';
import { ImageStudioEditor, type StudioState } from './ImageStudioEditor';
import type { ImageStudioWorkflowId } from './imageStudioConstants';

export interface ImageAsset {
  id: string;
  url: string;
  prompt: string;
  originalPrompt?: string;
  model?: string;
  modelName?: string;
  aspectRatio?: string;
  scale?: string;
  isPreciseEdit?: boolean;
  isRemoveBg?: boolean;
  isUpscale?: boolean;
  tool?: string;
  stylePreset?: string;
  sourceImage?: string;
  createdAt: string;
}

export interface ImageWorkspaceProps {
  initialView?: 'home' | 'workspace';
  assets: ImageAsset[];
  isGenerating: boolean;
  onGenerate: (params: {
    prompt: string;
    model: string;
    aspectRatio: string;
    count: number;
    referenceImage?: string;
    referenceImages?: string[];
    quality?: string;
    tool?: string;
    stylePreset?: string;
    seed?: string;
  }) => Promise<void>;
  onApplyEdit: (params: {
    sourceImage: string;
    referenceImages?: string[];
    prompt: string;
    count: number;
    quality?: string;
    model?: string;
  }) => Promise<void>;
  onRemoveBackground?: (params: { sourceImage: string }) => Promise<void>;
  onUpscaleImage?: (params: { sourceImage: string; scale?: string }) => Promise<void>;
  onUpdateAssets?: (next: ImageAsset[]) => void;
}

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  initialView = 'home',
  assets,
  isGenerating,
  onGenerate,
  onApplyEdit,
  onRemoveBackground,
  onUpscaleImage,
  onUpdateAssets,
}) => {
  const [view, setView] = useState<'home' | 'workspace'>(initialView);
  const [lightboxAsset, setLightboxAsset] = useState<ImageAsset | null>(null);
  const [studioState, setStudioState] = useState<StudioState>({
    workflow: 'generate',
    model: 'auto',
    editModel: 'auto',
    prompt: '',
    aspectRatio: '1:1',
    count: 1,
    stylePreset: 'Auto',
    seed: '',
    referenceImages: [],
    sourceImage: '',
    editQuality: 'Medium',
    upscaleFactor: '2x',
  });

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const handleHomeSubmit = async (payload: HomeGeneratePayload) => {
    setStudioState((prev) => ({
      ...prev,
      workflow: 'generate',
      prompt: payload.prompt,
      aspectRatio: payload.aspectRatio,
      count: payload.count,
      model: payload.model,
      referenceImages: payload.referenceImages,
    }));
    setView('workspace');

    await onGenerate({
      prompt: payload.prompt,
      model: payload.model,
      aspectRatio: payload.aspectRatio,
      count: payload.count,
      referenceImage: payload.referenceImages[0],
      referenceImages: payload.referenceImages,
      tool: 'generate',
    });
  };

  const handleSelectWorkflow = (workflow: ImageStudioWorkflowId) => {
    setStudioState((prev) => ({ ...prev, workflow }));
    setView('workspace');
  };

  // Exact template click routing from head_index.html (L27082-27116)
  const handleSelectTemplate = (template: DesignTemplate) => {
    setStudioState((prev) => ({
      ...prev,
      workflow: 'generate',
      prompt: template.prompt,
      aspectRatio: template.aspectRatio,
      stylePreset: template.stylePreset || 'Auto',
    }));
    setView('workspace');
  };

  const handleRunGenerate = async () => {
    await onGenerate({
      prompt: studioState.prompt,
      model: studioState.model,
      aspectRatio: studioState.aspectRatio,
      count: studioState.count,
      referenceImage: studioState.referenceImages[0],
      referenceImages: studioState.referenceImages,
      tool: 'generate',
      stylePreset: studioState.stylePreset,
      seed: studioState.seed || undefined,
    });
  };

  const handleRunPreciseEdit = async () => {
    await onApplyEdit({
      sourceImage: studioState.sourceImage,
      referenceImages: studioState.referenceImages,
      prompt: studioState.prompt,
      count: studioState.count,
      quality: studioState.editQuality.toLowerCase(),
      model: studioState.editModel,
    });
  };

  const handleRunRemoveBackground = async () => {
    if (!onRemoveBackground || !studioState.sourceImage) return;
    await onRemoveBackground({ sourceImage: studioState.sourceImage });
  };

  const handleRunUpscale = async () => {
    if (!onUpscaleImage || !studioState.sourceImage) return;
    await onUpscaleImage({
      sourceImage: studioState.sourceImage,
      scale: studioState.upscaleFactor,
    });
  };

  const handleCopyPrompt = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  };

  const handleRegenerateAsset = async (asset: ImageAsset) => {
    const promptText = asset.originalPrompt || asset.prompt || '';
    if (!promptText) return;
    setStudioState((prev) => ({
      ...prev,
      workflow: asset.isPreciseEdit ? 'precise-edit' : 'generate',
      prompt: promptText,
      model: asset.model || 'auto',
      aspectRatio: asset.aspectRatio || '1:1',
      stylePreset: asset.stylePreset || 'Auto',
      sourceImage: asset.sourceImage || prev.sourceImage,
    }));
    if (asset.isPreciseEdit && asset.sourceImage) {
      await onApplyEdit({
        sourceImage: asset.sourceImage,
        prompt: promptText,
        count: 1,
        model: asset.model || 'auto',
      });
    } else {
      await onGenerate({
        prompt: promptText,
        model: asset.model || 'auto',
        aspectRatio: asset.aspectRatio || '1:1',
        count: 1,
        stylePreset: asset.stylePreset || 'Auto',
        tool: 'generate',
      });
    }
  };

  const handleEditInPreciseEdit = (asset: ImageAsset) => {
    setStudioState((prev) => ({
      ...prev,
      workflow: 'precise-edit',
      sourceImage: asset.url,
      prompt: '',
    }));
    setView('workspace');
  };

  const handleDownloadAsset = (asset: ImageAsset) => {
    const a = document.createElement('a');
    a.href = asset.url;
    a.download = asset.isRemoveBg ? `mestrio-${asset.id}.png` : `ideogram_${asset.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDeleteAssets = (ids: string[]) => {
    if (!onUpdateAssets) return;
    const idSet = new Set(ids);
    onUpdateAssets(assets.filter((item) => !idSet.has(item.id)));
  };

  return (
    <>
      {view === 'home' ? (
        <ImageHomeView
          onSubmitPrompt={handleHomeSubmit}
          onSelectWorkflow={handleSelectWorkflow}
          onSelectTemplate={handleSelectTemplate}
          onOpenStudio={() => setView('workspace')}
        />
      ) : (
        <ImageStudioEditor
          state={studioState}
          setState={setStudioState}
          assets={assets}
          isGenerating={isGenerating}
          onBackHome={() => setView('home')}
          onRunGenerate={handleRunGenerate}
          onRunPreciseEdit={handleRunPreciseEdit}
          onRunRemoveBackground={handleRunRemoveBackground}
          onRunUpscale={handleRunUpscale}
          onOpenLightbox={(asset) => setLightboxAsset(asset)}
          onRegenerateAsset={handleRegenerateAsset}
          onEditInPreciseEdit={handleEditInPreciseEdit}
          onCopyPrompt={handleCopyPrompt}
          onDownloadAsset={handleDownloadAsset}
          onDeleteAssets={handleDeleteAssets}
        />
      )}

      <ImageLightboxModal
        asset={lightboxAsset}
        groupAssets={assets}
        onSelectAsset={(next) => setLightboxAsset(next)}
        onClose={() => setLightboxAsset(null)}
        onEditInPreciseEdit={handleEditInPreciseEdit}
        onDownload={handleDownloadAsset}
      />
    </>
  );
};
