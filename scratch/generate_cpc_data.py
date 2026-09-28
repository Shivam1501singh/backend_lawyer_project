import json
import re

ACT_TITLE = "THE CODE OF CIVIL PROCEDURE, 1908"

# 12 Chapters / Parts
# Chapter 1: PRELIMINARY (Sections 1 to 8)
# Chapter 2: SUITS IN GENERAL (Sections 9 to 35B)
# Chapter 3: EXECUTION (Sections 36 to 74)
# Chapter 4: INCIDENTAL PROCEEDINGS (Sections 75 to 78)
# Chapter 5: SUITS IN PARTICULAR CASES (Sections 79 to 88)
# Chapter 6: SPECIAL PROCEEDINGS (Sections 89 to 93)
# Chapter 7: SUPPLEMENTAL PROCEEDINGS (Sections 94 to 95)
# Chapter 8: APPEALS (Sections 96 to 112)
# Chapter 9: REFERENCE, REVIEW AND REVISION (Sections 113 to 115)
# Chapter 10: SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER (Sections 116 to 120)
# Chapter 11: RULES (Sections 121 to 131)
# Chapter 12: MISCELLANEOUS (Sections 132 to 158)

raw_sections = [
    # PRELIMINARY (Chapter 1)
    {
        "num": "1",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Short title, commencement and extent",
        "text": """1. Short title, commencement and extent- (1) This Act may be cited as the Code of Civil Procedure, 1908.
(2) It shall come into force on the first day of January, 1909.
[2][(3) It extends to the whole of India except-
(a) the State of Jammu and Kashmir;
(b) the State of Nagaland and the tribal areas :
Provided that the State Government concerned may, by notification in the Official Gazette, extend the provisions of this Code or any of them to the whole or part of the State of Nagaland or such tribal areas, as the case may be, with such supplemental, incidental or consequential modifications as may be specified in the notification.
Explanation-In this clause, "tribal areas" means the territories which, immediately before the 21st day of January, 1972 were included in the tribal areas of Assam as referred to in paragraph 20 of the Sixth Schedule to the Constitution.
(4) In relation to the Amindivi Islands, and the East Godavari, West Godavari and Visakhapatnam Agencies in the State of Andhra Pradesh and the Union territory of Lakshadweep, the application of this Code shall be without prejudice to the application of any rule or regulation for the time being in force in such Islands, Agencies or such Union territory, as the case may be, relating to the application of this Code.]"""
    },
    {
        "num": "2",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Definitions",
        "text": """2. Definitions- In this Act, unless there is anything repugnant in the subject or context,-
(1) "Code" includes rules;
(2) "decree" means the formal expression of an adjudication which, so far as regards the Court expressing it, conclusively determines the rights of the parties with regard to all or any of the matters in controversy in the suit and may be either preliminary or final. It shall be deemed to include the rejection of a plaint and the determination of any question within [3]* * * section 144, but shall not include-
(a) any adjudication from which an appeal lies as an appeal from an order, or
(b) any order of dismissal for default.
Explanation-A decree is preliminary when further proceedings have to be taken before the suit can be completely disposed of. It is final when such adjudication completely disposes of the suit, it may be partly preliminary and partly final;
(3) "decree-holder" means any person in whose favour a decree has been passed or an order capable of execution has been made;
(4) "district" means the local limits of the jurisdiction of a principal Civil Court of original jurisdiction (hereinafter called a "District Court"), and includes the local limits of the ordinary original civil jurisdiction of a High Court;
(5) "foreign Court" means a Court situate outside India and not established or continued by the authority of the Central Government;
(6) "foreign judgment" means the judgment of a foreign Court;
(7) "Government Pleader" includes any officer appointed by the State Government to perform all or any of the functions expressly imposed by this Code on the Government Pleader and also any pleader acting under the directions of the Government Pleader;
(7A) "High Court" in relation to the Andaman and Nicobar Islands, means the High Court in Calcutta;
(7B) "India", except in sections 1, 29, 43, 44, 44A, 78, 79, 82, 83 and 87A, means the territory of India excluding the State of Jammu and Kashmir;
(8) "Judge" means the presiding officer of a Civil Court;
(9) "judgment" means the statement given by the judge of the grounds of a decree or order;
(10) "judgment-debtor" means any person against whom a decree has been passed or an order capable of execution has been made;
(11) "legal representative" means a person who in law represents the estate of a deceased person, and includes any person who intermeddles with the estate of the deceased and where a party sues or is sued in a representative character the person on whom the estate devolves on the death of the party so suing or sued;
(12) "means profits" of property means those profits which the person in wrongful possession of such property actually received or might with ordinary diligence have received therefrom, together with interest on such profits, but shall not include profits due to improvements made but the person in wrongful possession;
(13) "movable property" includes growing crops;
(14) "order" means the formal expression of any decision of a Civil Court which is not a decree;
(15) "pleader" means any person entitled to appear and plead for another in Court, and includes an advocate, a vakil and an attorney of a High Court;
(16) "prescribed" means prescribed by rules :
(17) "public officer" means a person falling under any of the following descriptions, namely:-
(a) every Judge;
(b) every member of [4][an All-India Service];
(c) every commissioned or gazetted officer in the military, naval or air forces of the Union while serving under the Government.
(d) every officer of a Court of Justice whose duty it is, as such officer, to investigate or report on any matter of law or fact, or to make, authenticate or keep any document, or to take charge or dispose of any property, or to execute any judicial process, or to administer any oath, or to interpret, or to preserve order, in the court, and every person especially authorized by a Court of Justice to perform any of such duties:
(e) every person who holds and office by virtue of which he is empowered to place or keep any person in confinement;
(f) every officer of the Government whose duty it is, as such officer, to prevent offences to give information of offences, to bring offenders to justice, or to protect the public health, safety or convenience;
(g) every officer whose duty it is, as such officer, to take, receive, keep or expend any property on behalf of the Government, or to make any survey, assessment or contract on behalf of the Government, or to execute any revenue process, or to investigate, or to report on, any matter affecting the pecuniary interests of the Government, or to make, authenticate or keep any document relating to the pecuniary interests of the Government, or to prevent the infraction of any law for the protection of the pecuniary interests of the Government; and
(h) every officer in the service or pay of the Government, or remunerated by fees or commission for the performance of any public duty;
(18) "rules" means rules and forms contained in the First Schedule or made under section 122 or section 125;
(19) "share in a corporation" shall be deemed to include stock, debenture stock, debentures or bonds; and
(20) "signed", save in the case of a judgment or decree, includes stamped."""
    },
    {
        "num": "3",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Subordination of Courts",
        "text": """3. Subordination of Courts- For the purposes of this Code, the District Court is subordinate to the High Court, and every Civil Court of a grade inferior to that of a District Court and every Court of Small Causes is subordinate to the High Court and District Court."""
    },
    {
        "num": "4",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Savings",
        "text": """4. Savings- (1) In the absence of any specific provision to the contrary, nothing in this Code shall be deemed to limit or otherwise affect any special or local law now in force or any special jurisdiction or power conferred, or any special form of procedure prescribed, by or under any other law for the time in force.
(2) In particular and without prejudice to the generality of the proposition contained in sub-section (1) nothing in this Code shall be deemed to limit or otherwise affect any remedy which a landholder or landlord may have under any law for the time being in force for the recovery of rent of agricultural land from the produce of such land."""
    },
    {
        "num": "5",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Application of the Code of Revenue Courts",
        "text": """5. Application of the Code of Revenue Courts- (1) Where any Revenue Courts are governed by the provisions of this Code in those matters of procedure upon which any special enactment applicable to them is silent, the State Government may, by notification in the Official Gazette, declare that any portions of those provisions which are not expressly made applicable by this Code shall not apply to those Courts, or shall only apply to them with such modifications as the State Government may prescribe.
(2) "Revenue Court" in sub-section (1) means a Court having jurisdiction under any local law to entertain suits or other proceedings relating to the rent, revenue or profits of land used for agricultural purposes, but does not include a Civil Court having original jurisdiction under this Code to try such suits or proceedings as being suits or proceedings of a civil nature."""
    },
    {
        "num": "6",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Pecuniary jurisdiction",
        "text": """6. Pecuniary jurisdiction- Save in so far as is otherwise expressly provided, nothing herein contained shall operate to give any Court jurisdiction over suits the amount or value of the subject-matter of which exceeds the pecuniary limits (if any) of its ordinary jurisdiction."""
    },
    {
        "num": "7",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Provincial Small Cause Courts",
        "text": """7. Provincial Small Cause Courts- The following provisions shall not extend to Courts constituted under the Provincial Small Cause Courts Act, 1887 (9 of 1887) or under the Berar Small Cause Courts Laws, 1905, or to Courts exercising the jurisdiction of a Court of Small Causes under the said Act or Law or to Courts in any part of India to which the said Act does not extend exercising a corresponding jurisdiction that is to say,-
(a) so much of the body of the Code as relates to-
(i) suits excepted from the cognizance of a Court of Small Causes;
(ii) the execution of decrees in such suits;
(iii) the execution of decrees against immovable property ; and
(b) the following sections, that is to say,-
section 9,
sections 91 and 92,
sections 94 and 95 so far as they authorize or relate to-
(i) orders for the attachment of immovable property;
(ii) injunctions,
(iii) the appointment of a receiver of immovable property, or
(iv) the interlocutory orders referred to in clause (e) of section 94 and
sections 96 to 112 and 115."""
    },
    {
        "num": "8",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Presidency Small Cause Courts",
        "text": """8. Presidency Small Cause Courts- Save as provided in sections 24, 38 to 41, 75, clauses (a), (b) and (c), 76 [5][77, 157 and 158], and by the Presidency Small Cause Courts Act, 1882, (15 of 1882) the provisions in the body of this Code shall not extend to any suit or proceedings in any Court of Small Causes established in the towns of Calcutta, Madras and Bombay :
Provided that -
(1) the High Courts of Judicature at Fort William Madras and Bombay, as the case may be, may from time to time, by notifications in the Official Gazette, direct that any such provisions not inconsistent with the express provisions of the Presidency Small Cause Courts Act, 1882, (15 of 1882) and with such modifications and adaptation as may be specified in the notification, shall extend to suits or proceedings or any class of suits or proceedings in such Court:
(2) all rules heretofore made by any of the said High Courts under section 9 of the Presidency Small Cause Courts Act, 1882 ( 15 of 1882) shall be deemed to have been validly made.

STATE AMENDMENTS
Gujarat- After the words Calcutta, Madras and Bombay the words "and in the City of Ahmedabad" shall be inserted.
[Gujarat Act No. XIX of 1961]."""
    },

    # PART I-SUITS IN GENERAL (Chapter 2)
    {
        "num": "9",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Courts to try all civil suits unless barred",
        "text": """9. Courts to try all civil suits unless barred? The Courts shall (subject to the provisions herein contained) have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred.
[6] [Explanation I].?A suit in which the right to property or to an office is contested is a suit of a civil nature, notwithstanding that such right may depend entirely on the decision of questions as to religious rites or ceremonies.
[7] [Explanation II]. For the purposes of this section, it is immaterial whether or not any fees are attached to the office referred to in Explanation I or whether or not such office is attached to a particular place.].

STATE AMENDMENTS
Maharashtra? After section 9 insert the following section 9A.
"9A. Where at the hearing of application relating to interim relief in a suit, objection to jurisdiction is taken such issue to be decided by the court as a preliminary issue:? (1) Notwithstanding anything contained in this code or any other law for the time being in force, if at the hearing of any application for granting or setting aside an order granting any interim relief, whether by way of stay, injunction, appointment of a receiver or otherwise, made in any suit, on objection to jurisdiction of the court to entertain such suit is taken by any of the parties to the suit the court shall proceed to determine at the hearing of such application the issue as to the jurisdiction as a preliminary issue before granting for setting aside the order granting the interim relief. Any such application shall be heard and disposed of by the court as expeditiously as possible and shall not in any case be adjourned to the hearing of the suit.
(2) Notwithstanding anything contained in sub-section (1), at the hearing of any such application the court may grant such interim relief as it may consider necessary, pending determination by it of the preliminary issue as to the jurisdiction".
[Maharashtra Act No. 65 of 1977]."""
    },
    {
        "num": "10",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Stay of suit",
        "text": """10. Stay of suit? No Court shall proceed with the trial of any suit in which the matter in issue is also directly and substantially in issue in a previously instituted suit between the same parties, or between parties under whom they or any of them claim litigating under the same title where such suit is pending in the same or any other Court in India having jurisdiction to grant the relief claimed, or in any Court beyond the limits of India established or continued by the Central Government and having like jurisdiction, or before the Supreme Court.
Explanation?The pendency of a suit in a foreign Court does not preclude the Courts in India from trying a suit founded on the same cause of action."""
    },
    {
        "num": "11",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Res judicata",
        "text": """11. Res judicata? No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties, or between parties under whom they or any of them claim, litigating under the same title, in a Court competent to try such subsequent suit or the suit in which such issue has been subsequently raised, and has been heard and finally decided by such Court.
Explanation I.?The expression "former suit" shall denote a suit which has been decided prior to the suit in question whether or not it was instituted prior thereto.
Explanation II.?For the purposes of this section, the competence of a Court shall be determined irrespective of any provisions as to a right of appeal from the decision of such Court.
Explanation III.?The matter above referred to must in the former suit have been alleged by one party and either denied or admitted, expressly or impliedly, by the other.
Explanation IV.?Any matter which might and ought to have been made ground of defence or attack in such former suit shall be deemed to have been a matter directly and substantially in issue in such suit.
Explanation V.?Any relief claimed in the plaint, which is not expressly granted by the decree, shall, for the purposes of this section, be deemed to have been refused.
Explanation VI.?Where persons litigate bona fide in respect of public right or of a private right claimed in common for themselves and others, all persons interested in such right shall, for the purposes of this section, be deemed to claim under the persons so litigating.
[8] [Explanation VII.?The provisions of this section shall apply to a proceeding for the execution of a decree and reference in this section to any suit, issue or former suit shall be construed as references, respectively, to proceedings for the execution of the decree, question arising in such proceeding and a former proceeding for the execution of that decree.
Explanation VIII.?An issue heard and finally decided by a Court of limited jurisdiction, competent to decide such issue, shall operate as res judicata in as subsequent suit, notwithstanding that such Court of limited jurisdiction was not competent to try such subsequent suit or the suit in which such issue has been subsequently raised.]"""
    },
    {
        "num": "12",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Bar to further suit",
        "text": """12. Bar to further suit.? Where a plaintiff is precluded by rules from instituting a further suit in respect of any particular cause of action, he shall not be entitled to institute a suit in respect of such cause of action in any Court to which this Code applies."""
    },
    {
        "num": "13",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "When foreign judgment not conclusive",
        "text": """13. When foreign judgment not conclusive? A foreign judgment shall be conclusive as to any matter thereby directly adjudicated upon between the same parties or between parties under whom they or any of them claim litigating under the same title except?
(a) where it has not been pronounced by a Court of competent jurisdiction;
(b) where it has not been given on the merits of the case;
(c) where it appears on the face of the proceedings to be founded on an incorrect view of international law or a refusal to recognise the law of India in cases in which such law is applicable;
(d) where the proceedings in which the judgment was obtained are opposed to natural justice;
(e) where it has been obtained by fraud;
(f) where it sustains a claim founded on a breach of any law in force in India."""
    },
    {
        "num": "14",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Presumption as to foreign judgments",
        "text": """14. Presumption as to foreign judgments.? The Court shall presume upon the production of any document purporting to be a certified copy of a foreign judgment that such judgment was pronounced by a Court of competent jurisdiction, unless the contrary appears on the record; but such presumption may be displaced by proving want of jurisdiction."""
    },
    {
        "num": "15",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Court in which suits to be instituted",
        "text": """15. Court in which suits to be instituted? Every suit shall be instituted in the Court of the lowest grade competent to try it."""
    },
    {
        "num": "16",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Suits to be instituted where subject-matter situate",
        "text": """16. Suits to be instituted where subject-matter situate? Subject to the pecuniary or other limitations prescribed by any law, suits?
(a) for the recovery of immovable property with or without rent or profits,
(b) for the partition of immovable property,
(c) for foreclosure, sale or redemption in the case of a mortgage of or charge upon immovable property,
(d) for the determination of any other right to or interest in immovable property,
(e) for compensation for wrong to immovable property,
(f) for the recovery of movable property actually under distraint or attachment,
shall be instituted in the Court within the local limits of whose jurisdiction the property is situate:
Provided that a suit to obtain relief respecting, or compensation for wrong to, immovable property held by or on behalf of the defendant, may where the relief sought can be entirely obtained through his personal obedience be instituted either in the Court within the local limits of whose jurisdiction the property is situate, or in the Court within the local limits of whose jurisdiction the defendant actually and voluntarily resider, or carries on business, or personally works for gain.
Explanation.? In this section "property" means property situate in India."""
    },
    {
        "num": "17",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Suits for immovable property situate within jurisdiction of different Courts",
        "text": """17. Suits for immovable property situate within jurisdiction of different Courts? Where a suit is to obtain relief respecting, or compensation for wrong to, immovable property situate within the jurisdiction of different Court, the suit my be instituted in any Court within the local limits of whose jurisdiction any portion of the property is situate :
Provided that, in respect of the value of the subject matter of the suit, the entire claim is cognizable by such Court."""
    },
    {
        "num": "18",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Place of institution of suit where local limits of jurisdiction of Courts are uncertain",
        "text": """18. Place of institution of suit where local limits of jurisdiction of Courts are uncertain? (1) Where it is alleged to be uncertain within the local limits of the jurisdiction of which of two or more Courts any immovable property is situate, any one of those Courts may, if satisfied that there is ground for the alleged uncertainty, record a statement to that effect and thereupon proceed to entertain and dispose of any suit relating to that property, and its decree in the suit shall have the same effect as if the property were situate within the local limits of its jurisdiction :
Provided that the suit is one with respect to which the Court is competent as regards the nature and value of the suit to exercise jurisdiction.
(2) Where a statement has not been recorded under sub-section (1), and objection is taken before an Appellate or Revisional Court that a decree or order in a suit relating to such property was made by a Court not having jurisdiction where the property is situate, the Appellate or Revisional Court shall not allow the objection unless in its opinion there was, at the time of the institution of the suit, no reasonable ground for uncertainty as to the Court having jurisdiction with respect thereto and there has been a consequent failure of justice."""
    },
    {
        "num": "19",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Suits for compensation for wrongs to person or movable",
        "text": """19. Suits for compensation for wrongs to person or movable? Where a suit is for compensation for wrong done to the person or to movable property, if the wrong was done within the local limits of the jurisdiction of one Court and the defendant resides, or carries on business, or personally works for gain, within the local limits of the jurisdiction of another Court, the suit may be instituted at the option of the plaintiff in either of the said Courts.
Illustrations
(a) A, residing in Delhi, beats B in Calcutta. B may sue A either in Calcutta or in Delhi.
(b) A, residing in Delhi, publishes in Calcutta statements defamatory of B. B may sue A either in Calcutta or in Delhi."""
    },
    {
        "num": "20",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Other suits to be instituted where defendants reside or cause of action arises",
        "text": """20. Other suits to be instituted where defendants reside or cause of action arises? Subject to the limitations aforesaid, every suit shall be instituted in Court within the local limits of whose jurisdiction?
(a) the defendant, or each of the defendants where there are more than one, at the time of the commencement of the suit, actually and voluntarily resides, or carries on business, or personally works for gain; or
(b) any of the defendants, where there are more than one, at the time of the commencement of the suit actually and voluntarily resides, or carries on business, or personally works for gain, provided that in such case either the leave of the Court is given, or the defendants who do not reside, or carry on business, or personally work for gain, as aforesaid, acquiesce in such institution; or
(c) the cause of action, wholly or in part, arises.
[9] [* * * *]
[10] [Explanation].?A corporation shall be deemed to carry on business at its sole or principal office in India or, in respect of any cause of action arising at any place where it has also a subordinate office, at such place.
Illustrations
(a) A is a tradesman in Calcutta, B carries on business in Delhi. B, by his agent in Calcutta, buys goods of A and requests A to deliver them to the East Indian Railway Company. A delivers the goods accordingly in Calcutta. A may sue B for the price of the goods either in Calcutta, where the cause of action has arisen or in Delhi, where B carries on business.
(b) A resides at Simla, B at Calcutta and C at Delhi A, B and C being together at Benaras, B and C make a joint promissory note payable on demand, and deliver it to A. A may sue B and C at Benaras, where the cause of action arose. He may also sue them at Calcutta, where B resides, or at Delhi, where C resides; but in each of these cases, if the non-resident defendant object, the suit cannot proceed without the leave of the Court."""
    },
    {
        "num": "21",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Objections to jurisdiction",
        "text": """21. Objections to jurisdiction? [11][(1)] No objection as to the place of suing shall be allowed by any appellate or Revisional Court unless such objection was taken in the Court of first instance at the earliest possible opportunity and in all cases where issues or settled at or before such settlement, and unless there has been a consequent failure of justice.
[12] [2) No objection as to the competence of a Court with reference to the pecuniary limits of its jurisdiction shall be allowed by any Appellate or Revisional Court unless such objection was taken in the Court of first instance at the earliest possible opportunity, and in all cases where issues are settled, at or before such settlement, and unless there has been a consequent failure of justice.
(3) No objection as to the competence of the executing Court with reference to the local limits of its jurisdiction shall be allowed by any Appellate or Revisional Court unless such objection was taken in the executing Court at the earliest possible opportunity, and unless there has been a consequent failure of justice.]"""
    },
    {
        "num": "21A",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Bar on suit to set aside decree on objection as to place of suing",
        "text": """[13][21A. Bar on suit to set aside decree on objection as to place of suing? No suit shall lie challenging the validity of a decree passed in a former suit between the same parties, or between the parties under whom they or any of them claim, litigating under the same title, on any ground based on an objection as to the place of suing.
Explanation.?The expression "former suit" means a suit which has been decided prior to the decision in the suit in which the validity of the decree is questioned, whether or not the previously decided suit was instituted prior to the suit in which the validity of such decree is questioned]."""
    },
    {
        "num": "22",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Power to transfer suits which may be instituted in more than one Court",
        "text": """22. Power to transfer suits which may be instituted in more than one Court? Where a suit may be instituted in any one of two or more Courts and is instituted in one of such Courts, any defendant, after notice to the other parties, may, at the earliest possible opportunity and in all cases where issues are settled at or before such settlement, apply to have the suit transferred to another Court, and the Court to which such application is made, after considering the objections of the other parties (if any), shall determine in which of the several Courts having jurisdiction the suit shall proceed."""
    },
    {
        "num": "23",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "To what Court application lies",
        "text": """23. To what Court application lies.? (1) Where the several Courts having jurisdiction are subordinate to the same Appellate Court, an application under section 22 shall be made to the Appellate Court.
(2) Where such Courts are subordinate to different Appellate Courts but to the same High Court, the application shall be made to the said High Court.
(3) Where such Courts are subordinate to different High Courts, the application shall be made the High Court within the local limits of whose jurisdiction the Court in which the suit is brought is situate."""
    },
    {
        "num": "24",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "General power of transfer and withdrawal",
        "text": """24. General power of transfer and withdrawal? (1) On the application of any of the parties and after notice to the parties and after hearing such of them as desired to be heard, or of its own motion without such notice, the High Court or the District Court may at any stage?
(a) transfer any suit, appeal or other proceeding pending before it for trial or disposal to any Court subordinate to it and competent to try or dispose of the same, or
(b) withdraw any suit, appeal or other proceeding pending in any Court subordinate to it, and?
(i) try or dispose of the same; or
(ii) transfer the same for trial or disposal to any Court subordinate to it and competent to try or dispose of the same; or
(iii) retransfer the same for trial or disposal to the Court from which it was withdrawn
(2) Where any suit or proceeding has been transferred or withdrawn under sub-section (1), the Court which [14][is thereafter to try or dispose of such suit or proceeding] may, subject to any special directions in the case of any order of transfer, either retry it or proceed from the point at which it was transferred or withdrawn.
[15] [(3) For the purposes of this section,?
(a) Courts of Additional and Assistant Judges shall be deemed to be subordinate to the District Court;
(b) "proceeding" includes a proceeding for the execution of a decree or order.]
(4) the Court trying any suit transferred or withdrawn under this section from a Court of Small Causes shall, for the purposes of such suit, be deemed to be a Court of Small Causes.
[16] [(5) A suit or proceeding may be transferred under this section from a Court which has no jurisdiction to try it.]"""
    },
    {
        "num": "25",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Power of Supreme Court to transfer suits, etc.",
        "text": """[17][25. Power of Supreme Court to transfer suits, etc.? (1) On the application of a party, and after notice to the parties, and after hearing such of them as desire to be heard, the Supreme Court may, at any stage, if satisfied that an order under this section is expedient for the ends of justice, direct that any suit, appeal or other proceeding be transferred from a High Court or other Civil Court in one State to a High Court or other Civil Court in any other State.
(2) Every application under this section shall be made by a motion which shall be supported by an affidavit.
(3) The Court to which such suit, appeal or other proceeding is transferred shall, subject to any special directions in the order of transfer, either retry it or proceed from the stage at which it was transferred to it.
(4) In dismissing any application under this section, the Supreme Court may, if it is of opinion that the application was frivolous or vexatious, order the applicant to pay by way of compensation to any person who has opposed the application such sum, not exceeding two thousand rupees, as it considers appropriate in the circumstances of the case.
(5) The law applicable to any suit, appeal or other proceeding transferred under this section shall be the law which the Court in which the suit, appeal or other proceeding was originally instituted ought to have applied to such suit, appeal or proceeding.]"""
    },
    {
        "num": "26",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Institution of suits",
        "text": """26. Institution of suits? Every suit shall be instituted by the presentation of a plaint or in such other manner as may be prescribed."""
    },
    {
        "num": "27",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Summons to defendants",
        "text": """27. Summons to defendants? Where a suit has been duly instituted, a summons may be issued to the defendant to appear and answer the claim and may be served in manner prescribed."""
    },
    {
        "num": "28",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Service of summons where defendant resides in another State",
        "text": """28. Service of summons where defendant resides in another State? (1) A summons may be sent for service in another State to such Court and in such manner as may be prescribed by rules in force in that State.
(2) The Court to which such summons is sent shall, upon receipt thereof, proceed as if it had been issued by such Court and shall then return the summons to the Court of issue together with the record (if any) of its proceedings with regard thereto.
[18] [(3) Where the language of the summons sent for service in another State is different from the language of the record referred to in sub- section (2), a translation of the record,?
(a) in Hindi, where the language of the Court issuing the summons is Hindi, or
(b) in Hindi or English where the language of such record is other than Hindi or English,
shall also be sent together with the record sent under that sub-section]."""
    },
    {
        "num": "29",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Service of foreign summonses",
        "text": """29. Service of foreign summonses? Summons and other processes issued by?
(a) any Civil or Revenue Court established in any part of India to which the provisions of this Code do not extent, or
(b) any Civil or Revenue Court established or continued by the authority of the Central Government outside India, or
(c) any other Civil or Revenue Court outside India to which the Central Government has, by notification in the Official Gazette, declared the provisions of this section to apply,
may be sent to the Courts in the territories to which this Code extends, and served as if they were summonses issued by such Courts."""
    },
    {
        "num": "30",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Power to order discovery and the like",
        "text": """30. Power to order discovery and the like? Subject to such conditions and limitations as may be prescribed, the Court may, at any time, either of its own motion or on the application of any party,?
(a) make such orders as may be necessary or reasonable in all matters relating to the delivery and answering of interrogatories, the admission of documents and facts, and the discovery, inspection, production, impounding and return of documents or other material objects producible as evidence;
(b) issue summonses to persons whose attendance is required either to give evidence or to produce documents or such other objects as aforesaid;
(c) order any fact to be proved by affidavit."""
    },
    {
        "num": "31",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Summons to witness",
        "text": """31. Summons to witness? The provisions in sections 27, 28 and 29 shall apply to summonses to give evidence or to produce documents or other material objects."""
    },
    {
        "num": "32",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Penalty for default",
        "text": """32. Penalty for default ?The Court may compel the attendance of any person to whom a summons has been issued under section 30 and for that purpose may?
(a) issue a warrant for his arrest;
(b) attach and sell his property;
(c) impose a fine upon him not exceeding five hundred rupees;
(d) order him to furnish security for his appearance and in default commit him to the civil prison."""
    },
    {
        "num": "33",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Judgment and decree",
        "text": """33. Judgment and decree? The Court, after the case has been heard, shall pronounce judgment, and on such judgment a decree shall follow."""
    },
    {
        "num": "34",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Interest",
        "text": """34. Interest? (1) Where and in so far as a decree is for the payment of money, the Court may, in the decree, order interest at such rate as the Court deems reasonable to be paid on the principal sum adjudged, from the date of the suit to the date of the decree, in addition to any interest adjudged on such principal sum for any period prior to the institution of the suit, with further interest at such rate not exceeding six per cent, per annum as the Court deems reasonable on such principal sum from the date of the decree to the date of payment, or to such earlier date as the Court thinks fit :
[19] [Provided that where the liability in relation to the sum so adjudged had arisen out of a commercial transaction, the rate of such further interest may exceed six per cent, per annum, but shall not exceed the contractual rate of interest or where there is no contractual rate, the rate at which moneys are lent or advanced by nationalised banks in relation to commercial transactions.
Explanation I.?In this sub-section, "nationalised bank" means a corresponding new bank as defined in the Banking Companies (Acquisition and Transfer of Undertakings) Act 1970 (5 of 1970).
Explanation II.?For the purposes of this section, a transaction is a commercial transaction, if it is connected with the industry, trade or business of the party incurring the liability.]
(2) Where such a decree is silent with respect to the payment of further interest on such principal sum from the date of the decree to the date of payment or other earlier date, the Court shall be deemed to have refused such interest, and a separate suit therefore shall not lie."""
    },
    {
        "num": "35",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Costs",
        "text": """35. Costs? (1) Subject to such conditions and limitations as may be prescribed, and to the provisions of law for the time being in force, the costs of and incident to all suits shall be in the discretion of the Court, and the Court shall have full power to determine by whom or out of what property and to what extent such costs are to be paid, and to give all necessary directions for the purposes aforesaid. The fact that the Court has no jurisdiction to try the suit shall be no bar to the exercise of such powers.
(2) Where the Court directs that any costs shall not follow the event, the Court shall state its reasons in writing."""
    },
    {
        "num": "35A",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Compensatory costs in respect of false or vexatious claims or defenses",
        "text": """35A. Compensatory costs in respect of false or vexatious claims or defenses? (1) If any suit or other proceedings including an execution proceedings but [20][excluding an appeal or a revision] any party objects to the claim of defence on the ground that the claim or defence or any part of it is, as against the objector, false or vexatious to the knowledge of the party by whom it has been put forward, and if thereafter, as against the objector, such claim or defence is disallowed, abandoned or withdrawn in whole or in part, the Court if it so thinks fit, may, after recording its reasons for holding such claim or defence to be false or vexatious, make an order for the payment to the object or by the party by whom such claim or defence has been put forward, of cost by way of compensation.
(2) No Court shall make any such order for the payment of an amount exceeding [21][three thousand rupees] or exceeding the limits of it pecuniary jurisdiction, whichever amount is less:
Provided that where the pecuniary limits of the jurisdiction of any Court exercising the jurisdiction of a Court of Small Causes under the Provincial Small Cause Courts Act, 1887 (9 of 1887) or under a corresponding law in force in any part of India to which the said Act does not extend and not being a Court constituted under such Act or law, are less than two hundred and fifty rupees, the High Court may empower such Court to award as costs under this section any amount not exceeding two hundred and fifty rupees and not exceeding those limits by more than one hundred rupees :
Provided, further, that the High Court may limit the amount or class of Courts is empowered to award as costs under this Section.
(3) No person against whom an order has been made under this section shall, by reason thereof, be exempted from any criminal liability in respect of any claim or defence made by him.
(4) The amount of any compensation awarded under this section in respect of a false or vexatious claim or defence shall be taken into account in any subsequent suit for damages or compensation in respect of such claim or defence.

STATE AMENDMENTS
Uttar Pradesh? (i) For sub-section (1) of section 35A substitute the following.
"(1) If any suit or other proceedings including proceedings in execution, but not being an appeal or revision, the court finds that the claim or defence or any part thereof is false or vaxatious to the knowledge of the party by whom it has been put forward and if such claim or defence or such part is disallowed, abandoned or withdrawn in whole or in part, the court may, after recording its reasons for holding such claim or defence to be false or vexatious, make an order for the payment to the successful party or costs by way of compensation irrespective of the decisions on other issues in the case".
[U.P. Act No. 24 of 1954].
(ii) After sub-section (1) insert the following.
"(1-A) The provisions of sub-section (1) shall mutatis mutandis apply to an appeal where the appellate Court confirms the decision of the trial court and the trial court has not awarded or insufficient, compensatory cost under that sub-section.
[U.P. Act No. 57 of 1976]."""
    },
    {
        "num": "35B",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "SUITS IN GENERAL",
        "title": "Costs for causing delay",
        "text": """[22][35B. Costs for causing delay? (1) If, on any date fixed for the hearing of a suit or for taking any step therein, a party to the suit?
(a) fails to take the step which he was required by or under this Code to take on that date, or
(b) obtains an adjournment for taking such step or for producing evidence or on any other ground,
the Court may, for reasons to be recorded, make an order requiring such party to pay to the other party such costs as would, in the opinion of the Court, be reasonably sufficient to reimburse the other party in respect of the expenses incurred by him in attending the Court on that date, and payment of such costs, on the date next following the date of such order, shall be a condition precedent to the further prosecution of?
(a) the suit by the plaintiff, where the plaintiff was ordered to pay such costs.
(b) the defence by the defendant, where the defendant was ordered to pay such costs.
Explanation.?Where separate defences have been raised by the defendants or groups of defendants, payment of such costs shall be a condition precedent to the further prosecution of the defence by such defendants or groups of defendants as have been ordered by the Court to pay such costs.
(2) The costs, ordered to be paid under sub-section (1) shall not, if paid, be included in the costs awarded in the decree passed in the suit; but, if such costs are not paid, a separate order shall be drawn up indicating the amount of such costs and the names and addresses of the persons by whom such costs are payable and the order so drawn up shall be executable against such persons.]"""
    },

    # PART II- EXECUTION (Chapter 3)
    {
        "num": "36",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Application to orders",
        "text": """[23][36. Application to orders? The provisions of this Code relating to the execution of decree (including provisions relating to payment under a decree) shall, so far as they are applicable, be deemed to apply to the execution of orders (including payment an order).]"""
    },
    {
        "num": "37",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Definition of Court which passed a decree",
        "text": """37. Definition of Court which passed a decree? The expression "Court which passed a decree", or words to that effect, shall, in relation to the execution of decrees, unless there is anything repugnant in the subject or context, be deemed to include,?
(a) where the decree to be executed has been passed in the exercise of appellate jurisdiction, the Court of first instance, and
(b) where the Court of first instance has ceased to exist or to have jurisdiction to execute it, the Court which, if the suit wherein the decree was passed was instituted at the time of making the application for the execution of the decree, would have jurisdiction to try such suit.
[24] [Explanation.?The Court of first instance does not cease to have jurisdiction to execute a decree merely on the ground that after the institution of the suit wherein the decree was passed or after the passing of the decree, any area has been transferred from the jurisdiction of that Court to the jurisdiction of any other Court; but in every such case, such other Court shall also have jurisdiction to execute the decree, if at the time of amking the application for execution of the decree it would have jurisdiction to try the said suit.]"""
    },
    {
        "num": "38",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Court by which decree may be executed",
        "text": """38. Court by which decree may be executed? A decree may be executed either by the court which passed it, or by the Court to which it is sent for execution."""
    },
    {
        "num": "39",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Transfer of decree",
        "text": """39. Transfer of decree? (1) The Court which passed a decree may, on the application of the decree-holder, send it for execution to another Court [25][of competent jurisdiction],?
(a) if the person against whom the decree is passed actually and voluntarily resides or carries on business, or personally works for gain, within the local limits of the jurisdiction of such other Court, or
(b) if such person has not property with in the local limits of the jurisdiction of the Court which passed the decree sufficient to satisfy such decree and has property within the local limits of the jurisdiction of such other Court, or
(c) if the decree directs the sale or delivery of immovable property situate outside the local limits of the jurisdiction of the Court which passed it, or
(d) if the Court which passed the decree considers for any other reason, which it shall record in wiring, that the decree should be executed by such other Court.
(2) The Court which passed the decree may of its own motion send it for execution to any subordinate Court of competent jurisdiction.
[26][(3) For the purposes of this section, a Court shall be deemed to be a Court of competent jurisdiction if, at the time of making the application for the transfer of decree to it, such Court would have jurisdiction to try the suit in which such decree was passed.]

STATE AMENDMENTS
Uttar Pradesh? Sub-section (3) of section 39 shall be substituted.
"(3) For the purpose of this section, a court shall be deemed to be a court of competent jurisdiction if the amount or value of the subject matter of the suit wherein the decree was passed does not exceed the pecuniary limits if any of its ordinary jurisdiction at the time of making the application for the transfer of decree to it, notwithstanding that it had otherwise no jurisdiction to try the suit".
[U.P. Act No. 31 of 1978]."""
    },
    {
        "num": "40",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Transfer of decree to Court in another State",
        "text": """40. Transfer of decree to Court in another State? Where a decree is sent for execution in another State, it shall be sent to such Court and executed in such manner as may be prescribed by rules in force in that State."""
    },
    {
        "num": "41",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Result of execution proceedings to be certified",
        "text": """41. Result of execution proceedings to be certified.? The Court to which a decree is sent for execution shall certify to the Court which passed it the fact of such execution, or where the former Court fails to execute the same the circumstances attending such failure."""
    },
    {
        "num": "42",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Powers of Court in executing transferred decree",
        "text": """42. Powers of Court in executing transferred decree? [27][(1)] The Court executing a decree sent to it shall have the same powers in executing such decree as if it had been passed by itself. All persons disobeying or obstructing the execution of the decree shall be punishable by such Court in the same manner as if it had passed the decree. And its order in executing such decree shall be subject to the same rules in respect of appeal as if the decree had been passed by itself.
[28][(2) Without prejudice to the generality of the provisions of sub-section (1) the powers of the Court under that sub-section shall include the following powers of the Court passed the decree, namely:?
(a) power to send the decree for execution to another Court under section 39;
(b) power to execute the decree against the legal representative of the deceased judgment-debtor under section 50;
(c) power to order attachment of a decree.
(3) A Court passing an order in exercise of the powers specified in sub-section (2) shall send a copy thereof to the Court which passed the decree.
(4) Nothing in this section shall be deemed to confer on the Courts to which a decree is sent for execution any of the following powers, namely?
(a) power to order execution at the instance of the transferee of the decree;
(b) in the case of a decree passed against a firm, power to grant leave to execute such decree against any person other than such a person as is referred to in clause (b), or clause (c), of sub-rule (1) of rule 50 of Order XXI.]

STATE AMENDMENTS
Uttar Pradesh? Section 42 shall be substituted by following.
"42. Power of Court in executing transferred decree:? (1) The court executing a decree sent to it shall have the same powers in executing such decree as if it had been passed by itself. All persons disobeying or obstructing the decree shall be punishable by such court in the same manner as if it had passed the decree, and its order in executing such decree shall be subject to the same rules in respect of appeal as if the decree had been passed by itself.
(2) Without prejudice to the generality of the provisions of sub-section (1) the powers of the court under that sub-section shall include the following powers of the court which passed the decree, namely?
(a) power to send the decree for execution to another court under section 39.
(b) power to execute the decree against the legal representative of the deceased judgment debtor under section 50.
(c) power to order attachment of a decree.
(d) power to decide any question relating to the bar of limitation to the executability of the decree.
(e) power to record payment or adjustment under Rule 2 of order XXI.
(f) power to order stay of execution under Rule 29 Order XXI,
(g) in the case of a decree passed against a firm power to grant leave to execute such decree against any person other than a person as is referred to in clause (b) or clause (c) of sub-rule (1) of Rule 50 of Order XXI.
(3) A court passing an order in exercise of the powers specified in sub-section (2) shall send a copy there of to the court which passed the decree.
(4) Nothing in this section shall be deemed to confer on the court to which a decree is sent for execution, the power to order execution at the instance of the transfer of a decree"
[U.P. Act No. 14 of 1970]."""
    },
    {
        "num": "43",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Execution of decrees passed by Civil Courts in places to which this Code does not extend",
        "text": """43. Execution of decrees passed by Civil Courts in places to which this Code does not extend? Any decree passed by any Civil Court established in any part of India to which the provisions of this Code do not extend, or by any Court established or continued by the authority of the Central Government outside India, may, if it cannot be executed within the jurisdiction of the Court by which it was passed, be executed in the manner herein provided within the jurisdiction of any Court in the territories to which this Code extends."""
    },
    {
        "num": "44",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Execution of decrees passed by Revenue Court in places to which this Code does not extend",
        "text": """44. Execution of decrees passed by Revenue Court in places to which this Code does not extend.? The State Government may, by notification in the Official Gazette, declare that the decrees of any Revenue Court in any part of India to which the provisions of this Code do not extend or any class of such decrees, may be executed in the State as if they had been passed by Courts in that State."""
    },
    {
        "num": "44A",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Execution of decrees passed by Courts in reciprocating territory",
        "text": """44A. Execution of decrees passed by Courts in reciprocating territory? (1) Where a certified copy of decree of any of the superior Courts of any reciprocating territory has been filed in a District Court, the decree may be executed in India as if it had been passed by the District Court.
(2) Together with the certified copy of the decree shall be filed a certificate from such superior Court stating the extent, if any, to which the decree has been satisfied or adjusted and such certificate shall, for the purposes of proceedings under this section, be conclusive proof of the extent of such satisfaction or adjustment.
(3) The provisions of section 47 shall as from the filing of the certified copy of the decree apply to the proceedings of a District Court executing a decree under this section, and the District Court shall refuse execution of any such decree, if it is shown to the satisfaction of the Court that the decree falls within any of the exceptions specified in clauses (a) to (f) of section 13.
Explanation 1? "Reciprocating territory" means any country or territory outside India which the Central Government may, by notification in the Official Gazette, declare to be a reciprocating territory for the purposes of this section; and "superior Courts", with reference to any such territory, means such Courts as may be specified in the said notification.
Explanation 2.? "Decree" with reference to a superior Court means any decree or judgment of such Court under which a sum of money is payable, not being a sum payable in respect of taxes or other charges of a like nature or in respect to a fine or other penalty, but shall in no case include an arbitration award, even if such an award is enforceable as a decree or judgment."""
    },
    {
        "num": "45",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Execution of decrees outside India",
        "text": """45. Execution of decrees outside India? So much of the foregoing sections of this Part as empowers a Court to send a decree for execution to another Court shall be construed as empowering a Court in any State to send a decree for execution to any Court established by the authority of the Central Government outside India to which the State Government has by notification in the Official Gazette declared this section to apply.

STATE AMENDMENTS
Pondicherry? After section 45 insert the following:?
"45-A. Execution of decrees etc. passed or made before the Commencement of the Code in Pondicherry? Any Judgment, decree or order passed or made before the Commencement of this Code by any Civil Court in the Union Territory of Pondicherry shall for the purpose of execution be deemed to have been passed or made under this Code.
Provided that nothing contained in this section shall be construed as extending the period of limitation to which any proceeding in respect of such judgment decree or order may be subject."
[Act No. 26 of 1968]."""
    },
    {
        "num": "46",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Precepts",
        "text": """46. Precepts? (1) Upon the application of the decree-holder the Court which passed the decree may, whenever it thinks fit, issue a precept to any other Court which would be competent to execute such decree to attach any property belonging to the judgment-debtor and specified in the precept.
(2) The Court to which a precept is sent shall proceed to attach the property in the manner prescribed in regard to the attachment of property in execution of a decree:
Provided that no attachment under a precept shall continue for more than two months unless the period of attachment is extended by an order of the Court which passed the decree or unless before the determination of such attachment the decree has been transferred to the Court by which the attachment has been made and the decree-holder has applied for an order for the sale of such property."""
    },
    {
        "num": "47",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Questions to be determined by the Court executing decree",
        "text": """47. Questions to be determined by the Court executing decree? (1) All questions arising between the parties to the suit in which the decree was passed, or their representatives, and relating to the execution, discharge or satisfaction of the decree, shall be determined by the Court executing the decree and not by a separate suit.
[29]* * * *
(3) Where a question arises as to whether any person is or is not the representative of a party, such question shall, for the purposes of this section, be determined by the Court.
[30] [Explanation I.?For the purposes of this section, a plaintiff whose suit has been dismissed and a defendant against whom a suit has been dismissed are parties to the suit.
Explanation II.?(a) For the purposes of this section, a purchaser of property at a sale in execution of a decree shall be deemed to be a party to the suit in which the decree is passed; and
(b) all questions relating to the delivery of possession of such property to such purchaser or his representative shall be deemed to be questions relating to the execution, discharge or satisfaction of the decree within the meaning of this section.]"""
    },
    {
        "num": "48",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Execution barred in certain cases",
        "text": """48. [Execution barred in certain cases].? Rep. by the limitation Act, 1963 (36 of 1963), s. 28 (with effect from the 1st January, 1964)"""
    },
    {
        "num": "49",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Transferee",
        "text": """49. Transferee? Every transferee of a decree shall hold the same subject to the equities (if any) which the judgment-debtor might have enforced against the original decree-holder."""
    },
    {
        "num": "50",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Legal representative",
        "text": """50. Legal representative? (1) Where a judgment-debtor dies before the decree has been fully satisfied, the holder of the decree may apply to the Court which passed it to execute the same against the legal representative of the deceased.
(2) Where the decree is executed against such legal representative, he shall be liable only to the extent of the property of the deceased which has come to his hands and has not been duly disposed of; and, for the purpose of ascertaining such liability, the Court executing the decree may, of its own motion or on the application of the decree-holder, compel such legal representative to produce such accounts as it thinks fit."""
    },
    {
        "num": "51",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Powers of Court to enforce execution",
        "text": """51. Powers of Court to enforce execution? Subject to such conditions and limitations as may be prescribed, the Court may, on the application of the decree-holder, order execution of the decree?
(a) by delivery of any property specifically decreed;
(b) by attachment and sale or by the sale without attachment of any property;
(c) by arrest and detention in prison [31][for such period not exceeding the period specified in section 58, where arrest and detention is permissible under that section];
(d) by appointing a receiver; or
(e) in such other manner as the nature of the relief granted may require:
Provided that, where the decree is for the payment of money, execution by detention in prison shall not be ordered unless, after giving the judgment-debtor an opportunity of showing cause why he should not be committed to prison, the Court, for reasons recorded in writing, is satisfied?
(a) that the judgment-debtor, with the object or effect of obstructing or delaying the execution of the decree,?
(i) is likely to abscond or leave the local limits of the jurisdiction of the Court, or
(ii) has, after the institution of the suit in which the decree was passed, dishonestly transferred, concealed, or removed any part of his property, or committed any other act of bad faith in relation to his property, or
(b) that the judgment-debtor has, or has had since the date of the decree, the means to pay the amount of the decree or some substantial part thereof and refuses or neglects or has refused or neglected to pay the same, or
(c) that the decree is for a sum for which the judgment-debtor was bound in a fiduciary capacity to account.
Explanation.?In the calculation of the means of the judgment-debtor for the purposes of clause (b), there shall be left out of account any property which, by or under any law or custom having the force of law for the time being in force, is exempt from attachment in execution of the decree.

STATE AMENDMENTS
Uttar Pradesh? In section 51 of the Code Clause (bb) shall be inserted after clause (b).
"(bb) by transfer other than sale by attachment or without attachment of any property"
[U.P. Act No. 24 of 1954]."""
    },
    {
        "num": "52",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Enforcement of decree against legal representative",
        "text": """52. Enforcement of decree against legal representative? (1) Where a decree is passed against a party as the legal representative of a deceased person, and the decree is for the payment of money out of the property of the deceased, it may be executed by the attachment and sale of any such property.
(2) Where no such property remains in the possession of the judgment-debtor and he fails to satisfy the Court that he has duly applied such property of the deceased as is proved to have come into his possession, the decree may be executed against the judgment-debtor to the extent of the property in respect of which he has failed so to satisfy the Court in the same manner as if the decree had been against him personally."""
    },
    {
        "num": "53",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Liability of ancestral property",
        "text": """53. Liability of ancestral property? For the purposes of section 50 and section 52, property in the hands of a son or other descendant which is liable under Hindu law for the payment of the debt of a deceased ancestor, in respect of which a decree has been passed, shall be deemed to be property of the deceased which has come to the hands of the son or other descendant as his legal representative."""
    },
    {
        "num": "54",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Partition of estate or separation of share",
        "text": """54. Partition of estate or separation of share? Where the decree is for the partition of an undivided estate assessed to the payment of revenue to the Government, or for the separate possession of a share of such an estate, the partition of the estate or the separation of the share shall be made by the Collector or any gazetted subordinate of the Collector deputed by him in this behalf, in accordance with the law (if any) for the time being in force relating to the partition, or the separate possession shares, of such estates."""
    },
    {
        "num": "55",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Arrest and detention",
        "text": """55. Arrest and detention? (1) A judgment-debtor may be arrested in execution of a decree at any hour and on any day, and shall, as soon as practicable, be brought before the Court, and his detention may be in the civil prison of the district in which the Court ordering the detention is situate, or, where such civil prison does not afford suitable accommodation, in any other place which the State Government may appoint for the detention of persons ordered by the Courts of such district to be detained:
Provided, firstly, that, for the purpose of making an arrest under this section, no dwelling-house shall be entered after sunset and before sunrise :
Provided, secondly, that no outer door of a dwelling-house shall be broken open unless such dwelling-house is in the occupancy of the judgment-debtor and he refuses or in any way prevents access thereto, but when the officer authorised to make the arrest has duly gained access to any dwelling-house, he may break open the door of any room in which he has reason to believe the judgment-debtor is to be found :
Provided, thirdly, that, if the room is in the actual occupancy of a woman who is not the judgment-debtor and who according to the customs of the country does not appear in public, the officer authorised to make the arrest shall give notice to her that she is at liberty to withdraw, and, after allowing a reasonable time for her to withdraw and giving her reasonable facility for withdrawing, may enter the room for the purpose of making the arrest :
Provided, fourthly, that, where the decree in execution of which a judgment-debtor is arrested, is a decree for the payment of money and the judgment-debtor pays the amount of the decree and the costs of the arrest to the officer arresting him, such officer shall at once release him.
(2) The State Government may, by notification in the Official Gazette, declare that any person or class of persons whose arrest might be attended with danger or inconvenience to the public shall not be liable to arrest in execution of a decree otherwise than in accordance with such procedure as may be prescribed by the State Government in this behalf.
(3) Where a judgment-debtor is arrested in execution of a decree for the payment of money and brought before the Court, the Court shall inform him that he may apply to be declared an insolvent, and that he may be discharged, if he has not committed any act of bad faith regarding the subject of the application and if he complies with provisions of the law of insolvency for the time being in force.
(4) Where a judgment-debtor express his intention to apply to be declared an insolvent and furnishes security, to the satisfaction of the Court, that he will within one month so apply, and that he will appear, when called upon, in any proceeding upon the application or upon the decree in execution of which he was arrested, the Court may release him from arrest, and, if he fails so to apply and to appear, the Court may either direct the security to be realised or commit him to the civil prison in execution of the decree."""
    },
    {
        "num": "56",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Prohibition of arrest or detention of women in execution of decree for money",
        "text": """56. Prohibition of arrest or detention of women in execution of decree for money? Notwithstanding anything in this Part, the Court shall not order the arrest or detention in the civil prison of a woman in execution of a decree for the payment of money."""
    },
    {
        "num": "57",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Subsistence allowance",
        "text": """57. Subsistence allowance? The State Government may fix scales, graduated according to rank, race and nationality, of monthly allowances payable for the subsistence of judgment-debtors."""
    },
    {
        "num": "58",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Detention and release",
        "text": """58. Detention and release? (1) Every person detained in the civil prison in execution of a decree shall be so detained,?
(a) where the decree is for the payment of a sum of money exceeding [32][one thousand rupees, for a period not exceeding three months, and]
[33] [(b) where the decree is for the payment of a sum of money exceeding five hundred rupees, but not exceeding one thousand rupees, for a period not exceeding six weeks :]
Provided that he shall be released from such detention before the expiration of the [34][said period of detention]?
(i) on the amount mentioned in the warrant for his detention being paid to the officer in charge of the civil prison, or
(ii) on the decree against him being otherwise fully satisfied, or
(iii) on the request of the person on whose application he has been so detained, or
(iv) on the omission by the person, on whose application he has been so detained, to pay subsistence allowance :
Provided, also, that he shall not be released from such detention under clause (ii) or clause (iii), without the order of the Court.
[35] [(1A) For the removal of doubts, it is hereby declared that no order for detention of the judgment-debtor in civil prison in execution of a decree for the payment of money shall be made, where the total amount of the decree does not exceed five hundred rupees.]
(2) A judgment-debtor released from detention under this section shall not merely by reason of his release be discharged from his debt, but he shall not be liable to be re-arrested under the decree in execution of which he was detained in the civil prison."""
    },
    {
        "num": "59",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Release on ground of illness",
        "text": """59. Release on ground of illness? (1) At any time after a warrant for the arrest of a judgment-debtor has been issued the Court may cancel it on ground of his serious illness.
(2) Where a judgment-debtor has been arrested, the Court may release him if, in its opinion, he is not in a fit state of health to be detained in the civil prison.
(3) Where a judgment-debtor has been committed to the civil prison, he may be released therefrom,?
(a) by the State Government, on the ground of the existence of any infectious or contagious disease, or
(b) by the committing Court, or any Court to which that Court is subordinate, on the ground of his suffering from any serious illness.
(4) A judgment-debtor released under this section may be re-arrested, but the period of his detention in the civil prison shall not in the aggregate exceed that prescribed by section 58."""
    },
    {
        "num": "60",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Property liable to attachment and sale in execution of decree",
        "text": """[36][60. Property liable to attachment and sale in execution of decree? (1) The following property is liable to attachment and sale in execution of a decree, namely, lands, houses or other buildings, goods, money, banknotes, cheques, bills of exchange, hundis, promissory notes, Government securities, bonds or other securities for money, debts, shares in corporation and, save as hereinafter mentioned, all other saleable property, movable or immovable, belonging to the judgment-debtor, or over which, or the profits of which, he has a disposing power which he may exercise for his own benefit,whether the same be held in the name of the judgment-debtor or by another person in trust for him or on his behalf :
Provided that the following particulars shall not be liable to such attachment or sale, namely:?
(a) the necessary wearing-apparel, cooking vessels, beds and bedding of the judgment-debtor, his wife and children, and such personal ornaments as, in accordance with religious usage, cannot be parted with by any woman;
(b) tools of artisans, and, where the judgment-debtor is an agriculturist, his implements of husbandry and such cattle and seed-grain as may, in the opinion of the court, be necessary to enable him to earn his livelihood as such, and such portion of agricultural produce or of any class of agricultural produce as may have been declared to be free from liability under the provisions of the next following section;
(c) houses and other buildings (with the materials and the sites thereof and the land immediately appurtenant thereto and necessary for their enjoyment) belonging to [37][an agriculturist or a labourer or a domestic servant] and occupied by him;
(d) books of account;
(e) a mere right to sue for damages;
(f) any right of personal service;
(g) stipends and gratuities allowed to pensioners of the government [38][or of a local authority or of any other employer] or payable out of any service pension fund notified in the Official Gazette by the Central Government or the State government in this behalf, and political pension;
(h) the wages of labourers and domestic servants, whether payable in money or in kind;
(i) salary to the extent of the first [39][four hundred rupees] and two third of the remainder] in execution of any decree other than a decree for maintenance.
[40] [Provided that where any part of such portion of the salary as is liable to attachment has been under attachment, whether continuously or intermittently, for a total period of twenty-four months, such portion sail be exempt from attachment until the expiry of a further period of twelve months, and, where such attachment has been made in execution of one and the same decree, shall, after the attachment has continued for a total period of twenty-four months, be finally exempt from attachment in execution of that decree.]
[41] [(ia) one-third of the salary in execution of any decree for maintenance;]
[42][(j) the pay and allowances of persons to whom the Air Force Act, 1950 (45 of 1950), or the Army Act, 1950 (46 of 1950), or the Navy Act (62 of 1957), applies;]
(k) all compulsory deposits and other sums in or derived from and fund to which the Provident funds Act, 1925, (19 of 1925), for the time being applies in so far as they are declared by the said Act not to be liable to attachment;
[43] [(ka) all deposits and other sums in or derived from any fund to which the Public Provident Fund Act, 1968 (23 of 1968) for the time being applies in so far as they are declared by the said Act as not to be liable to attachment;
(kb) all moneys payable under a policy of insurance on the life of the judgment-debtor;
(kc) the interest of a lessee of a residential building to which the provisions of law for the time being in force relating to control of rents and accommodation apply;]
(1) any allowance forming part of the emoluments of any servant of the Government or of any servant of a railway company or local authority which the appropriate Government may by notification in the Official Gazette declare to be exempt from attachment, and any subsistence grant for allowance made to any such servant while under suspension;
(m) an expectancy of succession by survivorship or other merely contingent or possible right or interest;
(n) a right to future maintenance;
(o) any allowance declared by any Indian law to be exempt from liability to attachment or sale in execution of a decree; and
(p) where the judgment-debtor is a person liable for the payment of land-revenue; any movable property which, under any law for the time being applicable to him, is exempt from sale for the recovery of an arrears of such revenue.
[44] [Explanation I.? The moneys payable in relation to the matters mentioned in clauses (g), (h), (i), (ia), (j), (1) and (o) are exempt from attachment or sale, whether before or after they are actually payable, and, in the case of salary, the attachable portion thereof is liable to attachment, whether before or after it is actually payable].
Explanation II.? [45][In clauses (1) and (ia)], "salary" means the total monthly emoluments, excluding any allowance declared exempt from attachment under the provisions of clause (1) derived by a person from his employment whether on duty or on leave].
Explanation [46][III]?In Clause (l), "appropriate Government" means?
(i) as respect any person in the service of the Central Government, or any servant of a Railway Administration or of a cantonment authority or of the port authority of a major port, the Central Government;
(ii) as respects any other [47][servant of the Government] or a servant of any other local authority skilled the State Government.
[48][Explanation IV.?For the purposes of this proviso, "wages", includes bonus, and labourer" includes a skilled/unskilled or semi-skilled labourer.
Explanation V.?For the purposes of this proviso, the expression "agriculturist" means a person who cultivates land personally and who depends for his livelihood mainly on the income from agricultural land, whether as owner, tenant, partner or agricultural labourer.
Explanation VI.?For the purposes of Explanation V, an agriculturist shall be deemed to cultivate land personally, if he cultivates land?
(a) by his own labour, or
(b) by the labour of any member of his family, or
(c) by servants or labourers on wages payable in case or in kind (not being as a share of the produce), or both.]
[49] (1A) Notwithstanding anything contained in any other law for the time being in force, an agreement by which a person agrees to waive the benefit on any exemption under this section shall be void.]
(2) Nothing in this section shall be deemed to exempt houses and other buildings (with the materials and the sites thereof and the land immediately appurtenant thereto and necessary for their enjoyment) from attachment or sale in execution of decrees for rent of any such house, building, site or land.

STATE AMENDMENTS
Andhra Pradesh? In its application to Andhra area of the State of Andhra Pradesh in section 60(1) clause (g) of the proviso after the words "pensioners of the Government" the words "or a local authority" shall be inserted
[C.P.C. (Andhra Pradesh) (Andhra area) Amendment Act 1950]
In its application to whole of State of A.P. in proviso to sub-section (1) of section 60.
(i) after clause (k) the following shall be inserted.
"(kk) amount payable under policies issued in pursuance of the Rules for the Andhra Pradesh Govt. life Insurance and Provident Fund".
(ii) after Explanation 2 insert the following:?
"Explanation 2A.? Where any sum payable to a Government servant is exempt from attachment under the provisions of clause (kk), such sum shall remain exempt from attachment notwithstanding the fact that owing to the death of the Govt. servant it is payable to same other person"
[Act No. XI of 1953 and Act No. X of 1962].
In its application to Hyderabad area of Andhra Pradesh:
(i) after clause (g) of the proviso to section 60 (1) insert the following:?
"(gg) pension granted or continued by the Central Govt. the Govt. of Hyderabad or any other State Govt. on account of part services or present infirmities or as a compassionate allowance and."
(ii) In Explanation 2A, for the words brackets and letter "Clause (kk)" substitute "Clause (gg) or Clause (kk)"
[A.P. Act No. XVIII of 1953].
In its application to the State of Andhra Pradesh:
(i) After clause (kk) of Section 60(1) proviso the following inserted:
"(kkk) amounts payable under the Andhra Pradesh State Employees Family Benefit Fund Rules."
(ii) For the words "(kk)', in Explanation 2A, the words "(kkk) inserted.(A.P. Act No. 24 of 1979).
Gujarat? (i) In section 60(1) after clause (g) insert the following.
"(gg) stipends and gratuities allowed to pensioners of a local authority".
(ii) Explanation 1, after the word "(g)" insert "(gg)".
[Bombay Act No. LX of 1948).
Himachal Pradesh? (i) In section 60 (1) at the end of Clause (c) insert the following.
"or compensation paid for such houses and buildings (including compensation for the materials and the sites and the land referred to above) acquired for public purpose".
(ii) After clause (c), clause (cc) shall be inserted.
"(cc) Compensation paid for agricultural lands belonging to agriculturists and acquired for public purpose".
[C.P.C. (H.P. Amendment) Act 1956].
Karnataka? In section 60 (1) after clause (p) the following shall be inserted in its application to Karnataka (except Bellary District).
"(pp) Where the judgment-debtor is a servant of the State Govt. who has insured his life under the rules in force relating to the official branch of Karnataka Govt. Life Insurance Department:?
(1) in the case of insurance effected prior to the ninth day of may, 1911 the whole of the bonus payable or paid thereunder to such servant, or in the event of his death to his nominee or other person or persons entitled to such bonus under the said rules, and
(2) in the case of Insurance effected on or after the ninth day of May, 1911, and such insurance is Compulsory premia payable or paid to such servant or in the event of his death to his nominee or other person or persons entitled to such bonus under the said rules.
[C.P.C. (Mysore Amendment) Act, 1952].
Kerala? After clause (g) the following clause (gg) shall be inserted:?
"(gg) all moneys payable to the beneficiaries under the Family Benefit Scheme for the employee of the Government of Kerala.
[Kerala Act 1 of 1988].
Maharashtra? (i) In section 60(1) after clause (g) of the proviso insert the following:?
"(gg) in the Hyderabad area of the State of Maharashtra any pension granted or continued by the Central Govt. or the Govt. of the former State of Hyderabad or any other State Govt. on account of part services or present infirmities or as a compassionate allowance which is not covered by clause (g)".
(ii) after clause (kb) insert the following:
"(kbb) the amounts payable under the policies issued in pursuance of the Rules for the Hyderabad State Life Insurance and Provident Fund, which are not covered under clause (ka) or (kb)".
[Maharashtra Act No. LXV of 1977].
Punjab and Haryana? (i) In clause (c) of the proviso to section 60 (1) for the words "occupied by him" substitute the following:?
"not proved by the decree holder to have been let out on rent or lent to persons other than his father mother, wife, son, daughter, daughter in law, brother, sister or other dependents or left vacant for a period of a year or more".
(ii) after clause (c) insert the following:?
"(cc) milch animals, whether in milk or in calf, animals used for the purposes of transport or draught cart and open spaces or endorures belonging to an agriculturist and required for use in case of need for tying cattle parking carts or stacking fodder or manure.
(ccc) one main residential house and other buildings attached to it (with the material and the sites there of and the land immediately appurtenant there to and necessary for there enjoyment belonging to a judgment-debtor other than an agriculturist and occupied by him:
Provided that the protection afforded by this clause shall not extend to any property specifically charged with the debt sought to be recovered".
(iii) after sub-section (2) insert the following sub-sections.
"(3) Notwithstanding any other law for the time being in force an agreement by which a debtor agrees to waive any benefit of any exemption under this section shall be void.
(4) For the purposes of this section the word `agriculturist' shall include every person whether as owner tenant partner or agricultural labour who depends for his livelihood mainly on income from agricultural land as defined in the Punjab Alienation of Land Act. 1910.
(5) Every member of a tribe notified as agricultural under the Punjab Alienation of Land Act, 1900 and every member of a scheduled caste shall be presumed to be as agriculturist until the contrary is provided.
(6) No order for attachment shall be made unless the court is satisfied that the property sought to be attached is not exempt from attachment or sale"
[Punjab Act No. VII of 1934, 12 of 1940, 6 of 1946 and 44 of 1960].
Rajasthan ? (i) In clause (b) of section 60 (1) after the word `Agriculturist' the words `his milch cattle and those likely to calve within two years' shall be inserted.
(ii) after clause (k) of the proviso to section 60 (1) insert the following.
"(kk) moneys payable under life Insurance Certificates issued in pursuance of the Rajasthan Govt. Servants Insurance Rules, 1953".
(iii) after Explanation 3 insert the following:
"Explanation 4.? Where any money payable to a Govt. servant of the state is exempt from attachment under the provision contained in clause (kk), such money shall remain exempt from the attachment notwithstanding the fact there owing to the death of a Govt. servant it is payable to some other person".
[Rajasthan Act No. 16 of 1957 and 19 of 1958].
Tamil Nadu? "Section 60 (1), clause (g) of the proviso after the words `stipends and gratuties allowed to the pensioners of the Govt. insert the words "or of a local authority"
[C.P.C. (Madras Amendment) Act, 1950].
Union Territory of Chandigarh? Same as in Punjab and Haryana
[Act No. 31 of 1966].
Union Territory of Pundicherry? Same as in Tamil Nadu
[Act No. 26 of 1968].
Uttar Pradesh? In section 60(1) after Explanation 1 add the following:
"Explanation 1-A.? Particulars mentioned in clause (c) are exempt from sale in execution of a decree whether passed before or after the commencement of the Code of Civil Procedure (United Provinces) Amendment Act, 1948 for enforcement of a mortgage of charge thereon".
[U.P. Act No. 35 of 1948]."""
    },
    {
        "num": "61",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Partial exemption of agricultural produce",
        "text": """61. Partial exemption of agricultural produce? The State Government may, by general or special order published in the Official Gazette, declare that such portion of agricultural produce, or of any class of agricultural produce, as may appear to the State Government to be necessary for the purpose of providing until the next harvest the due cultivation of the land and for the support of the judgment-debtor and his family, shall, in the case of all agriculturists or of any class of agriculturists, be exempted from liability to attachment or sale in exaction of a decree."""
    },
    {
        "num": "62",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Seizure of property in dwelling-house",
        "text": """62. Seizure of property in dwelling-house? (1) No person executing any process under this Code directing or authorizing seizure of movable property shall enter any dwelling-house after sunset and before sunrise.
(2) No outer door of a dwelling-house shall be broken open unless such dwelling-house is in the occupancy of the judgment-debtor and he refuses or in any way prevents access thereto, but when the person executing any such process has duly gained access to any dwelling-house, he may break open the door of any room in which he has reason to believe any such property to be.
(3) Where a room in a dwelling-house is in the actual occupancy of a woman who, according to the customs of the country, does not appear in public, the person executing the process shall give notice to such woman that she is at liberty to withdraw; and, after allowing reasonable time for her to withdraw and giving her reasonable facility for widhrawing, he may enter such room for the purpose of seizing the property, using at the same time every precaution, consistent with these provisions, to prevent its clandestine removal."""
    },
    {
        "num": "63",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Property attached in execution of decrees of several Courts",
        "text": """63. Property attached in execution of decrees of several Courts? (1) Where property not in the custody of any Court is under attachment in execution of decrees of more Courts than one, the Court which shall receive or realize such property and shall determine any claim thereto any objection to the attachment thereof shall be the Court of highest grade, or, where there is no difference in grade between such Courts, the Court under whose decree the property was first attached.
(2) Nothing in this section shall be deemed to invalidate any proceeding taken by a Court executing one of such decrees.
[50] [Explanation.?For the purposes of sub-section (2), "proceeding taken by a Court" does not include an order allowing, to a decree-holder who has purchased property at a sale held in execution of a decree, set off to the extent of the purchase price payable by him.]"""
    },
    {
        "num": "64",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Private alienation of property after attachment to be void",
        "text": """64. Private alienation of property after attachment to be void? Where an attachment has been made, any private transfer or delivery of the property attached or of any interest there in and any payment to the judgment-debtor of any debt, dividend or other monies contrary to such attachment, shall be void as against all claims enforceable under the attachment.
Explanation?For the purposes of this section, claims enforceable under an attachment include claims for the rateable distribution of assets."""
    },
    {
        "num": "65",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Purchaser's title",
        "text": """65. Purchaser's title? Where immovable property is sold in execution of a decree and such sale has become absolute, the property shall be deemed to have vested in the purchaser from the time when the property is sold and not from the time when the sale becomes absolute."""
    },
    {
        "num": "66",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Repealed",
        "text": """66. [51][* * * *]"""
    },
    {
        "num": "67",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Power for State Government to make rules as to sales of land in execution of decrees for payment of money",
        "text": """67. Power for State Government to make rules as to sales of land in execution of decrees for payment of money? (1) The State Government may, by notification in the Official Gazette, make rules for any local area imposting conditions in respect of the sale of any class of interests in land in execution of decrees for the payment of money, where such interests are so uncertain or undermined as, in the opinion of the State Government to make it impossible to fix their value.
(2) When on the date on which this Code came into operation in any local area, any special rules as to sale of and in execution of decrees were in force therein, the State Government may, by notification in the Official Gazette, declare such rules to be in force, or may by a like notification, modify the same.
Every notification issued in the exercise of the powers conferred by this sub-section shall set out the rules so continued or modified.
[52] [(3) Every rule made under this section shall be laid, as soon as may be after it is made, before the State Legislature.]"""
    },
    {
        "num": "68",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Delegation to Collector of power to execute decrees against immovable property (Repealed)",
        "text": """68.?72. Rep. by the Code of Civil Procedure (Amendment) Act, 1956 (66 of 1956), s. 7."""
    },
    {
        "num": "69",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Delegation to Collector of power to execute decrees against immovable property (Repealed)",
        "text": """68.?72. Rep. by the Code of Civil Procedure (Amendment) Act, 1956 (66 of 1956), s. 7."""
    },
    {
        "num": "70",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Delegation to Collector of power to execute decrees against immovable property (Repealed)",
        "text": """68.?72. Rep. by the Code of Civil Procedure (Amendment) Act, 1956 (66 of 1956), s. 7."""
    },
    {
        "num": "71",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Delegation to Collector of power to execute decrees against immovable property (Repealed)",
        "text": """68.?72. Rep. by the Code of Civil Procedure (Amendment) Act, 1956 (66 of 1956), s. 7."""
    },
    {
        "num": "72",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Delegation to Collector of power to execute decrees against immovable property (Repealed)",
        "text": """68.?72. Rep. by the Code of Civil Procedure (Amendment) Act, 1956 (66 of 1956), s. 7."""
    },
    {
        "num": "73",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Proceeds of execution-sale to be reateably distributed among decree-holders",
        "text": """73. Proceeds of execution-sale to be reateably distributed among decree-holders? (1) Where assests are held by a Court and more persons than one have, before the receipt of such assests, made application to the Court for the execution of decrees for the payment of money passed against the same judgment-debtor and have not obtained satisfaction thereof, the assests, after deducting the costs of realization, shall be reteably distributed among all such persons :
Provided as follows :?
(a) where any property is sold subject to a mortgage or charge, the mortgage or incumbrancer shall not be entitled to share in any surplus arising from such sale;
(b) where any property liable to be sold in execution of a decree is subject to a mortgage or charges the Court may, with the consent of the mortgagee or incumbrancer, order that the property be sold free from the mortgage or charge, giving to the mortgagee or incumbrancer the same interest in the proceeds of the sale as he had in the property sold;
(c) where any immovable property is sold in execution of a decree ordering its sale for the discharge of an incumbrance thereon, the proceeds of sale shall be applied?
first, in defraying the expenses of the sale;
secondly, in discharging the amount due under the decree;
thirdly, in discharging the interest and principal moneys due on subsequent incumbrances (if any); and
fourthly, rateably among the holders of decrees for the payment of money against the judgment debtor, who have, prior to the sale of the property, applied to the Court which passed the decree ordering such sale for execution of such decrees, and have not obtained satisfaction thereof.
(2) Where all or any of the assests liable to be rateably distributed under this section are paid to a person not entitled to receive the same, any person so entitled may sue such person to compel him to refund the assets.
(3) Nothing in this section affects any right of the Government."""
    },
    {
        "num": "74",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "EXECUTION",
        "title": "Resistance to execution",
        "text": """74. Resistance to execution? Where the Court is satisfied that the holder of a decree for the possession of immovable property or that the purchaser of immovable property sold in execution of a decree has been resisted or obstructed in obtaining possession of the property by the judgment-debtor or some person on his behalf and that such resistance or obstruction was without any just cause, the Court may, at the instance of the decree-holder or purchaser, order the judgment-debtor or such other person to be detained in the civil prison for a term which may extend to thirty days and may further direct that the decree-holder or purchaser be put into possession of the property."""
    },

    # PART III-INCIDENTAL PROCEEDINGS (Chapter 4)
    {
        "num": "75",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "INCIDENTAL PROCEEDINGS",
        "title": "Power of court to issue commissions",
        "text": """75. Power of court to issue commissions- Subject to such conditions and limitations as may be prescribed, the court may issue a commission-
(a) to examine any person;
(b) to make a local investigation;
(c) to examine or adjust accounts; or
(d) to make a partition;
[53] [(e) to hold a scientific, technical, or expert investigation;
(f) to conduct sale of property which is subject to speedy and natural decay and which is in the custody of the Court pending the determination of the suit;
(g) to perform any ministerial act.]"""
    },
    {
        "num": "76",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "INCIDENTAL PROCEEDINGS",
        "title": "Commission to another Court",
        "text": """76. Commission to another Court- (1) A commission for the examination of any person may be issued to any Court (not being a High Court) situate in a State other than the State in which the Court of issue is situate and having jurisdiction in the place in which the person to be examined resides.
(2) Every Court receiving a commission for the examination of any person under sub-section (1) shall examine him or cause him to be examined pursuant thereto, and the commission, when it has been duly executed, shall be returned together with the evidence taken under it to the Court from which it was issued, unless the order for issuing the commission has otherwise directed, in which case the commission shall be returned in terms of such order."""
    },
    {
        "num": "77",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "INCIDENTAL PROCEEDINGS",
        "title": "Letter of request",
        "text": """77. Letter of request- In lieu of issuing a commission the Court may issue a letter of request to examine a witness residing at any place not within India."""
    },
    {
        "num": "78",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "INCIDENTAL PROCEEDINGS",
        "title": "Commissions issued by foreign Courts",
        "text": """78. Commissions issued by foreign Courts- Subject to such conditions and limitations as may be prescribed the provisions as to the execution and return of commissions for the examination of witnesses shall apply to commissions issue by or as the instance of-
(a) Courts situate in any part of India to which the provisions of this Code do not extend; or
(b) Courts established or continued by the authority of the Central Government outside India, or
(c) Courts of any State or country outside India."""
    },

    # PART IV-SUITS IN PARTICULAR CASES (Chapter 5)
    {
        "num": "79",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Suits by or against Government",
        "text": """79. Suits by or against Government? In a suit by or against the Government, the authority to be named as plaintiff or defendant, as the case may be, shall be?
(a) in the case of a suit by or against the Central Government, the Union of India, and
(b) in the case of a suit by or against a State Government, the State."""
    },
    {
        "num": "80",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Notice",
        "text": """80. Notice? [54][(1)][55][Save as otherwise provided in sub-section (2), no suits shall be instituted against the Government (including the Government of the State of Jammu & Kashmir) or against a public officer in respect of any act purporting to be done by such officer in his official capacity, until the expiration of two months next after notice in writing has been delivered to, or left at the office of?
(a) in the case of a suit against the Central Government, except where it relates to a railway, a Secretary to that Government;
(b) in the case of a suit against the Central Government where it relates to railway, the General Manager of that railway;
(bb) in the case of a suit against the Government of the State of Jammu and Kashmir the Chief Secretary to that Government or any other officer authorised by that Government in this behalf;
(c) in the case of a suit against any other State Government, a Secretary to that Government or the Collector of the district;
and, in the case of a public officer, delivered to him or left at this office, stating the cause of action, the name, description and place of residence of the plaintiff and the relief which he claims; and the plaint shall contain a statement that such notice has been so delivered or left.
[56] [(2) A suit to obtain an urgent or immediate relief against the Government (including the Government of the State of Jammu & Kashmir) or any public officer in respect of any act purporting to be done by such public officer in his official capacity, may be instituted, with the leave of the Court, without serving any notice as required by sub-section (1); but the Court shall not grant relief in the suit, whether interim or otherwise, except after giving to the Government or public officer, as the case may be, a reasonable opportunity of showing cause in respect of the relief prayed for in the suit :
Provided that the Court shall, if it is satisfied, after hearing the parties, that no urgent or immediate relief need be granted in the suit, return the plaint for presentation to it after complying with the requirements of sub-section (1).
(3) No suit instituted against the Government or against a public officer in respect of any act purporting to be done by such public officer in his official capacity shall be dismissed merely by reason of any error or defect in the notice referred to in sub-section (1), if in such notice?
(a) the name, description and the residence of the plaintiff had been so given as to enable the appropriate authority or the public officer to identify the person serving the notice and such notice had been delivered or left at the office of the appropriate authority specified in sub-section (1), and
(b) the cause of action and the relief claimed by the plaintiff had been substantially indicated.]

STATE AMENDMENTS
Madhya Pradesh ? (i) After sub-section (3) of Section 80 the following inserted:
"(4) where in a suit or proceeding referred to in Rule 3B of Order 1, the state is joined as a defendant or non applicant or where the Court orders joinder of the State as defendant or non applicant in exercise of powers under Rule 10(2) of order 1 such suit or proceeding shall not be dismissed by reasons of Omission of the plaintiff or applicant to issue notice under sub-section (1)".
(ii) In sub-section (1) of section 80 for the words "sub-section (2)" substitute "sub-section (2) or (4)".
[M.P. Act No. 29 of 1948]."""
    },
    {
        "num": "81",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Exemption from arrest and personal appearance",
        "text": """81. Exemption from arrest and personal appearance? In a suit instituted against a public officer in respect of any act purporting to be done by him in his official capacity?
(a) the defendant shall not be liable to arrest nor his property to attachment otherwise than in execution of a decree, and
(b) where the Court is satisfied that the defendant cannot absent himself from his duty without detriment to the public service, it shall exempt him from appearing in person."""
    },
    {
        "num": "82",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Execution of decree",
        "text": """82. Execution of decree? [57](1) Where, in a suit by or against the Government or by or against a public officer in respect of any act purporting to be done him in his official capacity, a decree is passed against the Union of India or a State or, as the case may be, the public officer, such decree shall not be executed except in accordance with the provisions of sub-section(2)].
(2) Execution shall not be issued on any such decree unless it remains unsatisfied for the period of three months computed from the date of [58][such decree].
(3) The provisions of sub-sections (1) and (2) shall apply in relation to an order or award as they apply in relation to a decree, if the order or award?
(a) is passed or made against the Union of India or a State or a public officer in respect of any such act as aforesaid, whether by a Court or by any other authority; and
(b) is capable of being executed under the provisions of this code or of any other law for the time being in force as if it were a decree."""
    },
    {
        "num": "83",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "When aliens may sue",
        "text": """83. When aliens may sue? Alien enemies residing in India with the permission of the Central Government, and alien friends, may sue in any Court otherwise competent to try the suit, as if they were citizens of India, but alien enemies residing in India without such permission, or residing in a foreign country, shall not sue in any such court.
Explanation?Every person residing in a foreign country, the Government of which is at war with India and carrying on business in that country without a licence in that behalf granted by the Central Government, shall, for the purpose of this section, be deemed to be an alien enemy residing in a foreign country."""
    },
    {
        "num": "84",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "When foreign State may sue",
        "text": """84. When foreign State may sue.? A foreign State may sue in any competent Court:
Provided that the object of the suit is to enforce a private right vested in the Ruler of such State or in any officer of such State in his public capacity."""
    },
    {
        "num": "85",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Persons specially appointed by Government to prosecute or defend on behalf of foreign Rulers",
        "text": """85. Persons specially appointed by Government to prosecute or defend on behalf of foreign Rulers? (1) The Central Government may, at the request of the Ruler of a foreign State or at the request of any person competent in the opinion of the Central Government to act on behalf of such Ruler, by order, appoint any persons to prosecute or defend any suit on behalf of such Ruler, and any persons so appointed shall be deemed to be the recognized agents by whom appearances, acts and applications under this Code may be made or done on behalf of such Ruler.
(2) An appointment under this section may be made for the purpose of a specified suit or of several specified suits, or for the purpose of all such suits as it may from time to time be necessary to prosecute or defend on behalf of such Ruler.
(3) A person appointed under this section may authorise or appoint any other persons to make appearances and applications and do acts in any such suit or suits as if he were himself a party thereto."""
    },
    {
        "num": "86",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Suits against foreign Rulers, Ambassadors and Envoys",
        "text": """86. Suits against foreign Rulers, Ambassadors and Envoys? (1) No.****[59] foreign State may be sued in any Court otherwise competent to try the suit except with consent of the Central Government certified in writing by a Secretary to that Government :
Provided that a person may, as a tenant of immovable property, sue without such consent as aforesaid [60][a foreign State] from whom he holds or claims to hold the property.
(2) Such consent may be given with respect to a specified suit or to several specified suits or with respect to all suits of any specified class or classes, and may specify, in the case of any suit or class of suits, the Court in which [61][the foreign State] may be sued, but it shall to be given, unless it appears to the Central Government that [62][the foreign State].
(a) has instituted a suit in the Court against the person desiring to sue [63][it], or
(b) [64][itself] or another, trades within the local limits of the jurisdiction of the Court, or
(c) is in possession of immovable property situate within those limits and is to be sued with reference to such property or for money charged thereon, or
(d) has expressly or impliedly waived the privilege accorded to [65][it] by this section.
[66] [(3) Except with the consent of the Central Government, certified in writing by a Secretary to that government, no decree shall be executed against the property of any foreign State.]
(4) The proceeding provisions of this section shall apply in relation to ?
[67] [(a) any Ruler of a foreign State;]
[68] [(aa)] any ambassador or Envoy of a foreign State ;
(b) any High Commissioner of a Commonwealth country; and
(c) any such member of the staff [69][of the foreign State or the staff or retinue of the Ambassador] or Envoy of a foreign State or of the High Commissioner of a Commonwealth country as the Central Government may, by general or special order, specify in this behalf.
[70][as they apply in relation to a foreign State].
[71][(5) the following persons shall not be arrested under this Code, namely : ?
(a) any ruler of a foreign State;
(b) any Ambassador or Envoy of a foreign State;
(c) any High Commissioner of a Commonwealth country;
(d) any such member of the staff of the foreign State or the staff or retinue of the Ruler, Ambassador or Envoy of a foreign State or of the High Commissioner of a Commonwealth country, as the Central Government may, by general or special order, specify in this behalf.
(6) Where a request is made to the Central Government for the grant of any consent referred to in sub-section (1), the Central Government shall, before refusing to accede to the request in whole or in part, give to the person making the request a reasonable opportunity of being heard.]"""
    },
    {
        "num": "87",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Style of foreign Rulers as parties to suits",
        "text": """87. Style of foreign Rulers as parties to suits? The Ruler of a foreign State may sue, and shall be sued, in the name of his State:
Provided that in giving the consent referred to in section 86, the Central Government may direct that the Ruler may be sued in the name of an agent or in any other name."""
    },
    {
        "num": "87A",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Definitions of \"foreign State\" and \"Ruler\"",
        "text": """87A. Definitions of "foreign State" and "Ruler" ? (1) In this Part,?
(a) "foreign State" means any State outside India which has been recognised by the Central Government; and
(b) "Ruler", in relation to a foreign State, means the person who is for the time being recognized by the Central Government to be the head of that State.
(2) Every Court shall take judicial notice of the fact ?
(a) that a state has or has not been recognized by the Central Government;
(b) that a person has or has not been recognized by the Central Government to be the head of a State."""
    },
    {
        "num": "87B",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Applications of sections 85 and 86 to Rulers of former Indian States",
        "text": """87B. Applications of sections 85 and 86 to Rulers of former Indian States.? (1) In the case of any suit by or against the Ruler of any former Indian State which is based wholly or in part upon a cause of action which arose before the commencement of the Constitution or any proceedings arising out of such suit, the provisions of section 85 and sub-sections (1) and (3) of section 86 shall apply in relation to such Ruler as they apply in relation to the Ruler of a foreign State.
(2) In this section?
(a) "former Indian State" means any such Indian State as the Central Government may, by notification in the Official Gazette, specify for the purposes of this;
(b) "commencement of the Constitution" means the 26th day of January, 1950; and
(c) "Ruler" in relation to a former Indian State, has the same meaning as in article 363 of the Constitution."""
    },
    {
        "num": "88",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "SUITS IN PARTICULAR CASES",
        "title": "Where interpleader suit may be reinstituted",
        "text": """88. Where interpleader suit may be reinstituted? Where two or more persons claim adversely to one another the same debts, sum of money or other property, movable or immovable, from another person, who claims no interest therein other than for charges or costs and who is ready to pay or deliver it to the rightful claimant such other person may institute a suit of interpleader against all the claimants for the purpose of obtaining a decision as to the person to whom the payment or delivery shall be made and of obtaining indemnity for himself:
Provided that where any suit is pending in which the rights of all parties can properly be decided, no such suit of interpleader shall be instituted."""
    },

    # PART V-SPECIAL PROCEEDINGS (Chapter 6)
    {
        "num": "89",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "SPECIAL PROCEEDINGS",
        "title": "Arbitration",
        "text": """89. [Arbitration.] Rep. by the Arbitration Act, 1940 (10 of 1940), s. 49 and Sch. III"""
    },
    {
        "num": "90",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "SPECIAL PROCEEDINGS",
        "title": "Power to state case for opinion of Court",
        "text": """90. Power to state case for opinion of Court? Where any person agree in writing to state a case for the opinion of the Court, then the Court shall try and determine the same in the manner prescribed."""
    },
    {
        "num": "91",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "SPECIAL PROCEEDINGS",
        "title": "Public nuisances and other wrongful acts affecting the public",
        "text": """[72][Public nuisances and other wrongful acts affecting the public]
91. Public nuisances and other wrongful acts affecting the public.? [73][(1) in the case of a public nuisance or other wrongful act affecting, or likely to affect, the public, a suit for a declaration and injunction or for such other relief as may be appropriate in the circumstances of the case, may be instituted,?
(a) by the Advocate General, or
(b) with the leave of the Court, by two or more persons, even though no special damage has been caused to such persons by reason of such public nuisance or other wrongful act.]
(2) Nothing in this section shall be deemed to limit or otherwise affect any right of suit which may exist independently of its provisions."""
    },
    {
        "num": "92",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "SPECIAL PROCEEDINGS",
        "title": "Public charities",
        "text": """92. Public charities? (1) In the case of any alleged breach of any express or constructive trust created for public purposes of a charitable or religious nature, or where the direction of the Court is deemed necessary for the administration of any such trust, the Advocate-General, or two or more persons having an interest in the trust and having obtained the [74][leave of the Court] may institute a suit, whether contentious or not, in the principal Civil Court of original jurisdiction or in any other Court empowered in that behalf by the State Government within the local limits of whose jurisdiction the whole or any part of the subject-matter of the trust is situate to obtain a decree?
(a) removing any trustee;
(b) appointing a new trustee;
(c) vesting any property in a trustee;
(cc) directing a trustee who has bee removed or a person who has ceased to be a trustee, to deliver possession of any trust property in his possession to the person entitled to the possession of such property;
(d) directing accounts and inquires;
(e) declaring what proportion of the trust property or of the interest therein shall be allocated to any particular object of the trust;
(f) authorizing the whole or any part of the trust property to be let, sold, mortgaged or exchanged;
(g) settling a scheme; or
(h) granting such further or other relief as the nature of the case may require.
(2) Save as provided by the Religious Endowments Act, 1863 (20 of 1863) or by any corresponding law in force in the territories which, immediately before the 1st November, 1956, were comprised in Part B States, no suit claiming any of the reliefs specified in sub-section (1) shall be instituted in respect of any such trust as is therein referred to except in conformity with provisions of that sub-section.
[75] [(3) The Court may alter the original purposes of an express or constructive trust created for public purposes of a charitable or religious nature and allow the property or income of such trust or any portion thereof to be applied cy press in one or more the following circumstances, namely:?
(a) where the original purposes of the trust, in whole or in part,?
(i) have been, as far as may be, fulfilled; or
(ii) cannot be carried out at all, or cannot be carried out according to the directions given in the instrument creating the trust or, where there is no such instrument, according to the spirit of the trust;
(b) where the original purposes of the trust provide a use for a part only of the property available by virtue of the trust; or
(c) where the property available by virtue of the trust and other property applicable for similar purposes can be more effectively used in conjunction with, and to that end can suitably be made applicable to any other purpose, regard being had to the spirit of the trust and its applicability to common purposes; or
(d) where the original purposes, in whole or in part, were laid down by reference to an area which then was, but has since ceased to be, a unit for such purposes; or
(ii) ceased, as being useless or harmful to the community, or
(iii) ceased to be, in law, charitable, or
(iv) ceased in any other way to provide a suitable and effective method of using the property available by virtue of the trust, regard being had to the spirit of the trust.]

STATE AMENDMENTS
Uttar Pradesh? After clause (b) of sub-section (1) of section 92 insert the following:
"(bb) for delivery of possession of any trust property against a person who has ceased to be trustee or has been removed".
[U.P. Act No. 24 of 1954]."""
    },
    {
        "num": "93",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "SPECIAL PROCEEDINGS",
        "title": "Exercise of powers of Advocate-General outside presidency-towns",
        "text": """93. Exercise of powers of Advocate-General outside presidency-towns? The powers conferred by sections 91 and 92 on the Advocate-General may, outside the presidency-towns, be, with the previous sanction of the State Government, exercised also by the Collector or by such officer as the State Government may appoint in this behalf."""
    },

    # PART VI-SUPPLEMENTAL PROCEEDINGS (Chapter 7)
    {
        "num": "94",
        "chapterNo": 7,
        "chapterRoman": "VI",
        "chapterName": "SUPPLEMENTAL PROCEEDINGS",
        "title": "Supplemental Proceedings",
        "text": """94. Supplemental Proceedings? In order to prevent the ends of justice from being, defeated the Court may, if it is to prescribed,?
(a) issue a warrant to arrest the defendant and bring him before the Court to show cause why he should not give security for his appearance, and if he fails to comply with any order for security commit him to the civil prison;
(b) direct the defendant to furnish security to produce any property belonging to him and to place the same at the disposal of the Court or order the attachment of any property;
(c) grant a temporary injunction and in case of disobedience commit the person guilty thereof to the civil prison and order that his property be attached and sold;
(d) appoint a receiver of any property and enforce the performance of his duties by attaching and selling his property;
(e) make such other interlocutory orders as may appear to the Court to be just and convenient."""
    },
    {
        "num": "95",
        "chapterNo": 7,
        "chapterRoman": "VI",
        "chapterName": "SUPPLEMENTAL PROCEEDINGS",
        "title": "Compensation for obtaining arrest, attachment or injunction on insufficient grounds",
        "text": """95. Compensation for obtaining arrest, attachment or injunction on insufficient grounds? Where, in any suit in which an arrest or attachment has been effected or a temporary injunction granted under the last preceding section,?
(a) it appears to the Court that such arrest, attachment or injunction was applied for on insufficient grounds, or
(b) the suit of the plaintiff fails and it appears to the Court that there was no reasonable or probable grounds for instituting the same,
the defendant may apply to the Court, and the Court may, upon such application, award against the plaintiff by its order such amount, not exceeding one thousand rupees, as it deems a reasonable compensation to the defendant for the [76][expense or injury (including injury to reputation) caused to him];
Provided that a Court shall not award, under this section, an amount exceeding the limits of its peculiar jurisdiction.
(2) An order determining any such application shall bar any suit for compensation in respect of such arrest, attachment or injunction."""
    },

    # PART VII-APPEALS (Chapter 8)
    {
        "num": "96",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Appeal from original decree",
        "text": """96. Appeal from original decree? (1) Save where otherwise expressly provided in the body of this Code or by any other law for the time being in force, an appeal shall lie from every decree passed by any Court exercising original jurisdiction the Court authorized to hear appeals from the decisions of such Court.
(2) An appeal may lie from an original decree passed ex parte.
(3) No appeal shall lie from a decree passed by the Court with the consent of parties.
[77] [(4) No appeal shall lie, except on a question of law, from a decree in any suit of the nature cognisable by Courts of Small Cause, when the amount or value of the subject-matter of the original suit does not exceed three thousand rupees.]"""
    },
    {
        "num": "97",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Appeal from final decree where no appeal from preliminary decree",
        "text": """97. Appeal from final decree where no appeal from preliminary decree? Where any party aggrieved by a preliminary decree passed after the commencement of this Code does not appeal from such decree, he shall be precluded from dispating its correctness in any appeal with may be preferred from the final decree."""
    },
    {
        "num": "98",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Decision where appeal heard by two or more Judges",
        "text": """98. Decision where appeal heard by two or more Judges? (1) Where an appeal is heard by a Bench of two or more Judges, the appeal shall be decided in accordance with the opinion of such Judges or of the majority (if any) of such Judges.
(2) Where there is no such majority which concurs in a judgment varying or reversing the decree appealed from, such decree shall be confirmed :
Provided that where the Bench hearing the appeal is [78][composed of two or other even number of Judges belonging to a Court consisting of more Judges than those constituting the Bench] and the Judges composing the Bench differ in opinion on a point of law, they may state the point of law upon which they differ and the appeal shall then be heard upon that point only by one or more of the other Judges, and such point shall be decided according to the opinion of the majority (if any) of the Judges who have heard the appeal including those who first heard it.
(3) Nothing in this section shall be deemed to alter or otherwise affect any provision of the letters patent of any High Court."""
    },
    {
        "num": "99",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "No decree to be reversed or modified for error or irregularity not affecting merits or jurisdiction",
        "text": """99. No decree to be reversed or modified for error or irregularity not affecting merits or jurisdiction? No decree shall be reversed or substantially varied, nor shall any case be remanded in appeal on account of any misjoinder [79][or non-joinder] of parties or causes of action or any error, defect or irregularity in any proceedings in the suit, not affecting the merits of the case or the jurisdiction of the Court.
[80][Provided that nothing in this section shall apply to non-joinder of a necessary party.]"""
    },
    {
        "num": "99A",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "No order under section 47 to be refused or modified unless decision of the case is prejudicially affected",
        "text": """[81][99A. No order under section 47 to be refused or modified unless decision of the case is prejudicially affected? Without prejudice to the generality of the provisions of section 99, no order under section 47 shall be reversed or substantially varied, on account of any error, defect or irregularity in any proceeding relating to such order, unless such error, defect or irregularity has prejudicially affected the decision of the case.}"""
    },
    {
        "num": "100",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Second appeal",
        "text": """[82][100. Second appeal? (1) Save as otherwise expressly provided in the body of this Code or by any other law for the time being in force, an appeal shall lie to the High Court from every decree passed in appeal by any Court subordinate to the High Court, if the High Court is satisfied that the case involves a substantial question of law.
(2) An appeal may lie under this section from an appellate decree passed ex parte.
(3) In an appeal under this section, the memorandum of appeal shall precisely state the substantial question of law involved in the appeal.
(4) Where the High Court is satisfied that a substantial question of law is involved in any case, it shall formulate that question.
(5) The appeal shall be heard on the question so formulated and the respondent shall, at the hearing of the appeal, be allowed to argue that the case does not involve such question :
Provided that nothing in this sub-section shall be deemed to take away or abridge the power of the Court to hear, for reasons to be recorded, the appeal on any other substantial question of law, not formulated by it, if it is satisfied that the case involves such question.]"""
    },
    {
        "num": "100A",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "No further appeal in certain cases",
        "text": """[83][100A. No further appeal in certain cases? Notwithstanding anything contained in any Letters Patent for any High Court or in any other instrument having the force of law or in any other law for the time being in force, where any appeal from an appellate decree or order is heard and decided by a single Judge of a High Court, no further appeal shall lie from the judgment, decision or order or such single Judge in such appeal or from any decree passed in such appeal.]"""
    },
    {
        "num": "101",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Second appeal on no other grounds",
        "text": """101. Second appeal on no other grounds? No second appeal shall lie except on the ground mentioned in section 100."""
    },
    {
        "num": "102",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "No second appeal in certain suits",
        "text": """102. No second appeal in certain suits? No second appeal shall lie in any suit of the nature cognizable by Courts of Small Causes, when the amount or value of the subject-matter of the original suit does not exceed [84][three thousand rupees]."""
    },
    {
        "num": "103",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Power of High Court to determine issues of fact",
        "text": """[85][103. Power of High Court to determine issues of fact? In any second appeal, the High Court may, if the evidence on the record is sufficient, determine any issue necessary for the disposal of the appeal,?
(a) which has not been determined by the lower Appellate Court or both by the Court of first instance and the lower Appellate Court, or
(b) which has been wrongly determined by such Court or Courts reason of a decision on such question of law as is referred to in section 100.]"""
    },
    {
        "num": "104",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Orders from which appeal lies",
        "text": """104. Orders from which appeal lies? (1) An appeal shall lie from the following orders, and save as otherwise expressly provided in the body of this Code or by any law for the time being in force, from no other orders:?
[Clauses (a) to (f) omitted]
(ff) an order under section 35A;
[86] [(ffa) an order under section 91 or section 92 refusing leave to institute a suit of the nature referred to in section 91 or section 92, as the case may be;]
(g) an order under section 95;
(h) an order under any of the provisions of this Code imposing a fine or directing the arrest or detention in the civil prison of an person except where such arrest or detention is in execution of a decree;
(i) any order made under rules from which an appeal is expressly allowed by rules;
Provided that not appeal shall lie against any order specified in clause (ff) save on the ground that no order, or an order for the payment of a less amount, ought to have been made.
(2) No appeal shall lie from any order passed in appeal under this section."""
    },
    {
        "num": "105",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Other orders",
        "text": """105. Other orders? (1) Save as otherwise expressly provided, no appeal shall lie from any order made by a Court in the exercise of its original or appellate jurisdiction; but, where a decree is appealed from, any error, defect or irregularity in any order, affecting the decision of the case, may be set forth as ground of objection in the memorandum of appeal.
(2) Notwithstanding anything contained in sub-section (1), where any party aggrieved by an order of remand [87]***** from which an appeal lies does not appeal therefrom, he shall thereafter be precluded from disputing its correctness."""
    },
    {
        "num": "106",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "What Courts to hear appeals",
        "text": """106. What Courts to hear appeals? Where an appeal from any order is allowed it shall lie to the Court to which an appeal would lie from the decree in the suit in which such order was made, or where such order is made by a Court (not being a High Court) in the exercise of appellate jurisdiction, then to the High Court."""
    },
    {
        "num": "107",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Powers of Appellate Court",
        "text": """107. Powers of Appellate Court? (1) Subject to such conditions and limitations as may be prescribed, an Appellate Court shall have power?
(a) to determine a case finally;
(b) to remand a case;
(c) to frame issues and refer them for trial;
(d) to take additional evidence or to require such evidence to be taken.
(2) Subject as aforesaid, the Appellate Court shall have the same powers and shall perform as nearly as may be the same duties as are conferred and imposed by this Code on Courts of original jurisdiction in respect of suits instituted therein."""
    },
    {
        "num": "108",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Procedure in appeals from appellate decrees and orders",
        "text": """108. Procedure in appeals from appellate decrees and orders? The provisions of this Part relating to appeals from original decree shall, so far as may be, apply to appeals?
(a) from appellate decrees, and
(b) from orders made under this Code or under any special or local law in which a different procedure is not provided."""
    },
    {
        "num": "109",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "When appeals lie to the Supreme Court",
        "text": """109. When appeals lie to the Supreme Court? Subject to the provisions in Chapter IV of Part V of the Constitution and such rules as may, from time to time, be made by the Supreme Court regarding appeals from the Courts of India, and to the provisions hereinafter contained, an appeal shall lie to the Supreme Court from any judgment, decree or final order in a civil proceeding of a High Court, if the High Court certifies?
(i) that the case involves a substantial question of law of general importance; and
(ii) that in the opinion of the High Court the said question needs to be decided by the Supreme Court."""
    },
    {
        "num": "110",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Value of subject matters",
        "text": """110. [Value of subject matters] Rep. by the Code of Civil Procedure (Amendment) Act, 1973 (49 of 1973)."""
    },
    {
        "num": "111",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Bar of certain appeals",
        "text": """111. [Bar of certain appeals] Rep. by the A.O. 1950."""
    },
    {
        "num": "111A",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Appeals to Federal Court",
        "text": """111A. [Appeals to Federal Court] Rep. by the Federal Court Act, 1941 (21 of 1941)."""
    },
    {
        "num": "112",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "APPEALS",
        "title": "Savings",
        "text": """112. Savings? (1) Nothing contained in this Code shall be deemed?
(a) to affect the powers of the Supreme Court under article 136 or any other provision of the Constitution, or
(b) to interfere with any rules made by the Supreme Court, and for the time being in force, for the presentation of appeals to that Court, or their conduct before that Court.
(2) Nothing herein contained applies to any matter of criminal or admiralty or vice-admiralty jurisdiction or to appeals from orders and decrees of Prize Courts."""
    },

    # PART VIII-REFERENCE, REVIEW AND REVISION (Chapter 9)
    {
        "num": "113",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "REFERENCE, REVIEW AND REVISION",
        "title": "Reference to High Court",
        "text": """113. Reference to High Court? Subject to such conditions and limitations as may be prescribed, any Court may state a case and refer the same for the opinion of the High Court, and the High Court may make such order thereon as it thinks fit :
Provided that where the Court is satisfied that a case pending before it involves a question as to the validity of any Act, Ordinance or Regulation or of any provision contained in an Act, Ordinance or Regulation, the determination of which is necessary for the disposal of the case, and is of opinion that such Act, Ordinance, Regulation or provision is invalid or inoperative, but has not been so declared by the High Court to which that Court is subordinate or by the Supreme Court, the Court shall state a case setting out its opinion and the reasons therefor, and refer the same for the opinion of the High Court.
Explanation.?In this section "Regulation" means any Regulation of the Bengal, Bombay or Madras Code or Regulation as defined in the General Clauses Act, 1897, (10 of 1897) or in the General Clauses Act of a State.

STATE AMENDMENTS
Andhra Pradesh? In the Explanation to section 113 after the words "any Regulation of the Bengal, Bombay or Madras Code" insert the words "or any Regulation of the Madras Code in force, in the State of Andhra as it existed immediately before the 1st Nov. 1956".
[Andhra Adoption of Laws (Amendment) orders of 1954 and 1957].
Tamilnadu? In the Explanation to section 113 after the words "any Regulation of the Bengal, Bombay or Madras Code" insert the words "or any Regulation of the Madras Code in force in the territories specified in Second Schedule to the Andhra Pradesh and Madras (Alteration of Boundaries) Act, 1959"
[Madras Added Territories Adaptation of Laws Order, 1961].
Union Territory of Pondicherry? Some as in Tamil Nadu (Act No. 49 of 1962)."""
    },
    {
        "num": "114",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "REFERENCE, REVIEW AND REVISION",
        "title": "Review",
        "text": """114. Review? Subject as aforesaid, any person considering himself aggrieved?
(a) by a decree or order from which an appeal is allowed by this Code, but from which no appeal has been preferred,
(b) by a decree or order from which no appeal is allowed by this Court, or
(c) by a decision on a reference from a Court of Small Causes, may apply for a review of judgment to the Court which passed the decree or made the order, and the Court may make such order thereon as it thinks fit."""
    },
    {
        "num": "115",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "REFERENCE, REVIEW AND REVISION",
        "title": "Revision",
        "text": """115. Revision? [88][(1)] The High Court may call for the record of an case which has been decided by any Court subordinate to such High Court and in which no appeal lies thereto, and if such subordinate Court appears?
(a) to have exercised a jurisdiction not vested in it by law, or
(b) to have failed to exercise a jurisdiction so vested, or
(c) to have acted in the exercise of its jurisdiction illegally or with material irregularity,
the High Court may make such order in the case as it thinks fit :
[89] [Provided that the High Court shall no, under this section, vary or reverse any order made, or any order deciding an issue, in the course of a suit or other proceeding, except where?
(a) the order, if it had been made in favour of the party applying for revision, would have finally disposed of the suit or other proceedings, or
(b) the order, if allowed to stand, would occasion a failure of justice or cause irreparable injury to the party against whom it was made.]
[90] [(2) The High Court shall not, under this section, vary or reverse any decree or order against which an appeal lies either to the High Court or to any Court subordinate thereto.
Explanation.?In this section, the expression "any case which has been decided" includes any order made, or any order deciding an issue in the course of a suit or other proceeding.]

STATE AMENDMENTS
Madhya Pradesh? For Section 115 of the principal Act, the following Section substituted.
"115. Revision.? The High Court may call for the record of any cases which has been decided by any Court subordinate to such High Court and in which no appeal lies thereto, and if such subordinate Court appears?
(a) to have exercised a jurisdiction not vested in it by law; or
(b) to have failed to exercise a jurisdiction so vested; or
(c) to have acted in the exercise of its jurisdiction illegally or with material irregularity, the High Court may make such order in the case as it thinks fit;
Provided that the High Court shall not, under this section, vary or reverse any order made or any order deciding an issue, in the course of a suit or other proceedings except where:?
(a) the order, if it had been made in favour of the party applying for the revision, would have finally disposed of the suit or proceeding; or
(b) the order, if allowed to stand, would occasion a failure of justice or cause irreparable injury to the party against whom it was made.
(2) The High Court shall not, under this section, vary or reverse any decree or order against which an appeal lies either to the High Court or to any court subordinate thereto.
Explanation.? In this section, the expression "any case which has been decided" includes any order made, or any order deciding an issue in the course of a suit or other proceeding.
[M.P. Act 4 of 1994].
Orissa.? In its application to the State of Orissa, for section 115, substitute the following:?
"115. Revision.? The High Court, in cases arising out of original suits or other proceedings of the value exceeding one lakh rupees, and the District Court, in any other case, including a case arising out of an original suit or other proceedings instituted before the commencement of the Code of Civil Procedure (Orissa Amendment) Act, 1991, may call for the record of any case which has been decided by any Court subordinate to the High Court or the District Court, as the case may be, and in which no appeal lies thereto, and if such subordinate Court appears?
(a) to have exercised a jurisdiction not vested in it by law; or
(b) to have failed to exercise a jurisdiction so vested; or
(c) to have acted in the exercise of its jurisdiction illegally or with material irregularity, the High Court or the District Court, as the case may be, may make such order in the case as it thinks fit;
Provided that in respect of cases arising out of original suits or other proceedings of any valuation decided by the District Court, the High Court alone shall be competent to make an order under this section:
Provided further that the High Court or the District Court shall not, under this section, vary or reverse any order, including an order deciding an issue, made in the course of a suit or other proceedings, except where,?
(i) the order, if so varied or reversed, would finally dispose of the suit or other proceedings; or
(ii) the order, if allowed to stand, would occasion a failure of justice or cause irreparable injury to the party against whom it was made.
Explanation.? In this section, the expression "any case which has been decided" includes any order deciding an issue in the course of a suit or other proceeding."
[Orissa Act 26 of 1991].
Uttar Pradesh.? In its application to the State of Uttar Pradesh, for section 115, substitute the following:?
"115 Revision.? The High Court, in cases arising out of original suits or other proceedings of the value exceeding one lakh rupees or such higher amount not exceeding five lakh rupees as the High Court may from time to time fix, by notification published in the Official Gazette including such suits or other proceedings instituted before the date of commencement of the U.P. Civil Laws (Amendment) Act, 1991, or as the case may be, the date of commencement of such notification and the District Court in any other case, including a case arising out of an original suit or other proceedings instituted before such date, may call for the record of any case which has been decided by any Court subordinate to such High Court or District Court, as the case may be, and in which no appeal lies thereto, and if such subordinate Court appears?
(a) to have exercised a jurisdiction not vested in it by law; or
(b) to have failed to exercise a jurisdiction so vested; or
(c) to have acted in the exercise of its jurisdiction illegally or with material irregularity,
the High Court or the District Court, as the case may be, may make such order in the case as it thinks fit:
Provided that in respect of cases arising out of original suits or other proceedings of any valuation, decided by the District Court, the High Court alone shall be competent to make an order under this section:
Provided further that the High Court or the District Court shall not, under this section, vary or reverse any order including an order deciding an issue, made in the course of a suit or other proceeding, except where,?
(i) the order, if so varied or reversed, would finally dispose of the suit or other proceeding; or
(ii) the order, if allowed to stand, would occasion a failure of justice or cause irreparable injury to the party against whom it was made:
Provided also that where a proceeding of the nature in which the District Court may call for the record and pass orders under this Section was pending immediately before the relevant date of commencement referred to above, in the High Court, such Court shall proceed to dispose of the same.
Explanation.? In this section, the expression "any case which has been decided" includes any order deciding an issue in the course of a suit or other proceeding."
[U.P. Acts 31 of 1978 and 17 of 1991]
West Bengal? After Section 115 of the Code the following section 115A inserted:
"115A. District Court's powers of revision? (1) A District Court may exercise all or any of the power which may be exercised by the High Court under section 115.
(2) Where any proceedings by way of revision is commenced before a District Court in pursuance of the provision of sub-section (1), the provisions of section 115 shall, so for as may be, apply to such proceeding and references to the said section 60 the High Court shall be construed as reference to the District Court.
(3) Where any proceeding for revision is commenced before the District Court, the decision of the District Court on such proceeding shall be final and no further proceeding by way of revision shall be entertained by the High Court or any other Court.
(4) If any application for revision has been made by any party either to the High Court under section 115 or to the District Court under this section, no further application by the same party shall be entertained by the other of them.
(5) A Court of an Additional Judge shall have and may exercise all the powers of a District Court under this section in respect of any proceeding which may be transferred to it by or under any general or special order of the District Court"
[West Bengal Act No. 15 of 1988]."""
    },

    # PART IX-SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER (Chapter 10)
    {
        "num": "116",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER",
        "title": "Part to apply only to certain High Courts",
        "text": """116. Part to apply only to certain High Courts? This Part applies only to High Courts not being the Court of a Judicial Commissioner."""
    },
    {
        "num": "117",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER",
        "title": "Application of Code to High Court",
        "text": """117. Application of Code to High Court.? Save as provided in this Part or in Part X or in rules, the provisions of this Court shall apply to such High Courts."""
    },
    {
        "num": "118",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER",
        "title": "Execution of decree before ascertainment of costs",
        "text": """118. Execution of decree before ascertainment of costs? Where any such High Court considers it necessary that a decree passed in the exercise of its original civil jurisdiction should be executed before the amount of the costs incurred in the suit can be ascertained by taxation, the Court may order that the decree shall be executed forthwith except as to so much thereof as relates to the costs;
and, as to so much thereof as relates to the costs, that the decree may be executed as soon as the amount of the costs shall be ascertained by taxation."""
    },
    {
        "num": "119",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER",
        "title": "Unauthorized persons not to address Court",
        "text": """119. Unauthorized persons not to address Court? Nothing in this Code shall be deemed to authorize any person on behalf of another to address the Court in the exercise of its original civil jurisdiction, or to examine witnesses, except where the Court shall have in the exercise of the power conferred by its charter authorized him so to do, or to interfere with the power of the High Court to make rules concerning advocates, vakils and attorneys."""
    },
    {
        "num": "120",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "SPECIAL PROVISIONS RELATING TO THE HIGH COURTS NOT BEING THE COURT OF A JUDICIAL COMMISSIONER",
        "title": "Provisions not applicable to High Court in original civil jurisdiction",
        "text": """120. Provisions not applicable to High Court in original civil jurisdiction? (1) The following provisions shall not apply to the High Court in the exercise of its original civil jurisdiction, namely, sections 16, 17 and 20."""
    },

    # PART X-RULES (Chapter 11)
    {
        "num": "121",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Effect of rules in First Schedule",
        "text": """121. Effect of rules in First Schedule? The rules in a First Schedule shall have effect as if enacted in the body of this Code until annulted or altered in accordance with the provisions of this Part."""
    },
    {
        "num": "122",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Power of certain High Courts to make rules",
        "text": """122. Power of certain High Courts to make rules? High Courts not being the Court of a Judicial Commissioner may, from time to time after previous publication, make rules regulating their own procedure and the procedure of the Civil Courts subjects to their superintendence, and may be such rules annul, alter or add to all or any of the rules in the First Schedule."""
    },
    {
        "num": "123",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Constitution of Rule Committees in certain States",
        "text": """123. Constitution of Rule Committees in certain States? (1) A committee to be called the Rule Committee, shall be constituted at the town which is the usual place of sitting of each of the High Courts referred to in section 122.
(2) Each such Committee shall consist of the following persons, namely?
(a) three Judges of the High Court established at the town at which such Committee is constituted, one of whom at least has served as a District Judge or a Divisional Judge for three years,
(b) two legal practitioners enrolled in that Court
(c) a Judge of a Civil Court subordinate to the High Court[91]*****
[92]***
(3) The members of each such Committee shall be appointed by the [93][High Court], which shall also nominate one of their number to be President :
[94]***
(4) Each member of any such Committee shall hold office for such period as may be prescribed by the [95][High Court] in this behalf; and whenever any member retires, resigns, dies or ceases to reside in the State in which the Committee was constituted or becomes incapable of acting as a member of the Committee, the said [96][High Court] may appoint another person to be a member in his stead.
(5) There shall be a secretary to each such Committee who shall be appointed by the [97][High Court] and shall receiver such remuneration as may be provided in this behalf by the State Government.

STATE AMENDMENTS
Assam and Nagaland? Substitute the following for clause (a) sub-section (2) of section 123.
"(a) three judges of the High Court established at the town at which such committee is constituted, provided that the Chief Justice may appoint only two judges of the High Court on the Committee if the number of Judges of the High Court does not exceed three"
[Assam Act No. VIII of 1953].
Tamil Nadu? In section 123 sub-section (2).
(a) "In clause (b) for the words `two legal practitioners' substitute the words `three legal practitioners'."
(b) "Omit the words `Madras' in clause (d)".
[Tamil Nadu Act No. 15 of 1970]."""
    },
    {
        "num": "124",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Committee to report to High Court",
        "text": """124. Committee to report to High Court.? Every Rule Committee shall make a report to the High Court established at the town at which it is constituted on any proposal to annul, alter or add to the rules in the First Schedule or to make new rules, and before making any rules under section 122 the High Court shall take such report into consideration."""
    },
    {
        "num": "125",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Power of other High Courts to make rules",
        "text": """125. Power of other High Courts to make rules? High Courts, other than the Courts specified in section 122, may exercise the powers conferred by that section in such manner and subject to such conditions as the State government may determine:
Provided that any such High Court may, after previous publication, make a rule extending within the local limits of its jurisdiction any rules which have been made by any other High Court."""
    },
    {
        "num": "126",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Rules to be subject to approval",
        "text": """126. Rules to be subject to approval? Rules made under the foregoing provisions shall be subject to the previous approval of the Government of the State in which the Court whose procedure the rules regulate is situate or, if that Court is not situate in any State, to the previous approval of Central Government."""
    },
    {
        "num": "127",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Publication of rules",
        "text": """127. Publication of rules? Rules so made and approved shall be published in the Official Gazette and shall from the date of publication or from such other date as may be specified have the same force and effect, within the local limits of the jurisdiction of the High Court which made them, as if they had been contained in the First Schedule."""
    },
    {
        "num": "128",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Matters for which rules may provide",
        "text": """128. Matters for which rules may provide? (1) Such rules shall be not inconsistent with the provisions in the body of this Code, but, subject thereto, may provide for any matters relating to the procedure of Civil Courts.
(2) In particular, and without prejudice to the generality of the powers conferred by sub-section (1), such rules may provide for all or any of the following matters, namely :?
(a) the service of summons, notices and other processes by post or in any other manner either generally or in any specified areas, and the proof of such service;
(b) the maintenance and custody, while under attachment, of live-stock and other movable property, the fees payable for such maintenance and custody, the sale of such live-stock and property and the proceeds of such sale;
(c) procedure in suits by way of counterclaim and the valuation of such suits for the purposes of jurisdiction;
(d) procedure in garnishee and charging order either in addition to, or in substitution for, the attachment and sale of debts;
(e) procedure where the defendant claims to be entitled to contribution or indemnity over against any person whether a party tot he suit or not;
(f) summary procedure?
(i) in suits in which the plaintiff seeks only to recover a debt or liquidated demand in money payable by the defendant, with or without interest, arising?
on a contract express or implied; or
on an enactment where the sum sought to be recovered is a fixed sum of money or in the nature of a debt other than a penalty; or
on a guarantee, where the claim against the principal is in respect of a debt or a liquidated demand only; or
on trust; or
(ii) in suits for the recovery of immovable property, with or without claim for rent or mesne profits, by a landlord against a tenant whose term has expired or has been duly determined by notice to quit, or has become liable to forfeiture for non- payment of rent, or against persons claiming under such tenant;
(g) procedure by way of originating summons;
(h) consolidation of suits, appeals and other proceedings;
(i) delegation to any Registrar, Prothonotary or Master or other official of the Court of any judicial, quasi-judicial and non-judicial duties; and
(j) all forms, registers, books, entries and accounts which may be necessary or desirable for the transaction of the business of Civil Courts."""
    },
    {
        "num": "129",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Power of High Court to make rules as to their original Civil Procedure",
        "text": """129. Power of High Court to make rules as to their original Civil Procedure? Notwithstanding anything in this Code, any High Court not being the Court of a Judicial Commissioner may make such rules not inconsistent with the Letters Patent or order or other law establishing it to regulate its own procedure in the exercise of its original civil jurisdiction as it shall think fit, and nothing herein contained shall affect the validity of any such rules in force at the commencement of this Code."""
    },
    {
        "num": "130",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Powers of other High Court to make rules as to matters other than procedure",
        "text": """130. Powers of other High Court to make rules as to matters other than procedure? A High Court not being a High Court to which section 129 applies may, with the previous approval of the State Government make with respect to any matter other than procedure any rule which a High Court for a State might under article 227 of the Constitution make with respect to any such matter for any part of the territories under its jurisdiction which is not included within the limits of a presidency town."""
    },
    {
        "num": "131",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "RULES",
        "title": "Publication of rules",
        "text": """131. Publication of rules? Rules made in accordance with section 129 or section 130 shall be published in the Official Gazette and shall from the date of publication or from such other date as may be specified have the force of law."""
    },

    # PART XI-MISCELLANEOUS (Chapter 12)
    {
        "num": "132",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Exemption of certain women from personal appearance",
        "text": """132. Exemption of certain women from personal appearance? (1)Women who, according to the customs and manners of the country, ought not to be compelled to appear in public shall be exempt from personal appearance in Court.
(2) Nothing herein contained shall be deemed to exempt such women from arrest in execution of civil process in any case in which the arrest of women is not prohibited by this Code."""
    },
    {
        "num": "133",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Exemption of other persons",
        "text": """133. Exemption of other persons? (1)The following persons shall be entitled to exemption from personal appearance in Court, namely?
(i) the President of India;
(ii) the Vice-President of India;
(iii) the Speaker of the House of the People;
(iv) the Ministers of the Union;
(v) the Judges of the Supreme Court;
(vi) the Governors of States and the administrators of Union Territories;
(vii) the Speakers of the State Legislative Assemblies;
(viii) the Chairman of the State Legislative Councils;
(ix) the Ministers of States;
(x) the Judges of the High Courts; and
(xi) the persons to whom section 87B applies.
[98]***
(3) Where any person claims the privilege of such exemption, and it is consequently necessary to examine him by commission, he shall pay the costs of that commission, unless the party requiring his evidence pays such costs."""
    },
    {
        "num": "134",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Arrest other than in execution of decree",
        "text": """134. Arrest other than in execution of decree? The provisions of sections 55, 57 and 59 shall apply, so far as may be, to all persons arrested under this Code."""
    },
    {
        "num": "135",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Exemption from arrest under civil process",
        "text": """135. Exemption from arrest under civil process? (1) No Judge, Magistrate or other judicial officer shall be liable to arrest under civil process while going to, presiding in, or returning from his Court.
(2) Where any matter is pending before a tribunal having jurisdiction therein, or believing in good faith that it has such jurisdiction, the parties thereto, their pleader, mukhtars, revenue-agents and recognized agents, and their witnesses acting in obedience to a summons, shall be exempt from arrest under civil process other than process issued by such tribunal for contempt of Court while going to or attending such tribunal for the purpose of such matter, and while returning from such tribunal.
(3) Nothing in sub-section (2) shall enable a judgment-debtor to claim exemption from arrest under an order for immediate execution or where such judgment-debtor attends to show cause why he should not be committed to person in execution of a decree."""
    },
    {
        "num": "135A",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Exemption of members of legislative bodies from arrest and detention under civil process",
        "text": """135A. Exemption of members of legislative bodies from arrest and detention under civil process?
[99][(1) No person shall be liable to arrest or detention in prison under civil process?
(a) if he is a member of?
(i) either House of Parliament, or
(ii) the legislative Assembly or Legislative Council of a State, or
(iii) a Legislative Assembly of a Union territory,
during the continuance of any meeting of such House of Parliament or, as the case may be, of the Legislative Assembly or the Legislative Council;
(b) if he is a member of any committee of?
(i) either House of Parliament, or
(ii) the Legislative Assembly of a State or Union territory, or
(iii) the Legislative council of a State,
during the continuance of any meeting of such committee;
(c) if he is a member of?
(i) either House of Parliament, or
(ii) a Legislative Assembly or Legislative Council of a State having both such Houses,
during the continuance of a joint sitting, meeting, conference or joint committee of the Houses of Parliament or Houses of the State Legislature, as the case may be,
and during the forty days before and after such meeting, sitting or conference.]
(2) A person released from detention under sub-section (1), shall, subject the provisions, of the said sub-section,be liable to re-arrest and to the further detention to which he would have been liable if he had not been released under the provisions of sub-section (1)."""
    },
    {
        "num": "136",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Procedure where person to be arrested or property to be attached is outside district",
        "text": """136. Procedure where person to be arrested or property to be attached is outside district? (1) Where an application is made that any person shall be arrested or that any property shall be attached under any provision of this Code not relating to the execution of decrees, and such person resides or such property is situate outside the local limits of the jurisdiction of the Court to which the application is made, the Court may, in its discretion, issue a warrant of arrest or make an order of attachment, and send to the District Court within the local limits of whose jurisdiction such person or property reside or is situate a copy of the warrant or order, together with the probable amount of the costs of the arrest or attachment.
(2) The District Court shall, on receipt of such copy and amount, cause the arrest or attachment to be made by its own officers, or by a Court subordinate to itself, and shall inform the Court which issued or made such warrant or order of the arrest or attachment.
(3) The Court making an arrest under this section shall send the person arrested to the Court by which the warrant of arrest was issued, unless he shows cause to the satisfaction of the former Court why he should not be sent to the later Court, or unless he furnishes sufficient security for his appearance before the later Court or for satisfying any decree that may be passed against him by that Court, in either of which cases the Court making the arrest shall release him.
(4) Where a person to be arrested or movable property to be attached under this section is within th local limits of the ordinary original civil jurisdiction of the High Court of Judicature at Fort William in Bengal or at Madras or at Bombay, the copy of the warrant of arrest or of the order of attachment, and the probable amount of the costs of the arrest or attachment, shall be sent to the Court of Small Causes of Calcutta, Madras or Bombay as the case may be, and that Court, on receipt of the copy and amount, shall proceed as if it were the District Court."""
    },
    {
        "num": "137",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Language of subordinate Courts",
        "text": """137. Language of subordinate Courts? (1) The language which, on the commencement of this Code, is the language of any Court subordinate to a High Court shall continue to be the language of such subordinate Court until the State Government otherwise directs.
(2) The State Government may declare what shall be the language of any such Court and in what character applications to and proceedings in such Court shall be written.
(3) Where this Court requires or allows anything other than the recording of evidence to be done in writing in any such Court, such writing may be in English; but if any party or his pleader is unacquainted with English a tanslation into the language of the Court shall, at his request, be supplied to him; and the Court shall make such order as it thinks fit in respect of the payment of the costs of such translation.

STATE AMENDMENTS
Rajasthan? For sub-section (3) of section 137 substitute the following:
"(3) Wherever the code requires or allows anything other than the recording of evidence to be done in writing in any such court, such writing shall be in Hindi in Devnagri Script with the international from of Indian numerals.
Provided that the court may in its decretion accept such writing in England on the undertaking of the party filing such writing, to file a Hindi translation of the same, within such time as may be granted by the Court and the opposite party shall have a copy of such writing in Hindi."
[Raj. Act No. 7 of 1983].
Uttar Pradesh? To section 137 (3) insert the following proviso:
"Provided that with effect from such date as the State Government in consultation with the High Court may by notification in the Gazette appoint, the language of every judgment, decree or order passed on made by such courts or classes of courts subordinate to the High Court and in such classes of cases as may be specified shall only be Hindi in Devnagri Script with the international form of Indian numerals".
(U.P. Act No. 17 of 1970)."""
    },
    {
        "num": "138",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Power of High Court to require evidence to be recorded in English",
        "text": """138. Power of High Court to require evidence to be recorded in English? (1) The High Court may, by notification in the Official Gazette, direct with respect to any Judge specified in the notification, or falling under a description set forth therein, that evidence in cases in which an appeal is allowed shall be taken down by him in the English language and in manner prescribed.
(2) Where a Judge is prevented by any sufficient reason from complying with a direction under sub-section (1), he shall record the reason and cause the evidence to be taken down in writing from his dictation in open Court.

STATE AMENDMENTS
Assam, Nagaland, Meghalaya, Tripura and Manipur? For section 138, substitute the following section:?
"138. Power of High Court to require evidence to be record in English.? The High Court may, by notification, in the Official Gazette, direct with respect to any Judge specified in the notification, or falling under a description set forth therein that in cases in which an appeal is allowed, he shall take down, or cause to be taken down, the evidence in the English language and in the form and manner prescribed."
[Assam Act 2 of 1941, State of Nagaland Act 27 of 1962]."""
    },
    {
        "num": "139",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Oath on affidavit by whom to be administered",
        "text": """139. Oath on affidavit by whom to be administered? In the case of any affidavit under this Code?
(a) any Court or Magistrate, or
[100] [(aa) any notary appointed under the Notaries Act, 1952 (53 of 1952); or]
(b) any officer or other person whom a High Court may appoint in this behalf, or
(c) any officer appointed by any other Court which the State Government has generally or specially empowered in this behalf,
may administer the oath to the deponent.

STATE AMENDMENTS
Uttar Pradesh? (i) for clause (b) of section 139 substitute:
"(b) any person appointed in this behalf by a High Court or by a district court; or"
(ii) for clause (c) of section 139 substitute:
"(c) any person appointed in this behalf by such other court as the State Govt. may, by general or special order, empower in this behalf."
[U.P. Act No. 11 of 1981]."""
    },
    {
        "num": "140",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Assessors in causes of salvage etc.",
        "text": """140. Assessors in causes of salvage etc.? (1) In any admiralty or vice-admiralty cause of salvage, towage or collision, the Court, whether it be exercising its original or its appellate jurisdiction may, if it thinks fit, and shall upon request of either party to such cause, summon to its assistance, in such manner as it may direct or as may be prescribed , two competent assessors; and such assessors shall attend and assist accordingly.
(2) Every such assessor shall receive such fees for his attendance, to be paid by such of the parties as the Court may direct or as may be prescribed."""
    },
    {
        "num": "141",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Miscellaneous proceedings",
        "text": """141. Miscellaneous proceedings? The procedure provided in this Code in regard to suit shall be followed, as far as it can be made applicable, in all proceedings in any Court of civil jurisdiction.
[101][Explanation.?In this section, the expression "proceedings" includes proceedings under Order IX, but does not include any proceeding under article 226 of the Constitution.]"""
    },
    {
        "num": "142",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Orders and notices to be in writing",
        "text": """142. Orders and notices to be in writing? All orders and notices served on or given to any person under the provisions of this Code shall be in writing."""
    },
    {
        "num": "143",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Postage",
        "text": """143. Postage? Postage, where chargeable on a notice, summons or letter issued under this Code and forwarded by post, and the fee for registering the same, shall be paid within a time to be fixed before the communications made :
Provided that the State Government may remit such postage, or fee, or both, or may prescribe a scale of court-fees to be levied in lieu thereof."""
    },
    {
        "num": "144",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Application for restitution",
        "text": """144. Application for restitution? (1) Where and in so far as a decree or an order is [102][varied or reversed in any appeal, revision or other proceedings or is set aside or modified in any suit instituted for the purpose the Court which passed the decree or order] shall, on the application of any party entitled to any benefit by way of restitution or otherwise, cause such restitution to be made as will, so far as may be, place the parties in the position which they would have occupied but for such decree or order or [103][such part thereof as has been varied, reversed, set aside or modified], and, for this purpose, the Court may make any orders, including orders for the refund of costs and for the payment of interest, damages, compensation and mesne profits, which are properly [104][consequential on such variation, reversal, setting aside or modification of the decree or order.]
[105] [Explanation.?For the purposes of sub-section (1) the expression "Court which passed the decree or order" shall be deemed to include,?
(a) where the decree or order has been varied or reversed in exercise of appellate or revisional jurisdiction, the Court of first instance;
(b) where the decree or order has been set aside by a separate suit, the Court of first instance which passed such decree or order;
(c) where the Court of first instance has ceased to exist or has ceased to have jurisdiction to execute, it, the Court which, if the suit wherein the decree or order was passed were instituted at the time of making the application for restitution under this section, would have jurisdiction to try such suit.]
(2) No suit shall be instituted for the purpose of obtaining any restitution or other relief which could be obtained by application under sub-section (1).

STATE AMENDMENTS
Uttar Pradesh? Substitute the following for sub-section (1) of section 144 of the Code:
"(1) Where and in so far as a decree or an order is varied or reversed in appeal, revision or otherwise, the Court of first instance shall, on the application of any party entitled to any benefit by way of restitution or otherwise, cause such restitution to be made, as will, so for as may be, place the parties in the position which they would have occupied but for such decree or order or such part there of as has been varied or reversed; and for this purpose, the Court may make any orders, including orders for the refused of costs and for the payment of interest, damages, compensation and mesne profits, which are properly consequential on such variation or reversal".
[U.P. Act No. 24 of 1954]."""
    },
    {
        "num": "145",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Enforcement of liability of surety",
        "text": """145. Enforcement of liability of surety? Where any person [106][has furnished security or given a guarantee]?
(a) for the performance of any decree or any part thereof, or
(b) for the restitution of any property taken in execution of a decree, or
(c) for the payment of any money, or for the fulfilment of any condition imposed on any person, under an order of the Court in any suit or in any proceeding consequent thereon,
[107][the decree or order may be executed in the manner therein provided for the execution of decree, namely :?
(i) if he has rendered himself personally liable, against him to that extent;
(ii) if he has furnished any property as security, by sale of such property to the extent of the security;
(iii) if the case falls both under clauses (i) and (ii) then to the extent specified in those clauses, and such person shall, be deemed to be a party within the meaning of section 47 :]
Provided that such notice as the Court in each case thinks sufficient has been given to the surety.

STATE AMENDMENTS
Uttar Pradesh? Substitute the following for section 145;
"145. Where any person has become liable as surety or given any property as security:
(a) for the performance of any decree or any part there of, or
(b) for the restitution of any property taken in execution of any decree, or
(c) for the payment of any money or for the fulfilment of any condition imposed on any person, under an order of the Court in any suit or in any proceeding Consequent there on,? the decree or order may be executed in the manner herein provided for the execution of decrees:?
(i) if he has rendered himself personally liable, against him to that extent; and
(ii) if he has given any property as security, by sale of such property to the extent of the security;
such person shall, for the purposes of appeal, be deemed to be a party within the meaning of section 47:
Provided that such notice as the Court in each case thinks sufficient has been given to the surety.
Explanation:? For the purposes of this section a person entrusted by a Court with custody of any property attached in execution of any decree or order shall be deemed to have become liable as surety for the restitution of such property within the meaning of clause (b)."
[U.P. Act No. 24 of 1954]."""
    },
    {
        "num": "146",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Proceedings by or against representatives",
        "text": """146. Proceedings by or against representatives? Save as otherwise provided by this Code or by any law for the time being in force, where any proceeding may be taken or application made by or against any person then the proceeding may be taken or the application may be made by or against any person claiming under him."""
    },
    {
        "num": "147",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Consent or agreement by persons under disability",
        "text": """147. Consent or agreement by persons under disability? In all suits to which any person under disability is a party, any consent or agreement, as to any proceeding shall, if given or made with the express leave of the Court by the next friend or guardian for the suit, have the same force and effect as if such person, were under no disability and had given such consent or made such agreement."""
    },
    {
        "num": "148",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Enlargement of time",
        "text": """148. Enlargement of time? Where any period is fixed or granted by the Court for the doing of any act prescribed or allowed by this Code, the Court may, in its discretion, from time to time, enlarge such period, even though the period originally fixed or granted may gave expired."""
    },
    {
        "num": "148A",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Right to lodge a caveat",
        "text": """[108][148A. Right to lodge a caveat? (1) Where an application is expected to be made, or has been made, in a suit or proceedings instituted, or about to be instituted, in a Court, any person claiming a right to appear before the Court on the hearing of such application may lodge a caveat in respect thereof.
(2) Where a caveat has been lodged under sub-section (1), the person by whom the caveat has been lodged (hereinafter referred to as the caveator) shall serve a notice of the caveat by registered post, acknowledgement due, on the person by whom the application has been or is expected to be, made, under sub-section (1).
(3) Where, after a caveat has been lodged under sub-section (1), any application is filed in any suit or proceeding, the Court, shall serve a notice of the application on the caveator.
(4) Where a notice of any caveat has been served on the applicant, he shall forthwith furnish the caveator at the caveator's expense, with a copy of the application made by him and also with copies of any paper or document which has been, or may be, filed by him in support of the application.
(5) Where a caveat has been lodged under sub-section (1), such caveat shall not reman in force after the expiry of ninety days from the date on which it was lodged unless the application referred to in sub-section (1) has been made before the expiry of the said period.]"""
    },
    {
        "num": "149",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Power to make up deficiency of court-fees",
        "text": """149. Power to make up deficiency of court-fees? Where the whole or any part of any fee prescribed for any document by the law for the time being in force relating to court-fees has not been paid, the Court may, in its discretion, at any stage, allow the person, by whom such fee is payable, to pay the whole or part, as the case may be, of such court-fee; and upon such payment the document, in respect of which such fee is payable, shall have the same force and effect as if such fee had been paid in the first instance."""
    },
    {
        "num": "150",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Transfer of business",
        "text": """150. Transfer of business? Save as otherwise provide, where the business of any Court is transferred to any other Court, the Court to which the business is so transferred shall have the same powers and shall perform the same duties as those respectively conferred and imposed by or under this Code upon the Court from which the business was so transferred."""
    },
    {
        "num": "151",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Saving of inherent powers of Court",
        "text": """151. Saving of inherent powers of Court? Nothing in this Code shall be deemed to limit or otherwise affect the inherent power of the Court to make such orders as may be necessary for the ends of justice or to prevent abuse of the process of the Court."""
    },
    {
        "num": "152",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Amendment of judgments, decrees or orders",
        "text": """152. Amendment of judgments, decrees or orders? Clerical or arithmetical mistakes in judgments, decrees or orders or errors arising therein from any accidental slip or omission may at any time be corrected by the Court either of its own motion or on the application of any of the parties."""
    },
    {
        "num": "153",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "General power to amend",
        "text": """153. General power to amend? The Court may at any time and on such terms as to costs or otherwise as it may think fit, amend any defect or error in any proceeding in a suit, and all necessary amendments shall be made of the purpose of determining the real question or issue raised by or depending on such proceeding."""
    },
    {
        "num": "153A",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Power to amend decree or order where appeal is summarily dismissed",
        "text": """[109][153A. Power to amend decree or order where appeal is summarily dismissed.? Where an Appellate Court dismisses an appeal under rule 11 of Order XLI, the power of the Court to amend, under section 152, the decree or order appealed against may be exercised by the Court which had passed the decree or order in the first instance, notwithstanding that the dismissal of the appeal has the effect of confirming the decree or order, as the case may be, passed by the Court of first instance."""
    },
    {
        "num": "153B",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Place of trial to be deemed to be open Court",
        "text": """153B. Place of trial to be deemed to be open Court? The place in which any Civil Court is held for the purpose of trying any suit shall be deemed to be an open Court, to which the public generally may have access so far as the same can conveniently contain them :
Provided that the presiding Judge may, if he thinks fit, order at any stage of any inquiry into or trial of any particular case, that the public generally or any particular person, shall not have access to, or be or remain in, the room or building used by Court.]"""
    },
    {
        "num": "154",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Saving of present right of appeal",
        "text": """154. [Saving of present right of appeal]? Rep. by the Repealing and Amending Act, 1952 (48 of 1952), s. 2 and Sch. I."""
    },
    {
        "num": "155",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Amendment of certain Acts",
        "text": """155. [Amendment of certain Acts]? Rep. by the Repealing and Amending Act, 1952 (48 of 1952), s. 2 and Sch. I."""
    },
    {
        "num": "156",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Repeals",
        "text": """156. [Repeals]? Rep. by the Second Repealing and Amending Act, 1914 (17 of 1914), s. 3 and Sch. II."""
    },
    {
        "num": "157",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Continuance of orders under repealed enactments",
        "text": """157. Continuance of orders under repealed enactments.? Notifications published, declarations and rules made, places appointed, agreements filed, scales prescribed, forms framed, appointments made and powers conferred under Act 8 of 1859 or under any Code of Civil Procedure or any Act amending the same or under any other enactment hereby repealed shall, so far as they are consistent with this Code, have the same force and effect is if they had been respectively published, made, appointed, filed, prescribed, framed and conferred under this Code and by the authority empowered thereby in such behalf."""
    },
    {
        "num": "158",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "MISCELLANEOUS",
        "title": "Reference to Code of Civil Procedure and other repealed enactments",
        "text": """158. Reference to Code of Civil Procedure and other repealed enactments.? In every enactment or notification passed or issued before the commencement of this Code in which reference is made to or to any Charter or section of Act 8 of 1859 or any Code of Civil Procedure or any Act amending the same or any other enactment hereby repealed, such reference shall, so far as may be practicable, be taken to be made to this Code or to its corresponding Part, Order, section or rule."""
    }
]

