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

// Monthly payment amount (you can change this value)
const MONTHLY_PAYMENT = 500; // Change this to your actual monthly fee

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
function calculateTotalPayment(payments) {
    if (!payments) return 0;
    const paidMonths = Object.values(payments).filter(paid => paid === true).length;
    return paidMonths * MONTHLY_PAYMENT;
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
        
        // Shift
        const shiftCell = row.insertCell(3);
        const shiftSelect = document.createElement('select');
        shifts.forEach(shift => {
            const option = document.createElement('option');
            option.value = shift;
            option.textContent = shift;
            if (shift === member.shift) option.selected = true;
            shiftSelect.appendChild(option);
        });
        shiftSelect.addEventListener('change', (e) => updateMember(index, 'shift', e.target.value));
        shiftCell.appendChild(shiftSelect);
        
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
        
        // Total payment display
        const totalPayment = calculateTotalPayment(member.payments);
        const totalDiv = document.createElement('div');
        totalDiv.className = 'total-payment';
        totalDiv.innerHTML = `<strong>Total Paid: ₹${totalPayment}</strong>`;
        totalDiv.id = `total-${index}`;
        
        paymentContainer.appendChild(totalDiv);
        paymentCell.appendChild(paymentContainer);
    });
}

// Update member data
function updateMember(index, field, value) {
    const members = loadMembers();
    members[index][field] = value;
    saveMembers(members);
}

// Update payment for a specific month
function updatePayment(index, month, isPaid) {
    const members = loadMembers();
    if (!members[index].payments) {
        members[index].payments = {};
    }
    members[index].payments[month] = isPaid;
    saveMembers(members);
    
    // Update total display
    const totalPayment = calculateTotalPayment(members[index].payments);
    const totalDiv = document.getElementById(`total-${index}`);
    if (totalDiv) {
        totalDiv.innerHTML = `<strong>Total Paid: ₹${totalPayment}</strong>`;
    }
}

// Add new member
function addMember() {
    const members = loadMembers();
    const newMember = {
        doj: getTodayDate(),
        mobile: '',
        name: '',
        shift: shifts[0],
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