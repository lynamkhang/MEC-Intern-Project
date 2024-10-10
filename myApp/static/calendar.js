const currentDate = new Date();
const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const calendarState = {};

// Function to format date from data
function FormatDataDate(calendarId) {
    const inputDate = document.getElementById(`txtDateDisplay${calendarId}`).value;
    if (inputDate) {
        const [year, month, day] = inputDate.split("-");
        return formatDate(year, parseInt(month, 10) - 1, day);
    }
    return "";
}

// Populate year selector dropdown
function populateYearSelector(calendarId, startYear = 1868, endYear = 2100) {
    const yearSelector = document.getElementById(`yearSelector${calendarId}`);
    for (let year = startYear; year <= endYear; year++) {
        yearSelector.appendChild(new Option(`${year}年`, year));
    }

    // Setup year selector events
    yearSelector.addEventListener('focus', function () { this.size = 10; });
    yearSelector.addEventListener('blur', function () { this.size = 1; });
    yearSelector.addEventListener('click', function () {
        this.size = 1;
        this.blur();

        // Update selected year in calendar state and re-render
        calendarState[calendarId].currentYear = parseInt(this.value);
        renderCalendar(calendarId, calendarState[calendarId].currentMonth, parseInt(this.value));
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
        if (year > era.startYear || 
            (year === era.startYear && (month > era.startMonth || 
            (month === era.startMonth && day >= era.startDay)))) {

            return `${era.name}${(year - era.startYear + 1).toString().padStart(2, '0')}`;
        }
    }
    return year;
}

// Format the date using Japanese era
function formatDate(year, month, day) {
    const formattedYear = convertToJapaneseEra(year, month + 1, day);
    return `${formattedYear}.${(month + 1).toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}`;
}

// Create a day element in the calendar
function createDayElement(calendarId, day, month, year) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    dayElement.innerText = day;

    const dayOfWeek = new Date(year, month, day).getDay();

    // Add class for the day of the week (Sunday/Saturday)
    if (dayOfWeek === 0) dayElement.classList.add('sunday');
    if (dayOfWeek === 6) dayElement.classList.add('saturday');

    // Highlight the current day
    if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
        dayElement.classList.add('current');
    }

    if (isSelectedDay(calendarId, day, month, year)) {
        dayElement.classList.add('selected');
    }

    dayElement.addEventListener('click', () => handleDayClick(calendarId, dayElement, day, month, year));

    return dayElement;
}

// Check if the day is the selected day
function isSelectedDay(calendarId, day, month, year) {
    const { selectedDay, selectedMonth, selectedYear } = calendarState[calendarId];
    return selectedDay === day && selectedMonth === month && selectedYear === year;
}

// Handle the event when a day is clicked
function handleDayClick(calendarId, dayElement, day, month, year) {
    const calendarContainer = document.getElementById(`calendar${calendarId}`);
    const selectedDayElement = calendarContainer.querySelector('.selected');
    
    if (selectedDayElement) selectedDayElement.classList.remove('selected');
    dayElement.classList.add('selected');

    updateCalendarState(calendarId, day, month, year);
    document.getElementById(`txtDateDisplay${calendarId}`).value = formatDate(year, month, day);
    calendarContainer.style.display = 'none';
}

// Update the calendar state with selected date
function updateCalendarState(calendarId, day, month, year) {
    calendarState[calendarId] = { selectedDay: day, selectedMonth: month, selectedYear: year, currentMonth: month, currentYear: year };
}

