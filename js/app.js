// app.js — Mobile-first prototype interactions (updated, no backend)

document.addEventListener('DOMContentLoaded', ()=>{
  const fetchBtn = document.getElementById('fetch-btn');
  const previewCard = document.getElementById('preview-card');
  const downloadBtn = document.getElementById('download-btn');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlay-text');
  const toast = document.getElementById('toast');
  const moreBtn = document.getElementById('more-btn');
  const videoInput = document.getElementById('video-url');

  // Defensive checks (in case file changes later)
  if(!fetchBtn || !previewCard || !overlay || !toast) return;

  // Keep preview hidden initially
  previewCard.classList.add('hidden');
  previewCard.setAttribute('aria-hidden', 'true');

  function showOverlay(text){
    overlayText.textContent = text || 'Processing...';
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    const status = overlay.querySelector('[role="status"]');
    if(status) status.setAttribute('aria-busy', 'true');
  }
  function hideOverlay(){
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    const status = overlay.querySelector('[role="status"]');
    if(status) status.setAttribute('aria-busy', 'false');
  }

  function showToast(message, success=true){
    toast.textContent = message;
    toast.classList.remove('hidden');
    if(success) toast.classList.remove('error'); else toast.classList.add('error');
    // move focus to toast for screen readers
    try{ toast.focus(); } catch(e){}
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=>{ toast.classList.add('hidden') },3000);
  }

  // Allow clicking toast to dismiss early
  toast.addEventListener('click', ()=>{ toast.classList.add('hidden') });

  // Simulate preview flow (client-only)
  const doPreview = ()=>{
    const url = videoInput && videoInput.value ? videoInput.value.trim() : '';
    if(!url){ showToast('Please paste a video URL.', false); return; }

    showOverlay('Loading preview (demo)...');
    setTimeout(()=>{
      hideOverlay();
      previewCard.classList.remove('hidden');
      previewCard.setAttribute('aria-hidden', 'false');
      previewCard.scrollIntoView({behavior:'smooth',block:'center'});
      showToast('Preview ready (UI only)');
    }, 700);
  };

  fetchBtn.addEventListener('click', doPreview);

  // Support Enter key on input to trigger preview
  if(videoInput){
    videoInput.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        doPreview();
      }
    });
  }

  // Simulate download placeholder
  if(downloadBtn){
    downloadBtn.addEventListener('click', ()=>{
      showOverlay('Preparing (demo)...');
      setTimeout(()=>{
        hideOverlay();
        const ok = Math.random() > 0.12; // slightly higher success
        if(ok){ showToast('Success: file prepared (demo)'); }
        else { showToast('Error preparing file (demo)', false); }
      }, 900);
    });
  }

  if(moreBtn){
    moreBtn.addEventListener('click', ()=>{ showToast('Options will be available in Phase 2'); });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      // allow skip-link to work naturally
      if(a.classList.contains('skip-link')) return;
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if(target) target.scrollIntoView({behavior:'smooth'});
    });
  });

});
