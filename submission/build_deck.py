from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from PIL import Image
import textwrap

ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'output'/'pdf'; OUT.mkdir(parents=True,exist_ok=True)
pdfmetrics.registerFont(TTFont('Segoe','C:/Windows/Fonts/segoeui.ttf'))
pdfmetrics.registerFont(TTFont('SegoeBold','C:/Windows/Fonts/segoeuib.ttf'))
W,H=960,540
c=canvas.Canvas(str(OUT/'SwasthyaSetu-pitch.pdf'),pagesize=(W,H))
c.setTitle('SwasthyaSetu - PHC supply resilience - Code for Communities 2.0')
c.setAuthor('Anshuman Pandey')
INK='#183c35';GREEN='#2b7d61';MUTED='#728476';PALE='#f4f7ee';LIME='#b3e5ae'
def text(x,y,s,size=14,bold=False,color=INK):
    c.setFillColor(HexColor(color));c.setFont('SegoeBold' if bold else 'Segoe',size);c.drawString(x,y,s)
def wrap(x,y,s,width=72,size=14,line=23,color=MUTED):
    for row in textwrap.wrap(s,width=width): text(x,y,row,size,color=color);y-=line
    return y
def frame(n,kicker,title,subtitle=''):
    c.setFillColor(HexColor(PALE));c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(HexColor(INK));c.rect(0,H-9,W,9,fill=1,stroke=0)
    text(46,493,'SWASTHYASETU / '+kicker.upper(),10,True,GREEN)
    text(46,448,title,30,True)
    if subtitle:wrap(46,419,subtitle,110,12,18)
    c.setStrokeColor(HexColor('#dce6d7'));c.line(46,40,914,40)
    text(46,23,'Code for Communities 2.0 | Track 3 | Original prototype, September 2026',9,color=MUTED)
    text(876,23,f'{n:02d} / 12',9,color=MUTED)
def bullet(y,title,body,x=46,width=72):
    text(x,y,title,16,True);return wrap(x,y-26,body,width,12,20)-30
def card(x,y,w,h,title,body):
    c.setFillColor(HexColor('#ffffff'));c.roundRect(x,y,w,h,10,fill=1,stroke=0)
    text(x+18,y+h-29,title,16,True);wrap(x+18,y+h-55,body,int(w/7.1),12,19)
def shot(name,x,y,w,h):
    image=Image.open(ROOT/'screenshots'/name).convert('RGB')
    # Show the verified top portion at a readable aspect ratio; full captures are in the repository.
    target=w/h;cropheight=min(image.height,int(image.width/target));image=image.crop((0,0,image.width,cropheight))
    image.thumbnail((1400,1000));c.drawImage(ImageReader(image),x,y,w,h)
def end():c.showPage()

frame(1,'Community health, connected','The right supplies. Before they are needed.','SwasthyaSetu - anticipate medicine shortages and coordinate safe redistribution across PHC networks.')
text(48,338,'A decision workflow for district coordinators',20,True)
wrap(48,301,'Connect medicine inventory, beds and workforce. Forecast shortages. Match nearby donors. Approve and reconcile transfers. Explain the evidence with Google Gemini.',55,16,27)
card(560,122,353,237,'12 PHCs / 3 states','Odisha, Andhra Pradesh and West Bengal. Realistic synthetic data, one medicine: ORS sachets. Executable working prototype, not an official health-system integration.')
text(48,88,'Anshuman Pandey | Track 3: Smart Health & Supply Chain Resilience',12,color=GREEN);end()

frame(2,'Problem','Stock exists. Care still runs short.','Track 3 targets fragmented resource visibility, emergency stock-outs and weak cross-district coordination.')
card(46,128,273,242,'01 / Fragmented visibility','Medicine stocks, bed availability and staff attendance need one inspectable operational picture.')
card(343,128,273,242,'02 / Late warnings','A stock count alone cannot tell a coordinator whether supplies will survive tomorrow\'s demand surge.')
card(640,128,273,242,'03 / Unsafe transfers','Moving stock without protecting the donor simply shifts the shortage to another community.')
text(46,88,'Primary user: district supply coordinator. Beneficiaries: PHC teams and the communities they serve.',12,color=GREEN);end()

frame(3,'Solution','Close the loop from warning to action.','An end-to-end workflow with inspectable calculations and human approval.')
for i,(t,b) in enumerate([('SEE','Stock, beds and staff'),('PREDICT','14-day demand outlook'),('MATCH','Safe donor-recipient routes'),('APPROVE','Human review + ledger')]):
    x=46+i*221;card(x,195,202,166,f'{i+1:02d} / {t}',b)
    if i<3:text(x+207,270,'>',16,True,GREEN)
wrap(46,153,'Gemini explains the actual computed plan in English, Hindi, Odia, Telugu or Bengali. Inventory changes are controlled by code, never by generated text.',110,14,24);end()

frame(4,'Working prototype','One shared picture of community capacity.','Realistic synthetic snapshots in three state networks. No patient-level data.')
shot('01-overview.png',46,92,610,295)
bullet(355,'12 connected PHCs','Medicine stock, beds and staff attendance.',682,28)
bullet(245,'5 baseline warnings','Coverage below seven days. Baseline synthetic scenario only.',682,28)
bullet(130,'Operator control','Editable snapshots and JSON export.',682,28);end()

frame(5,'Prediction','An early warning you can inspect.','Transparent local forecasts with a conservative planning buffer and an outbreak stress test.')
y=bullet(350,'Local demand forecast','Fit a least-squares trend to 28 daily reports. Forecast the next 14 days. Adjust demand by an operator-selected outbreak multiplier.')
y=bullet(y,'Coverage and shortage','Planning daily demand = horizon mean + 1.64 x residual RMSE. Cover = available stock / planning demand. This buffer is a heuristic, not a calibrated probability interval.')
bullet(y,'Evaluate before deployment','Train on days 1-21; hold out days 22-28. Validate actual alert quality and stockout outcomes with district data before operational use.')
end()

