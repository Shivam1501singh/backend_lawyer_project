# Complete THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 Data Builder
import json
import os

sections = []

def add_sec(no, ch_no, ch_rom, ch_name, title, desc):
    sections.append({
        "section": f"Section {no}",
        "sectionNo": str(no),
        "chapterNo": ch_no,
        "chapterRoman": ch_rom,
        "chapterName": ch_name,
        "title": title.strip(),
        "description": desc.strip(),
        "metaData": f"Chapter {ch_rom} {ch_name}",
        "metaDescription": f"THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 Section {no} - {title.strip()}",
        "metaTitle": f"Section {no} - THE PREVENTION OF MONEY-LAUNDERING ACT, 2002"
    })

# ==========================================
# CHAPTER I – PRELIMINARY
# ==========================================
add_sec("1", 1, "I", "PRELIMINARY", "Short title, extent and commencement",
"""(1) This Act may be called the Prevention of Money-laundering Act, 2002.
(2) It extends to the whole of India.
(3) It shall come into force on such date as the Central Government may, by notification in the Official Gazette, appoint, and different dates may be appointed for different provisions of this Act and any reference in any such provision to the commencement of this Act shall be construed as a reference to the coming into force of that provision.""")

add_sec("2", 1, "I", "PRELIMINARY", "Definitions",
"""(1) In this Act, unless the context otherwise requires,—
(a) “Adjudicating Authority” means an Adjudicating Authority appointed under sub-section (1) of section 6;
(b) “Appellate Tribunal” means the Appellate Tribunal referred to in section 25;
(c) “Assistant Director” means an Assistant Director appointed under sub-section (1) of section 49;
(d) “attachment” means prohibition of transfer, conversion, disposition or movement of property by an order issued under Chapter III;
(da) “authorised person” means an authorised person as defined in clause (c) of section 2 of the Foreign Exchange Management Act, 1999 (42 of 1999);
(e) “banking company” means a banking company or a co-operative bank to which the Banking Regulation Act, 1949 (10 of 1949) applies and includes any bank or banking institution referred to in section 51 of that Act;
(f) “Bench” means a Bench of the Appellate Tribunal;
(fa) “beneficial owner” means an individual who ultimately owns or controls a client of a reporting entity or the person on whose behalf a transaction is being conducted and includes a person who exercises ultimate effective control over a juridical person;
(g) “Chairperson” means the Chairperson of the Appellate Tribunal;
(h) “chit fund company” means a company managing, conducting or supervising, as foreman, agent or in any other capacity, chits as defined in section 2 of the Chit Funds Act, 1982 (40 of 1982);
(ha) “client” means a person who is engaged in a financial transaction or activity with a reporting entity and includes a person on whose behalf the person who engaged in the transaction or activity, is acting;
(i) “co-operative bank” shall have the same meaning as assigned to it in clause (dd) of section 2 of the Deposit Insurance and Credit Guarantee Corporation Act, 1961 (47 of 1961);
(ia) “corresponding law” means any law of any foreign country corresponding to any of the provisions of this Act or dealing with offences in that country corresponding to any of the scheduled offences;
(ib) “dealer” has the same meaning as assigned to it in clause (b) of section 2 of the Central Sales Tax Act, 1956 (74 of 1956);
(j) “Deputy Director” means a Deputy Director appointed under sub-section (1) of section 49;
(k) “Director” or “Additional Director” or “Joint Director” means a Director or Additional Director or Joint Director, as the case may be, appointed under sub-section (1) of section 49;
(l) “financial institution” means a financial institution as defined in clause (c) of section 45-I of the Reserve Bank of India Act, 1934 (2 of 1934) and includes a chit fund company, a housing finance institution, an authorised person, a payment system operator, a non-banking financial company and the Department of Posts in the Government of India;
(m) “housing finance institution” shall have the meaning as assigned to it in clause (d) of section 2 of the National Housing Bank Act, 1987 (53 of 1987);
(n) “intermediary” means,—
(i) a stock-broker, share transfer agent, banker to an issue, trustee to a trust deed, registrar to an issue, merchant banker, underwriter, portfolio manager, investment adviser or any other intermediary associated with securities market and registered under section 12 of the Securities and Exchange Board of India Act, 1992 (15 of 1992); or
(ii) an association recognised or registered under the Forward Contracts (Regulation) Act, 1952 (74 of 1952) or any member of such association; or
(iii) intermediary registered by the Pension Fund Regulatory and Development Authority; or
(iv) a recognised stock exchange referred to in clause (f) of section 2 of the Securities Contracts (Regulation) Act, 1956 (42 of 1956);
(na) “investigation” includes all the proceedings under this Act conducted by the Director or by an authority authorised by the Central Government under this Act for the collection of evidence;
(o) “Member” means a Member of the Appellate Tribunal and includes the Chairperson;
(p) “money-laundering” has the meaning assigned to it in section 3;
(q) “non-banking financial company” shall have the same meaning as assigned to it in clause (f) of section 45-I of the Reserve Bank of India Act, 1934 (2 of 1934);
(r) “notification” means a notification published in the Official Gazette;
(ra) “offence of cross border implications”, means—
(i) any conduct by a person at a place outside India which constitutes an offence at that place and which would have constituted an offence specified in Part A, Part B or Part C of the Schedule, had it been committed in India and if such person transfers in any manner the proceeds of such conduct or part thereof to India; or
(ii) any offence specified in Part A, Part B or Part C of the Schedule which has been committed in India and the proceeds of crime, or part thereof have been transferred to a place outside India or any attempt has been made to transfer the proceeds of crime, or part thereof from India to a place outside India.
Explanation.—Nothing contained in this clause shall adversely affect any investigation, enquiry, trial or proceeding before any authority in respect of the offences specified in Part A or Part B of the Schedule to the Act before the commencement of the Prevention of Money-laundering (Amendment) Act, 2009 (21 of 2009);
(rb) “payment system” means a system that enables payment to be effected between a payer and a beneficiary, involving clearing, payment or settlement service or all of them.
Explanation.—For the purposes of this clause, “payment system” includes the systems enabling credit card operations, debit card operations, smart card operations, money transfer operations or similar operations;
(rc) “payment system operator” means a person who operates a payment system and such person includes his overseas principal.
Explanation.—For the purposes of this clause, “overseas principal” means,—
(A) in the case of a person, being an individual, such individual residing outside India, who owns or controls or manages, directly or indirectly, the activities or functions of payment system in India;
(B) in the case of a Hindu undivided family, Karta of such Hindu undivided family residing outside India who owns or controls or manages, directly or indirectly, the activities or functions of payment system in India;
(C) in the case of a company, a firm, an association of persons, a body of individuals, an artificial juridical person, whether incorporated or not, such company, firm, association of persons, body of individuals, artificial juridical person incorporated or registered outside India or existing as such and which owns or controls or manages, directly or indirectly, the activities or functions of payment system in India;
(s) “person” includes—
(i) an individual,
(ii) a Hindu undivided family,
(iii) a company,
(iv) a firm,
(v) an association of persons or a body of individuals, whether incorporated or not,
(vi) every artificial juridical person not falling within any of the preceding sub-clauses, and
(vii) any agency, office or branch owned or controlled by any of the above persons mentioned in the preceding sub-clauses;
(sa) “person carrying on designated business or profession” means,—
(i) a person carrying on activities for playing games of chance for cash or kind, and includes such activities associated with casino;
(ii) Inspector-General of Registration appointed under section 3 of the Registration Act, 1908 (16 of 1908) as may be notified by the Central Government;
(iii) real estate agent, as may be notified by the Central Government;
(iv) dealer in precious metals, precious stones and other high value goods, as may be notified by the Central Government;
(v) person engaged in safekeeping and administration of cash and liquid securities on behalf of other persons, as may be notified by the Central Government; or
(vi) person carrying on such other activities as the Central Government may, by notification, so designate, from time to time;
(sb) “precious metal” means gold, silver, platinum, palladium or rhodium or such other metal as may be notified by the Central Government;
(sc) “precious stone” means diamond, emerald, ruby, sapphire or any such other stone as may be notified by the Central Government;
(t) “prescribed” means prescribed by rules made under this Act;
(u) “proceeds of crime” means any property derived or obtained, directly or indirectly, by any person as a result of criminal activity relating to a scheduled offence or the value of any such property or where such property is taken or held outside the country, then the property equivalent in value held within the country or abroad;
Explanation.—For the removal of doubts, it is hereby clarified that "proceeds of crime" include property not only derived or obtained from the scheduled offence but also any property which may directly or indirectly be derived or obtained as a result of any criminal activity relatable to the scheduled offence;
(v) “property” means any property or assets of every description, whether corporeal or incorporeal, movable or immovable, tangible or intangible and includes deeds and instruments evidencing title to, or interest in, such property or assets, wherever located;
Explanation.—For the removal of doubts, it is hereby clarified that the term “property” includes property of any kind used in the commission of an offence under this Act or any of the scheduled offences;
(va) “real estate agent” means a real estate agent as defined in clause (88) of section 65 of the Finance Act, 1994 (32 of 1994);
(w) “records” include the records maintained in the form of books or stored in a computer or such other form as may be prescribed;
(wa) “reporting entity” means a banking company, financial institution, intermediary or a person carrying on a designated business or profession;
(x) “Schedule” means the Schedule to this Act;
(y) “scheduled offence” means—
(i) the offences specified under Part A of the Schedule; or
(ii) the offences specified under Part B of the Schedule if the total value involved in such offences is one crore rupees or more; or
(iii) the offences specified under Part C of the Schedule.
(z) “Special Court” means a Court of Session designated as Special Court under sub-section (1) of section 43;
(za) “transfer” includes sale, purchase, mortgage, pledge, gift, loan or any other form of transfer of right, title, possession or lien;
(zb) “value” means the fair market value of any property on the date of its acquisition by any person, or if such date cannot be determined, the date on which such property is possessed by such person.
(2) Any reference, in this Act or the Schedule, to any enactment or any provision thereof shall, in relation to an area in which such enactment or such provision is not in force, be construed as a reference to the corresponding law or the relevant provisions of the corresponding law, if any, in force in that area.""")

# ==========================================
# CHAPTER II – OFFENCE OF MONEY-LAUNDERING
# ==========================================
add_sec("3", 2, "II", "OFFENCE OF MONEY-LAUNDERING", "Offence of money-laundering",
"""Whosoever directly or indirectly attempts to indulge or knowingly assists or knowingly is a party or is actually involved in any process or activity connected with the proceeds of crime including its concealment, possession, acquisition or use and projecting or claiming it as untainted property shall be guilty of offence of money-laundering.

Explanation.—For the removal of doubts, it is hereby clarified that,—
(i) a person shall be guilty of offence of money-laundering if such person is found to have directly or indirectly attempted to indulge or knowingly assisted or knowingly is a party or is actually involved in one or more of the following processes or activities connected with proceeds of crime, namely:—
(a) concealment; or
(b) possession; or
(c) acquisition; or
(d) use; or
(e) projecting as untainted property; or
(f) claiming as untainted property,
in any manner whatsoever;
(ii) the process or activity connected with proceeds of crime is a continuing activity and continues till such time a person is directly or indirectly enjoying the proceeds of crime by its concealment or possession or acquisition or use or projecting it as untainted property or claiming it as untainted property in any manner whatsoever.""")

add_sec("4", 2, "II", "OFFENCE OF MONEY-LAUNDERING", "Punishment for money-laundering",
"""Whoever commits the offence of money-laundering shall be punishable with rigorous imprisonment for a term which shall not be less than three years but which may extend to seven years and shall also be liable to fine:

Provided that where the proceeds of crime involved in money-laundering relates to any offence specified under paragraph 2 of Part A of the Schedule, the provisions of this section shall have effect as if for the words “which may extend to seven years”, the words “which may extend to ten years” had been substituted.""")

# ==========================================
# CHAPTER III – ATTACHMENT, ADJUDICATION AND CONFISCATION
# ==========================================
add_sec("5", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Attachment of property involved in money-laundering",
"""(1) Where the Director or any other officer not below the rank of Deputy Director authorised by the Director for the purposes of this section, has reason to believe (the reason for such belief to be recorded in writing), on the basis of material in his possession, that—
(a) any person is in possession of any proceeds of crime; and
(b) such proceeds of crime are likely to be concealed, transferred or dealt with in any manner which may result in frustrating any proceedings relating to confiscation of such proceeds of crime under this Chapter,
he may, by order in writing, provisionally attach such property for a period not exceeding one hundred and eighty days from the date of the order, in such manner as may be prescribed:
Provided that no such order of attachment shall be made unless, in relation to the scheduled offence, a report has been forwarded to a Magistrate under section 173 of the Code of Criminal Procedure, 1973 (2 of 1974), or a complaint has been filed by a person authorised to investigate the offence mentioned in that Schedule, before a Magistrate or court for taking cognizance of the scheduled offence, as the case may be, or a similar report or complaint has been made or filed under the corresponding law of any other country:
Provided further that, notwithstanding anything contained in first proviso, any property of any person may be attached under this section if the Director or any other officer not below the rank of Deputy Director authorised by him for the purposes of this section has reason to believe (the reasons for such belief to be recorded in writing), on the basis of material in his possession, that if such property involved in money-laundering is not attached immediately under this Chapter, the non-attachment of the property is likely to frustrate any proceeding under this Act.
Provided also that for the purposes of computing the period of one hundred and eighty days, the period during which the proceedings under this section is stayed by the High Court, shall be excluded and a further period not exceeding thirty days from the date of order of vacation of such stay order shall be counted.

(2) The Director, or any other officer not below the rank of Deputy Director, shall, immediately after attachment under sub-section (1), forward a copy of the order, along with the material in his possession, referred to in that sub-section, to the Adjudicating Authority, in a sealed envelope, in the manner as may be prescribed and such Adjudicating Authority shall keep such order and material for such period as may be prescribed.

(3) Every order of attachment made under sub-section (1) shall cease to have effect after the expiry of the period specified in that sub-section or on the date of an order made under sub-section (3) of section 8, whichever is earlier.

(4) Nothing in this section shall prevent the person interested in the enjoyment of the immovable property attached under sub-section (1) from such enjoyment.
Explanation.—For the purposes of this sub-section, “person interested”, in relation to any immovable property, includes all persons claiming or entitled to claim any interest in the property.

(5) The Director or any other officer who provisionally attaches any property under sub-section (1) shall, within a period of thirty days from such attachment, file a complaint stating the facts of such attachment before the Adjudicating Authority.""")

