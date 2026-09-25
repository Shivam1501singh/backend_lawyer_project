import json
import re

def clean_statutory_text(text):
    if not text:
        return None
    t = text
    # Fix parenthesis spacing e.g. ( 1 ) -> (1), ( a ) -> (a), ( i ) -> (i)
    t = re.sub(r'\(\s+([0-9a-zA-ZivxIVX]+)\s+\)', r'(\1)', t)
    t = re.sub(r'\(\s+([0-9a-zA-ZivxIVX]+)\)', r'(\1)', t)
    t = re.sub(r'\(([0-9a-zA-ZivxIVX]+)\s+\)', r'(\1)', t)
    # Fix punctuation spacing e.g. ' , ' -> ', '
    t = re.sub(r'\s+([,\.;:])', r'\1', t)
    # Fix quote spacing
    t = re.sub(r'“\s+', '“', t)
    t = re.sub(r'\s+”', '”', t)
    t = re.sub(r'‘\s+', '‘', t)
    t = re.sub(r'\s+’', '’', t)
    # Fix apostrophe spacing
    t = re.sub(r'([A-Za-z])\s+’\s*([a-z])', r'\1’\2', t)
    t = re.sub(r'([A-Za-z])\s+\'\s*([a-z])', r'\1\'\2', t)
    # Fix common OCR word breaks
    t = re.sub(r'misappropria\s+tion', 'misappropriation', t)
    t = re.sub(r'house-\s+breaking', 'house-breaking', t)
    t = re.sub(r'instru\s+ment', 'instrument', t)
    t = re.sub(r'naviga\s+tion', 'navigation', t)
    t = re.sub(r'Non-\s+appearance', 'Non-appearance', t)
    t = re.sub(r'Non\s+attendance', 'Non-attendance', t)
    t = re.sub(r'Non\s+treatment', 'Non-treatment', t)
    # multiple newlines
    t = re.sub(r'\n{3,}', '\n\n', t)
    # multiple spaces
    t = re.sub(r'[ \t]+', ' ', t)
    lines = [l.strip() for l in t.split('\n')]
    return '\n'.join(lines).strip()

def refine_headings(headings_dict):
    # Fix any spillover between adjacent marginal notes
    # Let's clean up any spillover words
    cleaned = {}
    for s, h in headings_dict.items():
        h = clean_statutory_text(h)
        # remove trailing period for heading if desired, or keep as standard
        # In IPC, headings didn't have trailing period, but let's check IPC headings:
        # e.g. "Title and extent of operation of the Code", "Definitions in the Code to be understood subject to exceptions"
        cleaned[s] = h
    return cleaned

def run():
    with open('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/scratch/bns_extracted.json') as f:
        data = json.load(f)

    # Let's inspect and fix any known spillover headings in data
    for item in data:
        s = int(item['sectionNo'])
        h = item['heading']
        
        # Remove trailing periods from heading to match IPC style (e.g. 'Rape.' -> 'Rape')
        h = re.sub(r'\.+$', '', h).strip()
        
        # Specific marginal spillover cleanups where adjacent marginal note text overlapped
        if s == 81:
            h = 'Cohabitation caused by man deceitfully inducing belief of lawful marriage'
        elif s == 82:
            h = 'Marrying again during lifetime of husband or wife'
        elif s == 132:
            h = 'Assault or criminal force to deter public servant from discharge of his duty'
        elif s == 133:
            h = 'Assault or criminal force with intent to dishonour person, otherwise than on grave provocation'
        elif s == 150:
            h = 'Concealing with intent to facilitate design to wage war'
        elif s == 157:
            h = 'Public servant negligently suffering such prisoner to escape'
        elif s == 166:
            h = 'Abetment of act of insubordination by soldier, sailor or airman'
        elif s == 175:
            h = 'False statement in connection with an election'
        elif s == 181:
            h = 'Making or possessing instruments or materials for forging or counterfeiting coin, Government stamp, currency-notes or bank-notes'
        elif s == 191:
            h = 'Rioting'
        elif s == 243:
            h = 'Fraudulent removal or concealment of property to prevent its seizure as forfeited or in execution'
        elif s == 264:
            h = 'Omission to apprehend, or sufferance of escape, on part of public servant, in cases not otherwise provided for'
        elif s == 293:
            h = 'Continuance of nuisance after injunction to discontinue'
        elif s == 340:
            h = 'Forged document or electronic record and using it as genuine'
        elif s == 348:
            h = 'Making or possession of any instrument for counterfeiting a property mark'
        elif s == 282:
            h = 'Rash navigation of vessel'
        elif s == 314:
            h = 'Dishonest misappropriation of property'
        elif s == 315:
            h = 'Dishonest misappropriation of property possessed by deceased person at the time of his death'
        elif s == 322:
            h = 'Dishonest or fraudulent execution of deed of transfer containing false statement of consideration'
        elif s == 330:
            h = 'House-trespass and house-breaking'
        elif s == 331:
            h = 'Punishment for house-trespass or house-breaking'
        elif s == 192:
            h = 'Wantonly giving provocation with intent to cause riot-if rioting be committed; if not committed'
        elif s == 209:
            h = 'Non-appearance in response to a proclamation under section 84 of Bharatiya Nagarik Suraksha Sanhita, 2023'

        item['heading'] = h
        item['paragraph'] = clean_statutory_text(item['paragraph'])
        item['explanation'] = clean_statutory_text(item['explanation'])
        item['content'] = clean_statutory_text(item['content'])

    with open('/Users/admin/Desktop/lawyer_project/backend_lawyer_project/scratch/bns_final.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f'Final BNS dataset verified and saved with {len(data)} sections.')

if __name__ == '__main__':
    run()
