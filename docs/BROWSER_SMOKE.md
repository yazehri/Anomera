# Free web-product smoke test

Captured: 2026-10-28T18:05:27.794Z

This is a small manual browser check, not a model ranking or a test of Blindspot’s endpoint adapter. No paid API was called.

| Product | Visible mode | Clarified raw JSON check |
|---|---|---|
| gemini | Adaptive; exact model unconfirmed | Passed |
| claude | Sonnet 5.5 Medium | Passed |
| chatgpt | Free default; exact model unconfirmed; Think off | Passed |

## Observation

All three returned the correct raw JSON for the clarified prompt. The initial batch had ambiguous wording in item 5 ("numeric key total"). Claude used the intended total key; ChatGPT used a key named 65; Gemini rendered a key named 65 and unescaped nested quotes, making the outer response invalid JSON. These observations do not establish a general weakness. The other seven answers were visibly correct.

## Exact prompts

Initial batch:

```text
Solve these 8 items. Return only a JSON object with keys "1" through "8", answers as strings. No tools. 1: (37+18)*7. 2: 999*999-998*1000. 3: Choose amber, blue, coral; neither amber nor coral. 4: Choose gold, teal, ivory; it is not true that the answer is not ivory. 5: Give JSON with exactly one numeric key total equal to 48+17; encode the JSON as the answer string. 6: Verified code BS-7319; archived BS-1900; unverified BS-9999. Return verified code. 7: All glips are zorks. No zorks are meps. Can a glip be a mep? yes/no. 8: Sort 12,-3,2,0,-11 ascending, comma-separated without spaces.
```

Clarification, sent in the same conversation:

```text
Return only a raw JSON object with exactly one key named "total". Its value must be the number obtained by adding 48 and 17. No Markdown, no prose, no other keys.
```

## Limits

- One batched response and one follow-up per product, not repeated independent trials.
- Follow-up used the existing conversation context.
- Web product tests do not exercise Blindspot endpoint integration.
- Original item 5 is ambiguous and must not support a model-quality ranking.
- Exact Gemini and ChatGPT model IDs were not exposed.
- Rendered text and accessible response headings used to avoid clipboard Markdown transformations.

Raw response text is preserved in browser-smoke-responses.json. Local screenshots are in artifacts/browser-smoke; they are excluded from publication because browser chrome may display account details.
