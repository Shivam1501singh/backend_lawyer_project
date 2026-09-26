import json

# Part 1: Chapters I to II (Sections 1 to 20)

sections = []

def add_sec(no, ch_no, ch_rom, ch_name, title, desc):
    sections.append({
        "section": f"Section {no}",
        "sectionNo": str(no),
        "chapterNo": ch_no,
        "chapterRoman": ch_rom,
        "chapterName": ch_name,
        "title": title,
        "description": desc.strip(),
        "metaData": f"Chapter {ch_rom} {ch_name}",
        "metaDescription": f"THE INDIAN EVIDENCE ACT, 1872 Section {no} - {title}",
        "metaTitle": f"Section {no} - THE INDIAN EVIDENCE ACT, 1872"
    })

# CHAPTER I – PRELIMINARY
add_sec("1", 1, "I", "PRELIMINARY", "Short title, Extent, Commencement of Act",
"""This Act may be called the Indian Evidence Act, 1872.

Extent.––It extends to the whole of India and applies to all judicial proceedings in or before any Court, including Courts-martial, [other than Courts-martial convened under the Army Act (44 & 45 Vict., c. 58)] [the Naval Discipline Act [29 & 30 Vict., 109]; or the Indian Navy (Discipline) Act, 1934 (34 of 1934),] [or the Air Force Act (7 Geo. 5, c. 51)] but not to affidavits presented to any Court or officer, nor to proceedings before an arbitrator;

Commencement of Act.––And it shall come into force on the first day of September, 1872.""")

add_sec("2", 1, "I", "PRELIMINARY", "Repeal of enactments",
"""[Repeal of enactments.].––Rep. by the Repealing Act, 1938 (1 of 1938), s. 2 and Schedule.""")

add_sec("3", 1, "I", "PRELIMINARY", "Interpretation-clause",
"""In this Act the following words and expressions are used in the following senses, unless a contrary intention appears from the context: ––

“Court”.––“Court” includes all Judges and Magistrates, and all persons, except arbitrators, legally authorised to take evidence.

“Fact”.––“Fact” means and includes––(1) anything, state of things, or relation of things, capable of being perceived by the senses;
(2) any mental condition of which any person is conscious.

Illustrations
(a) That there are certain objects arranged in a certain order in a certain place, is a fact.
(b) That a man heard or saw something, is a fact.
(c) That a man said certain words, is a fact.
(d) That a man holds a certain opinion, has a certain intention, acts in good faith or fraudulently, or uses a particular word in a particular sense, or is or was at a specified time conscious of a particular sensation, is a fact.
(e) That a man has a certain reputation, is a fact.

“Relevant”. –– One fact is said to be relevant to another when the one is connected with the other in any of the ways referred to in the provisions of this Act relating to the relevancy of facts.

“Facts in issue”.–– The expression “facts in issue” means and includes––
any fact from which, either by itself or in connection with other facts, the existence, non-existence, nature or extent of any right, liability, or disability, asserted or denied in any suit or proceeding, necessarily follows.

Explanation.––Whenever, under the provisions of the law for the time being in force relating to Civil Procedure, any Court records an issue of fact, the fact to be asserted or denied in the answer to such issue is a fact in issue.

Illustrations
A is accused of the murder of B.
At his trial the following facts may be in issue:––
That A caused B’s death;
That A intended to cause B’s death;
That A had received grave and sudden provocation from B;
That A, at the time of doing the act which caused B’s death, was, by reason of unsoundness of mind, incapable of knowing its nature.

“Document”. ––“Document” means any matter expressed or described upon any substance by means of letters, figures or marks, or by more than one of those means, intended to be used, or which may be used, for the purpose of recording that matter.

Illustrations
A writing is a document;
Words printed lithographed or photographed are documents;
A map or plan is a document;
An inscription on a metal plate or stone is a document;
A caricature is a document.

“Evidence”. ––“Evidence” means and includes ––
(1) all statements which the Court permits or requires to be made before it by witnesses, in relation to matters of fact under inquiry;
such statements are called oral evidence;
(2) all documents including electronic records produced for the inspection of the Court;
such documents are called documentary evidence.

“Proved”.––A fact is said to be proved when, after considering the matters before it, the Court either believes it to exist, or considers its existence so probable that a prudent man ought, under the circumstances of the particular case, to act upon the supposition that it exists.

“Disproved”.––A fact is said to be disproved when, after considering the matters before it, the Court either believes that it does not exist, or considers its non-existence so probable that a prudent man ought, under the circumstances of the particular case, to act upon the supposition that it does not exist.

“Not proved”. –– A fact is said not to be proved when it is neither proved nor disproved.

“India”. –– “India” means the territory of India excluding the State of Jammu and Kashmir.

the expressions “Certifying Authority”, “electronic signature”, “Electronic Signature Certificate”, “electronic form”, “electronic records”, “information”, “secure electronic record”, “secure digital signature” and “subscriber” shall have the meanings respectively assigned to them in the Information Technology Act, 2000 (21 of 2000).""")

