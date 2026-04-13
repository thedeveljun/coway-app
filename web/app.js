function goPage(page, btn){
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('pg-' + page).classList.add('active');

  if (btn) btn.classList.add('active');

  curPage = page;
  document.getElementById('fab').style.display = page === 'members' ? 'flex' : 'none';
  renders[page]();
}

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function openSheet(id){
  document.getElementById('ov').classList.add('show');
  document.getElementById(id).classList.add('show');
}

function closeSheet(){
  document.getElementById('ov').classList.remove('show');
  ['sh-add', 'sh-member'].forEach(id => document.getElementById(id).classList.remove('show'));
}

function selType(t){
  addType = t;
  document.getElementById('to-kodak').className = 'to' + (t === 'kodak' ? ' sk' : '');
  document.getElementById('to-kodi').className = 'to' + (t === 'kodi' ? ' si' : '');
}

function openAddSheet(){
  document.getElementById('inp-name').value = '';
  document.getElementById('inp-phone').value = '';
  selType('kodak');
  openSheet('sh-add');
}

function selEditType(t){
  const k = document.getElementById('edit-to-kodak');
  const i = document.getElementById('edit-to-kodi');
  if (!k || !i) return;

  k.className = 'to' + (t === 'kodak' ? ' sk' : '');
  i.className = 'to' + (t === 'kodi' ? ' si' : '');

  const m = S.members.find(x => x.id === editMemberId);
  if (m) m._editType = t;
}

function openEditMember(id){
  editMemberId = id;
  const m = S.members.find(x => x.id === id);
  if (!m) return;

  document.getElementById('sh-member-title').textContent = `${m.name} - 팀원 정보 수정`;
  document.getElementById('inp-member-name-edit').value = m.name;
  document.getElementById('inp-member-phone-edit').value = formatPhone(m.phone || '');
  m._editType = m.type;
  selEditType(m.type);
  openSheet('sh-member');
}

function saveMemberInfo(){
  if (!editMemberId) return;
  const m = S.members.find(x => x.id === editMemberId);
  if (!m) return;

  const newName = document.getElementById('inp-member-name-edit').value.trim();
  if (!newName) return toast('이름을 입력해주세요');

  m.name = newName;
  m.type = m._editType || m.type;
  m.phone = document.getElementById('inp-member-phone-edit').value.trim();
  delete m._editType;

  save();
  closeSheet();

  if (curPage === 'members') renderMembers();
  if (curPage === 'weekly') renderWeekly();
  if (curPage === 'monthly') renderMonthly();
  if (curPage === 'dashboard') renderDash();

  toast('팀원 정보가 수정되었습니다');
}

