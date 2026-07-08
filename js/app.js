// app.js — Mobile-first prototype interactions (no backend)

document.addEventListener('DOMContentLoaded', ()=>{
  const fetchBtn = document.getElementById('fetch-btn');
  const previewCard = document.getElementById('preview-card');
  const downloadBtn = document.getElementById('download-btn');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlay-text');
  const toast = document.getElementById('toast');
  const moreBtn = document.getElementById('more-btn');

  // Keep preview hidden initially
  previewCard.classList.add('hidden');

  function showOverlay(text){
    overlayText.textContent = text || 'Processing...';
    overlay.classList.remove('hidden');
  }
  function hideOverlay(){ overlay.classList.add('hidden') }

  function showToast(message, success=true){
    toast.textContent = message;
    toast.style.background = success ? 'linear-gradient(90deg,#5A4BEE,#FF7AB6)' : 'linear-gradient(90deg,#FF7AB6,#FFB86B)';
    toast.classList.remove('hidden');
    setTimeout(()=>{ toast.classList.add('hidden') },3000);
  }

  // Simulate preview flow (client-only)
  fetchBtn.addEventListener('click', ()=>{
    const url = document.getElementById('video-url').value.trim();
    if(!url){ showToast('Please paste a video URL.', false); return; }

    showOverlay('Loading preview (demo)...');
    setTimeout(()=>{
      hideOverlay();
      previewCard.classList.remove('hidden');
      previewCard.scrollIntoView({behavior:'smooth',block:'center'});
      showToast('Preview ready (UI only)');
    }, 800);
  });

  // Simulate download placeholder
  downloadBtn.addEventListener('click', ()=>{
    showOverlay('Preparing (demo)...');
    setTimeout(()=>{
      hideOverlay();
      const ok = Math.random() > 0.15;
      if(ok){ showToast('Success: file prepared (demo)'); }
      else { showToast('Error preparing file (demo)', false); }
    }, 1000);
  });

  moreBtn.addEventListener('click', ()=>{
    showToast('Options will be available in Phase 2');
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth'});
    });
  });

});
