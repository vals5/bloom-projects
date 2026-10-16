import React, { useState } from "react";
import { ProjectProvider, useProjects } from "./context/ProjectContext";
import { Navbar } from "./components/layout/Navbar";
import { ProjectCard } from "./components/projects/ProjectCard";
import { ProjectModal } from "./components/projects/ProjectModals";
import { TicketListModal } from "./components/tickets/TicketListModal";
import { SummaryDashboard } from "./components/dashboard/SummaryDashboard";
import { GlobalTicketsList } from "./components/tickets/GlobalTicketsList";
import { BudgetsList } from "./components/budget/BudgetList";
import { BudgetModal } from "./components/budget/BudgetModal";
import { isArchived } from "./utils/formatters";
import { CalendarView } from "./components/calendar/CalendarView";

const MainContent = () => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modales
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [selectedTicketProject, setSelectedTicketProject] = useState(null);

  const { projects } = useProjects();

  // Los proyectos finalizados y cobrados por total se archivan solos
  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "archived") return isArchived(p);
    if (isArchived(p)) return false;
    return statusFilter === "all" || p.status === statusFilter;
  });

  const archivedCount = projects.filter(isArchived).length;
  const filters = [
    { id: "all", label: "Todos" },
    { id: "in_progress", label: "En proceso" },
    { id: "paused", label: "Pausados" },
    { id: "archived", label: `Archivados (${archivedCount})` },
  ];
  const isArchiveView = statusFilter === "archived";

  const handleOpenEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleOpenEditBudget = (budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(null);
  };

  return (
    <div className="min-h-screen text-brand-blanco">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProjectModal={() => setIsProjectModalOpen(true)}
        onOpenNewBudgetModal={() => setIsBudgetModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === "calendar" ? (
          <CalendarView />
        ) : activeTab === "dashboard" ? (
          <SummaryDashboard />
        ) : activeTab === "tickets" ? (
          <GlobalTicketsList />
        ) : activeTab === "budgets" ? (
          <BudgetsList onEditBudget={handleOpenEditBudget} />
        ) : (
          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="font-cocomat text-brand-dorado uppercase tracking-widest text-sm font-bold block mb-1">
                  {isArchiveView ? "Archivo" : "Nuestros"}
                </span>
                <h1 className="text-5xl font-lucidity text-brand-blanco uppercase leading-none">
                  {isArchiveView ? "Archivados" : "Proyectos"} ({filteredProjects.length})
                </h1>
                {isArchiveView && (
                  <p className="font-cocomat text-brand-blanco/60 text-sm mt-3">
                    Proyectos finalizados y cobrados por completo. Si cambiás su estado, vuelven a Proyectos.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 font-cocomat text-sm uppercase tracking-wider font-bold">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`pb-1 transition-all ${
                      statusFilter === f.id
                        ? "text-brand-dorado border-b-2 border-brand-dorado"
                        : "text-brand-blanco/60 hover:text-brand-blanco"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredProjects.length === 0 ? (
              <div className="bg-brand-dorado/10 border border-brand-dorado/20 rounded-2xl p-12 text-center text-brand-blanco/80">
                <p className="font-cocomat text-lg font-bold uppercase">
                  {isArchiveView ? "Todavía no hay proyectos archivados" : "No hay proyectos para mostrar"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onOpenTickets={(p) => setSelectedTicketProject(p)}
                    onEdit={handleOpenEditProject}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALES GLOBALES */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={handleCloseProjectModal} initialData={editingProject} />

      <BudgetModal isOpen={isBudgetModalOpen} onClose={handleCloseBudgetModal} initialData={editingBudget} />

      {selectedTicketProject && (
        <TicketListModal
          project={projects.find((p) => p.id === selectedTicketProject.id) || selectedTicketProject}
          onClose={() => setSelectedTicketProject(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ProjectProvider>
      <MainContent />
    </ProjectProvider>
  );
}
