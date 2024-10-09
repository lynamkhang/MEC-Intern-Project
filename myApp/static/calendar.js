document.addEventListener("DOMContentLoaded", function () {
    const currentDate = new Date();
    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    const calendarState = {};

    function formatDataDate(calendarId) {
        const dataDate = document.getElementById(`txtDateDisplay${calendarId}`).value;
        if (dataDate) {
            let date = dataDate.split("-");
            let formattedDate = formatDate(date[0], parseInt(date[1], 10) - 1, date[2]);

            return formattedDate;
        }
        return ""; 
    }

    function populateYearSelector(calendarId, startYear, endYear) {
        const yearSelector = document.getElementById(`yearSelector${calendarId}`);
        for (let year = startYear; year <= endYear; year++) {
            yearSelector.appendChild(new Option(`${year}年`, year));
        }

        yearSelector.addEventListener('focus', function () { this.size = 10; });
        yearSelector.addEventListener('blur', function () { this.size = 1; });
        yearSelector.addEventListener('change', function () {
            this.size = 1;
            this.blur();
        });
    }

    // Convert to Japanese era
    function convertToJapaneseEra(year, month, day) {
        // Reiwa era (starts on May 1, 2019)
        if (year === 2019 && (month === 5 && day >= 1)) {
            return `R01`; 
        } else if (year > 2019) {
            return `R${(year - 2019 + 1).toString().padStart(2, '0')}`; 
        // Heisei era (January 8, 1989 - April 30, 2019)
        } else if (year === 2019 && month < 5) {
            return `H31`;
        } else if (year === 1989 && (month === 1 && day >= 8)) {
            return `H01`;
        } else if (year > 1989) {
            return `H${(year - 1989 + 1).toString().padStart(2, '0')}`; 
        // Showa era (December 25, 1926 - January 7, 1989)
        } else if (year === 1926 && (month > 11 && day >= 25)) {
            return `S01`; 
        } else if (year > 1926) {
            return `S${(year - 1926 + 1).toString().padStart(2, '0')}`; 
        } else if (year === 1989 && month === 0 && day < 8) {
            return `S64`; 
        // Taisho era (July 30, 1912 - December 24, 1926)
        } else if (year > 1912 || (year === 1912 && month > 6)) {
            return `T${(year - 1912 + 1).toString().padStart(2, '0')}`; 
        } else if (year === 1926 && month === 11 && day < 25) {
            return `T15`; 
        // Meiji era (January 25, 1868 - July 29, 1912)
        } else if (year === 1868 && (month === 1 && day >= 25)) {
            return `M01`; 
        } else if (year >= 1868 && month > 1) {
            return `M${(year - 1868 + 1).toString().padStart(2, '0')}`; 
        } else if (year === 1912 && month === 6 && day < 30) {
            return `M45`; 
        // For dates before Meiji era, just return the year
        } else {
            return year;
        }
    }

    function formatDate(year, month, day) {
        const formattedYear = convertToJapaneseEra(year, month + 1, day);
        const formattedMonth = (month + 1).toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');

        return `${formattedYear}.${formattedMonth}.${formattedDay}`;
    }

    function fillBlankDays(calendar, firstDayOfMonth) {
        for (let i = 0; i < firstDayOfMonth; i++) {
            const blankDay = document.createElement('div');
            blankDay.classList.add('day', 'empty');
            calendar.appendChild(blankDay);
        }
    }

    function createDayElement(calendarId, day, month, year) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerText = day;
    
        const dayOfWeek = new Date(year, month, day).getDay();
        if (dayOfWeek === 0) {
            dayElement.classList.add('sunday');
        } else if (dayOfWeek === 6) {
            dayElement.classList.add('saturday');
        }
    
        if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
            dayElement.classList.add('current');
        }
    
        // Restore selected 
        if (calendarState[calendarId].selectedDay === day &&
            calendarState[calendarId].selectedMonth === month &&
            calendarState[calendarId].selectedYear === year) {
            dayElement.classList.add('selected');
        }
    
        dayElement.addEventListener('click', function () {
            const calendarContainer = document.getElementById(`calendar${calendarId}`);
            let selectedDay = calendarContainer.querySelector('.selected');
    
            if (selectedDay) {
                selectedDay.classList.remove('selected');
            }
            dayElement.classList.add('selected');
    
            // Update the state with the selected day
            calendarState[calendarId].selectedDay = day;
            calendarState[calendarId].selectedMonth = month;
            calendarState[calendarId].selectedYear = year;
    
            const formattedDate = formatDate(year, month, day);
            const dateDisplay = document.getElementById(`txtDateDisplay${calendarId}`);
            dateDisplay.value = formattedDate;
    
            calendarContainer.style.display = 'none';
        });
    
        return dayElement;
    }
    
    function renderCalendar(calendarId, month, year, selectedDay = null) {
        const calendar = document.querySelector(`#days${calendarId}`);
        const monthElement = document.querySelector(`#month${calendarId}`);
        const yearSelector = document.getElementById(`yearSelector${calendarId}`);
    
        calendar.innerHTML = '';
    
        monthElement.innerText = months[month];
        yearSelector.value = year;
    
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        fillBlankDays(calendar, firstDayOfMonth);
        
        // Render days and check if they should be selected
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = createDayElement(calendarId, day, month, year);
            calendar.appendChild(dayElement);
        }

        const nextBtn = document.getElementById(`btnNext${calendarId}`);
        const prevBtn = document.getElementById(`btnPrevious${calendarId}`);

        prevBtn.onclick = function () {
            // Reset to the selected date when going to previous month
            const selectedDate = new Date(calendarState[calendarId].selectedYear, calendarState[calendarId].selectedMonth, calendarState[calendarId].selectedDay);
            selectedDate.setMonth(selectedDate.getMonth() - 1);
            calendarState[calendarId].currentMonth = selectedDate.getMonth();
            calendarState[calendarId].currentYear = selectedDate.getFullYear();
            renderCalendar(calendarId, calendarState[calendarId].currentMonth, calendarState[calendarId].currentYear, calendarState[calendarId].selectedDay);
        };

        nextBtn.onclick = function () {
            // Reset to the selected date when going to next month
            const selectedDate = new Date(calendarState[calendarId].selectedYear, calendarState[calendarId].selectedMonth, calendarState[calendarId].selectedDay);
            selectedDate.setMonth(selectedDate.getMonth() + 1);
            calendarState[calendarId].currentMonth = selectedDate.getMonth();
            calendarState[calendarId].currentYear = selectedDate.getFullYear();
            renderCalendar(calendarId, calendarState[calendarId].currentMonth, calendarState[calendarId].currentYear, calendarState[calendarId].selectedDay);
        };
    }
    
    function initializeCalendar(calendarId) {
        const selectedDate = document.getElementById(`txtDateDisplay${calendarId}`).value;
        let selectedDay = currentDate.getDate();
        let selectedMonth = currentDate.getMonth();
        let selectedYear = currentDate.getFullYear();

        if (selectedDate) {
            const dateParts = selectedDate.split("-");
            selectedDay = parseInt(dateParts[2]);
            selectedMonth = parseInt(dateParts[1]) - 1; // Adjust for zero-based index
            selectedYear = parseInt(dateParts[0]);
        }

        calendarState[calendarId] = {
            selectedDay,
            selectedMonth,
            selectedYear,
            currentMonth: selectedMonth,
            currentYear: selectedYear
        };

        populateYearSelector(calendarId, 1868, 2100);
        document.getElementById(`txtDateDisplay${calendarId}`).value = formatDataDate(calendarId);

        const yearSelector = document.getElementById(`yearSelector${calendarId}`);

        yearSelector.addEventListener("change", function (e) {
            calendarState[calendarId].currentYear = parseInt(e.target.value);
            renderCalendar(calendarId, calendarState[calendarId].currentMonth, calendarState[calendarId].currentYear, calendarState[calendarId].selectedDay);
        });

        renderCalendar(calendarId, calendarState[calendarId].currentMonth, calendarState[calendarId].currentYear, calendarState[calendarId].selectedDay);
    }

    // Toggle calendar function
    window.toggleCalendar = function(calendarId) {
        const calendarContainer = document.getElementById(`calendar${calendarId}`);
        const calendarInput = document.getElementById(`dateInput${calendarId}`);
        const isVisible = calendarContainer.style.display === 'flex';

        // Hide all calendars
        document.querySelectorAll('.calendar-container').forEach(function (dropdown) {
            dropdown.style.display = 'none';
        });

        if (!isVisible) {
            // Re-render the calendar using the selected day, month, and year from the state
            const { selectedDay, selectedMonth, selectedYear } = calendarState[calendarId];
            renderCalendar(calendarId, selectedMonth, selectedYear, selectedDay);
            calendarContainer.style.display = 'flex';
        } else {
            calendarContainer.style.display = 'none';
        }

        // Click event to close calendar when clicking outside
        document.addEventListener('click', function(event) {
            if (!calendarContainer.contains(event.target) && !calendarInput.contains(event.target)) {
                calendarContainer.style.display = 'none';
            }
        });
    };

    // Initialize the calendar
    initializeCalendar('AcceptDate');
    initializeCalendar('DraftDate');
    initializeCalendar('RegisterDate');
    initializeCalendar('ClosingDate');
    initializeCalendar('PaymentDate');
});
