const media = [];

let filter = 'all', playing = false, current = 0, accent = '#42df70';
let audioContext = null, normalGain = null, vocalGainLeft = null, vocalGainRight = null, vocalRemoved = false, eqLow = null, eqMid = null, eqHigh = null, echoDelay = null, echoWet = null;
const grid = document.querySelector('#grid');
const settingsVolume = document.querySelector('#settingsModal #volume');
if (settingsVolume) { settingsVolume.id = 'settingsVolume'; settingsVolume.style.display = 'none'; if (settingsVolume.previousElementSibling) { const oldValue=settingsVolume.previousElementSibling.querySelector('#volumeValue'); if(oldValue) oldValue.id='settingsVolumeValue'; settingsVolume.previousElementSibling.style.display = 'none'; } }
const audio = document.querySelector('#audio');
const audioB = document.querySelector('#audioB');
const video = document.querySelector('#video');
const stage = document.querySelector('#videoStage');
const videoMessage = document.querySelector('#videoMessage');
const fileInput = document.querySelector('#files');
document.querySelector('.modal-title h2').textContent = 'إعدادات DJ Studio';
const folderInput = document.querySelector('#folderFiles');

function showMessage(text) {
  const toast = document.querySelector('#toast');
  toast.textContent = text;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function activePlayer() {
  return media[current] && media[current].type === 'Movie' ? video : audio;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return String(minutes).padStart(2, '0') + ':' + String(remaining).padStart(2, '0');
}

function updateProgress(event) {
  const player = event.currentTarget;
  if (player !== activePlayer()) return;
  const percent = player.duration ? (player.currentTime / player.duration) * 100 : 0;
  document.querySelector('#progressFill').style.width = percent + '%';
  document.querySelector('#progressBar').style.setProperty('--seek-position', percent + '%');
  document.querySelector('#currentTime').textContent = formatTime(player.currentTime);
  document.querySelector('#durationTime').textContent = formatTime(player.duration);
}

function render() {
  const query = document.querySelector('#search').value.toLowerCase();
  const list = media.filter(item =>
    (filter === 'all' || item.type === filter) &&
    (item.title + ' ' + item.artist).toLowerCase().includes(query)
  );
  grid.innerHTML = '';
  list.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    const artwork = item.cover ? `<img src="${item.cover}" alt="غلاف ${item.title}">` : item.icon;
    card.innerHTML = `<div class="art" style="--a:${item.a};--b:${item.b}">${artwork}</div><div class="info"><span class="badge">${item.type === 'Song' ? 'أغنية' : 'فيديو'}</span><h3>${item.title}</h3><p>${item.artist}</p></div>`;
    card.onclick = () => select(item);
    grid.appendChild(card);
  });
  document.querySelector('#count').textContent = list.length + ' عناصر';
}

function select(item) {
  audio.pause(); video.pause();
  current = media.indexOf(item);
  document.querySelector('#nowTitle').textContent = item.title;
  document.querySelector('#deckTitle').textContent = item.title;
  document.querySelector('#nowArtist').textContent = item.artist;
  const cover = document.querySelector('#cover');
  cover.innerHTML = item.cover ? `<img src="${item.cover}" alt="غلاف الأغنية">` : item.icon;
  if (!item.url) { playing = false; return; }
  const player = item.type === 'Movie' ? video : audio;
  if (item.type === 'Movie') { stage.classList.remove('hidden'); videoMessage.classList.add('hidden'); }
  else stage.classList.add('hidden');
  player.src = item.url;
  player.load();
  player.play().then(() => {
    playing = true;
    document.querySelector('#play').textContent = '❚❚';
  }).catch(() => showMessage('تعذر تشغيل هذا الملف. جرّب MP3 أو MP4.'));
}

