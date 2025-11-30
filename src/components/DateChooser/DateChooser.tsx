import React, { useState, useEffect } from 'react';
import './DateChooser.css';

export interface DateChooserProps {
  defaultDate?: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void; // Returns YYYY-MM-DD format
  label?: string;
  required?: boolean;
}

/**
 * Calculate the nearest gift-giving date (Christmas or birthday)
 * @param birthdayMonth - Month (1-12) or null
 * @param birthdayDay - Day (1-31) or null
 * @returns Date string in YYYY-MM-DD format
 */
export const calculateNearestGiftDate = (
  birthdayMonth: number | null,
  birthdayDay: number | null
): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentDay = today.getDate();

  // Calculate next Christmas
  let nextChristmas: Date;
  if (currentMonth < 12 || (currentMonth === 12 && currentDay < 25)) {
    // Christmas hasn't passed this year
    nextChristmas = new Date(currentYear, 11, 25); // Month is 0-indexed
  } else {
    // Christmas has passed, use next year
    nextChristmas = new Date(currentYear + 1, 11, 25);
  }

  // If no birthday, default to Christmas
  if (!birthdayMonth || !birthdayDay) {
    return formatDateForInput(nextChristmas);
  }

  // Calculate next birthday
  let nextBirthday: Date;
  const birthdayThisYear = new Date(
    currentYear,
    birthdayMonth - 1,
    birthdayDay
  );

  if (birthdayThisYear > today) {
    // Birthday hasn't passed this year
    nextBirthday = birthdayThisYear;
  } else {
    // Birthday has passed, use next year
    nextBirthday = new Date(currentYear + 1, birthdayMonth - 1, birthdayDay);
  }

  // Return whichever is sooner
  return nextBirthday <= nextChristmas
    ? formatDateForInput(nextBirthday)
    : formatDateForInput(nextChristmas);
};

/**
 * Format a Date object to YYYY-MM-DD string for input[type="date"]
 */
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Reusable date picker component using native HTML5 date input
 */
export const DateChooser = React.memo((props: DateChooserProps) => {
  const { defaultDate, onDateChange, label, required = false } = props;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate || '');

  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(defaultDate);
    }
  }, [defaultDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  return (
    <div className="date-chooser">
      {label && (
        <label htmlFor="date-chooser-input" className="date-chooser-label">
          {label}
          {required && <span className="date-chooser-required"> *</span>}
        </label>
      )}
      <input
        id="date-chooser-input"
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        required={required}
        className="date-chooser-input"
      />
    </div>
  );
});

DateChooser.displayName = 'DateChooser';

export default DateChooser;
