import React, { useEffect, useState } from 'react';
import { Download, Edit3, FolderPlus, Trash2, X } from 'lucide-react';
import type { ProjectFileItem, ProjectItem } from '../../services/projectsStorage';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, instructions: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setInstructions('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="project-create-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FolderPlus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Create New Project
              </h3>
              <p className="text-[11px] text-slate-400">
                Set up an isolated workspace with custom instructions
              </p>
            </div>
          </div>
          <button
            type="button"
            id="project-modal-close-x"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          id="project-create-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onCreate(name.trim(), instructions.trim());
            onClose();
          }}
          className="flex flex-col gap-3.5"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="project-modal-name"
              className="text-xs font-semibold text-slate-700 dark:text-neutral-200"
            >
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="project-modal-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., E-commerce Redesign or Mobile App"
              required
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-800 dark:text-neutral-100 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="project-modal-instructions"
                className="text-xs font-semibold text-slate-700 dark:text-neutral-200"
              >
                Project Instructions
              </label>
              <span className="text-[11px] text-slate-400 font-normal">Optional</span>
            </div>
            <textarea
              id="project-modal-instructions"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide custom guidelines, coding style, tone, or context that the AI should follow across all chats in this project..."
              className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-800 dark:text-neutral-100 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none transition-all leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <button
              type="button"
              id="project-modal-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="project-modal-submit-btn"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface EditProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onSave: (id: string, name: string, instructions: string) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  project,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setInstructions(project.instructions || '');
    }
  }, [project]);

  if (!project) return null;

  return (
    <div
      id="project-edit-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Edit3 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                Edit Project
              </h3>
              <p className="text-[11px] text-slate-400">
                Update project name and workspace guidelines
              </p>
            </div>
          </div>
          <button
            type="button"
            id="project-edit-modal-close-x"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          id="project-edit-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onSave(project.id, name.trim(), instructions.trim());
            onClose();
          }}
          className="flex flex-col gap-3.5"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="project-edit-name"
              className="text-xs font-semibold text-slate-700 dark:text-neutral-200"
            >
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="project-edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-800 dark:text-neutral-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="project-edit-instructions"
              className="text-xs font-semibold text-slate-700 dark:text-neutral-200"
            >
              Project Instructions
            </label>
            <textarea
              id="project-edit-instructions"
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-800 dark:text-neutral-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 resize-none transition-all leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <button
              type="button"
              id="project-edit-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="project-edit-submit-btn"
              className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  project,
  onClose,
  onConfirm
}) => {
  if (!project) return null;

  return (
    <div
      id="project-delete-confirm-modal"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
              Delete Project
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete this project? This action cannot be undone. All chats
              and files in{' '}
              <span id="project-delete-confirm-name" className="font-semibold text-slate-700">
                {project.name}
              </span>{' '}
              will be permanently deleted.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            id="project-delete-cancel-btn"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="project-delete-confirm-btn"
            onClick={() => {
              onConfirm(project.id);
              onClose();
            }}
            className="flex-1 px-4 py-2 rounded-xl text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProjectFilePreviewModalProps {
  file: ProjectFileItem | null;
  onClose: () => void;
}

export const ProjectFilePreviewModal: React.FC<ProjectFilePreviewModalProps> = ({
  file,
  onClose
}) => {
  if (!file) return null;

  const isImage = file.type.startsWith('image/') && Boolean(file.dataUrl);

  const handleDownload = () => {
    const href =
      file.dataUrl ||
      (file.textContent
        ? URL.createObjectURL(new Blob([file.textContent], { type: 'text/plain;charset=utf-8' }))
        : '');
    if (!href) return;
    const a = document.createElement('a');
    a.href = href;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id="project-file-preview-modal"
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-[#202020] rounded-2xl border border-slate-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800">
          <span className="text-sm font-semibold text-slate-800 dark:text-neutral-100 truncate">
            {file.name}
          </span>
          <div className="flex items-center gap-2">
            {(file.dataUrl || file.textContent) && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-neutral-800"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {isImage ? (
            <img src={file.dataUrl} alt={file.name} className="max-h-[60vh] mx-auto rounded-lg" />
          ) : file.textContent ? (
            <pre className="text-xs text-slate-700 dark:text-neutral-200 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800">
              {file.textContent}
            </pre>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Preview not available for this binary file ({file.type || 'unknown'}).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
