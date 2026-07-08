// backend/index.js
// Simple Express backend to fetch YouTube video metadata and stream downloads using ytdl-core and ffmpeg (for mp3)

const express = require('express');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const stream = require('stream');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve frontend static files from repository root
app.use(express.static(path.join(__dirname, '..')));

// POST /api/preview
// Body: { url }
app.post('/api/preview', async (req, res) => {
  const { url } = req.body || {};
  if(!url || typeof url !== 'string') return res.status(400).json({ message: 'Invalid URL' });

  try{
    if(!ytdl.validateURL(url)) return res.status(400).json({ message: 'Unsupported or invalid YouTube URL' });
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails || {};
    const formats = info.formats || [];

    // Build format lists: video (has video), audio (audio only)
    const videoFormats = formats
      .filter(f => f.container === 'mp4' && f.hasVideo)
      .map(f => ({ itag: f.itag, quality: f.qualityLabel || f.quality, container: f.container, hasAudio: f.hasAudio, contentLength: f.contentLength }))
      .sort((a,b)=> (b.quality || '').localeCompare(a.quality || ''));

    const audioFormats = formats
      .filter(f => f.hasAudio && !f.hasVideo)
      .map(f => ({ itag: f.itag, bitrate: f.bitrate, container: f.container, contentLength: f.contentLength }))
      .sort((a,b)=> (b.bitrate||0) - (a.bitrate||0));

    const thumbnail = (videoDetails.thumbnails && videoDetails.thumbnails.length) ? videoDetails.thumbnails.pop().url : null;

    res.json({
      id: videoDetails.videoId,
      title: videoDetails.title,
      author: videoDetails.author && videoDetails.author.name,
      lengthSeconds: parseInt(videoDetails.lengthSeconds || 0, 10),
      views: videoDetails.viewCount || null,
      thumbnail,
      formats: { video: videoFormats, audio: audioFormats }
    });

  } catch(err){
    console.error('Preview error:', err.message || err);
    res.status(500).json({ message: 'Failed to retrieve video info' });
  }
});

// GET /api/download?url=...&itag=...&type=video|audio
app.get('/api/download', async (req, res) => {
  const { url, itag, type } = req.query;
  if(!url) return res.status(400).send('Missing url parameter');

  try{
    if(!ytdl.validateURL(url)) return res.status(400).send('Invalid YouTube URL');
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails ? info.videoDetails.title.replace(/[^a-z0-9\-\_\. ]/gi,'') : 'video';

    // If itag provided, use that format; else choose best
    let filterOpt = {};
    if(itag){ filterOpt = { quality: itag }; }

    if(type === 'audio' || (itag && info.formats.find(f=>String(f.itag) === String(itag) && f.hasAudio && !f.hasVideo))){
      // Stream audio and transcode to mp3 using ffmpeg
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.setHeader('Content-Type', 'audio/mpeg');

      const audioStream = ytdl(url, { filter: 'audioonly', quality: itag || 'highestaudio' });
      // Use ffmpeg to convert to mp3 (ffmpeg must be installed on the server)
      const proc = ffmpeg(audioStream)
        .format('mp3')
        .audioCodec('libmp3lame')
        .on('error', err => {
          console.error('FFmpeg error', err);
          if(!res.headersSent) res.status(500).end('Transcoding error');
        })
        .pipe(res, { end: true });

    } else {
      // Stream video format (mp4 if available)
      res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');

      const videoStream = ytdl(url, { quality: itag || 'highestvideo', filter: format => format.container === 'mp4' || format.container === 'webm' });
      videoStream.on('error', err => {
        console.error('ytdl error', err);
        if(!res.headersSent) res.status(500).end('Download error');
      });
      videoStream.pipe(res);
    }
  } catch(err){
    console.error('Download endpoint error:', err.message || err);
    if(!res.headersSent) res.status(500).send('Failed to prepare download');
  }
});

// Health check
app.get('/api/health', (req,res)=> res.json({ ok: true }));

app.listen(PORT, ()=>{
  console.log(`YT Video backend listening on port ${PORT}`);
});
