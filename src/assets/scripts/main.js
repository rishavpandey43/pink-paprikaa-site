// Simple auto-advancing carousel for elements with .carousel
document.querySelectorAll('.carousel').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  if (!track) return;
  const slides = track.children.length;
  let idx = 0;
  const dots = carousel.parentElement.querySelectorAll('.dot');

  function go(i) {
    idx = i % slides;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, j) => d.style.background = j === idx ? '#ee2c68' : '#CBD5E1');
  }

  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  setInterval(() => go(idx + 1), 3500);
  go(0);
});
