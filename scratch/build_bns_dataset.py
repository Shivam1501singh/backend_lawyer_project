import json
import re

def clean_text(t):
    if not t:
        return None
    # Fix spacing artifacts from PDF extraction while preserving exact words
    t = re.sub(r'[ \t]+', ' ', t)
    t = re.sub(r' \n', '\n', t)
    t = re.sub(r'\n ', '\n', t)
    t = re.sub(r'\n{3,}', '\n\n', t)
    return t.strip()

def build_bns_dataset():
    with open('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/scratch/raw_chunks.json') as f:
        pages = json.load(f)

    # 1. Extract main lines and marginal lines with coordinates
    all_main_lines = []
    marginal_by_page = []

    for p_idx, page in enumerate(pages):
        g_page = p_idx + 1
        is_odd = (g_page % 2 == 1)

        main_chunks = []
        margin_chunks = []

        for ch in page:
            x, y, text = ch['x'], ch['y'], ch['text']
            if x == 0 and y == 0:
                continue
            if y < 180 and ('GAZETTE OF INDIA' in text or 'EXTRAORDINARY' in text or 'REGISTERED' in text or 'PART II' in text or 'P ART II' in text or 'Sec.' in text):
                continue
            if '______' in text or 'MGIPMRND' in text or 'DIWAKAR SINGH' in text or 'Joint Secretary' in text or 'UPLOADED BY' in text or 'PUBLISHED BY' in text or 'Kshitiz' in text or 'Mohan' in text or 'CG-DL' in text or 'xxx' in text:
                continue
            if g_page == 1 and y < 1100:
                continue
            if re.search(r'^\s*\d+\s+of\s+\d{4}\.?\s*$', text.strip()):
                continue

            if is_odd:
                if x > 980:
                    margin_chunks.append(ch)
                elif 230 <= x <= 980:
                    main_chunks.append(ch)
            else:
                if x < 230:
                    margin_chunks.append(ch)
                elif 230 <= x <= 980:
                    main_chunks.append(ch)

        # Marginal lines
        margin_chunks.sort(key=lambda c: (c['y'], c['x']))
        m_lines = []
        cur = []
        for c in margin_chunks:
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

        page_m = []
        for l in m_lines:
            line_y = sum(c['y'] for c in l) / len(l)
            txt = ' '.join(c['text'].strip() for c in l)
            txt = re.sub(r'\s+', ' ', txt).strip()
            if txt:
                page_m.append({'y': line_y, 'text': txt})
        marginal_by_page.append(page_m)

        # Main lines
        main_chunks.sort(key=lambda c: (c['y'], c['x']))
        lines = []
        cur = []
        for c in main_chunks:
            if not cur:
                cur.append(c)
            else:
                if abs(c['y'] - cur[-1]['y']) < 6:
                    cur.append(c)
                else:
                    cur.sort(key=lambda x: x['x'])
                    lines.append(cur)
                    cur = [c]
        if cur:
            cur.sort(key=lambda x: x['x'])
            lines.append(cur)

        for l in lines:
            line_y = sum(c['y'] for c in l) / len(l)
            txt = ''
            for c in l:
                t = c['text']
                if txt and not txt.endswith(' ') and not t.startswith(' ') and not t.startswith('.') and not t.startswith(',') and not t.startswith(';') and not t.startswith(':'):
                    txt += ' ' + t
                else:
                    txt += t
            txt = re.sub(r'\s+', ' ', txt).strip()
            all_main_lines.append({'page': g_page, 'y': line_y, 'text': txt})

    # Locate section starts
    sec_starts = {}
    next_sec = 1
    for idx, l in enumerate(all_main_lines):
        txt = l['text']
        m = re.match(rf'^{next_sec}\s*\.\s*(.*)', txt)
        if m:
            sec_starts[next_sec] = idx
            next_sec += 1
            if next_sec > 358:
                break

    print(f'Located {len(sec_starts)}/358 sections.')

    # Collect raw text lines per section
    raw_sections = {}
    for s in range(1, 359):
        start_idx = sec_starts[s]
        end_idx = sec_starts[s + 1] if s < 358 else len(all_main_lines)
        lines = []
        for k in range(start_idx, end_idx):
            line_txt = all_main_lines[k]['text']
            # Ignore structural chapter headings between sections
            if re.match(r'^(CHAPTER\s+[IVXLCDM]+|OF\s+[A-Z\s,]+|Of\s+[a-z\s,]+)$', line_txt.strip()):
                continue
            lines.append(line_txt)
        raw_sections[s] = lines

    # Reconstruct headings
    sec_headings = {}
    for s in range(1, 359):
        idx = sec_starts[s]
        line = all_main_lines[idx]
        p_num = line['page']
        s_y = line['y']

        next_s_y = 999999
        if s < 358 and sec_starts[s + 1] < len(all_main_lines):
            next_line = all_main_lines[sec_starts[s + 1]]
            if next_line['page'] == p_num:
                next_s_y = next_line['y']

        p_margins = marginal_by_page[p_num - 1]
        matching = [m['text'] for m in p_margins if (s_y - 30) <= m['y'] < (next_s_y - 5)]
        h = ' '.join(matching)
        h = re.sub(r'\s+', ' ', h).strip()
        sec_headings[s] = h

    # Fine-tune heading text to fix any slight OCR wrapping or spillovers
    # Let's inspect known marginal headings from the bare act
    final_sections = []

    for s in range(1, 359):
        lines = raw_sections[s]
        full_text = '\n'.join(lines)

        # Remove section number prefix from the first line e.g. '1. ' or '1.'
        full_text = re.sub(rf'^{s}\s*\.\s*', '', full_text).strip()

        heading = sec_headings[s]

        # Separate paragraph, explanation, and content (illustrations/exceptions)
        # Patterns for Explanation and Illustration
        explanation = None
        content = None
        paragraph = full_text

        # Find Explanation and Illustration positions
        # Common structures:
        # 1. Paragraph -> Explanation -> Illustration
        # 2. Paragraph -> Illustration -> Explanation
        # 3. Paragraph -> Exception -> Illustration
        
        # Let's find all sub-block headers
        # e.g. Explanation.—, Explanation 1.—, Explanation 2.—, Illustration., Illustrations., Exception.—, Exception 1.—, etc.
        
        # We will split paragraph, explanation, content
        # Check if Explanation exists
        expl_matches = list(re.finditer(r'(?:^|\n)(Explanation(?:\s*\d+)?\s*[\.—–])', full_text))
        illus_matches = list(re.finditer(r'(?:^|\n)(Illustrations?\s*[\.—–]?)', full_text))
        except_matches = list(re.finditer(r'(?:^|\n)(Exceptions?\s*(?:\d+)?\s*[\.—–])', full_text))

        # Check if section has Explanation or Illustration/Exception
        if expl_matches or illus_matches or except_matches:
            # Let's collect all blocks by their start positions
            blocks = []
            if expl_matches:
                for em in expl_matches:
                    blocks.append(('explanation', em.start()))
            if illus_matches:
                for im in illus_matches:
                    blocks.append(('content', im.start()))
            if except_matches:
                for exm in except_matches:
                    # Exception can be part of paragraph or content depending on whether it's an Exception to the offence (like Exception 1 to 101)
                    # Let's check how IPC did it: in IPC section 300 (equivalent to 101), Exception was in content
                    blocks.append(('content', exm.start()))

            blocks.sort(key=lambda b: b[1])

            # The text before the first block is paragraph
            first_block_type, first_block_pos = blocks[0]
            para_text = full_text[:first_block_pos].strip()

            expl_parts = []
            content_parts = []

            for i in range(len(blocks)):
                b_type, b_start = blocks[i]
                b_end = blocks[i+1][1] if i + 1 < len(blocks) else len(full_text)
                b_text = full_text[b_start:b_end].strip()

                if b_type == 'explanation':
                    expl_parts.append(b_text)
                elif b_type == 'content':
                    content_parts.append(b_text)

            paragraph = para_text if para_text else full_text
            explanation = '\n\n'.join(expl_parts) if expl_parts else None
            content = '\n\n'.join(content_parts) if content_parts else None
        else:
            paragraph = full_text
            explanation = None
            content = None

        final_sections.append({
            'sectionNo': str(s),
            'heading': clean_text(heading),
            'paragraph': clean_text(paragraph),
            'explanation': clean_text(explanation),
            'content': clean_text(content)
        })

    print(f'Constructed dataset with {len(final_sections)} sections.')

    with open('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/scratch/bns_extracted.json', 'w') as f:
        json.dump(final_sections, f, indent=2, ensure_ascii=False)

    print('Saved scratch/bns_extracted.json successfully.')

if __name__ == '__main__':
    build_bns_dataset()
