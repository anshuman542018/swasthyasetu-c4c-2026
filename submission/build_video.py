from pathlib import Path
import json,subprocess,wave,textwrap
from PIL import Image,ImageDraw,ImageFont,ImageOps
import imageio_ffmpeg

root=Path(__file__).resolve().parent
work=root.parent/'tmp'/'video';work.mkdir(parents=True,exist_ok=True)
segments=json.loads((root/'narration.json').read_text())
ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',21)
bold=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',31)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',15)
total=0
for i,s in enumerate(segments):
    src=Image.open(root/'screenshots'/s['image']).convert('RGB')
    # Readable viewport extracted from the actual verified full-page screenshot.
    crop_h=min(src.height,int(src.width/1.76))
    y=0 if s['focus']=='top' else max(0,src.height-crop_h)
    src=src.crop((0,y,src.width,y+crop_h))
    out=Image.new('RGB',(1280,800),'#102e30');d=ImageDraw.Draw(out)
    d.text((35,22),'SWASTHYASETU / VERIFIED PROTOTYPE WALKTHROUGH',font=small,fill='#a5d8ae')
    d.text((35,48),s['title'],font=bold,fill='#eef8ee')
    out.paste(ImageOps.fit(src,(1210,655)),(35,103))
    d.text((35,774),'Synthetic data | Narrated screenshot walkthrough | Draft: live Gemini segment required',font=small,fill='#b4c7b5')
    frame=work/f'frame-{i:02}.png';out.save(frame)
    audio=root/'audio'/f'segment-{i:02}.wav'
    with wave.open(str(audio),'rb') as wav: duration=wav.getnframes()/wav.getframerate()+1
    total+=duration
    subprocess.run([ffmpeg,'-y','-loop','1','-i',str(frame),'-i',str(audio),'-t',str(duration),'-vf','scale=1280:800','-r','15','-c:v','libx264','-tune','stillimage','-preset','fast','-crf','24','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-af','apad','-movflags','+faststart',str(work/f'clip-{i:02}.mp4')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
(work/'concat.txt').write_text('\n'.join(f"file '{(work/f'clip-{i:02}.mp4').as_posix()}'" for i in range(len(segments))))
dest=root/'SwasthyaSetu-demo-draft.mp4'
subprocess.run([ffmpeg,'-y','-f','concat','-safe','0','-i',str(work/'concat.txt'),'-c','copy','-movflags','+faststart',str(dest)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print(f'Video: {dest}; duration {total:.1f} seconds; bytes {dest.stat().st_size}')
