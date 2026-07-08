// app.js — Frontend uses backend preview & download endpoints. No demo/simulated UI.

document.addEventListener('DOMContentLoaded', ()=>{
  const downloadBtn = document.getElementById('download-btn');
  const videoInput = document.getElementById('video-url');
  const thumbContainer = document.getElementById('thumb-container');
  const videoTitleEl = document.getElementById('video-title');
  const videoMetaEl = document.getElementById('video-meta');
  const formatsContainer = document.getElementById('formats');
  const previewCard = document.getElementById('preview-card');
  const statusEl = document.getElementById('status');
  const presetSelect = document.getElementById('preset-quality');

  if(!downloadBtn || !videoInput) return;

  function setStatus(msg){
    if(!statusEl) return;
    statusEl.textContent = msg || '';
  }

  function clearPreview(){
    previewCard.classList.add('hidden');
    previewCard.setAttribute('aria-hidden','true');
    thumbContainer.innerHTML = '';
    videoTitleEl.textContent = '—';
    videoMetaEl.textContent = '—';
    formatsContainer.innerHTML = '';
  }

  async function fetchAndShow(url){
    clearPreview();
    setStatus('');

    try{
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if(!res.ok){
        const err = await res.json().catch(()=>({message:'Failed to fetch metadata'}));
        setStatus(err.message || 'Failed to fetch metadata');
        return;
      }

      const data = await res.json();
      // populate
      thumbContainer.innerHTML = '';
      if(data.thumbnail){
        const img = document.createElement('img');
        img.src = data.thumbnail;
        img.alt = data.title || 'Video thumbnail';
        img.loading = 'lazy';
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        thumbContainer.appendChild(img);
      }

      videoTitleEl.textContent = data.title || 'Untitled';
      const mins = Math.floor((data.lengthSeconds||0)/60);
      const secs = (data.lengthSeconds||0) % 60;
      videoMetaEl.textContent = `${data.author || ''} • ${mins}:${secs.toString().padStart(2,'0')} • ${data.views ? data.views + ' views' : ''}`;

      formatsContainer.innerHTML = '';
      const videoFormats = (data.formats && data.formats.video) || [];
      const audioFormats = (data.formats && data.formats.audio) || [];

      function makeBtn(f, type){
        const btn = document.createElement('button');
        btn.className = 'btn outline';
        btn.type = 'button';
        btn.textContent = type === 'audio' ? `${f.container.toUpperCase()} • ${f.bitrate || 'audio'}` : `${f.container.toUpperCase()} • ${f.quality || 'video'}`;
        btn.addEventListener('click', ()=>{
          const q = new URLSearchParams({ url, itag: f.itag, type: type });
          // navigate to download endpoint to start download
          window.location.href = '/api/download?' + q.toString();
        });
        return btn;
      }

      videoFormats.forEach(f=> formatsContainer.appendChild(makeBtn(f,'video')));
      audioFormats.forEach(f=> formatsContainer.appendChild(makeBtn(f,'audio')));

      previewCard.classList.remove('hidden');
      previewCard.setAttribute('aria-hidden','false');

    } catch(err){
      console.error(err);
      setStatus('Server error while fetching metadata');
    }
  }

  downloadBtn.addEventListener('click', ()=>{
    const url = (videoInput.value || '').trim();
    if(!url){ setStatus('Please enter a YouTube URL'); return; }
    setStatus('');
    fetchAndShow(url);
  });

  // Enter key triggers same behavior
  videoInput.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter'){
      e.preventDefault();
      downloadBtn.click();
    }
  });

});
