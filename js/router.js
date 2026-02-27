/**
 * Client-side router — Job Notification Tracker. No state, no backend.
 */

(function () {
  var SUBTEXT_404 = "The page you are looking for does not exist.";
  var TEST_STORAGE_KEY = "jobTrackerTestStatus";
  var TEST_ITEMS = [
    { label: "Preferences persist after refresh", tooltip: "Save preferences, refresh page, confirm form is prefilled." },
    { label: "Match score calculates correctly", tooltip: "Set preferences, open Dashboard, confirm job cards show match %." },
    { label: "\"Show only matches\" toggle works", tooltip: "Enable toggle on Dashboard, confirm only jobs above threshold show." },
    { label: "Save job persists after refresh", tooltip: "Save a job, refresh, open Saved; job still listed." },
    { label: "Apply opens in new tab", tooltip: "Click Apply on a card; link opens in new tab." },
    { label: "Status update persists after refresh", tooltip: "Change status to Applied, refresh; status still Applied." },
    { label: "Status filter works correctly", tooltip: "Set Status filter to Applied; only Applied jobs show." },
    { label: "Digest generates top 10 by score", tooltip: "Generate digest; confirm 10 jobs, ordered by match." },
    { label: "Digest persists for the day", tooltip: "Generate digest, refresh page; digest still visible." },
    { label: "No console errors on main pages", tooltip: "Open /, /dashboard, /saved, /digest, /settings; check console." }
  ];

  var app = document.getElementById("app");
  var navLinks = document.querySelectorAll(".ds-nav-link[data-route]");
  var dropdownLinks = document.querySelectorAll(".ds-nav-dropdown .ds-nav-link[data-route]");
  var toggleBtn = document.getElementById("nav-toggle");
  var dropdown = document.getElementById("nav-dropdown");
  var brandLink = document.querySelector(".ds-nav-bar__brand");

  function getPath() {
    var path = window.location.pathname.replace(/\/$/, "") || "/";
    return path;
  }

  function setActiveLink(path) {
    var all = document.querySelectorAll(".ds-nav-link[data-route]");
    all.forEach(function (a) {
      var route = a.getAttribute("data-route");
      if (route === path) {
        a.classList.add("ds-nav-link--active");
      } else {
        a.classList.remove("ds-nav-link--active");
      }
    });
  }

  function closeDropdown() {
    if (dropdown) dropdown.classList.remove("ds-nav-dropdown--open");
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function getTestStatus() {
    try {
      var raw = localStorage.getItem(TEST_STORAGE_KEY);
      var obj = raw ? JSON.parse(raw) : {};
      if (typeof obj !== "object" || obj === null) return [];
      var out = [];
      for (var i = 0; i < 10; i++) out.push(!!obj[String(i)]);
      return out;
    } catch (e) {
      return [false, false, false, false, false, false, false, false, false, false];
    }
  }

  function setTestStatus(index, checked) {
    var status = getTestStatus();
    if (index >= 0 && index < 10) status[index] = !!checked;
    var obj = {};
    for (var i = 0; i < 10; i++) obj[String(i)] = status[i];
    try {
      localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  function clearTestStatus() {
    try {
      localStorage.removeItem(TEST_STORAGE_KEY);
    } catch (e) {}
  }

  function getTestPassedCount() {
    return getTestStatus().filter(Boolean).length;
  }

  function navigate(path) {
    window.history.pushState({}, "", path === "/" ? "/" : path);
    render(path);
  }

  function render(path) {
    var is404 = !ROUTE_CONFIG[path];
    if (is404) {
      document.title = "Page Not Found — Job Notification Tracker";
      app.innerHTML = render404();
    } else {
      document.title = ROUTE_CONFIG[path].title + " — Job Notification Tracker";
      app.innerHTML = ROUTE_CONFIG[path].render();
    }
    setActiveLink(path);
    closeDropdown();
    attachRouteListeners(path);
  }

  function attachRouteListeners(path) {
    var cta = document.getElementById("landing-cta");
    if (cta && path === "/") {
      cta.addEventListener("click", function () {
        navigate("/settings");
      });
    }
    if (path === "/settings") initSettings();
    if (path === "/dashboard") initDashboard();
    if (path === "/saved") initSaved();
    if (path === "/digest") initDigest();
    if (path === "/jt/07-test") initTestChecklist();
  }

  function initTestChecklist() {
    function refreshSummary() {
      var count = 0;
      for (var i = 0; i < 10; i++) {
        var cb = document.getElementById("test-check-" + i);
        if (cb && cb.checked) count++;
      }
      var summaryEl = document.getElementById("test-summary");
      if (summaryEl) summaryEl.textContent = "Tests Passed: " + count + " / 10";
      var warningEl = document.getElementById("test-warning");
      if (warningEl) warningEl.style.display = count >= 10 ? "none" : "block";
    }
    for (var i = 0; i < 10; i++) {
      (function (idx) {
        var cb = document.getElementById("test-check-" + idx);
        if (cb) {
          cb.checked = getTestStatus()[idx];
          cb.addEventListener("change", function () {
            setTestStatus(idx, cb.checked);
            refreshSummary();
          });
        }
      })(i);
    }
    refreshSummary();
    var resetBtn = document.getElementById("test-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        clearTestStatus();
        for (var j = 0; j < 10; j++) {
          var c = document.getElementById("test-check-" + j);
          if (c) c.checked = false;
        }
        refreshSummary();
      });
    }
  }

  function initDigest() {
    var JobsUI = window.JobsUI;
    if (!JobsUI) return;
    var genBtn = document.getElementById("digest-generate");
    var copyBtn = document.getElementById("digest-copy");
    var emailBtn = document.getElementById("digest-email");
    if (genBtn) {
      genBtn.addEventListener("click", function () {
        var today = JobsUI.getTodayDateString();
        var digest = JobsUI.generateDigestForDate(today);
        if (digest !== null) navigate("/digest");
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var today = JobsUI.getTodayDateString();
        var digest = JobsUI.getDigestForDate(today);
        if (!digest) return;
        var text = JobsUI.formatDigestPlainText(digest);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(function () {});
        }
      });
    }
    if (emailBtn) {
      emailBtn.addEventListener("click", function () {
        var today = JobsUI.getTodayDateString();
        var digest = JobsUI.getDigestForDate(today);
        if (!digest) return;
        var body = JobsUI.getDigestMailtoBody(digest);
        var subject = "My 9AM Job Digest";
        var mailto = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        window.location.href = mailto;
      });
    }
  }

  function initSettings() {
    var JobsUI = window.JobsUI;
    if (!JobsUI) return;
    var raw = JobsUI.getPreferencesRaw && JobsUI.getPreferencesRaw();
    var roleInput = document.getElementById("prefs-role");
    var locSelect = document.getElementById("prefs-locations");
    var modeRemote = document.getElementById("prefs-mode-remote");
    var modeHybrid = document.getElementById("prefs-mode-hybrid");
    var modeOnsite = document.getElementById("prefs-mode-onsite");
    var expSelect = document.getElementById("prefs-experience");
    var skillsInput = document.getElementById("prefs-skills");
    var minRange = document.getElementById("prefs-min-score");
    var minValue = document.getElementById("prefs-min-score-value");
    var saveBtn = document.getElementById("prefs-save");

    if (raw) {
      if (roleInput && raw.roleKeywords) roleInput.value = raw.roleKeywords;
      if (skillsInput && raw.skills) skillsInput.value = raw.skills;
      if (Array.isArray(raw.preferredLocations) && locSelect) {
        Array.prototype.forEach.call(locSelect.options, function (opt) {
          opt.selected = raw.preferredLocations.indexOf(opt.value) !== -1;
        });
      }
      if (Array.isArray(raw.preferredMode)) {
        if (modeRemote) modeRemote.checked = raw.preferredMode.indexOf("Remote") !== -1;
        if (modeHybrid) modeHybrid.checked = raw.preferredMode.indexOf("Hybrid") !== -1;
        if (modeOnsite) modeOnsite.checked = raw.preferredMode.indexOf("Onsite") !== -1;
      }
      if (expSelect && raw.experienceLevel) {
        expSelect.value = raw.experienceLevel;
      }
      if (typeof raw.minMatchScore === "number" && minRange && minValue) {
        var v = Math.min(100, Math.max(0, raw.minMatchScore));
        minRange.value = String(v);
        minValue.textContent = String(v);
      }
    } else {
      if (minRange && minValue) {
        minRange.value = "40";
        minValue.textContent = "40";
      }
    }

    if (minRange && minValue) {
      minRange.addEventListener("input", function () {
        minValue.textContent = String(minRange.value);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var prefs = {
          roleKeywords: roleInput ? roleInput.value : "",
          preferredLocations: [],
          preferredMode: [],
          experienceLevel: expSelect ? expSelect.value : "",
          skills: skillsInput ? skillsInput.value : "",
          minMatchScore: minRange ? parseInt(minRange.value, 10) || 40 : 40
        };
        if (locSelect) {
          Array.prototype.forEach.call(locSelect.options, function (opt) {
            if (opt.selected && opt.value) prefs.preferredLocations.push(opt.value);
          });
        }
        if (modeRemote && modeRemote.checked) prefs.preferredMode.push("Remote");
        if (modeHybrid && modeHybrid.checked) prefs.preferredMode.push("Hybrid");
        if (modeOnsite && modeOnsite.checked) prefs.preferredMode.push("Onsite");
        if (JobsUI.savePreferencesRaw) {
          JobsUI.savePreferencesRaw(prefs);
        }
      });
    }
  }

  function showToast(message) {
    var existing = document.querySelector(".ds-toast");
    if (existing) existing.remove();
    var el = document.createElement("div");
    el.className = "ds-toast";
    el.setAttribute("role", "status");
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.remove();
    }, 2500);
  }

  function initDashboard() {
    var JobsUI = window.JobsUI;
    if (!JobsUI || !JobsUI.getJobs().length) return;
    var container = document.getElementById("jobs-grid-container");
    if (!container) return;
    function refreshGrid() {
      var s = JobsUI.getFilterStateFromDOM();
      var list = JobsUI.filterAndSortJobs(JobsUI.getJobs(), s);
      container.innerHTML = JobsUI.renderJobsGrid(list, {});
    }
    window.__refreshDashboardGrid = refreshGrid;
    var kw = document.getElementById("filter-keyword");
    var loc = document.getElementById("filter-location");
    var mode = document.getElementById("filter-mode");
    var exp = document.getElementById("filter-experience");
    var src = document.getElementById("filter-source");
    var sort = document.getElementById("filter-sort");
    var statusFilter = document.getElementById("filter-status");
    [kw, loc, mode, exp, src, sort, statusFilter].forEach(function (el) {
      if (el) el.addEventListener("input", refreshGrid);
      if (el) el.addEventListener("change", refreshGrid);
    });
  }

  function initSaved() {
    /* Saved page uses same card click delegation as dashboard */
  }

  app.addEventListener("change", function jobStatusChange(e) {
    var sel = e.target.closest(".ds-job-status-select");
    if (!sel) return;
    var JobsUI = window.JobsUI;
    if (!JobsUI) return;
    var jobId = sel.getAttribute("data-job-id");
    var status = sel.value;
    if (!jobId || !status) return;
    var job = JobsUI.getJobs().find(function (j) { return j.id === jobId; });
    JobsUI.setJobStatus(jobId, status, job || { id: jobId, title: "", company: "" });
    if (status !== "Not Applied") showToast("Status updated: " + status);
    if (window.__refreshDashboardGrid) window.__refreshDashboardGrid();
    if (getPath() === "/saved") navigate("/saved");
  });

  app.addEventListener("click", function jobCardClick(e) {
    var JobsUI = window.JobsUI;
    if (!JobsUI) return;
    var path = getPath();
    var view = e.target.closest(".ds-job-view");
    var save = e.target.closest(".ds-job-save");
    var apply = e.target.closest(".ds-job-apply");
    var remove = e.target.closest(".ds-job-remove");
    if (view) {
      var id = view.getAttribute("data-job-id");
      var job = JobsUI.getJobs().find(function (j) { return j.id === id; });
      if (job) JobsUI.openModal(job);
    }
    if (save && !save.disabled) {
      var id = save.getAttribute("data-job-id");
      JobsUI.addSavedId(id);
      save.textContent = "Saved";
      save.disabled = true;
    }
    if (apply) {
      var id = apply.getAttribute("data-job-id");
      var job = JobsUI.getJobs().find(function (j) { return j.id === id; });
      if (job && job.applyUrl) window.open(job.applyUrl, "_blank");
    }
    if (remove) {
      var id = remove.getAttribute("data-job-id");
      JobsUI.removeSavedId(id);
      navigate("/saved");
    }
  });

  var ROUTE_CONFIG = {
    "/": {
      title: "Home",
      render: function () {
        return (
          '<div class="ds-landing">' +
          '<h1 class="ds-landing__headline">Stop Missing The Right Jobs.</h1>' +
          '<p class="ds-landing__subtext">Precision-matched job discovery delivered daily at 9AM.</p>' +
          '<div class="ds-landing__cta">' +
          '<button type="button" class="ds-btn ds-btn--primary" id="landing-cta">Start Tracking</button>' +
          "</div>" +
          "</div>"
        );
      }
    },
    "/dashboard": {
      title: "Dashboard",
      render: function () {
        var JobsUI = window.JobsUI;
        var jobs = (JobsUI && JobsUI.getJobs()) || [];
        var state = { keyword: "", location: "", mode: "", experience: "", source: "", sort: "latest" };
        var prefsRaw = JobsUI && JobsUI.getPreferencesRaw ? JobsUI.getPreferencesRaw() : null;
        var banner = "";
        if (!prefsRaw) {
          banner =
            '<div class="ds-jobs-banner">Set your preferences to activate intelligent matching.</div>';
        }
        if (jobs.length === 0) {
          return (
            banner +
            '<div class="ds-route-empty">' +
            '<div class="ds-empty-state">' +
            '<h2 class="ds-empty-state__title">No jobs yet</h2>' +
            '<p class="ds-empty-state__message">In the next step, you will load a realistic dataset.</p>' +
            "</div></div>"
          );
        }
        return banner + JobsUI.renderFilterBar() + '<div id="jobs-grid-container" class="ds-jobs-wrap">' + JobsUI.renderJobsGrid(JobsUI.filterAndSortJobs(jobs, state), {}) + "</div>";
      }
    },
    "/saved": {
      title: "Saved",
      render: function () {
        var JobsUI = window.JobsUI;
        var savedIds = (JobsUI && JobsUI.getSavedIds()) || [];
        var jobs = (JobsUI && JobsUI.getJobs()) || [];
        var savedJobs = jobs.filter(function (j) { return savedIds.indexOf(j.id) !== -1; });
        if (savedJobs.length === 0) {
          return (
            '<div class="ds-route-empty">' +
            '<div class="ds-empty-state">' +
            '<h2 class="ds-empty-state__title">No saved jobs</h2>' +
            '<p class="ds-empty-state__message">Jobs you save from the dashboard will appear here. Save ones you want to revisit.</p>' +
            "</div></div>"
          );
        }
        return '<div class="ds-jobs-wrap"><div class="ds-jobs-grid">' + savedJobs.map(function (j) { return JobsUI.renderJobCard(j, { showRemove: true }); }).join("") + "</div></div>";
      }
    },
    "/digest": {
      title: "Digest",
      render: function () {
        var JobsUI = window.JobsUI;
        var note = '<p class="ds-digest-note">Demo Mode: Daily 9AM trigger simulated manually.</p>';
        if (!JobsUI) {
          return '<div class="ds-digest-wrap">' + note + '</div>';
        }
        var prefs = JobsUI.getPreferencesRaw ? JobsUI.getPreferencesRaw() : null;
        if (!prefs) {
          return (
            '<div class="ds-digest-block">' +
            '<h2 class="ds-digest-block__title">Set preferences to generate a personalized digest.</h2>' +
            '<p class="ds-digest-block__message">Go to Settings to set your role, location, and match criteria.</p>' +
            note +
            "</div>"
          );
        }
        var today = JobsUI.getTodayDateString();
        var digest = JobsUI.getDigestForDate(today);
        var hasDigest = !!digest;
        var cardHtml = hasDigest ? JobsUI.renderDigestCard(digest, today) : "";
        var actionsHtml = hasDigest
          ? '<div class="ds-digest-actions">' +
            '<button type="button" class="ds-btn ds-btn--secondary" id="digest-copy">Copy Digest to Clipboard</button>' +
            '<button type="button" class="ds-btn ds-btn--secondary" id="digest-email">Create Email Draft</button>' +
            "</div>"
          : "";
        var genHtml = hasDigest
          ? ""
          : '<div class="ds-digest-actions"><button type="button" class="ds-btn ds-btn--primary" id="digest-generate">Generate Today\'s 9AM Digest (Simulated)</button></div>';
        var updates = JobsUI.getStatusUpdates ? JobsUI.getStatusUpdates() : [];
        var updatesHtml = "";
        if (updates.length > 0) {
          var listItems = updates.map(function (u) {
            var d = "";
            try {
              var dt = new Date(u.dateChanged);
              d = isNaN(dt.getTime()) ? u.dateChanged : dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
            } catch (e) {
              d = u.dateChanged || "";
            }
            return (
              '<li class="ds-digest-update">' +
              '<span class="ds-digest-update__title">' + escapeHtml(u.title || "Job") + "</span>" +
              '<span class="ds-digest-update__company">' + escapeHtml(u.company || "") + "</span>" +
              '<span class="ds-digest-update__status">' + escapeHtml(u.status || "") + "</span>" +
              '<span class="ds-digest-update__date">' + escapeHtml(d) + "</span>" +
              "</li>"
            );
          }).join("");
          updatesHtml =
            '<div class="ds-digest-card ds-digest-card--updates">' +
            '<h2 class="ds-digest-card__title">Recent Status Updates</h2>' +
            '<ul class="ds-digest-updates-list">' + listItems + "</ul>" +
            "</div>";
        } else {
          updatesHtml =
            '<div class="ds-digest-card ds-digest-card--updates">' +
            '<h2 class="ds-digest-card__title">Recent Status Updates</h2>' +
            '<p class="ds-digest-card__subtext">No status updates yet.</p>' +
            "</div>";
        }
        return (
          '<div class="ds-digest-wrap">' +
          genHtml +
          actionsHtml +
          (cardHtml ? '<div class="ds-digest-card-wrap">' + cardHtml + "</div>" : "") +
          (updatesHtml ? '<div class="ds-digest-updates-wrap">' + updatesHtml + "</div>" : "") +
          note +
          "</div>"
        );
      }
    },
    "/settings": {
      title: "Settings",
      render: function () {
        return (
          '<div class="ds-settings">' +
          '<h1 class="ds-settings__heading">Settings</h1>' +
          '<p class="ds-settings__subtext">Set your preferences to activate intelligent matching. Changes are saved in this browser only.</p>' +
          '<div class="ds-settings__fields">' +
          '<div class="ds-settings__field">' +
          '<label class="ds-input-label" for="prefs-role">Role keywords</label>' +
          '<input type="text" id="prefs-role" class="ds-input" placeholder="e.g. SDE, Backend, Java" />' +
          "</div>" +
          '<div class="ds-settings__field">' +
          '<label class="ds-input-label" for="prefs-locations">Preferred locations</label>' +
          '<select id="prefs-locations" class="ds-input" multiple>' +
          '<option value="Bangalore">Bangalore</option>' +
          '<option value="Hyderabad">Hyderabad</option>' +
          '<option value="Chennai">Chennai</option>' +
          '<option value="Pune">Pune</option>' +
          '<option value="Mumbai">Mumbai</option>' +
          '<option value="Delhi NCR">Delhi NCR</option>' +
          '<option value="Noida">Noida</option>' +
          '<option value="Gurgaon">Gurgaon</option>' +
          '<option value="Remote">Remote</option>' +
          "</select>" +
          "</div>" +
          '<div class="ds-settings__field">' +
          '<label class="ds-input-label">Mode</label>' +
          '<div class="ds-settings__options">' +
          '<label class="ds-settings__option"><input type="checkbox" id="prefs-mode-remote" value="Remote" /> Remote</label>' +
          '<label class="ds-settings__option"><input type="checkbox" id="prefs-mode-hybrid" value="Hybrid" /> Hybrid</label>' +
          '<label class="ds-settings__option"><input type="checkbox" id="prefs-mode-onsite" value="Onsite" /> Onsite</label>' +
          "</div>" +
          "</div>" +
          '<div class="ds-settings__field">' +
          '<label class="ds-input-label" for="prefs-experience">Experience level</label>' +
          '<select id="prefs-experience" class="ds-input">' +
          '<option value="">Any</option>' +
          '<option value="Fresher">Fresher</option>' +
          '<option value="0-1">0-1</option>' +
          '<option value="1-3">1-3</option>' +
          '<option value="3-5">3-5</option>' +
          "</select>" +
          "</div>" +
          '<div class="ds-settings__field">' +
          '<label class="ds-input-label" for="prefs-skills">Skills</label>' +
          '<input type="text" id="prefs-skills" class="ds-input" placeholder="e.g. React, TypeScript, SQL" />' +
          "</div>" +
          '<div class="ds-settings__field">' +
          '<label class="ds-input-label" for="prefs-min-score">Minimum match score</label>' +
          '<input type="range" id="prefs-min-score" min="0" max="100" value="40" />' +
          '<div class="ds-input-hint">Current threshold: <span id="prefs-min-score-value">40</span>%</div>' +
          "</div>" +
          '<div class="ds-settings__field">' +
          '<button type="button" class="ds-btn ds-btn--primary" id="prefs-save">Save preferences</button>' +
          "</div>" +
          "</div>" +
          "</div>"
        );
      }
    },
    "/proof": {
      title: "Proof",
      render: function () {
        return (
          '<div class="ds-route-page">' +
          '<h1 class="ds-route-page__heading">Proof</h1>' +
          '<p class="ds-route-page__subtext">Placeholder for artifact collection. No logic yet.</p>' +
          "</div>"
        );
      }
    },
    "/jt/07-test": {
      title: "Test Checklist",
      render: function () {
        var status = getTestStatus();
        var listHtml = TEST_ITEMS.map(function (item, i) {
          var checked = status[i] ? " checked" : "";
          var tip = item.tooltip ? ' <span class="ds-test-tooltip" title="' + escapeHtml(item.tooltip) + '">How to test</span>' : "";
          return (
            '<li class="ds-test-item">' +
            '<label class="ds-test-label">' +
            '<input type="checkbox" id="test-check-' + i + '" class="ds-test-checkbox"' + checked + " />" +
            '<span class="ds-test-text">' + escapeHtml(item.label) + "</span>" +
            tip +
            "</label>" +
            "</li>"
          );
        }).join("");
        return (
          '<div class="ds-test-page">' +
          '<h1 class="ds-test-page__heading">Test Checklist</h1>' +
          '<p id="test-summary" class="ds-test-summary">Tests Passed: ' + getTestPassedCount() + ' / 10</p>' +
          '<p id="test-warning" class="ds-test-warning" style="display:' + (getTestPassedCount() >= 10 ? 'none' : 'block') + '">Resolve all issues before shipping.</p>' +
          '<ul class="ds-test-list">' + listHtml + "</ul>" +
          '<button type="button" class="ds-btn ds-btn--secondary" id="test-reset">Reset Test Status</button>' +
          "</div>"
        );
      }
    },
    "/jt/08-ship": {
      title: "Ship",
      render: function () {
        var allPassed = getTestPassedCount() === 10;
        if (!allPassed) {
          return (
            '<div class="ds-test-page ds-test-page--locked">' +
            '<h1 class="ds-test-page__heading">Ship</h1>' +
            '<p class="ds-test-page__locked">Complete all tests before shipping.</p>' +
            '<p class="ds-route-page__subtext">Go to <a href="/jt/07-test" data-route="/jt/07-test">Test Checklist</a> and check all 10 items.</p>' +
            "</div>"
          );
        }
        return (
          '<div class="ds-test-page">' +
          '<h1 class="ds-test-page__heading">Ship</h1>' +
          '<p class="ds-test-page__subtext">All tests passed. Ready to ship.</p>' +
          "</div>"
        );
      }
    }
  };

  function render404() {
    return (
      '<div class="ds-route-page ds-route-page--404">' +
      '<h1 class="ds-route-page__heading">Page Not Found</h1>' +
      '<p class="ds-route-page__subtext">' + escapeHtml(SUBTEXT_404) + "</p>" +
      "</div>"
    );
  }

  function handleNavClick(e) {
    var a = e.target.closest(".ds-nav-link[data-route]");
    if (!a) return;
    e.preventDefault();
    var path = a.getAttribute("data-route");
    var current = getPath();
    if (path === current) return;
    navigate(path);
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", handleNavClick);
  });
  dropdownLinks.forEach(function (link) {
    link.addEventListener("click", handleNavClick);
  });

  app.addEventListener("click", function (e) {
    var a = e.target.closest("a[data-route]");
    if (a) {
      e.preventDefault();
      navigate(a.getAttribute("data-route"));
    }
  });

  if (brandLink) {
    brandLink.addEventListener("click", function (e) {
      e.preventDefault();
      if (getPath() === "/") return;
      navigate("/");
    });
  }

  window.addEventListener("popstate", function () {
    render(getPath());
  });

  if (toggleBtn && dropdown) {
    toggleBtn.addEventListener("click", function () {
      dropdown.classList.toggle("ds-nav-dropdown--open");
    });
  }

  render(getPath());
})();