function readSynchsafe(bytes, offset) { return (bytes[offset] << 21) | (bytes[offset+1] << 14) | (bytes[offset+2] << 7) | bytes[offset+3]; }
async function extractMp3Cover(file) {
  if (!file.name.toLowerCase().endsWith('.mp3')) return null;
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (String.fromCharCode(...bytes.slice(0,3)) !== 'ID3') return null;
  const tagEnd = Math.min(bytes.length, 10 + readSynchsafe(bytes, 6));
  let offset = 10;
  while (offset + 10 < tagEnd) {
    const id = String.fromCharCode(...bytes.slice(offset, offset + 4));
    const size = (bytes[offset+4] << 24) | (bytes[offset+5] << 16) | (bytes[offset+6] << 8) | bytes[offset+7];
    if (size <= 0) break;
    if (id === 'APIC') {
      let p = offset + 11, mimeEnd = p;
      while (mimeEnd < offset + 10 + size && bytes[mimeEnd] !== 0) mimeEnd++;
      const mime = new TextDecoder().decode(bytes.slice(p, mimeEnd)) || 'image/jpeg';
      p = mimeEnd + 2;
      const encoding = bytes[offset + 10];
      const step = encoding === 1 || encoding === 2 ? 2 : 1;
      while (p + step < offset + 10 + size && !(bytes[p] === 0 && (step === 1 || bytes[p+1] === 0))) p += step;
      p += step;
      return URL.createObjectURL(new Blob([bytes.slice(p, offset + 10 + size)], {type:mime}));
    }
    offset += 10 + size;
  }
  return null;
}

async function addSelectedFiles(selectedFiles, input) {
  const files = Array.from(selectedFiles || []);
  if (files.length === 0) return;
  let added = 0, firstAdded = null;
  const videoExtensions = ['mp4','webm','mov','mkv','avi','m4v'];
  const audioExtensions = ['mp3','wav','ogg','m4a','aac','flac'];
  for (const file of files) {
    const extension = file.name.split('.').pop().toLowerCase();
    const isVideo = file.type.startsWith('video/') || videoExtensions.includes(extension);
    const isAudio = file.type.startsWith('audio/') || audioExtensions.includes(extension);
    if (!isVideo && !isAudio) continue;
    const cover = isAudio ? await extractMp3Cover(file) : null;
    const item = {title:file.name.replace(/\.[^.]+$/,''), artist:'من جهازك', type:isVideo?'Movie':'Song', icon:isVideo?'🎬':'♫', cover:cover, a:isVideo?'#8b2346':'#176b45', b:'#162c80', url:URL.createObjectURL(file), file:file};
    media.push(item); firstAdded = firstAdded || item; added++;
  }
  filter = 'all';
  document.querySelectorAll('.nav').forEach(button => button.classList.toggle('active', button.dataset.filter === 'all'));
  render();
  if (added > 0) { showMessage('تمت إضافة ' + added + ' ملف بنجاح'); select(firstAdded); }
  else showMessage('اختر ملف صوت أو فيديو مدعوم');
  input.value = '';
}

fileInput.onchange = event => addSelectedFiles(event.target.files, fileInput);
folderInput.onchange = event => addSelectedFiles(event.target.files, folderInput);

document.querySelectorAll('.nav').forEach(button => button.onclick = () => { document.querySelectorAll('.nav').forEach(x => x.classList.remove('active')); button.classList.add('active'); filter = button.dataset.filter; render(); });
document.querySelector('#search').oninput = render;
document.querySelector('#play').onclick = () => { const player = activePlayer(); if (!player.src) { showMessage('أضف ملفًا من جهازك أولًا'); return; } playing ? player.pause() : player.play(); playing = !playing; document.querySelector('#play').textContent = playing ? '❚❚' : '▶'; };
function changeTrack(direction) {
  if (media.length === 0) { showMessage('أضف أغاني أو فيديوهات أولًا'); return; }
  current = (current + direction + media.length) % media.length;
  select(media[current]);
  showMessage(direction > 0 ? 'المقطع التالي' : 'المقطع السابق');
}
document.querySelector('#next').onclick = () => changeTrack(1);
document.querySelector('#prev').onclick = () => changeTrack(-1);

function seekFromPointer(event) {
  const player = activePlayer();
  if (!player.src || !player.duration) return;
  const bar = document.querySelector('#progressBar');
  const box = bar.getBoundingClientRect();
  const position = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width));
  player.currentTime = position * player.duration;
  updateProgress({currentTarget:player});
}

