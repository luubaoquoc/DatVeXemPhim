// Local datetime (yyyy-MM-ddTHH:mm) -> UTC ISO
export const localToUTC = (localDatetime) => {
  if (!localDatetime) return null;
  return new Date(localDatetime).toISOString();
};

// UTC datetime -> datetime-local string
export const utcToLocalInput = (utcDate) => {
  if (!utcDate) return "";
  const d = new Date(utcDate);

  const local = new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes()
  );

  const pad = (n) => String(n).padStart(2, "0");

  return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
};
