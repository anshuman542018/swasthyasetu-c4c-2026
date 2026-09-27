import type {Facility} from './data';

// Published administrative counts, not invented facility-level measurements.
export const officialBaseline={
  asOf:'2023-03-31',published:'2024-09-09',
  source:'https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=2053070&lang=2&reg=48',
  publisher:'Ministry of Health and Family Welfare, Government of India',
  values:[
    {label:'Primary health centres',value:31882},
    {label:'Community health centres',value:6359},
    {label:'Sub-centres',value:169615},
    {label:'District hospitals',value:714},
    {label:'Sub-divisional hospitals',value:1340},
    {label:'Medical colleges',value:362},
    {label:'Doctors / medical officers at PHCs',value:40583},
    {label:'Staff nurses at PHCs',value:47932}
  ]
};
export type OperationalImport={schemaVersion:'1.0';synthetic:false;source:string;asOf:string;medicine:'ORS sachets';facilities:Facility[]};
export function validateOperationalImport(value:unknown):OperationalImport{
  const v=value as OperationalImport;
  if(!v||v.schemaVersion!=='1.0'||v.synthetic!==false||v.medicine!=='ORS sachets'||typeof v.source!=='string'||v.source.trim().length<3||typeof v.asOf!=='string'||!Number.isFinite(Date.parse(v.asOf)))throw new Error('Provide schemaVersion 1.0, synthetic false, source, valid asOf date and medicine ORS sachets.');
  if(!Array.isArray(v.facilities)||v.facilities.length<1||v.facilities.length>500)throw new Error('Import between 1 and 500 facilities.');
  const ids=new Set<string>();
  for(const f of v.facilities){
    if(!f||[f.id,f.name,f.state,f.district].some(s=>typeof s!=='string'||!s.trim()||s.length>120||/[<>"`&]/.test(s))||!/^[A-Za-z0-9_-]+$/.test(f.id)||ids.has(f.id))throw new Error('Each facility needs unique id, name, state and district, without HTML markup.');
    ids.add(f.id);
    if(!Number.isFinite(f.lat)||f.lat<6||f.lat>38||!Number.isFinite(f.lon)||f.lon<68||f.lon>98)throw new Error(`${f.id}: provide valid coordinates in India.`);
    if(![f.stock,f.beds,f.occupied,f.staff,f.present].every(n=>Number.isInteger(n)&&n>=0&&n<=1e6)||f.occupied>f.beds||f.present>f.staff)throw new Error(`${f.id}: invalid stock, bed capacity or staffing.`);
    if(!Array.isArray(f.history)||f.history.length!==28||!f.history.every(n=>Number.isInteger(n)&&n>=0&&n<=1e6)||typeof f.updated!=='string'||!Number.isFinite(Date.parse(f.updated)))throw new Error(`${f.id}: provide 28 daily consumption counts and a valid updated timestamp.`);
  }
  return {schemaVersion:'1.0',synthetic:false,source:v.source.trim(),asOf:v.asOf,medicine:'ORS sachets',facilities:v.facilities.map(f=>({id:f.id,name:f.name,district:f.district,state:f.state,lat:f.lat,lon:f.lon,stock:f.stock,beds:f.beds,occupied:f.occupied,staff:f.staff,present:f.present,history:[...f.history],updated:f.updated}))};
}
export function publicDataPage(esc:(v:string)=>string){return `<div class="section-intro"><div><h2>Real public data. Traceable sources.</h2><p>Official national infrastructure and workforce counts; reference date 31 March 2023.</p></div><span class="badge stable">Verified published statistics</span></div><section class="panel prose"><h3>India's public healthcare network</h3><p>Source: ${officialBaseline.publisher}. Health Dynamics of India 2022–23, published 9 September 2024. Rural and urban facilities combined. These are historical administrative totals, not today's stock, occupancy or attendance.</p><a href="${officialBaseline.source}" target="_blank" rel="noopener">Read the original government release ↗</a></section><div class="metrics">${officialBaseline.values.map(v=>`<div class="metric"><span>${v.label}</span><strong>${v.value.toLocaleString('en-IN')}</strong><p>Official reported count · as of 31 March 2023</p></div>`).join('')}</div><section class="panel prose"><h3>Connect actual facility operations</h3><p>The public totals above cannot reveal medicine stocks at individual PHCs. Connect an authorized inventory export to use actual stock, bed occupancy, workforce and daily consumption in the forecasting workflow. Imported values are marked as user-reported; we cannot independently verify their origin.</p><p>Format: JSON, schema version 1.0, medicine ORS sachets, source and reporting date, and 28 daily consumption counts per facility. Do not include patients, personal identifiers or API keys.</p><label>Import authorized facility records<input type="file" id="real-import" accept="application/json,.json"></label><p><a href="./data/operational-schema.json" target="_blank" rel="noopener">Download the blank schema ↗</a></p><div id="import-result" role="status"></div><p class="fine">Import replaces the local operational workspace and clears the simulated dispatch ledger. It does not upload the file to a server. Imported records persist only in this browser. Approvals remain simulated movements.</p></section><section class="panel prose"><h3>External weather feed</h3><p>Fetch current model-based weather estimates for Bhubaneswar, Visakhapatnam and Kolkata from Open-Meteo. This is logistics context, not PHC inventory, an official disaster alert or a clinical demand prediction.</p><button class="primary" id="weather-refresh">Fetch current weather context</button><div id="weather-output" class="weather-output" aria-live="polite">No weather request made yet.</div><p class="fine">Open-Meteo weather model data, CC BY 4.0. <a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener">Provider documentation</a>. No Gemini key is required for this feed.</p></section><section class="panel prose"><h3>Where to add your Gemini key</h3><p>Open <button class="text-button" data-page="copilot">Gemini briefing</button>, expand <strong>Connect Google AI for this session</strong>, paste your key into the password field and click <strong>Generate operations brief</strong>. Your key stays in memory and is sent only to Google.</p><p>Gemini generates explanations of the supplied evidence. It does not grant access to e-Aushadhi, HMIS or other protected health-system feeds. Those require their own authorized data integration.</p></section>`;}
export async function loadWeather(){
  const url='https://api.open-meteo.com/v1/forecast?latitude=20.2961,17.6868,22.5726&longitude=85.8245,83.2185,88.3639&current=temperature_2m,precipitation,wind_speed_10m&timezone=Asia%2FKolkata';
  const response=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error(`Weather provider returned ${response.status}.`);
  const values=await response.json();if(!Array.isArray(values)||values.length!==3||values.some(v=>!v.current||!Number.isFinite(v.current.temperature_2m)||!Number.isFinite(v.current.precipitation)||!Number.isFinite(v.current.wind_speed_10m)))throw new Error('Weather response incomplete; no fallback values were inserted.');
  return values.map((v,i)=>({city:['Bhubaneswar','Visakhapatnam','Kolkata'][i],time:v.current.time,temperature:v.current.temperature_2m,rain:v.current.precipitation,wind:v.current.wind_speed_10m}));
}
