// app.js — Connect frontend to backend, fetch real metadata and initiate downloads

document.addEventListener('DOMContentLoaded', ()=>{
  const fetchBtn = document.getElementById('fetch-btn');
  const previewCard = document.getElementById('preview-card');
  const downloadBtn = document.getElementById('download-btn');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlay-text');
  const toast = document.getElementById('toast');
  const moreBtn = document.getElementById('more-btn');
  const videoInput = document.getElementById('video-url');
  const thumbContainer = document.getElementById('thumb-container');
  const videoTitleEl = document.getElementById('video-title');
  const videoMetaEl = document.getElementById('video-meta');
  const formatsContainer = document.getElementById('formats');
  const presetSelect = document.getElementById('preset-quality');

  if(!fetchBtn || !videoInput) return;

  function showOverlay(text){
    overlayText.textContent = text || 'Processing...';
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  }
  function hideOverlay(){
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function showToast(message, isError=false){
    toast.textContent = message;
    toast.classList.remove('hidden');
    if(isError) toast.classList.add('error'); else toast.classList.remove('error');
    try{ toast.focus(); } catch(e){}
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=>{ toast.classList.add('hidden') },4000);
  }

  function clearPreview(){
    previewCard.classList.add('hidden');
    previewCard.setAttribute('aria-hidden','true');
    thumbContainer.innerHTML = '';
    videoTitleEl.textContent = '—';
    videoMetaEl.textContent = '—';
    formatsContainer.innerHTML = '';
    downloadBtn.disabled = true;
  }

  async function fetchPreview(url){
    try{
      showOverlay('Fetching metadata...');
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if(!res.ok){
        const err = await res.json().catch(()=>({message:'Unknown error'}));
        throw new Error(err.message || 'Failed to fetch preview');
      }
      const data = await res.json();
      // Populate UI
      thumbContainer.innerHTML = '';
      if(data.thumbnail){
        const img = document.createElement('img');
        img.src = data.thumbnail;
        img.alt = data.title || 'Video thumbnail';
        img.width = 320;
        img.height = 180;
        img.loading = 'lazy';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        thumbContainer.appendChild(img);
      }
      videoTitleEl.textContent = data.title || 'Untitled video';
      const mins = Math.floor((data.lengthSeconds||0)/60);
      const secs = (data.lengthSeconds||0) % 60;
      videoMetaEl.textContent = `${data.author || ''} • ${mins}:${secs.toString().padStart(2,'0')} • ${data.views ? data.views + ' views' : ''}`;

      // Build formats
      formatsContainer.innerHTML = '';
      const videoFormats = data.formats && data.formats.video ? data.formats.video : [];
      const audioFormats = data.formats && data.formats.audio ? data.formats.audio : [];

      if(videoFormats.length === 0 && audioFormats.length === 0){
        showToast('No downloadable formats found', true);
      }

      // Helper to create button
      function createFormatButton(f, type){
        const btn = document.createElement('button');
        btn.className = 'btn outline';
        btn.type = 'button';
        btn.textContent = type === 'audio' ? `${f.container.toUpperCase()} • ${f.quality || f.bitrate || 'audio'}` : `${f.container.toUpperCase()} • ${f.quality || 'video'}`;
        btn.dataset.itag = f.itag;
        btn.dataset.type = type;
        btn.dataset.url = url;
        btn.addEventListener('click', ()=>{
          // Start download for this format
          const itag = btn.dataset.itag;
          const type = btn.dataset.type;
          // Use location to trigger backend streaming (Attachment headers)
          const q = new URLSearchParams({ url, itag, type });
          window.location.href = '/api/download?' + q.toString();
        });
        return btn;
      }

      // Append a few preferred formats first
      videoFormats.slice(0,4).forEach(f=>{ formatsContainer.appendChild(createFormatButton(f,'video')); });
      audioFormats.slice(0,3).forEach(f=>{ formatsContainer.appendChild(createFormatButton(f,'audio')); });

      // enable download (download button will open a best choice)
      downloadBtn.disabled = false;
      downloadBtn.onclick = ()=>{
        // choose preset or best
        const preset = presetSelect.value;
        // find matching format
        let target = null;
        if(preset === 'audio'){
          target = audioFormats[0];
        } else if(preset === '1080'){
          target = videoFormats.find(v=>v.quality && v.quality.includes('1080')) || videoFormats[0];
        } else if(preset === '720'){
          target = videoFormats.find(v=>v.quality && v.quality.includes('720')) || videoFormats[0];
        } else {
          target = videoFormats[0] || audioFormats[0];
        }
        if(!target){ showToast('No format available for download', true); return; }
        const q = new URLSearchParams({ url, itag: target.itag, type: target.itag && target.container ? (target.hasVideo && !target.hasAudio ? 'video' : (target.hasAudio && !target.hasVideo ? 'audio' : 'video')) : 'video' });
        window.location.href = '/api/download?' + q.toString();
      };

      // Show preview card
      previewCard.classList.remove('hidden');
      previewCard.setAttribute('aria-hidden','false');
      hideOverlay();

    } catch(err){
      hideOverlay();
      clearPreview();
      console.error(err);
      showToast(err.message || 'Unable to fetch preview', true);
    }
  }

  // Trigger preview
  fetchBtn.addEventListener('click', ()=>{
    const url = videoInput.value && videoInput.value.trim();
    if(!url){ showToast('Please enter a video URL', true); return; }
    fetchPreview(url);
  });

  // support Enter key
  videoInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      fetchBtn.click();
    }
  });

});
