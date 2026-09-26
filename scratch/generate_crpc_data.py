#!/usr/bin/env python3
"""
Generates prisma/crpcBearerActData.json and prisma/crpcBearerActData.js
containing all 534 sections across 39 chapters of THE CODE OF CRIMINAL PROCEDURE, 1973
from the PDF.
"""
import json
import re
import os

PDF_PAGES_PATH = 'scratch/crpc_pdf_pages.json'

with open(PDF_PAGES_PATH) as f:
    pages = json.load(f)

# Extract TOC titles
toc_text = '\n'.join([p['text'] for p in pages[:18]])
toc_lines = [l.strip() for l in toc_text.split('\n') if l.strip()]
sec_pattern = re.compile(r'^(\d+[A-Z]*|\d+\-[A-Z]+)\.\s+(.*)$')
ch_pattern = re.compile(r'^CHAPTER\s+([IVXLCDM]+[A-Z]*)$')

toc_dict = {}
i = 0
while i < len(toc_lines):
    line = toc_lines[i]
    m_sec = sec_pattern.match(line)
    if m_sec:
        s_no = m_sec.group(1)
        s_title = m_sec.group(2).rstrip('.')
        while i + 1 < len(toc_lines) and not sec_pattern.match(toc_lines[i+1]) and not ch_pattern.match(toc_lines[i+1]) and not toc_lines[i+1].startswith('CHAPTER') and not toc_lines[i+1].startswith('SECTIONS') and not re.match(r'^[A-Z]\.–', toc_lines[i+1]) and not re.match(r'^[A-Z]\.—', toc_lines[i+1]) and not toc_lines[i+1].isdigit() and not toc_lines[i+1].startswith('THE FIRST SCHEDULE') and not toc_lines[i+1].startswith('THE SECOND SCHEDULE') and not toc_lines[i+1].startswith('APPENDIX'):
            i += 1
            s_title += ' ' + toc_lines[i].rstrip('.')
        toc_dict[s_no] = re.sub(r'\s+', ' ', s_title).strip()
    i += 1

