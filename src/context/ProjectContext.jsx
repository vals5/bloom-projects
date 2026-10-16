import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { toDateKey } from "../utils/formatters";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTimerTicket, setActiveTimerTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(null);

  // Siempre apunta a la última versión de projects (para el autoguardado del timer)
  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  // Ejecuta una consulta a Supabase y avisa si falló (antes los errores se ignoraban)
  const safe = async (query) => {
    const { error } = await query;
    if (error) {
      console.error("Supabase:", error);
      setSyncError(error.message);
    } else {
      setSyncError(null);
    }
  };

  const syncProject = (project) => project && safe(supabase.from("projects").upsert({ id: project.id, data: project }));
  const syncBudget = (budget) => safe(supabase.from("budgets").upsert({ id: budget.id, data: budget }));
  const syncEvent = (event) => safe(supabase.from("events").upsert({ id: event.id, data: event }));

  // 1. Cargar datos desde Supabase (y migrar localStorage si es necesario)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, bRes, eRes] = await Promise.all([
          supabase.from("projects").select("*"),
          supabase.from("budgets").select("*"),
          supabase.from("events").select("*"),
        ]);

        if (pRes.error || bRes.error || eRes.error) {
          const err = pRes.error || bRes.error || eRes.error;
          console.error("Supabase:", err);
          setSyncError(err.message);
        }

        let loadedProjects = [];
        let loadedBudgets = [];

        // Solo migramos desde localStorage si la nube respondió bien y está vacía
        if (!pRes.error && pRes.data?.length > 0) {
          loadedProjects = pRes.data.map((p) => ({ ...p.data, id: p.id }));
        } else if (!pRes.error) {
          const local = JSON.parse(localStorage.getItem("agency_projects") || "[]");
          if (local.length > 0) {
            console.log("Migrando proyectos locales a Supabase...");
            for (const p of local) await supabase.from("projects").upsert({ id: p.id, data: p });
            loadedProjects = local;
          }
        }

        if (!bRes.error && bRes.data?.length > 0) {
          loadedBudgets = bRes.data.map((b) => ({ ...b.data, id: b.id }));
        } else if (!bRes.error) {
          const local = JSON.parse(localStorage.getItem("agency_budgets") || "[]");
          if (local.length > 0) {
            console.log("Migrando presupuestos locales a Supabase...");
            for (const b of local) await supabase.from("budgets").upsert({ id: b.id, data: b });
            loadedBudgets = local;
          }
        }

        setProjects(loadedProjects);
        setBudgets(loadedBudgets);
        setEvents((eRes.data || []).map((e) => ({ ...e.data, id: e.id })));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 2. Timer: suma segundos en la UI (sin perder fracciones de segundo)
  useEffect(() => {
    if (!activeTimerTicket) return;

    let lastTick = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.floor((now - lastTick) / 1000);

      if (deltaSeconds > 0) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === activeTimerTicket.projectId
              ? {
                  ...p,
                  tickets: p.tickets.map((t) =>
                    t.id === activeTimerTicket.ticketId ? { ...t, secondsSpent: t.secondsSpent + deltaSeconds } : t,
                  ),
                }
              : p,
          ),
        );
        lastTick += deltaSeconds * 1000; // antes: lastTick = now (se perdía hasta 1s por tick)
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimerTicket]);

  // 3. Autoguardado del timer cada 30s (antes solo se guardaba al pausar)
  useEffect(() => {
    if (!activeTimerTicket) return;
    const save = setInterval(() => {
      syncProject(projectsRef.current.find((p) => p.id === activeTimerTicket.projectId));
    }, 30000);
    return () => clearInterval(save);
  }, [activeTimerTicket]);

  // Modifica un proyecto y lo sincroniza (sin efectos secundarios dentro de setState)
  const mutateProject = (projectId, fn) => {
    const current = projectsRef.current.find((p) => p.id === projectId);
    if (!current) return;
    setProjects((prev) => prev.map((p) => (p.id === projectId ? fn(p) : p)));
    syncProject(fn(current));
  };

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
    if (activeTimerTicket?.projectId === id) setActiveTimerTicket(null);
    await safe(supabase.from("projects").delete().eq("id", id));
  };

  // TICKETS
  const addTicket = (projectId, title) => {
    const newTicket = {
      id: Date.now(),
      title,
      status: "pending",
      secondsSpent: 0,
      dateAdded: toDateKey(), // fecha local (toISOString daba el día siguiente después de las 21hs)
    };
    mutateProject(projectId, (p) => ({ ...p, tickets: [newTicket, ...p.tickets] }));
  };

  const deleteTicket = (projectId, ticketId) => {
    mutateProject(projectId, (p) => ({ ...p, tickets: p.tickets.filter((t) => t.id !== ticketId) }));
    if (activeTimerTicket?.ticketId === ticketId) setActiveTimerTicket(null);
  };

  const toggleTicketStatus = (projectId, ticketId) => {
    mutateProject(projectId, (p) => ({
      ...p,
      tickets: p.tickets.map((t) =>
        t.id === ticketId ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t,
      ),
    }));
    // Si lo completás mientras corría el timer, se frena
    if (activeTimerTicket?.ticketId === ticketId) setActiveTimerTicket(null);
  };

  const toggleTimer = (projectId, ticketId) => {
    if (activeTimerTicket?.ticketId === ticketId) {
      // Pausa: guardamos el proyecto
      syncProject(projectsRef.current.find((p) => p.id === projectId));
      setActiveTimerTicket(null);
    } else {
      // Si había otro corriendo, guardamos ese primero
      if (activeTimerTicket) {
        syncProject(projectsRef.current.find((p) => p.id === activeTimerTicket.projectId));
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
    await safe(supabase.from("budgets").delete().eq("id", id));
  };

  // CALENDARIO
  const addEvent = ({ title, date, type = "Post", projectId = null }) => {
    const event = { id: Date.now(), title, date, type, projectId, done: false };
    setEvents((prev) => [...prev, event]);
    syncEvent(event);
  };

  const toggleEvent = (id) => {
    const current = events.find((e) => e.id === id);
    if (!current) return;
    const updated = { ...current, done: !current.done };
    setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
    syncEvent(updated);
  };

  const deleteEvent = async (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await safe(supabase.from("events").delete().eq("id", id));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        budgets,
        events,
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
        addEvent,
        toggleEvent,
        deleteEvent,
      }}
    >
      {!loading ? (
        <>
          {children}
          {syncError && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] max-w-md bg-brand-blanco text-brand-bordo rounded-xl shadow-lg px-4 py-3 font-cocomat text-sm flex items-start gap-3">
              <p className="flex-1">
                <strong>No se pudo guardar en la nube.</strong> Tus cambios se ven acá pero pueden perderse al recargar.
                <span className="block text-xs opacity-60 mt-1">{syncError}</span>
              </p>
              <button
                onClick={() => setSyncError(null)}
                className="text-brand-bordo/60 hover:text-brand-bordo text-lg leading-none"
              >
                ×
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="min-h-screen flex items-center justify-center text-brand-dorado font-lucidity uppercase tracking-widest text-2xl">
          Cargando Bloom
        </div>
      )}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