const progressBar = document.querySelector('#progressBar');
let seeking = false;
progressBar.onclick = seekFromPointer;
progressBar.onpointerdown = event => { seeking = true; progressBar.setPointerCapture(event.pointerId); progressBar.classList.add('seeking'); seekFromPointer(event); };
progressBar.onpointermove = event => { if (seeking) seekFromPointer(event); };
progressBar.onpointerup = event => { seeking = false; progressBar.releasePointerCapture(event.pointerId); progressBar.classList.remove('seeking'); };
document.querySelector('#closeVideo').onclick = () => { video.pause(); stage.classList.add('hidden'); playing = false; document.querySelector('#play').textContent = '▶'; };

const modal = document.querySelector('#settingsModal');
document.querySelector('#settingsButton').onclick = () => modal.classList.remove('hidden');
document.querySelector('#closeSettings').onclick = () => modal.classList.add('hidden');
function updateMixVolumes(){const master=document.querySelector('#volume').value/100,x=document.querySelector('#crossfader').value/100;audio.volume=video.volume=master*Math.cos(x*Math.PI/2);audioB.volume=master*Math.sin(x*Math.PI/2)}
document.querySelector('#volume').oninput = event => { updateMixVolumes(); document.querySelector('#volumeValue').textContent = event.target.value + '%'; };
document.querySelectorAll('.colors button').forEach(button => button.onclick = () => accent = button.dataset.color);
document.querySelector('#saveSettings').onclick = () => { document.documentElement.style.setProperty('--green', accent); grid.classList.toggle('compact-grid', document.querySelector('#compact').checked); modal.classList.add('hidden'); };
function ended() { if (document.querySelector('#autoplay').checked) select(media[(current + 1) % media.length]); else { playing = false; document.querySelector('#play').textContent = '▶'; } }
audio.onended = ended; video.onended = ended;
audio.ontimeupdate = updateProgress; video.ontimeupdate = updateProgress;
audio.onloadedmetadata = updateProgress;
audio.volume = video.volume = .7; audioB.volume = 0; render();
video.onloadedmetadata = () => {
  updateProgress({currentTarget:video});
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    videoMessage.textContent = 'الملف يحتوي صوتًا، لكن ترميز الصورة غير مدعوم. استخدم فيديو MP4 بترميز H.264.';
    videoMessage.classList.remove('hidden');
  } else {
    videoMessage.classList.add('hidden');
  }
};
video.onerror = () => {
  playing = false;
  document.querySelector('#play').textContent = '▶';
  videoMessage.textContent = 'تعذر عرض الفيديو. الصيغة الأفضل: MP4 بترميز H.264 والصوت AAC.';
  videoMessage.classList.remove('hidden');
  showMessage('صيغة أو ترميز الفيديو غير مدعوم');
};

document.querySelector('#speed').oninput = event => {
  audio.playbackRate = video.playbackRate = event.target.value / 100;
  document.querySelector('#bpmLabel').textContent = Math.round(120 * event.target.value / 100) + ' BPM';
};
document.querySelector('#crossfader').oninput = event => {
  updateMixVolumes();
};
document.querySelector('#cueButton').onclick = event => { const player = activePlayer(); if (!player.src) { showMessage('شغّل أغنية أولًا'); return; } player.currentTime = 0; event.currentTarget.classList.add('on'); setTimeout(()=>event.currentTarget.classList.remove('on'),500); showMessage('تم الرجوع إلى بداية المقطع'); };
document.querySelector('#loopButton').onclick = event => { const player = activePlayer(); player.loop = !player.loop; event.target.classList.toggle('on', player.loop); };
document.querySelector('#syncButton').onclick = event => {
  if (!audio.src || !audioB.src) { showMessage('حمّل أغنية في Deck A وأغنية في Deck B أولًا'); return; }
  const targetBpm = 120;
  const currentBpm = Number(document.querySelector('#bpmLabel').textContent.replace(/[^0-9.]/g,'')) || targetBpm;
  const ratio = Math.max(.75, Math.min(1.25, targetBpm / currentBpm));
  audioB.playbackRate = ratio;
  document.querySelector('#speed').value = Math.round(ratio * 100);
  document.querySelector('#bpmLabel').textContent = targetBpm + ' BPM';
  document.querySelector('#syncStatus').textContent = 'متزامن على ' + targetBpm + ' BPM';
  event.currentTarget.classList.add('on');
  showMessage('تمت المزامنة التلقائية على 120 BPM');
};