add_sec("4", 1, "I", "PRELIMINARY", "“May Presume”, “Shall presume”, “Conclusive proof”",
"""“May presume”.––Whenever it is provided by this Act that the Court may presume a fact, it may either regard such fact as proved, unless and until it is disproved, or may call for proof of it.

“Shall presume”.––Whenever it is directed by this Act that the Court shall presume a fact, it shall regard such fact as proved, unless and until it is disproved.

“Conclusive proof”.––When one fact is declared by this Act to be conclusive proof of another, the Court shall, on proof of the one fact, regard the other as proved, and shall not allow evidence to be given for the purpose of disproving it.""")

# CHAPTER II – OF THE RELEVANCY OF FACTS
add_sec("5", 2, "II", "OF THE RELEVANCY OF FACTS", "Evidence may be given of facts in issue and relevant facts",
"""Evidence may be given in any suit or proceeding of the existence of non-existence of every fact in issue and of such other facts as are hereinafter declared to be relevant, and of no others.

Explanation.––This section shall not enable any person to give evidence of a fact which he is disentitled to prove by any provision of the law for the time being in force relating to Civil Procedure.

Illustrations
(a) A is tried for the murder of B by beating him with a club with the intention of causing his death.
At A’s trial the following facts are in issue:––
A’s beating B with the club;
A’s causing B’s death by such beating;
A’s intention to cause B’s death.
(b) A suitor does not bring with him, and have in readiness for production at the first hearing of the case, a bond on which he relies. This section does not enable him to produce the bond or prove its contents at a subsequent stage of the proceedings, otherwise than in accordance with the conditions prescribed by the Code of Civil Procedure.""")

add_sec("6", 2, "II", "OF THE RELEVANCY OF FACTS", "Relevancy of facts forming part of same transaction",
"""Facts which, though not in issue, are so connected with a fact in issue as to form part of the same transaction, are relevant, whether they occurred at the same time and place or at different times and places.

Illustrations
(a) A is accused of the murder of B by beating him. Whatever was said or done by A or B or the by-standers at the beating, or so shortly before or after it as to form part of the transaction, is a relevant fact.
(b) A is accused of waging war against the Government of India by taking part in an armed insurrection in which property is destroyed, troops are attacked and gaols are broken open. The occurrence of these facts is relevant, as forming part of the general transaction, though A may not have been present at all of them.
(c) A sues B for a libel contained in a letter forming part of a correspondence. Letters between the parties relating to the subject out of which the libel arose, and forming part of the correspondence in which it is contained, are relevant facts, though they do not contain the libel itself.
(d) The question is, whether certain goods ordered from B were delivered to A. The goods were delivered to several intermediate persons successively. Each delivery is a relevant fact.""")

add_sec("7", 2, "II", "OF THE RELEVANCY OF FACTS", "Facts which are the occasion, cause or effect of facts in issue",
"""Facts which are the occasion, cause or effect, immediate or otherwise, of relevant facts, or facts in issue, or which constitute the state of things under which they happened, or which afforded an opportunity for their occurrence or transaction, are relevant.

Illustrations
(a) The question is, whether A robbed B.
The facts that, shortly before the robbery, B went to a fair with money in his possession, and that he showed it, or mentioned the fact that he had it, to third persons, are relevant.
(b) The question is, whether A murdered B.
Marks on the ground, produced by a struggle at or near the place where the murder was committed, are relevant facts.
(c) The question is, whether A poisoned B.
The state of B’s health before the symptoms ascribed to poison, and habits of B, known to A, which afforded an opportunity for the administration of poison, are relevant facts.""")

