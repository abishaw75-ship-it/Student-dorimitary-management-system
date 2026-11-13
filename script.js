/**
 * script.js  –  Core application logic
 * DMU Student Dormitory Management System
 *
 * Responsibilities:
 *  - App bootstrap & sample data seeding
 *  - Authentication (demo)
 *  - Navigation
 *  - Dashboard statistics & canvas charts
 *  - Shared utilities (toast, confirm dialog, modal helpers)
 */

/* ═══════════════════════════════════════════════════════════
   1.  CONSTANTS & STATE
   ═══════════════════════════════════════════════════════════ */
const KEYS = {
  students:    'dmu_students',
  blocks:      'dmu_blocks',
  rooms:       'dmu_rooms',
  allocations: 'dmu_allocations',
  complaints:  'dmu_complaints',
  currentUser: 'dmu_current_user',
};

// Demo credentials (frontend only – not secure)
const DEMO_USERS = [
  { email: 'admin@dmu.edu.et',   password: 'admin123',   role: 'admin',   name: 'System Admin' },
  { email: 'student@dmu.edu.et', password: 'student123', role: 'student', name: 'Demo Student', studentId: 'DMU/2021/005' },
];

/* ═══════════════════════════════════════════════════════════
   2.  LOCAL STORAGE HELPERS
   ═══════════════════════════════════════════════════════════ */
