import json

sections_data = [
    {
        "section": "Section 1",
        "sectionNo": "1",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Short title and extent",
        "description": "1. Short title and extent.—(1) This Act may be called the Hindu Minority and Guardianship Act, 1956.\n(2) It extends to the whole of India and applies also to Hindus domiciled in the territories to which this Act extends who are outside the said territories.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 1 - Short title and extent",
        "metaTitle": "Section 1 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 2",
        "sectionNo": "2",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Act to be supplemental to Act 8 of 1890",
        "description": "2. Act to be supplemental to Act 8 of 1890.—The provisions of this Act shall be in addition to, and not, save as hereinafter expressly provided, in derogation of, the Guardians and Wards Act, 1890 (8 of 1890).",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 2 - Act to be supplemental to Act 8 of 1890",
        "metaTitle": "Section 2 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 3",
        "sectionNo": "3",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Application of Act",
        "description": "3. Application of Act.—(1) This Act applies,—\n(a) to any person who is a Hindu by religion in any of its forms or developments, including a Virashaiva, a Lingayat or a follower of the Brahmo, Prarthana or Arya Samaj;\n(b) to any person who is a Buddhist, Jain or Sikh by religion, and\n(c) to any other person domiciled in the territories to which this Act extends who is not a Muslim, Christian, Parsi or Jew by religion unless it is proved that any such person would not have been governed by the Hindu law or by any custom or usage as part of that law in respect of any of the matters dealt with herein if this Act had not been passed.\n\nExplanation.—The following persons are Hindus, Buddhists, Jains, or Sikhs by religion, as the case may be:—\n(i) any child, legitimate or illegitimate, both of whose parents are Hindus, Buddhists, Jains or Sikhs by religion;\n(ii) any child, legitimate or illegitimate, one of whose parents is a Hindu, Buddhist, Jain or Sikh by religion and who is brought up as a member of the tribe, community, group or family to which such parent belongs or belonged; and\n(iii) any person who is convert or re-convert to the Hindu, Buddhist, Jain or Sikh religion.\n\n(2) Notwithstanding anything contained in sub-section (1) nothing contained in this Act shall apply to the members of any scheduled Tribe within the meaning of clause (25) of article 366 of the Constitution unless the Central Government, by notification in the Official Gazette, otherwise directs.\n\n[(2A) Notwithstanding anything contained in sub-section (1), nothing contained in this Act shall apply to the Renoncants of the Union Territory of Pondicherry.]\n\n(3) The expression “Hindu”, in any provision of this Act shall be construed as if it included a person who, though not a Hindu by religion, is, nevertheless, a person to whom this Act applies by virtue of the provisions contained in this section.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 3 - Application of Act",
        "metaTitle": "Section 3 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 4",
        "sectionNo": "4",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Definitions",
        "description": "4. Definitions.—In this Act,—\n(a) “minor” means a person who has not completed the age of eighteen years;\n(b) “guardian” means a person having the care of the person of a minor or of his property or of both his person and property, and includes—\n(i) a natural guardian,\n(ii) a guardian appointed by the will of the minor’s father or mother,\n(iii) a guardian appointed or declared by a court, and\n(iv) a person empowered to act as such by or under any enactment relating to any Court of wards.\n(c) “natural guardian” means any of the guardians mentioned in section 6.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 4 - Definitions",
        "metaTitle": "Section 4 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 5",
        "sectionNo": "5",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Over-riding effect of Act",
        "description": "5. Over-riding effect of Act.—Save as otherwise expressly provided in this Act,—\n(a) any text, rule or interpretation of Hindu Law or any custom or usage as part of that law in force immediately before the commencement of this Act Shall cease to have effect with respect to any matter for which provision is made in this Act.\n(b) any other law in force immediately before the commencement of this Act shall cease to have effect in so far as it is inconsistent with any of the provisions contained in this Act.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 5 - Over-riding effect of Act",
        "metaTitle": "Section 5 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 6",
        "sectionNo": "6",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Natural guardians of a Hindu minor",
        "description": "6. Natural guardians of a Hindu minor.—The natural guardians of a Hindu minor; in respect of the minor's person as well as in respect of the minor’s property (excluding his or her undivided interest in joint family property), are—\n(a) in the case of a boy or an unmarried girl—the father, and after him, the mother: provided that the custody of a minor who has not completed the age of five years shall ordinarily be with the mother;\n(b) in the case of an illegitimate boy or an illegitimate unmarried girl—the mother, and after her, the father;\n(c) in the case of a married girl—the husband:\n\nProvided that no person shall be entitled to act as the natural guardian of a minor under the provisions of this section—\n(a) if he has ceased to be a Hindu, or\n(b) if he has completely and finally renounced the world by becoming a hermit (vanaprastha) or an ascetic (yati or sanyasi).\n\nExplanation.—In this section, the expressions “father” and “mother” do not include a step-father and a step-mother.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 6 - Natural guardians of a Hindu minor",
        "metaTitle": "Section 6 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 7",
        "sectionNo": "7",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Natural guardianship of adopted son",
        "description": "7. Natural guardianship of adopted son.—The natural guardianship of an adopted son who is a minor passes, on adoption, to the adoptive father and after him to the adoptive mother.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 7 - Natural guardianship of adopted son",
        "metaTitle": "Section 7 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 8",
        "sectionNo": "8",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Powers of natural guardian",
        "description": "8. Powers of natural guardian.—(1) The natural guardian of a Hindu minor has power, subject to the provisions of this section, to do all acts which are necessary or reasonable and proper for the benefit of the minor or for the realization, protection or benefit of the minor's estate; but the guardian can in no case bind the minor by a personal covenant.\n(2) The natural guardian shall not, without the previous permission of the court,—\n(a) mortgage or charge, or transfer by sale, gift, exchange or otherwise, any part of the immovable property of the minor; or\n(b) lease any part of such property for a term exceeding five years or for a term extending more than one year beyond the date on which the minor will attain majority.\n(3) Any disposal of immovable property by a natural guardian, in contravention of sub-section (1) or sub-section (2), is voidable at the instance of the minor or any person claiming under him.\n(4) No court shall grant permission to the natural guardian to do any of the acts mentioned in sub-section (2) except in case of necessity or for an evident advantage to the minor.\n(5) The Guardians and Wards Act, 1890 (8 of 1890), shall apply to and in respect of an application for obtaining the permission of the court under sub-section (2) in all respects as if it were an application for obtaining the permission of the court under section 29 of that Act, and in particular—\n(a) proceedings in connection with the application shall be deemed to be proceedings under that Act within the meaning of section 4A thereof;\n(b) the court shall observe the procedure and have the powers specified in sub-sections (2), (3) and (4) of section 31 of that Act; and\n(c) an appeal shall lie from an order of the court refusing permission to the natural guardian to do any of the Acts mentioned in sub-section (2) of this section to the court to which appeals ordinarily lie from the decisions of that court.\n(6) In this section, “Court” means the city civil court or a district court or a court empowered under section 4A of the Guardians and Wards Act, 1890 (8 of 1890), within the local limits of whose jurisdiction the immovable property in respect of which the application is made is situate, and where the immovable property is situate within the jurisdiction of more than one such court, means the court within the local limits of whose jurisdiction any portion of the property is situate.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 8 - Powers of natural guardian",
        "metaTitle": "Section 8 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 9",
        "sectionNo": "9",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Testamentary guardians and their powers",
        "description": "9. Testamentary guardians and their powers.—(1) A Hindu father entitled to act as the natural guardian of his minor legitimate children may, by will appoint a guardian for any of them in respect of the minor’s person or in respect of the minor’s property (other than the undivided interest referred to in section 12) or in respect of both.\n(2) An appointment made under sub-section (1) shall have no effect if the father predeceases the mother, but shall revive if the mother dies without appointing, by will, any person as guardian.\n(3) A Hindu widow entitled to act as the natural guardian of her minor legitimate children, and a Hindu mother entitled to act as the natural guardian of her minor legitimate children by reason of the fact that the father has become disentitled to act as such, may, by will, appoint a guardian for any of them in respect of the minor’s person or in respect of the minor’s property (other than the undivided interest referred to in section 12) or in respect of both.\n(4) A Hindu mother entitled to act as the natural guardian of her minor illegitimate children may; by will, appoint a guardian for any of them in respect of the minor’s person or in respect of the minor's property or in respect of both.\n(5) The guardian so appointed by will has the right to act as the minor’s guardian after the death of the minor’s father or mother, as the case may be, and to exercise all the rights of a natural guardian under this Act to such extent and subject to such restrictions, if any, as are specified in this Act and in the will.\n(6) The right of the guardian so appointed by will shall, where the minor is a girl, cease on her marriage.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 9 - Testamentary guardians and their powers",
        "metaTitle": "Section 9 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 10",
        "sectionNo": "10",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Incapacity of minor to act as guardian of property",
        "description": "10. Incapacity of minor to act as guardian of property.—A minor shall be incompetent to act as guardian of the property of any minor.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 10 - Incapacity of minor to act as guardian of property",
        "metaTitle": "Section 10 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 11",
        "sectionNo": "11",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "De facto guardian not to deal with minor’s property",
        "description": "11. De facto guardian not to deal with minor’s property.—After the commencement of this Act, no person shall be entitled to dispose of, or deal with, the property of a Hindu minor merely on the ground of his or her being the de facto guardian of the minor.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 11 - De facto guardian not to deal with minor’s property",
        "metaTitle": "Section 11 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 12",
        "sectionNo": "12",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Guardian not to be appointed for minors undivided interest in joint family property",
        "description": "12. Guardian not to be appointed for minors undivided interest in joint family property.—Where a minor has an undivided interest in joint family property and the property is under the management of an adult member of the family, no guardian shall be appointed for the minor in respect of such undivided interest:\nProvided that nothing in this section shall be deemed to affect the jurisdiction of a High Court to appoint a guardian in respect of such interest.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 12 - Guardian not to be appointed for minors undivided interest in joint family property",
        "metaTitle": "Section 12 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    },
    {
        "section": "Section 13",
        "sectionNo": "13",
        "chapterNo": 1,
        "chapterName": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "title": "Welfare of minor to be paramount consideration",
        "description": "13. Welfare of minor to be paramount consideration.—(1) In the appointment of declaration of any person as guardian of a Hindu minor by a court, the welfare of the minor shall be the paramount consideration.\n(2) No person shall be entitled to the guardianship by virtue of the provisions of this Act or of any law relating to guardianship in marriage among Hindus, if the court is of opinion that his or her guardianship will not be for the welfare of the minor.",
        "metaData": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956",
        "metaDescription": "THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956 Section 13 - Welfare of minor to be paramount consideration",
        "metaTitle": "Section 13 - THE HINDU MINORITY AND GUARDIANSHIP ACT, 1956"
    }
]

# Write JSON
with open('prisma/hinduMinorityGuardianshipBearerActData.json', 'w', encoding='utf-8') as f:
    json.dump(sections_data, f, indent=2, ensure_ascii=False)

# Write JS
with open('prisma/hinduMinorityGuardianshipBearerActData.js', 'w', encoding='utf-8') as f:
    f.write('export const hinduMinorityGuardianshipBearerActSections = ')
    json.dump(sections_data, f, indent=2, ensure_ascii=False)
    f.write(';\n')

print(f"Generated {len(sections_data)} sections.")
