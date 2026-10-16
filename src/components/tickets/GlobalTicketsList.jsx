import React, { useState } from "react";
import { Play, Pause, CheckCircle2, Circle, Clock, Calendar, Trash2, Search, Filter } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { formatDuration, formatDate } from "../../utils/formatters";

export const GlobalTicketsList = () => {
  const { projects, deleteTicket, toggleTicketStatus, toggleTimer, activeTimerTicket } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const allTickets = projects.flatMap((project) =>
    (project.tickets || []).map((ticket) => ({
      ...ticket,
      projectId: project.id,
      projectName: project.name,
      clientName: project.client,
      category: project.category,
    })),
  );

  const filteredTickets = allTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "pending") return matchesSearch && ticket.status !== "completed";
    if (statusFilter === "completed") return matchesSearch && ticket.status === "completed";
    return matchesSearch;
  });

  const totalGlobalSeconds = allTickets.reduce((acc, t) => acc + t.secondsSpent, 0);

  return (
    <div className="space-y-6">
      {/* Resumen General con fondo blanco */}
      <div className="bg-brand-blanco border border-brand-dorado/50 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-lucidity text-3xl text-brand-bordo uppercase">Historial de Tickets</h2>
          <p className="font-cocomat text-xs text-brand-bordo/70 uppercase tracking-wider font-bold mt-1">
            Gestión global de tareas e intervenciones
          </p>
        </div>

        {/* Indicador de tiempo con fondo gris sutil */}
        <div className="bg-brand-dorado/20 border border-brand-dorado/50 px-4 py-2.5 rounded-xl flex items-center gap-3">
          <Clock className="w-5 h-5 text-brand-bordo" />
          <div>
            <p className="font-cocomat text-[10px] uppercase font-bold text-brand-bordo/70">Tiempo Total Invertido</p>
            <p className="font-numbers text-xl font-bold text-brand-bordo">{formatDuration(totalGlobalSeconds)}</p>
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-bordo/40" />
          <input
            type="text"
            placeholder="Buscar por ticket, proyecto o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-blanco border border-brand-dorado/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-bordo text-brand-bordo"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brand-dorado hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 bg-brand-blanco border border-brand-dorado/50 rounded-xl text-xs font-cocomat font-bold uppercase tracking-wider text-brand-bordo focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Finalizados</option>
          </select>
        </div>
      </div>

      {/* Lista de Tickets - Cada ítem mantiene su fondo gris (bg-brand-dorado/20) */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-brand-blanco rounded-2xl p-12 text-center border border-brand-dorado/40">
            <p className="text-brand-bordo/50 text-sm font-cocomat uppercase font-bold">
              No se encontraron tickets en el historial
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isRunning = activeTimerTicket?.ticketId === ticket.id;
            const isCompleted = ticket.status === "completed";

            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                  isRunning
                    ? "border-brand-dorado bg-brand-dorado shadow-lg ring-2 ring-brand-blanco/70"
                    : isCompleted
                      ? "border-transparent bg-brand-blanco/50 opacity-70"
                      : "border-transparent bg-brand-blanco hover:bg-brand-dorado/40"
                }`}
              >
                <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTicketStatus(ticket.projectId, ticket.id)}
                    className="text-brand-bordo/40 hover:text-brand-bordo transition-colors mt-0.5 md:mt-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-brand-bordo" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Título con tipografía Cocomat */}
                    <p
                      className={`font-cocomat font-bold text-sm tracking-wide text-brand-bordo truncate ${
                        isCompleted ? "line-through opacity-50" : ""
                      }`}
                    >
                      {ticket.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 font-cocomat text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-bordo/10 text-brand-bordo">
                        {ticket.clientName} • {ticket.projectName}
                      </span>

                      <span className="text-xs text-brand-bordo/70 flex items-center gap-1 font-numbers">
                        <Calendar className="w-3 h-3" /> {formatDate(ticket.dateAdded)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-brand-dorado/50">
                  <div
                    className={`font-mono text-xs px-2.5 py-1 rounded-lg font-numbers ${
                      isRunning
                        ? "bg-brand-bordo text-brand-blanco font-bold animate-pulse"
                        : "bg-brand-dorado/30 text-brand-bordo border border-brand-dorado/60"
                    }`}
                  >
                    {formatDuration(ticket.secondsSpent)}
                  </div>

                  <div className="flex items-center gap-1">
                    {!isCompleted && (
                      <button
                        onClick={() => toggleTimer(ticket.projectId, ticket.id)}
                        className={`p-2 rounded-full transition-colors ${
                          isRunning
                            ? "bg-brand-bordo hover:bg-brand-bordo/90 text-brand-blanco"
                            : "bg-brand-dorado hover:bg-brand-dorado/80 text-brand-bordo"
                        }`}
                      >
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm("¿Estás segura de que querés borrar este ticket?")) {
                          deleteTicket(ticket.projectId, ticket.id);
                        }
                      }}
                      className="p-2 rounded-full text-brand-bordo/50 hover:bg-brand-bordo/10 hover:text-brand-bordo transition-colors"
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
  );
};