add_sec("6", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Adjudicating Authorities, composition, powers, etc.",
"""(1) The Central Government shall, by notification, appoint an Adjudicating Authority to exercise jurisdiction, powers and authority conferred by or under this Act.

(2) An Adjudicating Authority shall consist of a Chairperson and two other Members:
Provided that one Member each shall be a person having experience in the field of law, administration, finance or accountancy.

(3) A person shall, however, not be qualified for appointment as Member of an Adjudicating Authority,—
(a) in the field of law, unless he—
(i) is qualified for appointment as District Judge; or
(ii) has been a member of the Indian Legal Service and has held a post in Grade I of that service;
(b) in the field of finance, accountancy or administration unless he possesses such qualifications, as may be prescribed.

(4) The Central Government shall appoint a Member to be the Chairperson of the Adjudicating Authority.

(5) Subject to the provisions of this Act,—
(a) the jurisdiction of the Adjudicating Authority may be exercised by Benches thereof;
(b) a Bench may be constituted by the Chairperson of the Adjudicating Authority with one or two Members as the Chairperson of the Adjudicating Authority may deem fit;
(c) the Benches of the Adjudicating Authority shall ordinarily sit at New Delhi and at such other places as the Central Government may, in consultation with the Chairperson, by notification, specify;
(d) the Central Government shall, by notification, specify the areas in relation to which each Bench of the Adjudicating Authority may exercise jurisdiction.

(6) Notwithstanding anything contained in sub-section (5), the Chairperson may transfer a Member from one Bench to another Bench.

(7) If at any stage of the hearing of any case or matter it appears to the Chairperson or a Member that the case or matter is of such a nature that it ought to be heard by a Bench consisting of two Members, the case or matter may be transferred by the Chairperson or, as the case may be, referred to him for transfer, to such Bench as the Chairperson may deem fit.

(8) The Chairperson and every Member shall hold office as such for a term of five years from the date on which he enters upon his office:
Provided that no Chairperson or other Member shall hold office as such after he has attained the age of sixty-five years.

(9) The salary and allowances payable to and the other terms and conditions of service of the Member shall be such as may be prescribed:
Provided that neither the salary and allowances nor the other terms and conditions of service of the Member shall be varied to his disadvantage after appointment.

(10) If, for reasons other than temporary absence, any vacancy occurs in the office of the Chairperson or any other Member, then, the Central Government shall appoint another person in accordance with the provisions of this Act to fill the vacancy and the proceedings may be continued before the Adjudicating Authority from the stage at which the vacancy is filled.

(11) The Chairperson or any other Member may, by notice in writing under his hand addressed to the Central Government, resign his office:
Provided that the Chairperson or any other Member shall, unless he is permitted by the Central Government to relinquish his office sooner, continue to hold office until the expiry of three months from the date of receipt of such notice or until a person duly appointed as his successor enters upon his office or until the expiry of his term of office, whichever is the earliest.

(12) The Chairperson or any other Member shall not be removed from his office except by an order made by the Central Government after giving necessary opportunity of hearing.

(13) In the event of the occurrence of any vacancy in the office of the Chairperson by reason of his death, resignation or otherwise, the senior-most Member shall act as the Chairperson of the Adjudicating Authority until the date on which a new Chairperson, appointed in accordance with the provisions of this Act to fill such vacancy, enters upon his office.

(14) When the Chairperson of the Adjudicating Authority is unable to discharge his functions owing to absence, illness or any other cause, the senior-most Member shall discharge the functions of the Chairperson of the Adjudicating Authority until the date on which the Chairperson of the Adjudicating Authority resumes his duties.

(15) The Adjudicating Authority shall not be bound by the procedure laid down by the Code of Civil Procedure, 1908 (5 of 1908), but shall be guided by the principles of natural justice and, subject to the other provisions of this Act, the Adjudicating Authority shall have powers to regulate its own procedure.""")

add_sec("7", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Staff of Adjudicating Authorities",
"""(1) The Central Government shall provide each Adjudicating Authority with such officers and employees as that Government may think fit.

(2) The officers and employees of the Adjudicating Authority shall discharge their functions under the general superintendence of the Chairperson of the Adjudicating Authority.

(3) The salaries and allowances and other conditions of service of the officers and employees of the Adjudicating Authority shall be such as may be prescribed.""")

add_sec("8", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Adjudication",
"""(1) On receipt of a complaint under sub-section (5) of section 5, or applications made under sub-section (4) of section 17 or under sub-section (10) of section 18, if the Adjudicating Authority has reason to believe that any person has committed an offence under section 3 or is in possession of proceeds of crime, it may serve a notice of not less than thirty days on such person calling upon him to indicate the sources of his income, earning or assets, out of which or by means of which he has acquired the property attached under sub-section (1) of section 5, or, seized or frozen under section 17 or section 18, the evidence on which he relies and other relevant information and particulars, and to show cause why all or any of such properties should not be declared to be the properties involved in money-laundering and confiscated by the Central Government:
Provided that where a notice under this sub-section specifies any property as being held by a person on behalf of any other person, a copy of such notice shall also be served upon such other person:
Provided further that where such property is held jointly by more than one person, such notice shall be served to all persons holding such property.

(2) The Adjudicating Authority shall, after—
(a) considering the reply, if any, to the notice issued under sub-section (1);
(b) hearing the aggrieved person and the Director or any other officer authorised by him in this behalf; and
(c) taking into account all relevant materials placed on record before him,
by an order, record a finding whether all or any of the properties referred to in the notice issued under sub-section (1) are involved in money-laundering:
Provided that if the property is claimed by a person, other than a person to whom the notice had been issued, such person shall also be given an opportunity of being heard to prove that the property is not involved in money-laundering.

(3) Where the Adjudicating Authority decides under sub-section (2) that any property is involved in money-laundering, he shall, by an order in writing, confirm the attachment of the property made under sub-section (1) of section 5 or retention of property or record seized or frozen under section 17 or section 18 and record a finding to that effect, whereupon such attachment or retention or freezing of the seized or frozen property or record shall—
(a) continue during investigation for a period not exceeding three hundred and sixty-five days or the pendency of the proceedings relating to any offence under this Act before a court or under the corresponding law of any other country, before the competent court of criminal jurisdiction outside India, as the case may be; and
(b) become final after an order of confiscation is passed under sub-section (5) or sub-section (7) of section 8 or section 58B or sub-section (2A) of section 60 by the Special Court;
Explanation.—For the purposes of computing the period of three hundred and sixty-five days under clause (a), the period during which the investigation is stayed by any court under any law for the time being in force shall be excluded.

(4) Where the provisional order of attachment made under sub-section (1) of section 5 has been confirmed under sub-section (3), the Director or any other officer authorised by him in this behalf shall forthwith take the possession of the property attached under section 5 or frozen under sub-section (1A) of section 17, in such manner as may be prescribed:
Provided that if it is not practicable to take possession of a property frozen under sub-section (1A) of section 17, the order of confiscation shall have the same effect as if the property had been taken possession of.

(5) Where on conclusion of a trial of an offence under this Act, the Special Court finds that the offence of money-laundering has been committed, it shall order that such property involved in the money-laundering or which has been used for commission of the offence of money-laundering shall stand confiscated to the Central Government.

(6) Where on conclusion of a trial under this Act, the Special Court finds that the offence of money-laundering has not taken place or the property is not involved in money-laundering, it shall order release of such property to the person entitled to receive it.

(7) Where the trial under this Act cannot be conducted by reason of the death of the accused or the accused being declared a proclaimed offender or for any other reason or having commenced but could not be concluded, the Special Court shall, on an application moved by the Director or a person claiming to be entitled to possession of a property in respect of which an order has been passed under sub-section (3) of section 8, pass appropriate orders regarding confiscation or release of the property, as the case may be, involved in the offence of money-laundering after having regard to the material before it.

(8) Where a property stands confiscated to the Central Government under sub-section (5), the Special Court, in such manner as may be prescribed, may also direct the Central Government to restore such confiscated property or part thereof of a claimant with a legitimate interest in the property, who may have suffered a quantifiable loss as a result of the offence of money laundering:
Provided that the Special Court shall not consider such claim unless it is satisfied that the claimant has acted in good faith and has suffered the loss despite having taken all reasonable precautions and is not involved in the offence of money laundering:
Provided further that the Special Court may, if it thinks fit, consider the claim of the claimant for the purposes of restoration of such properties during the trial of the case in such manner as may be prescribed.""")

add_sec("9", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Vesting of property in Central Government",
"""Where an order of confiscation has been made under sub-section (5) or sub-section (7) of section 8 or section 58B or sub-section (2A) of section 60 in respect of any property of a person, all the rights and title in such property shall vest absolutely in the Central Government free from all encumbrances:

Provided that where the Special Court or the Adjudicating Authority, as the case may be, after giving an opportunity of being heard to any other person interested in the property attached under this Chapter, or seized or frozen under Chapter V, is of the opinion that any encumbrance on the property or lease-hold interest has been created with a view to defeat the provisions of this Chapter, it may, by order, declare such encumbrance or lease-hold interest to be void and thereupon the aforesaid property shall vest in the Central Government free from such encumbrances or lease-hold interest:

Provided further that nothing in this section shall operate to discharge any person from any liability in respect of such encumbrances which may be enforced against such person by a suit for damages.""")

add_sec("10", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Management of properties confiscated under this Chapter",
"""(1) The Central Government may, by order published in the Official Gazette, appoint as many of its officers (not below the rank of a Joint Secretary to the Government of India) as it thinks fit to perform the functions of an Administrator.

(2) The Administrator appointed under sub-section (1) shall receive and manage the property in relation to which an order has been made under sub-section (5) or sub-section (6) or sub-section (7) of section 8 or section 58B or sub-section (2A) of section 60 in such manner and subject to such conditions as may be prescribed.

(3) The Administrator shall also take such measures, as the Central Government may direct, to dispose of the property which is vested in the Central Government under section 9.""")

add_sec("11", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Power regarding summons, production of documents and evidence, etc.",
"""(1) The Adjudicating Authority shall, for the purposes of this Act, have the same powers as are vested in a civil court under the Code of Civil Procedure, 1908 (5 of 1908) while trying a suit in respect of the following matters, namely:—
(a) discovery and inspection;
(b) enforcing the attendance of any person, including any officer of a banking company or a financial institution or a company, and examining him on oath;
(c) compelling the production of records;
(d) receiving evidence on affidavits;
(e) issuing commissions for examination of witnesses and documents; and
(f) any other matter which may be prescribed.

(2) All the persons so summoned shall be bound to attend in person or through authorised agents, as the Adjudicating Authority may direct, and shall be bound to state the truth upon any subject respecting which they are examined or make statements, and produce such documents as may be required.

(3) Every proceeding under this section shall be deemed to be a judicial proceeding within the meaning of section 193 and section 228 of the Indian Penal Code (45 of 1860).""")

add_sec("11A", 3, "III", "ATTACHMENT, ADJUDICATION AND CONFISCATION", "Verification of Identity by Reporting Entity",
"""(1) Every Reporting Entity shall verify the identity of its clients and the beneficial owner, by—
(a) authentication under the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 (18 of 2016) if the reporting entity is a banking company; or
(b) offline verification under the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 (18 of 2016); or
(c) use of passport issued under section 4 of the Passports Act, 1967 (15 of 1967); or
(d) use of any other officially valid document or modes of identification as may be notified by the Central Government in this behalf:
Provided that the Central Government may, if satisfied that a reporting entity other than banking company, complies with the standards of privacy and security under the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 (18 of 2016), and it is necessary and expedient to do so, by notification, permit such entity to perform authentication under clause (a):
Provided further that no notification under the first proviso shall be issued without consultation with the Unique Identification Authority of India established under sub-section (1) of section 11 of the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 (18 of 2016) and the appropriate regulator.

(2) If any reporting entity performs authentication under clause (a) of sub-section (1), to verify the identity of its client or the beneficial owner it shall make the other modes of identification under clauses (b), (c) and (d) of sub-section (1) also available to such client or the beneficial owner.

(3) The use of modes of identification under sub-section (1) shall be a voluntary choice of every client or beneficial owner who is sought to be identified and no client or beneficial owner shall be denied services for not having an Aadhaar number.

(4) If, for identification of a client or beneficial owner, authentication or offline verification under clause (a) or clause (b) of sub-section (1) is used, neither his core biometric information nor his Aadhaar number shall be stored.

(5) Nothing in this section shall prevent the Central Government from notifying additional safeguards on any reporting entity in respect of verification of the identity of its client or beneficial owner.

Explanation.—The expressions “Aadhaar number” and “core biometric information” shall have the same meanings as are respectively assigned to them in clauses (a) and (j) of section 2 of the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 (18 of 2016).""")

