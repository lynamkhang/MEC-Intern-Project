document.addEventListener("DOMContentLoaded", function () {
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let currentDay = currentDate.getDate();

    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

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
            const option = document.createElement('option');
            option.value = year;
            option.text = `${year}年`;
            yearSelector.appendChild(option);
        }
    }

    // Convert to Japanese era
    function convertToJapaneseEra(year, month, day) {
         // Reiwa era (starts on May 1, 2019) Test OK
         if (year === 2019 && (month === 5 && day >= 1)) {
            return `R01`; 
        } else if (year > 2019) {
            return `R${(year - 2019 + 1).toString().padStart(2, '0')}`; 
        // Heisei era (January 8, 1989 - April 30, 2019) Test OK
        } else if (year === 2019 && month < 5) {
            return `H31`;
        } else if (year === 1989 && (month === 1 && day >= 8)) {
            return `H01`;
        } else if (year > 1989) {
            return `H${(year - 1989 + 1).toString().padStart(2, '0')}`; 
        // Showa era (December 25, 1926 - January 7, 1989) Test OK
        } else if (year === 1926 && (month > 11 && day >= 25)) {
            return `S01`; 
        } else if (year > 1926) {
            return `S${(year - 1926 + 1).toString().padStart(2, '0')}`; 
        } else if (year === 1989 && month === 0 && day < 8) {
            return `S64`; 
        // Taisho era (July 30, 1912 - December 24, 1926) Test OK
        } else if (year > 1912 || (year === 1912 && month > 6) ) {
            return `T${(year - 1912 + 1).toString().padStart(2, '0')}`; 
        } else if (year === 1926 && month === 11 && day < 25) {
            return `T15`; 
        // Meiji era (January 25, 1868 - July 29, 1912) Test OK
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

        if (day === currentDay && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
            dayElement.classList.add('current');
        }

        // Add click event listener to the day element
        dayElement.addEventListener('click', function () {
            const calendarContainer = document.getElementById(`calendar${calendarId}`);
            let selectedDay = calendarContainer.querySelector('.selected');

            // Highlight the selected day
            if (selectedDay) {
                selectedDay.classList.remove('selected');
            }
            dayElement.classList.add('selected');
            selectedDay = dayElement;

            // Display the selected date in the date-display input
            const formattedDate = formatDate(year, month, day);
            const dateDisplay = document.getElementById(`txtDateDisplay${calendarId}`);
            dateDisplay.value = formattedDate;

            // Hide the calendar after selecting a day
            calendarContainer.style.display = 'none';
        });

        return dayElement;
    }

    function renderDaysInMonth(calendar, month, year, daysInMonth, calendarId) {
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = createDayElement(calendarId, day, month, year);
            calendar.appendChild(dayElement);
        }
    }

    function renderCalendar(calendarId, month, year) {
        const calendar = document.querySelector(`#days${calendarId}`);
        const monthElement = document.querySelector(`#month${calendarId}`);
        const yearSelector = document.getElementById(`yearSelector${calendarId}`);

        calendar.innerHTML = '';

        monthElement.innerText = months[month];
        yearSelector.value = year;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        fillBlankDays(calendar, firstDayOfMonth);
        renderDaysInMonth(calendar, month, year, daysInMonth, calendarId);
    }

    function initializeCalendar(calendarId) {

        populateYearSelector(calendarId, 1868, 2100);

        renderCalendar(calendarId, currentYear, currentMonth);

        // Set default value for the calendar
        const dateDisplay = document.getElementById(`txtDateDisplay${calendarId}`);
        dateDisplay.value = formatDataDate(calendarId);

        document.getElementById(`btnNext${calendarId}`).addEventListener("click", function () {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(calendarId, currentMonth, currentYear);
        });

        document.getElementById(`btnPrevious${calendarId}`).addEventListener("click", function () {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(calendarId, currentMonth, currentYear);
        });

        // Handle year change in selector
        document.getElementById(`yearSelector${calendarId}`).addEventListener("change", function (e) {
            currentYear = parseInt(e.target.value);
            renderCalendar(calendarId, currentMonth, currentYear);
        });

        renderCalendar(calendarId, currentMonth, currentYear);
    }

    // Initialize the calendar
    initializeCalendar('AcceptDate');
    initializeCalendar('DraftDate');
    initializeCalendar('RegisterDate');
    initializeCalendar('ClosingDate');
    initializeCalendar('PaymentDate');
});

function toggleCalendar(calendarId) {
    const calendarContainer = document.getElementById(`calendar${calendarId}`);
    const calendarInput = document.getElementById(`dateInput${calendarId}`);
    const isVisible = calendarContainer.style.display === 'flex';

    const allDropdowns = document.querySelectorAll('.calendar-container');
    allDropdowns.forEach(function (dropdown) {
        dropdown.style.display = 'none';
    });

    document.addEventListener('click', function(event) {
        if (!calendarContainer.contains(event.target) && !calendarInput.contains(event.target)) {
            calendarContainer.style.display = 'none';
        }
    });
    
    calendarContainer.style.display = isVisible ? 'none' : 'flex';
}

