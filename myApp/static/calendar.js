document.addEventListener("DOMContentLoaded", function() {
    const calendar = document.querySelector('.days');
    const currentDate = new Date(); 
    let currentMonth = currentDate.getMonth(); 
    let currentYear = currentDate.getFullYear(); 
    let currentDay = currentDate.getDate(); 
    let selectedDay = null; // Track the selected day

    const monthElement = document.querySelector('.month');
    const dateInput = document.querySelector('#txtDateDisplay'); 
    
    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    
    const calendarContainer = document.querySelector('.calendar-container');
    const calendarInput = document.querySelector('.date-input');

    const yearSelector = document.getElementById('yearSelector');

    // Populate year selector with a range of years 
    function populateYearSelector(startYear, endYear) {
        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.text = `${year}年`;
            yearSelector.appendChild(option);
        }
    }

    // Initialize the year selector
    populateYearSelector(1868, 2100);

    // Set the year selector to the current year by default
    yearSelector.value = currentYear;
    
    // Handle year change event
    yearSelector.addEventListener('change', function() {
        currentYear = parseInt(this.value); // Get the selected year
        renderCalendar(currentMonth, currentYear); 
    });

    // Toggle the visibility of the calendar
    calendarInput.addEventListener('click', function() {
        if (calendarContainer.style.display === 'none') {
            calendarContainer.style.display = 'flex';
        } else {
            calendarContainer.style.display = 'none';
        }
    });

    // Function to convert to Japanese era
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

    function renderCalendar(month, year) {
        calendar.innerHTML = ''; // Clear previous days
        
        // Ensure correct month and year are displayed
        monthElement.innerText = months[month];
        yearSelector.value = year; // Use the yearSelector dropdown to show the year
    
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
    
        // Fill in the blank days for the first week
        for (let i = 0; i < firstDayOfMonth; i++) {
            const blankDay = document.createElement('div');
            blankDay.classList.add('day', 'empty');
            calendar.appendChild(blankDay); 
        }
    
        // Fill the calendar with actual days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.innerText = day;
    
            // Highlight the current day
            if (day === currentDay && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                dayElement.classList.add('current');
            }
    
            // Handle day selection and update input
            dayElement.addEventListener('click', function() {
                if (selectedDay) {
                    selectedDay.classList.remove('selected');
                }
                dayElement.classList.add('selected');
                selectedDay = dayElement;
                
                const selectedDate = formatDate(year, month, day)
                dateInput.value = selectedDate;
            });
    
            calendar.appendChild(dayElement);
        }
    }

    // Initial rendering of the calendar
    renderCalendar(currentMonth, currentYear);

    // Next and Previous button functionality
    document.getElementById("btnNext").addEventListener("click", function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0; // Reset to January
            currentYear++; 
        }
        renderCalendar(currentMonth, currentYear); // Render the updated calendar
    });

    document.getElementById("btnPrevious").addEventListener("click", function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11; // Reset to December
            currentYear--; 
        }
        renderCalendar(currentMonth, currentYear); // Render the updated calendar
    });
});
