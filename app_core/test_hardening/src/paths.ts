import { dirname, join } from 'path';

import { fileURLToPath } from 'url';



const here = dirname(fileURLToPath(import.meta.url));



/** app_core/test_hardening */

export const testHardeningRoot = join(here, '..');

/** Repository root */

export const repoRoot = join(here, '..', '..', '..');