function getData(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getUser() {
  try { return JSON.parse(localStorage.getItem(KEYS.currentUser)); }
  catch { return null; }
}
function setUser(user) {
  localStorage.setItem(KEYS.currentUser, JSON.stringify(user));
}
function clearUser() {
  localStorage.removeItem(KEYS.currentUser);
}

/* ═══════════════════════════════════════════════════════════
   3.  SAMPLE DATA SEED  (runs only once if localStorage empty)
   ═══════════════════════════════════════════════════════════ */
function seedData() {
  if (getData(KEYS.blocks).length) return; // already seeded

  /* ── Dormitory Blocks ── */
  const blocks = [
    { id: 'BLK001', name: 'Block A', code: 'BLK-A', gender: 'Male',   floors: 4, description: 'Main male dormitory block' },
    { id: 'BLK002', name: 'Block B', code: 'BLK-B', gender: 'Female', floors: 3, description: 'Main female dormitory block' },
    { id: 'BLK003', name: 'Block C', code: 'BLK-C', gender: 'Mixed',  floors: 5, description: 'Mixed dormitory for postgraduate students' },
  ];
  setData(KEYS.blocks, blocks);

  /* ── Rooms ── */
  const rooms = [
    // Block A (Male)
    { id: 'RM001', number: '101', blockId: 'BLK001', capacity: 4, notes: '' },
    { id: 'RM002', number: '102', blockId: 'BLK001', capacity: 4, notes: '' },
    { id: 'RM003', number: '103', blockId: 'BLK001', capacity: 3, notes: 'Corner room' },
    { id: 'RM004', number: '201', blockId: 'BLK001', capacity: 4, notes: '' },
    { id: 'RM005', number: '202', blockId: 'BLK001', capacity: 2, notes: 'Accessible room' },
    // Block B (Female)
    { id: 'RM006', number: '101', blockId: 'BLK002', capacity: 4, notes: '' },
    { id: 'RM007', number: '102', blockId: 'BLK002', capacity: 4, notes: '' },
    { id: 'RM008', number: '103', blockId: 'BLK002', capacity: 3, notes: '' },
    { id: 'RM009', number: '201', blockId: 'BLK002', capacity: 4, notes: '' },
    { id: 'RM010', number: '202', blockId: 'BLK002', capacity: 4, notes: '' },
    // Block C (Mixed)
    { id: 'RM011', number: '101', blockId: 'BLK003', capacity: 2, notes: 'Postgrad' },
    { id: 'RM012', number: '102', blockId: 'BLK003', capacity: 2, notes: 'Postgrad' },
    { id: 'RM013', number: '201', blockId: 'BLK003', capacity: 3, notes: '' },
    { id: 'RM014', number: '202', blockId: 'BLK003', capacity: 3, notes: '' },
    { id: 'RM015', number: '301', blockId: 'BLK003', capacity: 4, notes: '' },
  ];
  setData(KEYS.rooms, rooms);

  /* ── Students ── */
  const students = [
    { id: 'STU001', studentId: 'DMU/2021/001', fullName: 'Abebe Kebede',       gender: 'Male',   department: 'Computer Science',       year: '3', phone: '+251911234567', email: 'abebe.kebede@dmu.edu.et',       photo: '', createdAt: '2024-09-01' },
    { id: 'STU002', studentId: 'DMU/2021/002', fullName: 'Almaz Tadesse',      gender: 'Female', department: 'Information Technology',  year: '2', phone: '+251922345678', email: 'almaz.tadesse@dmu.edu.et',      photo: '', createdAt: '2024-09-01' },
    { id: 'STU003', studentId: 'DMU/2020/003', fullName: 'Dawit Haile',        gender: 'Male',   department: 'Civil Engineering',       year: '4', phone: '+251933456789', email: 'dawit.haile@dmu.edu.et',        photo: '', createdAt: '2024-09-02' },
    { id: 'STU004', studentId: 'DMU/2022/004', fullName: 'Hiwot Girma',        gender: 'Female', department: 'Medicine',                year: '1', phone: '+251944567890', email: 'hiwot.girma@dmu.edu.et',        photo: '', createdAt: '2024-09-02' },
    { id: 'STU005', studentId: 'DMU/2021/005', fullName: 'Yonas Bekele',       gender: 'Male',   department: 'Electrical Engineering',  year: '3', phone: '+251955678901', email: 'student@dmu.edu.et',            photo: '', createdAt: '2024-09-03' },
    { id: 'STU006', studentId: 'DMU/2023/006', fullName: 'Tigist Alemu',       gender: 'Female', department: 'Nursing',                 year: '1', phone: '+251966789012', email: 'tigist.alemu@dmu.edu.et',       photo: '', createdAt: '2024-09-03' },
    { id: 'STU007', studentId: 'DMU/2020/007', fullName: 'Mulugeta Worku',     gender: 'Male',   department: 'Business Administration', year: '4', phone: '+251977890123', email: 'mulugeta.worku@dmu.edu.et',     photo: '', createdAt: '2024-09-04' },
    { id: 'STU008', studentId: 'DMU/2022/008', fullName: 'Selamawit Mekonen',  gender: 'Female', department: 'Accounting',              year: '2', phone: '+251988901234', email: 'selamawit.mekonen@dmu.edu.et',  photo: '', createdAt: '2024-09-04' },
    { id: 'STU009', studentId: 'DMU/2021/009', fullName: 'Biniam Tsegay',      gender: 'Male',   department: 'Mechanical Engineering',  year: '3', phone: '+251999012345', email: 'biniam.tsegay@dmu.edu.et',      photo: '', createdAt: '2024-09-05' },
    { id: 'STU010', studentId: 'DMU/2023/010', fullName: 'Frehiwot Legesse',   gender: 'Female', department: 'Pharmacy',                year: '1', phone: '+251910123456', email: 'frehiwot.legesse@dmu.edu.et',   photo: '', createdAt: '2024-09-05' },
    { id: 'STU011', studentId: 'DMU/2020/011', fullName: 'Solomon Tesfaye',    gender: 'Male',   department: 'Law',                     year: '4', phone: '+251921234567', email: 'solomon.tesfaye@dmu.edu.et',    photo: '', createdAt: '2024-09-06' },
    { id: 'STU012', studentId: 'DMU/2022/012', fullName: 'Meron Ayele',        gender: 'Female', department: 'Economics',               year: '2', phone: '+251932345678', email: 'meron.ayele@dmu.edu.et',        photo: '', createdAt: '2024-09-06' },
    { id: 'STU013', studentId: 'DMU/2021/013', fullName: 'Getachew Desta',     gender: 'Male',   department: 'Agriculture',             year: '3', phone: '+251943456789', email: 'getachew.desta@dmu.edu.et',     photo: '', createdAt: '2024-09-07' },
    { id: 'STU014', studentId: 'DMU/2023/014', fullName: 'Rahel Yohannes',     gender: 'Female', department: 'Natural Science',         year: '1', phone: '+251954567890', email: 'rahel.yohannes@dmu.edu.et',     photo: '', createdAt: '2024-09-07' },
    { id: 'STU015', studentId: 'DMU/2020/015', fullName: 'Kibrom Habtezion',   gender: 'Male',   department: 'Social Science',          year: '5', phone: '+251965678901', email: 'kibrom.habtezion@dmu.edu.et',   photo: '', createdAt: '2024-09-08' },
    { id: 'STU016', studentId: 'DMU/2022/016', fullName: 'Liya Tsegaye',       gender: 'Female', department: 'Computer Science',        year: '2', phone: '+251976789012', email: 'liya.tsegaye@dmu.edu.et',       photo: '', createdAt: '2024-09-08' },
    { id: 'STU017', studentId: 'DMU/2021/017', fullName: 'Natnael Girma',      gender: 'Male',   department: 'Information Technology',  year: '3', phone: '+251987890123', email: 'natnael.girma@dmu.edu.et',      photo: '', createdAt: '2024-09-09' },
    { id: 'STU018', studentId: 'DMU/2023/018', fullName: 'Betlehem Kebede',    gender: 'Female', department: 'Medicine',                year: '1', phone: '+251998901234', email: 'betlehem.kebede@dmu.edu.et',    photo: '', createdAt: '2024-09-09' },
    { id: 'STU019', studentId: 'DMU/2020/019', fullName: 'Amanuel Wolde',      gender: 'Male',   department: 'Civil Engineering',       year: '4', phone: '+251919012345', email: 'amanuel.wolde@dmu.edu.et',      photo: '', createdAt: '2024-09-10' },
    { id: 'STU020', studentId: 'DMU/2022/020', fullName: 'Yeabsira Tadesse',   gender: 'Female', department: 'Nursing',                 year: '2', phone: '+251930123456', email: 'yeabsira.tadesse@dmu.edu.et',   photo: '', createdAt: '2024-09-10' },
  ];
  setData(KEYS.students, students);

  /* ── Allocations ── */
  const allocations = [
    { id: 'ALO001', studentId: 'STU001', roomId: 'RM001', allocatedAt: '2024-09-10' },
    { id: 'ALO002', studentId: 'STU003', roomId: 'RM001', allocatedAt: '2024-09-10' },
    { id: 'ALO003', studentId: 'STU005', roomId: 'RM002', allocatedAt: '2024-09-11' },
    { id: 'ALO004', studentId: 'STU007', roomId: 'RM002', allocatedAt: '2024-09-11' },
    { id: 'ALO005', studentId: 'STU009', roomId: 'RM003', allocatedAt: '2024-09-11' },
    { id: 'ALO006', studentId: 'STU011', roomId: 'RM004', allocatedAt: '2024-09-12' },
    { id: 'ALO007', studentId: 'STU013', roomId: 'RM004', allocatedAt: '2024-09-12' },
    { id: 'ALO008', studentId: 'STU015', roomId: 'RM005', allocatedAt: '2024-09-12' },
    { id: 'ALO009', studentId: 'STU017', roomId: 'RM005', allocatedAt: '2024-09-13' },
    { id: 'ALO010', studentId: 'STU019', roomId: 'RM013', allocatedAt: '2024-09-13' },
    { id: 'ALO011', studentId: 'STU002', roomId: 'RM006', allocatedAt: '2024-09-10' },
    { id: 'ALO012', studentId: 'STU004', roomId: 'RM006', allocatedAt: '2024-09-10' },
    { id: 'ALO013', studentId: 'STU006', roomId: 'RM007', allocatedAt: '2024-09-11' },
    { id: 'ALO014', studentId: 'STU008', roomId: 'RM007', allocatedAt: '2024-09-11' },
    { id: 'ALO015', studentId: 'STU010', roomId: 'RM008', allocatedAt: '2024-09-12' },
    { id: 'ALO016', studentId: 'STU012', roomId: 'RM009', allocatedAt: '2024-09-12' },
    { id: 'ALO017', studentId: 'STU014', roomId: 'RM010', allocatedAt: '2024-09-13' },
    { id: 'ALO018', studentId: 'STU016', roomId: 'RM010', allocatedAt: '2024-09-13' },
    { id: 'ALO019', studentId: 'STU018', roomId: 'RM011', allocatedAt: '2024-09-14' },
    { id: 'ALO020', studentId: 'STU020', roomId: 'RM012', allocatedAt: '2024-09-14' },
  ];
  setData(KEYS.allocations, allocations);

  /* ── Complaints ── */
  const complaints = [
    { id: 'CMP001', studentId: 'STU001', category: 'Maintenance', description: 'The window in room 101 Block A is broken and cannot be closed properly.', submittedAt: '2024-10-05', status: 'Resolved',    adminNote: 'Window replaced on 2024-10-08' },
    { id: 'CMP002', studentId: 'STU003', category: 'Utilities',   description: 'No hot water available in the morning from 6 AM to 8 AM.', submittedAt: '2024-10-07', status: 'In Progress', adminNote: 'Plumber scheduled' },
    { id: 'CMP003', studentId: 'STU005', category: 'Noise',       description: 'Students in the room next door are playing loud music past midnight.', submittedAt: '2024-10-10', status: 'Pending',     adminNote: '' },
    { id: 'CMP004', studentId: 'STU002', category: 'Cleanliness', description: 'The common bathrooms on floor 1 of Block B are not cleaned daily.', submittedAt: '2024-10-11', status: 'In Progress', adminNote: 'Cleaning schedule updated' },
    { id: 'CMP005', studentId: 'STU004', category: 'Security',    description: 'The main entrance door lock is broken – anyone can enter at night.', submittedAt: '2024-10-12', status: 'Pending',     adminNote: '' },
    { id: 'CMP006', studentId: 'STU008', category: 'Maintenance', description: 'Ceiling fan in room 102 Block B is not working.', submittedAt: '2024-10-13', status: 'Resolved',    adminNote: 'Fan repaired' },
    { id: 'CMP007', studentId: 'STU010', category: 'Other',       description: 'Request for extra blankets for the cold season.', submittedAt: '2024-10-14', status: 'Pending',     adminNote: '' },
  ];
  setData(KEYS.complaints, complaints);
}

/* ═══════════════════════════════════════════════════════════
   4.  AUTHENTICATION
   ═══════════════════════════════════════════════════════════ */
function initLogin() {
  const form      = document.getElementById('loginForm');
  const alertBox  = document.getElementById('loginAlert');
  const togglePwd = document.getElementById('togglePwd');
  const pwdInput  = document.getElementById('loginPassword');

  // Toggle password visibility
  togglePwd.addEventListener('click', () => {
    if (pwdInput.type === 'password') {
      pwdInput.type = 'text';
      togglePwd.textContent = 'visibility_off';
    } else {
      pwdInput.type = 'password';
      togglePwd.textContent = 'visibility';
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const role     = document.getElementById('loginRole').value;

    const user = DEMO_USERS.find(u => u.email === email && u.password === password && u.role === role);

    if (!user) {
      showAlert(alertBox, 'error', 'Invalid credentials. Please check your email, password, and role.');
      return;
    }

    setUser(user);
    launchApp(user);
  });
}

function launchApp(user) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Show/hide nav based on role
  if (user.role === 'admin') {
    document.getElementById('adminNav').classList.remove('hidden');
    document.getElementById('studentNav').classList.add('hidden');
    navigateTo('dashboard');
  } else {
    document.getElementById('adminNav').classList.add('hidden');
    document.getElementById('studentNav').classList.remove('hidden');
    navigateTo('myRoom');
  }

  // Set user display info
  document.getElementById('userDisplayName').textContent = user.name;
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Student';
  document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();

  updateNotifBadge();
}

function initLogout() {
  document.getElementById('logoutBtn').addEventListener('click', e => {
    e.preventDefault();
    confirmAction('Are you sure you want to logout?', () => {
      clearUser();
      location.reload();
    }, 'Logout', false);
  });
}

/* ═══════════════════════════════════════════════════════════
   5.  NAVIGATION
   ═══════════════════════════════════════════════════════════ */
const PAGE_TITLES = {
  dashboard:       'Dashboard',
  students:        'Student Management',
  dormitories:     'Dormitory Blocks',
  rooms:           'Room Management',
  allocation:      'Room Allocation',
  complaints:      'Complaint Management',
  reports:         'Reports',
  myRoom:          'My Room',
  submitComplaint: 'Submit Complaint',
};

function navigateTo(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });

  // Update page title
  document.getElementById('pageTitle').textContent = PAGE_TITLES[pageId] || pageId;

  // Load page-specific data
  switch (pageId) {
    case 'dashboard':       renderDashboard();         break;
    case 'students':        renderStudents();           break;
    case 'dormitories':     renderBlocks();             break;
    case 'rooms':           renderRooms();              break;
    case 'allocation':      renderAllocations();        break;
    case 'complaints':      renderComplaints();         break;
    case 'reports':         renderReports();            break;
    case 'myRoom':          renderMyRoom();             break;
    case 'submitComplaint': renderMyComplaints();       break;
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 900) closeSidebar();
}

