import json
import re

with open('scratch/bsa_raw_chunks.json') as f:
    pages = json.load(f)

CHAPTERS_DEF = [
    (1, 'I', 'PRELIMINARY', 1, 2),
    (2, 'II', 'RELEVANCY OF FACTS', 3, 50),
    (3, 'III', 'FACTS WHICH NEED NOT BE PROVED', 51, 53),
    (4, 'IV', 'OF ORAL EVIDENCE', 54, 55),
    (5, 'V', 'OF DOCUMENTARY EVIDENCE', 56, 93),
    (6, 'VI', 'OF THE EXCLUSION OF ORAL EVIDENCE BY DOCUMENTARY EVIDENCE', 94, 103),
    (7, 'VII', 'OF THE BURDEN OF PROOF', 104, 120),
    (8, 'VIII', 'ESTOPPEL', 121, 123),
    (9, 'IX', 'OF WITNESSES', 124, 139),
    (10, 'X', 'OF EXAMINATION OF WITNESSES', 140, 168),
    (11, 'XI', 'OF IMPROPER ADMISSION AND REJECTION OF EVIDENCE', 169, 169),
    (12, 'XII', 'REPEAL AND SAVINGS', 170, 170)
]

SUBHEADINGS_TO_FILTER = [
    'Closely connected facts',
    'Admissions',
    'Statements by persons who cannot be called as witnesses',
    'Statements made under special circumstances',
    'How much of a statement is to be proved',
    'Judgments of Courts when relevant',
    'Opinions of third persons when relevant',
    'Character when relevant',
    'Special provisions as to evidence relating to electronic record',
    'Public documents',
    'Private documents',
    'Public and private documents',
    'Presumptions as to documents',
    'PRODUCTION AND EFFECT OF EVIDENCE',
    'Of the burden of proof',
    'THE SCHEDULE',
    '[See section 63(4)(c)]',
    'CERTIFICATE',
    'PART A',
    '(To be filled by the Party)',
    'PART B',
    '(To be filled by the Expert)'
]

