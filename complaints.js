/**
 * complaints.js  –  Complaint management
 * DMU Student Dormitory Management System
 *
 * Handles:
 *  - Render admin complaints table
 *  - Update complaint status
 *  - Student submit complaint
 *  - Student view own complaint history
 */

/* ═══════════════════════════════════════════════════════════
   ADMIN COMPLAINTS
   ═══════════════════════════════════════════════════════════ */

/** Render all complaints (admin view) */
function renderComplaints() {
  const search      = (document.getElementById('complaintSearch').value || '').toLowerCase();
  const statusFilter = document.getElementById('complaintStatusFilter').value;
  const catFilter    = document.getElementById('complaintCatFilter').value;

  let complaints = getData(KEYS.complaints);
  const students = getData(KEYS.students);
  const allocs   = getData(KEYS.allocations);
  const rooms    = getData(KEYS.rooms);
  const blocks   = getData(KEYS.blocks);

  // Apply filters
  if (search) complaints = complaints.filter(c => {
    const s = students.find(x => x.id === c.studentId);
    return (s && s.fullName.toLowerCase().includes(search)) ||
           c.category.toLowerCase().includes(search)         ||
           c.description.toLowerCase().includes(search);
  });
  if (statusFilter) complaints = complaints.filter(c => c.status === statusFilter);
  if (catFilter)    complaints = complaints.filter(c => c.category === catFilter);

  const tbody = document.getElementById('complaintsTableBody');

  if (!complaints.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding:2rem;">No complaints found.</td></tr>`;
    return;
  }

  tbody.innerHTML = complaints.map((c, idx) => {
    const student = students.find(s => s.id === c.studentId);
    const alloc   = allocs.find(a => a.studentId === c.studentId);
    const room    = alloc ? rooms.find(r => r.id === alloc.roomId) : null;
    const block   = room  ? blocks.find(b => b.id === room.blockId) : null;
    const roomLabel = room ? `${block ? block.name : ''}-${room.number}` : '—';

    const statusClass = {
      'Pending':     'badge-pending',
      'In Progress': 'badge-progress',
      'Resolved':    'badge-resolved',
    }[c.status] || 'badge-pending';

    // Truncate description
    const shortDesc = c.description.length > 60
      ? c.description.slice(0, 60) + '…'
      : c.description;

    return `<tr>
      <td>${idx + 1}</td>
      <td>${student ? student.fullName : '—'}</td>
      <td>${roomLabel}</td>
      <td><span class="badge-status badge-available" style="background:#e0f2fe;color:#075985;">${c.category}</span></td>
      <td title="${c.description}">${shortDesc}</td>
      <td>${formatDate(c.submittedAt)}</td>
      <td><span class="badge-status ${statusClass}">${c.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-icon-edit"   title="Update Status" onclick="openComplaintUpdate('${c.id}')"><span class="material-icons">edit</span></button>
          <button class="btn-icon btn-icon-delete" title="Delete"        onclick="deleteComplaint('${c.id}')">   <span class="material-icons">delete</span></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/** Open complaint status update modal */
function openComplaintUpdate(id) {
  const complaints = getData(KEYS.complaints);
  const c = complaints.find(x => x.id === id);
  if (!c) return;

  document.getElementById('complaintEditId').value     = c.id;
  document.getElementById('complaintStatusSelect').value = c.status;
  document.getElementById('complaintAdminNote').value  = c.adminNote || '';
  openModal('complaintModal');
}

/** Delete complaint */
function deleteComplaint(id) {
  const complaints = getData(KEYS.complaints);
  confirmAction('Delete this complaint?', () => {
    setData(KEYS.complaints, complaints.filter(x => x.id !== id));
    renderComplaints();
    updateNotifBadge();
    showToast('Complaint deleted.', 'success');
  });
}

/** Handle complaint status form */
function initComplaintStatusForm() {
  document.getElementById('complaintStatusForm').addEventListener('submit', e => {
    e.preventDefault();
    const id        = document.getElementById('complaintEditId').value;
    const status    = document.getElementById('complaintStatusSelect').value;
    const adminNote = document.getElementById('complaintAdminNote').value.trim();

    const complaints = getData(KEYS.complaints);
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return;

    complaints[idx] = { ...complaints[idx], status, adminNote };
    setData(KEYS.complaints, complaints);
    closeModal('complaintModal');
    renderComplaints();
    updateNotifBadge();
    showToast('Complaint status updated.', 'success');
  });

  // Filters
  document.getElementById('complaintSearch').addEventListener('input', renderComplaints);
  document.getElementById('complaintStatusFilter').addEventListener('change', renderComplaints);
  document.getElementById('complaintCatFilter').addEventListener('change', renderComplaints);
}

/* ═══════════════════════════════════════════════════════════
   STUDENT COMPLAINTS
   ═══════════════════════════════════════════════════════════ */

/** Render student's own complaint history */
function renderMyComplaints() {
  const user = getUser();
  if (!user || user.role !== 'student') return;

  const students = getData(KEYS.students);
  const student  = students.find(s => s.studentId === user.studentId);
  if (!student) return;

  const complaints = getData(KEYS.complaints).filter(c => c.studentId === student.id);
  const tbody      = document.getElementById('myComplaintsBody');

  if (!complaints.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No complaints submitted yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = complaints.map((c, i) => {
    const statusClass = {
      'Pending':     'badge-pending',
      'In Progress': 'badge-progress',
      'Resolved':    'badge-resolved',
    }[c.status] || 'badge-pending';

    return `<tr>
      <td>${i + 1}</td>
      <td>${c.category}</td>
      <td>${formatDate(c.submittedAt)}</td>
      <td><span class="badge-status ${statusClass}">${c.status}</span></td>
    </tr>`;
  }).join('');
}

/** Handle student submit complaint form */
function initStudentComplaintForm() {
  const form      = document.getElementById('studentComplaintForm');
  const alertBox  = document.getElementById('complaintFormAlert');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const user = getUser();
    if (!user || user.role !== 'student') return;

    const students = getData(KEYS.students);
    const student  = students.find(s => s.studentId === user.studentId);

    if (!student) {
      showAlert(alertBox, 'error', 'Student record not found. Contact the administrator.');
      return;
    }

    const category    = document.getElementById('scCategory').value;
    const description = document.getElementById('scDescription').value.trim();

    if (!category || !description) {
      showAlert(alertBox, 'error', 'Please fill in all required fields.');
      return;
    }
    if (description.length < 20) {
      showAlert(alertBox, 'error', 'Please provide a more detailed description (at least 20 characters).');
      return;
    }

    const complaints = getData(KEYS.complaints);
    complaints.push({
      id:          uid('CMP'),
      studentId:   student.id,
      category,
      description,
      submittedAt: new Date().toISOString().split('T')[0],
      status:      'Pending',
      adminNote:   '',
    });
    setData(KEYS.complaints, complaints);

    form.reset();
    showAlert(alertBox, 'success', 'Your complaint has been submitted successfully. We will review it shortly.');
    renderMyComplaints();
    updateNotifBadge();
  });
}

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initComplaintStatusForm();
  initStudentComplaintForm();
});