sections_data = []

for item in raw_sections:
    sec_num = item["num"]
    section_name = f"Section {sec_num}"
    title = item["title"].strip()
    chapter_no = item["chapterNo"]
    chapter_roman = item["chapterRoman"]
    chapter_name = item["chapterName"]
    description = item["text"].strip()
    
    meta_data = f"Part {chapter_roman} {chapter_name}" if chapter_no > 1 else f"PRELIMINARY"
    meta_desc = f"{ACT_TITLE} Section {sec_num} - {title}"
    meta_title = f"Section {sec_num} - {ACT_TITLE}"
    
    sections_data.append({
        "section": section_name,
        "sectionNo": sec_num,
        "chapterNo": chapter_no,
        "chapterRoman": chapter_roman,
        "chapterName": chapter_name,
        "title": title,
        "description": description,
        "metaData": meta_data,
        "metaDescription": meta_desc,
        "metaTitle": meta_title
    })

print(f"Total sections processed: {len(sections_data)}")

with open("/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/cpcBearerActData.json", "w", encoding="utf-8") as f:
    json.dump(sections_data, f, indent=2, ensure_ascii=False)

with open("/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma/cpcBearerActData.js", "w", encoding="utf-8") as f:
    f.write("export const cpcBearerActSections = ")
    json.dump(sections_data, f, indent=2, ensure_ascii=False)
    f.write(";\n")

print("Generated prisma/cpcBearerActData.json and prisma/cpcBearerActData.js successfully.")
