(function () {
	'use strict';

	var diaryKey = 'choiDiaryEntries';
	var photoKey = 'choiPhotoDrafts';

	var publicEntries = [];

	function $(selector, root) {
		return (root || document).querySelector(selector);
	}

	function $all(selector, root) {
		return Array.prototype.slice.call((root || document).querySelectorAll(selector));
	}

	function readStore(key) {
		try {
			return JSON.parse(localStorage.getItem(key)) || [];
		} catch (error) {
			return [];
		}
	}

	function writeStore(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}

	function formatDate(value) {
		var date = new Date(value + 'T00:00:00');

		if (Number.isNaN(date.getTime()))
			return value;

		return date.toLocaleDateString(undefined, {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function escapeText(value) {
		return String(value || '').replace(/[&<>"']/g, function (character) {
			return {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
			}[character];
		});
	}

	function getEntries() {
		return publicEntries.concat(readStore(diaryKey)).sort(function (a, b) {
			return String(b.date).localeCompare(String(a.date));
		});
	}

	function loadPublicEntries() {
		return fetch('data/diary-entries.json')
			.then(function (response) {
				if (!response.ok)
					throw new Error('Diary data unavailable');

				return response.json();
			})
			.then(function (entries) {
				publicEntries = Array.isArray(entries) ? entries : [];
				renderDiary();
			})
			.catch(function () {
				renderDiary();
			});
	}

	function renderDiary() {
		var list = $('#diary-list');
		var filter = ($('#diary-filter') || {}).value || '';
		var query = filter.trim().toLowerCase();

		if (!list)
			return;

		var entries = getEntries().filter(function (entry) {
			var haystack = [
				entry.title,
				entry.date,
				entry.category,
				entry.language,
				entry.body
			].join(' ').toLowerCase();

			return haystack.indexOf(query) !== -1;
		});

		list.innerHTML = entries.map(function (entry) {
			var meta = [entry.category, entry.language].filter(Boolean).join(' · ');

			return [
				'<li class="diary-entry">',
				'<time class="diary-date" datetime="' + escapeText(entry.date) + '">' + escapeText(formatDate(entry.date)) + '</time>',
				'<article>',
				'<h4>' + escapeText(entry.title) + '</h4>',
				meta ? '<span class="diary-meta">' + escapeText(meta) + '</span>' : '',
				'<p>' + escapeText(entry.body) + '</p>',
				'</article>',
				'</li>'
			].join('');
		}).join('');

		if (!entries.length)
			list.innerHTML = '<li class="diary-entry"><span class="diary-date">No match</span><article><h4>Nothing found</h4><p>Try a different filter.</p></article></li>';
	}

	function renderPhotos() {
		var grid = $('#photo-grid');
		var drafts = readStore(photoKey);

		if (!grid)
			return;

		$all('[data-local-photo]', grid).forEach(function (node) {
			node.remove();
		});

		drafts.forEach(function (photo) {
			var figure = document.createElement('figure');
			figure.setAttribute('data-local-photo', 'true');
			figure.innerHTML = '<img src="' + escapeText(photo.src) + '" alt="' + escapeText(photo.caption || 'Curated photo') + '" /><figcaption>' + escapeText(photo.caption || 'Untitled') + '</figcaption>';
			grid.appendChild(figure);
		});
	}

	function initTabs() {
		$all('.tab-button').forEach(function (button) {
			button.addEventListener('click', function () {
				var tab = button.getAttribute('data-tab');

				$all('.tab-button').forEach(function (item) {
					item.classList.toggle('active', item === button);
				});

				$all('.tab-panel').forEach(function (panel) {
					panel.classList.toggle('active', panel.getAttribute('data-panel') === tab);
				});
			});
		});
	}

	function initDiaryForm() {
		var form = $('#diary-form');
		var filter = $('#diary-filter');
		var exportButton = $('#export-diary');
		var clearButton = $('#clear-diary');
		var dateInput = $('#entry-date');

		if (dateInput && !dateInput.value)
			dateInput.valueAsDate = new Date();

		if (filter)
			filter.addEventListener('input', renderDiary);

		if (form) {
			form.addEventListener('submit', function (event) {
				event.preventDefault();

				var entries = readStore(diaryKey);

				entries.push({
					title: $('#entry-title').value.trim(),
					date: $('#entry-date').value,
					category: $('#entry-category').value.trim(),
					language: $('#entry-language').value.trim(),
					body: $('#entry-body').value.trim()
				});

				writeStore(diaryKey, entries);
				form.reset();
				$('#entry-date').valueAsDate = new Date();
				renderDiary();
			});
		}

		if (exportButton) {
			exportButton.addEventListener('click', function () {
				var payload = JSON.stringify(readStore(diaryKey), null, 2);
				var blob = new Blob([payload], { type: 'application/json' });
				var url = URL.createObjectURL(blob);
				var link = document.createElement('a');

				link.href = url;
				link.download = 'diary-entries.json';
				link.click();
				URL.revokeObjectURL(url);
			});
		}

		if (clearButton) {
			clearButton.addEventListener('click', function () {
				if (!window.confirm('Clear diary entries saved in this browser?'))
					return;

				localStorage.removeItem(diaryKey);
				renderDiary();
			});
		}
	}

	function initPhotoForm() {
		var form = $('#photo-form');
		var clearButton = $('#clear-photos');

		if (form) {
			form.addEventListener('submit', function (event) {
				event.preventDefault();

				var fileInput = $('#photo-file');
				var captionInput = $('#photo-caption');
				var file = fileInput.files[0];

				if (!file)
					return;

				var reader = new FileReader();

				reader.addEventListener('load', function () {
					var drafts = readStore(photoKey);

					drafts.push({
						src: reader.result,
						caption: captionInput.value.trim()
					});

					writeStore(photoKey, drafts);
					form.reset();
					renderPhotos();
				});

				reader.readAsDataURL(file);
			});
		}

		if (clearButton) {
			clearButton.addEventListener('click', function () {
				if (!window.confirm('Clear photo drafts saved in this browser?'))
					return;

				localStorage.removeItem(photoKey);
				renderPhotos();
			});
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		initTabs();
		initDiaryForm();
		initPhotoForm();
		loadPublicEntries();
		renderPhotos();
	});
})();
