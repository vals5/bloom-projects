import React, { createContext, useContext, useState, useEffect } from "react";

const ProjectContext = createContext();

const initialProjects = [];

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("agency_projects");
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("agency_budgets");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTimerTicket, setActiveTimerTicket] = useState(null);

  useEffect(() => {
    localStorage.setItem("agency_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("agency_budgets", JSON.stringify(budgets));
  }, [budgets]);

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
    setProjects((prev) => [{ ...newProject, id: Date.now(), tickets: [] }, ...prev]);
  };

  const updateProject = (updated) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
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
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, tickets: [newTicket, ...p.tickets] };
        }
        return p;
      }),
    );
  };

  const deleteTicket = (projectId, ticketId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return { ...p, tickets: p.tickets.filter((t) => t.id !== ticketId) };
        }
        return p;
      }),
    );
    if (activeTimerTicket?.ticketId === ticketId) {
      setActiveTimerTicket(null);
    }
  };

  const toggleTicketStatus = (projectId, ticketId) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            tickets: p.tickets.map((t) => {
              if (t.id === ticketId) {
                const nextStatus = t.status === "completed" ? "pending" : "completed";
                if (nextStatus === "completed" && activeTimerTicket?.ticketId === ticketId) {
                  setActiveTimerTicket(null);
                }
                return { ...t, status: nextStatus };
              }
              return t;
            }),
          };
        }
        return p;
      }),
    );
  };

  const toggleTimer = (projectId, ticketId) => {
    if (activeTimerTicket && activeTimerTicket.ticketId === ticketId) {
      setActiveTimerTicket(null);
    } else {
      setActiveTimerTicket({ projectId, ticketId });
    }
  };

  // PRESUPUESTOS
  const addBudget = (newBudget) => {
    setBudgets((prev) => [{ ...newBudget, id: Date.now() }, ...prev]);
  };

  const updateBudget = (updated) => {
    setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const deleteBudget = (id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
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
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
