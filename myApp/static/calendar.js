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

            // Update the state with the selected year and re-render the calendar
            const selectedYear = parseInt(this.value);
            calendarState[calendarId].currentYear = selectedYear;
        
            renderCalendar(calendarId, calendarState[calendarId].currentMonth, selectedYear, calendarState[calendarId].selectedDay);
        });
    }

    // Convert to Japanese era
    function convertToJapaneseEra(year, month, day) {
        const eraMappings = [
            { name: "R", startYear: 2019, startMonth: 5, startDay: 1 },
            { name: "H", startYear: 1989, startMonth: 1, startDay: 8 },
            { name: "S", startYear: 1926, startMonth: 12, startDay: 25 },
            { name: "T", startYear: 1912, startMonth: 7, startDay: 30 },
            { name: "M", startYear: 1868, startMonth: 1, startDay: 25 }
        ];

        for (const era of eraMappings) {
            if (year > era.startYear || (year === era.startYear && 
                (month > era.startMonth || (month === era.startMonth && 
                day >= era.startDay)))) {

                return `${era.name}${(year - era.startYear + 1).toString().padStart(2, '0')}`;
            }
        }
        return year;
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
    
        // Set day of week class (Sunday, Saturday, or weekday)
        const dayOfWeek = new Date(year, month, day).getDay();
        addDayOfWeekClass(dayElement, dayOfWeek);
    
        // Highlight the current day
        highlightCurrentDay(dayElement, day, month, year);
    
        // Highlight selected day from calendar state
        if (isSelectedDay(calendarId, day, month, year)) {
            dayElement.classList.add('selected');
        }
    
        // Set up the click event listener for selecting the day
        dayElement.addEventListener('click', function () {
            handleDayClick(calendarId, dayElement, day, month, year);
        });
    
        return dayElement;
    }
    
    // Function to add the day of week class
    function addDayOfWeekClass(dayElement, dayOfWeek) {
        if (dayOfWeek === 0) {
            dayElement.classList.add('sunday');
        } else if (dayOfWeek === 6) {
            dayElement.classList.add('saturday');
        }
    }
    
    // Function to highlight the current day
    function highlightCurrentDay(dayElement, day, month, year) {
        if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
            dayElement.classList.add('current');
        }
    }
    
    // Function to check if the day is selected
    function isSelectedDay(calendarId, day, month, year) {
        const { selectedDay, selectedMonth, selectedYear } = calendarState[calendarId];
        return selectedDay === day && selectedMonth === month && selectedYear === year;
    }
    
    // Event handler for when a day is clicked
    function handleDayClick(calendarId, dayElement, day, month, year) {
        const calendarContainer = document.getElementById(`calendar${calendarId}`);
        const selectedDayElement = calendarContainer.querySelector('.selected');
    
        // Remove the previous selection
        if (selectedDayElement) {
            selectedDayElement.classList.remove('selected');
        }
    
        // Mark the clicked day as selected
        dayElement.classList.add('selected');
    
        // Update the calendar state with the newly selected day
        calendarState[calendarId] = { 
            selectedDay: day, 
            selectedMonth: month, 
            selectedYear: year 
        };
    
        // Update the date display input with the formatted date
        const formattedDate = formatDate(year, month, day);
        document.getElementById(`txtDateDisplay${calendarId}`).value = formattedDate;
    
        // Hide the calendar after selection
        calendarContainer.style.display = 'none';
    }    
    
    function renderCalendar(calendarId, month, year, selectedDay = null) {
        const calendar = document.querySelector(`#days${calendarId}`);
        const monthElement = document.querySelector(`#month${calendarId}`);
        const yearSelector = document.getElementById(`yearSelector${calendarId}`);
        
        // Clear the current calendar content
        calendar.innerHTML = '';
        
        // Update month and year display
        monthElement.innerText = months[month];
        yearSelector.value = year;
        
        // Calculate first day of the month and number of days in the month
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Fill blank days at the start of the calendar
        fillBlankDays(calendar, firstDayOfMonth);
        
        // Render the actual days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = createDayElement(calendarId, day, month, year);
            calendar.appendChild(dayElement);
        }
    
        // Update the navigation buttons' functionality
        setupCalendarNavigation(calendarId);
    }
    
    // Handle calendar navigation (Next/Previous buttons)
    function setupCalendarNavigation(calendarId) {
        const { currentMonth, selectedDay } = calendarState[calendarId];
        
        const nextBtn = document.getElementById(`btnNext${calendarId}`);
        const prevBtn = document.getElementById(`btnPrevious${calendarId}`);
        
        // Previous button functionality
        prevBtn.onclick = function () {
            if (currentMonth === 0) {
                calendarState[calendarId].currentMonth = 11;
                calendarState[calendarId].currentYear--;
            } else {
                calendarState[calendarId].currentMonth--;
            }
            renderCalendar(calendarId, calendarState[calendarId].currentMonth, calendarState[calendarId].currentYear, selectedDay);
        };
        
        // Next button functionality
        nextBtn.onclick = function () {
            if (currentMonth === 11) {
                calendarState[calendarId].currentMonth = 0;
                calendarState[calendarId].currentYear++;
            } else {
                calendarState[calendarId].currentMonth++;
            }
            renderCalendar(calendarId, calendarState[calendarId].currentMonth, calendarState[calendarId].currentYear, selectedDay);
        };
    }
    
    function initializeCalendar(calendarId) {
        const dateInput = document.getElementById(`txtDateDisplay${calendarId}`).value;
        let { selectedDay, selectedMonth, selectedYear } = getInitialDateValues(dateInput);
    
        // Store the current state for the calendar
        calendarState[calendarId] = {
            selectedDay,
            selectedMonth,
            selectedYear,
            currentMonth: selectedMonth,
            currentYear: selectedYear
        };
    
        // Populate the year selector and update the input field with the formatted date
        populateYearSelector(calendarId, 1868, 2100);
        document.getElementById(`txtDateDisplay${calendarId}`).value = formatDataDate(calendarId);
    
        // Render the calendar with the current state
        renderCalendar(calendarId, selectedMonth, selectedYear, selectedDay);
    }
    
    // Function to extract the initial date values from input or use the current date
    function getInitialDateValues(selectedDate) {
        const currentDate = new Date();
        
        // Default to the current date if no date is selected
        let selectedDay = currentDate.getDate();
        let selectedMonth = currentDate.getMonth(); 
        let selectedYear = currentDate.getFullYear();
        
        // If a date is provided, parse it
        if (selectedDate) {
            const [year, month, day] = selectedDate.split("-").map(Number);
            selectedDay = day;
            selectedMonth = month - 1;  // Convert to 0-based index for JavaScript Date
            selectedYear = year;
        }
        
        return { selectedDay, selectedMonth, selectedYear };
    }
    
    // Toggle calendar function
    window.toggleCalendar = function (calendarId) {
        const calendarContainer = document.getElementById(`calendar${calendarId}`);
        const calendarInput = document.getElementById(`dateInput${calendarId}`);
        const isVisible = calendarContainer.style.display === 'flex';

        // Hide all calendars
        document.querySelectorAll('.calendar-container').forEach(dropdown => {
            dropdown.style.display = 'none';
        });

        if (!isVisible) {
            // Re-render the calendar using the selected day, month, and year from the state
            const { selectedMonth, selectedYear, selectedDay } = calendarState[calendarId];
            renderCalendar(calendarId, selectedMonth, selectedYear, selectedDay);
            calendarContainer.style.display = 'flex';
        }

        const resetCalendarState = () => {
            const { selectedMonth, selectedYear } = calendarState[calendarId];
            calendarState[calendarId].currentMonth = selectedMonth; // Reset current month
            calendarState[calendarId].currentYear = selectedYear;   // Reset current year
            calendarContainer.style.display = 'none';
        };

        // Click event to close calendar when clicking outside
        const clickOutsideListener = (event) => {
            if (!calendarContainer.contains(event.target) && !calendarInput.contains(event.target)) {
                resetCalendarState();
                document.removeEventListener('click', clickOutsideListener); // Remove event listener after closing
            }
        };

        document.addEventListener('click', clickOutsideListener);
    };

    // Initialize the calendar
    ['AcceptDate', 'DraftDate', 'RegisterDate', 'ClosingDate', 'PaymentDate'].forEach(initializeCalendar);
});
