# CLO-61: Add fabric and weave education section

## Overview

For a site selling handloom sarees, there's nothing that explains the different weaves. A dedicated education section ("What is Banarasi?", "What makes Chanderi special?") converts curious browsers into informed buyers who understand the value.

## Acceptance Criteria

- [ ] "The Weave Library" section on homepage
- [ ] 4-5 weave types as cards: Banarasi, Chanderi, Kanchipuram, Tussar, Maheshwari
- [ ] Each card: weave name + origin + distinctive feature + link to category
- [ ] Clean, educational tone — not salesy
- [ ] CMS-driven — weave descriptions from Payload
- [ ] Mobile: horizontal scrollable strip

## Technical Notes

- New file: `src/components/homepage/WeaveLibrary.tsx`
- Update: `src/app/(frontend)/page.tsx` — add section
- Data: new Payload collection or hardcoded weave descriptions