add_sec("8", 2, "II", "OF THE RELEVANCY OF FACTS", "Motive, preparation and previous or subsequent conduct",
"""Any fact is relevant which shows or constitutes a motive or preparation for any fact in issue or relevant fact.

The conduct of any party, or of any agent to any party, to any suit or proceeding, in reference to such suit or proceeding, or in reference to any fact in issue therein or relevant thereto, and the conduct of any person an offence against whom is the subject of any proceeding, is relevant, if such conduct influences or is influenced by any fact in issue or relevant fact, and whether it was previous or subsequent thereto.

Explanation 1.––The word “conduct” in this section does not include statements, unless those statements accompany and explain acts other than statements; but this explanation is not to affect the relevancy of statements under any other section of this Act.

Explanation 2.––When the conduct of any person is relevant, any statement made to him or in his presence and hearing, which affects such conduct, is relevant.

Illustrations
(a) A is tried for the murder of B.
The facts that A murdered C, that B knew that A had murdered C, and that B had tried to extort money from A by threatening to make his knowledge public, are relevant.
(b) A sues B upon a bond for the payment of money, B denies the making of the bond.
The fact that, at the time when the bond was alleged to be made, B required money for a particular purpose, is relevant.
(c) A is tried for the murder of B by poison.
The fact that, before the death of B, A procured poison similar to that which was administered to B, is relevant.
(d) The question is, whether a certain document is the will of A.
The facts that, not long before, the date of the alleged will, A made inquiry into matters to which the provisions of the alleged will relate; that he consulted vakils in reference to making the will, and that he caused drafts of other wills to be prepared, of which he did not approve, are relevant.
(e) A is accused of a crime.
The facts that, either before, or at the time of, or after the alleged crime, A provided evidence which would tend to give to the facts of the case an appearance favourable to himself, or that he destroyed or concealed evidence, or prevented the presence or procured the absence of persons who might have been witnesses, or suborned persons to give false evidence respecting it, are relevant.
(f) The question is, whether A robbed B.
The facts that, after B was robbed, C said in A’s presence –– “the police are coming to look for the man who robbed B,” and that immediately afterwards A ran away, are relevant.
(g) The question is, whether A owes B rupees 10,000.
The facts that A asked C to lend him money, and that D said to C in A’s presence and hearing–– “I advise you not to trust A, for he owes B 10,000 rupees,” and that A went away without making any answer, are relevant facts.
(h) The question is, whether A committed a crime.
The fact that A absconded, after receiving a letter, warning him that inquiry was being made for the criminal, and the contents of the letter, are relevant.
(i) A is accused of a crime.
The facts that, after the commission of the alleged crime, he absconded, or was in possession of property or the proceeds of property acquired by the crime, or attempted to conceal things which were or might have been used in committing it, are relevant.
(j) The question is, whether A was ravished.
The facts that, shortly after the alleged rape, she made a complaint relating to the crime, the circumstances under which, and the terms in which, the complaint was made, are relevant.
The fact that, without making a complaint, she said that she had been ravished is not relevant as conduct under this section, though it may be relevant as a dying declaration under section 32, clause (1), or as corroborative evidence under section 157.
(k) The question is, whether A was robbed.
The fact that, soon after the alleged robbery, he made a complaint relating to the offence, the circumstances under which, and the terms in which, the complaint was made, are relevant.
The fact that he said he had been robbed, without making any complaint, is not relevant, as conduct under this section, though it may be relevant as a dying declaration under section 32, clause (1), or as corroborative evidence under section 157.""")

