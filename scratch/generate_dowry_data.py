#!/usr/bin/env python3
"""
Generates prisma/dowryBearerActData.json and prisma/dowryBearerActData.js
containing all 13 sections of THE DOWRY PROHIBITION ACT, 1961
strictly from the attached PDF.
"""
import json
import os

ACT_HEADING = "THE DOWRY PROHIBITION ACT, 1961"

sections = [
    {
        "section": "Section 1",
        "sectionNo": "1",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Short title, extent and commencement",
        "description": """(1) This Act may be called the Dowry Prohibition Act, 1961.
(2) It extends to the whole of India except the State of Jammu and Kashmir.
(3) It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 1 - Short title, extent and commencement",
        "metaTitle": f"Section 1 - {ACT_HEADING}"
    },
    {
        "section": "Section 2",
        "sectionNo": "2",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Definition of “dowry”",
        "description": """In this Act, “dowry” means any property or valuable security given or agreed to be given either directly or indirectly—
(a) by one party to a marriage to the other party to the marriage; or
(b) by the parents of either party to a marriage or by any other person, to either party to the marriage or to any other person;
at or before or any time after the marriage in connection with the marriage of the said parties, but does not include dower or mahr in the case of persons to whom the Muslim Personal Law (Shariat) applies.

Explanation II.—The expression “valuable security” has the same meaning as in section 30 of the Indian Penal Code (45 of 1860).""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 2 - Definition of “dowry”",
        "metaTitle": f"Section 2 - {ACT_HEADING}"
    },
    {
        "section": "Section 3",
        "sectionNo": "3",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Penalty for giving or taking dowry",
        "description": """(1) If any person, after the commencement of this Act, gives or takes or abets the giving or taking of dowry, he shall be punishable with imprisonment for a term which shall not be less than five years, and with fine which shall not be less than fifteen thousand rupees or the amount of the value of such dowry, whichever is more:
Provided that the Court may, for adequate and special reasons to be recorded in the judgment, impose a sentence of imprisonment for a term of less than five years.
(2) Nothing in sub-section (1) shall apply to, or in relation to,—
(a) presents which are given at the time of a marriage to the bride (without any demand having been made in that behalf):
Provided that such presents are entered in a list maintained in accordance with the rules made under this Act;
(b) presents which are given at the time of a marriage to the bridegroom (without any demand having been made in that behalf):
Provided that such presents are entered in a list maintained in accordance with the rules made under this Act:
Provided further that where such presents are made by or on behalf of the bride or any person related to the bride, such presents are of a customary nature and the value thereof is not excessive having regard to the financial status of the person by whom, or on whose behalf, such presents are given.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 3 - Penalty for giving or taking dowry",
        "metaTitle": f"Section 3 - {ACT_HEADING}"
    },
    {
        "section": "Section 4",
        "sectionNo": "4",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Penalty for demanding dowry",
        "description": """If any person demands, directly or indirectly, from the parents or other relatives or guardian of a bride or bridegroom, as the case may be, any dowry, he shall be punishable with imprisonment for a term which shall not be less than six months, but which may extend to two years and with fine which may extend to ten thousand rupees:
Provided that the Court may, for adequate and special reasons to be mentioned in the judgment, impose a sentence of imprisonment for a term of less than six months.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 4 - Penalty for demanding dowry",
        "metaTitle": f"Section 4 - {ACT_HEADING}"
    },
    {
        "section": "Section 4A",
        "sectionNo": "4A",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Ban on advertisement",
        "description": """If any person—
(a) offers, through any advertisement in any newspaper, periodical, journal or through any other media, any share in his property or of any money or both as a share in any business or other interest as consideration for the marriage of his son or daughter or any other relative,
(b) prints or publishes or circulates any advertisement referred to in clause (a),
he shall be punishable with imprisonment for a term which shall not be less than six months, but which may extend to five years, or with fine which may extend to fifteen thousand rupees:
Provided that the Court may, for adequate and special reasons to be recorded in the judgment, impose a sentence of imprisonment for a term of less than six months.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 4A - Ban on advertisement",
        "metaTitle": f"Section 4A - {ACT_HEADING}"
    },
    {
        "section": "Section 5",
        "sectionNo": "5",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Agreement for giving or taking dowry to be void",
        "description": """Any agreement for the giving or taking of dowry shall be void.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 5 - Agreement for giving or taking dowry to be void",
        "metaTitle": f"Section 5 - {ACT_HEADING}"
    },
    {
        "section": "Section 6",
        "sectionNo": "6",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Dowry to be for the benefit of the wife or her heirs",
        "description": """(1) Where any dowry is received by any person other than the woman in connection with whose marriage it is given, that person shall transfer it to the woman—
(a) if the dowry was received before marriage, within three months after the date of marriage; or
(b) if the dowry was received at the time of or after the marriage, within three months after the date of its receipt; or
(c) if the dowry was received when the woman was a minor, within three months after she has attained the age of eighteen years;
and pending such transfer, shall hold it in trust for the benefit of the woman.
(2) If any person fails to transfer any property as required by sub-section (1) within the time limit specified therefor or as required by sub-section (3), he shall be punishable with imprisonment for a term which shall not be less than six months, but which may extend to two years or with fine which shall not be less than five thousand rupees, but which may extend to ten thousand rupees or with both.
(3) Where the woman entitled to any property under sub-section (1) dies before receiving it, the heirs of the woman shall be entitled to claim it from the person holding it for the time being:
Provided that where such woman dies within seven years of her marriage, otherwise than due to natural causes, such property shall,—
(a) if she has no children, be transferred to her parents, or
(b) if she has children, be transferred to such children and pending such transfer, be held in trust for such children.
(3A) Where a person convicted under sub-section (2) for failure to transfer any property as required by sub-section (1) or sub-section (3) has not, before his conviction under that sub-section, transferred such property to the woman entitled thereto or, as the case may be, her heirs, parents or children the Court shall, in addition to awarding punishment under that sub-section, direct, by order in writing, that such person shall transfer the property to such woman or, as the case may be, her heirs, parents or children within such period as may be specified in the order, and if such person fails to comply with the direction within the period so specified, an amount equal to the value of the property may be recovered from him as if it were a fine imposed by such Court and paid to such woman or, as the case may be, her heirs, parents or children.
(4) Nothing contained in this section shall affect the provisions of section 3 or section 4.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 6 - Dowry to be for the benefit of the wife or her heirs",
        "metaTitle": f"Section 6 - {ACT_HEADING}"
    },
    {
        "section": "Section 7",
        "sectionNo": "7",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Cognizance of offences",
        "description": """(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974),—
(a) no Court inferior to that of a Metropolitan Magistrate or a Judicial Magistrate of the first class shall try any offence under this Act;
(b) no court shall take cognizance of an offence under this Act except upon—
(i) its own knowledge or a police report of the facts which constitute such offence, or
(ii) a complaint by the person aggrieved by the offence or a parent or other relative of such person, or by any recognised welfare institution or organisation;
(c) it shall be lawful for a Metropolitan Magistrate or a Judicial Magistrate of the first class to pass any sentence authorised by this Act on any person convicted of an offence under this Act.
Explanation.—For the purposes of this sub-section, “recognised welfare institution or organisation” means a social welfare institution or organisation recognised in this behalf by the Central or State Government.
(2) Nothing in Chapter XXXVI of the Code of Criminal Procedure, 1973 (2 of 1974), shall apply to any offence punishable under this Act.
(3) Notwithstanding anything contained in any law for the time being in force a statement made by the person aggrieved by the offence shall not subject such person to a prosecution under this Act.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 7 - Cognizance of offences",
        "metaTitle": f"Section 7 - {ACT_HEADING}"
    },
    {
        "section": "Section 8",
        "sectionNo": "8",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Offences to be cognizable for certain purposes and to be bailable and non-compoundable",
        "description": """(1) The Code of Criminal Procedure, 1973 (2 of 1974) shall apply to offences under this Act as if they were cognizable offences—
(a) for the purposes of investigation of such offences; and
(b) for the purposes of matters other than—
(i) matters referred to in section 42 of that Code; and
(ii) the arrest of a person without a warrant or without an order of a Magistrate.
(2) Every offence under this Act shall be non-bailable and non-compoundable.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 8 - Offences to be cognizable for certain purposes and to be bailable and non-compoundable",
        "metaTitle": f"Section 8 - {ACT_HEADING}"
    },
    {
        "section": "Section 8A",
        "sectionNo": "8A",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Burden of proof in certain cases",
        "description": """Where any person is prosecuted for taking or abetting the taking of any dowry under section 3, or the demanding of dowry under section 4, the burden of proving that he had not committed an offence under those sections shall be on him.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 8A - Burden of proof in certain cases",
        "metaTitle": f"Section 8A - {ACT_HEADING}"
    },
    {
        "section": "Section 8B",
        "sectionNo": "8B",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Dowry Prohibition Officers",
        "description": """(1) The State Government may appoint as many Dowry Prohibition Officers as it thinks fit and specify the areas in respect of which they shall exercise their jurisdiction and powers under this Act.
(2) Every Dowry Prohibition Officer shall exercise and perform the following powers and functions, namely:—
(a) to see that the provisions of this Act are complied with;
(b) to prevent, as far as possible, the taking or abetting the taking of, or the demanding of, dowry;
(c) to collect such evidence as may be necessary for the prosecution of persons committing offences under the Act; and
(d) to perform such additional functions as may be assigned to him by the State Government, or as may be specified in the rules made under this Act.
(3) The State Government may, by notification in the Official Gazette, confer such powers of a police officer as may be specified in the notification on the Dowry Prohibition Officer who shall exercise such powers subject to such limitations and conditions as may be specified by rules made under this Act.
(4) The State Government may, for the purpose of advising and assisting Dowry Prohibition Officers in the efficient performance of their functions under this Act, appoint an advisory board consisting of not more than five social welfare workers (out of whom at least two shall be women) from the area in respect of which such Dowry Prohibition Officer exercises jurisdiction under sub-section (1).""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 8B - Dowry Prohibition Officers",
        "metaTitle": f"Section 8B - {ACT_HEADING}"
    },
    {
        "section": "Section 9",
        "sectionNo": "9",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Power to make rules",
        "description": """(1) The Central Government may, by notification in the Official Gazette, make rules for carrying out the purposes of this Act.
(2) In particular, and without prejudice to the generality of the foregoing power, such rules may provide for—
(a) the form and manner in which, and the persons by whom, any list of presents referred to in sub-section (2) of section 3 shall be maintained and all other matters connected therewith; and
(b) the better co-ordination of policy and action with respect to the administration of this Act.
(3) Every rule made under this section shall be laid as soon as may be after it is made before each House of Parliament while it is in session for a total period of thirty days which may be comprised in one session or in two or more successive sessions, and if, before the expiry of the session immediately following the session or the successive sessions aforesaid, both Houses agree in making any modification in the rule or both Houses agree that the rule should not be made, the rule shall thereafter have effect only in such modified form or be of no effect, as the case may be, so however that any such modification or annulment shall be without prejudice to the validity of anything previously done under that rule.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 9 - Power to make rules",
        "metaTitle": f"Section 9 - {ACT_HEADING}"
    },
    {
        "section": "Section 10",
        "sectionNo": "10",
        "chapterNo": 1,
        "chapterName": "THE DOWRY PROHIBITION ACT, 1961",
        "title": "Power of the State Government to make rules",
        "description": """(1) The State Government may, by notification in the Official Gazette, make rules for carrying out the purposes of this Act.
(2) In particular, and without prejudice to the generality of the foregoing power, such rules may provide for all or any of the following matters, namely:—
(a) the additional functions to be performed by the Dowry Prohibition Officers under sub-section (2) of section 8B;
(b) limitations and conditions subject to which a Dowry Prohibition Officer may exercise his functions under sub-section (3) of section 8B.
(3) Every rule made by the State Government under this section shall be laid as soon as may be after it is made before the State Legislature.""".strip(),
        "metaData": "THE DOWRY PROHIBITION ACT, 1961",
        "metaDescription": f"{ACT_HEADING} Section 10 - Power of the State Government to make rules",
        "metaTitle": f"Section 10 - {ACT_HEADING}"
    }
]

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, "prisma", "dowryBearerActData.json")
    js_path = os.path.join(base_dir, "prisma", "dowryBearerActData.js")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(sections, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(sections)} sections to {json_path}")

    js_content = f"// {ACT_HEADING} Bearer Act Data with Section Structure\n"
    js_content += "export const dowryBearerActSections = " + json.dumps(sections, indent=2, ensure_ascii=False) + ";\n"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Wrote {len(sections)} sections to {js_path}")

if __name__ == "__main__":
    main()
