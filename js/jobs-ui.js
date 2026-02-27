/**
 * Jobs UI: filter, sort, cards, modal, saved (localStorage). No backend.
 * Also implements preference-based match scoring.
 */
(function () {
  var STORAGE_KEY = "job-notification-tracker-saved";
  var PREFS_KEY = "jobTrackerPreferences";
  var STATUS_KEY = "jobTrackerStatus";
  var UPDATES_KEY = "jobTrackerStatusUpdates";
  var STATUS_OPTIONS = ["Not Applied", "Applied", "Rejected", "Selected"];
  var MAX_STATUS_UPDATES = 50;
  var lastFilterContext = { hasPreferences: false, showOnlyMatches: false };

  function getJobs() {
    return (window.JOBS_DATA || []).slice();
  }

  function getSavedIds() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setSavedIds(ids) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  function addSavedId(id) {
    var ids = getSavedIds();
    if (ids.indexOf(id) === -1) {
      ids.push(id);
      setSavedIds(ids);
    }
  }

  function removeSavedId(id) {
    var ids = getSavedIds().filter(function (x) { return x !== id; });
    setSavedIds(ids);
  }

  // ---------- Job status ----------

  function getStatusStore() {
    try {
      var raw = localStorage.getItem(STATUS_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      return typeof obj === "object" && obj !== null ? obj : {};
    } catch (e) {
      return {};
    }
  }

  function setStatusStore(obj) {
    try {
      localStorage.setItem(STATUS_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function getJobStatus(jobId) {
    var store = getStatusStore();
    var s = store[jobId];
    if (STATUS_OPTIONS.indexOf(s) !== -1) return s;
    return "Not Applied";
  }

  function setJobStatus(jobId, status, job) {
    if (STATUS_OPTIONS.indexOf(status) === -1) return;
    var store = getStatusStore();
    store[jobId] = status;
    setStatusStore(store);
    if (status !== "Not Applied" && job) {
      var updates = getStatusUpdatesRaw();
      updates.unshift({
        jobId: jobId,
        title: job.title || "",
        company: job.company || "",
        status: status,
        dateChanged: new Date().toISOString()
      });
      if (updates.length > MAX_STATUS_UPDATES) updates.length = MAX_STATUS_UPDATES;
      try {
        localStorage.setItem(UPDATES_KEY, JSON.stringify(updates));
      } catch (e) {}
    }
  }

  function getStatusUpdatesRaw() {
    try {
      var raw = localStorage.getItem(UPDATES_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function getStatusUpdates() {
    return getStatusUpdatesRaw().slice(0, 20);
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  // ---------- Preferences (settings) ----------

  function getPreferencesRaw() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function savePreferencesRaw(prefs) {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  function normalizeList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return String(value)
      .split(",")
      .map(function (p) { return p.trim(); })
      .filter(function (p) { return p.length > 0; });
  }

  function normalizePreferences(raw) {
    if (!raw) return null;
    var roleKeywords = normalizeList(raw.roleKeywords).map(function (s) { return s.toLowerCase(); });
    var preferredLocations = normalizeList(raw.preferredLocations);
    var preferredMode = normalizeList(raw.preferredMode);
    var experienceLevel = raw.experienceLevel || "";
    var skills = normalizeList(raw.skills).map(function (s) { return s.toLowerCase(); });
    var minMatchScore = typeof raw.minMatchScore === "number" ? raw.minMatchScore : 40;
    if (minMatchScore < 0) minMatchScore = 0;
    if (minMatchScore > 100) minMatchScore = 100;
    return {
      roleKeywords: roleKeywords,
      preferredLocations: preferredLocations,
      preferredMode: preferredMode,
      experienceLevel: experienceLevel,
      skills: skills,
      minMatchScore: minMatchScore
    };
  }

  function getPreferences() {
    return normalizePreferences(getPreferencesRaw());
  }

  // ---------- Match scoring ----------

  function computeMatchScore(job, prefs) {
    if (!prefs) return 0;
    var score = 0;
    var title = (job.title || "").toLowerCase();
    var description = (job.description || "").toLowerCase();

    if (prefs.roleKeywords.length) {
      var titleHit = prefs.roleKeywords.some(function (kw) { return kw && title.indexOf(kw) !== -1; });
      if (titleHit) score += 25;
      var descHit = prefs.roleKeywords.some(function (kw) { return kw && description.indexOf(kw) !== -1; });
      if (descHit) score += 15;
    }

    if (prefs.preferredLocations.length && job.location) {
      var locHit = prefs.preferredLocations.indexOf(job.location) !== -1;
      if (locHit) score += 15;
    }

    if (prefs.preferredMode.length && job.mode) {
      var modeHit = prefs.preferredMode.indexOf(job.mode) !== -1;
      if (modeHit) score += 10;
    }

    if (prefs.experienceLevel && job.experience === prefs.experienceLevel) {
      score += 10;
    }

    if (prefs.skills.length && Array.isArray(job.skills)) {
      var jobSkillsLower = job.skills.map(function (s) { return String(s).toLowerCase(); });
      var skillHit = prefs.skills.some(function (s) { return jobSkillsLower.indexOf(s) !== -1; });
      if (skillHit) score += 15;
    }

    if (typeof job.postedDaysAgo === "number" && job.postedDaysAgo <= 2) {
      score += 5;
    }

    if (job.source === "LinkedIn") {
      score += 5;
    }

    if (score > 100) score = 100;
    if (score < 0) score = 0;
    return score;
  }

  function parseSalaryNumber(salaryRange) {
    if (!salaryRange) return 0;
    var matches = String(salaryRange).match(/\\d+/g);
    if (!matches || !matches.length) return 0;
    var nums = matches.map(function (n) { return parseInt(n, 10) || 0; }).filter(function (n) { return n > 0; });
    if (!nums.length) return 0;
    if (nums.length === 1) return nums[0];
    return (nums[0] + nums[1]) / 2;
  }

  function getFilterStateFromDOM() {
    var kw = document.getElementById("filter-keyword");
    var loc = document.getElementById("filter-location");
    var mode = document.getElementById("filter-mode");
    var exp = document.getElementById("filter-experience");
    var src = document.getElementById("filter-source");
    var sort = document.getElementById("filter-sort");
    var onlyMatches = document.getElementById("filter-only-matches");
    var statusFilter = document.getElementById("filter-status");
    return {
      keyword: (kw && kw.value) ? kw.value.trim().toLowerCase() : "",
      location: (loc && loc.value) ? loc.value : "",
      mode: (mode && mode.value) ? mode.value : "",
      experience: (exp && exp.value) ? exp.value : "",
      source: (src && src.value) ? src.value : "",
      sort: (sort && sort.value) ? sort.value : "latest",
      showOnlyMatches: !!(onlyMatches && onlyMatches.checked),
      status: (statusFilter && statusFilter.value) ? statusFilter.value : ""
    };
  }

  function filterAndSortJobs(jobs, state) {
    var prefs = getPreferences();
    var hasPrefs = !!prefs;
    lastFilterContext = { hasPreferences: hasPrefs, showOnlyMatches: !!(state && state.showOnlyMatches) };

    var list = jobs.filter(function (j) {
      if (state.keyword) {
        var t = (j.title + " " + j.company).toLowerCase();
        if (t.indexOf(state.keyword) === -1) return false;
      }
      if (state.location && j.location !== state.location) return false;
      if (state.mode && j.mode !== state.mode) return false;
      if (state.experience && j.experience !== state.experience) return false;
      if (state.source && j.source !== state.source) return false;
      if (state.status && getJobStatus(j.id) !== state.status) return false;
      return true;
    });

    list.forEach(function (j) {
      j.matchScore = hasPrefs ? computeMatchScore(j, prefs) : null;
    });

    if (state.showOnlyMatches && hasPrefs) {
      list = list.filter(function (j) {
        return typeof j.matchScore === "number" && j.matchScore >= prefs.minMatchScore;
      });
    }

    if (state.sort === "match" && hasPrefs) {
      list.sort(function (a, b) {
        var am = typeof a.matchScore === "number" ? a.matchScore : -1;
        var bm = typeof b.matchScore === "number" ? b.matchScore : -1;
        return bm - am;
      });
    } else if (state.sort === "salary") {
      list.sort(function (a, b) {
        return parseSalaryNumber(b.salaryRange) - parseSalaryNumber(a.salaryRange);
      });
    } else {
      list.sort(function (a, b) { return a.postedDaysAgo - b.postedDaysAgo; });
    }

    return list;
  }

  function postedLabel(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return days + " days ago";
  }

  function matchBadgeClass(score) {
    if (typeof score !== "number") return "";
    if (score >= 80) return "ds-job-card__match--high";
    if (score >= 60) return "ds-job-card__match--medium";
    if (score >= 40) return "ds-job-card__match--low";
    return "ds-job-card__match--below";
  }

  function statusBadgeClass(status) {
    if (status === "Applied") return "ds-job-card__status-badge--applied";
    if (status === "Rejected") return "ds-job-card__status-badge--rejected";
    if (status === "Selected") return "ds-job-card__status-badge--selected";
    return "ds-job-card__status-badge--neutral";
  }

  function renderJobCard(job, opts) {
    opts = opts || {};
    var savedIds = getSavedIds();
    var isSaved = savedIds.indexOf(job.id) !== -1;
    var saveLabel = isSaved ? "Saved" : "Save";
    var saveDisabled = opts.showRemove ? "" : (isSaved ? " disabled" : "");
    var currentStatus = getJobStatus(job.id);
    var statusOpts = STATUS_OPTIONS.map(function (s) {
      return '<option value="' + escapeHtml(s) + '"' + (s === currentStatus ? ' selected' : '') + '>' + escapeHtml(s) + "</option>";
    }).join("");
    var statusRow =
      '<div class="ds-job-card__status">' +
      '<label class="ds-job-card__status-label">Status</label>' +
      '<select class="ds-input ds-job-status-select" data-job-id="' + escapeHtml(job.id) + '" aria-label="Job status">' +
      statusOpts +
      "</select>" +
      '<span class="ds-job-card__status-badge ' + statusBadgeClass(currentStatus) + '">' + escapeHtml(currentStatus) + "</span>" +
      "</div>";

    var badgeHtml = "";
    if (typeof job.matchScore === "number") {
      var cls = matchBadgeClass(job.matchScore);
      badgeHtml =
        '<span class="ds-job-card__match ' + cls + '">' +
        escapeHtml(String(job.matchScore)) + "% match</span>";
    }

    var actions =
      '<div class="ds-job-card__actions">' +
      '<button type="button" class="ds-btn ds-btn--secondary ds-job-view" data-job-id="' + escapeHtml(job.id) + '">View</button>' +
      (opts.showRemove
        ? '<button type="button" class="ds-btn ds-btn--secondary ds-job-remove" data-job-id="' + escapeHtml(job.id) + '">Remove</button>'
        : '<button type="button" class="ds-btn ds-btn--secondary ds-job-save" data-job-id="' + escapeHtml(job.id) + '"' + saveDisabled + '>' + escapeHtml(saveLabel) + '</button>') +
      '<button type="button" class="ds-btn ds-btn--primary ds-job-apply" data-job-id="' + escapeHtml(job.id) + '">Apply</button>' +
      "</div>";

    return (
      '<div class="ds-job-card" data-job-id="' + escapeHtml(job.id) + '">' +
      '<h3 class="ds-job-card__title">' + escapeHtml(job.title) + "</h3>" +
      '<p class="ds-job-card__company">' + escapeHtml(job.company) + "</p>" +
      '<p class="ds-job-card__meta">' + escapeHtml(job.location) + " · " + escapeHtml(job.mode) + " · " + escapeHtml(job.experience) + "</p>" +
      '<p class="ds-job-card__meta">' + escapeHtml(job.salaryRange) + "</p>" +
      statusRow +
      '<div class="ds-job-card__footer">' +
      '<span class="ds-job-card__source">' + escapeHtml(job.source) + "</span>" +
      (badgeHtml ? badgeHtml : "") +
      '<span class="ds-job-card__posted">' + escapeHtml(postedLabel(job.postedDaysAgo)) + "</span>" +
      actions +
      "</div>" +
      "</div>"
    );
  }

  function renderFilterBar() {
    var jobs = getJobs();
    var locations = [];
    var seenLoc = {};
    jobs.forEach(function (j) {
      if (j.location && !seenLoc[j.location]) {
        seenLoc[j.location] = true;
        locations.push(j.location);
      }
    });
    locations.sort();
    var locOpts = '<option value="">All locations</option>' + locations.map(function (l) { return '<option value="' + escapeHtml(l) + '">' + escapeHtml(l) + "</option>"; }).join("");
    return (
      '<div class="ds-filter-bar">' +
      '<div class="ds-filter-bar__group">' +
      '<label class="ds-filter-bar__label" for="filter-keyword">Keyword</label>' +
      '<input type="text" id="filter-keyword" class="ds-input" placeholder="Title or company" />' +
      "</div>" +
      '<div class="ds-filter-bar__group">' +
      '<label class="ds-filter-bar__label" for="filter-location">Location</label>' +
      '<select id="filter-location" class="ds-input">' + locOpts + "</select>" +
      "</div>" +
      '<div class="ds-filter-bar__group">' +
      '<label class="ds-filter-bar__label" for="filter-mode">Mode</label>' +
      '<select id="filter-mode" class="ds-input">' +
      '<option value="">All</option><option value="Remote">Remote</option><option value="Hybrid">Hybrid</option><option value="Onsite">Onsite</option>' +
      "</select>" +
      "</div>" +
      '<div class="ds-filter-bar__group">' +
      '<label class="ds-filter-bar__label" for="filter-experience">Experience</label>' +
      '<select id="filter-experience" class="ds-input">' +
      '<option value="">All</option><option value="Fresher">Fresher</option><option value="0-1">0-1</option><option value="1-3">1-3</option><option value="3-5">3-5</option>' +
      "</select>" +
      "</div>" +
      '<div class="ds-filter-bar__group">' +
      '<label class="ds-filter-bar__label" for="filter-source">Source</label>' +
      '<select id="filter-source" class="ds-input">' +
      '<option value="">All</option><option value="LinkedIn">LinkedIn</option><option value="Naukri">Naukri</option><option value="Indeed">Indeed</option>' +
      "</select>" +
      "</div>" +
      '<div class="ds-filter-bar__group">' +
      '<label class="ds-filter-bar__label" for="filter-sort">Sort</label>' +
      '<select id="filter-sort" class="ds-input">' +
      '<option value="latest">Latest</option>' +
      '<option value="match">Match score</option>' +
      '<option value="salary">Salary</option>' +
      "</select>" +
      "</div>" +
      '<div class="ds-filter-bar__group">' +
      '<label class="ds-filter-bar__label" for="filter-status">Status</label>' +
      '<select id="filter-status" class="ds-input">' +
      '<option value="">All</option>' +
      '<option value="Not Applied">Not Applied</option>' +
      '<option value="Applied">Applied</option>' +
      '<option value="Rejected">Rejected</option>' +
      '<option value="Selected">Selected</option>' +
      "</select>" +
      "</div>" +
      '<div class="ds-filter-bar__group ds-filter-bar__group--toggle">' +
      '<label class="ds-filter-bar__label" for="filter-only-matches">Matches</label>' +
      '<label class="ds-filter-toggle">' +
      '<input type="checkbox" id="filter-only-matches" />' +
      '<span class="ds-filter-toggle__label">Show only jobs above my threshold</span>' +
      "</label>" +
      "</div>" +
      "</div>"
    );
  }

  function renderJobsGrid(jobs, opts) {
    if (jobs.length === 0) {
      if (lastFilterContext.hasPreferences && lastFilterContext.showOnlyMatches) {
        return (
          '<div class="ds-jobs-empty">' +
          '<h2 class="ds-jobs-empty__title">No roles match your criteria.</h2>' +
          '<p class="ds-jobs-empty__message">Adjust filters or lower your match threshold in settings.</p>' +
          "</div>"
        );
      }
      return (
        '<div class="ds-jobs-empty">' +
        '<h2 class="ds-jobs-empty__title">No jobs match your search.</h2>' +
        '<p class="ds-jobs-empty__message">Try changing filters or keyword.</p>' +
        "</div>"
      );
    }
    var html = "";
    for (var i = 0; i < jobs.length; i++) {
      html += renderJobCard(jobs[i], opts);
    }
    return '<div class="ds-jobs-grid">' + html + "</div>";
  }

  function openModal(job) {
    closeModal();
    var skillsHtml = job.skills && job.skills.length
      ? '<div class="ds-modal__skills">' +
        '<p class="ds-modal__skills-title">Skills</p>' +
        '<ul class="ds-modal__skills-list">' +
        job.skills.map(function (s) { return "<li>" + escapeHtml(s) + "</li>"; }).join("") +
        "</ul></div>"
      : "";
    var overlay = document.createElement("div");
    overlay.className = "ds-modal-overlay";
    overlay.setAttribute("aria-hidden", "false");
    overlay.innerHTML =
      '<div class="ds-modal">' +
      '<div class="ds-modal__header">' +
      '<h2 class="ds-modal__title">' + escapeHtml(job.title) + " · " + escapeHtml(job.company) + "</h2>" +
      '<button type="button" class="ds-modal__close" aria-label="Close">×</button>' +
      "</div>" +
      '<div class="ds-modal__body">' + escapeHtml(job.description || "") + "</div>" +
      skillsHtml +
      '<div class="ds-modal__actions">' +
      '<button type="button" class="ds-btn ds-btn--primary ds-modal-apply" data-url="' + escapeHtml(job.applyUrl || "") + '">Apply</button>' +
      '<button type="button" class="ds-btn ds-btn--secondary ds-modal-close-btn">Close</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.classList.contains("ds-modal__close") || e.target.classList.contains("ds-modal-close-btn")) {
        closeModal();
      }
      if (e.target.classList.contains("ds-modal-apply")) {
        var url = e.target.getAttribute("data-url");
        if (url) window.open(url, "_blank");
      }
    });
  }

  function closeModal() {
    var el = document.querySelector(".ds-modal-overlay");
    if (el) el.remove();
  }

  // ---------- Daily digest ----------

  var DIGEST_KEY_PREFIX = "jobTrackerDigest_";

  function getTodayDateString() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function getDigestKey(dateStr) {
    return DIGEST_KEY_PREFIX + dateStr;
  }

  function getDigestForDate(dateStr) {
    try {
      var raw = localStorage.getItem(getDigestKey(dateStr));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveDigestForDate(dateStr, payload) {
    try {
      localStorage.setItem(getDigestKey(dateStr), JSON.stringify(payload));
    } catch (e) {}
  }

  function generateDigestForDate(dateStr) {
    var existing = getDigestForDate(dateStr);
    if (existing && existing.jobs && existing.date === dateStr) {
      return existing;
    }
    var prefs = getPreferences();
    if (!prefs) return null;
    var jobs = getJobs();
    jobs.forEach(function (j) {
      j.matchScore = computeMatchScore(j, prefs);
    });
    jobs.sort(function (a, b) {
      var am = typeof a.matchScore === "number" ? a.matchScore : -1;
      var bm = typeof b.matchScore === "number" ? b.matchScore : -1;
      if (bm !== am) return bm - am;
      return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
    });
    var top10 = jobs.slice(0, 10).map(function (j) {
      return {
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        experience: j.experience,
        matchScore: j.matchScore,
        applyUrl: j.applyUrl
      };
    });
    var payload = { date: dateStr, jobs: top10 };
    saveDigestForDate(dateStr, payload);
    return payload;
  }

  function formatDigestPlainText(digest) {
    if (!digest || !digest.jobs || !digest.jobs.length) return "";
    var lines = [
      "Top 10 Jobs For You — 9AM Digest",
      digest.date,
      ""
    ];
    digest.jobs.forEach(function (j, i) {
      lines.push((i + 1) + ". " + (j.title || "") + " · " + (j.company || ""));
      lines.push("   Location: " + (j.location || "") + " | Experience: " + (j.experience || ""));
      lines.push("   Match: " + (typeof j.matchScore === "number" ? j.matchScore + "%" : "—"));
      if (j.applyUrl) lines.push("   Apply: " + j.applyUrl);
      lines.push("");
    });
    lines.push("This digest was generated based on your preferences.");
    return lines.join("\n");
  }

  function getDigestMailtoBody(digest) {
    return formatDigestPlainText(digest);
  }

  function renderDigestCard(digest, dateStr) {
    if (!digest || !digest.jobs || !digest.jobs.length) {
      return (
        '<div class="ds-digest-card">' +
        '<h2 class="ds-digest-card__title">No matching roles today.</h2>' +
        '<p class="ds-digest-card__subtext">Check again tomorrow.</p>' +
        "</div>"
      );
    }
    var items = digest.jobs.map(function (j, i) {
      var scoreStr = typeof j.matchScore === "number" ? j.matchScore + "% match" : "—";
      return (
        '<div class="ds-digest-item">' +
        '<div class="ds-digest-item__main">' +
        '<span class="ds-digest-item__num">' + (i + 1) + ".</span>" +
        '<strong class="ds-digest-item__title">' + escapeHtml(j.title || "") + "</strong>" +
        '<span class="ds-digest-item__company">' + escapeHtml(j.company || "") + "</span>" +
        "</div>" +
        '<p class="ds-digest-item__meta">' +
        escapeHtml(j.location || "") + " · " + escapeHtml(j.experience || "") +
        " · " + scoreStr +
        "</p>" +
        (j.applyUrl
          ? '<a href="' + escapeHtml(j.applyUrl) + '" target="_blank" rel="noopener" class="ds-btn ds-btn--primary ds-digest-item__apply">Apply</a>'
          : "") +
        "</div>"
      );
    }).join("");
    return (
      '<div class="ds-digest-card">' +
      '<header class="ds-digest-card__header">' +
      '<h2 class="ds-digest-card__title">Top 10 Jobs For You — 9AM Digest</h2>' +
      '<p class="ds-digest-card__subtext">' + escapeHtml(dateStr) + "</p>" +
      "</header>" +
      '<div class="ds-digest-card__list">' + items + "</div>" +
      '<footer class="ds-digest-card__footer">' +
      '<p class="ds-digest-card__footer-text">This digest was generated based on your preferences.</p>' +
      "</footer>" +
      "</div>"
    );
  }

  window.JobsUI = {
    getJobs: getJobs,
    getSavedIds: getSavedIds,
    addSavedId: addSavedId,
    removeSavedId: removeSavedId,
    getFilterStateFromDOM: getFilterStateFromDOM,
    filterAndSortJobs: filterAndSortJobs,
    renderFilterBar: renderFilterBar,
    renderJobCard: renderJobCard,
    renderJobsGrid: renderJobsGrid,
    openModal: openModal,
    closeModal: closeModal,
    postedLabel: postedLabel,
    getPreferencesRaw: getPreferencesRaw,
    savePreferencesRaw: savePreferencesRaw,
    getPreferences: getPreferences,
    computeMatchScore: computeMatchScore,
    getTodayDateString: getTodayDateString,
    getDigestForDate: getDigestForDate,
    generateDigestForDate: generateDigestForDate,
    formatDigestPlainText: formatDigestPlainText,
    getDigestMailtoBody: getDigestMailtoBody,
    renderDigestCard: renderDigestCard,
    getJobStatus: getJobStatus,
    setJobStatus: setJobStatus,
    getStatusUpdates: getStatusUpdates
  };
})();