# ==========================================
# CHAPTER IV – OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES
# ==========================================
add_sec("12", 4, "IV", "OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES", "Reporting entity to maintain records",
"""(1) Every reporting entity shall—
(a) maintain a record of all transactions, including information relating to transactions covered under clause (b), in such manner as to enable it to reconstruct individual transactions;
(b) furnish to the Director within such time as may be prescribed, information relating to such transactions, whether attempted or executed, the nature and value of which may be prescribed;
(e) maintain record of documents evidencing identity of its clients and beneficial owners as well as account files and business correspondence relating to its clients.

(2) Every information maintained, furnished or verified, save as otherwise provided under any law for the time being in force, shall be kept confidential.

(3) The records referred to in clause (a) of sub-section (1) shall be maintained for a period of five years from the date of transaction between a client and the reporting entity.

(4) The records referred to in clause (e) of sub-section (1) shall be maintained for a period of five years after the business relationship between a client and the reporting entity has ended or the account has been closed, whichever is later.

(5) The Central Government may, by notification, exempt any reporting entity or class of reporting entities from any obligation under this Chapter.""")

add_sec("12A", 4, "IV", "OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES", "Access to information",
"""(1) The Director may call for from any reporting entity any of the records referred to in section 11A, sub-section (1) of section 12, sub-section (1) of section 12AA and any additional information as he considers necessary for the purposes of this Act.

(2) Every reporting entity shall furnish to the Director such information as may be required by him under sub-section (1) within such time and in such manner as he may specify.

(3) Save as otherwise provided under any law for the time being in force, every information sought by the Director under sub-section (1), shall be kept confidential.""")

add_sec("12AA", 4, "IV", "OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES", "Enhanced due diligence",
"""(1) Every reporting entity shall, prior to the commencement of each specified transaction,—
(a) verify the identity of the clients undertaking such specified transaction by authentication under the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 (18 of 2016) in such manner and subject to such conditions, as may be prescribed:
Provided that where verification requires authentication of a person who is not entitled to obtain an Aadhaar number under the provisions of the said Act, verification to authenticate the identity of the client undertaking such specified transaction shall be carried out by such other process or mode, as may be prescribed;
(b) take additional steps to examine the ownership and financial position, including sources of funds of the client, in such manner as may be prescribed;
(c) take additional steps as may be prescribed to record the purpose behind conducting the specified transaction and the intended nature of the relationship between the transaction parties.

(2) Where the client fails to fulfill the conditions laid down under sub-section (1), the reporting entity shall not allow the specified transaction to be carried out.

(3) Where any specified transaction or series of specified transactions undertaken by a client is considered suspicious or likely to involve proceeds of crime, the reporting entity shall increase the future monitoring of the business relationship with the client, including greater scrutiny or transactions in such manner as may be prescribed.

(4) The information obtained while applying the enhanced due diligence measures under sub-section (1) shall be maintained for a period of five years from the date of transaction between a client and the reporting entity.

Explanation.—For the purposes of this section, "specified transaction" means—
(a) any withdrawal or deposit in cash, exceeding such amount;
(b) any transaction in foreign exchange, exceeding such amount;
(c) any transaction in any high value imports or remittances;
(d) such other transaction or class of transactions, in the interest of revenue or where there is a high risk or money-laundering or terrorist financing, as may be prescribed.""")

add_sec("13", 4, "IV", "OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES", "Powers of Director to impose fine",
"""(1) The Director may, either of his own motion or on an application made by any authority, officer or person, make such inquiry or cause such inquiry to be made, as he thinks fit to be necessary, with regard to the obligations of the reporting entity, under this Chapter.

(1A) If at any stage of inquiry or any other proceedings before him, the Director having regard to the nature and complexity of the case, is of the opinion that it is necessary to do so, he may direct the concerned reporting entity to get its records, as may be specified, audited by an accountant from amongst a panel of accountants, maintained by the Central Government for this purpose.

(1B) The expenses of, and incidental to, any audit under sub-section (1A) shall be borne by the Central Government.

(2) If the Director, in the course of any inquiry, finds that a reporting entity or its designated director on the Board or any of its employees has failed to comply with the obligations under this Chapter, then, without prejudice to any other action that may be taken under any other provisions of this Act, he may—
(a) issue a warning in writing; or
(b) direct such reporting entity or its designated director on the Board or any of its employees, to comply with specific instructions; or
(c) direct such reporting entity or its designated director on the Board or any of its employees, to send reports at such interval as may be prescribed on the measures it is taking; or
(d) by an order, impose a monetary penalty on such reporting entity or its designated director on the Board or any of its employees, which shall not be less than ten thousand rupees but may extend to one lakh rupees for each failure.

(3) The Director shall forward a copy of the order passed under sub-section (2) to every banking company, financial institution or intermediary or person who is a party to the proceedings under that sub-section.

Explanation.—For the purpose of this section, “accountant” shall mean a chartered accountant within the meaning of the Chartered Accountants Act, 1949 (38 of 1949).""")

add_sec("14", 4, "IV", "OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES", "No civil or criminal proceedings against reporting entity, its directors and employees in certain cases",
"""Save as otherwise provided in section 13, the reporting entity, its directors and employees shall not be liable to any civil or criminal proceedings against them for furnishing information under clause (b) of sub-section (1) of section 12.""")

add_sec("15", 4, "IV", "OBLIGATIONS OF BANKING COMPANIES, FINANCIAL INSTITUTIONS AND INTERMEDIARIES", "Procedure and manner of furnishing information by reporting entities",
"""The Central Government may, in consultation with the Reserve Bank of India, prescribe the procedure and the manner of maintaining and furnishing information by a reporting entity under section 11A, sub-section (1) of section 12 and sub-section (1) of section 12AA for the purpose of implementing the provisions of this Act.""")

# ==========================================
# CHAPTER V – SUMMONS, SEARCHES AND SEIZURES, ETC.
# ==========================================
add_sec("16", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Power of survey",
"""(1) Notwithstanding anything contained in any other provisions of this Act, where an authority, on the basis of material in his possession, has reason to believe (the reasons for such belief to be recorded in writing) that an offence under section 3 has been committed, he may enter any place—
(i) within the limits of the area assigned to him; or
(ii) in respect of which he is authorised for the purposes of this section by such other authority, who is assigned the area within which such place is situated,
at which any act constituting the commission of such offence is carried on, and may require any proprietor, employee or any other person who may at that time and place be attending in any manner to, or helping in, such act so as to,—
(i) afford him the necessary facility to inspect such records as he may require and which may be available at such place;
(ii) afford him the necessary facility to check or verify the proceeds of crime or any transaction related to proceeds of crime which may be found therein; and
(iii) furnish such information as he may require as to any matter which may be useful for, or relevant to, any proceedings under this Act.
Explanation—For the purposes of this sub-section, a place, where an act which constitutes the commission of the offence is carried on, shall also include any other place, whether any activity is carried on therein or not, in which the person carrying on such activity states that any of his records or any part of his property relating to such act are or is kept.

(2) The authority referred to in sub-section (1) shall, after entering any place referred to in that sub-section immediately after completion of survey, forward a copy of the reasons so recorded along with material in his possession, referred to in that sub-section, to the Adjudicating Authority in a sealed envelope, in the manner as may be prescribed and such Adjudicating Authority shall keep such reasons and material for such period as may be prescribed.

(3) An authority acting under this section may—
(i) place marks of identification on the records inspected by him and make or cause to be made extracts or copies there from,
(ii) make an inventory of any property checked or verified by him, and
(iii) record the statement of any person present in the place which may be useful for, or relevant to, any proceeding under this Act.""")

add_sec("17", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Search and seizure",
"""(1) Where the Director or any other officer not below the rank of Deputy Director authorised by him for the purposes of this section, on the basis of information in his possession, has reason to believe (the reason for such belief to be recorded in writing) that any person—
(i) has committed any act which constitutes money-laundering, or
(ii) is in possession of any proceeds of crime involved in money-laundering, or
(iii) is in possession of any records relating to money-laundering, or
(iv) is in possession of any property related to crime,
then, subject to the rules made in this behalf, he may authorise any officer subordinate to him to—
(a) enter and search any building, place, vessel, vehicle or aircraft where he has reason to suspect that such records or proceeds of crime are kept;
(b) break open the lock of any door, box, locker, safe, almirah or other receptacle for exercising the powers conferred by clause (a) where the keys thereof are not available;
(c) seize any record or property found as a result of such search;
(d) place marks of identification on such record or property, if required or make or cause to be made extracts or copies therefrom;
(e) make a note or an inventory of such record or property;
(f) examine on oath any person, who is found to be in possession or control of any record or property, in respect of all matters relevant for the purposes of any investigation under this Act:

(1A) Where it is not practicable to seize such record or property, the officer authorised under sub-section (1), may make an order to freeze such property whereupon the property shall not be transferred or otherwise dealt with, except with the prior permission of the officer making such order, and a copy of such order shall be served on the person concerned:
Provided that if, at any time before its confiscation under sub-section (5) or sub-section (7) of section 8 or section 58B or sub-section (2A) of section 60, it becomes practical to seize a frozen property, the officer authorised under sub-section (1) may seize such property.

(2) The authority, who has been authorised under sub-section (1) shall, immediately after search and seizure or upon issuance of a freezing order, forward a copy of the reasons so recorded along with material in his possession, referred to in that sub-section, to the Adjudicating Authority in a sealed envelope, in the manner, as may be prescribed and such Adjudicating Authority shall keep such reasons and material for such period, as may be prescribed.

(3) Where an authority, upon information obtained during survey under section 16, is satisfied that any evidence shall be or is likely to be concealed or tampered with, he may, for reasons to be recorded in writing, enter and search the building or place where such evidence is located and seize that evidence:
Provided that no authorisation referred to in sub-section (1) shall be required for search under this sub-section.

(4) The authority seizing any record or property under sub-section (1) or freezing any record or property under sub-section (1A) shall, within a period of thirty days from such seizure or freezing, as the case may be, file an application, requesting for retention of such record or property seized under sub-section (1) or for continuation of the order of freezing served under sub-section (1A), before the Adjudicating Authority.""")

add_sec("18", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Search of persons",
"""(1) If an authority, authorised in this behalf by the Central Government by general or special order, has reason to believe (the reason for such belief to be recorded in writing) that any person has secreted about his person or in anything under his possession, ownership or control, any record or proceeds of crime which may be useful for or relevant to any proceedings under this Act, he may search that person and seize such record or property which may be useful for or relevant to any proceedings under this Act.

(2) The authority, who has been authorised under sub-section (1) shall, immediately after search and seizure, forward a copy of the reasons so recorded along with material in his possession, referred to in that sub-section, to the Adjudicating Authority in a sealed envelope, in the manner, as may be prescribed and such Adjudicating Authority shall keep such reasons and material for such period, as may be prescribed.

(3) Where an authority is about to search any person, he shall, if such person so requires, take such person within twenty-four hours to the nearest Gazetted Officer, superior in rank to him, or a Magistrate:
Provided that the period of twenty-four hours shall exclude the time necessary for the journey undertaken to take such person to the nearest Gazetted Officer, superior in rank to him, or Magistrate’s Court.

(4) If the requisition under sub-section (3) is made, the authority shall not detain the person for more than twenty-four hours prior to taking him before the Gazetted Officer, superior in rank to him, or the Magistrate referred to in that sub-section:
Provided that the period of twenty-four hours shall exclude the time necessary for the journey from the place of detention to the office of the Gazetted Officer, superior in rank to him, or the Magistrate’s Court.

(5) The Gazetted Officer or the Magistrate before whom any such person is brought shall, if he sees no reasonable ground for search, forthwith discharge such person but otherwise shall direct that search be made.

(6) Before making the search under sub-section (1) or sub-section (5), the authority shall call upon two or more persons to attend and witness the search, and the search shall be made in the presence of such persons.

(7) The authority shall prepare a list of record or property seized in the course of the search and obtain the signatures of the witnesses on the list.

(8) No female shall be searched by any one except a female.

(9) The authority shall record the statement of the person searched under sub-section (1) or sub-section (5) in respect of the records or proceeds of crime found or seized in the course of the search.

(10) The authority, seizing any record or property under sub-section (1) shall, within a period of thirty days from such seizure, file an application requesting for retention of such record or property, before the Adjudicating Authority.""")

