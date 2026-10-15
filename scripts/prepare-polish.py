from pathlib import Path
from PIL import Image
import numpy as np
from scipy import ndimage
import json, shutil, wave
root=Path(__file__).resolve().parents[1]; assets=root/'dist/assets'
for source in assets.glob('*.png'):
 Image.open(source).save(source.with_suffix('.webp'),lossless=True)
layouts={'characters':('characters',4,3),'extras':('extras',4,3),'novaMotion':('nova-motion',4,3),'sylMotion':('syl-motion',4,3),'novaReady':('nova-ready',4,3),'sylJump':('syl-jump',4,1),'brawl':('brawl-motion',4,2),'novaUnarmed':('nova-unarmed',4,2),'sylUnarmed':('syl-unarmed',4,2),'fantasy':('fantasy',4,1),'residents':('residents',4,3),'beachGuests':('beach-guests',4,1),'summonMotion':('summon-motion',4,2),'terrain':('terrain',3,2)}
out={}
for key,(name,cols,rows) in layouts.items():
 im=Image.open(assets/(name+'.png')).convert('RGBA'); alpha=np.array(im)[:,:,3];frames=[]
 percolumn=[]
 for col in range(cols):
  x0=round(col*im.width/cols);x1=round((col+1)*im.width/cols)
  labels,n=ndimage.label(alpha[:,x0:x1]>32);sizes=np.bincount(labels.ravel());sizes[0]=0
  components=sorted(np.argsort(sizes)[-rows:],key=lambda i:np.where(labels==i)[0].min())
  column=[]
  for component in components:
   ys,xs=np.where(labels==component);column.append({'x':int(x0+xs.min()),'y':int(ys.min()),'w':int(xs.max()-xs.min()+1),'h':int(ys.max()-ys.min()+1)})
  percolumn.append(column)
 frames=[percolumn[col][row] for row in range(rows) for col in range(cols)]
 out[key]={'width':im.width,'height':im.height,'base':frames[0]['h'],'frames':frames}
(root/'dist/frame-bounds.js').write_text('const SPRITE_BOUNDS='+json.dumps(out,separators=(',',':'))+';\n')
# Original deterministic chiptune loops and effects, no external audio dependency.
sr=22050; audio=assets/'audio';audio.mkdir(exist_ok=True)
def write(name,data):
 data=np.clip(data,-1,1)
 with wave.open(str(audio/(name+'.wav')),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes((data*32767).astype('<i2').tobytes())
def voice(freq,dur,amp=.2):
 t=np.arange(round(sr*dur))/sr; env=np.minimum(t/.012,1)*np.minimum((dur-t)/.08,1)
 return amp*env*(np.sin(2*np.pi*freq*t)+.22*np.sin(4*np.pi*freq*t))
for name,bpm,notes,bass in [('stealth',104,[64,67,71,67,62,66,69,66,60,64,67,64,59,62,66,62],[40,38,36,35]),('forest',92,[69,72,76,74,71,74,77,76,67,71,74,72,64,67,71,69],[45,47,43,40]),('tavern',120,[62,66,69,74,72,69,66,64,62,66,69,71,69,66,64,62],[38,43,45,38])]:
 beat=60/bpm; dur=beat*32;data=np.zeros(round(sr*dur));rng=np.random.default_rng(42)
 for i in range(64):
  start=round(i*beat*.5*sr);n=notes[i%16];v=voice(440*2**((n-69)/12),beat*.42,.14);data[start:start+len(v)]+=v
 for i in range(32):
  start=round(i*beat*sr);n=bass[(i//4)%4];v=voice(440*2**((n-69)/12),beat*.8,.17);data[start:start+len(v)]+=v
  t=np.arange(round(.1*sr))/sr;drum=.12*np.sin(2*np.pi*(80*t-220*t*t))*np.exp(-35*t) if i%2==0 else .04*rng.normal(size=len(t))*np.exp(-40*t);data[start:start+len(drum)]+=drum
 write(name,data)
for name,dur in [('shot',.12),('punch',.17),('bow',.22),('cloak',.65),('magic',.65),('step',.05),('pickup',.25),('hurt',.25)]:
 t=np.arange(round(sr*dur))/sr;rng=np.random.default_rng(7);noise=rng.normal(size=len(t));env=np.exp(-t/(dur/4))
 if name=='shot':data=(noise*.22+np.sin(2*np.pi*120*t)*.2)*env
 elif name in ['punch','hurt','step']:data=(np.sin(2*np.pi*(90*t-90*t*t))*.4+noise*.08)*env
 elif name=='bow':data=(np.sin(2*np.pi*(850*t-1600*t*t))*.18+noise*.07)*env
 else:data=.18*np.sin(2*np.pi*(220*t+350*t*t))*np.sin(np.pi*t/dur)**2
 write(name,data)
print('Prepared frame bounds, three art atlases, three music loops and eight effects.')
