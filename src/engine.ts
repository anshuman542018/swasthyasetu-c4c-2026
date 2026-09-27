import type {Facility} from './data';
export type Forecast={daily:number;upper:number;days:number;need:number;reserve:number;trend:number;uncertainty:number;series:number[];risk:'critical'|'watch'|'stable'};
export type Transfer={id:string;from:string;to:string;units:number;km:number;hours:number;reason:string};
export function regression(history:number[]){
  const n=history.length,x=(n-1)/2,y=history.reduce((a,b)=>a+b,0)/n;
  const denom=history.reduce((s,_,i)=>s+(i-x)**2,0);
  const slope=denom?history.reduce((s,v,i)=>s+(i-x)*(v-y),0)/denom:0;
  const intercept=y-slope*x;
  const rmse=Math.sqrt(history.reduce((s,v,i)=>s+(v-(intercept+slope*i))**2,0)/n);
  return {slope,intercept,rmse,n};
}
export function forecast(f:Facility,surge=1):Forecast {
  const m=regression(f.history),series=Array.from({length:14},(_,i)=>Math.max(1,(m.intercept+m.slope*(m.n+i))*surge));
  const daily=series.reduce((a,b)=>a+b,0)/14,upper=Math.ceil(daily+1.64*m.rmse*surge);
  const days=f.stock/upper,reserve=upper*14,need=Math.max(0,upper*7-f.stock);
  return {daily,upper,days,need,reserve,trend:m.slope,uncertainty:m.rmse,series,risk:days<7?'critical':days<14?'watch':'stable'};
}
export function distance(a:Facility,b:Facility){const rad=Math.PI/180,dlat=(a.lat-b.lat)*rad,dlon=(a.lon-b.lon)*rad;const h=Math.sin(dlat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dlon/2)**2;return Math.round(6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*1.3);}
export function planTransfers(fs:Facility[],surge=1){
  const remaining=new Map(fs.map(f=>[f.id,f.stock])); const plans:Transfer[]=[];
  const recipients=[...fs].filter(f=>forecast(f,surge).need>0).sort((a,b)=>forecast(a,surge).days-forecast(b,surge).days);
  for(const to of recipients){let need=forecast(to,surge).need;const donors=fs.filter(f=>f.id!==to.id&&f.state===to.state).sort((a,b)=>distance(a,to)-distance(b,to));
    for(const from of donors){const available=Math.max(0,(remaining.get(from.id)||0)-forecast(from,surge).reserve);const units=Math.min(need,available);const km=distance(from,to),hours=2+km/35;
      if(units<=0||hours>=forecast(to,surge).days*24)continue;
      remaining.set(from.id,(remaining.get(from.id)||0)-units);remaining.set(to.id,(remaining.get(to.id)||0)+units);need-=units;
      plans.push({id:`${from.id}-${to.id}-${plans.length}`,from:from.id,to:to.id,units,km,hours,reason:`Protect 7 days at recipient; retain 14 days at donor. ${from.district!==to.district?'Cross-district redistribution.':'Within-district redistribution.'}`});if(need<=0)break;
    }
  }return plans;
}
export function applyTransfer(fs:Facility[],t:Transfer,surge=1){
  const from=fs.find(f=>f.id===t.from),to=fs.find(f=>f.id===t.to);
  if(!from||!to||!Number.isInteger(t.units)||t.units<=0||from.stock-t.units<forecast(from,surge).reserve)throw new Error('Transfer no longer satisfies donor safety reserve. Recalculate the plan.');
  return fs.map(f=>f.id===from.id?{...f,stock:f.stock-t.units,updated:new Date().toISOString()}:f.id===to.id?{...f,stock:f.stock+t.units,updated:new Date().toISOString()}:f);
}
// Each state shares sufficient statistics for a common linear model, never facility histories.
export function federated(fs:Facility[]){
  const local=[...new Set(fs.map(f=>f.state))].map(state=>{const points=fs.filter(f=>f.state===state).flatMap(f=>f.history.map((y,x)=>({x,y})));return{state,n:points.length,sx:points.reduce((s,p)=>s+p.x,0),sy:points.reduce((s,p)=>s+p.y,0),sxx:points.reduce((s,p)=>s+p.x*p.x,0),sxy:points.reduce((s,p)=>s+p.x*p.y,0)};});
  const sums=local.reduce((a,b)=>({n:a.n+b.n,sx:a.sx+b.sx,sy:a.sy+b.sy,sxx:a.sxx+b.sxx,sxy:a.sxy+b.sxy}),{n:0,sx:0,sy:0,sxx:0,sxy:0});
  const denom=sums.n*sums.sxx-sums.sx*sums.sx,slope=denom?(sums.n*sums.sxy-sums.sx*sums.sy)/denom:0;
  return {local,slope,intercept:(sums.sy-slope*sums.sx)/sums.n};
}
export function backtest(fs:Facility[]){let error=0,actual=0,count=0;for(const f of fs){const m=regression(f.history.slice(0,21));f.history.slice(21).forEach((v,i)=>{error+=Math.abs(v-Math.max(1,m.intercept+m.slope*(21+i)));actual+=v;count++;});}return{wape:actual?error/actual*100:0,mae:count?error/count:0,n:count};}
