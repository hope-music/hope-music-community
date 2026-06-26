"use client";

import { useState, useRef, useEffect } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(s: string): string {
  if (!s) return "MM/DD/YYYY";
  const d = parseDate(s);
  if (!d) return "MM/DD/YYYY";
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

interface MonthCalendarProps {
  year: number;
  month: number;
  selectedStart: Date | null;
  selectedEnd: Date | null;
  hoverDate: Date | null;
  onDateClick: (d: Date) => void;
  onDateHover: (d: Date | null) => void;
  selecting: "start" | "end";
}

function MonthCalendar({ year, month, selectedStart, selectedEnd, hoverDate, onDateClick, onDateHover, selecting }: MonthCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const effectiveEnd = selectedEnd ?? hoverDate;

  const isInRange = (d: Date) => {
    if (!selectedStart) return false;
    const end = effectiveEnd;
    if (!end) return false;
    const lo = selectedStart < end ? selectedStart : end;
    const hi = selectedStart < end ? end : selectedStart;
    return d >= lo && d <= hi;
  };

  const isStart = (d: Date) => selectedStart && d.getTime() === selectedStart.getTime();
  const isEnd = (d: Date) => selectedEnd && d.getTime() === selectedEnd.getTime();

  return (
    <div className="flex-1">
      <div className="mb-3 text-center text-sm font-semibold text-gray-800">
        {MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 gap-0 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-xs font-medium text-gray-500 py-1">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, idx) => {
          if (day === null) return <div key={idx} className="h-9" />;
          const d = new Date(year, month, day);
          const isPast = d < today;
          const inRange = isInRange(d);
          const start = isStart(d);
          const end = isEnd(d);
          const isToday = d.getTime() === today.getTime();

          return (
            <button
              key={idx}
              type="button"
              disabled={isPast}
              onClick={() => !isPast && onDateClick(d)}
              onMouseEnter={() => !isPast && onDateHover(d)}
              onMouseLeave={() => onDateHover(null)}
              className={[
                "h-9 text-sm transition-colors",
                isPast ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100",
                inRange && !start && !end ? "bg-blue-50" : "",
                start || end ? "bg-blue-600 text-white hover:bg-blue-700" : "",
                isToday && !start && !end ? "font-semibold underline" : "",
                selecting === "start" && start ? "ring-2 ring-blue-300" : "",
              ].filter(Boolean).join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDate(startDate) ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [tempStart, setTempStart] = useState<Date | null>(parseDate(startDate));
  const [tempEnd, setTempEnd] = useState<Date | null>(parseDate(endDate));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    setTempStart(parseDate(startDate));
    setTempEnd(parseDate(endDate));
  }, [startDate, endDate]);

  const handleDateClick = (d: Date) => {
    if (selecting === "start") {
      setTempStart(d);
      setTempEnd(null);
      onStartDateChange(formatDate(d));
      onEndDateChange("");
      setSelecting("end");
    } else {
      if (tempStart && d < tempStart) {
        setTempStart(d);
        onStartDateChange(formatDate(d));
      } else {
        setTempEnd(d);
        onEndDateChange(formatDate(d));
      }
      setSelecting("start");
    }
  };

  const handleApply = () => {
    setOpen(false);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    onStartDateChange("");
    onEndDateChange("");
    setSelecting("start");
  };

  const displayText = startDate || endDate
    ? `${formatDisplay(startDate)} - ${formatDisplay(endDate)}`
    : "All Dates";

  const nextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const today = new Date();
    const prev = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setViewMonth(prev);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          "h-10 inline-flex items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors border " +
          (open
            ? "bg-hmc-orange text-white border-hmc-orange"
            : "bg-white text-gray-700 border-gray-300 hover:border-gray-400")
        }
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {startDate || endDate ? `${formatDisplay(startDate)} - ${formatDisplay(endDate)}` : "All Dates"}
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-gray-200 bg-white shadow-xl p-4" style={{ width: "640px" }}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Start date</label>
              <input
                type="text"
                readOnly
                value={formatDisplay(startDate)}
                placeholder="MM/DD/YYYY"
                className={"w-full border px-3 py-2 text-sm outline-none " + (selecting === "start" ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300")}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">End date</label>
              <input
                type="text"
                readOnly
                value={formatDisplay(endDate)}
                placeholder="MM/DD/YYYY"
                className={"w-full border px-3 py-2 text-sm outline-none " + (selecting === "end" ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-300")}
              />
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="mt-5 flex h-9 w-9 items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label="Next month"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex gap-6">
            <MonthCalendar
              year={viewMonth.getFullYear()}
              month={viewMonth.getMonth()}
              selectedStart={tempStart}
              selectedEnd={tempEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              selecting={selecting}
            />
            <MonthCalendar
              year={new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1).getFullYear()}
              month={new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1).getMonth()}
              selectedStart={tempStart}
              selectedEnd={tempEnd}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              selecting={selecting}
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={handleClear}
              className="rounded border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
