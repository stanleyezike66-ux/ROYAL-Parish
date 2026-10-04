// =====================================================
//  STEP 1: YOUR PICTURES  (this is the only part you edit)
// =====================================================

// The folder that holds your pictures (keep the / at the end)
var FOLDER = 'img sp peter/';

// The file type of your pictures: '.jpg', '.jpeg' or '.png'
var EXTENSION = '.jpg';

// The picture names WITHOUT the extension, in the order you want them shown.
// To add a picture, add its name inside quotes, with a comma between names.
var PHOTOS = ['a.1', 'a.2', 'a.3', 'a.4', 'a.5','a.6','a.7','a.8','a.9','a.10','a.11','a.12','a.13','a.14','a.15','a.16','a.17','a.18','a.19','a.20','a.21','a.22','a.23','a.24', 'a.25', 'a.26', 'a.27', 'a.28','a.29','a.30','a.31','a.32','a.33','a.34','a.35',];


// Optional captions. Write the position (1 = first picture), then the text.
// Example: var CAPTIONS = {};
var CAPTIONS = {1: 'Planting a tree', 2: ''};

// Seconds between automatic changes
var AUTO_SECONDS = 30;


// =====================================================
//  STEP 2: THE SLIDER  (no need to edit below this line)
// =====================================================
(function () {
  var slider = document.getElementById('slider');
  var slidesBox = slider.querySelector('.slides');
  var dotsBox = slider.querySelector('.dots');
  var counter = slider.querySelector('.counter');
  var prevBtn = slider.querySelector('.prev');
  var nextBtn = slider.querySelector('.next');

  // Build the list of picture files
  var files = PHOTOS.map(function (name) { return FOLDER + name + EXTENSION; });
  var count = files.length;

  // Build one slide for every picture. Pictures load only when needed, so many photos stay fast on phones.
  var slides = [];
  var dots = [];
  files.forEach(function (file, i) {
    var fig = document.createElement('figure');
    fig.className = 'slide' + (i === 0 ? ' active' : '');
    var caption = CAPTIONS[i + 1] || '';

    var img = document.createElement('img');
    img.alt = caption || ('Photo ' + (i + 1));
    img.setAttribute('data-src', file);
    img.addEventListener('error', function () { console.log('Cannot find picture: ' + file); });
    fig.appendChild(img);

    if (caption) {
      var cap = document.createElement('figcaption');
      cap.textContent = caption;
      fig.appendChild(cap);
    }
    slidesBox.appendChild(fig);
    slides.push(fig);

    if (count <= 12) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Show photo ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); restartAuto(); });
      dotsBox.appendChild(dot);
      dots.push(dot);
    }
  });

  // With many pictures, show a counter ("12 / 46") instead of dots
  if (count > 12) slider.classList.add('many');

  function loadPicture(i) {
    i = (i + count) % count;
    var img = slides[i].querySelector('img');
    if (img && !img.src && img.getAttribute('data-src')) img.src = img.getAttribute('data-src');
  }
  function loadAround(i) { loadPicture(i); loadPicture(i + 1); loadPicture(i - 1); }

  function updateIndicators() {
    dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    counter.textContent = (current + 1) + ' / ' + count;
  }

  var AUTO_DELAY = AUTO_SECONDS * 1000;
  var current = 0;
  var step = 0;            // counts transitions so the direction rotates
  var busy = false;
  var timer = null;

  // Direction pattern. "enter" = where the new picture starts, "leave" = where the old one goes.
  // 1) new from RIGHT, old to LEFT   2) new from BOTTOM, old UP
  // 3) new from TOP, old DOWN        4) new from LEFT, old to RIGHT   ...then repeat
  var directions = [
    { enter: '100%, 0',  leave: '-100%, 0' },
    { enter: '0, 100%',  leave: '0, -100%' },
    { enter: '0, -100%', leave: '0, 100%'  },
    { enter: '-100%, 0', leave: '100%, 0'  }
  ];

  function speed() {
    var s = parseFloat(getComputedStyle(slider).getPropertyValue('--speed'));
    return (isNaN(s) ? 0.8 : s) * 1000;
  }

  function goTo(index) {
    index = (index + count) % count;
    if (busy || index === current) return;
    busy = true;

    var oldSlide = slides[current];
    var newSlide = slides[index];
    var dir = directions[step % directions.length];
    step++;

    loadPicture(index);

    // 1. Put the new picture at its starting side, with no animation
    newSlide.style.transition = 'none';
    newSlide.style.transform = 'translate3d(' + dir.enter + ', 0)';
    newSlide.classList.add('active');
    void newSlide.offsetWidth;            // makes the browser apply the position above

    // 2. Switch animation back on and slide both pictures
    newSlide.style.transition = '';
    newSlide.style.transform = 'translate3d(0, 0, 0)';
    oldSlide.style.transform = 'translate3d(' + dir.leave + ', 0)';

    current = index;
    updateIndicators();
    loadAround(current);

    // 3. When the movement ends, tidy up
    setTimeout(function () {
      oldSlide.style.transition = 'none';
      oldSlide.classList.remove('active');
      oldSlide.style.transform = '';
      void oldSlide.offsetWidth;
      oldSlide.style.transition = '';
      newSlide.style.transform = '';
      busy = false;
    }, speed() + 60);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  // ----- Automatic slideshow -----
  function startAuto() { stopAuto(); timer = setInterval(next, AUTO_DELAY); }
  function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
  function restartAuto() { startAuto(); }

  prevBtn.addEventListener('click', function () { prev(); restartAuto(); });
  nextBtn.addEventListener('click', function () { next(); restartAuto(); });

  // Pause while the mouse is over the gallery
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  // Pause while a button has keyboard focus
  slider.addEventListener('focusin', stopAuto);
  slider.addEventListener('focusout', startAuto);

  // Pause when the browser tab is hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stopAuto(); else startAuto();
  });

  // ----- Swipe on phones and tablets -----
  var startX = 0, startY = 0;
  slider.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    stopAuto();
  }, { passive: true });
  slider.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    startAuto();
  }, { passive: true });

  // ----- Keyboard arrows -----
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { next(); restartAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); restartAuto(); }
  });

  updateIndicators();
  loadAround(0);
  startAuto();
})();