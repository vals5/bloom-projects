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

const MainContent = () => {
  const [activeTab, setActiveTab] = useState("projects");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modales
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [selectedTicketProject, setSelectedTicketProject] = useState(null);

  const { projects } = useProjects();

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

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
        {activeTab === "dashboard" ? (
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
                  Nuestros
                </span>
                <h1 className="text-5xl font-lucidity text-brand-blanco uppercase leading-none">
                  Proyectos ({filteredProjects.length})
                </h1>
              </div>

              <div className="flex gap-4 font-cocomat text-sm uppercase tracking-wider font-bold">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`pb-1 transition-all ${
                    statusFilter === "all"
                      ? "text-brand-dorado border-b-2 border-brand-dorado"
                      : "text-brand-blanco/60 hover:text-brand-blanco"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter("in_progress")}
                  className={`pb-1 transition-all ${
                    statusFilter === "in_progress"
                      ? "text-brand-dorado border-b-2 border-brand-dorado"
                      : "text-brand-blanco/60 hover:text-brand-blanco"
                  }`}
                >
                  En proceso
                </button>
                <button
                  onClick={() => setStatusFilter("paused")}
                  className={`pb-1 transition-all ${
                    statusFilter === "paused"
                      ? "text-brand-dorado border-b-2 border-brand-dorado"
                      : "text-brand-blanco/60 hover:text-brand-blanco"
                  }`}
                >
                  Pausados
                </button>
              </div>
            </div>

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
