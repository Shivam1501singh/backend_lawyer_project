import json
import re

with open('scratch/bnss_raw_chunks.json') as f:
    pages = json.load(f)

CHAPTERS_DEF = [
    (1, 'I', 'PRELIMINARY', 1, 5),
    (2, 'II', 'CONSTITUTION OF CRIMINAL COURTS AND OFFICES', 6, 20),
    (3, 'III', 'POWER OF COURTS', 21, 29),
    (4, 'IV', 'POWERS OF SUPERIOR OFFICERS OF POLICE AND AID TO THE MAGISTRATES AND THE POLICE', 30, 34),
    (5, 'V', 'ARREST OF PERSONS', 35, 62),
    (6, 'VI', 'PROCESSES TO COMPEL APPEARANCE', 63, 93),
    (7, 'VII', 'PROCESSES TO COMPEL THE PRODUCTION OF THINGS', 94, 110),
    (8, 'VIII', 'RECIPROCAL ARRANGEMENTS FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND FORFEITURE OF PROPERTY', 111, 124),
    (9, 'IX', 'SECURITY FOR KEEPING THE PEACE AND FOR GOOD BEHAVIOUR', 125, 143),
    (10, 'X', 'ORDER FOR MAINTENANCE OF WIVES, CHILDREN AND PARENTS', 144, 147),
    (11, 'XI', 'MAINTENANCE OF PUBLIC ORDER AND TRANQUILLITY', 148, 167),
    (12, 'XII', 'PREVENTIVE ACTION OF THE POLICE', 168, 172),
    (13, 'XIII', 'INFORMATION TO THE POLICE AND THEIR POWERS TO INVESTIGATE', 173, 196),
    (14, 'XIV', 'JURISDICTION OF THE CRIMINAL COURTS IN INQUIRIES AND TRIALS', 197, 209),
    (15, 'XV', 'CONDITIONS REQUISITE FOR INITIATION OF PROCEEDINGS', 210, 222),
    (16, 'XVI', 'COMPLAINTS TO MAGISTRATES', 223, 226),
    (17, 'XVII', 'COMMENCEMENT OF PROCEEDINGS BEFORE MAGISTRATES', 227, 233),
    (18, 'XVIII', 'THE CHARGE', 234, 247),
    (19, 'XIX', 'TRIAL BEFORE A COURT OF SESSION', 248, 260),
    (20, 'XX', 'TRIAL OF WARRANT-CASES BY MAGISTRATES', 261, 273),
    (21, 'XXI', 'TRIAL OF SUMMONS-CASES BY MAGISTRATES', 274, 282),
    (22, 'XXII', 'SUMMARY TRIALS', 283, 288),
    (23, 'XXIII', 'PLEA BARGAINING', 289, 300),
    (24, 'XXIV', 'ATTENDANCE OF PERSONS CONFINED OR DETAINED IN PRISONS', 301, 306),
    (25, 'XXV', 'EVIDENCE IN INQUIRIES AND TRIALS', 307, 336),
    (26, 'XXVI', 'GENERAL PROVISIONS AS TO INQUIRIES AND TRIALS', 337, 366),
    (27, 'XXVII', 'PROVISIONS AS TO ACCUSED PERSONS OF UNSOUND MIND', 367, 378),
    (28, 'XXVIII', 'PROVISIONS AS TO OFFENCES AFFECTING THE ADMINISTRATION OF JUSTICE', 379, 391),
    (29, 'XXIX', 'THE JUDGMENT', 392, 406),
    (30, 'XXX', 'SUBMISSION OF DEATH SENTENCES FOR CONFIRMATION', 407, 412),
    (31, 'XXXI', 'APPEALS', 413, 435),
    (32, 'XXXII', 'REFERENCE AND REVISION', 436, 445),
    (33, 'XXXIII', 'TRANSFER OF CRIMINAL CASES', 446, 452),
    (34, 'XXXIV', 'EXECUTION, SUSPENSION, REMISSION AND COMMUTATION OF SENTENCES', 453, 477),
    (35, 'XXXV', 'PROVISIONS AS TO BAIL AND BONDS', 478, 496),
    (36, 'XXXVI', 'DISPOSAL OF PROPERTY', 497, 505),
    (37, 'XXXVII', 'IRREGULAR PROCEEDINGS', 506, 512),
    (38, 'XXXVIII', 'LIMITATION FOR TAKING COGNIZANCE OF CERTAIN OFFENCES', 513, 519),
    (39, 'XXXIX', 'MISCELLANEOUS', 520, 531)
]

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
        if not t_clean or (x == 0 and y <= 0) or y > 775 or y < 45:
            continue
        if 'GAZETTE OF INDIA' in text or 'EXTRAORDINARY' in text or '____' in text or 'REGISTERED' in text:
            continue
        if 'MGIPMRND' in text or 'DIWAKAR SINGH' in text or 'Joint Secretary' in text or 'UPLOADED BY' in text or 'PUBLISHED BY' in text or 'CG-DL' in text or 'xxx' in text:
            continue
        if g_page == 1 and y > 240:
            continue
        if re.search(r'^\s*\d+\s+of\s+\d{4}\.?\s*$', t_clean):
            continue
        if t_clean in ['Sec. 1]', '[Part II—', 'PART II — Section 1']:
            continue

        if is_odd and x > 470:
            m_chunks.append(ch)
        elif not is_odd and x < 115:
            m_chunks.append(ch)
        elif 110 <= x <= 470:
            main_chunks.append(ch)

    # Margin blocks
    m_chunks.sort(key=lambda c: (-c['y'], c['x'], c['idx']))
    m_lines = []
    cur = []
    for c in m_chunks:
        if not cur:
            cur.append(c)
        else:
            if abs(c['y'] - cur[-1]['y']) < 4:
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
        if txt.isdigit() or txt in ['[Part II—', 'Sec. 1]', str(g_page)]:
            continue
        if not txt:
            continue
            
        if not cur_block:
            cur_block = [(line_y, txt)]
        else:
            prev_y = cur_block[-1][0]
            if (prev_y - line_y) <= 15:
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
        b_txt = re.sub(r'\s*—$', '', b_txt).strip(' .')
        formatted_blocks.append({'y_top': b[0][0], 'y_bot': b[-1][0], 'text': b_txt})

    marginal_blocks_by_page.append(formatted_blocks)

    # Main lines
    main_chunks.sort(key=lambda c: (-c['y'], c['x'], c['idx']))
    lines = []
    cur = []
    for c in main_chunks:
        if not cur:
            cur.append(c)
        else:
            if abs(c['y'] - cur[-1]['y']) < 4:
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
            if txt and not txt.endswith(' ') and not t.startswith(' ') and not t.startswith('.') and not t.startswith(',') and not t.startswith(';') and not t.startswith(':') and not t.startswith(')') and not txt.endswith('('):
                txt += ' ' + t
            else:
                txt += t
        txt = re.sub(r'\s+', ' ', txt).strip()
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
        if next_sec > 531:
            break