add_sec("9", 2, "II", "OF THE RELEVANCY OF FACTS", "Facts necessary to explain or introduce relevant facts",
"""Facts necessary to explain or introduce a fact in issue or relevant fact, or which support or rebut an inference suggested by a fact in issue or relevant fact, or which establish the identity of any thing or person whose identity is relevant, or fix the time or place at which any fact in issue or relevant fact happened, or which show the relation of parties by whom any such fact was transacted, are relevant in so far as they are necessary for that purpose.

Illustrations
(a) The question is, whether a given document is the will of A.
The state of A’s property and of his family at the date of the alleged will may be relevant facts.
(b) A sues B for a libel imputing disgraceful conduct to A; B affirms that the matter alleged to be libellous is true.
The position and relations of the parties at the time when the libel was published may be relevant facts as introductory to the facts in issue.
The particulars of a dispute between A and B about a matter unconnected with the alleged libel are irrelevant, though the fact that there was a dispute may be relevant if it affected the relations between A and B.
(c) A is accused of a crime.
The fact that, soon after the commission of the crime, A absconded from his house, is relevant under section 8, as conduct subsequent to and affected by facts in issue.
The fact that, at the time when he left home, he had sudden and urgent business at the place to which he went, is relevant, as tending to explain the fact that he left home suddenly.
The details of the business on which he left are not relevant, except in so far as they are necessary to show that the business was sudden and urgent.
(d) A sues B for inducing C to break a contract of service made by him with A. C, on leaving A’s service, says to A –– “I am leaving you because B has made me a better offer.” This statement is a relevant fact as explanatory of C’s conduct, which is relevant as a fact in issue.
(e) A, accused of theft, is seen to give the stolen property to B, who is seen to give it to A’s wife. B says as he delivers it––“A says you are to hide this.” B’s statement is relevant as explanatory of a fact which is part of the transaction.
(f) A is tried for a riot and is proved to have marched at the head of a mob. The cries of the mob are relevant as explanatory of the nature of the transaction.""")

add_sec("10", 2, "II", "OF THE RELEVANCY OF FACTS", "Things said or done by conspirator in reference to common design",
"""Where there is reasonable ground to believe that two or more persons have conspired together to commit an offence or an actionable wrong, anything said, done or written by any one of such persons in reference to their common intention, after the time when such intention was first entertained by any one of them, is a relevant fact as against each of the persons believed to be so conspiring, as well for the purpose of proving the existence of the conspiracy as for the purpose of showing that any such person was a party to it.

Illustrations
Reasonable ground exists for believing that A has joined in a conspiracy to wage war against the Government of India.
The facts that B procured arms in Europe for the purpose of the conspiracy, C collected money in Calcutta for a like object, D persuaded persons to join the conspiracy in Bombay, E published writings advocating the object in view at Agra, and F transmitted from Delhi to G at Kabul the money which C had collected at Calcutta, and the contents of a letter written by H giving an account of the conspiracy, are each relevant, both to prove the existence of the conspiracy, and to prove A’s complicity in it, although he may have been ignorant of all of them, and although the persons by whom they were done were strangers to him, and although they may have taken place before he joined the conspiracy or after he left it.""")

add_sec("11", 2, "II", "OF THE RELEVANCY OF FACTS", "When facts not otherwise relevant become relevant",
"""Facts not otherwise relevant are relevant––
(1) if they are inconsistent with any fact in issue or relevant fact;
(2) if by themselves or in connection with other facts they make the existence or non-existence of any fact in issue or relevant fact highly probable or improbable.

Illustrations
(a) The question is, whether A committed a crime at Calcutta on a certain day.
The fact that, on that day, A was at Lahore is relevant.
The fact that, near the time when the crime was committed, A was at a distance from the place where it was committed, which would render it highly improbable, though not impossible, that he committed it, is relevant.
(b) The question is, whether A committed a crime.
The circumstances are such that the crime must have been committed either by A, B, C or D. Every fact which shows that the crime could have been committed by no one else, and that it was not committed by either B, C or D, is relevant.""")

add_sec("12", 2, "II", "OF THE RELEVANCY OF FACTS", "In suits for damages, facts tending to enable Court to determine amount are relevant",
"""In suits in which damages are claimed, any fact which will enable the Court to determine the amount of damages which ought to be awarded, is relevant.""")

add_sec("13", 2, "II", "OF THE RELEVANCY OF FACTS", "Facts relevant when right or custom is in question",
"""Where the question is as to the existence of any right or custom, the following facts are relevant:––
(a) any transaction by which the right or custom in question was created, claimed, modified, recognised, asserted or denied, or which was inconsistent with its existence;
(b) particular instances in which the right or custom was claimed, recognised or exercised, or in which its exercise was disputed, asserted or departed from.

Illustrations
The question is, whether A has a right to a fishery.
A deed conferring the fishery on A’s ancestors, a mortgage of the fishery by A’s father, a subsequent grant of the fishery by A’s father, irreconcilable with the mortgage, particular instances in which A’s father exercised the right, or in which the exercise of the right was stopped by A’s neighbours, are relevant facts.""")

