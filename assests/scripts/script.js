const burger = document.getElementById("burger-toggle");
const header = document.getElementById("site-header");
const main = document.querySelector("main");
const about = document.querySelector(".about");
const aboutbtn = document.getElementById("AboutButton");
const wrapper = document.querySelector('.services-wrapper');
const btnLeft = document.querySelector('.scroll-btn.left');
const btnRight = document.querySelector('.scroll-btn.right');

burger.addEventListener("click", () => {
  header.classList.toggle("open");
  // small push down when menu open
  if (header.classList.contains("open")) {
    main.style.marginTop = "0"; // adjust to actual nav height
    burger.textContent = "✖";
  } else {
    main.style.marginTop = "0";
    burger.textContent = "☰";
  }
});

aboutbtn.addEventListener("click", () => {
  about.classList.toggle("about-open");
  aboutbtn.classList.toggle("aboutbtn-open");
})

if (aboutbtn.classList.contains("aboutbtn-open")) {
  aboutbtn.textContent = "Click to close this section<<<";
} else {
  aboutbtn.textContent = "Click to find out more about us>>>"
}


btnLeft.addEventListener('click', () => {
  wrapper.scrollBy({ left: -wrapper.clientWidth * 1, behavior: 'smooth' });
});

btnRight.addEventListener('click', () => {
  wrapper.scrollBy({ left: wrapper.clientWidth * 1, behavior: 'smooth' });
});


///Details Pane

// === GALLERY INTERACTIVITY ===

// Get references
const galleryImages = document.querySelectorAll('.gallery-grid img');
const detailTitle = document.getElementById('detail-title');
const detailTestimonial = document.getElementById('detail-testimonial');

// Loop through all images
galleryImages.forEach(img => {
  img.addEventListener('click', () => {
    // Get info from data attributes
    const title = img.getAttribute('data-title');
    const testimonial = img.getAttribute('data-testimonial');

    // Update the details pane
    detailTitle.textContent = title;
    detailTestimonial.textContent = testimonial;

    // Add a little animation to show update
    detailTitle.style.opacity = '0';
    detailTestimonial.style.opacity = '0';
    setTimeout(() => {
      detailTitle.style.opacity = '1';
      detailTestimonial.style.opacity = '1';
    }, 150);
  });
});