let deckBPlaying=false;
document.querySelector('#deckBFile').onchange=event=>{const file=event.target.files[0];if(!file)return;audioB.src=URL.createObjectURL(file);audioB.load();document.querySelector('#deckBTitle').textContent=file.name.replace(/\.[^.]+$/,'');document.querySelector('#syncStatus').textContent='جاهز للتشغيل';document.querySelector('#deckBPlay').textContent='▶ PLAY B';deckBPlaying=false;updateMixVolumes();showMessage('تم تحميل الأغنية في Deck B')};
document.querySelector('#deckBPlay').onclick=async event=>{if(!audioB.src){showMessage('اضغط LOAD B واختر أغنية');return}if(deckBPlaying){audioB.pause();deckBPlaying=false;event.currentTarget.textContent='▶ PLAY B'}else{await audioB.play();deckBPlaying=true;event.currentTarget.textContent='❚❚ PAUSE B'}document.querySelector('#syncStatus').textContent=deckBPlaying?'Deck B يعمل الآن':'Deck B متوقف'};
audioB.onended=()=>{deckBPlaying=false;document.querySelector('#deckBPlay').textContent='▶ PLAY B';document.querySelector('#syncStatus').textContent='انتهت أغنية B'};
document.querySelector('#resetDj').onclick = () => { document.querySelector('#bass').value = document.querySelector('#mid').value = document.querySelector('#treble').value = 50; document.querySelector('#speed').value = 100; document.querySelector('#crossfader').value = 50; audio.playbackRate = video.playbackRate = 1; if(eqLow){eqLow.gain.value=eqMid.gain.value=eqHigh.gain.value=0;echoWet.gain.value=0} document.querySelector('#bpmLabel').textContent = '120 BPM'; };

function prepareVocalRemover() {
  if (audioContext) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContextClass();
  const source = audioContext.createMediaElementSource(audio);
  eqLow = audioContext.createBiquadFilter(); eqLow.type = 'lowshelf'; eqLow.frequency.value = 250;
  eqMid = audioContext.createBiquadFilter(); eqMid.type = 'peaking'; eqMid.frequency.value = 1200; eqMid.Q.value = .8;
  eqHigh = audioContext.createBiquadFilter(); eqHigh.type = 'highshelf'; eqHigh.frequency.value = 4000;
  echoDelay = audioContext.createDelay(1); echoDelay.delayTime.value = .28;
  echoWet = audioContext.createGain(); echoWet.gain.value = 0;
  const splitter = audioContext.createChannelSplitter(2);
  const merger = audioContext.createChannelMerger(2);
  normalGain = audioContext.createGain();
  vocalGainLeft = audioContext.createGain();
  vocalGainRight = audioContext.createGain();
  normalGain.gain.value = 1;
  vocalGainLeft.gain.value = 0;
  vocalGainRight.gain.value = 0;
  source.connect(eqLow).connect(eqMid).connect(eqHigh).connect(normalGain).connect(audioContext.destination);
  eqHigh.connect(echoDelay).connect(echoWet).connect(audioContext.destination);
  source.connect(splitter);
  splitter.connect(vocalGainLeft, 0);
  splitter.connect(vocalGainRight, 1);
  vocalGainLeft.connect(merger, 0, 0);
  vocalGainRight.connect(merger, 0, 0);
  vocalGainLeft.connect(merger, 0, 1);
  vocalGainRight.connect(merger, 0, 1);
  merger.connect(audioContext.destination);
}