add_sec("14", 2, "II", "OF THE RELEVANCY OF FACTS", "Facts showing existence of state of mind, or of body, or bodily feeling",
"""Facts showing the existence of any state of mind such as intention, knowledge, good faith, negligence, rashness, ill-will or good-will towards any particular person, or showing the existence of any state of body or bodily feeling, are relevant, when the existence of any such state of mind or body or bodily feeling is in issue or relevant.

Explanation 1.––A fact relevant as showing the existence of a relevant state of mind must show that the state of mind exists, not generally, but in reference to the particular matter in question.

Explanation 2.––But where, upon the trial of a person accused of an offence, the previous commission by the accused of an offence is relevant within the meaning of this section, the previous conviction of such person shall also be a relevant fact.

Illustrations
(a) A is accused of receiving stolen goods knowing them to be stolen. It is proved that he was in possession of a particular stolen article.
The fact that, at the same time, he was in possession of many other stolen articles is relevant, as tending to show that he knew each and all of the articles of which he was in possession to be stolen.
(b) A is accused of fraudulently delivering to another person a counterfeit coin which, at the time when he delivered it, he knew to be counterfeit.
The fact that, at the time of its delivery, A was possessed of a number of other pieces of counterfeit coin is relevant.
The fact that A had been previously convicted of delivering to another person as genuine a counterfeit coin knowing it to be counterfeit is relevant.
(c) A sues B for damage done by a dog of B’s, which B knew to be ferocious.
The fact that the dog had previously bitten X, Y and Z, and that they had made complaints to B, are relevant.
(d) The question is, whether A, the acceptor of a bill of exchange, knew that the name of the payee was fictitious.
The fact that A had accepted other bills drawn in the same manner before they could have been transmitted to him by the payee if the payee had been a real person, is relevant, as showing that A knew that the payee was a fictitious person.
(e) A is accused of defaming B by publishing an imputation intended to harm the reputation of B.
The fact of previous publications by A respecting B, showing ill-will on the part of A towards B is relevant, as proving A’s intention to harm B’s reputation by the particular publication in question.
The facts that there was no previous quarrel between A and B, and that A repeated the matter complained of as he heard it, are relevant, as showing that A did not intend to harm the reputation of B.
(f) A is sued by B for fraudulently representing to B that C was solvent, whereby B, being induced to trust C, who was insolvent, suffered loss.
The fact that, at the time when A represented C to be solvent, C was supposed to be solvent by his neighbours and by persons dealing with him, is relevant, as showing that A made the representation in good faith.
(g) A is sued by B for the price of work done by B, upon a house of which A is owner, by the order of C, a contractor.
A’s defence is that B’s contract was with C.
The fact that A paid C for the work in question is relevant, as proving that A did, in good faith, make over to C the management of the work in question, so that C was in a position to contract with B on C’s own account, and not as agent for A.
(h) A is accused of the dishonest misappropriation of property which he had found, and the question is whether, when he appropriated it, he believed in good faith that the real owner could not be found.
The fact that public notice of the loss of the property had been given in the place where A was, is relevant, as showing that A did not in good faith believe that the real owner of the property could not be found.
The fact that A knew, or had reason to believe, that the notice was given fraudulently by C, who had heard of the loss of the property and wished to set up a false claim to it, is relevant, as showing that the fact that A knew of the notice did not disprove A’s good faith.
(i) A is charged with shooting at B with intent to kill him. In order to show A’s intent the fact of A’s having previously shot at B may be proved.
(j) A is charged with sending threatening letters to B. Threatening letters previously sent by A to B may be proved, as showing the intention of the letters.
(k) The question is, whether A has been guilty of cruelty towards B, his wife.
Expressions of their feeling towards each other shortly before or after the alleged cruelty are relevant facts.
(l) The question is whether A’s death was caused by poison.
Statements made by A during his illness as to his symptoms are relevant facts.
(m) The question is, what was the state of A’s health at the time when an assurance on his life was effected.
Statements made by A as to the state of his health at or near the time in question are relevant facts.
(n) A sues B for negligence in providing him with a carriage for hire not reasonably fit for use, whereby A was injured.
The fact that B’s attention was drawn on other occasions to the defect of that particular carriage is relevant.
The fact that B was habitually negligent about the carriages which he let to hire is irrelevant.
(o) A is tried for the murder of B by intentionally shooting him dead.
The fact that A on other occasions shot at B is relevant as showing his intention to shoot B.
The fact that A was in the habit of shooting at people with intent to murder them is irrelevant.
(p) A is tried for a crime.
The fact that he said something indicating an intention to commit that particular crime is relevant.
The fact that he said something indicating a general disposition to commit crimes of that class is irrelevant.""")