add_sec("19", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Power to arrest",
"""(1) If the Director, Deputy Director, Assistant Director or any other officer authorised in this behalf by the Central Government by general or special order, has on the basis of material in his possession, reason to believe (the reason for such belief to be recorded in writing) that any person has been guilty of an offence punishable under this Act, he may arrest such person and shall, as soon as may be, inform him of the grounds for such arrest.

(2) The Director, Deputy Director, Assistant Director or any other officer shall, immediately after arrest of such person under sub-section (1), forward a copy of the order along with the material in his possession, referred to in that sub-section, to the Adjudicating Authority in a sealed envelope, in the manner, as may be prescribed and such Adjudicating Authority shall keep such order and material for such period, as may be prescribed.

(3) Every person arrested under sub-section (1) shall, within twenty-four hours, be taken to a Special Court or Judicial Magistrate or a Metropolitan Magistrate, as the case may be, having jurisdiction:
Provided that the period of twenty-four hours shall exclude the time necessary for the journey from the place of arrest to the Special Court or Magistrate’s Court.""")

add_sec("20", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Retention of property",
"""(1) Where any property has been seized under section 17 or section 18 or frozen under sub-section (1A) of section 17 and the officer authorised by the Director in this behalf has, on the basis of material in his possession, reason to believe (the reason for such belief to be recorded by him in writing) that such property is required to be retained for the purposes of adjudication under section 8, such property may, if seized, be retained or if frozen, may continue to remain frozen, for a period not exceeding one hundred and eighty days from the day on which such property was seized or frozen, as the case may be.

(2) The officer authorised by the Director shall, immediately after he has passed an order for retention or continuation of freezing of the property for purposes of adjudication under section 8, forward a copy of the order along with the material in his possession, referred to in sub-section (1), to the Adjudicating Authority, in a sealed envelope, in the manner as may be prescribed and such Adjudicating Authority shall keep such order and material for such period as may be prescribed.

(3) On the expiry of the period specified in sub-section (1), the property shall be returned to the person from whom such property was seized or whose property was ordered to be frozen unless the Adjudicating Authority permits retention or continuation of freezing of such property beyond the said period.

(4) The Adjudicating Authority, before authorising the retention or continuation of freezing of such property beyond the period specified in sub-section (1), shall satisfy himself that the property is prima facie involved in money-laundering and the property is required for the purposes of adjudication under section 8.

(5) After passing the order of confiscation under sub-section (5) or sub-section (7) of section 8, Special Court, shall direct the release of all property other than the property involved in money-laundering to the person from whom such property was seized or the persons entitled to receive it.

(6) Where an order releasing the property has been made by the Special Court under sub-section (6) of section 8 or by the Adjudicating Authority under section 58B or sub-section (2A) of section 60, the Director or any officer authorised by him in this behalf may withhold the release of any such property for a period of ninety days from the date of receipt of such order, if he is of the opinion that such property is relevant for the appeal proceedings under this Act.""")

add_sec("21", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Retention of records",
"""(1) Where any records have been seized, under section 17 or section 18 or frozen under sub-section (1A) of section 17 and the Investigating Officer or any other officer authorised by the Director in this behalf has reason to believe that any of such records are required to be retained for any inquiry under this Act, such records may if seized, be retained or if frozen, may continue to remain frozen, for a period not exceeding one hundred and eighty days from the day on which such records were seized or frozen, as the case may be.

(2) The person, from whom records seized or frozen, shall be entitled to obtain copies of records.

(3) On the expiry of the period specified under sub-section (1), the records shall be returned to the person from whom such records were seized or whose records were ordered to be frozen unless the Adjudicating Authority permits retention or continuation of freezing of such records beyond the said period.

(4) The Adjudicating Authority, before authorising the retention or continuation of freezing of such records beyond the period specified in sub-section (1), shall satisfy himself that the records are required for the purposes of adjudication under section 8.

(5) After passing of an order of confiscation or release under sub-section (5) or sub-section (6) or sub-section (7) of section 8 or section 58B or sub-section (2A) of section 60, the Adjudicating Authority shall direct the release of the records to the person from whom such records were seized.

(6) Where an order releasing the records has been made by the Adjudicating Authority under sub-section (5) of section 21, the Director or any other officer authorised by him in this behalf may withhold the release of any such record for a period of ninety days from the date of receipt of such order, if he is of the opinion that such record is relevant for the appeal proceedings under this Act.""")

add_sec("22", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Presumption as to records or property in certain cases",
"""(1) Where any records or property are or is found in the possession or control of any person in the course of a survey or a search or where any record or property is produced by any person or has been resumed or seized from the custody or control of any person or has been frozen under this Act or under any other law for the time being in force, it shall be presumed that—
(i) such records or property belong or belongs to such person;
(ii) the contents of such records are true; and
(iii) the signature and every other part of such records which purport to be in the handwriting of any particular person or which may reasonably be assumed to have been signed by, or to be in the handwriting of, any particular person, are in that person’s handwriting, and in the case of a record, stamped, executed or attested, that it was executed or attested by the person by whom it purports to have been so stamped, executed or attested.

(2) Where any records have been received from any place outside India, duly authenticated by such authority or person and in such manner as may be prescribed, in the course of proceedings under this Act, the Special Court, the Appellate Tribunal or the Adjudicating Authority, as the case may be, shall—
(a) presume, that the signature and every other part of such record which purports to be in the handwriting of any particular person or which the court may reasonably assume to have been signed by, or to be in the handwriting of, any particular person, is in that person’s handwriting; and in the case of a record executed or attested, that it was executed or attested by the person by whom it purports to have been so executed or attested;
(b) admit the document in evidence, notwithstanding that it is not duly stamped, if such document is otherwise admissible in evidence.""")

add_sec("23", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Presumption in inter-connected transactions",
"""Where money-laundering involves two or more inter-connected transactions and one or more such transactions is or are proved to be involved in money-laundering, then for the purposes of adjudication or confiscation under section 8 or for the trial of the money-laundering offence, it shall unless otherwise proved to the satisfaction of the Adjudicating Authority or the Special Court, be presumed that the remaining transactions form part of such inter-connected transactions.""")

add_sec("24", 5, "V", "SUMMONS, SEARCHES AND SEIZURES, ETC.", "Burden of proof",
"""In any proceeding relating to proceeds of crime under this Act,—
(a) in the case of a person charged with the offence of money-laundering under section 3, the Authority or Court shall, unless the contrary is proved, presume that such proceeds of crime are involved in money-laundering; and
(b) in the case of any other person the Authority or Court, may presume that such proceeds of crime are involved in money-laundering.""")

# ==========================================
# CHAPTER VI – APPELLATE TRIBUNAL
# ==========================================
add_sec("25", 6, "VI", "APPELLATE TRIBUNAL", "Appellate Tribunal",
"""The Appellate Tribunal constituted under sub-section (1) of section 12 of the Smugglers and Foreign Exchange Manipulators (Forfeiture of Property) Act, 1976 (13 of 1976) shall be the Appellate Tribunal for hearing appeals against the orders of the Adjudicating Authority and the other authorities under this Act.""")

add_sec("26", 6, "VI", "APPELLATE TRIBUNAL", "Appeal to Appellate Tribunal",
"""(1) Save as otherwise provided in sub-section (3), the Director or any person aggrieved by an order made by the Adjudicating Authority under this Act, may prefer an appeal to the Appellate Tribunal.

(2) Any reporting entity aggrieved by any order of the Director made under sub-section (2) of section 13, may prefer an appeal to the Appellate Tribunal.

(3) Every appeal preferred under sub-section (1) or sub-section (2) shall be filed within a period of forty-five days from the date on which a copy of the order made by the Adjudicating Authority or Director is received and it shall be in such form and be accompanied by such fee as may be prescribed:
Provided that the Appellate Tribunal may, after giving an opportunity of being heard, entertain an appeal after the expiry of the said period of forty-five days if it is satisfied that there was sufficient cause for not filing it within that period.

(4) On receipt of an appeal under sub-section (1) or sub-section (2), the Appellate Tribunal may, after giving the parties to the appeal an opportunity of being heard, pass such orders thereon as it thinks fit, confirming, modifying or setting aside the order appealed against.

(5) The Appellate Tribunal shall send a copy of every order made by it to the parties to the appeal and to the concerned Adjudicating Authority or the Director, as the case may be.

(6) The appeal filed before the Appellate Tribunal under sub-section (1) or sub-section (2) shall be dealt with by it as expeditiously as possible and endeavour shall be made by it to dispose of the appeal finally within six months from the date of filing of the appeal.""")

add_sec("27", 6, "VI", "APPELLATE TRIBUNAL", "[Compositions, etc., of Appellate Tribunal.]",
"""[Compositions, etc., of Appellate Tribunal.] Omitted by the Finance Act, 2016 (28 of 2016), s. 232 (w.e.f. 1-6-2016).""")

add_sec("28", 6, "VI", "APPELLATE TRIBUNAL", "[Qualifications for appointment.]",
"""[Qualifications for appointment.] Omitted by the Finance Act, 2016 (28 of 2016), s. 232 (w.e.f. 1-6-2016).""")

add_sec("29", 6, "VI", "APPELLATE TRIBUNAL", "[Term of office.]",
"""[Term of office.] Omitted by the Prevention of Money-laundering (Amendment) Act, 2005 (20 of 2005), s. 4 (w.e.f. 1-7-2005).""")

add_sec("30", 6, "VI", "APPELLATE TRIBUNAL", "[Conditions of service.]",
"""[Conditions of service.] Omitted by the Finance Act, 2016 (28 of 2016), s. 232 (w.e.f. 1-6-2016).""")

add_sec("31", 6, "VI", "APPELLATE TRIBUNAL", "[Vacancies.]",
"""[Vacancies.] Omitted by the Finance Act, 2016 (28 of 2016), s. 232 (w.e.f. 1-6-2016).""")

add_sec("32", 6, "VI", "APPELLATE TRIBUNAL", "[Resignation and removal.]",
"""[Resignation and removal.] Omitted by the Finance Act, 2016 (28 of 2016), s. 232 (w.e.f. 1-6-2016).""")

add_sec("33", 6, "VI", "APPELLATE TRIBUNAL", "[Member to act as Chairperson in certain circumstances.]",
"""[Member to act as Chairperson in certain circumstances.] Omitted by the Finance Act, 2016 (28 of 2016), s. 232 (w.e.f. 1-6-2016).""")

add_sec("34", 6, "VI", "APPELLATE TRIBUNAL", "[Staff of Appellate Tribunal.]",
"""[Staff of Appellate Tribunal.] Omitted by the Finance Act, 2016 (28 of 2016), s. 232 (w.e.f. 1-6-2016).""")

add_sec("35", 6, "VI", "APPELLATE TRIBUNAL", "Procedure and powers of Appellate Tribunal",
"""(1) The Appellate Tribunal shall not be bound by the procedure laid down by the Code of Civil Procedure, 1908 (5 of 1908), but shall be guided by the principles of natural justice and, subject to the other Provisions of this Act, the Appellate Tribunal shall have powers to regulate its own procedure.

(2) The Appellate Tribunal shall have, for the purposes of discharging its functions under this Act, the same powers as are vested in a civil court under the Code of Civil Procedure, 1908 (5 of 1908) while trying a suit, in respect of the following matters, namely:—
(a) summoning and enforcing the attendance of any person and examining him on oath;
(b) requiring the discovery and production of documents;
(c) receiving evidence on affidavits;
(d) subject to the provisions of sections 123 and 124 of the Indian Evidence Act, 1872 (1 of 1872), requisitioning any public record or document or copy of such record or document from any office;
(e) issuing commissions for the examination of witnesses or documents;
(f) reviewing its decisions;
(g) dismissing a representation for default or deciding it ex parte;
(h) setting aside any order of dismissal of any representation for default or any order passed by it ex parte; and
(i) any other matter, which may be, prescribed by the Central Government.

(3) An order made by the Appellate Tribunal under this Act shall be executable by the Appellate Tribunal as a decree of civil court and, for this purpose, the Appellate Tribunal shall have all the powers of a civil court.

(4) Notwithstanding anything contained in sub-section (3), the Appellate Tribunal may transmit any order made by it to a civil court having local jurisdiction and such civil court shall execute the order as if it were a decree made by that court.

(5) All proceedings before the Appellate Tribunal shall be deemed to be judicial proceedings within the meaning of sections 193 and 228 of the Indian Penal Code (45 of 1860) and the Appellate Tribunal shall be deemed to be a civil court for the purposes of sections 345 and 346 of the Code of Criminal Procedure, 1973 (2 of 1974).""")

add_sec("36", 6, "VI", "APPELLATE TRIBUNAL", "Distribution of business amongst Benches",
"""Where any Benches are constituted, the Chairman may, from time to time, by notification, make provisions as to the distribution of the business of the Appellate Tribunal amongst the Benches and also provide for the matters which may be dealt with by each Bench.""")

add_sec("37", 6, "VI", "APPELLATE TRIBUNAL", "Power of Chairperson to transfer cases",
"""On the application of any of the parties and after notice to the parties, and after hearing such of them as he may desire to be heard, or on his own motion without such notice, the Chairman may transfer any case pending before one Bench, for disposal, to any other Bench.""")

