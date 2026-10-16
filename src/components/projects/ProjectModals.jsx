import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export const ProjectModal = ({ isOpen, onClose, initialData = null }) => {
  const { addProject, updateProject } = useProjects();

  const [formData, setFormData] = useState({
    client: "",
    name: "",
    category: "Redes sociales",
    status: "in_progress",
    paymentStatus: "unpaid",
    usdBilled: "",
    arsBilled: "",
    partialAmount: "",
    partialCurrency: "ARS",
    startDate: "",
    endDate: "",
  });

  // Sincroniza y reinicia los campos cada vez que el modal se abre
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Si editamos, convertimos la fecha YYYY-MM-DD a DD/MM/YYYY
        let formattedDate = initialData.startDate || "";
        if (formattedDate.includes("-")) {
          const [y, m, d] = formattedDate.split("-");
          formattedDate = `${d}/${m}/${y}`;
        }
        setFormData({
          ...initialData,
          startDate: formattedDate,
        });
      } else {
        // Si es nuevo, generamos la fecha de hoy en formato DD/MM/YYYY
        const today = new Date();
        const d = String(today.getDate()).padStart(2, "0");
        const m = String(today.getMonth() + 1).padStart(2, "0");
        const y = today.getFullYear();
        setFormData({
          client: "",
          name: "",
          category: "Redes sociales",
          status: "in_progress",
          paymentStatus: "unpaid",
          usdBilled: "",
          arsBilled: "",
          partialAmount: "",
          partialCurrency: "ARS",
          startDate: `${d}/${m}/${y}`,
          endDate: "",
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

    // Convertimos DD/MM/YYYY de vuelta a YYYY-MM-DD para guardarla limpia
    let isoDate = formData.startDate;
    if (formData.startDate.includes("/")) {
      const parts = formData.startDate.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts;
        isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
    }

    const projectData = {
      ...formData,
      startDate: isoDate,
      usdBilled: Number(formData.usdBilled) || 0,
      arsBilled: Number(formData.arsBilled) || 0,
      partialAmount: formData.paymentStatus === "partial" ? Number(formData.partialAmount) || 0 : 0,
    };

    if (initialData) {
      updateProject({ ...projectData, id: initialData.id });
    } else {
      addProject(projectData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2a0b16]/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-brand-blanco rounded-xl shadow-xl max-w-lg w-full p-6 text-brand-bordo max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-brand-dorado/40">
          <h2 className="text-2xl font-lucidity text-brand-bordo uppercase tracking-wide">
            {initialData ? "Editar Proyecto" : "Nuevo Proyecto"}
          </h2>
          <button onClick={onClose} className="p-1 text-brand-bordo/50 hover:text-brand-bordo/80 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 ">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">Cliente</label>
              <input
                type="text"
                name="client"
                required
                placeholder="Ej: Vivero..."
                value={formData.client}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none text-brand-bordo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Proyecto
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ej: Rediseño..."
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none text-brand-bordo"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
              Tipo de servicio
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
            >
              <option value="Redes sociales">Redes sociales</option>
              <option value="Página web">Página web</option>
              <option value="Sistema">Sistema</option>
              <option value="Branding">Branding</option>
              <option value="Cartelería">Cartelería</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">ARS</label>
              <input
                type="number"
                name="arsBilled"
                min="0"
                placeholder="0"
                value={formData.arsBilled}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none font-numbers text-brand-bordo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">USD</label>
              <input
                type="number"
                name="usdBilled"
                min="0"
                placeholder="0"
                value={formData.usdBilled}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none font-numbers text-brand-bordo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Estado Trabajo
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
              >
                <option value="in_progress">En proceso</option>
                <option value="paused">Pausado</option>
                <option value="completed">Finalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">
                Estado Cobro
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
              >
                <option value="unpaid">Pendiente</option>
                <option value="partial">Cobro parcial</option>
                <option value="paid">Cobrado total</option>
              </select>
            </div>
          </div>

          {formData.paymentStatus === "partial" && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-brand-dorado/20 rounded-lg border border-brand-dorado/40">
              <div>
                <label className="block text-[10px] font-bold text-brand-bordo mb-1 font-cocomat uppercase">
                  Moneda del adelanto
                </label>
                <select
                  name="partialCurrency"
                  value={formData.partialCurrency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none bg-brand-blanco text-brand-bordo"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-bordo mb-1 font-cocomat uppercase">
                  Monto cobrado
                </label>
                <input
                  type="number"
                  name="partialAmount"
                  min="0"
                  placeholder="Ej: 50000"
                  value={formData.partialAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none font-numbers text-brand-bordo"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-brand-bordo/70 mb-1 font-cocomat uppercase">Inicio</label>
              <input
                type="text"
                name="startDate"
                placeholder="DD/MM/AAAA"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-brand-dorado rounded-lg text-sm focus:ring-2 focus:ring-brand-bordo outline-none font-numbers text-brand-bordo"
              />
            </div>
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
