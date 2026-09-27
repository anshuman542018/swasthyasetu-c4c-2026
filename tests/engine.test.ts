import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../src/data';
import {forecast,planTransfers,applyTransfer,federated,regression,backtest} from '../src/engine';
test('planned transfers conserve stock and protect each donor under all supported scenarios',()=>{
  for(const surge of [1,1.5,2,2.5]){let fs=seed();const total=fs.reduce((s,f)=>s+f.stock,0);const plans=planTransfers(fs,surge);for(const t of plans){assert.ok(t.units>0&&Number.isInteger(t.units));const from=fs.find(f=>f.id===t.from)!,to=fs.find(f=>f.id===t.to)!;assert.equal(from.state,to.state);assert.ok(t.hours<forecast(to,surge).days*24);fs=applyTransfer(fs,t,surge);assert.ok(fs.find(f=>f.id===t.from)!.stock>=forecast(from,surge).reserve);assert.equal(fs.reduce((s,f)=>s+f.stock,0),total);assert.ok(fs.every(f=>f.stock>=0));}}
});
test('approval rejects stale or oversized recommendations',()=>{const fs=seed(),t=planTransfers(fs)[0];assert.throws(()=>applyTransfer(fs,{...t,units:100000}));assert.throws(()=>applyTransfer(fs,{...t,units:-1}));const after=applyTransfer(fs,t);assert.throws(()=>applyTransfer(after,{...t,units:after.find(f=>f.id===t.from)!.stock}));});
test('federated coefficients equal centrally pooled regression without exchanging histories',()=>{const fs=seed(),m=federated(fs);const points=fs.flatMap(f=>f.history.map((y,x)=>({x,y})));const n=points.length,sx=points.reduce((s,p)=>s+p.x,0),sy=points.reduce((s,p)=>s+p.y,0),sxx=points.reduce((s,p)=>s+p.x*p.x,0),sxy=points.reduce((s,p)=>s+p.x*p.y,0);assert.ok(Math.abs(m.slope-(n*sxy-sx*sy)/(n*sxx-sx*sx))<1e-10);assert.equal(m.local.length,3);assert.ok(m.local.every(l=>!('history' in l)));});
test('forecast follows known trend; outbreak decreases cover',()=>{const f={...seed()[0],history:Array.from({length:28},(_,i)=>10+2*i)};const r=regression(f.history);assert.equal(r.slope,2);assert.equal(r.intercept,10);assert.equal(forecast(f).series[0],66);assert.ok(forecast(f,2).days<forecast(f).days);});
test('backtest evaluates last seven days with training on prior 21',()=>{const fs=seed().map(f=>({...f,history:Array.from({length:28},(_,i)=>5+3*i)}));const b=backtest(fs);assert.equal(b.n,84);assert.equal(b.mae,0);assert.equal(b.wape,0);});
test('no stock is dispatched after predicted runout',()=>{const fs=seed();fs[0].stock=0;assert.equal(planTransfers(fs).filter(t=>t.to===fs[0].id).length,0);});