document.querySelector('#vocalButton').onclick = async event => {
  if (!audio.src) { showMessage('شغّل أغنية أولًا لاستخدام فصل الصوت'); return; }
  prepareVocalRemover();
  await audioContext.resume();
  vocalRemoved = !vocalRemoved;
  normalGain.gain.value = vocalRemoved ? 0 : 1;
  vocalGainLeft.gain.value = vocalRemoved ? .7 : 0;
  vocalGainRight.gain.value = vocalRemoved ? -.7 : 0;
  event.target.classList.toggle('on', vocalRemoved);
  event.target.textContent = vocalRemoved ? 'VOCAL REMOVED' : 'REMOVE VOCAL';
  showMessage(vocalRemoved ? 'تم تقليل صوت المغني' : 'عاد الصوت الأصلي');
};

function setEqValue(id, node) { document.querySelector(id).oninput = event => { prepareVocalRemover(); node = id==='#bass'?eqLow:id==='#mid'?eqMid:eqHigh; node.gain.value=(event.target.value-50)*.24; event.target.parentElement.querySelector('span').textContent=Math.round(node.gain.value)+' dB'; }; }
setEqValue('#bass', eqLow); setEqValue('#mid', eqMid); setEqValue('#treble', eqHigh);
document.querySelectorAll('.sound-presets button').forEach(button => button.onclick = async () => { prepareVocalRemover(); await audioContext.resume(); const preset=button.dataset.preset,values=preset==='rock'?[68,46,64]:preset==='cave'?[72,35,28]:preset==='club'?[70,55,67]:[50,50,50]; ['#bass','#mid','#treble'].forEach((id,index)=>{const input=document.querySelector(id);input.value=values[index];input.dispatchEvent(new Event('input'))}); echoWet.gain.value=preset==='cave'?.38:0; document.querySelectorAll('.sound-presets button').forEach(x=>x.classList.toggle('on',x===button)); showMessage('تم تطبيق صوت '+button.textContent.trim()); });