function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });
}

/* ═══════════════════════════════════════════════════════════
   6.  SIDEBAR TOGGLE
   ═══════════════════════════════════════════════════════════ */
function initSidebar() {
  const sidebar        = document.getElementById('sidebar');
  const overlay        = document.getElementById('sidebarOverlay');
  const toggleBtn      = document.getElementById('sidebarToggle');
  const closeBtn       = document.getElementById('sidebarCloseBtn');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
}

/* ═══════════════════════════════════════════════════════════
   7.  USER DROPDOWN
   ═══════════════════════════════════════════════════════════ */
function initUserMenu() {
  const menu     = document.getElementById('userMenu');
  const dropdown = document.getElementById('userDropdown');
  menu.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });
  document.addEventListener('click', () => dropdown.classList.remove('show'));
}

/* ═══════════════════════════════════════════════════════════
   8.  DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function renderDashboard() {
  const students    = getData(KEYS.students);
  const blocks      = getData(KEYS.blocks);
  const rooms       = getData(KEYS.rooms);
  const allocations = getData(KEYS.allocations);
  const complaints  = getData(KEYS.complaints);

  // Count occupied beds per room
  const occupiedBeds = roomOccupancy();

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = Object.values(occupiedBeds).reduce((s, v) => s + v, 0);
  const occupiedRooms = rooms.filter(r => (occupiedBeds[r.id] || 0) >= r.capacity).length;
  const availRooms    = rooms.filter(r => (occupiedBeds[r.id] || 0) < r.capacity).length;

  document.getElementById('statStudents').textContent  = students.length;
  document.getElementById('statBlocks').textContent    = blocks.length;
  document.getElementById('statRooms').textContent     = rooms.length;
  document.getElementById('statAvail').textContent     = availRooms;
  document.getElementById('statOccupied').textContent  = occupiedRooms;
  document.getElementById('statComplaints').textContent = complaints.length;

  // Recent students (last 6)
  const recent = [...students].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const tbody  = document.getElementById('recentStudentsBody');
  tbody.innerHTML = recent.map(s => {
    const alloc = allocations.find(a => a.studentId === s.id);
    const room  = alloc ? rooms.find(r => r.id === alloc.roomId) : null;
    const block = room  ? getData(KEYS.blocks).find(b => b.id === room.blockId) : null;
    const roomLabel = room ? `${block ? block.name : ''} – ${room.number}` : '<span class="text-muted">Not assigned</span>';
    return `<tr>
      <td>${s.studentId}</td>
      <td>${s.fullName}</td>
      <td>${s.department}</td>
      <td>Year ${s.year}</td>
      <td><span class="badge-status ${s.gender === 'Male' ? 'badge-male' : 'badge-female'}">${s.gender}</span></td>
      <td>${roomLabel}</td>
    </tr>`;
  }).join('');

  drawCharts(rooms, occupiedBeds, students, complaints);
  updateNotifBadge();
}

/* ── Canvas Charts ── */
function drawCharts(rooms, occupiedBeds, students, complaints) {
  drawOccupancyChart(rooms, occupiedBeds);
  drawGenderChart(students);
  drawComplaintChart(complaints);
}

