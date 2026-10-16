import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export const BudgetModal = ({ isOpen, onClose, initialData = null }) => {
  const { projects, addBudget, updateBudget } = useProjects();

  const [formData, setFormData] = useState({
    projectId: "",
    budgetStatus: "draft",
    designStatus: "pending",
    currency: "ARS",
    amount: "",
    sendDate: "",
    expiryDate: "",
    documentLink: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        const today = new Date();
        const d = String(today.getDate()).padStart(2, "0");
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const y = today.getFullYear();

        setFormData({
          projectId: "",
          budgetStatus: "draft",
          designStatus: "pending",
          currency: "ARS",
          amount: "",
          sendDate: `${d}/${m}/${y}`,
          expiryDate: "",
          documentLink: "",
          notes: "",
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (initialData) {
      updateBudget({ ...formData, id: initialData.id });
    } else {
      addBudget(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2a0b16]/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-brand-blanco rounded-xl shadow-xl max-w-lg w-full p-6 text-brand-bordo max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-brand-dorado/40">
          <h2 className="text-2xl font-lucidity text-brand-bordo uppercase tracking-wide">
            {initialData ? "Editar Presupuesto" : "Nuevo Presupuesto"}
          </h2>
          <button onClick={onClose} className="p-1 text-brand-bordo/50 hover:text-brand-bordo/80 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 ">
          <div>
            <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
              Vincular a Proyecto
            </label>
            <select
              name="projectId"
              required
              value={formData.projectId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
            >
              <option value="" disabled>
                Seleccionar proyecto...
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.client} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Estado Presupuesto
              </label>
              <select
                name="budgetStatus"
                value={formData.budgetStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
              >
                <option value="draft">Borrador</option>
                <option value="sent">Enviado</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Estado Diseño
              </label>
              <select
                name="designStatus"
                value={formData.designStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En proceso</option>
                <option value="completed">Finalizado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">Moneda</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Monto Total
              </label>
              <input
                type="number"
                name="amount"
                min="0"
                placeholder="Ej: 150000"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none font-numbers text-brand-bordo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Fecha de Envío
              </label>
              <input
                type="text"
                name="sendDate"
                placeholder="DD/MM/AAAA"
                value={formData.sendDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none font-numbers text-brand-bordo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Vencimiento
              </label>
              <input
                type="text"
                name="expiryDate"
                placeholder="DD/MM/AAAA"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none font-numbers text-brand-bordo"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
              Link del Diseño (Canva/PDF)
            </label>
            <input
              type="url"
              name="documentLink"
              placeholder="https://..."
              value={formData.documentLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none text-brand-bordo"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
              Entregables / Notas
            </label>
            <textarea
              name="notes"
              rows="2"
              placeholder="Ej: Incluye 4 posteos y 1 reel..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none text-brand-bordo resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-brand-dorado/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-brand-dorado text-brand-bordo text-sm font-bold rounded-lg hover:bg-brand-dorado/20 font-cocomat uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-bordo hover:bg-brand-bordo/90 text-brand-blanco text-sm font-bold rounded-lg shadow-sm font-cocomat uppercase tracking-wider"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
