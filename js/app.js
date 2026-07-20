const idInput = document.getElementById('idInput');
const lookupBtn = document.getElementById('lookupBtn');
const lookupError = document.getElementById('lookupError');
const resultArea = document.getElementById('resultArea');

function gradeClass(letter) {
  if (!letter) return 'grade-na';
  return letter === 'F' ? 'grade-fail' : 'grade-pass';
}

function renderResult(data) {
  const semestersHtml = (data.semesters || []).map(sem => {
    const rows = (sem.courses || []).map(c => `
      <tr>
        <td class="course-code">${c.course_code || ''}</td>
        <td>${c.course_name || ''}</td>
        <td class="marks">${c.marks !== null && c.marks !== undefined && c.marks !== '' ? c.marks : '—'}</td>
        <td class="grade"><span class="grade-pill ${gradeClass(c.result)}">${c.result || '—'}</span></td>
        <td class="gp">${c.grade_point !== null && c.grade_point !== undefined ? c.grade_point.toFixed(2) : '—'}</td>
      </tr>
    `).join('');

    return `
      <div class="semester">
        <div class="semester-head">
          <h3>${sem.name}</h3>
          <span class="sem-avg">${sem.average_grade_point !== null ? 'avg. GP ' + sem.average_grade_point.toFixed(2) : 'no gradable data'}</span>
        </div>
        <table>
          <thead>
            <tr><th>Code</th><th>Course</th><th style="text-align:right">Marks</th><th style="text-align:right">Grade</th><th style="text-align:right">GP</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }).join('');

  resultArea.innerHTML = `
    <div class="detail-header">
      <div>
        <h2>${data.student_name || 'Unnamed'}</h2>
        <div class="meta-line">
          <span class="k">ID</span>${data.student_id || '—'}<br>
          <span class="k">Program</span>${data.program_name || '—'}<br>
          <span class="k">Center</span>${data.study_center_name || '—'}<br>
          <span class="k">Batch</span>${data.batch || '—'}
        </div>
      </div>
      <div class="overall-gp">
        <div class="num">${data.overall_average_grade_point !== null ? data.overall_average_grade_point.toFixed(2) : '—'}</div>
        <div class="lbl">Avg. Grade Point</div>
      </div>
    </div>
    <div class="note">
      This average is an unweighted mean of grade points across your recorded courses — it is <strong>not</strong> your official CGPA, which per the program handbook is credit-weighted (Σ credits × grade point ÷ total credits). Course credit values aren't in the result feed this tool reads, so treat this as indicative rather than official. See the <a href="grading.html">Grading System</a> page for how the real calculation works.
    </div>
    ${semestersHtml || '<div class="semester"><p style="color:var(--ink-soft);font-size:13px;">No semester results available yet.</p></div>'}
  `;
  resultArea.style.display = 'block';
}

async function doLookup() {
  const id = idInput.value.trim().replace(/[^0-9]/g, '');
  lookupError.style.display = 'none';
  resultArea.style.display = 'none';

  if (!id) {
    lookupError.textContent = 'Enter your student ID first.';
    lookupError.style.display = 'block';
    return;
  }

  lookupBtn.disabled = true;
  lookupBtn.textContent = 'Checking…';

  try {
    const resp = await fetch(`/api/result/${id}`);
    const data = await resp.json();

    if (!resp.ok) {
      lookupError.textContent = data.error || 'Something went wrong. Please try again.';
      lookupError.style.display = 'block';
      return;
    }

    renderResult(data);
  } catch (err) {
    lookupError.textContent = 'Could not reach the server. Please try again in a moment.';
    lookupError.style.display = 'block';
  } finally {
    lookupBtn.disabled = false;
    lookupBtn.textContent = 'Check Result';
  }
}

lookupBtn.addEventListener('click', doLookup);
idInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLookup();
});
