import test from 'node:test';
import assert from 'node:assert/strict';
import {authorSuite,parseSuite} from '../lib/research';
test('authored suites preserve checks and reject invalid or duplicate cases',async()=>{
 const c={family:'Context retrieval',prompt:'Return the policy code.',expected:'A12',rule:'exact'};
 const suite=await authorSuite('Policy',[c]);
 assert.equal((await parseSuite(suite)).probes[0].expected,'A12');
 assert.equal(suite.sourceRunId,'developer-authored');
 await assert.rejects(()=>authorSuite('Policy',[c,c]),/duplicate/);
 await assert.rejects(()=>authorSuite('Policy',[{...c,rule:'number'}]));
 await assert.rejects(()=>authorSuite('Policy',[]));
});
