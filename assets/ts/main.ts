// Main TypeScript for site interactions
const init = () => {
  // Global year injection
  const year = new Date().getFullYear().toString()
  document.querySelectorAll('[id^="year"]').forEach(el => { el.textContent = year })

  // Nav toggle for small screens
  const btn = document.querySelector('.nav-toggle') as HTMLButtonElement | null
  const nav = document.querySelector('.nav') as HTMLElement | null
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const shown = nav.style.display === 'flex'
      nav.style.display = shown ? 'none' : 'flex'
    })
  }

  

  // Gallery lightbox
  const gallery = document.getElementById('gallery')
  const lightbox = document.getElementById('lightbox') as HTMLElement | null
  const lightboxImage = document.getElementById('lightboxImage') as HTMLImageElement | null
  const lightboxClose = document.getElementById('lightboxClose') as HTMLElement | null
  if (gallery && lightbox && lightboxImage && lightboxClose) {
    gallery.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target && target.tagName === 'IMG') {
        const img = target as HTMLImageElement
        const src = img.dataset.full || img.src
        lightboxImage.src = src
        lightboxImage.alt = img.alt || ''
        lightbox.classList.remove('hidden')
      }
    })
    lightboxClose.addEventListener('click', () => lightbox.classList.add('hidden'))
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.add('hidden')
    })
  }

  // Contact form simple validation and fake submit
  const form = document.getElementById('contactForm') as HTMLFormElement | null
  const formMessage = document.getElementById('formMessage') as HTMLElement | null
  if (form && formMessage) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault()
      const name = (document.getElementById('name') as HTMLInputElement).value.trim()
      const phone = (document.getElementById('phone') as HTMLInputElement).value.trim()
      const message = (document.getElementById('message') as HTMLTextAreaElement).value.trim()
      if (!name || !phone || !message) {
        formMessage.textContent = 'Please fill in name, phone and message.'
        formMessage.style.color = 'crimson'
        return
      }
      // Simulate success
      formMessage.textContent = 'Thanks! Your message has been received. We will contact you shortly.'
      formMessage.style.color = 'green'
      form.reset()
    })
  }

  // Booking form: verify address via Google Maps iframe and fake submit
  const bookingForm = document.getElementById('bookingForm') as HTMLFormElement | null
  const verifyBtn = document.getElementById('verifyAddress') as HTMLButtonElement | null
  const mapPreview = document.getElementById('mapPreview') as HTMLElement | null
  const mapFrame = document.getElementById('mapFrame') as HTMLIFrameElement | null
  const bookingMessage = document.getElementById('bookingMessage') as HTMLElement | null
  if (bookingForm && verifyBtn && mapPreview && mapFrame && bookingMessage) {
    verifyBtn.addEventListener('click', () => {
      const address = (document.getElementById('address') as HTMLInputElement).value.trim()
      if (!address) {
        bookingMessage.textContent = 'Please enter an address to verify.'
        bookingMessage.style.color = 'crimson'
        return
      }
      // Build a Google Maps search URL (no API key required for a simple embed search)
      const query = encodeURIComponent(address + ' Rustenburg')
      mapFrame.src = `https://www.google.com/maps?q=${query}&output=embed`
      mapPreview.classList.remove('hidden')
      bookingMessage.textContent = 'Address preview shown below. Please confirm it is correct before requesting pick-up.'
      bookingMessage.style.color = 'var(--muted)'
    })

    bookingForm.addEventListener('submit', (ev) => {
      ev.preventDefault()
      const first = (document.getElementById('firstName') as HTMLInputElement).value.trim()
      const last = (document.getElementById('lastName') as HTMLInputElement).value.trim()
      const appliance = (document.getElementById('appliance') as HTMLInputElement).value.trim()
      const address = (document.getElementById('address') as HTMLInputElement).value.trim()
      const time = (document.getElementById('pickupTime') as HTMLInputElement).value
      if (!first || !last || !appliance || !address || !time) {
        bookingMessage.textContent = 'Please complete all booking fields.'
        bookingMessage.style.color = 'crimson'
        return
      }
      const payload = { firstName: first, lastName: last, appliance, address, pickupTime: time }
      const webapp = (window as any).SHEET_WEBAPP_URL || ''
      if (webapp) {
        // POST to Apps Script
        fetch(webapp, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json()).then(data => {
          const ref = data.bookingRef || 'unknown'
          bookingMessage.textContent = `Appointment lodged (ref: ${ref}) — we will contact you to confirm the pick-up window.`
          bookingMessage.style.color = 'green'
          bookingForm.reset()
          if (mapPreview) mapPreview.classList.add('hidden')
        }).catch(() => {
          bookingMessage.textContent = 'Appointment lodged locally, but failed to save to server. Please call us to confirm.'
          bookingMessage.style.color = 'crimson'
        })
      } else {
        // Fallback: simulate lodging an appointment
        bookingMessage.textContent = 'Appointment lodged — we will contact you to confirm the pick-up window.'
        bookingMessage.style.color = 'green'
        bookingForm.reset()
        if (mapPreview) mapPreview.classList.add('hidden')
      }
    })
  }
}

document.addEventListener('DOMContentLoaded', init)
