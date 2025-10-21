// Compiled JS from TypeScript (handwritten to avoid build step)
document.addEventListener('DOMContentLoaded', function () {
    var year = new Date().getFullYear().toString();
    document.querySelectorAll('[id^="year"]').forEach(function (el) { el.textContent = year; });
    var btn = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.nav');
    if (btn && nav) {
        btn.addEventListener('click', function () {
            var shown = nav.style.display === 'flex';
            nav.style.display = shown ? 'none' : 'flex';
        });
    }
    var gallery = document.getElementById('gallery');
    var lightbox = document.getElementById('lightbox');
    var lightboxImage = document.getElementById('lightboxImage');
    var lightboxClose = document.getElementById('lightboxClose');
    if (gallery && lightbox && lightboxImage && lightboxClose) {
        gallery.addEventListener('click', function (e) {
            var target = e.target;
            if (target && target.tagName === 'IMG') {
                var img = target;
                var src = img.dataset.full || img.src;
                lightboxImage.src = src;
                lightboxImage.alt = img.alt || '';
                lightbox.classList.remove('hidden');
            }
        });
        lightboxClose.addEventListener('click', function () { return lightbox.classList.add('hidden'); });
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox)
                lightbox.classList.add('hidden');
        });
    }
    var form = document.getElementById('contactForm');
    var formMessage = document.getElementById('formMessage');
    if (form && formMessage) {
        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            var name = document.getElementById('name').value.trim();
            var phone = document.getElementById('phone').value.trim();
            var message = document.getElementById('message').value.trim();
            if (!name || !phone || !message) {
                formMessage.textContent = 'Please fill in name, phone and message.';
                formMessage.style.color = 'crimson';
                return;
            }
            formMessage.textContent = 'Thanks! Your message has been received. We will contact you shortly.';
            formMessage.style.color = 'green';
            form.reset();
        });
    }

        // Booking form: verify address via Google Maps iframe and fake submit
        var bookingForm = document.getElementById('bookingForm');
        var verifyBtn = document.getElementById('verifyAddress');
        var mapPreview = document.getElementById('mapPreview');
        var mapFrame = document.getElementById('mapFrame');
        var bookingMessage = document.getElementById('bookingMessage');
        if (bookingForm && verifyBtn && mapPreview && mapFrame && bookingMessage) {
            verifyBtn.addEventListener('click', function () {
                var address = document.getElementById('address').value.trim();
                if (!address) {
                    bookingMessage.textContent = 'Please enter an address to verify.';
                    bookingMessage.style.color = 'crimson';
                    return;
                }

                
                var query = encodeURIComponent(address + ' Rustenburg');
                mapFrame.src = "https://www.google.com/maps?q=" + query + "&output=embed";
                mapPreview.classList.remove('hidden');
                bookingMessage.textContent = 'Address preview shown below. Please confirm it is correct before requesting pick-up.';
                bookingMessage.style.color = 'var(--muted)';
            });
            bookingForm.addEventListener('submit', function (ev) {
                ev.preventDefault();
                var first = document.getElementById('firstName').value.trim();
                var last = document.getElementById('lastName').value.trim();
                var appliance = document.getElementById('appliance').value.trim();
                var address = document.getElementById('address').value.trim();
                var time = document.getElementById('pickupTime').value;
                if (!first || !last || !appliance || !address || !time) {
                    bookingMessage.textContent = 'Please complete all booking fields.';
                    bookingMessage.style.color = 'crimson';
                    return;
                }
                var payload = { firstName: first, lastName: last, appliance: appliance, address: address, pickupTime: time };
                var webapp = window.SHEET_WEBAPP_URL || '';
                if (webapp) {
                    fetch(webapp, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(function (r) { return r.json(); }).then(function (data) {
                        var ref = data.bookingRef || 'unknown';
                        bookingMessage.textContent = "Appointment lodged (ref: " + ref + ") — we will contact you to confirm the pick-up window.";
                        bookingMessage.style.color = 'green';
                        bookingForm.reset();
                        if (mapPreview)
                            mapPreview.classList.add('hidden');
                    }).catch(function () {
                        bookingMessage.textContent = 'Appointment lodged locally, but failed to save to server. Please call us to confirm.';
                        bookingMessage.style.color = 'crimson';
                    });
                }
                else {
                    bookingMessage.textContent = 'Appointment lodged — we will contact you to confirm the pick-up window.';
                    bookingMessage.style.color = 'green';
                    bookingForm.reset();
                    if (mapPreview)
                        mapPreview.classList.add('hidden');
                }
            });
        }
});
