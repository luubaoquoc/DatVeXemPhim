
// UTC datetime -> datetime-local string
export const ToLocalInput = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
};
