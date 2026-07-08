// app.js — Frontend prototype interactions (no backend)

document.addEventListener('DOMContentLoaded', ()=>{
  const fetchBtn = document.getElementById('fetch-btn');
  const previewCard = document.getElementById('preview-card');
  const downloadBtn = document.getElementById('download-btn');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlay-text');
  const toast = document.getElementById('toast');
  const moreBtn = document.getElementById('more-btn');

  // Hide preview card initially to demonstrate flow
  previewCard.classList.add('hidden');

  function showOverlay(text){
    overlayText.textContent = text || 'Processing...';
    overlay.classList.remove('hidden');
  }
  function hideOverlay(){ overlay.classList.add('hidden') }

  function showToast(message, success=true){
    toast.textContent = message;
    toast.style.background = success ? 'linear-gradient(90deg,#6D5CFF,#FF7AB6)' : 'linear-gradient(90deg,#FF7AB6,#FFB86B)';
    toast.classList.remove('hidden');
    setTimeout(()=>{ toast.classList.add('hidden') },3000);
  }

  // Simulate fetching preview data
  fetchBtn.addEventListener('click', ()=>{
    const url = document.getElementById('video-url').value.trim();
    // Simple client-side validation
    if(!url){
      showToast('Please paste a video URL (prototype).', false);
      return;
    }

    showOverlay('Fetching preview (mock)...');
    // Simulate async operation
    setTimeout(()=>{
      hideOverlay();
      // Populate preview card with demo values (already present in HTML), then show
      previewCard.classList.remove('hidden');
      previewCard.scrollIntoView({behavior:'smooth',block:'center'});
      showToast('Preview ready — UI only', true);
    }, 900);
  });

  // Simulate download placeholder
  downloadBtn.addEventListener('click', ()=>{
    showOverlay('Preparing download (prototype)...');
    // Random success or error for demo
    setTimeout(()=>{
      hideOverlay();
      const ok = Math.random() > 0.15;
      if(ok){
        showToast('Success: file ready (prototype)');
      } else {
        showToast('Error: failed to prepare file (prototype)', false);
      }
    }, 1200);
  });

  moreBtn.addEventListener('click', ()=>{
    showToast('More options — coming in Phase 2');
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth'});
    })
  })

});
