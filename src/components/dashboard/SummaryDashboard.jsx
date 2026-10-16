import React from "react";
import { DollarSign, Clock, CheckCircle2, PlayCircle, PauseCircle } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { formatCurrency, formatDuration } from "../../utils/formatters";

export const SummaryDashboard = () => {
  const { projects } = useProjects();

  const totalUSD = projects.reduce((acc, p) => acc + (p.usdBilled || 0), 0);
  const totalARS = projects.reduce((acc, p) => acc + (p.arsBilled || 0), 0);

  const totalSecondsAll = projects.reduce((acc, p) => {
    return acc + p.tickets.reduce((tAcc, t) => tAcc + t.secondsSpent, 0);
  }, 0);

  const inProgressCount = projects.filter((p) => p.status === "in_progress").length;
  const pausedCount = projects.filter((p) => p.status === "paused").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Título actualizado con color dorado y tipografía principal */}
      <h2 className="text-3xl font-lucidity text-brand-dorado uppercase tracking-wide">Métricas globales</h2>

      {/* Las 3 métricas en una sola fila (grid-cols-3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-blanco p-5 rounded-xl shadow-sm flex flex-col justify-center">
          <p className="text-xs font-cocomat font-bold text-brand-bordo/60 uppercase">Total ARS</p>
          <p className="text-2xl text-brand-bordo mt-1 font-numbers">{formatCurrency(totalARS, "ARS")}</p>
        </div>

        <div className="bg-brand-blanco p-5 rounded-xl shadow-sm flex flex-col justify-center">
          <p className="text-xs font-cocomat font-bold text-brand-bordo/60 uppercase">Total USD</p>
          <p className="text-2xl text-brand-bordo mt-1 font-numbers">{formatCurrency(totalUSD, "USD")}</p>
        </div>

        <div className="bg-brand-blanco p-5 rounded-xl shadow-sm flex flex-col justify-center">
          <p className="text-xs font-cocomat font-bold text-brand-bordo/60 uppercase">Horas totales trabajadas</p>
          <p className="text-2xl text-brand-bordo mt-1 font-numbers">{formatDuration(totalSecondsAll)}</p>
        </div>
      </div>

      {/* Estado de proyectos */}
      <div className="bg-brand-blanco p-6 rounded-xl shadow-sm mt-8">
        <h3 className="text-sm font-cocomat font-bold text-brand-bordo mb-4 uppercase tracking-wider">
          Estado de proyectos activos
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-brand-bordo/10 rounded-lg border border-brand-bordo/20">
            <PlayCircle className="w-6 h-6 text-brand-bordo mx-auto mb-1" />
            <span className="block text-xl font-numbers text-brand-bordo">{inProgressCount}</span>
            <span className="text-xs font-cocomat font-bold uppercase text-brand-bordo">En proceso</span>
          </div>

          <div className="p-4 bg-brand-dorado/40 rounded-lg border border-brand-dorado">
            <PauseCircle className="w-6 h-6 text-brand-bordo mx-auto mb-1" />
            <span className="block text-xl font-numbers text-brand-bordo">{pausedCount}</span>
            <span className="text-xs font-cocomat font-bold uppercase text-brand-bordo">Pausados</span>
          </div>

          <div className="p-4 bg-brand-dorado/10 rounded-lg border border-brand-dorado/50">
            <CheckCircle2 className="w-6 h-6 text-brand-bordo mx-auto mb-1" />
            <span className="block text-xl font-numbers text-brand-bordo">{completedCount}</span>
            <span className="text-xs font-cocomat font-bold uppercase text-brand-bordo/70">Finalizados</span>
          </div>
        </div>
      </div>
    </div>
  );
};