def normalize_heading(s):
    s = s.upper()
    s = re.sub(r'\bP\s+ART\b', 'PART', s)
    s = re.sub(r'\bSA\s+VINGS\b', 'SAVINGS', s)
    s = re.sub(r'\bEXAMINA\s+TION\b', 'EXAMINATION', s)
    s = re.sub(r'\bDOCUMENT\s+ARY\b', 'DOCUMENTARY', s)
    s = re.sub(r'\bRELEV\s+ANCY\b', 'RELEVANCY', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

chapter_for_sec = {}
for ch_no, ch_rom, ch_name, start_s, end_s in CHAPTERS_DEF:
    for s in range(start_s, end_s + 1):
        chapter_for_sec[s] = (ch_no, ch_rom, ch_name)

marginal_blocks_by_page = []
all_main_lines = []

for p_idx, page in enumerate(pages):
    g_page = p_idx + 1
    is_odd = (g_page % 2 == 1)

    m_chunks = []
    main_chunks = []

    for idx, ch in enumerate(page):
        ch['idx'] = idx
        x, y, text = ch['x'], ch['y'], ch['text']
        t_clean = text.strip()
        if not t_clean or (x == 0 and y <= 0) or t_clean == '_':
            continue
        if 'GAZETTE OF INDIA' in text or 'EXTRAORDINARY' in text or 'REGISTERED' in text:
            continue
        if 'MGIPMRND' in text or 'DIWAKAR SINGH' in text or 'Joint Secretary' in text or 'UPLOADED BY' in text or 'PUBLISHED BY' in text or 'CG-DL' in text or 'Digitally signed' in text or 'Kshitiz Mohan' in text:
            continue
        if g_page == 1 and y < 1400 and ('THE BHARATIYA' in text.upper() or 'NO. 47 OF 2023' in text or 'December' in text or 'An Act to consolidate' in text or 'for fair trial' in text or 'BE it enacted' in text or 'follows:' in text or 'follows:—' in text or 'PART I' in text.upper() or 'CHAPTER I' in text or 'PRELIMINARY' in text):
            continue
        if re.search(r'^\s*\d+\s+of\s+\d{4}\.?\s*$', t_clean):
            continue
        if t_clean in ['Sec. 1]', '[Part II—', 'PART II — Section 1', 'SEC. 1]']:
            continue
        if y < 165:
            continue

        if is_odd and x > 950:
            m_chunks.append(ch)
        elif not is_odd and x < 230:
            m_chunks.append(ch)
        elif 230 <= x <= 950:
            main_chunks.append(ch)

    # Margin blocks
    m_chunks.sort(key=lambda c: (c['y'], c['x'], c['idx']))
    m_lines = []
    cur = []
    for c in m_chunks:
        if not cur:
            cur.append(c)
        else:
            if abs(c['y'] - cur[-1]['y']) < 8:
                cur.append(c)
            else:
                cur.sort(key=lambda x: (x['x'], x['idx']))
                m_lines.append(cur)
                cur = [c]
    if cur:
        cur.sort(key=lambda x: (x['x'], x['idx']))
        m_lines.append(cur)

    blocks = []
    cur_block = []
    for l in m_lines:
        line_y = sum(c['y'] for c in l) / len(l)
        txt = ' '.join(c['text'].strip() for c in l)
        txt = re.sub(r'\s+', ' ', txt).strip()
        if txt in ['[Part II—', 'Sec. 1]', 'SEC. 1]', str(g_page)]:
            continue
        if not txt:
            continue
            
        if not cur_block:
            cur_block = [(line_y, txt)]
        else:
            prev_y = cur_block[-1][0]
            if (line_y - prev_y) <= 22:
                cur_block.append((line_y, txt))
            else:
                blocks.append(cur_block)
                cur_block = [(line_y, txt)]
    if cur_block:
        blocks.append(cur_block)

    formatted_blocks = []
    for b in blocks:
        b_txt = ' '.join(t for _, t in b)
        b_txt = re.sub(r'\(\s+([0-9a-zA-ZivxLCDM]+)\s*\)', r'(\1)', b_txt)
        b_txt = re.sub(r'\s*-\s*', '-', b_txt)
        b_txt = re.sub(r'\s*—$', '', b_txt).strip(' .')
        formatted_blocks.append({'y_top': b[0][0], 'y_bot': b[-1][0], 'text': b_txt})

    marginal_blocks_by_page.append(formatted_blocks)

    # Main lines
    main_chunks.sort(key=lambda c: (c['y'], c['x'], c['idx']))
    lines = []
    cur = []
    for c in main_chunks:
        if not cur:
            cur.append(c)
        else:
            if abs(c['y'] - cur[-1]['y']) < 8:
                cur.append(c)
            else:
                cur.sort(key=lambda x: (x['x'], x['idx']))
                lines.append(cur)
                cur = [c]
    if cur:
        cur.sort(key=lambda x: (x['x'], x['idx']))
        lines.append(cur)

    for l in lines:
        line_y = sum(c['y'] for c in l) / len(l)
        txt = ''
        for c in l:
            t = c['text']
            if txt and txt.endswith('to c') and t == 'ivil':
                txt += 'ivil'
            elif txt and txt.endswith('civil p') and t.startswith('rocedure'):
                txt += t
            elif txt and not txt.endswith(' ') and not t.startswith(' ') and not t.startswith('.') and not t.startswith(',') and not t.startswith(';') and not t.startswith(':') and not t.startswith(')') and not txt.endswith('('):
                txt += ' ' + t
            else:
                txt += t
        txt = re.sub(r'\s+', ' ', txt).strip()
        txt = re.sub(r'\bc\s+ivil\b', 'civil', txt)
        txt = re.sub(r'\bp\s+rocedure\b', 'procedure', txt)
        txt = re.sub(r'\bsub-\s+section\b', 'sub-section', txt)
        txt = re.sub(r'\baudio-\s+video\b', 'audio-video', txt)
        if txt and txt != str(g_page):
            all_main_lines.append({'page': g_page, 'y': line_y, 'text': txt})

sec_starts = {}
next_sec = 1
for idx, l in enumerate(all_main_lines):
    txt = l['text']
    m = re.match(rf'^{next_sec}\s*\.\s*(.*)', txt)
    if m:
        sec_starts[next_sec] = idx
        next_sec += 1
        if next_sec > 170:
            break

raw_sections = {}
for s in range(1, 171):
    start_idx = sec_starts[s]
    end_idx = sec_starts[s + 1] if s < 170 else len(all_main_lines)
    lines = []
    for k in range(start_idx, end_idx):
        line = all_main_lines[k]
        if s == 170 and line['page'] >= 46:
            break
        line_txt = line['text']
        if line_txt.strip().isdigit():
            continue
        t_norm = normalize_heading(line_txt)
        if re.match(r'^(PART\s+[IVXLCDM]+|CHAPTER\s+[IVXLCDM]+)', t_norm):
            continue
        if any(ch[2] in t_norm for ch in CHAPTERS_DEF):
            continue
        if any(normalize_heading(sub) == t_norm for sub in SUBHEADINGS_TO_FILTER):
            continue
        if 'THE SCHEDULE' in t_norm or '[SEE SECTION' in t_norm:
            break
        lines.append(line_txt)
    raw_sections[s] = lines

def clean_title(s):
    s = re.sub(r'\[Part II—|Sec\. 1\]|PART II — Section 1|SEC\. 1\]', '', s)
    return s.strip(' .')

titles = {}
for s in range(1, 171):
    idx = sec_starts[s]
    line = all_main_lines[idx]
    p_num = line['page']
    s_y = line['y']

    blocks = marginal_blocks_by_page[p_num - 1]
    if blocks:
        best_b = min(blocks, key=lambda b: abs(b['y_top'] - s_y))
        titles[s] = clean_title(best_b['text'])
    else:
        titles[s] = ''

def clean_desc(lines, s):
    if not lines:
        return ''
    first_line = lines[0]
    first_line = re.sub(rf'^{s}\s*\.\s*', '', first_line)
    processed_lines = [first_line] + lines[1:]
    
    # Strip any trailing headings
    while processed_lines:
        last_norm = normalize_heading(processed_lines[-1])
        if any(normalize_heading(sub) == last_norm for sub in SUBHEADINGS_TO_FILTER):
            processed_lines.pop()
        elif re.match(r'^(PART\s+[IVXLCDM]+|CHAPTER\s+[IVXLCDM]+|[A-Z\s,–—]+)$', last_norm) and any(ch[2] in last_norm for ch in CHAPTERS_DEF):
            processed_lines.pop()
        elif re.match(r'^(PART\s+[IVXLCDM]+|CHAPTER\s+[IVXLCDM]+)$', last_norm):
            processed_lines.pop()
        else:
            break
        
    text = '\n'.join(processed_lines)
    return text.strip()

final_dataset = []
for s in range(1, 171):
    ch_no, ch_rom, ch_name = chapter_for_sec[s]
    title = titles[s]
    desc = clean_desc(raw_sections[s], s)
    
    item = {
        'section': f'Section {s}',
        'sectionNo': str(s),
        'chapterNo': ch_no,
        'chapterRoman': ch_rom,
        'chapterName': ch_name,
        'title': title,
        'description': desc,
        'metaData': f'Chapter {ch_rom} {ch_name}',
        'metaDescription': f'The Bharatiya Sakshya Adhiniyam, 2023 Section {s} - {title}',
        'metaTitle': f'Section {s} - The Bharatiya Sakshya Adhiniyam, 2023'
    }
    final_dataset.append(item)

with open('prisma/bsaBearerActData.json', 'w', encoding='utf-8') as f:
    json.dump(final_dataset, f, indent=2, ensure_ascii=False)

with open('prisma/bsaBearerActData.js', 'w', encoding='utf-8') as f:
    f.write('// BSA Bearer Act Data with Full Chapter and Section Structure\n')
    f.write('export const bsaBearerActSections = ')
    json.dump(final_dataset, f, indent=2, ensure_ascii=False)
    f.write(';\n')

print(f'Successfully built and saved {len(final_dataset)} BSA sections!')