add_sec("38", 6, "VI", "APPELLATE TRIBUNAL", "Decision to be by majority",
"""If the Members of a Bench consisting of two Members differ in opinion on any point, they shall state the point or points on which they differ, and make a reference to the Chairman who shall either hear the point or points himself or refer the case for hearing on such point or points by third Member of the Appellate Tribunal and such point or points shall be decided according to the opinion of the majority of the Members of the Appellate Tribunal who have heard the case, including those who first heard it.""")

add_sec("39", 6, "VI", "APPELLATE TRIBUNAL", "Right of appellant to take assistance of authorised representative and of Government to appoint presenting officers",
"""(1) A person preferring an appeal to the Appellate Tribunal under this Act may either appear in person or take the assistance of an authorised representative of his choice to present his case before the Appellate Tribunal.
Explanation.—For the purposes of this sub-section, the expression “authorised representative” shall have the same meaning as assigned to it under sub-section (2) of section 288 of the Income-tax Act, 1961 (43 of 1961).

(2) The Central Government or the Director may authorise one or more authorised representatives or any of its officers to act as presenting officers and every person so authorised may present the case with respect to any appeal before the Appellate Tribunal.""")

add_sec("40", 6, "VI", "APPELLATE TRIBUNAL", "Members, etc., to be public servants",
"""The Chairman, Members and other officers and employees of the Appellate Tribunal, the Adjudicating Authority, Director and the officers subordinate to him shall be deemed to be public servants within the meaning of section 21 of the Indian Penal Code (45 of 1860).""")

add_sec("41", 6, "VI", "APPELLATE TRIBUNAL", "Civil court not to have jurisdiction",
"""No civil court shall have jurisdiction to entertain any suit or proceeding in respect of any matter which the Director, an Adjudicating Authority or the Appellate Tribunal is empowered by or under this Act to determine and no injunction shall be granted by any court or other authority in respect of any action taken or to be taken in pursuance of any power conferred by or under this Act.""")

add_sec("42", 6, "VI", "APPELLATE TRIBUNAL", "Appeal to High Court",
"""Any person aggrieved by any decision or order of the Appellate Tribunal may file an appeal to the High Court within sixty days from the date of communication of the decision or order of the Appellate Tribunal to him on any question of law or fact arising out of such order:
Provided that the High Court may, if it is satisfied that the appellant was prevented by sufficient cause from filing the appeal within the said period, allow it to be filed within a further period not exceeding sixty days.

Explanation.—For the purposes of this section, “High Court” means—
(i) the High Court within the jurisdiction of which the aggrieved party ordinarily resides or carries on business or personally works for gain; and
(ii) where the Central Government is the aggrieved party, the High Court within the jurisdiction of which the respondent, or in a case where there are more than one respondent, any of the respondents, ordinarily resides or carries on business or personally works for gain.""")

# ==========================================
# CHAPTER VII – SPECIAL COURTS
# ==========================================
add_sec("43", 7, "VII", "SPECIAL COURTS", "Special Courts",
"""(1) The Central Government, in consultation with the Chief Justice of the High Court, shall, for trial of offence punishable under section 4, by notification, designate one or more Courts of Session as Special Court or Special Courts or such area or areas or for such case or class or group of cases as may be specified in the notification.
Explanation.—In this sub-section, “High Court” means the High Court of the State in which a Sessions Court designated as Special Court was functioning immediately before such designation.

(2) While trying an offence under this Act, a Special Court shall also try an offence, other than an offence referred to in sub-section (1), with which the accused may, under the Code of Criminal Procedure, 1973 (2 of 1974), be charged at the same trial.""")

add_sec("44", 7, "VII", "SPECIAL COURTS", "Offences triable by Special Courts",
"""(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974),—
(a) an offence punishable under section 4 and any scheduled offence connected to the offence under that section shall be triable by the Special Court constituted for the area in which the offence has been committed:
Provided that the Special Court, trying a scheduled offence before the commencement of this Act, shall continue to try such scheduled offence; or
(b) a Special Court may, upon a complaint made by an authority authorised in this behalf under this Act take cognizance of offence under section 3, without the accused being committed to it for trial;
Provided that after conclusion of investigation, if no offence of money-laundering is made out requiring filing of such complaint, the said authority shall submit a closure report before the Special Court; or
(c) if the court which has taken cognizance of the scheduled offence is other than the Special Court which has taken cognizance of the complaint of the offence of money-laundering under sub-clause (b), it shall, on an application by the authority authorised to file a complaint under this Act, commit the case relating to the scheduled offence to the Special Court and the Special Court shall, on receipt of such case proceed to deal with it from the stage at which it is committed.
(d) a Special Court while trying the scheduled offence or the offence of money-laundering shall hold trial in accordance with the provisions of the Code of Criminal Procedure, 1973 (2 of 1974) as it applies to a trial before a Court of Session.

Explanation.—For the removal of doubts, it is clarified that,—
(i) the jurisdiction of the Special Court while dealing with the offence under this Act, during investigation, enquiry or trial under this Act, shall not be dependent upon any orders passed in respect of the scheduled offence, and the trial of both sets of offences by the same court shall not be construed as joint trial;
(ii) the complaint shall be deemed to include any subsequent complaint in respect of further investigation that may be conducted to bring any further evidence, oral or documentary, against any accused person involved in respect of the offence, for which complaint has already been filed, whether named in the original complaint or not.

(2) Nothing contained in this section shall be deemed to affect the special powers of the High Court regarding bail under section 439 of the Code of Criminal Procedure, 1973 (2 of 1974) and the High Court may exercise such powers including the power under clause (b) of sub-section (1) of that section as if the reference to “Magistrate” in that section includes also a reference to a “Special Court” designated under section 43.""")

add_sec("45", 7, "VII", "SPECIAL COURTS", "Offences to be cognizable and non-bailable",
"""(1) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974), no person accused of an offence under this Act shall be released on bail or on his own bond unless—
(i) the Public Prosecutor has been given an opportunity to oppose the application for such release; and
(ii) where the Public Prosecutor opposes the application, the court is satisfied that there are reasonable grounds for believing that he is not guilty of such offence and that he is not likely to commit any offence while on bail:
Provided that a person, who, is under the age of sixteen years, or is a woman or is sick or infirm, or is accused either on his own or along with other co-accused of money-laundering a sum of less than one crore rupees may be released on bail, if the Special Court so directs:
Provided further that the Special Court shall not take cognizance of any offence punishable under section 4 except upon a complaint in writing made by—
(i) the Director; or
(ii) any officer of the Central Government or a State Government authorised in writing in this behalf by the Central Government by a general or special order made in this behalf by that Government.

(1A) Notwithstanding anything contained in the Code of Criminal Procedure, 1973 (2 of 1974), or any other provision of this Act, no police officer shall investigate into an offence under this Act unless specifically authorised, by the Central Government by a general or special order, and, subject to such conditions as may be prescribed.

(2) The limitation on granting of bail specified in sub-section (1) is in addition to the limitations under the Code of Criminal Procedure, 1973 (2 of 1974) or any other law for the time being in force on granting of bail.

Explanation.—For the removal of doubts, it is clarified that the expression "Offences to be cognizable and non-bailable" shall mean and shall be deemed to have always meant that all offences under this Act shall be cognizable offences and non-bailable offences notwithstanding anything to the contrary contained in the Code of Criminal Procedure, 1973 (2 of 1974), and accordingly the officers authorised under this Act are empowered to arrest an accused without warrant, subject to the fulfillment of conditions under section 19 and subject to the conditions enshrined under this section.""")

add_sec("46", 7, "VII", "SPECIAL COURTS", "Application of Code of Criminal Procedure, 1973 to proceedings before Special Court",
"""(1) Save as otherwise provided in this Act, the provisions of the Code of Criminal Procedure, 1973 (2 of 1974) (including the provisions as to bails or bonds), shall apply to the proceedings before a Special Court and for the purposes of the said provisions, the Special Court shall be deemed to be a Court of Session and the persons conducting the prosecution before the Special Court, shall be deemed to be a Public Prosecutor:
Provided that the Central Government may also appoint for any case or class or group of cases a Special Public Prosecutor.

(2) A person shall not be qualified to be appointed as a Public Prosecutor or a Special Public Prosecutor under this section unless he has been in practice as an advocate for not less than seven years, under the Union or a State, requiring special knowledge of law.

(3) Every person appointed as a Public Prosecutor or a Special Public Prosecutor under this section shall be deemed to be a Public Prosecutor within the meaning of clause (u) of section 2 of the Code of Criminal Procedure, 1973 (2 of 1974) and the provisions of that Code shall have effect accordingly.""")

add_sec("47", 7, "VII", "SPECIAL COURTS", "Appeal and revision",
"""The High Court may exercise, so far as may be applicable, all the powers conferred by Chapter XXIX or Chapter XXX of the Code of Criminal Procedure, 1973 (2 of 1974), on a High Court, as if a Special Court within the local limits of the jurisdiction of the High Court were a Court of Session trying cases within the local limits of the jurisdiction of the High Court.""")

# ==========================================
# CHAPTER VIII – AUTHORITIES
# ==========================================
add_sec("48", 8, "VIII", "AUTHORITIES", "Authorities under Act",
"""There shall be the following classes of authorities for the purposes of this Act, namely:—
(a) Director or Additional Director or Joint Director,
(b) Deputy Director,
(c) Assistant Director, and
(d) such other class of officers as may be appointed for the purposes of this Act.""")

add_sec("49", 8, "VIII", "AUTHORITIES", "Appointment and powers of authorities and other officers",
"""(1) The Central Government may appoint such persons as it thinks fit to be authorities for the purposes of this Act.

(2) Without prejudice to the provisions of sub-section (1), the Central Government may authorise the Director or an Additional Director or a Joint Director or a Deputy Director or an Assistant Director appointed under that sub-section to appoint other authorities below the rank of an Assistant Director.

(3) Subject to such conditions and limitations as the Central Government may impose, an authority may exercise the powers and discharge the duties conferred or imposed on it under this Act.""")

add_sec("50", 8, "VIII", "AUTHORITIES", "Powers of authorities regarding summons, production of documents and to give evidence, etc.",
"""(1) The Director shall, for the purposes of section 13, have the same powers as are vested in a civil court under the Code of Civil Procedure, 1908 (5 of 1908) while trying a suit in respect of the following matters, namely:—
(a) discovery and inspection;
(b) enforcing the attendance of any person, including any officer of a reporting entity and examining him on oath;
(c) compelling the production of records;
(d) receiving evidence on affidavits;
(e) issuing commissions for examination of witnesses and documents; and
(f) any other matter which may be prescribed.

(2) The Director, Additional Director, Joint Director, Deputy Director or Assistant Director shall have power to summon any person whose attendance he considers necessary whether to give evidence or to produce any records during the course of any investigation or proceeding under this Act.

(3) All the persons so summoned shall be bound to attend in person or through authorised agents, as such officer may direct, and shall be bound to state the truth upon any subject respecting which they are examined or make statements, and produce such documents as may be required.

(4) Every proceeding under sub-sections (2) and (3) shall be deemed to be a judicial proceeding within the meaning of section 193 and section 228 of the Indian Penal Code (45 of 1860).

(5) Subject to any rules made in this behalf by the Central Government, any officer referred to in sub-section (2) may impound and retain in his custody for such period, as he thinks fit, any records produced before him in any proceedings under this Act:
Provided that an Assistant Director or a Deputy Director shall not—
(a) impound any records without recording his reasons for so doing; or
(b) retain in his custody any such records for a period exceeding three months, without obtaining the previous approval of the Joint Director.""")

add_sec("51", 8, "VIII", "AUTHORITIES", "Jurisdiction of authorities",
"""(1) The authorities shall exercise all or any of the powers and perform all or any of the functions conferred on, or, assigned, as the case may be, to such authorities by or under this Act or the rules framed thereunder in accordance with such directions as the Central Government may issue for the exercise of powers and performance of the functions by all or any of the authorities.

(2) In issuing the directions or orders referred to in sub-section (1), the Central Government may have regard to any one or more of the following criteria, namely:—
(a) territorial area;
(b) classes of persons;
(c) classes of cases; and
(d) any other criterion specified by the Central Government in this behalf.""")

add_sec("52", 8, "VIII", "AUTHORITIES", "Power of Central Government to issue directions, etc.",
"""The Central Government may, from time to time, issue such orders, instructions and directions to the authorities as it may deem fit for the proper administration of this Act and such authorities and all other persons employed in execution of this Act shall observe and follow such orders, instructions and directions of the Central Government:
Provided that no such orders, instructions or directions shall be issued so as to—
(a) require any authority to decide a particular case in a particular manner; or
(b) interfere with the discretion of the Adjudicating Authority in exercise of his functions.""")

add_sec("53", 8, "VIII", "AUTHORITIES", "Empowerment of certain officers",
"""The Central Government may, by a special or general order, empower an officer not below the rank of Director of the Central Government or of a State Government to act as an authority under this Act:
Provided that the Central Government may empower an officer below the rank of Director if the officer of the rank of the Director or above are not available in a particular area.""")

