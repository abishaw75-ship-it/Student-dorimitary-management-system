/**
 * rooms.js  –  Room management & Room Allocation
 * DMU Student Dormitory Management System
 *
 * Handles:
 *  - Render rooms table
 *  - Add / Edit / Delete rooms
 *  - Render allocations table
 *  - Allocate / Re-allocate / Remove student allocations
 */

/* ═══════════════════════════════════════════════════════════
   ROOMS MODULE
   ═══════════════════════════════════════════════════════════ */

/** Render filtered rooms table */
function renderRooms() {
  populateBlockDropdowns();

  const search      = (document.getElementById('roomSearch').value || '').toLowerCase();
  const blockFilter = document.getElementById('roomBlockFilter').value;
  const statusFilter = document.getElementById('roomStatusFilter').value;

  let rooms  = getData(KEYS.rooms);
  const blocks  = getData(KEYS.blocks);
  const occMap  = roomOccupancy();

  // Apply filters
  if (search) rooms = rooms.filter(r => {
    const b = blocks.find(x => x.id === r.blockId);
    return r.number.toLowerCase().includes(search) ||
           (b && b.name.toLowerCase().includes(search));
  });
  if (blockFilter) rooms = rooms.filter(r => r.blockId === blockFilter);
  if (statusFilter === 'available') rooms = rooms.filter(r => (occMap[r.id] || 0) < r.capacity);
  if (statusFilter === 'full')      rooms = rooms.filter(r => (occMap[r.id] || 0) >= r.capacity);

  const tbody = document.getElementById('roomsTableBody');

  if (!rooms.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">No rooms found.</td></tr>`;
    return;
  }

  tbody.innerHTML = rooms.map(r => {
    const block    = blocks.find(b => b.id === r.blockId);
    const occ      = occMap[r.id] || 0;
    const avail    = r.capacity - occ;
    const isFull   = occ >= r.capacity;
    const pct      = Math.round((occ / r.capacity) * 100);

    return `<tr>
      <td><strong>${r.number}</strong></td>
      <td>${block ? block.name : '—'}</td>
      <td>${r.capacity}</td>
      <td>
        <div style="display:flex;align-items:center;gap:.5rem;">
          <div class="occ-bar" style="width:60px;"><div class="occ-bar-fill" style="width:${pct}%;background:${isFull?'#ef4444':'#2a7ae4'}"></div></div>
          <span>${occ}</span>
        </div>
      </td>
      <td>${avail}</td>
      <td><span class="badge-status ${isFull ? 'badge-full' : 'badge-available'}">${isFull ? 'Full' : 'Available'}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-icon-edit"   title="Edit"   onclick="editRoom('${r.id}')">  <span class="material-icons">edit</span></button>
          <button class="btn-icon btn-icon-delete" title="Delete" onclick="deleteRoom('${r.id}')"><span class="material-icons">delete</span></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/** Open add room modal */
function openAddRoom() {
  document.getElementById('roomModalTitle').textContent = 'Add Room';
  document.getElementById('roomForm').reset();
  document.getElementById('roomId').value = '';
  document.getElementById('roomFormAlert').classList.add('hidden');
  populateBlockDropdowns();
  openModal('roomModal');
}

/** Edit room */
function editRoom(id) {
  const rooms = getData(KEYS.rooms);
  const r = rooms.find(x => x.id === id);
  if (!r) return;

  document.getElementById('roomModalTitle').textContent = 'Edit Room';
  document.getElementById('roomId').value     = r.id;
  document.getElementById('rNumber').value    = r.number;
  document.getElementById('rCapacity').value  = r.capacity;
  document.getElementById('rNotes').value     = r.notes || '';
  document.getElementById('roomFormAlert').classList.add('hidden');
  populateBlockDropdowns();
  document.getElementById('rBlock').value     = r.blockId;
  openModal('roomModal');
}

/** Delete room */
function deleteRoom(id) {
  const rooms = getData(KEYS.rooms);
  const r     = rooms.find(x => x.id === id);
  if (!r) return;

  const allocs = getData(KEYS.allocations);
  const hasStudents = allocs.some(a => a.roomId === id);

  if (hasStudents) {
    showToast('Cannot delete a room with students. Remove allocations first.', 'error');
    return;
  }

  confirmAction(`Delete room "${r.number}"?`, () => {
    setData(KEYS.rooms, rooms.filter(x => x.id !== id));
    renderRooms();
    showToast(`Room "${r.number}" deleted.`, 'success');
  });
}

/** Handle room form submit */
function initRoomForm() {
  document.getElementById('addRoomBtn').addEventListener('click', openAddRoom);

  document.getElementById('roomForm').addEventListener('submit', e => {
    e.preventDefault();
    const alertBox = document.getElementById('roomFormAlert');

    const id       = document.getElementById('roomId').value;
    const number   = document.getElementById('rNumber').value.trim();
    const blockId  = document.getElementById('rBlock').value;
    const capacity = parseInt(document.getElementById('rCapacity').value);
    const notes    = document.getElementById('rNotes').value.trim();

    if (!number || !blockId || !capacity || capacity < 1) {
      showAlert(alertBox, 'error', 'Please fill in all required fields with valid values.');
      return;
    }

    const rooms = getData(KEYS.rooms);

    // Check if room number already exists in this block
    const dup = rooms.find(r => r.number === number && r.blockId === blockId && r.id !== id);
    if (dup) {
      showAlert(alertBox, 'error', `Room "${number}" already exists in this block.`);
      return;
    }

    // Cannot reduce capacity below current occupancy
    if (id) {
      const occMap = roomOccupancy();
      const currentOcc = occMap[id] || 0;
      if (capacity < currentOcc) {
        showAlert(alertBox, 'error', `Cannot set capacity to ${capacity}. Room currently has ${currentOcc} student(s).`);
        return;
      }
    }

    if (id) {
      const idx = rooms.findIndex(r => r.id === id);
      rooms[idx] = { ...rooms[idx], number, blockId, capacity, notes };
      setData(KEYS.rooms, rooms);
      showToast(`Room "${number}" updated.`, 'success');
    } else {
      rooms.push({ id: uid('RM'), number, blockId, capacity, notes });
      setData(KEYS.rooms, rooms);
      showToast(`Room "${number}" added.`, 'success');
    }

    closeModal('roomModal');
    renderRooms();
  });

  // Filters
  document.getElementById('roomSearch').addEventListener('input', renderRooms);
  document.getElementById('roomBlockFilter').addEventListener('change', renderRooms);
  document.getElementById('roomStatusFilter').addEventListener('change', renderRooms);
}

/* ═══════════════════════════════════════════════════════════
   ALLOCATION MODULE
   ═══════════════════════════════════════════════════════════ */

/** Render allocations table */
function renderAllocations() {
  populateBlockDropdowns();

  const search      = (document.getElementById('allocSearch').value || '').toLowerCase();
  const blockFilter = document.getElementById('allocBlockFilter').value;

  const allocs   = getData(KEYS.allocations);
  const students = getData(KEYS.students);
  const rooms    = getData(KEYS.rooms);
  const blocks   = getData(KEYS.blocks);

  let rows = allocs.map(a => {
    const student = students.find(s => s.id === a.studentId);
    const room    = rooms.find(r => r.id === a.roomId);
    const block   = room ? blocks.find(b => b.id === room.blockId) : null;
    return { ...a, student, room, block };
  }).filter(row => row.student && row.room);

  // Filter
  if (search) rows = rows.filter(row =>
    row.student.fullName.toLowerCase().includes(search)   ||
    row.student.studentId.toLowerCase().includes(search)  ||
    row.room.number.toLowerCase().includes(search)
  );
  if (blockFilter) rows = rows.filter(row => row.room && row.room.blockId === blockFilter);

  const tbody = document.getElementById('allocTableBody');

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding:2rem;">No allocations found.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(row => `
    <tr>
      <td>${row.student.studentId}</td>
      <td><strong>${row.student.fullName}</strong></td>
      <td><span class="badge-status ${row.student.gender === 'Male' ? 'badge-male' : 'badge-female'}">${row.student.gender}</span></td>
      <td>${row.student.department}</td>
      <td>${row.block ? row.block.name : '—'}</td>
      <td><strong>${row.room.number}</strong></td>
      <td>${formatDate(row.allocatedAt)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-icon-edit"   title="Change Room"  onclick="editAllocation('${row.id}')">  <span class="material-icons">swap_horiz</span></button>
          <button class="btn-icon btn-icon-delete" title="Remove"       onclick="removeAllocation('${row.id}')"><span class="material-icons">delete</span></button>
        </div>
      </td>
    </tr>`).join('');
}

/** Open allocate modal */
function openAllocate() {
  document.getElementById('allocModalTitle').textContent = 'Allocate Room';
  document.getElementById('allocForm').reset();
  document.getElementById('allocId').value = '';
  document.getElementById('allocFormAlert').classList.add('hidden');
  populateAllocStudentDropdown();
  populateBlockDropdowns();
  document.getElementById('allocRoom').innerHTML = '<option value="">Select Block first…</option>';
  openModal('allocModal');
}

/** Edit (change) allocation */
function editAllocation(id) {
  const allocs  = getData(KEYS.allocations);
  const rooms   = getData(KEYS.rooms);
  const a = allocs.find(x => x.id === id);
  if (!a) return;

  document.getElementById('allocModalTitle').textContent = 'Change Room Allocation';
  document.getElementById('allocId').value      = a.id;
  document.getElementById('allocFormAlert').classList.add('hidden');
  populateAllocStudentDropdown(a.studentId, true /* disabled */);
  populateBlockDropdowns();

  const room    = rooms.find(r => r.id === a.roomId);
  if (room) {
    document.getElementById('allocBlock').value = room.blockId;
    populateAllocRoomDropdown(room.blockId, a.roomId, a.id);
  }

  openModal('allocModal');
}

/** Remove allocation */
function removeAllocation(id) {
  const allocs = getData(KEYS.allocations);
  const a      = allocs.find(x => x.id === id);
  if (!a) return;

  const students = getData(KEYS.students);
  const s = students.find(x => x.id === a.studentId);

  confirmAction(`Remove room assignment for "${s ? s.fullName : 'this student'}"?`, () => {
    setData(KEYS.allocations, allocs.filter(x => x.id !== id));
    renderAllocations();
    showToast('Room assignment removed.', 'success');
  });
}

/** Populate student select in alloc modal */
function populateAllocStudentDropdown(selectedId = '', disabled = false) {
  const students = getData(KEYS.students);
  const allocs   = getData(KEYS.allocations);
  const sel      = document.getElementById('allocStudent');

  // If editing, show all students; if new, only unallocated ones
  let list = disabled
    ? students
    : students.filter(s => !allocs.some(a => a.studentId === s.id));

  sel.disabled = disabled;
  sel.innerHTML = `<option value="">Select Student…</option>` +
    list.map(s => `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${s.fullName} (${s.studentId})</option>`).join('');
}

/** When block changes, load rooms */
function populateAllocRoomDropdown(blockId, selectedRoomId = '', excludeAllocId = '') {
  const rooms   = getData(KEYS.rooms);
  const allocs  = getData(KEYS.allocations);
  const occMap  = roomOccupancy();

  const blockRooms = rooms.filter(r => r.blockId === blockId);
  const sel = document.getElementById('allocRoom');

  if (!blockRooms.length) {
    sel.innerHTML = '<option value="">No rooms in this block</option>';
    return;
  }

  sel.innerHTML = `<option value="">Select Room…</option>` +
    blockRooms.map(r => {
      const occ   = occMap[r.id] || 0;
      const avail = r.capacity - occ;
      const isFull = avail <= 0 && r.id !== selectedRoomId;
      return `<option value="${r.id}" ${r.id === selectedRoomId ? 'selected' : ''} ${isFull ? 'disabled' : ''}>
        Room ${r.number} (${avail} bed${avail !== 1 ? 's' : ''} available)${isFull ? ' – FULL' : ''}
      </option>`;
    }).join('');
}

/** Handle alloc form submit */
function initAllocForm() {
  document.getElementById('allocateBtn').addEventListener('click', openAllocate);

  // Block change → load rooms
  document.getElementById('allocBlock').addEventListener('change', function () {
    const allocId = document.getElementById('allocId').value;
    populateAllocRoomDropdown(this.value, '', allocId);
  });

  document.getElementById('allocForm').addEventListener('submit', e => {
    e.preventDefault();
    const alertBox = document.getElementById('allocFormAlert');

    const id        = document.getElementById('allocId').value;
    const studentId = document.getElementById('allocStudent').value;
    const roomId    = document.getElementById('allocRoom').value;

    if (!studentId || !roomId) {
      showAlert(alertBox, 'error', 'Please select both a student and a room.');
      return;
    }

    const allocs = getData(KEYS.allocations);
    const rooms  = getData(KEYS.rooms);
    const occMap = roomOccupancy();

    const room = rooms.find(r => r.id === roomId);
    if (!room) { showAlert(alertBox, 'error', 'Room not found.'); return; }

    // Calculate available beds (exclude current allocation if editing)
    const currentOcc = occMap[roomId] || 0;
    const isEditingSameRoom = id && allocs.find(a => a.id === id)?.roomId === roomId;
    const effectiveOcc = isEditingSameRoom ? currentOcc - 1 : currentOcc;

    if (effectiveOcc >= room.capacity) {
      showAlert(alertBox, 'error', `Room ${room.number} is full (${room.capacity}/${room.capacity} beds).`);
      return;
    }

    // Duplicate check (student already allocated to another room, excluding current edit)
    const existingAlloc = allocs.find(a => a.studentId === studentId && a.id !== id);
    if (existingAlloc) {
      showAlert(alertBox, 'error', 'This student is already allocated to a room. Remove the existing allocation first, or use Change Room.');
      return;
    }

    if (id) {
      const idx = allocs.findIndex(a => a.id === id);
      allocs[idx] = { ...allocs[idx], studentId, roomId, allocatedAt: new Date().toISOString().split('T')[0] };
      setData(KEYS.allocations, allocs);
      showToast('Room allocation updated.', 'success');
    } else {
      allocs.push({
        id: uid('ALO'),
        studentId, roomId,
        allocatedAt: new Date().toISOString().split('T')[0],
      });
      setData(KEYS.allocations, allocs);
      showToast('Student allocated successfully.', 'success');
    }

    closeModal('allocModal');
    renderAllocations();
  });

  // Filters
  document.getElementById('allocSearch').addEventListener('input', renderAllocations);
  document.getElementById('allocBlockFilter').addEventListener('change', renderAllocations);
}

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initRoomForm();
  initAllocForm();
});