let drumContext = null, tablaSample = null;
function getDrumContext() { if (!drumContext) drumContext = new (window.AudioContext || window.webkitAudioContext)(); drumContext.resume(); return drumContext; }
function playTabla() { const c=getDrumContext(); if(tablaSample){const s=c.createBufferSource();s.buffer=tablaSample;s.connect(c.destination);s.start();return} const o=c.createOscillator(),g=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(160,c.currentTime); o.frequency.exponentialRampToValueAtTime(55,c.currentTime+.18); g.gain.setValueAtTime(1,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.35); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+.36); }
function playRiq() { const c=getDrumContext(),b=c.createBuffer(1,c.sampleRate*.16,c.sampleRate),d=b.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length); const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(); f.type='highpass'; f.frequency.value=4200; g.gain.setValueAtTime(.65,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.16); s.buffer=b; s.connect(f).connect(g).connect(c.destination); s.start(); }
function flashPad(event){event.currentTarget.classList.add('hit');setTimeout(()=>event.currentTarget.classList.remove('hit'),100)}
document.querySelector('#riqPad').onclick = event => { playRiq(); flashPad(event); };
function playTablaTone(tone) { const c=getDrumContext(),o=c.createOscillator(),g=c.createGain(),settings={dum:[150,48,.42,1],tak:[430,180,.16,.65],ka:[310,105,.22,.75],sak:[220,70,.3,.85]}[tone]; o.type=tone==='tak'?'triangle':'sine'; o.frequency.setValueAtTime(settings[0],c.currentTime); o.frequency.exponentialRampToValueAtTime(settings[1],c.currentTime+settings[2]); g.gain.setValueAtTime(settings[3],c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+settings[2]); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+settings[2]); }
document.querySelectorAll('.tabla-zone').forEach(zone => zone.onclick = () => { playTablaTone(zone.dataset.tone); zone.classList.add('hit'); setTimeout(()=>zone.classList.remove('hit'),100); });
const scratchDisc=document.querySelector('#scratchDisc');let scratching=false,lastScratchAngle=0,vinylRotation=0,lastScratchSound=0;
function pointerAngle(event){const box=scratchDisc.getBoundingClientRect();return Math.atan2(event.clientY-(box.top+box.height/2),event.clientX-(box.left+box.width/2))*180/Math.PI}
function playScratchSound(movement){const now=Date.now();if(now-lastScratchSound<35)return;lastScratchSound=now;const c=getDrumContext(),length=Math.floor(c.sampleRate*.075),buffer=c.createBuffer(1,length,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();filter.type='bandpass';filter.frequency.value=500+Math.min(Math.abs(movement)*100,3500);filter.Q.value=1.6;gain.gain.setValueAtTime(Math.min(.75,.2+Math.abs(movement)/35),c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+.075);source.buffer=buffer;source.playbackRate.value=movement<0?.7:1.35;source.connect(filter).connect(gain).connect(c.destination);source.start()}
scratchDisc.onpointerdown=event=>{scratching=true;lastScratchAngle=pointerAngle(event);scratchDisc.setPointerCapture(event.pointerId);scratchDisc.classList.add('scratching')};
scratchDisc.onpointermove=event=>{if(!scratching)return;let difference=pointerAngle(event)-lastScratchAngle;if(difference>180)difference-=360;if(difference<-180)difference+=360;vinylRotation+=difference;scratchDisc.style.transform=`rotate(${vinylRotation}deg)`;playScratchSound(difference);lastScratchAngle=pointerAngle(event)};
scratchDisc.onpointerup=event=>{if(!scratching)return;scratching=false;scratchDisc.releasePointerCapture(event.pointerId);scratchDisc.classList.remove('scratching')};
const environmentSettings={normal:{eq:[50,50,50],echo:0,text:'صوت استوديو متوازن'},stadium:{eq:[58,46,58],echo:.75,text:'صدى ضخم ومتأخر مثل الاستاد'},hall:{eq:[55,58,54],echo:.32,text:'دفء وانعكاسات قاعة حفلات'},telephone:{eq:[5,72,5],echo:.08,text:'ترددات وسطية كراديو قديم'},underwater:{eq:[68,40,0],echo:.12,text:'صوت مكتوم وعميق تحت الماء'},bass:{eq:[100,46,50],echo:0,text:'تقوية قوية للـ Sub-Bass'},vocal:{eq:[42,84,60],echo:.06,text:'إبراز واضح لصوت المغني'}};
document.querySelector('#environmentPreset').onchange=async event=>{prepareVocalRemover();await audioContext.resume();const setting=environmentSettings[event.target.value];['#bass','#mid','#treble'].forEach((id,index)=>{const input=document.querySelector(id);input.value=setting.eq[index];input.dispatchEvent(new Event('input'))});echoWet.gain.value=setting.echo;document.querySelector('#presetDescription').textContent=setting.text;showMessage('تم تطبيق: '+event.target.options[event.target.selectedIndex].text)};

let micStream=null,micContext=null,micSource=null,micGain=null;
document.querySelector('#micButton').onclick=async event=>{
  if(micStream){micStream.getTracks().forEach(track=>track.stop());micStream=null;if(micSource)micSource.disconnect();event.currentTarget.classList.remove('on');document.querySelector('#micStatus').textContent='متوقف';showMessage('تم إيقاف الميكروفون');return}
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){document.querySelector('#micStatus').textContent='يحتاج localhost';showMessage('الميكروفون يحتاج تشغيل البرنامج عبر localhost');return}
  try{micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false}});micContext=new (window.AudioContext||window.webkitAudioContext)();micSource=micContext.createMediaStreamSource(micStream);micGain=micContext.createGain();micGain.gain.value=document.querySelector('#micVolume').value/100;micSource.connect(micGain).connect(micContext.destination);event.currentTarget.classList.add('on');document.querySelector('#micStatus').textContent='مباشر الآن';showMessage('الميكروفون يعمل — استخدم سماعات رأس')}catch(error){document.querySelector('#micStatus').textContent='لم يتم السماح';showMessage('اسمح للمتصفح باستخدام الميكروفون')}
};
document.querySelector('#micVolume').oninput=event=>{if(micGain)micGain.gain.value=event.target.value/100};
