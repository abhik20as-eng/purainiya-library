// ===== AUTHENTICATION SYSTEM =====

// Check if admin credentials exist
function checkAdminExists() {
    return localStorage.getItem('adminCredentials') !== null;
}

// Create admin credentials (first time setup)
function createAdmin(username, password) {
    const credentials = {
        username: username,
        password: btoa(password) // Simple encoding (base64)
    };
    localStorage.setItem('adminCredentials', JSON.stringify(credentials));
}

// Verify login credentials
function verifyLogin(username, password) {
    const stored = localStorage.getItem('adminCredentials');
    if (!stored) return false;
    
    const credentials = JSON.parse(stored);
    return credentials.username === username && credentials.password === btoa(password);
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Set logged in status
function setLoggedIn(status) {
    localStorage.setItem('isLoggedIn', status);
}

// Show/Hide screens
function showLoginScreen() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    initializeYearSelector();
    renderMembers();
}

// ===== YEAR MANAGEMENT =====

let currentYear = new Date().getFullYear();

// Get current year
function getCurrentYear() {
    return currentYear;
}

// Initialize year selector
function initializeYearSelector() {
    const yearSelect = document.getElementById('yearSelect');
    const allMembers = loadAllMembers();
    
    // Get all unique years from existing data
    const years = new Set();
    years.add(new Date().getFullYear()); // Always include current year
    
    Object.keys(allMembers).forEach(year => {
        years.add(parseInt(year));
    });
    
    // Sort years in descending order
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    // Populate year dropdown
    yearSelect.innerHTML = '';
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    });
    
    // Add change event listener
    yearSelect.addEventListener('change', (e) => {
        currentYear = parseInt(e.target.value);
        renderMembers();
    });
}

// ===== MEMBER MANAGEMENT SYSTEM =====

// Get today's date in DD/MM/YYYY format
function getTodayDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

// Shift options (6:00 AM start, 4-hour shifts)
const shifts = [
    '6:00 AM - 10:00 AM',
    '10:00 AM - 2:00 PM',
    '2:00 PM - 6:00 PM',
    '6:00 PM - 10:00 PM',
    '10:00 PM - 2:00 AM',
    '2:00 AM - 6:00 AM'
];

// Months array
const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Payment per shift per month
const PAYMENT_PER_SHIFT_PER_MONTH = 500;

// Load all members (all years)
function loadAllMembers() {
    const allMembers = localStorage.getItem('libraryMembersAllYears');
    return allMembers ? JSON.parse(allMembers) : {};
}

// Save all members (all years)
function saveAllMembers(allMembers) {
    localStorage.setItem('libraryMembersAllYears', JSON.stringify(allMembers));
}

// Load members for specific year
function loadMembers(year = currentYear) {
    const allMembers = loadAllMembers();
    return allMembers[year] || [];
}

// Save members for specific year
function saveMembers(members, year = currentYear) {
    const allMembers = loadAllMembers();
    allMembers[year] = members;
    saveAllMembers(allMembers);
}

// Calculate total payment for a member
function calculateTotalPayment(payments, selectedShifts) {
    if (!payments || !selectedShifts || selectedShifts.length === 0) return 0;
    
    let totalPaid = 0;
    const shiftsCount = selectedShifts.length;
    
    // For each month that's checked, multiply by number of shifts
    Object.values(payments).forEach(isPaid => {
        if (isPaid) {
            totalPaid += (PAYMENT_PER_SHIFT_PER_MONTH * shiftsCount);
        }
    });
    
    return totalPaid;
}

// Update summary (total students and total amount)
function updateSummary() {
    const members = loadMembers(currentYear);
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    let visibleMembers = members;
    
    // Filter by search if active
    if (searchTerm) {
        visibleMembers = members.filter(member => 
            member.mobile && member.mobile.includes(searchTerm)
        );
    }
    
    const totalStudents = visibleMembers.length;
    const totalAmount = visibleMembers.reduce((sum, member) => {
        return sum + calculateTotalPayment(member.payments, member.selectedShifts);
    }, 0);
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalAmount').textContent = totalAmount;
}

