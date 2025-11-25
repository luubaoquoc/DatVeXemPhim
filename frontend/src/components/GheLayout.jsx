// GheLayout.jsx
import React, { useMemo } from "react";

// Component hiển thị 1 ghế
const Seat = ({ seat, isBooked, isSelected, onClick, mode }) => {
  const disabled = mode === "booking" ? (isBooked || !seat.trangThai) : false;

  const bg = mode === "management"
    ? seat.trangThai
      ? "bg-primary/20"  // khả dụng
      : "bg-gray-600"    // khóa/hỏng
    : isBooked
      ? "bg-primary/60 text-white cursor-not-allowed"
      : isSelected
        ? "bg-primary text-white"
        : seat.trangThai
          ? "bg-primary/20"
          : "bg-gray-600";

  return (
    <button
      className={`w-8 h-8 rounded border border-primary/60 text-xs ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${bg}`}
      disabled={disabled}
      title={seat.maGhe}
      onClick={() => onClick?.(seat)}
    >
      {seat.hang}{seat.soGhe}
    </button>
  );
};

// Layout toàn bộ ghế
const GheLayout = ({ seats = [], bookedSeats = [], selectedSeats = [], onSelectSeat, onToggle, mode = "booking" }) => {
  const bookedSet = useMemo(
    () => new Set(bookedSeats.map(s => String(s).trim().toUpperCase())),
    [bookedSeats]
  );

  const seatsByRow = useMemo(() => {
    const groups = {};
    seats.forEach(s => {
      const row = s.hang;
      if (!groups[row]) groups[row] = [];
      groups[row].push(s);
    });
    Object.keys(groups).forEach(r => {
      groups[r].sort((a, b) => Number(a.soGhe) - Number(b.soGhe));
    });
    return groups;
  }, [seats]);

  const rowsOrdered = useMemo(() => Object.keys(seatsByRow).sort(), [seatsByRow]);

  return (
    <div className="flex flex-col items-center text-xs text-gray-300 my-8">
      {rowsOrdered.map(row => (
        <div key={row} className="flex gap-2 mt-2">
          {seatsByRow[row].map(s => {
            const maGhe = `${s.hang}${s.soGhe}`.trim().toUpperCase(); // chỉ dùng hang+soGhe
            const isBooked = bookedSet.has(maGhe);
            const isSelected = selectedSeats.includes(maGhe);
            return (
              <Seat
                key={maGhe}
                seat={s}
                isBooked={isBooked}
                isSelected={isSelected}
                mode={mode}
                onClick={mode === "management" ? onToggle : onSelectSeat}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default GheLayout;