raw_sections = {}
for s in range(1, 532):
    start_idx = sec_starts[s]
    end_idx = sec_starts[s + 1] if s < 531 else len(all_main_lines)
    lines = []
    for k in range(start_idx, end_idx):
        line_txt = all_main_lines[k]['text']
        if line_txt.strip().isdigit():
            continue
        if re.match(r'^(CHAPTER\s+[IVXLCDM]+|[A-Z\s,—–\.]+)$', line_txt.strip()) and any(ch[2] in line_txt.strip() for ch in CHAPTERS_DEF):
            continue
        if re.match(r'^(CHAPTER\s+[IVXLCDM]+)$', line_txt.strip()):
            continue
        if re.match(r'^[A-Z]\.—[A-Za-z\s]+$', line_txt.strip()):
            continue
        lines.append(line_txt)
    raw_sections[s] = lines

def clean_title(s):
    s = re.sub(r'(\s*\.?\s*\d+)+\s*$', '', s)
    s = re.sub(r'\[Part II—|Sec\. 1\]|PART II — Section 1', '', s)
    return s.strip(' .')

titles = {}
for s in range(1, 532):
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
    text = '\n'.join(processed_lines)
    text = re.sub(r'sub-\s+section', 'sub-section', text)
    text = re.sub(r'audio-\s+video', 'audio-video', text)
    return text.strip()

final_dataset = []
for s in range(1, 532):
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
        'metaDescription': f'The Bharatiya Nagarik Suraksha Sanhita, 2023 Section {s} - {title}',
        'metaTitle': f'Section {s} - The Bharatiya Nagarik Suraksha Sanhita, 2023'
    }
    final_dataset.append(item)

with open('prisma/bnssBearerActData.json', 'w', encoding='utf-8') as f:
    json.dump(final_dataset, f, indent=2, ensure_ascii=False)

with open('prisma/bnssBearerActData.js', 'w', encoding='utf-8') as f:
    f.write('// BNSS Bearer Act Data with Full Chapter and Section Structure\n')
    f.write('export const bnssBearerActSections = ')
    json.dump(final_dataset, f, indent=2, ensure_ascii=False)
    f.write(';\n')

print(f'Successfully built and saved {len(final_dataset)} BNSS sections!')
