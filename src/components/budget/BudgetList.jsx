import React from "react";
import { ExternalLink, Edit3, Trash2, Receipt } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export const BudgetsList = ({ onEditBudget }) => {
  const { budgets, projects, deleteBudget } = useProjects();

  const statusBadges = {
    draft: { label: "Borrador", color: "bg-brand-blanco/70 text-brand-bordo" },
    sent: { label: "Enviado", color: "bg-brand-bordo/15 text-brand-bordo" },
    approved: { label: "Aprobado", color: "bg-brand-bordo text-brand-blanco" },
    rejected: { label: "Rechazado", color: "border border-brand-bordo/50 text-brand-bordo/70 line-through" },
  };

  const designBadges = {
    pending: { label: "Diseño Pendiente", color: "bg-brand-blanco/70 text-brand-bordo" },
    in_progress: { label: "En Diseño", color: "bg-brand-bordo/15 text-brand-bordo" },
    completed: { label: "Diseño Listo", color: "bg-brand-bordo text-brand-blanco" },
  };

  return (
    <div>
      {/* HEADER DE LA SECCIÓN (Sin botón) */}
      <div className="mb-10">
        <span className="font-cocomat text-brand-dorado uppercase tracking-widest text-sm font-bold block mb-1">
          Gestión
        </span>
        <h1 className="text-5xl font-lucidity text-brand-blanco uppercase leading-none">
          Presupuestos ({budgets.length})
        </h1>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-brand-dorado/10 border border-brand-dorado/20 rounded-2xl p-12 text-center text-brand-blanco/80">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-60 text-brand-dorado" />
          <p className="font-cocomat text-lg font-bold uppercase">No hay presupuestos creados aún</p>
          <p className="text-sm opacity-70 mt-1">
            Hacé clic en "+ Nuevo Presupuesto" arriba en la barra de navegación para agregar el primero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const project = projects.find((p) => String(p.id) === String(b.projectId));
            const bStatus = statusBadges[b.budgetStatus] || statusBadges.draft;
            const dStatus = designBadges[b.designStatus] || designBadges.pending;

            return (
              <div
                key={b.id}
                className="bg-brand-dorado text-brand-bordo rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-brand-blanco/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`text-[10px] font-cocomat font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${bStatus.color}`}
                    >
                      {bStatus.label}
                    </span>
                    <span
                      className={`text-[10px] font-cocomat font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${dStatus.color}`}
                    >
                      {dStatus.label}
                    </span>
                  </div>

                  <h3 className="font-cocomat font-black text-xl uppercase leading-tight mb-2">
                    {project ? `${project.client} - ${project.name}` : "Proyecto no seleccionado"}
                  </h3>

                  {b.amount && (
                    <div className="bg-brand-blanco/40 p-3 rounded-xl my-3">
                      <p className="opacity-70 text-xs uppercase font-bold font-cocomat">Monto Presupuestado</p>
                      <p className="text-2xl font-numbers font-bold">
                        {b.currency === "USD"
                          ? `$ ${Number(b.amount).toLocaleString("en-US")} USD`
                          : `$ ${Number(b.amount).toLocaleString("es-AR")} ARS`}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1 text-xs uppercase font-cocomat opacity-80 my-3">
                    {b.sendDate && (
                      <div className="flex items-center justify-between">
                        <span>Envío:</span>
                        <span className="font-numbers tracking-normal font-bold">{b.sendDate}</span>
                      </div>
                    )}
                    {b.expiryDate && (
                      <div className="flex items-center justify-between">
                        <span>Vencimiento:</span>
                        <span className="font-numbers tracking-normal font-bold">{b.expiryDate}</span>
                      </div>
                    )}
                  </div>

                  {b.notes && (
                    <div className="bg-brand-blanco/20 p-2.5 rounded-lg text-xs mb-3">
                      <p className="font-bold font-cocomat uppercase opacity-70 mb-0.5">Entregables / Notas:</p>
                      <p className="line-clamp-3 text-brand-bordo">{b.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-brand-bordo/10 flex items-center justify-between gap-2 mt-2">
                  {b.documentLink ? (
                    <a
                      href={b.documentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-cocomat font-bold uppercase text-brand-bordo hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" /> Ver Diseño
                    </a>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditBudget(b)}
                      className="p-2 bg-brand-blanco/50 hover:bg-brand-blanco text-brand-bordo rounded-xl transition-colors"
                      title="Editar presupuesto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("¿Estás segura de eliminar este presupuesto?")) {
                          deleteBudget(b.id);
                        }
                      }}
                      className="p-2 bg-brand-blanco/50 hover:bg-brand-bordo hover:text-brand-blanco text-brand-bordo rounded-xl transition-colors"
                      title="Eliminar presupuesto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