// Print bill for a member - SINGLE PAGE VERSION
function printMemberBill(index) {
    const members = loadMembers(currentYear);
    const member = members[index];
    
    if (!member.name || !member.mobile) {
        alert('Please fill member name and mobile number before printing bill!');
        return;
    }
    
    const selectedShiftsCount = member.selectedShifts ? member.selectedShifts.length : 0;
    const paidMonths = member.payments ? Object.keys(member.payments).filter(month => member.payments[month] === true) : [];
    const totalPayment = calculateTotalPayment(member.payments, member.selectedShifts);
    const perMonthCharge = selectedShiftsCount * PAYMENT_PER_SHIFT_PER_MONTH;
    
    // Generate bill HTML - COMPACT SINGLE PAGE VERSION
    const paidMonthsList = paidMonths.length > 0 
        ? paidMonths.join(', ') 
        : 'No payments recorded';
    
    const billHTML = `
        <div style="max-width: 800px; margin: 0 auto; padding: 30px; font-family: Arial, sans-serif; color: black;">
            <!-- Header -->
            <div style="text-align: center; border-bottom: 3px solid black; padding-bottom: 15px; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 28px;">Purainiya Library</h1>
                <h2 style="margin: 8px 0 0 0; font-size: 20px;">Aspirants Payment Bill</h2>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Year: ${currentYear}</p>
            </div>
            
            <!-- Member Details - Compact Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 8px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold; width: 150px;">Name:</td>
                    <td style="padding: 8px; border: 2px solid black;">${member.name}</td>
                    <td style="padding: 8px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold; width: 150px;">Mobile:</td>
                    <td style="padding: 8px; border: 2px solid black;">${member.mobile}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold;">Date of Joining:</td>
                    <td style="padding: 8px; border: 2px solid black;">${member.doj}</td>
                    <td style="padding: 8px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold;">Bill Date:</td>
                    <td style="padding: 8px; border: 2px solid black;">${getTodayDate()}</td>
                </tr>
            </table>
            
            <!-- Shifts and Payment in Two Columns -->
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <!-- Left Column: Shifts -->
                <div style="flex: 1;">
                    <h3 style="border-bottom: 2px solid black; padding-bottom: 8px; margin: 0 0 10px 0; font-size: 16px;">Selected Shifts</h3>
                    <div style="padding: 12px; border: 2px solid black; background-color: #f9f9f9; min-height: 120px;">
                        ${member.selectedShifts && member.selectedShifts.length > 0 
                            ? member.selectedShifts.map(shift => `<div style="padding: 3px; font-size: 13px;">• ${shift}</div>`).join('') 
                            : '<div style="padding: 3px; font-size: 13px;">No shifts selected</div>'}
                    </div>
                </div>
                
                <!-- Right Column: Paid Months -->
                <div style="flex: 1;">
                    <h3 style="border-bottom: 2px solid black; padding-bottom: 8px; margin: 0 0 10px 0; font-size: 16px;">Paid Months (${paidMonths.length})</h3>
                    <div style="padding: 12px; border: 2px solid black; background-color: #f9f9f9; min-height: 120px; font-size: 14px; line-height: 1.6;">
                        ${paidMonthsList}
                    </div>
                </div>
            </div>
            
            <!-- Payment Summary - Compact -->
            <div style="padding: 15px; border: 3px solid black; background-color: #f5f5f5;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid black;">Number of Shifts:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid black; text-align: right; font-weight: bold;">${selectedShiftsCount}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid black;">Rate per Shift per Month:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid black; text-align: right; font-weight: bold;">₹${PAYMENT_PER_SHIFT_PER_MONTH}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid black;">Monthly Charge:</td>
                        <td style="padding: 8px 0; border-bottom: 1px solid black; text-align: right; font-weight: bold;">₹${perMonthCharge}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; border-bottom: 2px solid black;">Months Paid:</td>
                        <td style="padding: 8px 0; border-bottom: 2px solid black; text-align: right; font-weight: bold;">${paidMonths.length}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; font-size: 18px; font-weight: bold;">TOTAL AMOUNT PAID:</td>
                        <td style="padding: 12px 0; text-align: right;">
                            <span style="font-size: 22px; font-weight: bold; background-color: black; color: white; padding: 5px 15px;">₹${totalPayment}</span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- Footer -->
            <div style="margin-top: 25px; text-align: center; padding-top: 15px; border-top: 2px solid black;">
                <p style="margin: 3px 0; font-size: 14px;">Thank you for being a valued aspirant!</p>
                <p style="margin: 3px 0; font-size: 12px; color: #666;">Purainiya Library Aspirants Management System</p>
            </div>
        </div>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill - ${member.name}</title>
            <style>
                @media print {
                    body { margin: 0; padding: 10px; }
                    @page { size: A4; margin: 10mm; }
                }
                body { background: white; }
            </style>
        </head>
        <body>
            ${billHTML}
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Render all members
function renderMembers() {
    const members = loadMembers(currentYear);
    const tbody = document.getElementById('memberTableBody');
    tbody.innerHTML = '';

    members.forEach((member, index) => {
        const row = tbody.insertRow();
        
        // Date of Joining
        const dateCell = row.insertCell(0);
        dateCell.className = 'date-display';
        dateCell.textContent = member.doj;
        
        // ID (Mobile Number)
        const idCell = row.insertCell(1);
        const idInput = document.createElement('input');
        idInput.type = 'tel';
        idInput.value = member.mobile;
        idInput.placeholder = 'Mobile Number';
        idInput.addEventListener('change', (e) => updateMember(index, 'mobile', e.target.value));
        idCell.appendChild(idInput);
        
        // Name
        const nameCell = row.insertCell(2);
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = member.name;
        nameInput.placeholder = 'Member Name';
        nameInput.addEventListener('change', (e) => updateMember(index, 'name', e.target.value));
        nameCell.appendChild(nameInput);
        
        // Shift - Multiple Selection with Checkboxes
        const shiftCell = row.insertCell(3);
        const shiftContainer = document.createElement('div');
        shiftContainer.className = 'shift-container';
        
        // Initialize selectedShifts array if not exists
        if (!member.selectedShifts) {
            member.selectedShifts = [];
        }
        
        shifts.forEach((shift) => {
            const shiftLabel = document.createElement('label');
            shiftLabel.className = 'shift-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = shift;
            checkbox.checked = member.selectedShifts.includes(shift);
            checkbox.addEventListener('change', (e) => {
                updateShiftSelection(index, shift, e.target.checked);
            });
            
            const shiftText = document.createElement('span');
            shiftText.textContent = shift;
            
            shiftLabel.appendChild(checkbox);
            shiftLabel.appendChild(shiftText);
            shiftContainer.appendChild(shiftLabel);
        });
        
        shiftCell.appendChild(shiftContainer);
        
        // Payment Section with Monthly Checkboxes
        const paymentCell = row.insertCell(4);
        
        // Initialize payments object if not exists
        if (!member.payments) {
            member.payments = {};
        }
        
        // Create payment container
        const paymentContainer = document.createElement('div');
        paymentContainer.className = 'payment-container';
        
        // Monthly checkboxes grid
        const monthsGrid = document.createElement('div');
        monthsGrid.className = 'months-grid';
        
        months.forEach((month) => {
            const monthLabel = document.createElement('label');
            monthLabel.className = 'month-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = member.payments[month] || false;
            checkbox.addEventListener('change', (e) => {
                updatePayment(index, month, e.target.checked);
            });
            
            const monthText = document.createElement('span');
            monthText.textContent = month;
            
            monthLabel.appendChild(checkbox);
            monthLabel.appendChild(monthText);
            monthsGrid.appendChild(monthLabel);
        });
        
        paymentContainer.appendChild(monthsGrid);
        
        // Payment breakdown and total
        const selectedShiftsCount = member.selectedShifts ? member.selectedShifts.length : 0;
        const paidMonthsCount = member.payments ? Object.values(member.payments).filter(paid => paid === true).length : 0;
        const totalPayment = calculateTotalPayment(member.payments, member.selectedShifts);
        
        const paymentInfo = document.createElement('div');
        paymentInfo.className = 'payment-info';
        paymentInfo.id = `payment-info-${index}`;
        paymentInfo.innerHTML = `
            <div class="payment-detail">Shifts: ${selectedShiftsCount} × ₹500 = ₹${selectedShiftsCount * 500}/month</div>
            <div class="payment-detail">Paid Months: ${paidMonthsCount}</div>
            <div class="total-payment"><strong>Total Paid: ₹${totalPayment}</strong></div>
        `;
        
        paymentContainer.appendChild(paymentInfo);
        
        // Print Bill Button
        const printBtn = document.createElement('button');
        printBtn.className = 'print-bill-btn';
        printBtn.textContent = '🖨️ Print Bill';
        printBtn.addEventListener('click', () => printMemberBill(index));
        paymentContainer.appendChild(printBtn);
        
        paymentCell.appendChild(paymentContainer);
    });
    
    updateSummary();
}

// Search functionality
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const rows = document.querySelectorAll('#memberTableBody tr');
    
    rows.forEach(row => {
        const mobileInput = row.querySelector('input[type="tel"]');
        const mobile = mobileInput ? mobileInput.value.toLowerCase() : '';
        
        if (searchTerm === '' || mobile.includes(searchTerm)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
    
    updateSummary();
}

// Update member data
function updateMember(index, field, value) {
    const members = loadMembers(currentYear);
    members[index][field] = value;
    saveMembers(members, currentYear);
}

// Update shift selection
function updateShiftSelection(index, shift, isSelected) {
    const members = loadMembers(currentYear);
    if (!members[index].selectedShifts) {
        members[index].selectedShifts = [];
    }
    
    if (isSelected) {
        // Add shift if not already in array
        if (!members[index].selectedShifts.includes(shift)) {
            members[index].selectedShifts.push(shift);
        }
    } else {
        // Remove shift from array
        members[index].selectedShifts = members[index].selectedShifts.filter(s => s !== shift);
    }
    
    saveMembers(members, currentYear);
    
    // Update payment info display
    updatePaymentDisplay(index);
}

// Update payment for a specific month
function updatePayment(index, month, isPaid) {
    const members = loadMembers(currentYear);
    if (!members[index].payments) {
        members[index].payments = {};
    }
    members[index].payments[month] = isPaid;
    saveMembers(members, currentYear);
    
    // Update payment info display
    updatePaymentDisplay(index);
}

// Update payment display
function updatePaymentDisplay(index) {
    const members = loadMembers(currentYear);
    const member = members[index];
    
    const selectedShiftsCount = member.selectedShifts ? member.selectedShifts.length : 0;
    const paidMonthsCount = member.payments ? Object.values(member.payments).filter(paid => paid === true).length : 0;
    const totalPayment = calculateTotalPayment(member.payments, member.selectedShifts);
    
    const paymentInfoDiv = document.getElementById(`payment-info-${index}`);
    if (paymentInfoDiv) {
        paymentInfoDiv.innerHTML = `
            <div class="payment-detail">Shifts: ${selectedShiftsCount} × ₹500 = ₹${selectedShiftsCount * 500}/month</div>
            <div class="payment-detail">Paid Months: ${paidMonthsCount}</div>
            <div class="total-payment"><strong>Total Paid: ₹${totalPayment}</strong></div>
        `;
    }
    
    updateSummary();
}

// Add new member
function addMember() {
    const members = loadMembers(currentYear);
    const newMember = {
        doj: getTodayDate(),
        mobile: '',
        name: '',
        selectedShifts: [],
        payments: {}
    };
    members.push(newMember);
    saveMembers(members, currentYear);
    renderMembers();
}

// ===== EVENT HANDLERS =====

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (isLoggedIn()) {
        showAdminPanel();
    } else {
        showLoginScreen();
        
        // Check if first time setup is needed
        if (!checkAdminExists()) {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('firstTimeSetup').style.display = 'block';
        }
    }
    
    // First Time Setup Form
    document.getElementById('setupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorMsg = document.getElementById('setupErrorMessage');
        
        if (password !== confirmPassword) {
            errorMsg.textContent = 'Passwords do not match!';
            return;
        }
        
        if (password.length < 4) {
            errorMsg.textContent = 'Password must be at least 4 characters!';
            return;
        }
        
        createAdmin(username, password);
        errorMsg.textContent = '';
        document.getElementById('firstTimeSetup').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('errorMessage').textContent = 'Account created! Please login.';
        document.getElementById('setupForm').reset();
    });
    
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMessage');
        
        if (verifyLogin(username, password)) {
            setLoggedIn('true');
            showAdminPanel();
            document.getElementById('loginForm').reset();
        } else {
            errorMsg.textContent = 'Invalid username or password!';
        }
    });
    
    // Logout Button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        setLoggedIn('false');
        showLoginScreen();
        document.getElementById('errorMessage').textContent = '';
    });
    
    // Add Member Button
    document.getElementById('addMemberBtn').addEventListener('click', addMember);
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', performSearch);
    document.getElementById('clearSearch').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        performSearch();
    });
});