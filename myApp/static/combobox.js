// Function to toggle dropdown visibility
function toggleDropdown(comboboxId) {
    var dropdownMenu = document.getElementById('dropdownMenu' + comboboxId);
    var isVisible = dropdownMenu.style.display === 'block';

    // Hide all other dropdowns before showing the current one
    var allDropdowns = document.querySelectorAll('.dropdown-menu');
    allDropdowns.forEach(function(dropdown) {
        dropdown.style.display = 'none';
    });

    // Toggle the current dropdown menu
    dropdownMenu.style.display = isVisible ? 'none' : 'block';
}

// Function to select an option from the dropdown
function selectOption(optionId, optionName, comboboxId) {
    // Set the selected value and text in the combobox
    var comboboxInput = document.getElementById(comboboxId);
    comboboxInput.value = optionId;

    var selectedTextSpan = document.getElementById('selectedText' + comboboxId);
    selectedTextSpan.textContent = optionName;

    // Hide the dropdown after selection
    var dropdownMenu = document.getElementById('dropdownMenu' + comboboxId);
    dropdownMenu.style.display = 'none';
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    var isComboboxClick = event.target.closest('.combobox-container');
    
    // Hide all dropdowns if click is outside any combobox
    if (!isComboboxClick) {
        var allDropdowns = document.querySelectorAll('.dropdown-menu');
        allDropdowns.forEach(function(dropdown) {
            dropdown.style.display = 'none';
        });
    }
});