// Render the calendar for a specific month and year
function renderCalendar(calendarId, month, year) {
    const calendar = document.querySelector(`#days${calendarId}`);
    const monthElement = document.querySelector(`#month${calendarId}`);
    const yearSelector = document.getElementById(`yearSelector${calendarId}`);

    calendar.innerHTML = '';
    monthElement.innerText = months[month];
    yearSelector.value = year;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill blank days
    for (let i = 0; i < firstDayOfMonth; i++) {
        const blankDay = document.createElement('div');
        blankDay.classList.add('day', 'empty');
        calendar.appendChild(blankDay);
    }

    // Create days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(calendarId, day, month, year);
        calendar.appendChild(dayElement);
    }

    const nextBtn = document.getElementById(`btnNext${calendarId}`);
    const prevBtn = document.getElementById(`btnPrevious${calendarId}`);

    prevBtn.onclick = () => navigateCalendar(calendarId, -1);
    nextBtn.onclick = () => navigateCalendar(calendarId, 1);
}

// Navigate the calendar (previous or next month)
function navigateCalendar(calendarId, direction) {
    const { currentMonth, currentYear } = calendarState[calendarId];

    if (currentMonth === 0 && direction === -1) {
        calendarState[calendarId].currentMonth = 11;
        calendarState[calendarId].currentYear = currentYear - 1;
    } else if (currentMonth === 11 && direction === 1) {
        calendarState[calendarId].currentMonth = 0;
        calendarState[calendarId].currentYear = currentYear + 1;
    } else {
        calendarState[calendarId].currentMonth += direction;
    }

    renderCalendar(calendarId, calendarState[calendarId].currentMonth, calendarState[calendarId].currentYear);
}

// Initialize the calendar for each date input
function initializeCalendar(calendarId) {
    const dateInput = document.getElementById(`txtDateDisplay${calendarId}`).value;
    const { selectedDay, selectedMonth, selectedYear } = getInitialDateValues(dateInput);

    updateCalendarState(calendarId, selectedDay, selectedMonth, selectedYear);
    populateYearSelector(calendarId);
    document.getElementById(`txtDateDisplay${calendarId}`).value = FormatDataDate(calendarId);
    renderCalendar(calendarId, selectedMonth, selectedYear);
}

// Get initial date values from the input or current date
function getInitialDateValues(selectedDate) {
    const currentDate = new Date();
    let [selectedDay, selectedMonth, selectedYear] = [currentDate.getDate(), currentDate.getMonth(), currentDate.getFullYear()];

    if (selectedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        [selectedDay, selectedMonth, selectedYear] = [day, month - 1, year];
    }

    return { selectedDay, selectedMonth, selectedYear };
}

// Toggle calendar visibility
function toggleCalendar(calendarId) {
    const calendarContainer = document.getElementById(`calendar${calendarId}`);
    const calendarInput = document.getElementById(`dateInput${calendarId}`);
    const isVisible = calendarContainer.style.display === 'flex';

    document.querySelectorAll('.calendar-container').forEach(dropdown => dropdown.style.display = 'none');

    if (!isVisible) {
        const { selectedMonth, selectedYear } = calendarState[calendarId];
        renderCalendar(calendarId, selectedMonth, selectedYear);
        calendarContainer.style.display = 'flex';
    }

    setupOutsideClickListener(calendarContainer, calendarInput, calendarId);
}

// Setup click outside listener for hiding the calendar
function setupOutsideClickListener(calendarContainer, calendarInput, calendarId) {
    const resetCalendarState = () => {
        const { selectedMonth, selectedYear } = calendarState[calendarId];
        calendarState[calendarId].currentMonth = selectedMonth;
        calendarState[calendarId].currentYear = selectedYear;
        calendarContainer.style.display = 'none';
    };

    const clickOutsideListener = (event) => {
        if (!calendarContainer.contains(event.target) && !calendarInput.contains(event.target)) {
            resetCalendarState();
            document.removeEventListener('click', clickOutsideListener);
        }
    };

    document.addEventListener('click', clickOutsideListener);
}

// Initialize calendars for each date input field
const dates = ['AcceptDate', 'DraftDate', 'RegisterDate', 'ClosingDate', 'PaymentDate' ];
dates.forEach(dateItem=>{
    initializeCalendar(dateItem)
})

