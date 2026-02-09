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
    renderMembers();
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

// Load members from localStorage
function loadMembers() {
    const members = localStorage.getItem('libraryMembers');
    return members ? JSON.parse(members) : [];
}

// Save members to localStorage
function saveMembers(members) {
    localStorage.setItem('libraryMembers', JSON.stringify(members));
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

// Print bill for a member
function printMemberBill(index) {
    const members = loadMembers();
    const member = members[index];
    
    if (!member.name || !member.mobile) {
        alert('Please fill member name and mobile number before printing bill!');
        return;
    }
    
    const selectedShiftsCount = member.selectedShifts ? member.selectedShifts.length : 0;
    const paidMonths = member.payments ? Object.keys(member.payments).filter(month => member.payments[month] === true) : [];
    const totalPayment = calculateTotalPayment(member.payments, member.selectedShifts);
    const perMonthCharge = selectedShiftsCount * PAYMENT_PER_SHIFT_PER_MONTH;
    
    // Generate bill HTML
    const billHTML = `
        <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: Arial, sans-serif; color: black;">
            <div style="text-align: center; border-bottom: 3px solid black; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="margin: 0; font-size: 32px;">Purainiya Library</h1>
                <h2 style="margin: 10px 0 0 0; font-size: 24px;">Member Payment Bill</h2>
            </div>
            
            <div style="margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold; width: 200px;">Member Name:</td>
                        <td style="padding: 10px; border: 2px solid black;">${member.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold;">Mobile Number:</td>
                        <td style="padding: 10px; border: 2px solid black;">${member.mobile}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold;">Date of Joining:</td>
                        <td style="padding: 10px; border: 2px solid black;">${member.doj}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 2px solid black; background-color: #f5f5f5; font-weight: bold;">Bill Date:</td>
                        <td style="padding: 10px; border: 2px solid black;">${getTodayDate()}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="border-bottom: 2px solid black; padding-bottom: 10px;">Selected Shifts</h3>
                <div style="padding: 15px; border: 2px solid black; background-color: #f9f9f9;">
                    ${member.selectedShifts && member.selectedShifts.length > 0 
                        ? member.selectedShifts.map(shift => `<div style="padding: 5px;">• ${shift}</div>`).join('') 
                        : '<div style="padding: 5px;">No shifts selected</div>'}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h3 style="border-bottom: 2px solid black; padding-bottom: 10px;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th style="padding: 12px; border: 2px solid black; background-color: black; color: white; text-align: left;">Month</th>
                            <th style="padding: 12px; border: 2px solid black; background-color: black; color: white; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${months.map(month => `
                            <tr>
                                <td style="padding: 10px; border: 2px solid black;">${month}</td>
                                <td style="padding: 10px; border: 2px solid black; text-align: center;">
                                    ${member.payments && member.payments[month] 
                                        ? '<span style="color: black; font-weight: bold;">✓ PAID</span>' 
                                        : '<span style="color: #999;">Not Paid</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; border: 3px solid black; background-color: #f5f5f5;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid black;">
                    <span style="font-size: 16px;">Number of Shifts:</span>
                    <span style="font-size: 16px; font-weight: bold;">${selectedShiftsCount}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid black;">
                    <span style="font-size: 16px;">Rate per Shift per Month:</span>
                    <span style="font-size: 16px; font-weight: bold;">₹${PAYMENT_PER_SHIFT_PER_MONTH}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid black;">
                    <span style="font-size: 16px;">Monthly Charge:</span>
                    <span style="font-size: 16px; font-weight: bold;">₹${perMonthCharge}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid black;">
                    <span style="font-size: 16px;">Months Paid:</span>
                    <span style="font-size: 16px; font-weight: bold;">${paidMonths.length}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 15px 0; margin-top: 10px;">
                    <span style="font-size: 20px; font-weight: bold;">TOTAL AMOUNT PAID:</span>
                    <span style="font-size: 24px; font-weight: bold; background-color: black; color: white; padding: 5px 15px;">₹${totalPayment}</span>
                </div>
            </div>
            
            <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 2px solid black;">
                <p style="margin: 5px 0;">Thank you for being a valued member!</p>
                <p style="margin: 5px 0; font-size: 14px; color: #666;">Purainiya Library Member Management System</p>
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
                    body { margin: 0; padding: 20px; }
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
    const members = loadMembers();
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
}

// Update member data
function updateMember(index, field, value) {
    const members = loadMembers();
    members[index][field] = value;
    saveMembers(members);
}

// Update shift selection
function updateShiftSelection(index, shift, isSelected) {
    const members = loadMembers();
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
    
    saveMembers(members);
    
    // Update payment info display
    updatePaymentDisplay(index);
}

// Update payment for a specific month
function updatePayment(index, month, isPaid) {
    const members = loadMembers();
    if (!members[index].payments) {
        members[index].payments = {};
    }
    members[index].payments[month] = isPaid;
    saveMembers(members);
    
    // Update payment info display
    updatePaymentDisplay(index);
}

// Update payment display
function updatePaymentDisplay(index) {
    const members = loadMembers();
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
}

// Add new member
function addMember() {
    const members = loadMembers();
    const newMember = {
        doj: getTodayDate(),
        mobile: '',
        name: '',
        selectedShifts: [],
        payments: {}
    };
    members.push(newMember);
    saveMembers(members);
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
});