function drawOccupancyChart(rooms, occupiedBeds) {
  const canvas = document.getElementById('occupancyChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const totalBeds     = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = Object.values(occupiedBeds).reduce((s, v) => s + v, 0);
  const totalFree     = totalBeds - totalOccupied;

  drawDonut(ctx, canvas.width, canvas.height,
    [totalOccupied, totalFree],
    ['#2a7ae4', '#22c55e'],
    ['Occupied', 'Available'],
    canvas.parentElement
  );
}

function drawGenderChart(students) {
  const canvas = document.getElementById('genderChart');
  if (!canvas) return;
  const ctx    = canvas.getContext('2d');
  const male   = students.filter(s => s.gender === 'Male').length;
  const female = students.filter(s => s.gender === 'Female').length;

  drawDonut(ctx, canvas.width, canvas.height,
    [male, female],
    ['#3b82f6', '#ec4899'],
    ['Male', 'Female'],
    canvas.parentElement
  );
}

function drawComplaintChart(complaints) {
  const canvas   = document.getElementById('complaintChart');
  if (!canvas) return;
  const ctx      = canvas.getContext('2d');
  const pending  = complaints.filter(c => c.status === 'Pending').length;
  const progress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  drawDonut(ctx, canvas.width, canvas.height,
    [pending, progress, resolved],
    ['#f59e0b', '#3b82f6', '#22c55e'],
    ['Pending', 'In Progress', 'Resolved'],
    canvas.parentElement
  );
}

/**
 * drawDonut – vanilla canvas donut chart
 */
function drawDonut(ctx, w, h, values, colors, labels, container) {
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data', w / 2, h / 2);
    return;
  }

  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2;
  const radius = Math.min(cx, cy) - 10;
  const inner  = radius * 0.58;
  let start = -Math.PI / 2;

  values.forEach((val, i) => {
    const slice = (val / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    start += slice;
  });

  // Hole
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Centre text
  ctx.fillStyle = '#1e293b';
  ctx.font = `bold 22px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy);
  ctx.font = `12px Inter, sans-serif`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('Total', cx, cy + 18);

  // Legend (inject HTML below canvas)
  const legendId = 'legend_' + ctx.canvas.id;
  let legendEl   = document.getElementById(legendId);
  if (!legendEl) {
    legendEl = document.createElement('div');
    legendEl.id = legendId;
    legendEl.className = 'chart-legend';
    container.appendChild(legendEl);
  }
  legendEl.innerHTML = values.map((v, i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${colors[i]}"></span>
      <span>${labels[i]} (${v})</span>
    </div>`).join('');
}

