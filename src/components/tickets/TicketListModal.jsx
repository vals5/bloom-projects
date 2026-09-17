import React, { useState, useEffect } from "react";
import { X, Plus, Play, Pause, CheckCircle2, Circle, Clock, Calendar, Trash2 } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { formatDuration, formatDate } from "../../utils/formatters";

export const TicketListModal = ({ project, onClose }) => {
  const { addTicket, deleteTicket, toggleTicketStatus, toggleTimer, activeTimerTicket } = useProjects();
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState(null);

  useEffect(() => {
    if (activeTimerTicket?.projectId === project.id) {
      if (!sessionStartTime) {
        const now = new Date();
        setSessionStartTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } else {
      setSessionStartTime(null);
    }
  }, [activeTimerTicket, project.id]);

  const handleAddTicket = (e) => {
    e.preventDefault();
    if (!newTicketTitle.trim()) return;
    addTicket(project.id, newTicketTitle);
    setNewTicketTitle("");
  };

  const totalProjectSeconds = project.tickets.reduce((acc, t) => acc + t.secondsSpent, 0);
  const totalHours = (totalProjectSeconds / 3600).toFixed(1);
  const totalMinutes = Math.floor(totalProjectSeconds / 60);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-brand-blanco rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col font-sans">
        {/* Encabezado Modal */}
        <div className="p-6 border-b border-brand-dorado/40 flex justify-between items-start bg-brand-blanco rounded-t-xl">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-cocomat text-brand-bordo/60 uppercase tracking-widest text-sm font-bold block">
                {project.client}
              </span>
              <span className="text-xs text-brand-bordo/60 flex items-center gap-1 font-numbers">
                • <Clock className="w-3.5 h-3.5 ml-1" /> {totalHours} hs ({totalMinutes} min totales)
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-lucidity text-brand-bordo uppercase leading-none mt-1">
              {project.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-bordo/50 hover:text-brand-bordo rounded-lg hover:bg-brand-dorado/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario nuevo ticket */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <form onSubmit={handleAddTicket} className="flex gap-2">
            <input
              type="text"
              placeholder="Ej: Ajustar margen en mobile..."
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-bordo text-slate-700"
            />
            <button
              type="submit"
              className="bg-brand-bordo hover:bg-brand-bordo/90 text-brand-blanco px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors font-cocomat tracking-wider uppercase font-bold"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </form>
        </div>

        {/* Lista de Tickets con fondo gris e tipografía de título actualizada */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-white rounded-b-xl">
          {project.tickets.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-sm">No hay tickets registrados para este proyecto.</p>
          ) : (
            project.tickets.map((ticket) => {
              const isRunning = activeTimerTicket?.ticketId === ticket.id;
              const isCompleted = ticket.status === "completed";

              return (
                <div
                  key={ticket.id}
                  /* Cada tarjeta ahora tiene fondo gris claro (bg-slate-100) */
                  className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                    isRunning
                      ? "border-brand-bordo bg-brand-bordo/10 shadow-sm"
                      : isCompleted
                        ? "border-slate-200 bg-slate-100/60 opacity-75"
                        : "border-slate-200/80 bg-slate-100 hover:border-brand-bordo/40 hover:bg-slate-200/50"
                  }`}
                >
                  <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTicketStatus(project.id, ticket.id)}
                      className="text-slate-400 hover:text-brand-bordo transition-colors mt-0.5 md:mt-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      {/* Título del ticket con la nueva tipografía Cocomat */}
                      <p
                        className={`font-cocomat font-bold text-sm tracking-wide text-brand-bordo truncate ${
                          isCompleted ? "line-through opacity-50" : ""
                        }`}
                      >
                        {ticket.title}
                      </p>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-numbers">
                        <Calendar className="w-3 h-3" /> {formatDate(ticket.dateAdded)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                    {isRunning && sessionStartTime && (
                      <span className="text-xs text-brand-bordo font-semibold flex items-center gap-1 bg-brand-dorado/30 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" /> Empezaste {sessionStartTime} hs
                      </span>
                    )}

                    <div
                      className={`font-mono text-xs px-2.5 py-1 rounded-lg font-numbers ${
                        isRunning
                          ? "bg-brand-bordo text-white font-bold animate-pulse"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {formatDuration(ticket.secondsSpent)}
                    </div>

                    <div className="flex items-center gap-1">
                      {!isCompleted && (
                        <button
                          onClick={() => toggleTimer(project.id, ticket.id)}
                          className={`p-2 rounded-full transition-colors ${
                            isRunning
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : "bg-brand-dorado hover:bg-brand-dorado/80 text-brand-bordo"
                          }`}
                        >
                          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm("¿Estás segura de que querés borrar este ticket?")) {
                            deleteTicket(project.id, ticket.id);
                          }
                        }}
                        className="p-2 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                        title="Borrar ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
