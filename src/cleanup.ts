import { env } from './env.ts'

const t = {
  'en-us': {
    blockquote_note: 'Note:',
    blockquote_tip: 'Tip:',
    blockquote_important: 'Important:',
    blockquote_warning: 'Warning:',
    blockquote_caution: 'Caution:',
    deprecated_header: 'Deprecated: This feature is no longer recommended.',
    nonstandard_header: 'Non-standard: This feature is not standardized.',
    secure_context_header: 'Secure context: This feature is available only in secure contexts (HTTPS)',
    available_in_workers: 'Note: This feature is available in Web Workers.',
    available_in_workers_service: 'Note: This feature is only available in Service Workers.',
    available_in_workers_dedicated: 'Note: This feature is only available in Dedicated Web Workers.',
    available_in_workers_window_and_service: 'Note: This feature is available in Service Workers.',
    available_in_workers_window_and_dedicated: 'Note: This feature is available in Dedicated Web Workers.',
    available_in_workers_worker_except_service: 'Note: This feature is only available in Web Workers, except for Service Workers.',
    available_in_workers_window_and_worker_except_service: 'Note: This feature is available in Web Workers, except for Service Workers.',
    available_in_workers_window_and_worker_except_shared: 'Note: This feature is available in Web Workers, except for Shared Web Workers.',
    secure_context_inline: '(secure context)',
    optional_inline: '(optional)',
    deprecated_inline: '(deprecated)',
    experimental_inline: '(experimental)',
    nonstandard_inline: '(non-standard)',
    read_only_inline: '(read only)'
  }
}

// 🙈
// https://github.com/mdn/rari/tree/main/crates/rari-doc/src/templ/templs
export const cleanupText = (text: string): string => {
  const result = text
    .replaceAll('\n', ' ')
    .replaceAll('}}{{', '}} {{')
    .replaceAll('[!NOTE]', t[env.MDN_DATASET_LOCALE].blockquote_note)
    .replaceAll('[!TIP]', t[env.MDN_DATASET_LOCALE].blockquote_tip)
    .replaceAll('[!IMPORTANT]', t[env.MDN_DATASET_LOCALE].blockquote_important)
    .replaceAll('[!WARNING]', t[env.MDN_DATASET_LOCALE].blockquote_warning)
    .replaceAll('[!CAUTION]', t[env.MDN_DATASET_LOCALE].blockquote_caution)
    .replaceAll(/{{\s*Deprecated_Header[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].deprecated_header)
    .replaceAll(/{{\s*Non-standard_Header[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].nonstandard_header)
    .replaceAll(/{{\s*SecureContext_Header[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].secure_context_header)
    .replaceAll(/{{\s*AvailableInWorkers[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers)
    .replaceAll(/{{\s*AvailableInWorkers\(['"]service['"]\)\s*}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers_service)
    .replaceAll(/{{\s*AvailableInWorkers\(['"]dedicated['"]\)\s*}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers_dedicated)
    .replaceAll(/{{\s*AvailableInWorkers\(['"]window_and_service['"]\)\s*}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers_window_and_service)
    .replaceAll(/{{\s*AvailableInWorkers\(['"]window_and_dedicated['"]\)\s*}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers_window_and_dedicated)
    .replaceAll(/{{\s*AvailableInWorkers\(['"]worker_except_service['"]\)\s*}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers_worker_except_service)
    .replaceAll(/{{\s*AvailableInWorkers\(['"]window_and_worker_except_service['"]\)\s*}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers_window_and_worker_except_service)
    .replaceAll(/{{\s*AvailableInWorkers\(['"]window_and_worker_except_shared['"]\)\s*}}/gi, t[env.MDN_DATASET_LOCALE].available_in_workers_window_and_worker_except_shared)
    .replaceAll(/{{\s*SecureContext_Inline[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].secure_context_inline)
    .replaceAll(/{{\s*optional_inline[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].optional_inline)
    .replaceAll(/{{\s*deprecated_inline[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].deprecated_inline)
    .replaceAll(/{{\s*experimental_inline[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].experimental_inline)
    .replaceAll(/{{\s*non-standard_inline[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].nonstandard_inline)
    .replaceAll(/{{\s*ReadOnlyInline[^}]*?}}/gi, t[env.MDN_DATASET_LOCALE].read_only_inline)
    .replaceAll(/{{\s*(?:\w+ref|Glossary|HTMLElement|HTTPHeader|HTTPMethod|SVGElement|MathMLElement|SVGAttr|CSP|LiveSampleLink)\s*\(\s*"[^"]+?",\s*"([^"]+?)"[^}]*?}}/gi, '\`$1\`')
    .replaceAll(/{{\s*(?:\w+ref|Glossary|HTMLElement|HTTPHeader|HTTPMethod|SVGElement|MathMLElement|SVGAttr|CSP|LiveSampleLink)\s*\(\s*'[^']+?',\s*'([^']+?)'[^}]*?}}/gi, '\`$1\`')
    .replaceAll(/{{\s*(?:\w+ref|Glossary|HTMLElement|HTTPHeader|HTTPMethod|SVGElement|MathMLElement|SVGAttr|CSP|LiveSampleLink)\s*\(\s*"([^"]+?)"[^}]*?}}/gi, '\`$1\`')
    .replaceAll(/{{\s*(?:\w+ref|Glossary|HTMLElement|HTTPHeader|HTTPMethod|SVGElement|MathMLElement|SVGAttr|CSP|LiveSampleLink)\s*\(\s*'([^']+?)'[^}]*?}}/gi, '\`$1\`')
    .replaceAll(/{{\s*HTTPStatus\s*\(\s*(\d+?)[^}]*?}}/gi, '\`$1\`')
    .replaceAll(/{{\s*HTTPStatus\s*\(\s*"([^"]+?)"[^}]*?}}/gi, '\`$1\`')
    .replaceAll(/{{\s*HTTPStatus\s*\(\s*'([^']+?)'[^}]*?}}/gi, '\`$1\`')
    .replaceAll(/{{\s*RFC\s*\(\s*(\d+?)[^}]*?}}/gi, 'RFC $1')
    .replaceAll(/{{\s*RFC\s*\(\s*"([^"]+?)"[^}]*?}}/gi, 'RFC $1')
    .replaceAll(/{{\s*RFC\s*\(\s*'([^']+?)'[^}]*?}}/gi, 'RFC $1')
    .replaceAll(/{{\s*(?:DefaultAPISidebar|APIRef|APIListAlpha|JSRef|CSS_Ref|CSSInfo|SVGInfo|SeeCompatTable|EmbedLiveSample|EmbedGHLiveSample|EmbedYouTube|InteractiveExample|ListSubPages|js_property_attributes|Previous|Next|SubpagesWithSummaries|InheritanceDiagram)[^}]*?}}\s*/gi, '')
    // .replace(/^For more (?:examples|details|information), see .+/, '')

  if (/{{[^}]+?}}/.test(result)) {
    throw new Error(`Text is not cleaned up: ${result}`)
  }

  return result
}
