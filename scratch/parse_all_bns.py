import json
import re

def main():
    with open('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/scratch/raw_chunks.json') as f:
        pages = json.load(f)

    # 1. Extract marginal lines and main lines for each page
    marginal_by_page = []
    main_by_page = []

    for p_idx, page in enumerate(pages):
        g_page = p_idx + 1
        is_odd = (g_page % 2 == 1)

        m_chunks = []
        main_chunks = []

        for ch in page:
            x, y, text = ch['x'], ch['y'], ch['text']
            if x == 0 and y == 0:
                continue
            # ignore header
            if y < 180 and ('GAZETTE OF INDIA' in text or 'EXTRAORDINARY' in text or 'REGISTERED' in text or 'PART II' in text or 'P ART II' in text or 'Sec.' in text):
                continue
            # ignore bottom footer / publisher info
            if '______' in text or 'MGIPMRND' in text or 'DIWAKAR SINGH' in text or 'Joint Secretary' in text or 'UPLOADED BY' in text or 'PUBLISHED BY' in text or 'Kshitiz' in text or 'Mohan' in text or 'CG-DL' in text or 'xxx' in text:
                continue
            # ignore Hindi Gazette preamble on page 1
            if g_page == 1 and y < 1100:
                continue
            # ignore standalone Act citations like '40 of 2019.'
            if re.search(r'^\s*\d+\s+of\s+\d{4}\.?\s*$', text.strip()):
                continue

            if is_odd:
                if x > 980:
                    m_chunks.append(ch)
                elif 230 <= x <= 980:
                    main_chunks.append(ch)
            else:
                if x < 230:
                    m_chunks.append(ch)
                elif 230 <= x <= 980:
                    main_chunks.append(ch)

        # Group marginal chunks into lines
        m_chunks.sort(key=lambda c: (c['y'], c['x']))
        m_lines = []
        cur = []
        for c in m_chunks:
            if not cur:
                cur.append(c)
            else:
                if abs(c['y'] - cur[-1]['y']) < 6:
                    cur.append(c)
                else:
                    m_lines.append(cur)
                    cur = [c]
        if cur:
            m_lines.append(cur)

        page_m_lines = []
        for l in m_lines:
            line_y = sum(c['y'] for c in l) / len(l)
            txt = ' '.join(c['text'].strip() for c in l)
            txt = re.sub(r'\s+', ' ', txt).strip()
            if txt:
                page_m_lines.append({'page': g_page, 'y': line_y, 'text': txt})
        marginal_by_page.append(page_m_lines)

        # Group main chunks into lines
        main_chunks.sort(key=lambda c: (c['y'], c['x']))
        main_lines = []
        cur = []
        for c in main_chunks:
            if not cur:
                cur.append(c)
            else:
                if abs(c['y'] - cur[-1]['y']) < 6:
                    cur.append(c)
                else:
                    main_lines.append(cur)
                    cur = [c]
        if cur:
            main_lines.append(cur)

        page_main_lines = []
        for l in main_lines:
            line_y = sum(c['y'] for c in l) / len(l)
            txt = ''
            for c in l:
                t = c['text']
                if txt and not txt.endswith(' ') and not t.startswith(' ') and not t.startswith('(') and not txt.endswith('('):
                    txt += ' ' + t
                else:
                    txt += t
            txt = re.sub(r'\s+', ' ', txt).strip()
            if txt:
                page_main_lines.append({'page': g_page, 'y': line_y, 'text': txt})
        main_by_page.append(page_main_lines)

    # Reconstruct continuous main text and locate each section start
    all_main_lines = []
    for p_lines in main_by_page:
        all_main_lines.extend(p_lines)

    # Let's find each section boundary in all_main_lines
    section_indices = {} # sec_num -> index in all_main_lines
    next_expected_sec = 1

    for idx, l in enumerate(all_main_lines):
        txt = l['text']
        # Check if line starts with next_expected_sec
        # E.g. '1. (1)', '2. In this', '111. (1)', '358. (1)'
        pattern = rf'^{next_expected_sec}\s*\.\s*(.*)'
        m = re.match(pattern, txt)
        if m:
            section_indices[next_expected_sec] = idx
            next_expected_sec += 1
            if next_expected_sec > 358:
                break
        else:
            # Also check if line has 'CHAPTER ...' before or something
            # Or if line is just '111.' or '144.'
            pattern2 = rf'^{next_expected_sec}\.\s*$'
            if re.match(pattern2, txt):
                section_indices[next_expected_sec] = idx
                next_expected_sec += 1
                if next_expected_sec > 358:
                    break

    print(f'Located {len(section_indices)}/358 section boundaries in main lines.')
    missing = [i for i in range(1, 359) if i not in section_indices]
    if missing:
        print('Missing section indices:', missing)

    # Group headings per section
    # For section i: starting at line all_main_lines[section_indices[i]]
    # It has page = start_line['page'], y = start_line['y']
    sec_headings = {}
    for sec_num in range(1, 359):
        if sec_num not in section_indices:
            continue
        start_idx = section_indices[sec_num]
        start_line = all_main_lines[start_idx]
        s_page = start_line['page']
        s_y = start_line['y']

        # Determine y threshold for next section on the same page
        next_s_y = 999999
        if sec_num + 1 in section_indices:
            next_start_line = all_main_lines[section_indices[sec_num + 1]]
            if next_start_line['page'] == s_page:
                next_s_y = next_start_line['y']

        # Collect marginal notes for this page in range [s_y - 25, next_s_y - 5]
        p_m_lines = marginal_by_page[s_page - 1]
        matching_m = [m['text'] for m in p_m_lines if (s_y - 25) <= m['y'] < (next_s_y - 5)]
        h_text = ' '.join(matching_m)
        h_text = re.sub(r'\s+', ' ', h_text).strip()
        sec_headings[sec_num] = h_text

    # Extract raw text for each section
    raw_sections = {}
    for sec_num in range(1, 359):
        if sec_num not in section_indices:
            continue
        start_idx = section_indices[sec_num]
        if sec_num == 358:
            end_idx = len(all_main_lines)
        else:
            end_idx = section_indices[sec_num + 1]

        sec_lines = [all_main_lines[k]['text'] for k in range(start_idx, end_idx)]
        
        # Remove chapter headers if they appear right before the next section at the end of sec_lines
        cleaned_lines = []
        for sl in sec_lines:
            # check if line is CHAPTER heading or 'Of ...' heading that belongs to next section/chapter
            # e.g., 'CHAPTER II', 'OF PUNISHMENTS', 'Of abetment', 'CHAPTER III', etc.
            if re.match(r'^(CHAPTER\s+[IVXLCDM]+|OF\s+[A-Z\s,]+|Of\s+[a-z\s,]+)$', sl.strip()):
                continue
            cleaned_lines.append(sl)

        raw_sections[sec_num] = cleaned_lines

    # Let's inspect headings and section text
    print('Raw extraction complete. Writing inspection data...')
    with open('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/scratch/inspected_headings.json', 'w') as f:
        json.dump(sec_headings, f, indent=2)

if __name__ == '__main__':
    main()