/* ═══════════════════════════════════════════════════════════
   9.  ROOM OCCUPANCY HELPER
   ═══════════════════════════════════════════════════════════ */
/** Returns { roomId: occupiedCount } */
function roomOccupancy() {
  const allocations = getData(KEYS.allocations);
  const map = {};
  allocations.forEach(a => {
    map[a.roomId] = (map[a.roomId] || 0) + 1;
  });
  return map;
}

/* ═══════════════════════════════════════════════════════════
   10.  NOTIFICATION BADGE
   ═══════════════════════════════════════════════════════════ */
function updateNotifBadge() {
  const pending = getData(KEYS.complaints).filter(c => c.status === 'Pending').length;
  const badge   = document.getElementById('notifBadge');
  badge.textContent = pending;
  badge.style.display = pending > 0 ? 'flex' : 'none';
}

/* ═══════════════════════════════════════════════════════════
   11.  TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════════ */
let toastTimer;
function showToast(message, type = 'success') {
  const toast  = document.getElementById('toast');
  const icon   = document.getElementById('toastIcon');
  const msgEl  = document.getElementById('toastMessage');

  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  icon.textContent   = icons[type] || 'check_circle';
  msgEl.textContent  = message;
  toast.className    = `toast toast-${type}`;
  toast.classList.remove('hidden');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

/* ═══════════════════════════════════════════════════════════
   12.  CONFIRM DIALOG
   ═══════════════════════════════════════════════════════════ */
function confirmAction(message, onConfirm, confirmLabel = 'Delete', isDanger = true) {
  const dialog  = document.getElementById('confirmDialog');
  const msgEl   = document.getElementById('confirmMessage');
  const okBtn   = document.getElementById('confirmOk');
  const cancelBtn = document.getElementById('confirmCancel');

  msgEl.textContent = message;
  okBtn.textContent = confirmLabel;
  okBtn.className   = isDanger ? 'btn btn-danger' : 'btn btn-primary';
  dialog.classList.remove('hidden');

  // Clone to remove old listeners
  const newOk     = okBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOk, okBtn);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

  newOk.addEventListener('click', () => {
    dialog.classList.add('hidden');
    onConfirm();
  });
  newCancel.addEventListener('click', () => dialog.classList.add('hidden'));
}

