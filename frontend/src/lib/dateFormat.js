export const dateFormat = (date) => {
  const d = new Date(date)

  const datePart = d.toLocaleDateString('vi-VN', {
    weekday: 'short',
    month: 'long',
    day: 'numeric'
  })

  const timePart = d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return `${timePart} ${datePart}`
}

export const formatDate = (date) => {
  if (!date) return ""; // hoặc return null nếu muốn

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleDateString("vi-VN");
};

