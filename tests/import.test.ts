import test from 'node:test';
import assert from 'node:assert/strict';
import {seed} from '../src/data';
import {validateOperationalImport,officialBaseline} from '../src/public-data';
const fixture=()=>({schemaVersion:'1.0',synthetic:false,source:'Authorized test fixture - not actual health records',asOf:'2026-09-27',medicine:'ORS sachets',facilities:seed().slice(0,2)});
test('import preserves reported values and strips unexpected fields',()=>{const input=fixture();const output=validateOperationalImport(input);assert.equal(output.facilities.length,2);assert.equal(output.facilities[0].stock,input.facilities[0].stock);assert.equal(output.synthetic,false);});
test('rejects simulated records, invalid capacity, duplicate IDs and short histories',()=>{assert.throws(()=>validateOperationalImport({...fixture(),synthetic:true}));const a=fixture();a.facilities[0].occupied=999;assert.throws(()=>validateOperationalImport(a));const b=fixture();b.facilities[1].id=b.facilities[0].id;assert.throws(()=>validateOperationalImport(b));const c=fixture();c.facilities[0].history=[];assert.throws(()=>validateOperationalImport(c));});
test('published public baseline retains reporting date and government source',()=>{assert.equal(officialBaseline.asOf,'2023-03-31');assert.ok(officialBaseline.source.startsWith('https://www.pib.gov.in/'));});