frame(6,'Redistribution','Protect the donor. Prioritize the recipient.','The constraint engine reserves 14 days at the donor and targets seven days at the recipient.')
shot('03-transfer-plan.png',46,92,590,295)
bullet(355,'965 sachets / 5 routes','Baseline synthetic allocation. Nearby same-state donors ranked by distance.',662,31)
bullet(225,'Arrival feasibility','Exclude routes arriving after predicted runout. Distance and travel time are approximate.',662,31)
bullet(99,'227-sachet dispatch','The first approved transfer updates stock and the ledger.',662,31);end()

frame(7,'Google AI','Gemini translates evidence into coordination.','Meaningful Google AI: grounded multilingual explanation of shortages and computed transfer proposals.')
card(46,170,270,195,'INPUT','Facility IDs, aggregate stock and coverage, free beds, staff present and feasible routes. No patient data.')
card(343,170,270,195,'GOOGLE GEMINI','A concise operations brief in five languages: urgency, redistribution, unresolved needs and verification steps.')
card(640,170,273,195,'SAFETY BOUNDARY','Gemini is advisory. It cannot approve dispatches, edit inventory, invent clinical guidance or claim real deliveries.')
wrap(46,123,'Integration is implemented through the Gemini API. A valid key must be connected and a live generation verified before final submission. No canned AI answer is substituted.',110,12,21);end()

frame(8,'Federation','Share model statistics, not facility histories.','An executable state-level sufficient-statistics simulation, with clear production boundaries.')
shot('05-federation.png',46,91,610,296)
bullet(355,'5 numbers per state','n, sum(x), sum(y), sum(x squared), sum(x times y).',682,28)
bullet(240,'Exact shared trend','Aggregated coefficients match centrally pooled linear regression.',682,28)
bullet(120,'Prototype boundary','All nodes run in one browser. Secure aggregation and independent deployment are future pilot work.',682,28);end()

frame(9,'Validation','Evidence we can reproduce today.','Measured on synthetic fixtures. No claim of real-world prediction accuracy or prevented patient harm.')
for x,t,b in [(46,'7.9% WAPE','Chronological holdout, 84 observations.'),(343,'2.8 sachets MAE','Mean absolute error per PHC per day.'),(640,'6 engine tests','Stock conservation, reserve safety, stale-plan rejection, federation parity, trend forecast and holdout logic.')]:card(x,170,273,195,t,b)
wrap(46,124,'The browser walkthrough verified approval -> stock reconciliation -> ledger entry. Test all supported outbreak scenarios. A real pilot must compare against a warehouse-only allocation baseline.',110,12,21);end()

frame(10,'Depth and reach','Scale the contract, then the infrastructure.','Designed for Indian states, with a localization path for other BRICS contexts.')
y=bullet(350,'Interoperable operations','Versioned facility snapshots, common medicine identifiers and aggregate model payloads. Extend beyond ORS only after batch, expiry and medicine-specific demand validation.')
y=bullet(y,'State-owned nodes','Production proposal: Firebase authentication; independent Cloud Run services; BigQuery aggregate monitoring. Keep state facility histories local with secure aggregation and governance review.')
bullet(y,'Cross-border applicability','Localize facility registries, languages, medicine catalogues, approval authority and privacy rules. Adapt the same coordination workflow; do not assume identical health systems.')
end()

frame(11,'Pilot and impact','Make the first district measurable.','Proposed pilot sequence, not an implemented government rollout or validated impact claim.')
for i,(t,b) in enumerate([('CONNECT','One district, consented historical consumption and warehouse data.'),('SHADOW TEST','Measure WAPE, alert precision, stockout days and donor-reserve violations.'),('CONTROLLED PILOT','Add batches, expiry, authorization and dispatch/receipt confirmation.'),('EXPAND','Independent state nodes, secure aggregation and drift monitoring.')]):card(46+i*221,171,202,195,f'{i+1:02d} / {t}',b)
wrap(46,123,'Success criterion: fewer stockout days without increasing donor shortages, compared with a documented baseline. Choose targets with the pilot partner after measuring existing performance.',110,12,21);end()

frame(12,'Deployability','A working foundation for care without gaps.','Public source, live prototype and reproducible methods. Built during this hackathon.')
text(46,354,'Try the prototype',18,True,GREEN)
text(46,324,'anshuman542018.github.io/swasthyasetu-c4c-2026/',13)
c.linkURL('https://anshuman542018.github.io/swasthyasetu-c4c-2026/',(46,316,670,344),relative=0)
text(46,280,'Inspect the code',18,True,GREEN)
text(46,250,'github.com/anshuman542018/swasthyasetu-c4c-2026',13)
c.linkURL('https://github.com/anshuman542018/swasthyasetu-c4c-2026',(46,242,670,272),relative=0)
wrap(46,197,'Current boundaries: synthetic records, browser-local persistence, approximate routes, one medicine and simulated federation. Valid Gemini key and live AI demonstration required before submission.',110,12,21)
text(46,113,'References: official Hack2skill challenge; Google Gemini API; NHM; data.gov.in.',11,color=MUTED)
text(46,89,'Tooling licenses: Vite/tsx MIT; TypeScript Apache-2.0; project MIT. No official endorsement.',10,color=MUTED)
end();c.save()
print(OUT/'SwasthyaSetu-pitch.pdf')
