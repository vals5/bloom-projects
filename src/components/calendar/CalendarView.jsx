import React, { useMemo, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { toDateKey, isArchived } from "../../utils/formatters";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"]; // semana arranca en lunes
const TYPES = ["Post", "Story", "Reel", "Otro"];

const keyToDate = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const CalendarView = () => {
  const { events, projects, addEvent, toggleEvent, deleteEvent } = useProjects();

  const todayKey = toDateKey();
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [selected, setSelected] = useState(todayKey);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("Post");
  const [projectId, setProjectId] = useState("");

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      (map[e.date] = map[e.date] || []).push(e);
    });
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const offset = (new Date(y, m, 1).getDay() + 6) % 7;
    const total = new Date(y, m + 1, 0).getDate();
    const arr = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) arr.push(toDateKey(new Date(y, m, d)));
    return arr;
  }, [cursor]);

  const monthPrefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
  const monthPending = events.filter((e) => e.date.startsWith(monthPrefix) && !e.done).length;

  const overdue = events.filter((e) => e.date < todayKey && !e.done).length;

  const dayEvents = (eventsByDay[selected] || []).slice().sort((a, b) => Number(a.done) - Number(b.done));
  const selectedDate = keyToDate(selected);
  const selectedLabel = selectedDate.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const goMonth = (delta) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  const goToday = () => {
    const t = new Date();
    setCursor(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelected(todayKey);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addEvent({
      title: title.trim(),
      date: selected,
      type,
      projectId: projectId ? Number(projectId) : null,
    });
    setTitle("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* CALENDARIO */}
      <section className="lg:col-span-3 bg-brand-blanco/5 rounded-3xl p-6 sm:p-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-5xl font-lucidity text-brand-blanco uppercase leading-none">
              {MONTHS[cursor.getMonth()]}
            </h1>
            <p className="font-cocomat text-brand-dorado text-lg mt-1">{cursor.getFullYear()}</p>
          </div>

          <div className="flex items-center gap-1 text-brand-dorado">
            <button
              onClick={() => goMonth(-1)}
              aria-label="Mes anterior"
              className="w-10 h-10 rounded-full text-2xl text-brand-dorado hover:bg-brand-blanco/10 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={goToday}
              className="px-3 h-10 rounded-full font-cocomat font-bold text-sm text-brand-dorado hover:bg-brand-blanco/10 transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={() => goMonth(1)}
              aria-label="Mes siguiente"
              className="w-10 h-10 rounded-full text-2xl text-brand-dorado hover:bg-brand-blanco/10 transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center font-cocomat font-bold text-sm text-brand-blanco/50 py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((key, i) => {
            if (!key) return <div key={`empty-${i}`} />;

            const day = Number(key.slice(8));
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const list = eventsByDay[key] || [];
            const pending = list.filter((e) => !e.done).length;
            const allDone = list.length > 0 && pending === 0;

            let circle = "text-brand-blanco hover:bg-brand-blanco/10";
            if (isSelected) circle = isToday ? "bg-brand-dorado text-brand-bordo" : "bg-brand-blanco text-brand-bordo";
            else if (isToday) circle = "text-brand-dorado";

            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className="flex flex-col items-center gap-1 py-1 focus:outline-none group"
              >
                <span
                  className={`font-numbers w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full text-base transition-colors group-focus-visible:ring-2 group-focus-visible:ring-brand-dorado ${circle}`}
                >
                  {day}
                </span>
                <span className="flex gap-1 h-1.5">
                  {list.slice(0, 3).map((ev) => (
                    <span
                      key={ev.id}
                      className={`w-1.5 h-1.5 rounded-full ${
                        allDone || ev.done ? "bg-brand-dorado/30" : "bg-brand-dorado"
                      }`}
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        <p className="font-cocomat text-brand-blanco/60 text-sm mt-6">
          {monthPending === 0
            ? "No hay nada pendiente este mes."
            : `${monthPending} ${monthPending === 1 ? "cosa pendiente" : "cosas pendientes"} este mes.`}
          {overdue > 0 && (
            <span className="text-brand-dorado font-bold">
              {" "}
              {overdue} {overdue === 1 ? "quedó atrasada" : "quedaron atrasadas"}.
            </span>
          )}
        </p>
      </section>

      {/* DETALLE DEL DÍA */}
      <section className="lg:col-span-2 bg-brand-blanco rounded-3xl p-6 sm:p-8 text-brand-bordo flex flex-col">
        <h2 className="text-3xl font-lucidity text-brand-bordo uppercase leading-none first-letter:uppercase">
          {selectedLabel}
        </h2>
        <p className="font-cocomat text-brand-bordo/60 text-sm mt-2 mb-6">
          {selected === todayKey ? "Hoy" : selected < todayKey ? "Ya pasó" : "Próximamente"}
        </p>

        <ul className="flex-1 space-y-2 mb-6">
          {dayEvents.length === 0 && (
            <li className="font-cocomat text-brand-bordo/50 py-6 text-center">
              Nada cargado para este día. Agregá lo que tienen que subir.
            </li>
          )}

          {dayEvents.map((ev) => {
            const project = projects.find((p) => p.id === ev.projectId);
            return (
              <li key={ev.id} className="flex items-center gap-3 rounded-2xl bg-brand-dorado/25 px-4 py-3">
                <button
                  onClick={() => toggleEvent(ev.id)}
                  aria-label={ev.done ? "Marcar como pendiente" : "Marcar como hecho"}
                  className={`shrink-0 w-6 h-6 rounded-full border-2 border-brand-bordo flex items-center justify-center text-xs transition-colors ${
                    ev.done ? "bg-brand-bordo text-brand-blanco" : "bg-transparent text-transparent"
                  }`}
                >
                  ✓
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`font-cocomat font-bold truncate ${ev.done ? "line-through opacity-50" : ""}`}>
                    {ev.title}
                  </p>
                  <p className="font-cocomat text-xs text-brand-bordo/60 truncate">
                    {ev.type}
                    {project ? ` · ${project.client} • ${project.name}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => deleteEvent(ev.id)}
                  aria-label="Eliminar"
                  className="shrink-0 w-8 h-8 rounded-full text-brand-bordo/40 hover:text-brand-bordo hover:bg-brand-bordo/10 transition-colors text-lg"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>

        <form onSubmit={handleAdd} className="space-y-3 border-t border-brand-bordo/15 pt-5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Subir reel de Casa Olmos"
            className="w-full rounded-xl border border-brand-bordo/20 bg-brand-blanco px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-bordo/40"
          />

          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-brand-bordo/20 bg-brand-blanco px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-bordo/40"
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-brand-bordo/20 bg-brand-blanco px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-bordo/40"
            >
              <option value="">Sin proyecto</option>
              {projects
                .filter((p) => !isArchived(p))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.client} • {p.name}
                  </option>
                ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-xl bg-brand-bordo text-brand-blanco font-lucidity uppercase tracking-wider py-3 hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Agregar al día
          </button>
        </form>
      </section>
    </div>
  );
};
