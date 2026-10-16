export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-AR", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

export const toDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const isArchived = (project) => project.status === "completed" && project.paymentStatus === "paid";