/* ═══════════════════════════════════════════════════════════
   13.  MODAL HELPERS
   ═══════════════════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

// Close buttons with data-modal attribute
document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modal || btn.closest('.modal-overlay').id));
});

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

/* ═══════════════════════════════════════════════════════════
   14.  ALERT HELPER
   ═══════════════════════════════════════════════════════════ */
function showAlert(el, type, message) {
  el.className = `alert alert-${type}`;
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}

/* ═══════════════════════════════════════════════════════════
   15.  PRINT REPORT
   ═══════════════════════════════════════════════════════════ */
function printReport() {
  navigateTo('reports');
  setTimeout(() => window.print(), 300);
}

/* ═══════════════════════════════════════════════════════════
   16.  GENERATE UNIQUE ID
   ═══════════════════════════════════════════════════════════ */
function uid(prefix) {
  return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

/* ═══════════════════════════════════════════════════════════
   17.  FORMAT DATE
   ═══════════════════════════════════════════════════════════ */
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ═══════════════════════════════════════════════════════════
   18.  AVATAR COLOR
   ═══════════════════════════════════════════════════════════ */
const AVATAR_COLORS = ['#3b82f6','#6366f1','#ec4899','#14b8a6','#f59e0b','#22c55e','#ef4444','#8b5cf6'];
function avatarColor(name) {
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ═══════════════════════════════════════════════════════════
   19.  REPORTS PAGE
   ═══════════════════════════════════════════════════════════ */
function renderReports() {
  const students    = getData(KEYS.students);
  const blocks      = getData(KEYS.blocks);
  const rooms       = getData(KEYS.rooms);
  const allocations = getData(KEYS.allocations);
  const complaints  = getData(KEYS.complaints);
  const occMap      = roomOccupancy();

  const totalBeds = rooms.reduce((s, r) => s + r.capacity, 0);
  const occBeds   = Object.values(occMap).reduce((s, v) => s + v, 0);

  // Summary cards
  document.getElementById('reportSummary').innerHTML = `
    <div class="stat-card blue"><div class="stat-icon"><span class="material-icons">people</span></div><div class="stat-info"><h3>${students.length}</h3><p>Total Students</p></div></div>
    <div class="stat-card indigo"><div class="stat-icon"><span class="material-icons">apartment</span></div><div class="stat-info"><h3>${blocks.length}</h3><p>Blocks</p></div></div>
    <div class="stat-card teal"><div class="stat-icon"><span class="material-icons">meeting_room</span></div><div class="stat-info"><h3>${rooms.length}</h3><p>Rooms</p></div></div>
    <div class="stat-card orange"><div class="stat-icon"><span class="material-icons">hotel</span></div><div class="stat-info"><h3>${occBeds}</h3><p>Occupied Beds</p></div></div>
    <div class="stat-card green"><div class="stat-icon"><span class="material-icons">check_circle</span></div><div class="stat-info"><h3>${totalBeds - occBeds}</h3><p>Available Beds</p></div></div>
    <div class="stat-card red"><div class="stat-icon"><span class="material-icons">report_problem</span></div><div class="stat-info"><h3>${complaints.length}</h3><p>Complaints</p></div></div>
  `;

  // Dept breakdown
  const deptMap = {};
  students.forEach(s => deptMap[s.department] = (deptMap[s.department] || 0) + 1);
  document.getElementById('reportDeptBody').innerHTML = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .map(([dept, cnt]) => `<tr><td>${dept}</td><td>${cnt}</td><td>${Math.round(cnt / students.length * 100)}%</td></tr>`)
    .join('') || '<tr><td colspan="3" class="text-center text-muted">No data</td></tr>';

  // Gender breakdown
  const male   = students.filter(s => s.gender === 'Male').length;
  const female = students.filter(s => s.gender === 'Female').length;
  document.getElementById('reportGenderBody').innerHTML = `
    <tr><td>Male</td><td>${male}</td><td>${students.length ? Math.round(male / students.length * 100) : 0}%</td></tr>
    <tr><td>Female</td><td>${female}</td><td>${students.length ? Math.round(female / students.length * 100) : 0}%</td></tr>
  `;

  // Occupancy by block
  document.getElementById('reportOccBody').innerHTML = blocks.map(b => {
    const bRooms     = rooms.filter(r => r.blockId === b.id);
    const bCapacity  = bRooms.reduce((s, r) => s + r.capacity, 0);
    const bOccupied  = bRooms.reduce((s, r) => s + (occMap[r.id] || 0), 0);
    const pct        = bCapacity ? Math.round(bOccupied / bCapacity * 100) : 0;
    return `<tr><td>${b.name}</td><td>${bRooms.length}</td><td>${bOccupied}</td><td>${bCapacity}</td><td>${pct}%</td></tr>`;
  }).join('') || '<tr><td colspan="5" class="text-center text-muted">No data</td></tr>';

  // Complaint stats
  const statuses = ['Pending', 'In Progress', 'Resolved'];
  document.getElementById('reportComplaintBody').innerHTML = statuses.map(s => {
    const cnt = complaints.filter(c => c.status === s).length;
    return `<tr><td>${s}</td><td>${cnt}</td><td>${complaints.length ? Math.round(cnt / complaints.length * 100) : 0}%</td></tr>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════
   20.  MY ROOM (Student view)
   ═══════════════════════════════════════════════════════════ */
function renderMyRoom() {
  const user   = getUser();
  const container = document.getElementById('myRoomContent');
  if (!user || user.role !== 'student') { container.innerHTML = ''; return; }

  const students = getData(KEYS.students);
  const student  = students.find(s => s.studentId === user.studentId);

  if (!student) {
    container.innerHTML = `<div class="alert alert-info">Student record not found. Contact the administrator.</div>`;
    return;
  }

  const allocations = getData(KEYS.allocations);
  const rooms       = getData(KEYS.rooms);
  const blocks      = getData(KEYS.blocks);
  const alloc       = allocations.find(a => a.studentId === student.id);
  const room        = alloc ? rooms.find(r => r.id === alloc.roomId) : null;
  const block       = room  ? blocks.find(b => b.id === room.blockId) : null;
  const occMap      = roomOccupancy();
  const roommates   = room
    ? allocations.filter(a => a.roomId === room.id && a.studentId !== student.id)
        .map(a => students.find(s => s.id === a.studentId))
        .filter(Boolean)
    : [];

  if (!alloc) {
    container.innerHTML = `
      <div class="my-room-card">
        <div class="my-room-header">
          <div class="room-icon"><span class="material-icons">meeting_room</span></div>
          <div><h3>${student.fullName}</h3><p class="text-muted">${student.studentId}</p></div>
        </div>
        <div class="alert alert-info">You have not been assigned a room yet. Please contact the dormitory office.</div>
      </div>`;
    return;
  }

  const occ = occMap[room.id] || 0;
  container.innerHTML = `
    <div class="my-room-card">
      <div class="my-room-header">
        <div class="room-icon"><span class="material-icons">meeting_room</span></div>
        <div>
          <h3>Room ${room.number}</h3>
          <p class="text-muted">${block ? block.name : ''} &middot; Allocated on ${formatDate(alloc.allocatedAt)}</p>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><label>Block</label><span>${block ? block.name : '—'}</span></div>
        <div class="detail-item"><label>Room Number</label><span>${room.number}</span></div>
        <div class="detail-item"><label>Capacity</label><span>${room.capacity} beds</span></div>
        <div class="detail-item"><label>Occupied</label><span>${occ} / ${room.capacity}</span></div>
        <div class="detail-item"><label>Your Name</label><span>${student.fullName}</span></div>
        <div class="detail-item"><label>Student ID</label><span>${student.studentId}</span></div>
        <div class="detail-item"><label>Department</label><span>${student.department}</span></div>
        <div class="detail-item"><label>Year</label><span>Year ${student.year}</span></div>
      </div>
      ${roommates.length ? `
        <h4 style="margin-top:1.5rem;margin-bottom:.75rem;">Roommates</h4>
        <div class="table-responsive">
          <table>
            <thead><tr><th>Name</th><th>Student ID</th><th>Department</th></tr></thead>
            <tbody>${roommates.map(r => `<tr><td>${r.fullName}</td><td>${r.studentId}</td><td>${r.department}</td></tr>`).join('')}</tbody>
          </table>
        </div>` : '<p class="text-muted mt-2">No other roommates assigned yet.</p>'}
    </div>`;
}

/* ═══════════════════════════════════════════════════════════
   21.  APP BOOTSTRAP
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  seedData();
  initNavigation();
  initSidebar();
  initUserMenu();
  initLogin();
  initLogout();

  // Check if already logged in
  const user = getUser();
  if (user) {
    launchApp(user);
  }
});