CHAPTERS = [
    (1, 'I', 'PRELIMINARY', ['1', '2', '3', '4', '5']),
    (2, 'II', 'CONSTITUTION OF CRIMINAL COURTS AND OFFICES', ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '25A']),
    (3, 'III', 'POWER OF COURTS', ['26', '27', '28', '29', '30', '31', '32', '33', '34', '35']),
    (4, 'IV', 'POWERS OF SUPERIOR OFFICERS OF POLICE AND AID TO THE MAGISTRATES AND THE POLICE', ['36', '37', '38', '39', '40']),
    (5, 'V', 'ARREST OF PERSONS', ['41', '41A', '41B', '41C', '41D', '42', '43', '44', '45', '46', '47', '48', '49', '50', '50A', '51', '52', '53', '53A', '54', '54A', '55', '55A', '56', '57', '58', '59', '60', '60A']),
    (6, 'VI', 'PROCESSES TO COMPEL APPEARANCE', [str(i) for i in range(61, 91)]),
    (7, 'VII', 'PROCESSES TO COMPEL THE PRODUCTION OF THINGS', [str(i) for i in range(91, 106)]),
    (8, 'VIIA', 'RECIPROCAL ARRANGEMENTS FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND FORFEITURE OF PROPERTY', ['105A', '105B', '105C', '105D', '105E', '105F', '105G', '105H', '105-I', '105J', '105K', '105L']),
    (9, 'VIII', 'SECURITY FOR KEEPING THE PEACE AND FOR GOOD BEHAVIOUR', [str(i) for i in range(106, 125)]),
    (10, 'IX', 'ORDER FOR MAINTENANCE OF WIVES, CHILDREN AND PARENTS', ['125', '126', '127', '128']),
    (11, 'X', 'MAINTENANCE OF PUBLIC ORDER AND TRANQUILLITY', [str(i) for i in range(129, 149)]),
    (12, 'XI', 'PREVENTIVE ACTION OF THE POLICE', ['149', '150', '151', '152', '153']),
    (13, 'XII', 'INFORMATION TO THE POLICE AND THEIR POWERS TO INVESTIGATE', ['154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '164A', '165', '166', '166A', '166B', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176']),
    (14, 'XIII', 'JURISDICTION OF THE CRIMINAL COURTS IN INQUIRIES AND TRIALS', [str(i) for i in range(177, 190)]),
    (15, 'XIV', 'CONDITIONS REQUISITE FOR INITIATION OF PROCEEDINGS', ['190', '191', '192', '193', '194', '195', '195A', '196', '197', '198', '198A', '198B', '199']),
    (16, 'XV', 'COMPLAINTS TO MAGISTRATES', ['200', '201', '202', '203']),
    (17, 'XVI', 'COMMENCEMENT OF PROCEEDINGS BEFORE MAGISTRATES', ['204', '205', '206', '207', '208', '209', '210']),
    (18, 'XVII', 'THE CHARGE', [str(i) for i in range(211, 225)]),
    (19, 'XVIII', 'TRIAL BEFORE A COURT OF SESSION', [str(i) for i in range(225, 238)]),
    (20, 'XIX', 'TRIAL OF WARRANT-CASES BY MAGISTRATES', [str(i) for i in range(238, 251)]),
    (21, 'XX', 'TRIAL OF SUMMONS-CASES BY MAGISTRATES', [str(i) for i in range(251, 260)]),
    (22, 'XXI', 'SUMMARY TRIALS', [str(i) for i in range(260, 266)]),
    (23, 'XXIA', 'PLEA BARGAINING', ['265A', '265B', '265C', '265D', '265E', '265F', '265G', '265H', '265-I', '265J', '265K', '265L']),
    (24, 'XXII', 'ATTENDANCE OF PERSONS CONFINED OR DETAINED IN PRISONS', [str(i) for i in range(266, 272)]),
    (25, 'XXIII', 'EVIDENCE IN INQUIRIES AND TRIALS', ['272', '273', '274', '275', '276', '277', '278', '279', '280', '281', '282', '283', '284', '285', '286', '287', '288', '289', '290', '291', '291A', '292', '293', '294', '295', '296', '297', '298', '299']),
    (26, 'XXIV', 'GENERAL PROVISIONS AS TO INQUIRIES AND TRIALS', ['300', '301', '302', '303', '304', '305', '306', '307', '308', '309', '310', '311', '311A', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327']),
    (27, 'XXV', 'PROVISIONS AS TO ACCUSED PERSONS OF UNSOUND MIND', [str(i) for i in range(328, 340)]),
    (28, 'XXVI', 'PROVISIONS AS TO OFFENCES AFFECTING THE ADMINISTRATION OF JUSTICE', [str(i) for i in range(340, 353)]),
    (29, 'XXVII', 'THE JUDGMENT', ['353', '354', '355', '356', '357', '357A', '357B', '357C', '358', '359', '360', '361', '362', '363', '364', '365']),
    (30, 'XXVIII', 'SUBMISSION OF DEATH SENTENCES FOR CONFIRMATION', [str(i) for i in range(366, 372)]),
    (31, 'XXIX', 'APPEALS', [str(i) for i in range(372, 395)]),
    (32, 'XXX', 'REFERENCE AND REVISION', [str(i) for i in range(395, 406)]),
    (33, 'XXXI', 'TRANSFER OF CRIMINAL CASES', [str(i) for i in range(406, 413)]),
    (34, 'XXXII', 'EXECUTION, SUSPENSION, REMISSION AND COMMUTATION OF SENTENCES', ['413', '414', '415', '416', '417', '418', '419', '420', '421', '422', '423', '424', '425', '426', '427', '428', '429', '430', '431', '432', '433', '433A', '434', '435']),
    (35, 'XXXIII', 'PROVISIONS AS TO BAIL AND BONDS', ['436', '436A', '437', '437A', '438', '439', '440', '441', '441A', '442', '443', '444', '445', '446', '446A', '447', '448', '449', '450']),
    (36, 'XXXIV', 'DISPOSAL OF PROPERTY', [str(i) for i in range(451, 460)]),
    (37, 'XXXV', 'IRREGULAR PROCEEDINGS', [str(i) for i in range(460, 467)]),
    (38, 'XXXVI', 'LIMITATION FOR TAKING COGNIZANCE OF CERTAIN OFFENCES', [str(i) for i in range(467, 474)]),
    (39, 'XXXVII', 'MISCELLANEOUS', [str(i) for i in range(474, 485)])
]

expected_secs = []
for ch_no, ch_rom, ch_name, sec_list in CHAPTERS:
    for s in sec_list:
        expected_secs.append((s, ch_no, ch_rom, ch_name))

# Clean body pages
cleaned_pages = []
for p in pages[18:164]:
    lines = p['text'].split('\n')
    i = 0
    while i < len(lines):
        l_str = lines[i].strip()
        if l_str == str(p['page']) or l_str == '' or l_str == '.':
            i += 1
        else:
            break
    end_idx = len(lines)
    for j in range(len(lines) - 1, max(i, len(lines) - 14), -1):
        l_str = lines[j].strip()
        if re.match(r'^\d+\.\s+(Subs\.|Ins\.|Added|Certain|The|S\.|Now|Provisions)', l_str) or re.match(r'^\*\s+\d+', l_str) or re.match(r'^[1-9]\s+(Subs|Ins|Added|The)', l_str):
            end_idx = j
        elif l_str == '' or re.match(r'^\s*$', lines[j]):
            pass
        elif end_idx != len(lines):
            if lines[j].startswith('   ') or lines[j].startswith('\t'):
                end_idx = j
            else:
                break
        else:
            break
    cleaned_pages.append('\n'.join(lines[i:end_idx]))

full_body = '\n'.join(cleaned_pages)

found_spans = []
pos = 0
for s_no, ch_no, ch_rom, ch_name in expected_secs:
    escaped_s = re.escape(s_no)
    pat = re.compile(r'(?:^|\n)(?:\d+\[|\s*\[|\s*)(' + escaped_s + r')\.\s+([^—\n]+(?:—|\n[^\n—]+—))', re.MULTILINE)
    m = pat.search(full_body, pos)
    if not m:
        pat_rel = re.compile(r'(?:^|\n)(?:\d+\[|\s*\[|\s*)(' + escaped_s + r')\.\s+', re.MULTILINE)
        m = pat_rel.search(full_body, pos)
    found_spans.append((s_no, ch_no, ch_rom, ch_name, m.start(), m.end(), m.group(0)))
    pos = m.start() + 1

parsed_sections = []
for idx in range(len(found_spans)):
    s_no, ch_no, ch_rom, ch_name, s_start, s_end, match_str = found_spans[idx]
    next_start = found_spans[idx+1][4] if idx+1 < len(found_spans) else len(full_body)
    raw_sec_chunk = full_body[s_start:next_start]
    
    # Strip any trailing chapter header or next chapter heading from chunk
    raw_sec_chunk = re.split(r'\n\s*CHAPTER\s+[IVXLCDM]+[A-Z]*', raw_sec_chunk)[0]
    
    # Title from TOC
    title = toc_dict.get(s_no, '')
    
    # Extract description
    m_dash = re.search(r'—\s*', raw_sec_chunk)
    if m_dash:
        desc = raw_sec_chunk[m_dash.end():].strip()
    else:
        m_head = re.match(r'^(?:\d+\[|\s*\[|\s*)' + re.escape(s_no) + r'\.\s+[^\n]+\n', raw_sec_chunk)
        if m_head:
            desc = raw_sec_chunk[m_head.end():].strip()
        else:
            desc = raw_sec_chunk.strip()
            
    if s_no == '484':
        desc = re.split(r'\n\s*THE FIRST SCHEDULE', desc)[0].strip()

    # Clean double newlines and trailing spaces
    desc = desc.strip()

    parsed_sections.append({
        'section': f'Section {s_no}',
        'sectionNo': s_no,
        'chapterNo': ch_no,
        'chapterRoman': ch_rom,
        'chapterName': ch_name,
        'title': title,
        'description': desc,
        'metaData': f'Chapter {ch_rom} {ch_name}',
        'metaDescription': f'THE CODE OF CRIMINAL PROCEDURE, 1973 Section {s_no} - {title}',
        'metaTitle': f'Section {s_no} - THE CODE OF CRIMINAL PROCEDURE, 1973'
    })

print(f'Writing {len(parsed_sections)} sections...')

json_path = 'prisma/crpcBearerActData.json'
js_path = 'prisma/crpcBearerActData.js'

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(parsed_sections, f, indent=2, ensure_ascii=False)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write('// THE CODE OF CRIMINAL PROCEDURE, 1973 Bearer Act Data with Full Chapter and Section Structure\n')
    f.write('export const crpcBearerActSections = ')
    json.dump(parsed_sections, f, indent=2, ensure_ascii=False)
    f.write(';\n')

print(f'Successfully generated {json_path} and {js_path}!')
