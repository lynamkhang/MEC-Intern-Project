document.addEventListener("DOMContentLoaded", function() {
    const calendar = document.querySelector('.days');
    const currentDate = new Date(); // Get the current date
    let currentMonth = currentDate.getMonth(); // Get the current month (0-indexed)
    let currentYear = currentDate.getFullYear(); // Get the current year
    let currentDay = currentDate.getDate(); // Get the current day
    let selectedDay = null; // Track the selected day

    const monthElement = document.querySelector('.month');
    const yearElement = document.querySelector('.year');
    const dateInput = document.querySelector('input'); 
    
    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

    // Function to convert to Japanese era
    function formatCalendar(year, month, day) {
        // Reiwa era (starts on May 1, 2019)
        if (year === 2019 && (month > 4 && day >= 1)) {
            return `R01`;
        } else if (year > 2019) {
            return `R${(year - 2019 + 1).toString().padStart(2, '0')}`; 
        // Heisei era (January 8, 1989 - April 30, 2019)
        } else if (year === 2019 && month < 5) {
            return `H31`;
        } else if (year === 1989 && (month === 0 && day >= 8)) {
            return `H01`;
        } else if (year >= 1989  && month > 1) {
            return `H${(year - 1989 + 1).toString().padStart(2, '0')}`; 
        // Showa era (December 25, 1926 - January 7, 1989)
        } else if (year === 1926 && (month > 11 && day >= 25)) {
            return `S01`; 
        } else if (year > 1926) {
            return `S${(year - 1926 + 1).toString().padStart(2, '0')}`; 
        } else if (year === 1989 && month === 0 && day < 8) {
            return `S64`; 
        // Taisho era (July 30, 1912 - December 24, 1926)
        } else if (year === 1912 && (month > 6 && day >= 30)) {
            return `T01`; 
        } else if (year > 1912) {
            return `T${(year - 1912 + 1).toString().padStart(2, '0')}`; 
        } else if (year === 1926 && month === 11 && day < 25) {
            return `T15`; 
        // Meiji era (January 25, 1868 - July 29, 1912)
        } else if (year === 1868 && (month > 0 && day >= 25)) {
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

    // Function to render the calendar
    function renderCalendar(month, year) {
        calendar.innerHTML = ''; // Clear the previous days
        monthElement.innerText = months[month]; // Update the month in the header
        yearElement.innerText = `${year}年`; // Update the year in the header
        
        // Get the number of days in the current month and the first day of the week
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // Day of the week the month starts on
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Number of days in the month

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
                dayElement.classList.add('current'); // Add a class to highlight today
            }

            // Add event listener to select a day
            dayElement.addEventListener('click', function() {
                // Remove the highlight from the previously selected day
                if (selectedDay) {
                    selectedDay.classList.remove('selected');
                }

                // Highlight the selected day
                dayElement.classList.add('selected');
                selectedDay = dayElement;

                // Format the selected date manually as YYYY-MM-DD
                const formattedYear = formatCalendar(year, month + 1, day);
                const formattedMonth = (month + 1).toString().padStart(2, '0');
                const formattedDay = day.toString().padStart(2, '0'); 
                const selectedDate = `${formattedYear}.${formattedMonth}.${formattedDay}`;
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