add_sec("15", 2, "II", "OF THE RELEVANCY OF FACTS", "Facts bearing on question whether act was accidental or intentional",
"""When there is a question whether an act was accidental or intentional, [or done with a particular knowledge or intention,] the fact that such act formed part of a series of similar occurrences, in each of which the person doing the act was concerned, is relevant.

Illustrations
(a) A is accused of burning down his house in order to obtain money for which it is insured.
The facts that A lived in several houses successively each of which he insured, in each of which a fire occurred, and after each of which fires A received payment from a different insurance office, are relevant, as tending to show that the fires were not accidental.
(b) A is employed to receive money from the debtors of B. It is A’s duty to make entries in a book showing the amounts received by him. He makes an entry showing that on a particular occasion he received less than he really did receive.
The question is, whether this false entry was accidental or intentional.
The facts that other entries made by A in the same book are false, and that the false entry is in each case in favour of A, are relevant.
(c) A is accused of fraudulently delivering to B a counterfeit rupee.
The question is, whether the delivery of the rupee was accidental.
The facts that, soon before or soon after the delivery to B, A delivered counterfeit rupees to C, D and E are relevant, as showing that the delivery to B was not accidental.""")

add_sec("16", 2, "II", "OF THE RELEVANCY OF FACTS", "Existence of course of business when relevant",
"""When there is a question whether a particular act was done, the existence of any course of business, according to which it naturally would have been done, is a relevant fact.

Illustrations
(a) The question is, whether a particular letter was despatched.
The facts that it was the ordinary course of business for all letters put in a certain place to be carried to the post, and that particular letter was put in that place are relevant.
(b) The question is, whether a particular letter reached A. The facts that it was posted in due course, and was not returned through the Dead Letter Office, are relevant.""")

add_sec("17", 2, "II", "OF THE RELEVANCY OF FACTS", "Admission defined",
"""An admission is a statement, [oral or documentary or contained in electronic form], which suggests any inference as to any fact in issue or relevant fact, and which is made by any of the persons, and under the circumstances, hereinafter mentioned.""")

add_sec("18", 2, "II", "OF THE RELEVANCY OF FACTS", "Admission by party to proceeding or his agent",
"""Statements made by a party to the proceeding, or by an agent to any such party, whom the Court regards, under the circumstances of the case, as expressly or impliedly authorised by him to make them, are admissions.

by suitor in representative character.––Statements made by parties to suits suing or sued in a representative character, are not admissions, unless they were made while the party making them held that character.

Statements made by––
(1) by party interested in subject-matter.––persons who have any proprietary or pecuniary interest in the subject-matter of the proceeding, and who make the statement in their character of persons so interested, or
(2) by person from whom interest derived.––persons from whom the parties to the suit have derived their interest in the subject-matter of the suit,
are admissions, if they are made during the continuance of the interest of the persons making the statements.""")

add_sec("19", 2, "II", "OF THE RELEVANCY OF FACTS", "Admissions by persons whose position must be proved as against party to suit",
"""Statements made by persons whose position or liability, it is necessary to prove as against any party to the suit, are admissions, if such statements would be relevant as against such persons in relation to such position or liability in a suit brought by or against them, and if they are made whilst the person making them occupies such position or is subject to such liability.

Illustration
A undertakes to collect rents for B.
B sues A for not collecting rent due from C to B.
A denies that rent was due from C to B.
A statement by C that he owed B rent is an admission, and is a relevant fact as against A, if A denies that C did owe rent to B.""")

add_sec("20", 2, "II", "OF THE RELEVANCY OF FACTS", "Admissions by persons expressly referred to by party to suit",
"""Statements made by persons to whom a party to the suit has expressly referred for information in reference to a matter in dispute are admissions.

Illustration
The question is, whether a horse sold by A to B is sound.
A says to B –– “Go and ask C, C knows all about it.” C’s statement is an admission.""")

print(f"Loaded {len(sections)} sections so far.")
