import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, CheckCircle, Clock, ListTodo, Edit3, Trash2, DollarSign, ChevronDown } from "lucide-react";
import { formatCurrency, formatDuration, formatDate } from "../../utils/formatters";
import { useProjects } from "../../context/ProjectContext";

export const ProjectCard = ({ project, onOpenTickets, onEdit }) => {
  const { deleteProject, updateProject } = useProjects();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showPartialInput, setShowPartialInput] = useState(false);
  const [partialAmount, setPartialAmount] = useState(project.partialAmount || "");
  const [partialCurrency, setPartialCurrency] = useState(project.partialCurrency || "ARS");

  const cardRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setShowPartialInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalSeconds = (project.tickets || []).reduce((acc, t) => acc + t.secondsSpent, 0);
  const pendingTickets = (project.tickets || []).filter((t) => t.status === "pending").length;

  const statusConfig = {
    in_progress: { label: "En Proceso", color: "bg-brand-bordo text-brand-blanco", icon: Play },
    paused: { label: "Pausado", color: "bg-brand-bordo/20 text-brand-bordo", icon: Pause },
    completed: {
      label: "Finalizado",
      color: "bg-brand-blanco text-brand-bordo border border-brand-dorado/50",
      icon: CheckCircle,
    },
  };

  const paymentConfig = {
    paid: { label: "Cobrado Total", color: "bg-brand-bordo text-brand-blanco" },
    partial: { label: "Cobro Parcial", color: "bg-brand-bordo text-brand-blanco" },
    unpaid: { label: "Pendiente", color: "bg-brand-bordo/10 text-brand-bordo border border-brand-bordo/20" },
  };

  const StatusIcon = statusConfig[project.status]?.icon || Play;
  const payStatus = paymentConfig[project.paymentStatus || "unpaid"];

  const hasARS = Number(project.arsBilled) > 0;
  const hasUSD = Number(project.usdBilled) > 0;
  const showMoney = hasARS || hasUSD;
  const moneyCols = hasARS && hasUSD ? "grid-cols-2" : "grid-cols-1";

  const handleWorkStatusChange = (newStatus) => {
    updateProject({ ...project, status: newStatus });
    setActiveDropdown(null);
  };

  const handlePaymentStatusChange = (newStatus) => {
    if (newStatus === "partial") {
      setShowPartialInput(true);
    } else {
      updateProject({ ...project, paymentStatus: newStatus, partialAmount: 0, partialCurrency: "ARS" });
      setActiveDropdown(null);
      setShowPartialInput(false);
    }
  };

  const savePartialPayment = () => {
    updateProject({
      ...project,
      paymentStatus: "partial",
      partialAmount: Number(partialAmount),
      partialCurrency: partialCurrency,
    });
    setActiveDropdown(null);
    setShowPartialInput(false);
  };

  return (
    <div
      ref={cardRef}
      // Tarjeta dorada (igual que presupuestos) con paneles claros adentro
      className="bg-brand-dorado text-brand-bordo rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-brand-blanco/30 relative"
    >
      <div>
        {/* Header - Layout Vertical */}
        <div className="flex flex-col gap-2 mb-4 relative z-20">
          <div>
            <span className="font-lucidity text-2xl uppercase tracking-widest mb-1 block truncate">
              {project.client} {project.category && `• ${project.category}`}
            </span>
            <h3 className="font-cocomat font-black text-lg text-brand-bordo/70 uppercase leading-tight break-words">
              {project.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 relative">
            {/* Estado de Trabajo */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === "work" ? null : "work")}
                className={`flex items-center justify-center gap-1 w-10 h-6 rounded-full hover:opacity-80 transition-opacity cursor-pointer ${statusConfig[project.status]?.color}`}
                title={statusConfig[project.status]?.label}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {activeDropdown === "work" && (
                <div className="absolute top-full left-0 mt-2 w-36 bg-brand-blanco rounded-xl shadow-xl border border-brand-dorado/40 overflow-hidden font-cocomat text-xs font-bold uppercase tracking-wider text-brand-bordo z-50">
                  <button
                    onClick={() => handleWorkStatusChange("in_progress")}
                    className="w-full text-left px-4 py-3 hover:bg-brand-bordo/10 hover:text-brand-bordo transition-colors"
                  >
                    En Proceso
                  </button>
                  <button
                    onClick={() => handleWorkStatusChange("paused")}
                    className="w-full text-left px-4 py-3 hover:bg-brand-bordo/10 hover:text-brand-bordo transition-colors"
                  >
                    Pausado
                  </button>
                  <button
                    onClick={() => handleWorkStatusChange("completed")}
                    className="w-full text-left px-4 py-3 hover:bg-brand-bordo/10 hover:text-brand-bordo transition-colors border-t border-brand-dorado/40"
                  >
                    Finalizado
                  </button>
                </div>
              )}
            </div>

            {/* Estado de Cobro */}
            <div className="relative">
              <button
                onClick={() => {
                  setActiveDropdown(activeDropdown === "payment" ? null : "payment");
                  setShowPartialInput(false);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 font-cocomat text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm hover:opacity-80 transition-opacity cursor-pointer ${payStatus.color}`}
              >
                <DollarSign className="w-3 h-3" />
                {payStatus.label}
                {project.paymentStatus === "partial" && project.partialAmount > 0 && (
                  <span className="ml-1 opacity-90 font-numbers tracking-normal">
                    ({formatCurrency(project.partialAmount, project.partialCurrency)})
                  </span>
                )}
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {activeDropdown === "payment" && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-brand-blanco rounded-xl shadow-xl border border-brand-dorado/40 overflow-hidden text-sm text-brand-bordo z-50">
                  {!showPartialInput ? (
                    <div className="font-cocomat text-xs font-bold uppercase tracking-wider">
                      <button
                        onClick={() => handlePaymentStatusChange("unpaid")}
                        className="w-full text-left px-4 py-3 hover:bg-brand-bordo/10 hover:text-brand-bordo transition-colors"
                      >
                        Pendiente
                      </button>
                      <button
                        onClick={() => handlePaymentStatusChange("partial")}
                        className="w-full text-left px-4 py-3 hover:bg-brand-bordo/10 hover:text-brand-bordo transition-colors"
                      >
                        Cobro Parcial
                      </button>
                      <button
                        onClick={() => handlePaymentStatusChange("paid")}
                        className="w-full text-left px-4 py-3 hover:bg-brand-bordo/10 hover:text-brand-bordo transition-colors border-t border-brand-dorado/40"
                      >
                        Cobrado Total
                      </button>
                    </div>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs font-cocomat font-bold uppercase text-brand-bordo/70 mb-2">
                        Ingresar monto parcial
                      </p>
                      <div className="flex gap-2 mb-3">
                        <select
                          value={partialCurrency}
                          onChange={(e) => setPartialCurrency(e.target.value)}
                          className="w-20 px-2 py-1.5 bg-brand-dorado/10 border border-brand-dorado/50 rounded outline-none text-xs font-bold"
                        >
                          <option value="ARS">ARS</option>
                          <option value="USD">USD</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={partialAmount}
                          onChange={(e) => setPartialAmount(e.target.value)}
                          placeholder="Monto..."
                          className="flex-1 px-2 py-1.5 border border-brand-dorado/50 rounded outline-none text-xs font-numbers min-w-0"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowPartialInput(false)}
                          className="flex-1 px-2 py-1.5 text-xs font-bold text-brand-bordo/70 bg-brand-dorado/20 hover:bg-brand-dorado/40 rounded transition-colors font-cocomat uppercase"
                        >
                          Volver
                        </button>
                        <button
                          onClick={savePartialPayment}
                          className="flex-1 px-2 py-1.5 text-xs font-bold text-brand-blanco bg-brand-bordo hover:bg-brand-bordo/90 rounded transition-colors font-cocomat uppercase"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de Dinero - paneles claros */}
        {showMoney && (
          <div className={`grid ${moneyCols} gap-3 mb-4`}>
            {hasARS && (
              <div className="bg-brand-blanco p-3 rounded-xl relative border border-brand-bordo/10 shadow-xs">
                <p className="opacity-70 text-xs uppercase mb-1 font-bold font-cocomat text-brand-bordo">ARS</p>
                <p className="text-xl font-numbers text-brand-bordo font-bold">
                  {formatCurrency(project.arsBilled, "ARS")}
                </p>
              </div>
            )}
            {hasUSD && (
              <div className="bg-brand-blanco p-3 rounded-xl relative border border-brand-bordo/10 shadow-xs">
                <p className="opacity-70 text-xs uppercase mb-1 font-bold font-cocomat text-brand-bordo">USD</p>
                <p className="text-xl font-numbers text-brand-bordo font-bold">
                  {formatCurrency(project.usdBilled, "USD")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tiempo Invertido y Fechas - paneles claros */}
        <div
          className={`bg-brand-blanco border border-brand-bordo/10 p-3 rounded-xl mb-6 shadow-xs ${!showMoney ? "mt-2" : ""}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 opacity-80 text-xs uppercase font-bold font-cocomat text-brand-bordo">
              <Clock className="w-4 h-4" /> Tiempo Invertido
            </span>
            <span className="text-lg font-numbers text-brand-bordo font-bold">{formatDuration(totalSeconds)}</span>
          </div>
          <div className="flex items-center justify-between opacity-80 text-xs uppercase text-brand-bordo/80">
            <span className="font-cocomat">
              Inicio: <span className="font-numbers tracking-normal ml-1">{formatDate(project.startDate)}</span>
            </span>
            {project.endDate && (
              <span className="font-cocomat">
                Fin: <span className="font-numbers tracking-normal ml-1">{formatDate(project.endDate)}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <button
          onClick={() => onOpenTickets(project)}
          className="flex-1 flex items-center justify-center gap-2 bg-brand-bordo hover:bg-brand-bordo/90 text-brand-blanco font-lucidity text-xl uppercase py-2 px-3 rounded-xl transition-colors"
        >
          <ListTodo className="w-5 h-5" />
          Tickets ({pendingTickets})
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(project)}
            className="p-2 bg-brand-blanco hover:bg-brand-blanco/70 text-brand-bordo rounded-xl border border-brand-dorado/50 transition-colors"
            title="Editar proyecto"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `¿Estás segura de que querés eliminar el proyecto "${project.name}"? ¡Se perderán todos sus tickets y horas!`,
                )
              ) {
                deleteProject(project.id);
              }
            }}
            className="p-2 bg-brand-blanco hover:bg-brand-bordo hover:text-brand-blanco text-brand-bordo rounded-xl border border-brand-dorado/50 transition-colors"
            title="Eliminar proyecto"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