function renderDash(){
  const el = document.getElementById('pg-dashboard');
  const wds = weekDates(Y, W);
  const wt = twSum(Y, W);
  const mt = tmSum(Y, Mo);

  const ranked = [...S.members]
    .map(m => {
      const s = wSum(Y, W, m.id);
      return {
        ...m,
        ...s,
        total: s.신규 + s.정수 + s.전략
      };
    })
    .sort((a, b) => b.total - a.total);

  const mx = ranked[0]?.total || 1;
  const rc = ['g', 's', 'b'];
  const re = ['🥇', '🥈', '🥉'];

  el.innerHTML = `
    <div class="hero fi">
      <div class="hero-label">${Y}년 제${W}주</div>
      <div class="hero-week">${fmt(wds[0])} ~ ${fmt(wds[6])} 팀 실적</div>
      <div class="hero-date">팀원 ${S.members.length}명</div>
      <div class="hero-grid">
        <div class="hero-stat">
          <div class="hero-stat-val">${wt.신규}</div>
          <div class="hero-stat-lbl">신규건수</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">${wt.정수}</div>
          <div class="hero-stat-lbl">정수건수</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">${wt.전략}</div>
          <div class="hero-stat-lbl">전략건수</div>
        </div>
      </div>
    </div>

    <div class="section" style="padding-top:10px;">
      <div class="sec-title">이번 달 누적 (${Y}.${String(Mo).padStart(2, '0')})</div>
      <div class="kpi-row">
        <div class="kpi nw">
          <div class="kpi-v">${mt.신규}</div>
          <div class="kpi-l">신규</div>
        </div>
        <div class="kpi gn">
          <div class="kpi-v">${mt.정수}</div>
          <div class="kpi-l">정수</div>
        </div>
        <div class="kpi am">
          <div class="kpi-v">${mt.전략}</div>
          <div class="kpi-l">전략</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="sec-title">이번 주 팀원 순위</div>
      <div class="card">
        ${ranked.map((m, i) => `
          <div class="rank-row fi" style="animation-delay:${i * 0.05}s">
            <div class="rnk ${rc[i] || 'n'}">${i < 3 ? re[i] : i + 1}</div>

            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span style="font-weight:700;font-size:16px;white-space:nowrap;">${m.name}</span>
                <span class="chip ${m.type}">${m.type === 'kodak' ? '코닥' : '코디'}</span>
              </div>

              <div class="bm">
                <div class="bt"><div class="bf nw" style="width:${Math.round((m.신규 / mx) * 100)}%"></div></div>
                <div class="bt"><div class="bf gn" style="width:${Math.round((m.정수 / mx) * 100)}%"></div></div>
                <div class="bt"><div class="bf am" style="width:${Math.round((m.전략 / mx) * 100)}%"></div></div>
              </div>

              <div style="font-size:11px;color:var(--text2);margin-top:4px;font-weight:300;white-space:nowrap;">
                신규 ${m.신규} · 정수 ${m.정수} · 전략 ${m.전략}
              </div>
            </div>

            <div style="text-align:right;flex-shrink:0;min-width:42px;">
              <div style="font-size:18px;font-weight:900;color:var(--blue);line-height:1;">
                ${m.total}
              </div>
              <div style="font-size:11px;color:var(--text2);font-weight:600;margin-top:4px;">
                합계
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderWeekly(){
  const el = document.getElementById('pg-weekly');
  if (!selMem && S.members.length > 0) selMem = S.members[0].id;
  const wds = weekDates(Y, W);
  el.innerHTML = buildWeekNav(wds) + buildViewTabs() + (wView === 'input' ? buildInputView(wds) : buildStatusView(wds));
}

function buildWeekNav(wds){
  return `<div class="week-nav">
    <button class="wn-btn" onclick="chgWeek(-1)">‹</button>
    <div style="text-align:center;">
      <div class="wn-title">${Y}년 제${W}주차</div>
      <div class="wn-date">${fmt(wds[0])}(월) ~ ${fmt(wds[6])}(일)</div>
    </div>
    <button class="wn-btn" onclick="chgWeek(1)">›</button>
  </div>`;
}

function buildViewTabs(){
  return `<div class="view-tabs">
    <div class="vt ${wView === 'input' ? 'active' : ''}" onclick="setWView('input')">✏️ 개인입력</div>
    <div class="vt ${wView === 'status' ? 'active' : ''}" onclick="setWView('status')">📋 팀 현황표</div>
  </div>`;
}

function setWView(v){
  wView = v;
  renderWeekly();
}

function chgWeek(d){
  W += d;
  if (W < 1){
    Y--;
    W = 52;
  }
  if (W > 53){
    Y++;
    W = 1;
  }
  renderWeekly();
}

function buildInputView(wds){
  if (!selMem) return '<div style="padding:24px;text-align:center;color:var(--text2);">팀원을 추가해 주세요</div>';

  const rec = getRec(Y, W, selMem);
  const sr = wSum(Y, W, selMem);
  const sm = S.members.find(m => m.id === selMem) || {};
  const wt = twSum(Y, W);

  return `
  <div class="mem-scroll">
    ${S.members.map(m => `
      <div class="mem-chip ${m.id === selMem ? (m.type === 'kodak' ? 'ak' : 'ai') : ''}"
           onclick="selMem='${m.id}';renderWeekly()">
        ${m.name}
      </div>`).join('')}
  </div>

  <div class="wsum">
    <div class="ws tot"><div class="ws-v" id="ws-tot">${sr.신규 + sr.정수 + sr.전략}</div><div class="ws-l">${sm.name} 합계</div></div>
    <div class="ws nw"><div class="ws-v" id="ws-nw">${sr.신규}</div><div class="ws-l">신규</div></div>
    <div class="ws gn"><div class="ws-v" id="ws-gn">${sr.정수}</div><div class="ws-l">정수</div></div>
    <div class="ws am"><div class="ws-v" id="ws-am">${sr.전략}</div><div class="ws-l">전략</div></div>
  </div>

  <div class="section" style="padding-top:6px;">
    <div class="card" style="padding:10px 10px 6px;">
      <div style="
        display:grid;
        grid-template-columns:52px 1fr 1fr 1fr 44px;
        align-items:center;
        padding:4px 6px 8px;
        font-size:13px;
        font-weight:700;
        color:var(--text2);
        border-bottom:1px solid var(--bd);
      ">
        <div>요일</div>
        <div style="text-align:center;color:var(--blue);">신규</div>
        <div style="text-align:center;color:var(--green);">정수</div>
        <div style="text-align:center;color:var(--amber);">전략</div>
        <div style="text-align:right;color:var(--blue);">합계</div>
      </div>

      ${wds.map((date, i) => {
        const d = rec.days[i];
        const dt = d.신규 + d.정수 + d.전략;
        const isTdy = isToday(date);
        const isWk = i >= 5;

        return `
  <div style="
    display:grid;
    grid-template-columns:52px 1fr 1fr 1fr 44px;
    align-items:center;
    padding:6px;
    column-gap:4px;
    border-bottom:${i < 6 ? '1px solid var(--bd)' : 'none'};
    ${isTdy ? 'background:#F0F6FF;border-radius:8px;' : ''}
  ">
    <div style="display:flex;flex-direction:column;gap:0;">
      <span style="font-size:13px;font-weight:800;${isWk ? 'color:#C62828;' : ''}">${DAYS[i]}</span>
      <span style="font-size:10px;color:var(--text2);">${fmt(date)}</span>
    </div>

    <div class="num-wrap">
      <input
        type="number"
        min="0"
        id="nd-${i}-신규"
        class="num-input nw ${d.신규 === 0 ? 'zero' : ''}"
        value="${d.신규 === 0 ? '' : d.신규}"
        placeholder="0"
        onfocus="handleFocus(this)"
        onblur="handleBlur(this,'${selMem}',${i},'신규')"
        oninput="setDayValue('${selMem}',${i},'신규',this.value)">
    </div>

    <div class="num-wrap">
      <input
        type="number"
        min="0"
        id="nd-${i}-정수"
        class="num-input gn ${d.정수 === 0 ? 'zero' : ''}"
        value="${d.정수 === 0 ? '' : d.정수}"
        placeholder="0"
        onfocus="handleFocus(this)"
        onblur="handleBlur(this,'${selMem}',${i},'정수')"
        oninput="setDayValue('${selMem}',${i},'정수',this.value)">
    </div>

    <div class="num-wrap">
      <input
        type="number"
        min="0"
        id="nd-${i}-전략"
        class="num-input am ${d.전략 === 0 ? 'zero' : ''}"
        value="${d.전략 === 0 ? '' : d.전략}"
        placeholder="0"
        onfocus="handleFocus(this)"
        onblur="handleBlur(this,'${selMem}',${i},'전략')"
        oninput="setDayValue('${selMem}',${i},'전략',this.value)">
    </div>

    <div id="dct-${i}" style="text-align:right;font-size:16px;font-weight:700;color:var(--blue);">${dt}</div>
  </div>`;
      }).join('')}
    </div>
  </div>

  <div class="section" style="padding-top:6px;padding-bottom:14px;">
    <div class="sec-title">팀 전체 주간 합계</div>
    <div class="kpi-row">
      <div class="kpi nw"><div class="kpi-v" style="font-size:24px;">${wt.신규}</div><div class="kpi-l">신규</div></div>
      <div class="kpi gn"><div class="kpi-v" style="font-size:24px;">${wt.정수}</div><div class="kpi-l">정수</div></div>
      <div class="kpi am"><div class="kpi-v" style="font-size:24px;">${wt.전략}</div><div class="kpi-l">전략</div></div>
    </div>
  </div>`;
}

function handleFocus(el){
  el.classList.remove('zero');
  el.placeholder = '';

  if (el.value === '0'){
    el.value = '';
  }
}

function handleBlur(el, mid, di, type){
  if (el.value === ""){
    el.classList.add('zero');
    el.placeholder = '0';

    const rec = getRec(Y, W, mid);
    rec.days[di][type] = 0;
    setRec(Y, W, mid, rec.days);
    renderWeekly();
  } else {
    el.placeholder = '0';
  }
}

function setDayValue(mid, di, type, value){
  const rec = getRec(Y, W, mid);

  if (value === ''){
    rec.days[di][type] = 0;
  } else {
    rec.days[di][type] = Math.max(0, parseInt(value, 10) || 0);
  }

  setRec(Y, W, mid, rec.days);

  const dct = document.getElementById(`dct-${di}`);
  if (dct){
    const d = rec.days[di];
    dct.textContent = d.신규 + d.정수 + d.전략;
  }

  const ws = wSum(Y, W, mid);
  const totEl = document.getElementById('ws-tot'); if (totEl) totEl.textContent = ws.신규 + ws.정수 + ws.전략;
  const nwEl = document.getElementById('ws-nw'); if (nwEl) nwEl.textContent = ws.신규;
  const gnEl = document.getElementById('ws-gn'); if (gnEl) gnEl.textContent = ws.정수;
  const amEl = document.getElementById('ws-am'); if (amEl) amEl.textContent = ws.전략;
}

function buildStatusView(wds){
  const todayIdx = wds.findIndex(d => isToday(d));
  const rows = S.members.map(m => ({ ...m, days: getRec(Y, W, m.id).days }));
  const teamDays = Array.from({ length: 7 }, (_, i) => ({
    신규: rows.reduce((s, r) => s + r.days[i].신규, 0),
    정수: rows.reduce((s, r) => s + r.days[i].정수, 0),
    전략: rows.reduce((s, r) => s + r.days[i].전략, 0),
  }));

  function getVal(days, i){
    if (statItem === 'total') return days[i].신규 + days[i].정수 + days[i].전략;
    return days[i][statItem];
  }

  function getRowSum(days){
    if (statItem === 'total') return days.reduce((s, d) => s + d.신규 + d.정수 + d.전략, 0);
    return days.reduce((s, d) => s + d[statItem], 0);
  }

  const colorMap = { total: 'var(--blue)', 신규: 'var(--blue)', 정수: 'var(--green)', 전략: 'var(--amber)' };
  const lc = colorMap[statItem];

  const segBtns = [
    { k: 'total', lbl: '전체', ci: 'c0' },
    { k: '신규', lbl: '신규', ci: 'c1' },
    { k: '정수', lbl: '정수', ci: 'c2' },
    { k: '전략', lbl: '전략', ci: 'c3' },
  ];

  const segHTML = `<div class="seg">
    ${segBtns.map(b => `<button class="sb${statItem === b.k ? ' on ' + b.ci : ''}" onclick="statItem='${b.k}';renderWeekly()">${b.lbl}</button>`).join('')}
  </div>`;

  const thead = `<thead><tr>
    <th class="cn">이름</th>
    ${wds.map((d, i) => {
      const isTdy = i === todayIdx;
      const isWk = i >= 5;
      return `<th class="cd${isTdy ? ' tdy' : ''}${isWk ? ' wkd' : ''}">${DAYS[i]}<br><span style="font-size:11px;font-weight:500;">${fmt(d)}</span></th>`;
    }).join('')}
    <th class="cs">합계</th>
  </tr></thead>`;

  const tbody = rows.map((m, ri) => {
    const sum = getRowSum(m.days);
    return `<tr class="fi" style="animation-delay:${ri * .04}s">
      <td class="cn">
        <div style="font-size:12px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px;">${m.name}</div>
        <span class="chip ${m.type}" style="font-size:9px;">${m.type === 'kodak' ? '코닥' : '코디'}</span>
      </td>
      ${m.days.map((day, i) => {
        const v = getVal(m.days, i);
        const isTdy = i === todayIdx;
        return `<td class="dcel${v === 0 ? ' zero' : ''}${isTdy ? ' tdy' : ''}" style="${v > 0 ? `color:${lc};` : ''}">${v === 0 ? '·' : v}</td>`;
      }).join('')}
      <td class="cs" style="color:${lc};">${sum}</td>
    </tr>`;
  }).join('');

  const teamSum = getRowSum(teamDays);
  const teamRow = `<tr class="tr-team">
    <td class="cn" style="font-size:11px;font-weight:700;">팀 합계</td>
    ${teamDays.map((day, i) => {
      const v = getVal(teamDays, i);
      const isTdy = i === todayIdx;
      return `<td class="dcel${isTdy ? ' tdy' : ''}" style="color:${lc};font-weight:800;">${v === 0 ? '·' : v}</td>`;
    }).join('')}
    <td class="cs" style="color:${lc};font-size:14px;">${teamSum}</td>
  </tr>`;

  const wt = twSum(Y, W);
  return `<div class="status-wrap">
    ${segHTML}
    <div class="tbl-wrap">
      <table class="stbl">${thead}<tbody>${tbody}${teamRow}</tbody></table>
    </div>
  </div>
  <div class="section" style="padding-bottom:16px;">
    <div class="sec-title">팀 전체 주간 합계</div>
    <div class="kpi-row">
      <div class="kpi nw"><div class="kpi-v">${wt.신규}</div><div class="kpi-l">신규</div></div>
      <div class="kpi gn"><div class="kpi-v">${wt.정수}</div><div class="kpi-l">정수</div></div>
      <div class="kpi am"><div class="kpi-v">${wt.전략}</div><div class="kpi-l">전략</div></div>
    </div>
  </div>`;
}

function renderMonthly(){
  const el = document.getElementById('pg-monthly');
  const mt = tmSum(Y, Mo);
  const rows = S.members.map(m => {
    const s = mSum(Y, Mo, m.id);
    return { ...m, ...s, total: s.신규 + s.정수 + s.전략 };
  });
  const sorted = [...rows].sort((a, b) => b.total - a.total);
  const mx = sorted[0]?.total || 1;

  el.innerHTML = `
  <div class="month-nav">
    <button class="mn-btn" onclick="chgMonth(-1)">‹</button>
    <div class="mn-title">${Y}년 ${Mo}월</div>
    <button class="mn-btn" onclick="chgMonth(1)">›</button>
  </div>

  <div class="mkpi">
    <div class="mkpi-c nw"><div class="mkpi-v">${mt.신규}</div><div class="mkpi-l">신규건수</div></div>
    <div class="mkpi-c gn"><div class="mkpi-v">${mt.정수}</div><div class="mkpi-l">정수건수</div></div>
    <div class="mkpi-c am"><div class="mkpi-v">${mt.전략}</div><div class="mkpi-l">전략건수</div></div>
  </div>

  <div class="section">
    <div class="sec-title">팀원별 월간 실적</div>
    <div class="card">
      <div class="mtbl-wrap">
        <table class="mtbl">
          <thead><tr>
            <th style="text-align:left;padding-left:12px;">이름</th>
            <th>신규</th><th>정수</th><th>전략</th><th>합계</th>
          </tr></thead>
          <tbody>
            ${rows.map(r => `<tr>
              <td class="ncl">${r.name}<span class="chip ${r.type}" style="margin-left:4px;">${r.type === 'kodak' ? '코닥' : '코디'}</span></td>
              <td style="color:var(--blue);font-weight:500;">${r.신규}</td>
              <td style="color:var(--green);font-weight:500;">${r.정수}</td>
              <td style="color:var(--amber);font-weight:500;">${r.전략}</td>
              <td style="font-weight:600;">${r.total}</td>
            </tr>`).join('')}
            <tr class="totrow">
              <td class="ncl">팀 합계</td>
              <td>${mt.신규}</td><td>${mt.정수}</td><td>${mt.전략}</td>
              <td>${mt.신규 + mt.정수 + mt.전략}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="section" style="padding-bottom:20px;">
    <div class="sec-title">팀원별 합계 비교</div>
    <div class="card">
      <div style="padding:14px;">
        ${sorted.map(r => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:9px;">
            <div style="width:50px;font-size:11px;font-weight:700;text-align:right;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.name}</div>
            <div style="flex:1;background:var(--bd);border-radius:6px;height:22px;overflow:hidden;">
              <div style="width:${Math.round(r.total / mx * 100)}%;height:100%;background:var(--blue);border-radius:6px;display:flex;align-items:center;padding-left:7px;min-width:2px;">
                ${r.total > 0 ? `<span style="font-size:11px;font-weight:800;color:#fff;">${r.total}</span>` : ''}
              </div>
            </div>
            ${r.total === 0 ? `<span style="font-size:11px;color:var(--text3);">0</span>` : ''}
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function chgMonth(d){
  Mo += d;
  if (Mo < 1){
    Y--;
    Mo = 12;
  }
  if (Mo > 12){
    Y++;
    Mo = 1;
  }
  renderMonthly();
}

function renderMembers(){
  const el = document.getElementById('pg-members');
  el.innerHTML = `
  <div class="section" style="padding-top:10px;">
    <div class="sec-title">팀원 목록 (${S.members.length}명)</div>
    <div>
      ${S.members.map((m, i) => {
        const hasPhone = !!(m.phone && m.phone.trim());
        const phoneText = hasPhone ? formatPhone(m.phone) : '전화번호 없음';
        const phoneRaw = hasPhone ? (m.phone.replace(/-/g, '')) : '';
        return `
        <div class="mem-item fi" style="animation-delay:${i * .04}s;">
          <div class="mem-top">
            <div class="mem-info">
              <div class="mem-name">
                ${m.name}
                <span class="mem-sub">${m.type === 'kodak' ? '코닥 (남)' : '코디 (여)'}</span>
              </div>
            </div>
            <button class="edit-btn" onclick="openEditMember('${m.id}')" title="팀원 정보 수정">✏️</button>
            <button class="del-btn" onclick="delMember('${m.id}')">🗑</button>
          </div>
          <div class="phone-row">
            <span class="phone-num${hasPhone ? '' : ' empty'}">${phoneText}</span>
            ${hasPhone
              ? `<a class="call-btn" href="tel:${phoneRaw}">📞 전화걸기</a>`
              : `<span class="call-btn disabled">📞 전화걸기</span>`}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <div class="section" style="padding-bottom:20px;">
    <div style="padding:12px;background:var(--sky);border-radius:12px;font-size:12px;color:var(--blue);font-weight:600;">
      💡 팀원은 최대 20명까지 등록 가능합니다. 현재 ${S.members.length}명 / 20명
    </div>
  </div>`;

  document.getElementById('fab').style.display = 'flex';
}

function addMember(){
  const name = document.getElementById('inp-name').value.trim();
  if (!name) return toast('이름을 입력해주세요');
  if (S.members.length >= 20) return toast('최대 20명까지 등록 가능합니다');

  const phone = document.getElementById('inp-phone').value.trim();
  S.members.push({ id: 'm' + Date.now(), name, type: addType, phone });
  save();
  closeSheet();
  renderMembers();
  toast(`${name} 팀원이 추가되었습니다`);
}

function delMember(id){
  const m = S.members.find(x => x.id === id);
  if (!m) return;

  if (!confirm(`"${m.name}" 팀원을 삭제하시겠습니까?\n실적 데이터도 함께 삭제됩니다.`)) return;

  S.members = S.members.filter(x => x.id !== id);

  Object.keys(S.records).forEach(k => {
    if (k.includes(id)) delete S.records[k];
  });

  save();

  if (selMem === id) selMem = S.members[0]?.id || null;

  if (curPage === 'members') renderMembers();
  if (curPage === 'weekly') renderWeekly();
  if (curPage === 'monthly') renderMonthly();
  if (curPage === 'dashboard') renderDash();

  toast(`${m.name} 팀원이 삭제되었습니다`);
}

function bindPhoneInputs(){
  const addInput = document.getElementById('inp-phone');
  const editInput = document.getElementById('inp-member-phone-edit');

  if (addInput){
    addInput.addEventListener('input', e => {
      e.target.value = normalizePhoneInput(e.target.value);
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });
  }

  if (editInput){
    editInput.addEventListener('input', e => {
      e.target.value = normalizePhoneInput(e.target.value);
      e.target.setSelectionRange(e.target.value.length, e.target.value.length);
    });
  }
}

function init(){
  load();
  S.members = S.members.map(m => ({ phone: '', ...m }));
  const d = today;
  document.getElementById('tb-date').textContent =
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]})`;

  bindPhoneInputs();
  renderDash();
  setupPwaInstallUi();
}

init();

let pwaDeferredPrompt = null;

function isPwaStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: window-controls-overlay)').matches
    || window.navigator.standalone === true;
}

function setupPwaInstallUi(){
  if (isPwaStandalone()) return;

  const strip = document.getElementById('pwa-install-strip');
  const btn = document.getElementById('pwa-install-btn');
  const msg = document.getElementById('pwa-install-msg');
  const dismiss = document.getElementById('pwa-install-dismiss');
  if (!strip || !msg || !dismiss) return;

  const ua = navigator.userAgent || '';
  const dismissed = sessionStorage.getItem('pwaInstallDismissed') === '1';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isHttpLan = location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';

  function showStrip(text, showBtn){
    if (dismissed) return;
    msg.textContent = text;
    btn.hidden = !showBtn;
    strip.classList.add('show');
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    pwaDeferredPrompt = e;
    showStrip('홈 화면에 추가하면 앱처럼 바로 실행할 수 있습니다.', true);
  });

  if (btn){
    btn.addEventListener('click', async function(){
      if (!pwaDeferredPrompt) return;
      pwaDeferredPrompt.prompt();
      await pwaDeferredPrompt.userChoice;
      pwaDeferredPrompt = null;
      strip.classList.remove('show');
    });
  }

  dismiss.addEventListener('click', function(){
    strip.classList.remove('show');
    sessionStorage.setItem('pwaInstallDismissed', '1');
  });

  if (dismissed) return;

  if (isIOS && !isPwaStandalone()){
    if (/CriOS|FxiOS|EdgiOS/.test(ua)){
      showStrip('브라우저 메뉴(⋮)에서 "홈 화면에 추가" 또는 "앱 설치"를 선택하세요.', false);
    } else {
      showStrip('하단 공유(□↑) → "홈 화면에 추가"를 누르면 홈 화면에 아이콘이 생깁니다.', false);
    }
    return;
  }

  if (isHttpLan && /Mobile|Android|iPhone/i.test(ua)){
    showStrip('이 주소(http)에서는 자동 설치가 제한될 수 있습니다. 배포(HTTPS) 주소로 열면 "앱 설치"가 표시되거나, 브라우저 메뉴에서 홈 화면에 추가하세요.', false);
  }
}

if ('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('service-worker.js').catch(function(){});
  });
}