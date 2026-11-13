/**
 * students.js  –  Student & Dormitory Block management
 * DMU Student Dormitory Management System
 *
 * Handles:
 *  - Render students table
 *  - Add / Edit / Delete / View students
 *  - Render dormitory blocks grid
 *  - Add / Edit / Delete blocks
 */

/* ═══════════════════════════════════════════════════════════
   STUDENTS MODULE
   ═══════════════════════════════════════════════════════════ */

/** Render filtered students table */
function renderStudents() {
  const search  = (document.getElementById('studentSearch').value  || '').toLowerCase();
  const gender  = document.getElementById('studentGenderFilter').value;
  const dept    = document.getElementById('studentDeptFilter').value;
  const year    = document.getElementById('studentYearFilter').value;

  let students  = getData(KEYS.students);
  const allocs  = getData(KEYS.allocations);
  const rooms   = getData(KEYS.rooms);
  const blocks  = getData(KEYS.blocks);

  // Populate dept filter options (once)
  populateDeptFilter(students);

  // Apply filters
  if (search) students = students.filter(s =>
    s.fullName.toLowerCase().includes(search)   ||
    s.studentId.toLowerCase().includes(search)  ||
    s.email.toLowerCase().includes(search)      ||
    s.phone.includes(search)
  );
  if (gender) students = students.filter(s => s.gender === gender);
  if (dept)   students = students.filter(s => s.department === dept);
  if (year)   students = students.filter(s => s.year === year);

  const tbody = document.getElementById('studentsTableBody');
  document.getElementById('studentsCount').textContent = `${students.length} student${students.length !== 1 ? 's' : ''}`;

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted" style="padding:2rem;">No students found.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => {
    const alloc  = allocs.find(a => a.studentId === s.id);
    const room   = alloc ? rooms.find(r => r.id === alloc.roomId) : null;
    const block  = room  ? blocks.find(b => b.id === room.blockId) : null;
    const roomLabel = room ? `${block ? block.name : ''}-${room.number}` : '—';
    const initials  = s.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const color     = avatarColor(s.fullName);
    const photoHtml = s.photo
      ? `<img src="${s.photo}" alt="${s.fullName}" />`
      : `<span>${initials}</span>`;

    return `<tr>
      <td>
        <div class="tbl-avatar" style="background:${s.photo ? 'transparent' : color}">
          ${photoHtml}
        </div>
      </td>
      <td>${s.studentId}</td>
      <td><strong>${s.fullName}</strong></td>
      <td><span class="badge-status ${s.gender === 'Male' ? 'badge-male' : 'badge-female'}">${s.gender}</span></td>
      <td>${s.department}</td>
      <td>Year ${s.year}</td>
      <td>${s.phone}</td>
      <td>${roomLabel}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-icon-view"   title="View"   onclick="viewStudent('${s.id}')">  <span class="material-icons">visibility</span></button>
          <button class="btn-icon btn-icon-edit"   title="Edit"   onclick="editStudent('${s.id}')">  <span class="material-icons">edit</span></button>
          <button class="btn-icon btn-icon-delete" title="Delete" onclick="deleteStudent('${s.id}')"><span class="material-icons">delete</span></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/** Fill the department filter dropdown */
function populateDeptFilter(students) {
  const sel  = document.getElementById('studentDeptFilter');
  const depts = [...new Set(students.map(s => s.department))].sort();
  const current = sel.value;
  // Only rebuild if needed
  if (sel.options.length - 1 === depts.length) return;
  sel.innerHTML = `<option value="">All Departments</option>` +
    depts.map(d => `<option value="${d}" ${d === current ? 'selected' : ''}>${d}</option>`).join('');
}

/** Open blank student form */
function openAddStudent() {
  document.getElementById('studentModalTitle').textContent = 'Add Student';
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  document.getElementById('photoPreviewWrap').classList.add('hidden');
  document.getElementById('saveStudentBtn').textContent = 'Save Student';
  document.getElementById('studentFormAlert').classList.add('hidden');
  openModal('studentModal');
}

/** Pre-fill student form for editing */
function editStudent(id) {
  const students = getData(KEYS.students);
  const s = students.find(x => x.id === id);
  if (!s) return;

  document.getElementById('studentModalTitle').textContent = 'Edit Student';
  document.getElementById('studentId').value     = s.id;
  document.getElementById('sStudentId').value    = s.studentId;
  document.getElementById('sFullName').value     = s.fullName;
  document.getElementById('sGender').value       = s.gender;
  document.getElementById('sYear').value         = s.year;
  document.getElementById('sDepartment').value   = s.department;
  document.getElementById('sPhone').value        = s.phone;
  document.getElementById('sEmail').value        = s.email;
  document.getElementById('saveStudentBtn').textContent = 'Update Student';
  document.getElementById('studentFormAlert').classList.add('hidden');

  // Show existing photo
  if (s.photo) {
    document.getElementById('photoPreview').src = s.photo;
    document.getElementById('photoPreviewWrap').classList.remove('hidden');
  } else {
    document.getElementById('photoPreviewWrap').classList.add('hidden');
  }

  openModal('studentModal');
}

/** View student details modal */
function viewStudent(id) {
  const students = getData(KEYS.students);
  const allocs   = getData(KEYS.allocations);
  const rooms    = getData(KEYS.rooms);
  const blocks   = getData(KEYS.blocks);
  const s = students.find(x => x.id === id);
  if (!s) return;

  const alloc = allocs.find(a => a.studentId === s.id);
  const room  = alloc ? rooms.find(r => r.id === alloc.roomId) : null;
  const block = room  ? blocks.find(b => b.id === room.blockId) : null;

  const initials = s.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const color    = avatarColor(s.fullName);
  const photoSrc = s.photo || null;

  document.getElementById('viewStudentBody').innerHTML = `
    <div class="student-detail">
      ${photoSrc
        ? `<img src="${photoSrc}" alt="${s.fullName}" class="student-detail-photo" />`
        : `<div class="student-detail-photo" style="background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-size:2rem;font-weight:700;">${initials}</div>`}
      <div class="student-detail-info">
        <h3>${s.fullName}</h3>
        <span class="badge-status ${s.gender === 'Male' ? 'badge-male' : 'badge-female'}">${s.gender}</span>
        <div class="detail-grid">
          <div class="detail-item"><label>Student ID</label><span>${s.studentId}</span></div>
          <div class="detail-item"><label>Department</label><span>${s.department}</span></div>
          <div class="detail-item"><label>Year of Study</label><span>Year ${s.year}</span></div>
          <div class="detail-item"><label>Phone</label><span>${s.phone}</span></div>
          <div class="detail-item"><label>Email</label><span>${s.email}</span></div>
          <div class="detail-item"><label>Registered</label><span>${formatDate(s.createdAt)}</span></div>
          <div class="detail-item"><label>Block</label><span>${block ? block.name : '—'}</span></div>
          <div class="detail-item"><label>Room</label><span>${room ? room.number : '—'}</span></div>
        </div>
      </div>
    </div>`;
  openModal('viewStudentModal');
}

/** Delete a student */
function deleteStudent(id) {
  const students = getData(KEYS.students);
  const s = students.find(x => x.id === id);
  if (!s) return;

  confirmAction(`Delete student "${s.fullName}"? This will also remove their room allocation.`, () => {
    // Remove student
    setData(KEYS.students, students.filter(x => x.id !== id));
    // Remove their allocation
    const allocs = getData(KEYS.allocations);
    setData(KEYS.allocations, allocs.filter(a => a.studentId !== id));
    renderStudents();
    updateNotifBadge();
    showToast(`Student "${s.fullName}" deleted.`, 'success');
  });
}

/** Handle student form submit (add & edit) */
function initStudentForm() {
  // Add button
  document.getElementById('addStudentBtn').addEventListener('click', openAddStudent);

  // Photo preview
  document.getElementById('sPhoto').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('photoPreview').src = ev.target.result;
      document.getElementById('photoPreviewWrap').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  // Form submit
  document.getElementById('studentForm').addEventListener('submit', e => {
    e.preventDefault();
    const alertBox = document.getElementById('studentFormAlert');

    const id         = document.getElementById('studentId').value;
    const studentId  = document.getElementById('sStudentId').value.trim();
    const fullName   = document.getElementById('sFullName').value.trim();
    const gender     = document.getElementById('sGender').value;
    const year       = document.getElementById('sYear').value;
    const department = document.getElementById('sDepartment').value;
    const phone      = document.getElementById('sPhone').value.trim();
    const email      = document.getElementById('sEmail').value.trim().toLowerCase();
    const photoEl    = document.getElementById('sPhoto');

    // Validation
    if (!studentId || !fullName || !gender || !year || !department || !phone || !email) {
      showAlert(alertBox, 'error', 'Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert(alertBox, 'error', 'Please enter a valid email address.');
      return;
    }

    const students = getData(KEYS.students);

    // Check duplicate Student ID
    const duplicate = students.find(s => s.studentId === studentId && s.id !== id);
    if (duplicate) {
      showAlert(alertBox, 'error', `Student ID "${studentId}" is already in use.`);
      return;
    }

    // Check duplicate email
    const dupEmail = students.find(s => s.email === email && s.id !== id);
    if (dupEmail) {
      showAlert(alertBox, 'error', `Email "${email}" is already in use.`);
      return;
    }

    // Handle photo
    const getPhoto = (callback) => {
      if (photoEl.files && photoEl.files[0]) {
        const reader = new FileReader();
        reader.onload = ev => callback(ev.target.result);
        reader.readAsDataURL(photoEl.files[0]);
      } else {
        // Keep existing photo if editing
        if (id) {
          const existing = students.find(s => s.id === id);
          callback(existing ? existing.photo : '');
        } else {
          callback('');
        }
      }
    };

    getPhoto(photo => {
      if (id) {
        // Edit
        const idx = students.findIndex(s => s.id === id);
        if (idx === -1) return;
        students[idx] = { ...students[idx], studentId, fullName, gender, year, department, phone, email, photo };
        setData(KEYS.students, students);
        showToast(`Student "${fullName}" updated.`, 'success');
      } else {
        // Add
        const newStudent = {
          id: uid('STU'),
          studentId, fullName, gender, year, department, phone, email, photo,
          createdAt: new Date().toISOString().split('T')[0],
        };
        students.push(newStudent);
        setData(KEYS.students, students);
        showToast(`Student "${fullName}" added.`, 'success');
      }

      closeModal('studentModal');
      renderStudents();
    });
  });

  // Search & filters
  document.getElementById('studentSearch').addEventListener('input', renderStudents);
  document.getElementById('studentGenderFilter').addEventListener('change', renderStudents);
  document.getElementById('studentDeptFilter').addEventListener('change', renderStudents);
  document.getElementById('studentYearFilter').addEventListener('change', renderStudents);
}

/* ═══════════════════════════════════════════════════════════
   DORMITORY BLOCKS MODULE
   ═══════════════════════════════════════════════════════════ */

/** Render blocks grid */
function renderBlocks() {
  const blocks  = getData(KEYS.blocks);
  const rooms   = getData(KEYS.rooms);
  const occMap  = roomOccupancy();
  const grid    = document.getElementById('blocksGrid');

  if (!blocks.length) {
    grid.innerHTML = `<p class="text-muted">No dormitory blocks added yet.</p>`;
    return;
  }

  grid.innerHTML = blocks.map(b => {
    const bRooms    = rooms.filter(r => r.blockId === b.id);
    const capacity  = bRooms.reduce((s, r) => s + r.capacity, 0);
    const occupied  = bRooms.reduce((s, r) => s + (occMap[r.id] || 0), 0);
    const pct       = capacity ? Math.round(occupied / capacity * 100) : 0;
    const genderBadge = b.gender === 'Male'
      ? 'badge-male' : b.gender === 'Female' ? 'badge-female' : 'badge-status badge-available';

    return `<div class="block-card">
      <div class="block-card-header">
        <span class="material-icons block-icon">apartment</span>
        <div>
          <h3>${b.name}</h3>
          <small>${b.code} &bull; ${b.floors || '?'} floors</small>
        </div>
        <span class="badge-status ${genderBadge}" style="margin-left:auto;">${b.gender}</span>
      </div>
      <div class="block-card-body">
        <div class="block-stat"><span>Total Rooms</span><span>${bRooms.length}</span></div>
        <div class="block-stat"><span>Total Beds</span><span>${capacity}</span></div>
        <div class="block-stat"><span>Occupied Beds</span><span>${occupied}</span></div>
        <div class="block-stat"><span>Available Beds</span><span>${capacity - occupied}</span></div>
        <div class="occ-bar-wrap">
          <div class="occ-bar-label"><span>Occupancy</span><span>${pct}%</span></div>
          <div class="occ-bar"><div class="occ-bar-fill" style="width:${pct}%"></div></div>
        </div>
        ${b.description ? `<p class="text-muted" style="font-size:.8rem;margin-top:.5rem;">${b.description}</p>` : ''}
      </div>
      <div class="block-card-footer">
        <button class="btn btn-sm btn-secondary" onclick="editBlock('${b.id}')">
          <span class="material-icons">edit</span> Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteBlock('${b.id}')">
          <span class="material-icons">delete</span> Delete
        </button>
      </div>
    </div>`;
  }).join('');
}

/** Open add block modal */
function openAddBlock() {
  document.getElementById('blockModalTitle').textContent = 'Add Dormitory Block';
  document.getElementById('blockForm').reset();
  document.getElementById('blockId').value = '';
  document.getElementById('blockFormAlert').classList.add('hidden');
  openModal('blockModal');
}

/** Edit block */
function editBlock(id) {
  const blocks = getData(KEYS.blocks);
  const b = blocks.find(x => x.id === id);
  if (!b) return;

  document.getElementById('blockModalTitle').textContent = 'Edit Dormitory Block';
  document.getElementById('blockId').value         = b.id;
  document.getElementById('bName').value           = b.name;
  document.getElementById('bCode').value           = b.code;
  document.getElementById('bGender').value         = b.gender;
  document.getElementById('bFloors').value         = b.floors || '';
  document.getElementById('bDescription').value    = b.description || '';
  document.getElementById('blockFormAlert').classList.add('hidden');
  openModal('blockModal');
}

/** Delete block */
function deleteBlock(id) {
  const blocks = getData(KEYS.blocks);
  const b      = blocks.find(x => x.id === id);
  if (!b) return;

  const rooms = getData(KEYS.rooms);
  const hasRooms = rooms.some(r => r.blockId === id);

  if (hasRooms) {
    showToast('Cannot delete a block that has rooms. Delete rooms first.', 'error');
    return;
  }

  confirmAction(`Delete block "${b.name}"?`, () => {
    setData(KEYS.blocks, blocks.filter(x => x.id !== id));
    renderBlocks();
    showToast(`Block "${b.name}" deleted.`, 'success');
  });
}

/** Handle block form submit */
function initBlockForm() {
  document.getElementById('addBlockBtn').addEventListener('click', openAddBlock);

  document.getElementById('blockForm').addEventListener('submit', e => {
    e.preventDefault();
    const alertBox = document.getElementById('blockFormAlert');
    const id    = document.getElementById('blockId').value;
    const name  = document.getElementById('bName').value.trim();
    const code  = document.getElementById('bCode').value.trim().toUpperCase();
    const gender = document.getElementById('bGender').value;
    const floors = parseInt(document.getElementById('bFloors').value) || 0;
    const desc  = document.getElementById('bDescription').value.trim();

    if (!name || !code || !gender) {
      showAlert(alertBox, 'error', 'Please fill in all required fields.');
      return;
    }

    const blocks = getData(KEYS.blocks);

    // Duplicate code check
    const dup = blocks.find(b => b.code === code && b.id !== id);
    if (dup) {
      showAlert(alertBox, 'error', `Block code "${code}" is already in use.`);
      return;
    }

    if (id) {
      const idx = blocks.findIndex(b => b.id === id);
      blocks[idx] = { ...blocks[idx], name, code, gender, floors, description: desc };
      setData(KEYS.blocks, blocks);
      showToast(`Block "${name}" updated.`, 'success');
    } else {
      blocks.push({ id: uid('BLK'), name, code, gender, floors, description: desc });
      setData(KEYS.blocks, blocks);
      showToast(`Block "${name}" added.`, 'success');
    }

    closeModal('blockModal');
    renderBlocks();
    // Refresh block dropdowns
    populateBlockDropdowns();
  });
}

/** Populate all block <select> dropdowns across the app */
function populateBlockDropdowns() {
  const blocks = getData(KEYS.blocks);
  const selectors = ['#roomBlockFilter', '#rBlock', '#allocBlock', '#allocBlockFilter'];
  selectors.forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    const current = el.value;
    const isFilter = sel.includes('Filter');
    el.innerHTML = (isFilter ? '<option value="">All Blocks</option>' : '<option value="">Select Block…</option>') +
      blocks.map(b => `<option value="${b.id}" ${b.id === current ? 'selected' : ''}>${b.name}</option>`).join('');
  });
}

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initStudentForm();
  initBlockForm();
  populateBlockDropdowns();
});