add_sec("54", 8, "VIII", "AUTHORITIES", "Certain officers to assist in inquiry, etc.",
"""The following officers and others are hereby empowered and required to assist the authorities in the enforcement of this Act, namely:—
(a) officers of the Customs and Central Excise Departments;
(b) officers appointed under sub-section (1) of section 5 of the Narcotic Drugs and Psychotropic Substances Act, 1985 (61 of 1985);
(c) income-tax authorities under sub-section (1) of section 117 of the Income-tax Act, 1961 (43 of 1961);
(d) members of the recognised stock exchange referred to in clause (f) of section 2 and the officers of the stock exchanges recognised under section 4 of the Securities Contracts (Regulation) Act, 1956 (42 of 1956);
(e) officers of the Reserve Bank of India constituted under sub-section (1) of section 3 of the Reserve Bank of India Act, 1934 (2 of 1934);
(f) officers of Police;
(g) officers of enforcement appointed under sub-section (1) of section 36 of the Foreign Exchange Management Act, 1999 (40 of 1999);
(h) officers of the Securities and Exchange Board of India established under section 3 of the Securities and Exchange Board of India Act, 1992 (15 of 1992);
(ha) officers of the Insurance Regulatory and Development Authority established under section 3 of the Insurance Regulatory and Development Authority Act, 1999 (41 of 1999);
(hb) officers of the Forward Markets Commission established under section 3 of the Forward Contracts (Regulation) Act, 1952 (74 of 1952);
(hc) officers and members of the recognised association recognised under section 6 of the Forward Contracts (Regulation) Act, 1952 (74 of 1952);
(hd) officers of the Pension Fund Regulatory and Development Authority;
(he) officers of the Department of Posts in the Government of India;
(hf) Registrars or Sub-Registrars appointed by the State Governments under section 6 of the Registration Act, 1908 (16 of 1908);
(hg) registering authority empowered to register motor vehicles under Chapter IV of the Motor Vehicles Act, 1988 (59 of 1988);
(hh) officers and members of the Institute of Chartered Accountants of India constituted under section 3 of the Chartered Accountants Act, 1949 (38 of 1949);
(hi) officers and members of the Institute of Cost and Works Accountants of India constituted under section 3 of the Cost and Works Accountants Act, 1959 (23 of 1959);
(hj) officers and members of the Institute of Company Secretaries of India constituted under section 3 of the Company Secretaries Act, 1980 (56 of 1980);
(i) officers of any other body corporate constituted or established under a Central Act or a State Act;
(j) such other officers of the Central Government, State Government, local authorities or reporting entities as the Central Government may, by notification, specify, in this behalf.""")

# ==========================================
# CHAPTER IX – RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY
# ==========================================
add_sec("55", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Definitions",
"""In this Chapter, unless the context otherwise requires,—
(a) “contracting State” means any country or place outside India in respect of which arrangements have been made by the Central Government with the Government of such country through a treaty or otherwise;
(b) “identifying” includes establishment of a proof that the property was derived from, or used in the commission of an offence under section 3;
(c) “tracing” means determining the nature, source, disposition, movement, title or ownership of property.""")

add_sec("56", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Agreements with foreign countries",
"""(1) The Central Government may enter into an agreement with the Government of any country outside India for—
(a) enforcing the provisions of this Act;
(b) exchange of information for the prevention of any offence under this Act or under the corresponding law in force in that country or investigation of cases relating to any offence under this Act,
and may, by notification in the Official Gazette, make such provisions as may be necessary for implementing the agreement.

(2) The Central Government may, by notification in the Official Gazette, direct that the application of this Chapter in relation to a contracting State with which reciprocal arrangements have been made, shall be subject to such conditions, exceptions or qualifications as are specified in the said notification.""")

add_sec("57", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Letter of request to a contracting State in certain cases",
"""(1) Notwithstanding anything contained in this Act or the Code of Criminal Procedure, 1973 (2 of 1974) if, in the course of an investigation into an offence or other proceedings under this Act, an application is made to a Special Court by the Investigating Officer or any officer superior in rank to the Investigating Officer that any evidence is required in connection with investigation into an offence or proceedings under this Act and he is of the opinion that such evidence may be available in any place in a contracting State, and the Special Court, on being satisfied that such evidence is required in connection with the investigation into an offence or proceedings under this Act, may issue a letter of request to a court or an authority in the contracting State competent to deal with such request to—
(i) examine facts and circumstances of the case,
(ii) take such steps as the Special Court may specify in such letter of request, and
(iii) forward all the evidence so taken or collected to the Special Court issuing such letter of request.

(2) The letter of request shall be transmitted in such manner as the Central Government may specify in this behalf.

(3) Every statement recorded or document or thing received under sub-section (1) shall be deemed to be the evidence collected during the course of investigation.""")

add_sec("58", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Assistance to a contracting State in certain cases",
"""Where a letter of request is received by the Central Government from a court or authority in a contracting State requesting for investigation into an offence or proceedings under this Act and forwarding to such court or authority any evidence connected therewith, the Central Government may forward such letter of request to the Special Court or to any authority under the Act as it thinks fit for execution of such request in accordance with the provisions of this Act or, as the case may be, any other law for the time being in force.""")

add_sec("58A", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Special Court to release the property",
"""Where on closure of the criminal case or conclusion of a trial in a criminal court outside India under the corresponding law of any other country, such court finds that the offence of money-laundering has not taken place or the property in India is not involved in money-laundering, the Special Court may, on an application moved by the concerned person or the Director, after notice to the other party, order release of such property to the person entitled to receive it.""")

add_sec("58B", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Letter of request of a contracting State or authority for confiscation or release the property",
"""Where the trial under the corresponding law of any other country cannot be conducted by reason of the death of the accused or the accused being declared a proclaimed offender or for any other reason or having commenced but could not be concluded, the Central Government shall, on receipt of a letter of request from a court or authority in a contracting State requesting for confiscation or release of property, as the case may be, forward the same to the Director to move an application before the Special Court and upon such application the Special Court shall pass appropriate orders regarding confiscation or release of such property involved in the offence of money-laundering.""")

add_sec("59", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Reciprocal arrangements for processes and assistance for transfer of accused persons",
"""(1) Where a Special Court, in relation to an offence punishable under section 4, desires that—
(a) a summons to an accused person, or
(b) a warrant for the arrest of an accused person, or
(c) a summons to any person requiring him to attend and produce a document or other thing or to produce it, or
(d) a search warrant,
issued by it shall be served or executed at any place in any contracting State, it shall send such summons or warrant in duplicate in such form, to such Court, Judge or Magistrate through such authorities, as the Central Government may, by notification, specify in this behalf and that Court, Judge or Magistrate, as the case may be, shall cause the same to be executed.

(2) Where a Special Court, in relation to an offence punishable under section 4 has received for service or execution—
(a) a summons to an accused person, or
(b) a warrant for the arrest of an accused person, or
(c) a summons to any person requiring him to attend and produce a document or other thing, or to produce it, or
(d) a search warrant,
issued by a Court, Judge or Magistrate in a contracting State, it shall, cause the same to be served or executed as if it were a summons or warrant received by it from another Court in the said territories for service or execution within its local jurisdiction; and where—
(i) a warrant of arrest has been executed, the person arrested shall be dealt with in accordance with the procedure specified under section 19;
(ii) a search warrant has been executed, the things found in this search shall, so far as possible, be dealt with in accordance with the procedure specified under sections 17 and 18:
Provided that in a case where a summon or search warrant received from a contracting State has been executed, the documents or other things produced or things found in the search shall be forwarded to the Court issuing the summons or search-warrant through such authority as the Central Government may, by notification, specify in this behalf.

(3) Where a person transferred to a contracting State pursuant to sub-section (2) is a prisoner in India, the Special Court or the Central Government may impose such conditions as that Court or Government deems fit.

(4) Where the person transferred to India pursuant to sub-section (1) is a prisoner in a contracting State, the Special Court in India shall ensure that the conditions subject to which the prisoner is transferred to India are complied with and such prisoner shall be kept in such custody subject to such conditions as the Central Government may direct in writing.""")

add_sec("60", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Attachment, seizure and confiscation, etc., of property in a contracting State or India",
"""(1) Where the Director has made an order for attachment of any property under section 5 or for freezing under sub-section (1A) of section 17 or where an Adjudicating Authority has made an order relating to a property under section 8 or where a Special Court has made an order of confiscation relating to a property under sub-section (5) or sub section (6) of section 8 and such property is suspected to be in a contracting State, the Special Court, on an application by the Director or the Administrator appointed under sub-section (1) of section 10, as the case may be , may issue a letter of request to a court or an authority in the contracting State for execution of such order.

(2) Where a letter of request is received by the Central Government from a court or an authority in a contracting State requesting attachment, seizure, freezing or confiscation of the property in India, derived or obtained, directly or indirectly, by any person from the commission of an offence under a corresponding law committed in that contracting State, the Central Government may forward such letter of request to the Director, as it thinks fit, for execution in accordance with the provisions of this Act.

(2A) Where on closure of the criminal case or conclusion of trial in a criminal court outside India under the corresponding law of any other country, such court finds that the offence of money-laundering under the corresponding law of that country has been committed, the Special Court shall, on receipt of an application from the Director for execution of confiscation under sub-section (2), order, after giving notice to the affected persons, that such property involved in money-laundering or which has been used for commission of the offence of money-laundering stand confiscated to the Central Government.

(3) The Director shall, on receipt of a letter of request under section 58 or section 59, direct any authority under this Act to take all steps necessary for tracing and identifying such property.

(4) The steps referred to in sub-section (3) may include any inquiry, investigation or survey in respect of any person, place, property, assets, documents, books of account in any bank or public financial institutions or any other relevant matters.

(5) Any inquiry, investigation or survey referred to in sub-section (4) shall be carried out by an authority mentioned in sub-section (3) in accordance with such directions issued in accordance with the provisions of this Act.

(6) The provisions of this Act relating to attachment, adjudication, confiscation and vesting of property in the Central Government contained in Chapter III and survey, searches and seizures contained in Chapter V shall apply to the property in respect of which letter of request is received from a court or contracting State for attachment or confiscation of property.

(7) When any property in India is confiscated as a result of execution of a request from a contracting State in accordance with the provisions of this Act, the Central Government may either return such property to the requesting State or compensate that State by disposal of such property on mutually agreed terms that would take into account deduction for reasonable expenses incurred in investigation, prosecution or judicial proceedings leading to the return or disposal of confiscated property.""")

add_sec("61", 9, "IX", "RECIPROCAL ARRANGEMENT FOR ASSISTANCE IN CERTAIN MATTERS AND PROCEDURE FOR ATTACHMENT AND CONFISCATION OF PROPERTY", "Procedure in respect of letter of request",
"""Every letter of request, summons or warrant, received by the Central Government from, and every letter of request, summons or warrant, to be transmitted to a contracting State under this Chapter shall be transmitted to a contracting State or, as the case may be, sent to the concerned Court in India and in such form and in such manner as the Central Government may, by notification, specify in this behalf.""")

# ==========================================
# CHAPTER X – MISCELLANEOUS
# ==========================================
add_sec("62", 10, "X", "MISCELLANEOUS", "Punishment for vexatious search",
"""Any authority or officer exercising powers under this Act or any rules made thereunder, who, without reasons recorded in writing,—
(a) searches or causes to be searched any building or place; or
(b) detains or searches or arrests any person,
shall for every such offence be liable on conviction for imprisonment for a term which may extend to two years or fine which may extend to fifty thousand rupees or both.""")

add_sec("63", 10, "X", "MISCELLANEOUS", "Punishment for false information or failure to give information, etc.",
"""(1) Any person wilfully and maliciously giving false information and so causing an arrest or a search to be made under this Act shall on conviction be liable for imprisonment for a term which may extend to two years or with fine which may extend to fifty thousand rupees or both.

(2) If any person,—
(a) being legally bound to state the truth of any matter relating to an offence under section 3, refuses to answer any question put to him by an authority in the exercise of its powers under this Act; or
(b) refuses to sign any statement made by him in the course of any proceedings under this Act, which an authority may legally require to sign; or
(c) to whom a summon is issued under section 50 either to attend to give evidence or produce books of account or other documents at a certain place and time, omits to attend or produce books of account or documents at the place or time,
he shall pay, by way of penalty, a sum which shall not be less than five hundred rupees but which may extend to ten thousand rupees for each such default or failure.

(3) No order under this section shall be passed by an authority referred to in sub-section (2) unless the person on whom the penalty is proposed to be imposed is given an opportunity of being heard in the matter by such authority.

(4) Notwithstanding anything contained in clause (c) of sub-section (2), a person who intentionally disobeys any direction issued under section 50 shall also be liable to be proceeded against under section 174 of the Indian Penal Code (45 of 1860).""")

add_sec("64", 10, "X", "MISCELLANEOUS", "Cognizance of offences",
"""(1) No court shall take cognizance of any offence under section 62 or sub-section (1) of section 63 except with the previous sanction of the Central Government.

(2) The Central Government shall, by an order, either give sanction or refuse to give sanction within ninety days of the receipt of the request in this behalf.""")

add_sec("65", 10, "X", "MISCELLANEOUS", "Code of Criminal Procedure, 1973 to apply",
"""The provisions of the Code of Criminal Procedure, 1973 (2 of 1974) shall apply, in so far as they are not inconsistent with the provisions of this Act, to arrest, search and seizure, attachment, confiscation investigation, prosecution and all other proceedings under this Act.""")

