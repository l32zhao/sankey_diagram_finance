import test from 'node:test';
import assert from 'node:assert/strict';
import {templates,createProject,validate,layout} from '../model.js';
for(const key of Object.keys(templates))test(`${key}: valid template and proportional finite layout`,()=>{const p=validate(createProject(key));const result=layout(p);assert.equal(result.links.length,p.links.length);for(const n of result.nodes){assert.ok(Number.isFinite(n.y)&&n.y>=0&&n.y+n.h<=460);assert.ok(n.h>0);}for(const l of result.links){assert.ok(!l.path.includes('NaN'));assert.ok(l.h>0);}assert.equal(JSON.stringify(validate(JSON.parse(JSON.stringify(p)))),JSON.stringify(p));});
test('invalid imported data is rejected',()=>{for(const change of [p=>p.links[0].value=-1,p=>p.links[0].target='missing',p=>p.nodes[0].color='url(bad)',p=>p.assets=Infinity,p=>p.nodes[1].id=p.nodes[0].id]){const p=createProject();change(p);assert.throws(()=>validate(p));}});
test('center layout has outward flows on both sides',()=>{const p=createProject('center');const {nodes,links}=layout(p);const m=new Map(nodes.map(n=>[n.id,n]));assert.ok(links.some(l=>m.get(l.source).x>m.get(l.target).x));assert.ok(links.some(l=>m.get(l.source).x<m.get(l.target).x));});
