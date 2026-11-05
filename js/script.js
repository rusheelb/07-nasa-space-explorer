// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

const apiUrl = 'https://api.nasa.gov/planetary/apod';
const apiKey = 'Lw7qNjNKgPPwzTCQcgHJRNC7bHHjhTML8M8FqWQW';

const spaceFacts = [
	'A day on Venus is longer than a year on Venus.',
	'Neutron stars can spin about 600 times every second.',
	'One million Earths could fit inside the Sun.',
	'Saturn would float in water because it is less dense than water.',
	'Light from the Sun takes about eight minutes to reach Earth.'
];

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

function showSpaceFact() {
	const fact = document.createElement('p');
	fact.className = 'space-fact';
	fact.innerHTML = `<strong>Did you know?</strong> ${spaceFacts[Math.floor(Math.random() * spaceFacts.length)]}`;
	gallery.before(fact);
}

function showMessage(message, className = 'placeholder') {
	gallery.innerHTML = `<div class="${className}"><p>${message}</p></div>`;
}

function createGalleryItem(item) {
	const galleryItem = document.createElement('article');
	galleryItem.className = 'gallery-item';

	if (item.media_type === 'video') {
		galleryItem.innerHTML = `
			<div class="video-preview">▶</div>
			<h2>${item.title}</h2>
			<p>${item.date}</p>
			<a href="${item.url}" target="_blank" rel="noopener">Watch this NASA video</a>
		`;
		return galleryItem;
	}

	galleryItem.innerHTML = `
		<button class="gallery-button" type="button">
			<img src="${item.url}" alt="${item.title}" loading="lazy">
			<span class="gallery-item-title">${item.title}</span>
			<span class="gallery-item-date">${item.date}</span>
		</button>
	`;
	galleryItem.querySelector('button').addEventListener('click', () => openModal(item));
	return galleryItem;
}

function renderGallery(items) {
	gallery.innerHTML = '';
	items.forEach((item) => gallery.append(createGalleryItem(item)));
}

function openModal(item) {
	const modal = document.createElement('div');
	modal.className = 'modal';
	modal.innerHTML = `
		<div class="modal-content" role="dialog" aria-modal="true" aria-label="${item.title}">
			<button class="close-modal" type="button" aria-label="Close image details">&times;</button>
			<img src="${item.hdurl || item.url}" alt="${item.title}">
			<p class="modal-date">${item.date}</p>
			<h2>${item.title}</h2>
			<p>${item.explanation}</p>
		</div>
	`;
	document.body.append(modal);

	const closeModal = () => modal.remove();
	modal.querySelector('.close-modal').addEventListener('click', closeModal);
	modal.addEventListener('click', (event) => {
		if (event.target === modal) closeModal();
	});
}

async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;
	showMessage('Loading space photos...');

	// Stop waiting if the NASA API does not respond.
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 30000);

	try {
		const response = await fetch(`${apiUrl}?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`, {
			signal: controller.signal
		});
		if (!response.ok) {
			throw new Error(`NASA API returned status ${response.status}`);
		}
		const items = await response.json();
		renderGallery(items);
	} catch (error) {
		let message = 'We could not load space photos right now. Please try again.';
		if (error.name === 'AbortError') {
			message = 'The NASA API took too long to respond. Please try again.';
		} else if (error.message.includes('status 503')) {
			message = 'NASA is temporarily unavailable. Please try again in a few minutes.';
		}
		showMessage(message, 'placeholder error-message');
	} finally {
		clearTimeout(timeoutId);
	}
}

showSpaceFact();
getImagesButton.addEventListener('click', getSpaceImages);
getSpaceImages();
