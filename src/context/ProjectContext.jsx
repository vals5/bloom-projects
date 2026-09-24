import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activeTimerTicket, setActiveTimerTicket] = useState(null);

  // Agregamos un estado de carga para no mostrar vacía la app mientras trae los datos
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos desde Supabase (y migrar localStorage si es necesario)
  useEffect(() => {
    const loadData = async () => {
      // Pedimos los datos a la nube
      const { data: pData } = await supabase.from("projects").select("*");
      const { data: bData } = await supabase.from("budgets").select("*");

      let loadedProjects = [];
      let loadedBudgets = [];

      // --- MIGRACIÓN DE PROYECTOS ---
      if (pData && pData.length > 0) {
        loadedProjects = pData.map((p) => ({ ...p.data, id: p.id }));
      } else {
        // Si la nube está vacía, buscamos en la PC local
        const localProjects = JSON.parse(localStorage.getItem("agency_projects") || "[]");
        if (localProjects.length > 0) {
          console.log("Migrando proyectos locales a Supabase...");
          for (const p of localProjects) {
            await supabase.from("projects").upsert({ id: p.id, data: p });
          }
          loadedProjects = localProjects;
        }
      }

      // --- MIGRACIÓN DE PRESUPUESTOS ---
      if (bData && bData.length > 0) {
        loadedBudgets = bData.map((b) => ({ ...b.data, id: b.id }));
      } else {
        // Si la nube está vacía, buscamos en la PC local
        const localBudgets = JSON.parse(localStorage.getItem("agency_budgets") || "[]");
        if (localBudgets.length > 0) {
          console.log("Migrando presupuestos locales a Supabase...");
          for (const b of localBudgets) {
            await supabase.from("budgets").upsert({ id: b.id, data: b });
          }
          loadedBudgets = localBudgets;
        }
      }

      setProjects(loadedProjects);
      setBudgets(loadedBudgets);
      setLoading(false);
    };

    loadData();
  }, []);

  // Helpers para sincronizar un item específico a la base de datos sin trabar la UI
  const syncProject = async (project) => {
    await supabase.from("projects").upsert({ id: project.id, data: project });
  };

  const syncBudget = async (budget) => {
    await supabase.from("budgets").upsert({ id: budget.id, data: budget });
  };

  // 2. Timer Effect (se mantiene igual, actualizando solo la UI)
  useEffect(() => {
    let interval = null;

    if (activeTimerTicket) {
      let lastTick = Date.now();

      interval = setInterval(() => {
        const now = Date.now();
        const deltaSeconds = Math.floor((now - lastTick) / 1000);

        if (deltaSeconds > 0) {
          setProjects((prev) =>
            prev.map((p) => {
              if (p.id === activeTimerTicket.projectId) {
                return {
                  ...p,
                  tickets: p.tickets.map((t) => {
                    if (t.id === activeTimerTicket.ticketId) {
                      return { ...t, secondsSpent: t.secondsSpent + deltaSeconds };
                    }
                    return t;
                  }),
                };
              }
              return p;
            }),
          );
          lastTick = now;
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimerTicket]);

  // PROYECTOS
  const addProject = (newProject) => {
    const project = { ...newProject, id: Date.now(), tickets: [] };
    setProjects((prev) => [project, ...prev]);
    syncProject(project);
  };

  const updateProject = (updated) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    syncProject(updated);
  };

  const deleteProject = async (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("projects").delete().eq("id", id);
  };

  // TICKETS
  const addTicket = (projectId, title) => {
    const newTicket = {
      id: Date.now(),
      title,
      status: "pending",
      secondsSpent: 0,
      dateAdded: new Date().toISOString().split("T")[0],
    };
    setProjects((prev) => {
      const newState = prev.map((p) => (p.id === projectId ? { ...p, tickets: [newTicket, ...p.tickets] } : p));
      syncProject(newState.find((p) => p.id === projectId)); // Sincroniza
      return newState;
    });
  };

  const deleteTicket = (projectId, ticketId) => {
    setProjects((prev) => {
      const newState = prev.map((p) =>
        p.id === projectId ? { ...p, tickets: p.tickets.filter((t) => t.id !== ticketId) } : p,
      );
      syncProject(newState.find((p) => p.id === projectId)); // Sincroniza
      return newState;
    });
    if (activeTimerTicket?.ticketId === ticketId) setActiveTimerTicket(null);
  };

  const toggleTicketStatus = (projectId, ticketId) => {
    setProjects((prev) => {
      const newState = prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            tickets: p.tickets.map((t) => {
              if (t.id === ticketId) {
                const nextStatus = t.status === "completed" ? "pending" : "completed";
                if (nextStatus === "completed" && activeTimerTicket?.ticketId === ticketId) setActiveTimerTicket(null);
                return { ...t, status: nextStatus };
              }
              return t;
            }),
          };
        }
        return p;
      });
      syncProject(newState.find((p) => p.id === projectId)); // Sincroniza
      return newState;
    });
  };

  const toggleTimer = (projectId, ticketId) => {
    if (activeTimerTicket && activeTimerTicket.ticketId === ticketId) {
      // Si apaga el timer actual, sincronizamos el proyecto con la DB
      setActiveTimerTicket(null);
      setProjects((prev) => {
        const proj = prev.find((p) => p.id === projectId);
        if (proj) syncProject(proj);
        return prev;
      });
    } else {
      // Si prende uno nuevo pero había otro corriendo, guardamos el anterior primero
      if (activeTimerTicket) {
        setProjects((prev) => {
          const proj = prev.find((p) => p.id === activeTimerTicket.projectId);
          if (proj) syncProject(proj);
          return prev;
        });
      }
      setActiveTimerTicket({ projectId, ticketId });
    }
  };

  // PRESUPUESTOS
  const addBudget = (newBudget) => {
    const budget = { ...newBudget, id: Date.now() };
    setBudgets((prev) => [budget, ...prev]);
    syncBudget(budget);
  };

  const updateBudget = (updated) => {
    setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    syncBudget(updated);
  };

  const deleteBudget = async (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    await supabase.from("budgets").delete().eq("id", id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        budgets,
        activeTimerTicket,
        addProject,
        updateProject,
        deleteProject,
        addTicket,
        deleteTicket,
        toggleTicketStatus,
        toggleTimer,
        addBudget,
        updateBudget,
        deleteBudget,
      }}
    >
      {/* Evita parpadeos mostrando los componentes solo cuando Supabase ya cargó */}
      {!loading ? (
        children
      ) : (
        <div className="min-h-screen flex items-center justify-center text-brand-dorado font-lucidity uppercase tracking-widest text-2xl">
          Cargando Bloom
        </div>
      )}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