add_sec("66", 10, "X", "MISCELLANEOUS", "Disclosure of information",
"""(1) The Director or any other authority specified by him by a general or special order in this behalf may furnish or cause to be furnished to—
(i) any officer, authority or body performing any functions under any law relating to imposition of any tax, duty or cess or to dealings in foreign exchange, or prevention of illicit traffic in the narcotic drugs and psychotropic substances under the Narcotic Drugs and Psychotropic Substances Act, 1985 (61 of 1985); or
(ii) such other officer, authority or body performing functions under any other law as the Central Government may, if in its opinion it is necessary so to do in the public interest, specify, by notification in the Official Gazette, in this behalf, any information received or obtained by such Director or any other authority, specified by him in the performance of their functions under this Act, as may, in the opinion of the Director or the other authority, so specified by him, be necessary for the purpose of the officer, authority or body specified in clause (i) or clause (ii) to perform his or its functions under that law.

(2) If the Director or other authority specified under sub-section (1) is of the opinion, on the basis of information or material in his possession, that the provisions of any other law for the time being in force are contravened, then the Director or such other authority shall share the information with the concerned agency for necessary action.""")

add_sec("67", 10, "X", "MISCELLANEOUS", "Bar of suits in civil courts",
"""No suit shall be brought in any civil court to set aside or modify any proceeding taken or order made under this Act and no prosecution, suit or other proceeding shall lie against the Government or any officer of the Government for anything done or intended to be done in good faith under this Act.""")

add_sec("68", 10, "X", "MISCELLANEOUS", "Notice, etc., not to be invalid on certain grounds",
"""No notice, summons, order, document or other proceeding, furnished or made or issued or taken or purported to have been furnished or made or issued or taken in pursuance of any of the provisions of his Act shall be invalid, or shall be deemed to be invalid merely by reason of any mistake, defect or omission in such notice, summons, order, document or other proceeding if such notice, summons, order, document or other proceeding is in substance and effect in conformity with or according to the intent and purpose of this Act.""")

add_sec("69", 10, "X", "MISCELLANEOUS", "Recovery of fine or penalty",
"""Where any fine or penalty imposed on any person under section 13 or section 63 is not paid within six months from the day of imposition of fine or penalty, the Director or any other officer authorised by him in this behalf may proceed to recover the amount from the said person in the same manner as prescribed in Schedule II of the Income-tax Act, 1961 (43 of 1961) for the recovery of arrears and he or any officer authorised by him in this behalf shall have all the powers of the Tax Recovery Officer mentioned in the said Schedule for the said purpose.""")

add_sec("70", 10, "X", "MISCELLANEOUS", "Offences by companies",
"""(1) Where a person committing a contravention of any of the provisions of this Act or of any rule, direction or order made thereunder is a company, every person who, at the time the contravention was committed, was in charge of and was responsible to the company, for the conduct of the business of the company as well as the company, shall be deemed to be guilty of the contravention and shall be liable to be proceeded against and punished accordingly:
Provided that nothing contained in this sub-section shall render any such person liable to punishment if he proves that the contravention took place without his knowledge or that he exercised all due diligence to prevent such contravention.

(2) Notwithstanding anything contained in sub-section (1), where a contravention of any of the provisions of this Act or of any rule, direction or order made thereunder has been committed by a company and it is proved that the contravention has taken place with the consent or connivance of, or is attributable to any neglect on the part of any director, manager, secretary or other officer of any company, such director, manager, secretary or other officer shall also be deemed to be guilty of the contravention and shall be liable to be proceeded against and punished accordingly.

Explanation 1.—For the purposes of this section,—
(i) “company” means any body corporate and includes a firm or other association of individuals; and
(ii) “director”, in relation to a firm, means a partner in the firm.

Explanation 2.—For the removal of doubts, it is hereby clarified that a company may be prosecuted, notwithstanding whether the prosecution or conviction of any legal juridical person shall be contingent on the prosecution or conviction of any individual.""")

add_sec("71", 10, "X", "MISCELLANEOUS", "Act to have overriding effect",
"""The provisions of this Act shall have effect notwithstanding anything inconsistent therewith contained in any other law for the time being in force.""")

add_sec("72", 10, "X", "MISCELLANEOUS", "Continuation of proceedings in the event of death or insolvency",
"""(1) Where—
(a) any property of a persons has been attached under section 8 and no appeal against the order attaching such property has been preferred; or
(b) any appeal has been preferred to the Appellate Tribunal, and—
(i) in a case referred to in clause (a), such person dies or is adjudicated an insolvent before preferring an appeal to the Appellate Tribunal; or
(ii) in a case referred to in clause (b), such person dies or is adjudicated an insolvent during the pendency of the appeal,
then, it shall be lawful for the legal representatives of such person or the official assignee or the official receiver, as the case may be, to prefer an appeal to the Appellate Tribunal or as the case may be, to continue the appeal before the Appellate Tribunal, in place of such person and the provisions of section 26 shall, so far as may be, apply, or continue to apply, to such appeal.

(2) Where—
(a) after passing of a decision or order by the Appellate Tribunal, no appeal has been preferred to the High court under section 42; or
(b) any such appeal has been preferred to the High Court,—
then—
(i) in a case referred to in clause (a), the person entitled to file the appeal dies or is adjudicated an insolvent before preferring an appeal to the High Court, or
(ii) in a case referred to in clause (b), the person who had filed the appeal dies or is adjudicated an insolvent during the pendency of the appeal before the High Court,
then, it shall be lawful for the legal representatives of such person, or the official assignee or the official receiver, as the case may be, to prefer an appeal to the High Court or to continue the appeal before the High Court in place of such person and the provisions of section 42 shall, so far as may be, apply, or continue to apply, to such appeal.

(3) The powers of the official assignee or the official receiver under sub-section (1) or sub-section (2) shall be exercised by him subject to the provisions of the Presidency-towns Insolvency Act, 1909 (3 of 1909) or the Provincial Insolvency Act, 1920 (5 of 1920), as the case may be.""")

add_sec("72A", 10, "X", "MISCELLANEOUS", "Inter-ministerial Co-ordination Committee",
"""The Central Government may, by notification, constitute an Inter-ministerial Co-ordination Committee for inter-departmental and inter-agency co-ordination for the following purposes, namely:—
(a) operational co-operation between the Government, law enforcement agencies, the Financial Intelligence Unit, India and the regulators or supervisors;
(b) policy co-operation and co-ordination across all relevant or competent authorities;
(c) such consultation among the concerned authorities, the financial sector and other sectors, as are appropriate, and are related to anti money-laundering or countering the financing of terrorism laws, regulations and guidelines;
(d) development and implementing policies on anti money-laundering or countering the financing of terrorism; and
(e) any other matter as the Central Government may, by notification, specify in this behalf.""")

add_sec("73", 10, "X", "MISCELLANEOUS", "Power to make rules",
"""(1) The Central Government may, by notification, make rules for carrying out the provisions of this Act.

(2) In particular, and without prejudice to the generality of the foregoing power, such rules may provide for all or any of the following matters, namely:—
(a) the form in which records referred to in this Act may be maintained;
(aa) the manner of provisional attachment of property under sub-section (1) of section 5;
(b) the manner in which the order and the material referred to in sub-section (2) of section 5 to be maintained;
(c) matters in respect of experience of Members under sub-section (3) of section 6;
(d) the salaries and allowances payable to and other terms and conditions of service of Members of the Adjudicating Authority under sub-section (9) of section 6;
(e) the salaries and allowances payable to and other terms and conditions of service of the officers and employees of the Adjudicating Authority under sub-section (3) of section 7;
(ee) the manner of seizing or taking possession of property attached under section 5 or frozen under sub-section (1A) of section 17 or under sub-section (4) of section 8;
(f) the manner in which and the conditions subject to which the properties confiscated may be received and managed under sub-section (2) of section 10;
(g) the additional matters in respect of which the Adjudicating Authority may exercise the powers of a civil court under clause (f) of sub-section (1) of section 11;
(i) the nature and value of transactions and the time within which the information of transactions under clause (b) of sub-section (1) of section 12 shall be furnished;
(jja) the manner and the conditions in which authentication of the identity of clients shall be verified by the reporting entities under clause (a) of sub-section (1) of section 12AA;
(jjb) the manner of identifying the ownership and financial position of the client under clause (b) of sub-section (1) of section 12AA;
(jjc) additional steps to record the purpose behind conducting the specified transaction and the intended nature of the relationship between the transaction parties under clause (c) of sub-section (1) of section 12AA;
(jjd) manner of increasing the future monitoring under sub-section (3) of section 12AA;
(jjj) the period of interval in which the reports are sent by the reporting entities or any of its employees under clause (c) of sub-section (2) of section 13;
(k) the procedure and the manner of maintaining and furnishing information under sub-section (1) of section 12 as required under section 15;
(l) the manner in which the reasons and the material referred to in sub-section (2) of section 16 shall be maintained;
(m) the rules relating to search and seizure under sub-section (1) of section 17;
(n) the manner in which the reasons and the material referred to in sub-section (2) of section 17 shall be maintained;
(o) the manner in which the reasons and the material referred to in sub-section (2) of section 18 shall be maintained;
(p) the manner in which the order and the material referred to in sub-section (2) of section 19 shall be maintained;
(pp) the manner in which the forwarding of the order for retention or continuation of freezing of the property and the period of keeping such order and material under sub-section (2) of section 20;
(q) the manner in which records authenticated outside India may be received under sub-section (2) of section 22;
(r) the form of appeal and the fee for filing such appeal, under sub-section (3) of section 26;
(u) the additional matters in respect of which the Appellate Tribunal may exercise the powers of a civil court under clause (i) of sub-section (2) of section 35;
(ua) conditions subject to which a police officer may be authorised to investigate into an offence under sub-section (1A) of section 45;
(v) the additional matters in respect of which the authorities may exercise powers of a civil court under clause (f) of sub-section (1) of section 50;
(w) the rules relating to impounding and custody of records under sub-section (5) of section 50;
(x) any other matter which is required to be, or may be, prescribed.""")

add_sec("74", 10, "X", "MISCELLANEOUS", "Rules to be laid before Parliament",
"""Every rule made under this Act shall be laid, as soon as may be after it is made, before each House of Parliament, while it is in session, for a total period of thirty days which may be comprised in one session or in two or more successive sessions, and if, before the expiry of the session immediately following the session or the successive sessions aforesaid, both Houses agree in making any modification in the rule or both Houses agree that the rule should not be made, the rule shall thereafter have effect only in such modified form or be of no effect, as the case may be; so, however, that any such modification or annulment shall be without prejudice to the validity of anything previously done under that rule.""")

