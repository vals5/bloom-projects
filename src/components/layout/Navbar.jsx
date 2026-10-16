import React from "react";
import { LayoutDashboard, FolderKanban, Plus, ListTodo, Receipt, CalendarDays } from "lucide-react";

export const Navbar = ({ activeTab, setActiveTab, onOpenNewProjectModal, onOpenNewBudgetModal }) => {
  return (
    <header className="bg-brand-blanco text-brand-bordo shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <div>
              <span className="font-lucidity text-3xl uppercase tracking-widest block leading-none">Bloom Studio</span>
              <span className="text-xs font-cocomat font-bold tracking-widest opacity-70">Agencia de diseño</span>
            </div>
          </div>

          <nav className="flex space-x-2 font-cocomat">
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md transition-all ${
                activeTab === "calendar"
                  ? "bg-brand-bordo/10 text-brand-bordo border-b-2 border-brand-bordo"
                  : "text-brand-bordo/60 hover:bg-brand-bordo/5 hover:text-brand-bordo"
              }`}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Calendario
            </button>

            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md transition-all ${
                activeTab === "projects"
                  ? "bg-brand-bordo/10 text-brand-bordo border-b-2 border-brand-bordo"
                  : "text-brand-bordo/60 hover:bg-brand-bordo/5 hover:text-brand-bordo"
              }`}
            >
              <FolderKanban className="w-4 h-4 mr-2" />
              Proyectos
            </button>

            <button
              onClick={() => setActiveTab("tickets")}
              className={`flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md transition-all ${
                activeTab === "tickets"
                  ? "bg-brand-bordo/10 text-brand-bordo border-b-2 border-brand-bordo"
                  : "text-brand-bordo/60 hover:bg-brand-bordo/5 hover:text-brand-bordo"
              }`}
            >
              <ListTodo className="w-4 h-4 mr-2" />
              Tickets
            </button>

            <button
              onClick={() => setActiveTab("budgets")}
              className={`flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md transition-all ${
                activeTab === "budgets"
                  ? "bg-brand-bordo/10 text-brand-bordo border-b-2 border-brand-bordo"
                  : "text-brand-bordo/60 hover:bg-brand-bordo/5 hover:text-brand-bordo"
              }`}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Presupuestos
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md transition-all ${
                activeTab === "dashboard"
                  ? "bg-brand-bordo/10 text-brand-bordo border-b-2 border-brand-bordo"
                  : "text-brand-bordo/60 hover:bg-brand-bordo/5 hover:text-brand-bordo"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Métricas
            </button>
          </nav>

          {/* BOTÓN DINÁMICO SEGÚN LA PESTAÑA ACTIVA */}
          <div>
            {activeTab === "projects" && (
              <button
                onClick={onOpenNewProjectModal}
                className="flex items-center bg-brand-bordo hover:bg-brand-bordo/90 text-brand-blanco font-lucidity text-xl px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline uppercase">Nuevo Proyecto</span>
              </button>
            )}

            {activeTab === "budgets" && (
              <button
                onClick={onOpenNewBudgetModal}
                className="flex items-center bg-brand-bordo hover:bg-brand-bordo/90 text-brand-blanco font-lucidity text-xl px-4 py-2 rounded-lg transition-all shadow-sm"
              >
                <Plus className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline uppercase">Nuevo Presupuesto</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
