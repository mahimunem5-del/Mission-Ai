import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Folder,
  FolderGit2,
  FolderPlus,
  Menu,
  MessageSquare,
  Pin,
  Plus,
  Trash2
} from 'lucide-react';
import { useAppShell } from '../../context/AppShellContext';
import {
  formatTimeAgo,
  loadProjectsFromStorage,
  saveProjectsToStorage,
  type ProjectItem
} from '../../services/projectsStorage';
import { ProjectDetailView } from './ProjectDetailView';
import {
  CreateProjectModal,
  DeleteProjectModal,
  EditProjectModal
} from './ProjectModals';

export const ProjectsWorkspace: React.FC = () => {
  const { setMobileSidebarOpen } = useAppShell();

  const [projects, setProjects] = useState<ProjectItem[]>(() => loadProjectsFromStorage());
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 3000);
  };

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [projects]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const updateAndPersist = (next: ProjectItem[]) => {
    setProjects(next);
    saveProjectsToStorage(next);
  };

  const handleCreateProject = (name: string, instructions: string) => {
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name,
      instructions,
      createdAt: new Date().toISOString(),
      isPinned: false,
      messages: []
    };
    updateAndPersist([newProj, ...projects]);
    showToast('Project created');
  };

  const handleEditProject = (id: string, name: string, instructions: string) => {
    updateAndPersist(
      projects.map((p) => (p.id === id ? { ...p, name, instructions } : p))
    );
    showToast('Project updated');
  };

  const handleDeleteProject = (id: string) => {
    updateAndPersist(projects.filter((p) => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(null);
    showToast('Project deleted');
  };

  const handleTogglePin = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    const nextPinned = !target.isPinned;
    updateAndPersist(
      projects.map((p) => (p.id === id ? { ...p, isPinned: nextPinned } : p))
    );
    showToast(nextPinned ? 'Project pinned' : 'Project unpinned');
  };

  const handleUpdateInstructions = (id: string, instructions: string) => {
    updateAndPersist(projects.map((p) => (p.id === id ? { ...p, instructions } : p)));
  };

  return (
    <div
      id="projects-workspace"
      className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-white dark:bg-[#191919]"
    >
      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800 shrink-0">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-md border border-slate-200 dark:border-neutral-700 p-1.5 text-slate-600 dark:text-neutral-300"
          aria-label="Open sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-neutral-100">
          Projects
        </span>
        <div className="w-7" />
      </div>

      {activeProject ? (
        <ProjectDetailView
          project={activeProject}
          onBack={() => setSelectedProjectId(null)}
          onTogglePin={handleTogglePin}
          onOpenEdit={(proj) => setEditTarget(proj)}
          onOpenDelete={(proj) => setDeleteTarget(proj)}
          onUpdateInstructions={handleUpdateInstructions}
          onShowToast={showToast}
        />
      ) : (
        <div
          id="projects-list-view"
          className="flex-1 flex flex-col h-full overflow-y-auto min-w-0 px-8 pt-5 pb-8"
        >
          {/* Header Banner */}
          <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <FolderGit2 className="w-5 h-5" />
                </span>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Projects</h1>
                <span
                  id="projects-count-badge"
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
                >
                  {projects.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Organize specialized workspaces with custom instructions and isolated chat
                histories.
              </p>
            </div>

            {projects.length > 0 && (
              <button
                type="button"
                id="btn-create-project-header"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            )}
          </div>

          {/* Empty State or Grid */}
          {projects.length === 0 ? (
            <div
              id="projects-empty-state"
              className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto mb-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
                <FolderPlus className="w-8 h-8" />
              </div>
              <h2 className="text-base font-semibold text-slate-800 mb-1.5">
                Looking to start a project?
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Projects let you define custom instructions, keep chat histories isolated, and
                tailor AI responses specifically for each goal.
              </p>
              <button
                type="button"
                id="btn-create-project-empty"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create a project</span>
              </button>
            </div>
          ) : (
            <div id="projects-grid-container" className="max-w-6xl w-full mx-auto mb-6">
              <div
                id="projects-cards-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {sortedProjects.map((project) => {
                  const msgCount = Array.isArray(project.messages) ? project.messages.length : 0;
                  return (
                    <div
                      key={project.id}
                      data-project-id={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className="group relative flex flex-col justify-between p-5 bg-white border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-sm focus:outline-none rounded-2xl transition-all duration-200 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors ${
                                project.isPinned
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : 'bg-blue-50 text-blue-600'
                              }`}
                            >
                              {project.isPinned ? (
                                <Pin className="w-4 h-4 fill-blue-700" />
                              ) : (
                                <Folder className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                  {project.name}
                                </h3>
                                {project.isPinned && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100/80 shrink-0">
                                    Pinned
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {formatTimeAgo(project.createdAt)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(project);
                            }}
                            title="Delete Project"
                            aria-label={`Delete ${project.name}`}
                            className="btn-delete-project p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 line-clamp-2 leading-relaxed mb-4">
                          {project.instructions ? (
                            project.instructions
                          ) : (
                            <span className="italic text-slate-400">
                              No custom instructions specified.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {msgCount} message{msgCount === 1 ? '' : 's'}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />
      <EditProjectModal
        project={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEditProject}
      />
      <DeleteProjectModal
        project={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteProject}
      />

      {/* Toast */}
      {toastMsg && (
        <div
          id="studio-toast"
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl flex items-center gap-2.5"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ProjectsWorkspace;