add_sec("75", 10, "X", "MISCELLANEOUS", "Power to remove difficulties",
"""(1) If any difficulty arises in giving effect to the provisions of this Act, the Central Government may, by order, published in the Official Gazette, make such provisions not inconsistent with the provisions of this Act as may appear to be necessary for removing the difficulty:
Provided that no order shall be made under this section after the expiry of two years from the commencement of this Act.

(2) Every order made under this section shall be laid, as soon as may be after it is made, before each House of Parliament.

THE SCHEDULE
[See section 2(y)]
PART A
PARAGRAPH 1
OFFENCES UNDER THE INDIAN PENAL CODE (45 OF 1860)
Section: Description of offence
120B: Criminal conspiracy.
121: Waging or attempting to wage war or abetting waging of war, against the Government of India.
121A: Conspiracy to commit offences punishable by section 121 against the State.
255: Counterfeiting Government stamp.
257: Making or selling instrument for counterfeiting Government stamp.
258: Sale of counterfeit Government stamp.
259: Having possession of counterfeit Government stamp.
260: Using as genuine a Government stamp known to be counterfeit.
302: Murder.
304: Punishment for culpable homicide not amounting to murder.
307: Attempt to murder.
308: Attempt to commit culpable homicide.
327: Voluntarily causing hurt to extort property, or to constrain to an illegal act.
329: Voluntarily causing grievous hurt to extort property, or to constrain to an illegal act.
364A: Kidnapping for ransom, etc.
384 to 389: Offences relating to extortion.
392 to 402: Offences relating to robbery and dacoity.
411: Dishonestly receiving stolen property.
412: Dishonestly receiving property stolen in the commission of a dacoity.
413: Habitually dealing in stolen property.
414: Assisting in concealment of stolen property.
417: Punishment for cheating.
418: Cheating with knowledge that wrongful loss may ensue to person whose interest offender is bound to protect.
419: Punishment for cheating by personation.
420: Cheating and dishonestly inducing delivery of property.
421: Dishonest or fraudulent removal or concealment of property to prevent distribution among creditors.
422: Dishonestly or fraudulently preventing debt being available for creditors.
423: Dishonest or fraudulent execution of deed of transfer containing false statement of consideration.
424: Dishonest or fraudulent removal or concealment of property.
467: Forgery of valuable security, will, etc.
471: Using as genuine a forged document or electronic record.
472 and 473: Making or possessing counterfeit seal, etc., with intent to commit forgery.
475 and 476: Counterfeiting device or mark.
481: Using a false property mark.
482: Punishment for using a false property mark.
483: Counterfeiting a property mark used by another.
484: Counterfeiting a mark used by a public servant.
485: Making or possession of any instrument for counterfeiting a property mark.
486: Selling goods marked with a counterfeit property mark.
487: Making a false mark upon any receptacle containing goods.
488: Punishment for making use of any such false mark.
489A: Counterfeiting currency notes or bank notes.
489B: Using as genuine, forged or counterfeit currency notes or bank notes.

PARAGRAPH 2
OFFENCES UNDER THE NARCOTIC DRUGS AND PSYCHOTROPIC SUBSTANCES ACT, 1985 (61 OF 1985)
Section: Description of offence
15: Contravention in relation to poppy straw.
16: Contravention in relation to coca plant and coca leaves.
17: Contravention in relation to prepared opium.
18: Contravention in relation to opium poppy and opium.
19: Embezzlement of opium by cultivator.
20: Contravention in relation to cannabis plant and cannabis.
21: Contravention in relation to manufactured drugs and preparations.
22: Contravention in relation to psychotropic substances.
23: Illegal import into India, export from India or transhipment of narcotic drugs and psychotropic substances.
24: External dealings in narcotic drugs and psychotropic substances in contravention of section 12 of the Narcotic Drugs and Psychotropic Substances Act, 1985.
25A: Contravention of orders made under section 9A of the Narcotic Drugs and Psychotropic Substances Act, 1985.
27A: Financing illicit traffic and harbouring offenders.
29: Abetment and criminal conspiracy.

PARAGRAPH 3
OFFENCES UNDER THE EXPLOSIVE SUBSTANCES ACT, 1908 (6 OF 1908)
Section: Description of offence
3: Causing explosion likely to endanger life or property.
4: Attempt to cause explosion, or for making or keeping explosives with intent to endanger life or property.
5: Making or possessing explosives under suspicious circumstances.

PARAGRAPH 4
OFFENCES UNDER THE UNLAWFUL ACTIVITIES (PREVENTION) ACT, 1967 (37 OF 1967)
Section: Description of offence
10 read with section 3: Penalty for being member of an unlawful association, etc.
11 read with section 3: Penalty for dealing with funds of an unlawful association.
13 read with section 3: Punishment for unlawful activities.
16 read with section 15: Punishment for terrorist act.
16A: Punishment for making demands of radioactive substances, nuclear devices, etc.
17: Punishment for raising funds for terrorist act.
18: Punishment for conspiracy, etc.
18A: Punishment for organising of terrorist camps.
18B: Punishment for recruiting of any person or persons for terrorist act.
19: Punishment for harbouring, etc.
20: Punishment for being member of terrorist gang or organisation.
21: Punishment for holding proceeds of terrorism.
38: Offence relating to membership of a terrorist organisation.
39: Offence relating to support given to a terrorist organisation.
40: Offence of raising fund for a terrorist organisation.

PARAGRAPH 5
OFFENCES UNDER THE ARMS ACT, 1959 (54 OF 1959)
Section: Description of offence
25: To manufacture, sell, transfer, convert, repair or test or prove or expose or offer for sale or transfer or have in his possession for sale, transfer, conversion, repair, test or proof, any arms or ammunition in contravention of section 5 of the Arms Act, 1959.
To acquire, have in possession or carry any prohibited arms or prohibited ammunition in contravention of section 7 of the Arms Act, 1959.
Contravention of section 24A of the Arms Act, 1959 relating to prohibition as to possession of notified arms in disturbed areas, etc.
Contravention of section 24B of the Arms Act, 1959 relating to prohibition as to carrying of notified arms in or through public places in disturbed areas.
Other offences specified in section 25.
26: To do any act in contravention of any provisions of section 3, 4, 10 or section 12 of the Arms Act, 1959 in such manner as specified in sub-section (1) of section 26 of the said Act.
To do any act in contravention of any provisions of section 5, 6, 7 or section 11 of the Arms Act, 1959 in such manner as specified in sub-section (2) of section 26 of the said Act.
Other offences specified in section 26.
27: Use of arms or ammunitions in contravention of section 5 or use of any arms or ammunition in contravention of section 7 of the Arms Act, 1959.
28: Use and possession of fire arms or imitation fire arms in certain cases.
29: Knowingly purchasing arms from unlicensed person or for delivering arms, etc., to person not entitled to possess the same.
30: Contravention of any condition of a licence or any provisions of the Arms Act, 1959 or any rule made thereunder.

PARAGRAPH 6
OFFENCES UNDER THE WILD LIFE (PROTECTION) ACT, 1972 (53 OF 1972)
Section: Description of offence
51 read with section 9: Hunting of wild animals.
51 read with section 17A: Contravention of provisions of section 17A relating to prohibition of picking, uprooting, etc., of specified plants.
51 read with section 39: Contravention of provisions of section 39 relating to wild animals, etc., to be Government property.
51 read with section 44: Contravention of provisions of section 44 relating to dealings in trophy and animal articles without licence prohibited.
51 read with section 48: Contravention of provisions of section 48 relating to purchase of animal, etc., by licensee.
51 read with section 49B: Contravention of provisions of section 49B relating to prohibition of dealings in trophies, animals articles, etc., derived from scheduled animals.

PARAGRAPH 7
OFFENCES UNDER THE IMMORAL TRAFFIC (PREVENTION) ACT, 1956 (104 OF 1956)
Section: Description of offence
5: Procuring, inducing or taking person for the sake of prostitution.
6: Detaining a person in premises where prostitution is carried on.
8: Seducing or soliciting for purpose of prostitution.
9: Seduction of a person in custody.

PARAGRAPH 8
OFFENCES UNDER THE PREVENTION OF CORRUPTION ACT, 1988 (49 OF 1988)
Section: Description of offence
7: Offence relating to public servant being bribed.
7A: Taking undue advantage to influence public servant by corrupt or illegal means or by exercise of personal influence.
8: Offence relating to bribing a public servant.
9: Offence relating to bribing a public servant by a commercial organisation.
10: Person in charge of commercial organisation to be guilty of offence.
11: Public servant obtaining undue advantage, without consideration from person concerned in proceeding or business transacted by such public servant.
12: Punishment for abetment of offences.
13: Criminal misconduct by a public servant.
14: Punishment for habitual offender.

PARAGRAPH 9
OFFENCES UNDER THE EXPLOSIVES ACT, 1884 (4 OF 1884)
Section: Description of offence
9B: Punishment for certain offences.
9C: Offences by companies.

PARAGRAPH 10
OFFENCES UNDER THE ANTIQUITIES AND ARTS TREASURES ACT, 1972 (52 OF 1972)
Section: Description of offence
25 read with section 3: Contravention of export trade in antiquities and art treasures.
28: Offences by companies.

PARAGRAPH 11
OFFENCES UNDER THE SECURITIES AND EXCHANGE BOARD OF INDIA ACT, 1992 (15 OF 1992)
Section: Description of offence
12A read with section 24: Prohibition of manipulative and deceptive devices, insider trading and substantial.
24: Acquisition of securities or control.

PARAGRAPH 12
OFFENCES UNDER THE CUSTOMS ACT, 1962 (52 OF 1962)
Section: Description of offence
135: Evasion of duty or prohibitions.

PARAGRAPH 13
OFFENCES UNDER THE BONDED LABOUR SYSTEM (ABOLITION) ACT, 1976 (19 OF 1976)
Section: Description of offence
16: Punishment for enforcement of bonded labour.
18: Punishment for extracting bonded labour under the bonded labour system.
20: Abetment to be an offence.

PARAGRAPH 14
OFFENCES UNDER THE CHILD LABOUR (PROHIBITION AND REGULATION) ACT, 1986 (61 OF 1986)
Section: Description of offence
14: Punishment for employment of any child to work in contravention of the provisions of section 3.

PARAGRAPH 15
OFFENCES UNDER THE TRANSPLANTATION OF HUMAN ORGANS ACT, 1994 (42 OF 1994)
Section: Description of offence
18: Punishment for removal of human organ without authority.
19: Punishment for commercial dealings in human organs.
20: Punishment for contravention of any other provision of this Act.

PARAGRAPH 16
OFFENCES UNDER THE JUVENILE JUSTICE (CARE AND PROTECTION OF CHILDREN) ACT, 2000 (56 OF 2000)
Section: Description of offence
23: Punishment for cruelty to juvenile or child.
24: Employment of juvenile or child for begging.
25: Penalty for giving intoxicating liquor or narcotic drug or psychotropic substance to juvenile or child.
26: Exploitation of juvenile or child employee.

PARAGRAPH 17
OFFENCES UNDER THE EMIGRATION ACT, 1983 (31 OF 1983)
Section: Description of offence
24: Offences and penalties.

PARAGRAPH 18
OFFENCES UNDER THE PASSPORTS ACT, 1967 (15 OF 1967)
Section: Description of offence
12: Offences and penalties.

PARAGRAPH 19
OFFENCES UNDER THE FOREIGNERS ACT, 1946 (31 OF 1946)
Section: Description of offence
14: Penalty for contravention of provisions of the Act, etc.
14B: Penalty for using forged passport.
14C: Penalty for abetment.

PARAGRAPH 20
OFFENCES UNDER THE COPYRIGHT ACT, 1957 (14 OF 1957)
Section: Description of offence
63: Offence of infringement of copyright or other rights conferred by this Act.
63A: Enhanced penalty on second and subsequent convictions.
63B: Knowing use of infringing copy of computer programme.
68A: Penalty for contravention of section 52A.

PARAGRAPH 21
OFFENCES UNDER THE TRADE MARKS ACT, 1999 (47 OF 1999)
Section: Description of offence
103: Penalty for applying false trademarks, trade descriptions, etc.
104: Penalty for selling goods or providing services to which false trademark or false trade description is applied.
105: Enhanced penalty on second or subsequent conviction.
107: Penalty for falsely representing a trademark as registered.
120: Punishment of abetment in India of acts done out of India.

PARAGRAPH 22
OFFENCES UNDER THE INFORMATION TECHNOLOGY ACT, 2000 (21 OF 2000)
Section: Description of offence
72: Penalty for breach of confidentiality and privacy.
75: Act to apply for offence or contravention committed outside India.

PARAGRAPH 23
OFFENCES UNDER THE BIOLOGICAL DIVERSITY ACT, 2002 (18 OF 2003)
Section: Description of offence
55 read with section 6: Penalties for contravention of section 6, etc.

PARAGRAPH 24
OFFENCES UNDER THE PROTECTION OF PLANT VARIETIES AND FARMERS RIGHTS ACT, 2001 (53 OF 2001)
Section: Description of offence
70 read with section 68: Penalty for applying false denomination, etc.
71 read with section 68: Penalty for selling varieties to which false denomination is applied.
72 read with section 68: Penalty for falsely representing a variety as registered.
73 read with section 68: Penalty for subsequent offence.

PARAGRAPH 25
OFFENCES UNDER THE ENVIRONMENT PROTECTION ACT, 1986 (29 OF 1986)
Section: Description of offence
15 read with section 7: Penalty for discharging environmental pollutants, etc., in excess of prescribed standards.
15 read with section 8: Penalty for handling hazardous substances without complying with procedural safeguards.

PARAGRAPH 26
OFFENCES UNDER THE WATER (PREVENTION AND CONTROL OF POLLUTION) ACT, 1974 (6 OF 1974)
Section: Description of offence
41 (2): Penalty for pollution of stream or well.
43: Penalty for contravention of provisions of section 24.

PARAGRAPH 27
OFFENCES UNDER THE AIR (PREVENTION AND CONTROL OF POLLUTION) ACT, 1981 (14 OF 1981)
Section: Description of offence
37: Failure to comply with the provisions for operating industrial plant.

PARAGRAPH 28
OFFENCES UNDER THE SUPPRESSION OF UNLAWFUL, ACTS AGAINST SAFETY OF MARITIME NAVIGATION AND FIXED PLATFORMS ON CONTINENTAL SHELF ACT, 2002 (69 OF 2002)
Section: Description of offence
3: Offences against ship, fixed platform, cargo of a ship, maritime navigational facilities, etc.

PARAGRAPH 29
OFFENCE UNDER THE COMPANIES ACT, 2013 (18 OF 2013)
Section: Description of offence
447: Punishment for fraud

PART B
OFFENCE UNDER THE CUSTOMS ACT, 1962 (52 OF 1962)
Section: Description of offence
132: False declaration, false documents, etc.

PART C
An offence which is the offence of cross border implications and is specified in,—
(1) Part A; or
(3) the offences against property under Chapter XVII of the Indian Penal Code (45 of 1860).
(4) The offence of wilful attempt to evade any tax, penalty or interest referred to in section 51 of the Black Money (Undisclosed Foreign Income and Assets) and Imposition of Tax Act, 2015 (22 of 2015).""")

# Write out files
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
json_path = os.path.join(project_root, "prisma", "pmlaBearerActData.json")
js_path = os.path.join(project_root, "prisma", "pmlaBearerActData.js")

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(sections, f, indent=2, ensure_ascii=False)

with open(js_path, "w", encoding="utf-8") as f:
    f.write("// THE PREVENTION OF MONEY-LAUNDERING ACT, 2002 Bearer Act Data with Full Chapter and Section Structure\n")
    f.write("export const pmlaBearerActSections = ")
    json.dump(sections, f, indent=2, ensure_ascii=False)
    f.write(";\n")

print(f"Successfully generated {len(sections)} sections across 10 chapters.")
