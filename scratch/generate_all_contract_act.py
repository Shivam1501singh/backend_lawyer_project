# Complete script to generate all sections of THE INDIAN CONTRACT ACT, 1872
# Strictly sourced from the official PDF provided

import json
import os

act_title = "THE INDIAN CONTRACT ACT, 1872"
act_year = 1872
bearer_act_category = "Civil and Property"

sections_data = [
    # =========================================================
    # PRELIMINARY
    # =========================================================
    {
        "section": "Section 1",
        "sectionNo": "1",
        "chapterNo": 1,
        "chapterRoman": "PRELIMINARY",
        "chapterName": "PRELIMINARY",
        "title": "Short title. Extent. Commencement. Saving.",
        "description": "1. Short title.—This Act may be called the Indian Contract Act, 1872.\nExtent, Commencement.—It extends to the whole of India 2[3***]; and it shall come into force on the first day of September, 1872.\nSaving—4*** Nothing herein contained shall affect the provisions of any Statute, Act or Regulation not hereby expressly repealed, nor any usage or custom of trade, nor any incident of any contract, not inconsistent with the provisions of this Act."
    },
    {
        "section": "Section 2",
        "sectionNo": "2",
        "chapterNo": 1,
        "chapterRoman": "PRELIMINARY",
        "chapterName": "PRELIMINARY",
        "title": "Interpretation-clause",
        "description": "2. Interpretation-clause.—In this Act the following words and expressions are used in the following senses, unless a contrary intention appears from the context:—\n(a) When one person signifies to another his willingness to do or to abstain from doing anything, with a view to obtaining the assent of that other to such act or abstinence, he is said to make a proposal;\n(b) When the person to whom the proposal is made signifies his assent thereto, the proposal is said to be accepted. A proposal, when accepted, becomes a promise;\n(c) The person making the proposal is called the “promisor”, and the person accepting the proposal is called the “promisee”;\n(d) When, at the desire of the promisor, the promisee or any other person has done or abstained from doing, or does or abstains from doing, or promises to do or to abstain from doing, something, such act or abstinence or promise is called a consideration for the promise;\n(e) Every promise and every set of promises, forming the consideration for each other, is an agreement;\n(f) Promises which form the consideration or part of the consideration for each other are called reciprocal promises;\n(g) An agreement not enforceable by law is said to be void;\n(h) An agreement enforceable by law is a contract;\n(i) An agreement which is enforceable by law at the option of one or more of the parties thereto, but not at the option of the other or others, is a voidable contract;\n(j) A contract which ceases to be enforceable by law becomes void when it ceases to be enforceable."
    },

    # =========================================================
    # CHAPTER I: OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS
    # =========================================================
    {
        "section": "Section 3",
        "sectionNo": "3",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS",
        "title": "Communication, acceptance and revocation of proposals",
        "description": "3. Communication, acceptance and revocation of proposals.—The communication of proposals, the acceptance of proposals, and the revocation of proposals and acceptances, respectively, are deemed to be made by any act or omission of the party proposing, accepting or revoking by which he intends to communicate such proposal, acceptance or revocation, or which has the effect of communicating it."
    },
    {
        "section": "Section 4",
        "sectionNo": "4",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS",
        "title": "Communication when complete",
        "description": "4. Communication when complete.—The communication of a proposal is complete when it comes to the knowledge of the person to whom it is made.\nThe communication of an acceptance is complete,—\nas against the proposer, when it is put in a course of transmission to him, so as to be out of the power of the acceptor;\nas against the acceptor, when it comes to the knowledge of the proposer.\nThe communication of a revocation is complete,—\nas against the person who makes it, when it is put into a course of transmission to the person to whom it is made, so as to be out of the power of the person who makes it;\nas against the person to whom it is made, when it comes to his knowledge.\nIllustrations\n(a) A proposes, by letter, to sell a house to B at a certain price.\nThe communication of the proposal is complete when B receives the letter.\n(b) B accepts A’s proposal by a letter sent by post.\nThe communication of the acceptance is complete,\nas against A when the letter is posted;\nas against B, when the letter is received by A.\n(c) A revokes his proposal by telegram.\nThe revocation is complete as against A when the telegram is despatched. It is complete as against B when B receives it.\nB revokes his acceptance by telegram. B’s revocation is complete as against B when the telegram is despatched, and as against A when it reaches him."
    },
    {
        "section": "Section 5",
        "sectionNo": "5",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS",
        "title": "Revocation of proposals and acceptances",
        "description": "5. Revocation of proposals and acceptances.—A proposal may be revoked at any time before the communication of its acceptance is complete as against the proposer, but not afterwards.\nAn acceptance may be revoked at any time before the communication of the acceptance is complete as against the acceptor, but not afterwards.\nIllustration\nA proposes, by a letter sent by post, to sell his house to B.\nB accepts the proposal by a letter sent by post.\nA may revoke his proposal at any time before or at the moment when B posts his letter of acceptance, but not afterwards.\nB may revoke his acceptance at any time before or at the moment when the letter communicating it reaches A, but not afterwards.\nSTATE AMENDMENT\nUttar Pradesh\nAmendment of section 5 of Act (9 of 1872).—In section 5 of Indian contract Act, 1872, hereinafter in this Chapter referred to as the principal Act, at the end of the first paragraph, the following explanation shall inserted, namely:--\n“Explanation—Where an invitation to a proposal contains a condition that any proposal made in response to such invitation shall be kept open for a specified time and a proposal is thereupon made accepting such condition, such proposal may not be revoked within such time.”\n[Vide Uttar Pradesh Act, 57 of 1976, s. 2]"
    },
    {
        "section": "Section 6",
        "sectionNo": "6",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS",
        "title": "Revocation how made",
        "description": "6. Revocation how made.—A proposal is revoked—\n(1) by the communication of notice of revocation by the proposer to the other party;\n(2) by the lapse of the time prescribed in such proposal for its acceptance, or, if no time is so prescribed, by the lapse of a reasonable time, without communication of the acceptance;\n(3) by the failure of the acceptor to fulfil a condition precedent to acceptance; or\n(4) by the death or insanity of the proposer, if the fact of his death or insanity comes to the knowledge of the acceptor before acceptance."
    },
    {
        "section": "Section 7",
        "sectionNo": "7",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS",
        "title": "Acceptance must be absolute",
        "description": "7. Acceptance must be absolute.—In order to convert a proposal into a promise, the acceptance must—\n(1) be absolute and unqualified;\n(2) be expressed in some usual and reasonable manner, unless the proposal prescribes the manner in which it is to be accepted. If the proposal prescribes a manner in which it is to be accepted, and the acceptance is not made in such manner, the proposer may, within a reasonable time after the acceptance is communicated to him, insist that his proposal shall be accepted in the prescribed manner, and not otherwise; but if he fails to do so, he accepts the acceptance."
    },
    {
        "section": "Section 8",
        "sectionNo": "8",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS",
        "title": "Acceptance by performing conditions, or receiving consideration",
        "description": "8. Acceptance by performing conditions, or receiving consideration.—Performance of the conditions of a proposal, or the acceptance of any consideration for a reciprocal promise which may be offered with a proposal, is an acceptance of the proposal."
    },
    {
        "section": "Section 9",
        "sectionNo": "9",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "OF THE COMMUNICATION, ACCEPTANCE AND REVOCATION OF PROPOSALS",
        "title": "Promises, express and implied",
        "description": "9. Promises, express and implied.—In so far as the proposal or acceptance of any promise is made in words, the promise is said to be express. In so far as such proposal or acceptance is made otherwise than in words, the promise is said to be implied."
    },

    # =========================================================
    # CHAPTER II: OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS
    # =========================================================
    {
        "section": "Section 10",
        "sectionNo": "10",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "What agreements are contracts",
        "description": "10. What agreements are contracts.—All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.\nNothing herein contained shall affect any law in force in 1[India] and not hereby expressly repealed by which any contract is required to be made in writing2 or in the presence of witnesses, or any law relating to the registration of documents."
    },
    {
        "section": "Section 11",
        "sectionNo": "11",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Who are competent to contract",
        "description": "11. Who are competent to contract.—Every person is competent to contract who is of the age of majority according to the law to which he is subject3, and who is of sound mind, and is not disqualified from contracting by any law to which he is subject."
    },
    {
        "section": "Section 12",
        "sectionNo": "12",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "What is a sound mind for the purposes of contracting",
        "description": "12. What is a sound mind for the purposes of contracting.—A person is said to be of sound mind for the purpose of making a contract, if, at the time when he makes it, he is capable of understanding it and of forming a rational judgment as to its effect upon his interests.\nA person who is usually of unsound mind, but occasionally of sound mind, may make a contract when he is of sound mind.\nA person who is usually of sound mind, but occasionally of unsound mind, may not make a contract when he is of unsound mind.\nIllustrations\n(a) A patient in a lunatic asylum, who is at intervals of sound mind, may contract during those intervals.\n(b) A sane man, who is delirious from fever or who is so drunk that he cannot understand the terms of a contract, or form a rational judgment as to its effect on his interests, cannot contract whilst such delirium or drunkenness lasts."
    },
    {
        "section": "Section 13",
        "sectionNo": "13",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "“Consent” defined",
        "description": "13. “Consent” defined.—Two or more persons are said to consent when they agree upon the same thing in the same sense."
    },
    {
        "section": "Section 14",
        "sectionNo": "14",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "“Free consent” defined",
        "description": "14. “Free consent” defined.—Consent is said to be free when it is not caused by—\n(1) coercion, as defined in section 15, or\n(2) undue influence, as defined in section 16, or\n(3) fraud, as defined in section 17, or\n(4) misrepresentation, as defined in section 18, or\n(5) mistake, subject to the provisions of sections 20, 21 and 22.\nConsent is said to be so caused when it would not have been given but for the existence of such coercion, undue influence, fraud, misrepresentation or mistake."
    },
    {
        "section": "Section 15",
        "sectionNo": "15",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "“Coercion” defined",
        "description": "15. “Coercion” defined.—“Coercion” is the committing, or threatening to commit, any act forbidden by the Indian Penal Code (45 of 1860)or the unlawful detaining, or threatening to detain, any property, to the prejudice of any person whatever, with the intention of causing any person to enter into an agreement.\nExplanation.—It is immaterial whether the Indian Penal Code (45 of 1860) is or is not in force in the place where the coercion is employed.\nIllustration\nA, on board an English ship on the high seas, causes B to enter into an agreement by an act amounting to criminal intimidation under the Indian Penal Code (45 of 1860).\nA afterwards sues B for breach of contract at Calcutta.\nA has employed coercion, although his act is not an offence by the law of England, and although section 506 of the Indian Penal Code (45 of 1860) was not in force at the time when or place where the act was done."
    },
    {
        "section": "Section 16",
        "sectionNo": "16",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "“Undue influence” defined",
        "description": "1[16. “Undue influence” defined.—(1) A contract is said to be induced by “undue influence” where the relations subsisting between the parties are such that one of the parties is in a position to dominate the will of the other and uses that position to obtain an unfair advantage over the other.\n(2) In particular and without prejudice to the generality of the foregoing principle, a person is deemed to be in a position to dominate the will of another—\n(a) where he holds a real or apparent authority over the other, or where he stands in a fiduciary relation to the other; or\n(b) where he makes a contract with a person whose mental capacity is temporarily or permanently affected by reason of age, illness, or mental or bodily distress.\n(3) Where a person who is in a position to dominate the will of another, enters into a contract with him, and the transaction appears, on the face of it or on the evidence adduced, to be unconscionable, the burden of proving that such contract was not induced by undue influence shall lie upon the person in a position to dominate the will of the other.\nNothing in this sub-section shall affect the provisions of section 111 of the Indian Evidence Act, 1872 (1 of 1872).\nIllustrations\n(a) A having advanced money to his son, B, during his minority, upon B’s coming of age obtains, by misuse of parental influence, a bond from B for a greater amount than the sum due in respect of the advance. A employs undue influence.\n(b) A, a man enfeebled by disease or age, is induced, by B’s influence over him as his medical attendant, to agree to pay B an unreasonable sum for his professional services. B employs undue influence.\n(c) A, being in debt to B, the money-lender of his village, contracts a fresh loan on terms which appear to be unconscionable. It lies on B to prove that the contract was not induced by undue influence.\n(d) A applies to a banker for a loan at a time when there is stringency in the money market. The banker declines to make the loan except at an unusually high rate of interest. A accepts the loan on these terms. This is a transaction in the ordinary course of business, and the contract is not induced by undue influence.]"
    },
    {
        "section": "Section 17",
        "sectionNo": "17",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "“Fraud” defined",
        "description": "17. “Fraud” defined.—“Fraud” means and includes any of the following acts committed by a party to a contract, or with his connivance, or by his agent2, with intent to deceive another party thereto of his agent, or to induce him to enter into the contract:—\n(1) the suggestion, as a fact, of that which is not true, by one who does not believe it to be true;\n(2) the active concealment of a fact by one having knowledge or belief of the fact;\n(3) a promise made without any intention of performing it;\n(4) any other act fitted to deceive;\n(5) any such act or omission as the law specially declares to be fraudulent.\nExplanation.—Mere silence as to facts likely to affect the willingness of a person to enter into a contract is not fraud, unless the circumstances of the case are such that, regard being had to them, it is the duty of the person keeping silence to speak3, or unless his silence is, in itself, equivalent to speech.\nIllustrations\n(a) A sells, by auction, to B, a horse which A knows to be unsound. A says nothing to B about the horse’s unsoundness. This is not fraud in A.\n(b) B is A’s daughter and has just come of age. Here, the relation between the parties would make it A’s duty to tell B if the horse is unsound.\n(c) B says to A—“If you do not deny it, I shall assume that the horse is sound.” A says nothing. Here, A’s silence is equivalent to speech.\n(d) A and B, being traders, enter upon a contract. A has private information of a change in prices which would affect B’s willingness to proceed with the contract. A is not bound to inform B."
    },
    {
        "section": "Section 18",
        "sectionNo": "18",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "“Misrepresentation” defined",
        "description": "18. “Misrepresentation” defined.—“Misrepresentation” means and includes—\n(1) the positive assertion, in a manner not warranted by the information of the person making it, of that which is not true, though he believes it to be true;\n(2) any breach of duty which, without an intent to deceive, gains an advantage to the person committing it, or any one claiming under him; by misleading another to his prejudice, or to the prejudice of any one claiming under him;\n(3) causing, however innocently, a party to an agreement, to make a mistake as to the substance of the thing which is the subject of the agreement."
    },
    {
        "section": "Section 19",
        "sectionNo": "19",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Voidability of agreements without free consent",
        "description": "19. Voidability of agreements without free consent.—When consent to an agreement is caused by coercion,1*** fraud or misrepresentation, the agreement is a contract voidable at the option of the party whose consent was so caused.\nA party to a contract whose consent was caused by fraud or misrepresentation, may, if he thinks fit, insist that the contract shall be performed, and that he shall be put in the position in which he would have been if the representations made had been true.\nException.—If such consent was caused by misrepresentation or by silence, fraudulent within the meaning of section 17, the contract, nevertheless, is not voidable, if the party whose consent was so caused had the means of discovering the truth with ordinary diligence.\nExplanation.—A fraud or misrepresentation which did not cause the consent to a contract of the party on whom such fraud was practised, or to whom such misrepresentation was made, does not render a contract voidable.\nIllustrations\n(a) A, intending to deceive B, falsely represents that five hundred maunds of indigo are made annually at A’s factory, and thereby induces B to buy the factory. The contract is voidable at the option of B.\n(b) A, by a misrepresentation, leads B erroneously to believe that, five hundred maunds of indigo are made annually at A’s factory. B examines the accounts of the factory, which show that only four hundred maunds of indigo have been made. After this B buys the factory. The contract is not voidable on account of A’s misrepresentation.\n(c) A fraudulently informs B that A’s estate is free from in cumbrance. B thereupon buys the estate. The estate is subject to a mortgage. B may either avoid the contract, or may insist on its being carried out and the mortgage debt redeemed.\n(d) B, having discovered a vein of ore on the estate of A, adopts means to conceal, and does conceal, the existence of the ore from A. Through A’s ignorance B is enabled to buy the estate at an under-value. The contract is voidable at the option of A.\n(e) A is entitled to succeed to an estate at the death of B; B dies: C, having received intelligence of B’s death, prevents the intelligence reaching A, and thus induces A to sell him his interest in the estate. The sale is voidable at the option of A."
    },
    {
        "section": "Section 19A",
        "sectionNo": "19A",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Power to set aside contract induced by undue influence",
        "description": "2[19A. Power to set aside contract induced by undue influence.—When consent to an agreement is caused by undue influence, the agreement is a contract voidable at the option of the party whose consent was so caused.\nAny such contract may be set aside either absolutely or, if the party who was entitled to avoid it has received any benefit thereunder, upon such terms and conditions as to the Court may seem just.\nIllustrations\n(a) A’s son has forged B’s name to a promissory note. B under threat of prosecuting A’s son, obtains a bond from A for the amount of the forged note. If B sues on this bond, the Court may set the bond aside.\n(b) A, a money-lender, advances Rs. 100 to B, an agriculturist, and, by undue influence, induces B to execute a bond for Rs. 200 with interest at 6 per cent. per month. The Court may set the bond aside, ordering B to repay the Rs. 100 with such interest as may seem just.]"
    },
    {
        "section": "Section 20",
        "sectionNo": "20",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreement void where both parties are under mistake as to matter of fact",
        "description": "20. Agreement void where both parties are under mistake as to matter of fact.—Where both the parties to an agreement are under a mistake as to a matter of fact essential to the agreement, the agreement is void.\nExplanation.—An erroneous opinion as to the value of the thing which forms the subject-matter of the agreement, is not to be deemed a mistake as to a matter of fact.\nIllustrations\n(a) A agrees to sell to B a specific cargo of goods supposed to be on its way from England to Bombay. It turns out that, before the day of the bargain, the ship conveying the cargo had been cast away and the goods lost. Neither party was aware of the these facts. The agreement is void.\n(b) A agrees to buy from B a certain horse. It turns out that the horse was dead at the time of the bargain, though neither party was aware of the fact. The agreement is void.\n(c) A, being entitled to an estate for the life of B, agrees to sell it to C. B was dead at the time of the agreement, but both parties were ignorant of the fact. The agreement is void."
    },
    {
        "section": "Section 21",
        "sectionNo": "21",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Effect of mistakes as to law",
        "description": "21. Effect of mistakes as to law.—A contract is not voidable because it was caused by a mistake as to any law in force in 1[India]; but a mistake as to a law not in force in 1[India] has the same effect as a mistake of fact.\n2* * * * *\nIllustration\nA and B make a contract grounded on the erroneous belief that a particular debt is barred by the Indian Law of Limitation: the contract is not voidable.\n3* * * * *"
    },
    {
        "section": "Section 22",
        "sectionNo": "22",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Contract caused by mistake of one party as to matter of fact",
        "description": "22. Contract caused by mistake of one party as to matter of fact.—A contract is not voidable merely because it was caused by one of the parties to it being under a mistake as to a matter of fact."
    },
    {
        "section": "Section 23",
        "sectionNo": "23",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "What considerations and objects are lawful, and what not",
        "description": "23. What considerations and objects are lawful, and what not.—The consideration or object of an agreement is lawful, unless—\nit is forbidden by law4;\nor is of such a nature that if permitted, it would defeat the provisions of any law; or\nis fraudulent ;\nor involves or implies injury to the person or property of another; or\nthe Court regards it as immoral, or opposed to public policy.\nIn each of these cases, the consideration or object of an agreement is said to be unlawful. Every agreement of which the object or consideration is unlawful is void.\nIllustrations\n(a) A agrees to sell his house to B for 10,000 rupees. Here B’s promise to pay the sum of 10,000 rupees is the consideration for A’s promise to sell the house, and A’s promise to sell the house is the consideration for B’s promise to pay the 10,000 rupees. These are lawful considerations.\n(b) A promises to pay B 1,000 rupees at the end of six months, if C, who owes that sum to B, fails to pay it. B promises to grant time to C accordingly. Here, the promise of each party is the consideration for the promise of the other party, and they are lawful considerations.\n(c) A promises, for a certain sum paid to him by B, to make good to B the value of his ship if it is wrecked on a certain voyage. Here, A’s promise is the consideration for B’s payment and B’s payment is the consideration for A’s promise and these are lawful considerations.\n(d) A promises to maintain B’s child, and B promises to pay A 1,000 rupees yearly for the purpose. Here, the promise of each party is the consideration for the promise of the other party. They are lawful considerations.\n(e) A, B and C enter into an agreement for the division among them of gains acquired or to be acquired, by them by fraud. The agreement is void, as its object is unlawful.\n(f) A promises to obtain for B an employment in the public service and B promises to pay 1,000 rupees to A. The agreement is void, as the consideration for it is unlawful.\n(g) A, being agent for a landed proprietor, agrees for money, without the knowledge of his principal, to obtain for B a lease of land belonging to his principal. The agreement between A and B is void, as it implies a fraud by concealment, by A, on his principal.\n(h) A promises B to drop a prosecution which he has instituted against B for robbery, and B promises to restore the value of the things taken. The agreement is void, as its object is unlawful.\n(i) A’s estate is sold for arrears of revenue under the provisions of an Act of the Legislature, by which the defaulter is prohibited from purchasing the estate. B, upon an understanding with A, becomes the purchaser, and agrees to convey the estate to A upon receiving from him the price which B has paid. The agreement is void, as it renders the transaction, in effect, a purchase by the defaulter, and would so defeat the object of the law.\n(j) A, who is B’s mukhtar, promises to exercise his influence, as such, with B in favour of C, and C promises to pay 1,000 rupees to A. The agreement is void, because it is immoral.\n(k) A agrees to let her daughter to hire to B for concubinage. The agreement is void, because it is immoral, though the letting may not be punishable under the Indian Penal Code (45 of 1860)."
    },
    {
        "section": "Section 24",
        "sectionNo": "24",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreements void, if considerations and objects unlawful in part",
        "description": "Void agreements\n24. Agreements void, if considerations and objects unlawful in part.—If any part of a single consideration for one or more objects, or any one or any part of any one of several considerations for a single object, is unlawful, the agreement is void.\nIllustration\nA promises to superintend, on behalf of B, a legal manufacture of indigo, and an illegal traffic in other articles. B promises to pay to A a salary of 10,000 rupees a year. The agreement is void, the object of A’s promise, and the consideration for B’s promise, being in part unlawful."
    },
    {
        "section": "Section 25",
        "sectionNo": "25",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreement without consideration, void, unless it is in writing and registered,or is a promise to compensate for something done or is a promise to pay a debt barred by limitation law",
        "description": "25. Agreement without consideration, void, unless it is in writing and registered,or is a promise to compensate for something done or is a promise to pay a debt barred by limitation law.—An agreement made without consideration is void, unless—\n(1) it is expressed in writing and registered under the law for the time being in force for the registration of 1[documents], and is made on account of natural love and affection between parties standing in a near relation to each other ; or unless\n(2) it is a promise to compensate, wholly or in part, a person who has already voluntarily done something for the promisor, or something which the promisor was legally compellable to do; or unless;\n(3) it is a promise, made in writing and signed by the person to be charged therewith, or by his agent generally or specially authorized in that behalf, to pay wholly or in part a debt of which the creditor might have enforced payment but for the law for the limitation of suits.\nIn any of these cases, such an agreement is a contract.\nExplanation 1.—Nothing in this section shall affect the validity, as between the donor and donee, of any gift actually made.\nExplanation 2.—An agreement to which the consent of the promisor is freely given is not void merely because the consideration is inadequate; but the inadequacy of the consideration may be taken into account by the Court in determining the question whether the consent of the promisor was freely given.\nIllustrations\n(a) A promises, for no consideration, to give to B Rs. 1,000. This is a void agreement.\n(b) A, for natural love and affection, promises to give his son, B, Rs. 1,000. A puts his promise to B into writing and registers it. This is a contract.\n(c) A finds B’s purse and gives it to him. B promises to give A Rs. 50. This is a contract.\n(d) A supports B’s infant son. B promises to pay A’s expenses in so doing. This is a contract.\n(e) A owes B Rs. 1,000, but the debt is barred by the Limitation Act. A signs a written promise to pay B Rs. 500 on account of the debt. This is a contract.\n(f) A agrees to sell a horse worth Rs. 1,000 for Rs. 10. A’s consent to the agreement was freely given. The agreement is a contract notwithstanding the inadequacy of the consideration.\n(g) A agrees to sell a horse worth Rs. 1,000 for Rs. 10. A denies that his consent to the agreement was freely given. The inadequacy of the consideration is a fact which the Court should take into account in considering whether or not A’s consent was freely given."
    },
    {
        "section": "Section 26",
        "sectionNo": "26",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreement in restraint of marriage, void",
        "description": "26. Agreement in restraint of marriage, void.—Every agreement in restraint of the marriage of any person, other than a minor, is void."
    },
    {
        "section": "Section 27",
        "sectionNo": "27",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreement in restraint of trade, void. Saving of agreement not to carry on business of which good-will is sold.",
        "description": "27. Agreement in restraint of trade, void.—Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.\nException 1.—Saving of agreement not to carry on business of which good-will is sold.—One who sells the good-will of a business may agree with the buyer to refrain from carrying on a similar business, within specified local limits, so long as the buyer, or any person deriving title to the good-will from him, carries on a like business therein, provided that such limits appear to the Court reasonable, regard being had to the nature of the business.\n1* * * * *."
    },
    {
        "section": "Section 28",
        "sectionNo": "28",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreements in restraint of legal proceedings, void. Saving of contract to refer to arbitration dispute that may arise. Saving of contract to refer questions that have already arisen. Saving of a guarantee agreement of a bank or a financial institution.",
        "description": "28. Agreements in restraint of legal proceedings, void.—2[Every agreement,—\n(a) by which any party thereto is restricted absolutely from enforcing his rights under or in respect of any contract, by the usual legal proceedings in the ordinary tribunals, or which limits the time within which he may thus enforce his rights; or\n(b) which extinguishes the rights of any party thereto, or discharges any party thereto, from any liability, under or in respect of any contract on the expiry of a specified period so as to restrict any party from enforcing his rights,\nis void to the extent.]\nException 1.—Saving of contract to refer to arbitration dispute that may arise.—This section shall not render illegal a contract, by which two or more persons agree that any dispute which may arise between them in respect of any subject or class of subjects shall be referred to arbitration, and that only the amount awarded in such arbitration shall be recoverable in respect of the dispute so referred.\n3*****\nException 2.—Saving of contract to refer questions that have already arisen.—Nor shall this section render illegal any contract in writing, by which two or more persons agree to refer to arbitration any question between them which has already arisen, or affect any provision of any law in force for the time being as to references to arbitration4.\n1[Exception 3.—Saving of a guarantee agreement of a bank or a financial institution.—This section shall not render illegal a contract in writing by which any bank or financial institution stipulate a term in a guarantee or any agreement making a provision for guarantee for extinguishment of the rights or discharge of any party thereto from any liability under or in respect of such guarantee or agreement on the expiry of a specified period which is not less than one year from the date of occurring or non-occurring of a specified event for extinguishment or discharge of such party from the said liability.\nExplanation.—(i) In Exception 3, the expression “bank” means—\n(a) a “banking company” as defined in clause (c) of section 5 of the Banking Regulation Act, 1949(10 of 1949);\n(b) “a corresponding new bank” as defined in clause (da) of section 5 of the Banking Regulation Act, 1949(10 of 1949);\n(c) “State Bank of India” constituted under section 3 of the State Bank of India Act, 1955 (23 of 1955);\n(d) “a subsidiary bank” as defined in clause (k) of section 2 of the State Bank of India (Subsidiary Banks) Act, 1959(38 of 1959);\n(e) “a Regional Rural Bank” established under section 3 of the Regional Rural Banks Act, 1976(21 of 1976);\n(f) “a Co-operative Bank” as defined in clause (cci) of section 5 of the Banking Regulation Act, 1949(10 of 1949);\n(g) “a multi-State co-operative bank” as defined in clause (cciiia) of section 5 of the Banking Regulation Act, 1949(10 of 1949); and\n(ii) In Exception 3, the expression “a financial institution” means any public financial institution within the meaning of section 4A of the Companies Act, 1956(1 of 1956).]"
    },
    {
        "section": "Section 29",
        "sectionNo": "29",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreements void for uncertainty",
        "description": "29. Agreements void for uncertainty.—Agreements, the meaning of which is not certain, or capable of being made certain, are void.\nIllustrations\n(a) A agrees to sell to B “a hundred tons of oil”. There is nothing whatever to show what kind of oil was intended. The agreement is void for uncertainty.\n(b) A agrees to sell to B one hundred tons of oil of a specified description, known as an article of commerce. There is no uncertainty here to make the agreement void.\n(c) A, who is a dealer in cocoanut-oil only, agrees to sell to B “one hundred tons of oil”. The nature of A’s trade affords an indication of the meaning of the words, and A has entered into a contract for the sale of one hundred tons of cocoanut-oil.\n(d) A agrees to sell to B “all the grain in my granary at Ramnagar”. There is no uncertainty here to make the agreement void.\n(e) A agrees to sell B “one thousand maunds of rice at a price to be fixed by C”. As the price is capable of being made certain, there is no uncertainty here to make the agreement void.\n(f) A agrees to sell to B “my white horse for rupees five hundred or rupees one thousand”. There is nothing to show which of the two prices was to be given. The agreement is void."
    },
    {
        "section": "Section 30",
        "sectionNo": "30",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "OF CONTRACTS, VOIDABLE CONTRACTS AND VOID AGREEMENTS",
        "title": "Agreements by way of wager void. Exception in favour of certain prizes for horse-racing. Section 294A of the Indian Penal Code not affected.",
        "description": "30. Agreements by way of wager void.—Agreements by way of wager are void; and no suit shall be brought for recovering anything alleged to be won on any wager, or entrusted to any person to abide the result of any game or other uncertain event on which any wager is made.\nException in favour of certain prizes for horse-racing.—This section shall not be deemed to render unlawful a subscription or contribution, or agreement to subscribe or contribute, made or entered into for or toward any plate, prize or sum of money, of the value or amount of five hundred rupees or upwards, to be awarded to the winner or winners of any horse-race.\nSection 294A of the Indian Penal Code not affected.—Nothing in this section shall be deemed to legalize any transaction connected with horse-racing, to which the provisions of section 294A of the Indian Penal Code (45 of 1860) apply."
    },

    # =========================================================
    # CHAPTER III: OF CONTINGENT CONTRACTS
    # =========================================================
    {
        "section": "Section 31",
        "sectionNo": "31",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "OF CONTINGENT CONTRACTS",
        "title": "“Contingent contract” defined",
        "description": "CHAPTER III\nOF CONTINGENT CONTRACTS\n31. “Contingent contract” defined.—A “contingent contract is a contract to do or not to do something, if some event, collateral to such contract, does or does not happen.\nIllustration\nA contracts to pay B Rs. 10,000 if B’s house is burnt. This is a contingent contract."
    },
    {
        "section": "Section 32",
        "sectionNo": "32",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "OF CONTINGENT CONTRACTS",
        "title": "Enforcement of contracts contingent on an event happening",
        "description": "32. Enforcement of contracts contingent on an event happening.—Contingent contracts to do or not to do anything if an uncertain future event happens cannot be enforced by law unless and until that event has happened.\nIf the event becomes impossible, such contracts become void.\nIllustrations\n(a) A makes a contract with B to buy B’s horse if A survives C. This contract cannot be enforced by law unless and until C dies in A’s lifetime.\n(b) A makes a contract with B to sell a horse to B at a specified price, if C, to whom the horse has been offered, refuses to buy him. The contract cannot be enforced by law unless and until C refuses to buy the horse.\n(c) A contracts to pay B a sum of money when B marries C. C dies without being married to B. The contract becomes void."
    },
    {
        "section": "Section 33",
        "sectionNo": "33",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "OF CONTINGENT CONTRACTS",
        "title": "Enforcement of contracts contingent on an event not happening",
        "description": "33. Enforcement of contracts contingent on an event not happening.—Contingent contracts to do or not to do anything if an uncertain future event does not happen can be enforced when the happening of that event becomes impossible, and not before.\nIllustration\nA agrees to pay B a sum of money if a certain ship does not return. The ship is sunk. The contract can be enforced when the ship sinks."
    },
    {
        "section": "Section 34",
        "sectionNo": "34",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "OF CONTINGENT CONTRACTS",
        "title": "When event on which contract is contingent to be deemed impossible, if it is the future conduct of a living person",
        "description": "34. When event on which contract is contingent to be deemed impossible, if it is the future conduct of a living person.—If the future event on which a contract is contingent is the way in which a person will act at an unspecified time, the event shall be considered to become impossible when such person does anything which renders it impossible that he should so act within any definite time, or otherwise than under further contingencies.\nIllustration\nA agrees to pay B a sum of money if B marries C. C marries D. The marriage of B to C must now be considered impossible, although it is possible that D may die and that C may afterwards marry B."
    },
    {
        "section": "Section 35",
        "sectionNo": "35",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "OF CONTINGENT CONTRACTS",
        "title": "When contracts become void which are contingent on happening of specified event within fixed time. When contracts may be enforced, which are contingent on specified event not happening within fixed time.",
        "description": "35. When contracts become void which are contingent on happening of specified event within fixed time.—Contingent contracts to do or not to do anything if a specified uncertain event happens within a fixed time become void if, at the expiration of the time fixed, such event has not happened, or if, before the time fixed, such event becomes impossible.\nWhen contracts may be enforced, which are contingent on specified event not happening within fixed time.—Contingent contracts to do or not to do anything, if a specified uncertain event does not happen within a fixed time may be enforced by law when the time fixed has expired and such event has not happened or, before the time fixed has expired, if it becomes certain that such event will not happen.\nIllustrations\n(a) A promises to pay B a sum of money if a certain ship returns within a year. The contract may be enforced if the ship returns within the year, and becomes void if the ship is burnt within the year.\n(b) A promises to pay B a sum of money if a certain ship does not return within a year. The contract may be enforced if the ship does not return within the year, or is burnt within the year."
    },
    {
        "section": "Section 36",
        "sectionNo": "36",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "OF CONTINGENT CONTRACTS",
        "title": "Agreement contingent on impossible events void",
        "description": "36. Agreement contingent on impossible events void.—Contingent agreements to do or not to do anything, if an impossible event happens, are void, whether the impossibility of the event is known or not to the parties to the agreement at the time when it is made.\nIllustrations\n(a) A agrees to pay B 1,000 rupees if two straight lines should enclose a space. The agreement is void.\n(b) A agrees to pay B 1,000 rupees if B will marry A’s daughter C. C was dead at the time of the agreement. The agreement is void."
    },

    # =========================================================
    # CHAPTER IV: OF THE PERFORMANCE OF CONTRACTS
    # Contracts which must be performed
    # =========================================================
    {
        "section": "Section 37",
        "sectionNo": "37",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Obligation of parties to contracts",
        "description": "CHAPTER IV\nOF THE PERFORMANCE OF CONTRACTS\nContracts which must be performed\n37. Obligation of parties to contracts.—The parties to a contract must either perform, or offer to perform, their respective promises, unless such performance is dispensed with or excused under the provisions of this Act, or of any other law.\nPromises bind the representatives of the promisors in case of the death of such promisors before performance, unless a contrary intention appears from the contract.\nIllustrations\n(a) A promises to deliver goods to B on a certain day on payment of Rs. 1,000. A dies before that day. A’s representatives are bound to deliver the goods to B, and B is bound to pay the Rs. 1,000 to A’s representatives.\n(b) A promises to paint a picture for B by a certain day, at a certain price. A dies before the day. The contract cannot be enforced either by A’s representatives or by B."
    },
    {
        "section": "Section 38",
        "sectionNo": "38",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of refusal to accept offer of performance",
        "description": "38. Effect of refusal to accept offer of performance.—Where a promisor has made an offer of performance to the promisee, and the offer has not been accepted, the promisor is not responsible for non-performance, nor does he thereby lose his rights under the contract.\nEvery such offer must fulfil the following conditions:—\n(1) it must be unconditional;\n(2) it must be made at a proper time and place, and under such circumstances that the person to whom it is made may have a reasonable opportunity of ascertaining that the person by whom it is made is able and willing there and then to do the whole of what he is bound by his promise to do;\n(3) if the offer is an offer to deliver anything to the promisee, the promisee must have a reasonable opportunity of seeing that the thing offered is the thing which the promisor is bound by his promise to deliver.\nAn offer to one of several joint promisees has the same legal consequences as an offer to all of them.\nIllustration\nA contracts to deliver to B at his warehouse, on the 1st March, 1873, 100 bales of cotton of a particular quality. In order to make an offer of a performance with the effect stated in this section, A must bring the cotton to B’s warehouse, on the appointed day, under such circumstances that B may have areasonable opportunity of satisfying himself that the thing offered is cotton of the quality contracted for, and that there are 100 bales."
    },
    {
        "section": "Section 39",
        "sectionNo": "39",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of refusal of party to perform promise wholly",
        "description": "39. Effect of refusal of party to perform promise wholly.—When a party to a contract has refused to perform, or disabled himself from performing, his promise in its entirety, the promisee may put an end to the contract, unless he has signified, by words or conduct, his acquiescence in its continuance.\nIllustrations\n(a) A, a singer, enters into a contract with B, the manager of a theatre, to sing at his theatre two nights in every week during the next two months, and B engages to pay her 100 rupees for each night’s performance. On the sixth night A wilfully absents herself from the theatre. B is at liberty to put an end to the contract.\n(b) A, a singer, enters into a contract with B, the manager of a theatre, to sing at his theatre two night’s in every week during the next two months, and B engages to pay her at the rate of 100 rupees for each night. On the sixth night, A wilfully absents herself. With the assent of B, A sings on the seventh night. B has signified his acquiescence in the continuance of the contract, and cannot now put an end to it, but is entitled to compensation for the damage sustained by him through A’s failure to sing on the sixth night."
    },
    {
        "section": "Section 40",
        "sectionNo": "40",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Person by whom promise is to be performed",
        "description": "By whom contracts must be performed\n40. Person by whom promise is to be performed.—If it appears from the nature of the case that it was the intention of the parties to any contract that any promise contained in it should be performed by the promisor himself, such promise must be performed by the promisor. In other cases, the promisor or his representatives may employ a competent person to perform it.\nIllustrations\n(a) A promises to pay B a sum of money. A may perform this promise, either by personally paying the money to B or by causing it to be paid to B by another ; and, if A dies before the time appointed for payment, his representatives must perform the promise, or employ some proper person to do so.\n(b) A promises to paint a picture for B. A must perform this promise personally."
    },
    {
        "section": "Section 41",
        "sectionNo": "41",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of accepting performance from third person",
        "description": "41. Effect of accepting performance from third person.—When a promisee accepts performance of the promise from a third person, he cannot afterwards enforce it against the promisor."
    },
    {
        "section": "Section 42",
        "sectionNo": "42",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Devolution of joint liabilities",
        "description": "42. Devolution of joint liabilities.—When two or more persons have made a joint promise, then, unless a contrary intention appears by the contract, all such persons, during their joint lives, and, after the death of any of them, his representative jointly with the survivor or survivors, and, after the death of the last survivor, the representatives of all jointly, must fulfil the promise."
    },
    {
        "section": "Section 43",
        "sectionNo": "43",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Any one of joint promisors may be compelled to perform. Each promisor may compel contribution. Sharing of loss by default in contribution.",
        "description": "43. Any one of joint promisors may be compelled to perform.—When two or more persons make a joint promise, the promisee may, in the absence of express agreement to the contrary, compel any 1[one or more] of such joint promisors to perform the whole of the promise.\nEach promisor may compel contribution.—Each of two or more joint promisors may compel every other joint promisor to contribute equally with himself to the performance of the promise, unless a contrary intention appears from the contract.\nSharing of loss by default in contribution.—If any one of two or more joint promisors makes default in such contribution, the remaining joint promisors must bear the loss arising from such default in equal shares.\nExplanation.—Nothing in this section shall prevent a surety from recovering from his principal, payments made by the surety on behalf of the principal, or entitle the principal to recover anything from the surety on account of payments made by the principal.\nIllustrations\n(a) A, B and C jointly promise to pay D 3,000 rupees. D may compel either A or B or C to pay him 3,000 rupees.\n(b) A, B and C jointly promise to pay D the sum of 3,000 rupees. C is compelled to pay the whole. A is insolvent, but his assets are sufficient to pay one-half of his debts. C is entitled to receive 500 rupees from A’s estate, and 1,250 rupees from B.\n(c) A, B and C are under a joint promise to pay D 3,000 rupees. C is unable to pay anything, and A is compelled to pay the whole. A is entitled to receive 1,500 rupees from B.\n(d) A, B and C are under a joint promise to pay D 3,000 rupees, A and B being only sureties for C. C fails to pay. A and B are compelled to pay the whole sum. They are entitled to recover it from C."
    },
    {
        "section": "Section 44",
        "sectionNo": "44",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of release of one joint promisor",
        "description": "44. Effect of release of one joint promisor.—Where two or more persons have made a joint promise, a release of one of such joint promisors by the promisee does not discharge the other joint promisor or joint promisors; neither does it free the joint promisors so released from responsibility to the other joint promisor or joint promisors.1"
    },
    {
        "section": "Section 45",
        "sectionNo": "45",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Devolution of joint rights",
        "description": "45. Devolution of joint rights.—When a person has made a promise to two or more persons jointly, then, unless a contrary intention appears from the contract, the right to claim performance rests, as between him and them, with them during their joint lives, and, after the death of any of them, with the representative of such deceased person jointly with the survivor or survivors, and, after the death of the last survivor, with the representatives of all jointly.2\nIllustration\nA, in consideration of 5,000 rupees, lent to him by B and C, promises B and C jointly to repay them that sum with interest on a day specified. B dies. The right to claim performance rests with B’s representative jointly with C during C’s life, and after the death of C with the representatives of B and C jointly."
    },
    {
        "section": "Section 46",
        "sectionNo": "46",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Time for performance of promise, when no application is to be made and no time is specified",
        "description": "Time and place for performance\n46. Time for performance of promise, when no application is to be made and no time is specified.—Where, by the contract, a promisor is to perform his promise without application by the promisee, and no time for performance is specified, the engagement must be performed within a reasonable time.\nExplanation.—The question “what is a reasonable time” is, in each particular case, a question of fact."
    },
    {
        "section": "Section 47",
        "sectionNo": "47",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Time and place for performance of promise, where time is specified and no application to be made",
        "description": "47. Time and place for performance of promise, where time is specified and no application to be made.—When a promise is to be performed on a certain day, and the promisor has undertaken to perform it without application by the promisee, the promisor may perform it at any time during the usual hours of business on such day and at the place at which the promise ought to be performed.\nIllustration\nA promises to deliver goods at B’s warehouse on the first January. On that day A brings the goods to B’s warehouse, but after the usual hour for closing it, and they are not received. A has not performed his promise."
    },
    {
        "section": "Section 48",
        "sectionNo": "48",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Application for performance on certain day to be at proper time and place",
        "description": "48. Application for performance on certain day to be at proper time and place.—When a promise is to be performed on a certain day, and the promisor has not undertaken to perform it without application by the promisee, it is the duty of the promisee to apply for performance at a proper place and within the usual hours of business.\nExplanation.—The question “what is a proper time and place” is, in each particular case, a question of fact."
    },
    {
        "section": "Section 49",
        "sectionNo": "49",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Place for performance of promise, where no application to be made and no place fixed for performance",
        "description": "49. Place for performance of promise, where no application to be made and no place fixed for performance.—When a promise is to be performed without application by the promisee, and no place is fixed for the performance of it, it is the duty of the promisor to apply to the promisee to appoint a reasonable place for the performance of the promise, and to perform it at such place.\nIllustration\nA undertakes to deliver a thousand maunds of jute to B on a fixed day. A must apply to B to appoint a reasonable place for the purpose of receiving it, and must deliver it to him at such place."
    },
    {
        "section": "Section 50",
        "sectionNo": "50",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Performance in manner or at time prescribed or sanctioned by promisee",
        "description": "50. Performance in manner or at time prescribed or sanctioned by promisee.—The performance of any promise may be made in any manner, or at any time which the promisee prescribes or sanctions.\nIllustrations\n(a) B owes A 2,000 rupees. A desires B to pay the amount to A’s account with C, a banker. B, who also banks with C, orders the amount to be transferred from his account to A’s credit, and this is done by C. Afterwards, and before A knows of the transfer, C fails. There has been a good payment by B.\n(b) A and B are mutually indebted. A and B settle an account by setting off one item against another, and B pays A the balance found to be due from him upon such settlement. This amounts to a payment by A and B, respectively, of the sums which they owed to each other.\n(c) A owes B 2,000 rupees. B accepts some of A’s goods in reduction of the debt. The delivery of goods operates as a part payment.\n(d) A desires B, who owes him Rs. 100, to send him a note for Rs. 100 by post. The debt is discharged as soon as B puts into the post a letter containing the note duly addressed to A."
    },
    {
        "section": "Section 51",
        "sectionNo": "51",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Promisor not bound to perform, unless reciprocal promisee ready and willing to perform",
        "description": "Performance of reciprocal promises\n51. Promisor not bound to perform, unless reciprocal promisee ready and willing to perform.—When a contract consists of reciprocal promises to be simultaneously performed, no promisor need perform his promise unless the promisee is ready and willing to perform his reciprocal promise.\nIllustrations\n(a) A and B contract that A shall deliver goods to B to be paid for by B on delivery.\nA need not deliver the goods, unless B is ready and willing to pay for the goods on delivery.\nB need not pay for the goods, unless A is ready and willing to deliver them on payment.\n(b) A and B contract that A shall deliver goods to B at a price to be paid by instalments, the first instalment to be paid on delivery.\nA need not deliver, unless B is ready and willing to pay the first instalment on delivery.\nB need not pay the first instalment, unless A is ready and willing to deliver the goods on payment of the first instalment."
    },
    {
        "section": "Section 52",
        "sectionNo": "52",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Order of performance of reciprocal promises",
        "description": "52. Order of performance of reciprocal promises.—Where the order in which reciprocal promises are to be performed is expressly fixed by the contract, they shall be performed in that order; and where the order is not expressly fixed by the contract, they shall be performed in that order which the nature of the transaction requires.\nIllustrations\n(a) A and B contract that A shall build a house for B at a fixed price. A’s promise to build the house must be performed before B’s promise to pay for it.\n(b) A and B contract that A shall make over his stock-in-trade to B at a fixed price, and B promises to give security for the payment of the money. A’s promise need not be performed until the security is given, for the nature of the transaction requires that A should have security before he delivers up his stock."
    },
    {
        "section": "Section 53",
        "sectionNo": "53",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Liability of party preventing event on which the contract is to take effect",
        "description": "53. Liability of party preventing event on which the contract is to take effect.—When a contract contains reciprocal promises, and one party to the contract prevents the other from performing his promise, the contract becomes voidable at the option of the party so prevented; and he is entitled to compensation 1from the other party for any loss which he may sustain in consequence of the non-performance of the contract.\nIllustration\nA and B contract that B shall execute certain work for A for a thousand rupees. B is ready and willing to execute the work accordingly, but A prevents him from doing so. The contract is voidable at the option of B; and, if he elects to rescind it, he is entitled to recover from A compensation for any loss which he has incurred by its non-performance."
    },
    {
        "section": "Section 54",
        "sectionNo": "54",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of default as to that promise which should be first performed, in contract consisting of reciprocal promises",
        "description": "54. Effect of default as to that promise which should be first performed, in contract consisting of reciprocal promises.—When a contract consists of reciprocal promises, such that one of them cannot be performed, or that its performance cannot be claimed till the other has been performed, and the promisor of the promise last mentioned fails to perform it, such promisor cannot claim the performance of the reciprocal promise, and must make compensation to the other party to the contract for any loss which such other party may sustain by the non-performance of the contract.\nIllustrations\n(a) A hires B’s ship to take in and convey, from Calcutta to the Mauritius, a cargo to be provided by A, B receiving a certain freight for its conveyance. A does not provide any cargo for the ship. A cannot claim the performance of B’s promise, and must make compensation to B for the loss which B sustains by the non-performance of the contract.\n(b) A contracts with B to execute certain builder’s work for a fixed price, B supplying the scaffolding and timber necessary for the work. B refuses to furnish any scaffolding or timber, and the work cannot be executed. A need not execute the work, and B is bound to make compensation to A for any loss caused to him by the non-performance of the contract.\n(c) A contracts with B to deliver to him, at a specified price, certain merchandise on board a ship which cannot arrive for a month, and B engages to pay for the merchandise within a week from the date of the contract. B does not pay within the week. A’s promise to deliver need not be performed, and B must make compensation.\n(d) A promises B to sell him one hundred bales of merchandise, to be delivered next day, and B promises A to pay for them within a month. A does not deliver according to his promise. B’s promise to pay need not be performed, and A must make compensation."
    },
    {
        "section": "Section 55",
        "sectionNo": "55",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of failure to perform at fixed time, in contract in which time is essential. Effect of such failure when time is not essential. Effect of acceptance of performance at time other than that agreed upon.",
        "description": "55. Effect of failure to perform at fixed time, in contract in which time is essential.—When a party to a contract promises to do a certain thing at or before a specified time, or certain things at or before specified times, and fails to do any such thing at or before the specified time, the contract, or so much of it as has not been performed, becomes voidable at the option of the promisee, if the intention of the parties was that time should be of the essence of the contract.\nEffect of such failure when time is not essential.—If it was not the intention of the parties that time should be of the essence of the contract, the contract does not become voidable by the failure to do such thing at or before the specified time; but the promisee is entitled to compensation from the promisor for any loss occasioned to him by such failure.\nEffect of acceptance of performance at time other than that agreed upon.—If, in case of a contract voidable on account of the promisor’s failure to perform his promise at the time agreed, the promisee accepts performance of such promise at any time other than that agreed, the promisee cannot claim compensation for any loss occasioned by the non-performance of the promise at the time agreed, unless, at the time of such acceptance, he gives notice to the promisor of his intention to do so.2\nSTATE AMENDMENT\nUttar Pradesh\nAmendment of section 55.—In section 55 of the Principal Act, in the third paragraph, for the words “unless at the time of such acceptance he gives notice to the promiser of his intention to do so”, the words “where at the time of such acceptance he has waived his right to do so” shall be substituted.”\n[Vide Uttar Pradesh 57 of 1976, s. 26]"
    },
    {
        "section": "Section 56",
        "sectionNo": "56",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Agreement to do impossible act. Contract to do an act afterwards becoming impossible or unlawful. Compensation for loss through non-performance of act known to be impossible or unlawful.",
        "description": "56. Agreement to do impossible act.—An agreement to do an act impossible in itself is void.\nContract to do an act afterwards becoming impossible or unlawful.—A contract to do an act which, after the contract is made, becomes impossible, or, by reason of some event which the promisor could not prevent, unlawful, becomes void when the act becomes impossible or unlawful.1\nCompensation for loss through non-performance of act known to be impossible or unlawful.—Where one person has promised to do something which he knew, or, with reasonable diligence, might have known, and which the promisee did not know, to be impossible or unlawful, such promisor must make compensation to such promisee for any loss which such promisee sustains through the non-performance of the promise.\nIllustrations\n(a) A agrees with B to discover treasure by magic. The agreement is void.\n(b) A and B contract to marry each other. Before the time fixed for the marriage, A goes mad. The contract becomes void.\n(c) A contracts to marry B, being already married to C, and being forbidden by the law to which he is subject to practise polygamy, A must make compensation to B for the loss caused to her by the non-performance of his promise.\n(d) A contracts to take in cargo for B at a foreign port. A’s Government afterwards declares war against the country in which the port is situated. The contract becomes void when war is declared.\n(e) A contracts to act at a theatre for six months in consideration of a sum paid in advance by B. On several occasions A is too ill to act. The contract to act on those occasions becomes void."
    },
    {
        "section": "Section 57",
        "sectionNo": "57",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Reciprocal promise to do things legal, and also other things illegal",
        "description": "57. Reciprocal promise to do things legal, and also other things illegal.—Where persons reciprocally promise, firstly, to do certain things which are legal, and, secondly, under specified circumstances, to do certain other things which are illegal, the first set of promises is a contract, but the second is a void agreement.\nIllustration\nA and B agree that A shall sell B a house for 10,000 rupees, but that, if B uses it as a gambling house, he shall pay A 50,000 rupees for it.\nThe first set of reciprocal promises, namely, to sell the house and to pay 10,000 rupees for it, is a contract.\nThe second set is for an unlawful object, namely, that B may use the house as a gambling house, and is a void agreement."
    },
    {
        "section": "Section 58",
        "sectionNo": "58",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Alternative promise, one branch being illegal",
        "description": "58. Alternative promise, one branch being illegal.—In the case of an alternative promise, one branch of which is legal and the other illegal, the legal branch alone can be enforced.\nIllustration\nA and B agree that A shall pay B 1,000 rupees, for which B shall afterwards deliver to A either rice or smuggled opium.\nThis is a valid contract to deliver rice, and a void agreement as to the opium."
    },
    {
        "section": "Section 59",
        "sectionNo": "59",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Application of payment where debt to be discharged is indicated",
        "description": "Appropriation of payments\n59. Application of payment where debt to be discharged is indicated.—Where a debtor, owing several distinct debts to one person, makes a payment to him, either with express intimation, or under circumstances implying, that the payment is to be applied to the discharge of some particular debt, the payment, if accepted, must be applied accordingly.\nIllustrations\n(a) A owes B, among other debts, 1,000 rupees upon a promissory note which falls due on the first June. He owes B no other debt of that amount. On the first June, A pays to B 1,000 rupees. The payment is to be applied to the discharge of the promissory note.\n(b) A owes to B, among other debts, the sum of 567 rupees. B writes to A and demands payment of this sum. A sends to B 567 rupees. This payment is to be applied to the discharge of the debt of which B had demanded payment."
    },
    {
        "section": "Section 60",
        "sectionNo": "60",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Application of payment where debt to be discharged is not indicated",
        "description": "60. Application of payment where debt to be discharged is not indicated.—Where the debtor has omitted to intimate and there are no other circumstances indicating to which debt the payment is to be applied, the creditor may apply it at his discretion to any lawful debt actually due and payable to him from the debtor, whether its recovery is or is not barred by the law in force for the time being as to the limitation of suits."
    },
    {
        "section": "Section 61",
        "sectionNo": "61",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Application of payment where neither party appropriates",
        "description": "61. Application of payment where neither party appropriates.—Where neither party makes any appropriation, the payment shall be applied in discharge of the debts in order of time, whether they are or are not barred by the law in force for the time being as to the limitation of suits. If the debts are of equal standing, the payment shall be applied in discharge of each proportionably."
    },
    {
        "section": "Section 62",
        "sectionNo": "62",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of novation, rescission, and alteration of contract",
        "description": "Contracts which need not be performed\n62. Effect of novation, rescission, and alteration of contract.—If the parties to a contract agree to substitute a new contract for it, or to rescind or alter it, the original contract, need not be performed.\nIllustrations\n(a) A owes money to B under a contract. It is agreed between A, B and C that B shall thenceforth accept C as his debtor, instead of A. The old debt of A to B is at an end, and a new debt from C to B has been contracted.\n(b) A owes B 10,000 rupees. A enters into an arrangement with B and gives B a mortgage of his (A’s) estate for 5,000 rupees in place of the debt of 10,000 rupees. This is a new contract and extinguishes the old.\n(c) A owes B 1,000 rupees under a contract. B owes C 1,000 rupees B orders A to credit C with 1,000 rupees in his books, but C does not assent to the arrangement. B still owes C 1,000 rupees, and no new contract has been entered into."
    },
    {
        "section": "Section 63",
        "sectionNo": "63",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Promisee may dispense with or remit performance of promisee",
        "description": "63. Promisee may dispense with or remit performance of promisee.—Every promisee may dispense with or remit, wholly or in part, the performance of the promisee made to him, or may extend the time for such performance1,or may accept instead of it any satisfaction which he thinks fit.\nIllustrations\n(a) A promises to paint a picture for B. B afterwards forbids him to do so. A is no longer bound to perform the promise.\n(b) A owes B 5,000 rupees. A pays to B, and B accepts, in satisfaction of the whole debt, 2,000 rupees paid at the time and place at which the 5,000 rupees were payable. The whole debt is discharged.\n(c) A owes B 5,000 rupees. C pays to B 1,000 rupees, and B accepts them, in satisfaction of his claim on A. This payment is a discharge of the whole claim2.\n(d) A owes B, under. a contract, a sum of money, the amount of which has not been ascertained. A, without ascertaining the amount, gives to B, and B, in satisfaction thereof, accepts, the sum of 2,000 rupees. This is a discharge of the whole debt, whatever may be its amount.\n(e) A owes B 2,000 rupees, and is also indebted to other creditors. A makes an arrangement with his creditors, including B, to pay them a 3[composition] of eight annas in the rupee upon their respective demands. Payment to B of 1,000 rupees is a discharge of B’s demand."
    },
    {
        "section": "Section 64",
        "sectionNo": "64",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Consequences of rescission of voidable contract",
        "description": "64. Consequences of rescission of voidable contract.—When a person at whose option a contract is voidable rescinds it, the other party thereto need not perform any promise therein contained in which he is promisor. The party rescinding a voidable contract shall, if he have received any benefit thereunder from another party to such contract, restore such benefit, so far as may be, to the person from whom it was received.4"
    },
    {
        "section": "Section 65",
        "sectionNo": "65",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Obligation of person who has received advantage under void agreement, or contract that becomes void",
        "description": "65. Obligation of person who has received advantage under void agreement, or contract that becomes void.—When an agreement is discovered to be void, or when a contract becomes void, any person who has received any advantage under such agreement or contract is bound to restore it, or to make compensation for it to the person from whom he received it.\nIllustrations\n(a) A pays B 1,000 rupees in consideration of B’s promising to marry C, A’s daughter. C is dead at the time of the promise. The agreement is void, but B must repay A the 1,000 rupees.\n(b) A contracts with B to deliver to him 250 maunds of rice before the first of May. A delivers 130 maunds only before that day, and none after. B retains the 130 maunds after the first of May. He is bound to pay A for them.\n(c) A, a singer, contracts with B, the manager of a theatre, to sing at his theatre for two nights in every week during the next two months, and B engages to pay her a hundred rupees for each night’s performance. On the sixth night, A wilfully absents herself from the theatre, and B, in consequence, rescinds the contract. B must pay A for the five nights on which she had sung.\n(d) A contracts to sing for B at a concert for 1,000 rupees, which are paid in advance. A is too ill to sing. A is not bound to make compensation to B for the loss of the profits which B would have made if A had been able to sing, but must refund to B the 1,000 rupees paid in advance."
    },
    {
        "section": "Section 66",
        "sectionNo": "66",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Mode of communicating or revoking rescission of voidable contract",
        "description": "66. Mode of communicating or revoking rescission of voidable contract.—The rescission of a voidable contract may be communicated or revoked in the same manner, and subject to the same rules, as apply to the communication or revocation of a proposal1."
    },
    {
        "section": "Section 67",
        "sectionNo": "67",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "OF THE PERFORMANCE OF CONTRACTS",
        "title": "Effect of neglect of promisee to afford promisor reasonable facilities for performance",
        "description": "67. Effect of neglect of promisee to afford promisor reasonable facilities for performance.—If any promisee neglects or refuses to afford the promisor reasonable facilities for the performance of his promise, the promisor is excused by such neglect or refusal as to any non-performance caused thereby.\nIllustration\nA contracts with B to repair B’s house.\nB neglects or refuses to point out to A the places in which his house requires repair.\nA is excused for the non-performance of the contract if it is caused by such neglector refusal."
    },

    # =========================================================
    # CHAPTER V: OF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT
    # =========================================================
    {
        "section": "Section 68",
        "sectionNo": "68",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "OF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT",
        "title": "Claim for necessaries supplied to person incapable of contracting, or on his account",
        "description": "CHAPTER V\nOF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT\n68. Claim for necessaries supplied to person incapable of contracting, or on his account.—If a person, incapable of entering into a contract, or any one whom he is legally bound to support, is supplied by another person with necessaries suited to his condition in life, the person who has furnished such supplies is entitled to be reimbursed from the property of such incapable person.2\nIllustrations\n(a) A supplies B, a lunatic, with necessaries suitable to his condition in life. A is entitled to be reimbursed from B’s property.\n(b) A supplies the wife and children of B, a lunatic, with necessaries suitable to their condition in life. A is entitled to be reimbursed from B’s property."
    },
    {
        "section": "Section 69",
        "sectionNo": "69",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "OF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT",
        "title": "Reimbursement of person paying money due by another, in payment of which he is interested",
        "description": "69. Reimbursement of person paying money due by another, in payment of which he is interested.—A person who is interested in the payment of money which another is bound by law to pay, and who therefore pays it, is entitled to be reimbursed by the other.\nIllustration\nB holds land in Bengal, on a lease granted by A, the zamindar. The revenue payable by A to the Government being in arrear, his land is advertised for sale by the Government. Under the revenue law, the consequence of such sale will be the annulment of B’s lease. B, to prevent the sale and the consequent annulment of his own lease, pays to the Government the sum due from A. A is bound to make good to B the amount so paid."
    },
    {
        "section": "Section 70",
        "sectionNo": "70",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "OF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT",
        "title": "Obligation of person enjoying benefit of non-gratuitous act",
        "description": "70. Obligation of person enjoying benefit of non-gratuitous act.—Where a person lawfully does anything for another person, or delivers anything to him, not intending to do so gratuitously, and such other person enjoys the benefit thereof, the latter is bound to make compensation to the former in respect of, or to restore, the thing so done or delivered1.\nIllustrations\n(a) A, a tradesman, leaves goods at B’s house by mistake. B treats the goods as his own. He is bound to pay A for them.\n(b) A saves B’s property from fire. A is not entitled to compensation from B, if the circumstances show that he intended to act gratuitously."
    },
    {
        "section": "Section 71",
        "sectionNo": "71",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "OF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT",
        "title": "Responsibility of finder of goods",
        "description": "71. Responsibility of finder of goods.—A person who finds goods belonging to another, and takes them into his custody, is subject to the same responsibility as a bailee2."
    },
    {
        "section": "Section 72",
        "sectionNo": "72",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "OF CERTAIN RELATIONS RESEMBLING THOSE CREATED BY CONTRACT",
        "title": "Liability of person to whom money is paid, or thing delivered, by mistake or under coercion",
        "description": "72. Liability of person to whom money is paid, or thing delivered, by mistake or under coercion.—A person to whom money has been paid, or anything delivered, by mistake or under coercion, must repay or return it.\nIllustrations\n(a) A and B jointly owe 100 rupees to C, A alone pays the amount to C, and B, not knowing this fact, pays 100 rupees over again to C. C is bound to repay the amount to B.\n(b) A railway company refuses to deliver up certain goods to the consignee, except upon the payment of an illegal charge for carriage. The consignee pays the sum charged in order to obtain the goods. He is entitled to recover so much of the charge as was illegally excessive."
    },

    # =========================================================
    # CHAPTER VI: OF THE CONSEQUENCES OF BREACH OF CONTRACT
    # =========================================================
    {
        "section": "Section 73",
        "sectionNo": "73",
        "chapterNo": 7,
        "chapterRoman": "VI",
        "chapterName": "OF THE CONSEQUENCES OF BREACH OF CONTRACT",
        "title": "Compensation for loss or damage caused by breach of contract. Compensation for failure to discharge obligation resembling those created by contract.",
        "description": "CHAPTER VI\nOF THE CONSEQUENCES OF BREACH OF CONTRACT\n73. Compensation for loss or damage caused by breach of contract.—When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.\nSuch compensation is not to be given for any remote and indirect loss or damage sustained by reason of the breach.\nCompensation for failure to discharge obligation resembling those created by contract.—When an obligation resembling those created by contract has been incurred and has not been discharged, any person injured by the failure to discharge it is entitled to receive the same compensation from the party in default, as if such person had contracted to discharge it and had broken his contract.\nExplanation.—In estimating the loss or damage arising from a breach of contract, the means which existed of remedying the inconvenience caused by the non-performance of the contract must be taken into account.\nIllustrations\n(a) A contracts to sell and deliver 50 maunds of saltpetre to B, at a certain price to be paid on delivery. A breaks his promise. B is entitled to receive from A, by way of compensation, the sum, if any, by which the contract price falls short of the price for which B might have obtained 50 maunds of saltpetre of like quality at the time when the saltpetre ought to have been delivered.\n(b) A hires B’s ship to go to Bombay, and there take on board, on the first of January, a cargo, which A is to provide, and to bring it to Calcutta, the freight to be paid when earned. B’s ship does not go to Bombay, but A has opportunities of procuring suitable conveyance for the cargo upon terms as advantageous as those on which he had chartered the ship. A avails himself of those opportunities, but is put to trouble and expense in doing so. A is entitled to receive compensation from B in respect of such trouble and expense.\n(c) A contracts to buy of B, at a stated price, 50 maunds of rice, no time being fixed for delivery. A afterwards informs B that he will not accept the rice if tendered to him. B is entitled to receive from A, by way of compensation, the amount, if any, by which the contract price exceeds that which B can obtain for the rice at the time when A informs B that he will not accept it.\n(d) A contracts to buy B’s ship for 60,000 rupees, but breaks his promise. A must pay to B, by way of compensation, the excess, if any, of the contract price over the price which B can obtain for the ship at the time of the breach of promise.\n(e) A, the owner of a boat, contracts with B to take a cargo of jute to Mirzapur, for sale at that place, starting on a specified day. The boat, owing to some avoidable cause, does not start at the time appointed, whereby the arrival of the cargo at Mirzapur is delayed beyond the time when it would have arrived if the boat had sailed according to the contract. After that date, and before the arrival of the cargo, the price of jute falls. The measure of the compensation payable to B by A is the difference between the price which B could have obtained for the cargo at Mirzapur at the time when it would have arrived if forwarded in due course, and its market price at the time when it actually arrived.\n(f) A contracts to repair B’s house in a certain manner, and receives payment in advance. A repairs the house, but not according to contract. B is entitled to recover from A the cost of making the repairs conform to the contract.\n(g) A contracts to let his ship to B for a year, from the first of January, for a certain price. Freights rise, and, on the first of January, the hire obtainable for the ship is higher than the contract price. A breaks his promise. He must pay to B, by way of compensation, a sum equal to the difference between the contract price and the price for which B could hire a similar ship for a year on and from the first of January.\n(h) A contracts to supply B with a certain quantity of iron at a fixed price, being a higher price than that for which A could procure and deliver the iron. B wrongfully refuses to receive the iron. B must pay to A, by way of compensation, the difference between the contract price of the iron and the sum for which A could have obtained and delivered it.\n(i) A delivers to B, a common carrier, a machine, to be conveyed, without delay, to A’s mill informing B that his mill is stopped for want of the machine. B unreasonably delays the delivery of the machine, and A, in consequence, loses a profitable contract with the Government. A is entitled to receive from B, by way of compensation, the average amount of profit which would have been made by the working of the mill during the time that delivery of it was delayed, but not the loss sustained through the loss of the Government contract.\n(j) A, having contracted with B to supply B with 1,000 tons of iron at 100 rupees a ton, to be delivered at a stated time, contracts with C for the purchase of 1,000 tons of iron at 80 rupees a ton, telling C that he does so for the purpose of performing his contract with B. C fails to perform his contract with A, who cannot procure other iron, and B, in consequence, rescinds the contract. C must pay to A 20,000 rupees, being the profit which A would have made by the performance of his contract with B.\n(k) A contracts with B to make and deliver to B, by a fixed day, for a specified price, a certain piece of machinery. A does not deliver the piece of machinery at the time specified, and in consequence of this, B is obliged to procure another at a higher price than that which he was to have paid to A, and is prevented from performing a contract which B had made with a third person at the time of his contract with A (but which had not been then communicated to A), and is compelled to make compensation for breach of that contract. A must pay to B, by way of compensation, the difference between the contract price of the piece of machinery and the sum paid by B for another, but not the sum paid by B to the third person by way of compensation.\n(l) A, a builder, contracts to erect and finish a house by the first of January, in order that B may give possession of it at that time to C, to whom B has contracted to let it. A is informed of the contract between B and C. A builds the house so badly that, before the first of January, it falls down and has to be re-built by B, who, in consequence, loses the rent which he was to have received from C, and is obliged to make compensation to C for the breach of his contract. A must make compensation to B for the cost of rebuilding the house, for the rent lost, and for the compensation made to C.\n(m) A sells certain merchandise to B, warranting it to be of a particular quality, and B, in reliance upon this warranty, sells it to C with a similar warranty. The goods prove to be not according to the warranty, and B becomes liable to pay C a sum of money by way of compensation. B is entitled to be reimbursed this sum by A.\n(n) A contracts to pay a sum of money to B on a day specified. A does not pay the money on that day, B, in consequence of not receiving the money on that day, is unable to pay his debts, and is totally ruined. A is not liable to make good to B anything except the principal sum he contracted to pay, together with interest up to the day of payment.\n(o) A contracts to deliver 50 maunds of saltpetre to B on the first of January, at a certain price. B afterwards, before the first of January, contracts to sell the saltpetre to C at a price higher than the market price of the first of January. A breaks his promise. In estimating the compensation payable by A to B, the market price of the first of January, and not the profit which would have arisen to B from the sale to C, is to be taken into account.\n(p) A contracts to sell and deliver 500 bales of cotton to B on a fixed day. A knows nothing of B’s mode of conducting his business. A breaks his promise, and B, having no cotton, is obliged to close his mill. A is not responsible to B for the loss caused to B by the closing of the mill.\n(q) A contracts to sell and deliver to B, on the first of January, certain cloth which B intends to manufacture into caps of a particular kind, for which there is no demand, except at that season. The cloth is not delivered till after the appointed time, and too late to be used that year in making caps. B is entitled to receive from A, by way of compensation, the difference between the contract price of the cloth and its market price at the time of delivery, but not the profits which he expected to obtain by making caps, nor the expenses which he has been put to in making preparation for the manufacture.\n(r) A, a ship-owner, contracts with B to convey him from Calcutta to Sydney in A’s ship, sailing on the first of January, and B pays to A, by way of deposit, one-half of his passage-money. The ship does not sail on the first of January, and B, after being in consequence detained in Calcutta for some time and thereby put to some expense, proceeds to Sydney in another vessel, and, in consequence, arriving too late in Sydney, loses a sum of money. A is liable to repay to B his deposit, with interest, and the expense to which he is put by his detention in Calcutta, and the excess, if any, of the passage-money paid for the second ship over that agreed upon for the first, but not the sum of money which B lost by arriving in Sydney too late."
    },
    {
        "section": "Section 74",
        "sectionNo": "74",
        "chapterNo": 7,
        "chapterRoman": "VI",
        "chapterName": "OF THE CONSEQUENCES OF BREACH OF CONTRACT",
        "title": "Compensation for breach of contract where penalty stipulated for",
        "description": "74. Compensation for breach of contract where penalty stipulated for.—1[When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.\nExplanation.—A stipulation for increased interest from the date of default may be a stipulation by way of penalty.]\nException.—When any person enters into any bail-bond, recognizance or other instrument of the same nature, or, under the provisions of any law, or under the orders of the 2[Central Government] or of any 3[State Government], gives any bond for the performance of any public duty or act in which the public are interested, he shall be liable, upon breach of the condition of any such instrument, to pay the whole sum mentioned therein.\nExplanation.—A person who enters into a contract with Government does not necessarily thereby undertake any public duty, or promise to do an act in which the public are interested.\nIllustrations\n(a) A contracts with B to pay B Rs. 1,000, if he fails to pay B Rs. 500 on a given day. A fails to pay B Rs. 500 on that day. B is entitled to recover from A such compensation, not exceeding Rs. 1,000, as the Court considers reasonable.\n(b) A contracts with B that, if A practises as a surgeon within Calcutta, he will pay B Rs. 5,000. A practises as a surgeon in Calcutta. B is entitled to such compensation; not exceeding Rs. 5,000, as the Court considers reasonable.\n(c) A gives a recognizance binding him in a penalty of Rs. 500 to appear in Court on a certain day. He forfeits his recognizance. He is liable to pay the whole penalty.\n1[(d) A gives B a bond for the repayment of Rs. 1,000 with interest at 12 per cent. at the end of six months, with a stipulation that, in case of default, interest shall be payable at the rate of 75 per cent. from the date of default. This is a stipulation by way of penalty, and B is only entitled to recover from A such compensation as the Court considers reasonable.\n(e) A, who owes money to B a money-lender, undertakes to repay him by delivering to him 10 maunds of grain on a certain date, and stipulates that, in the event of his not delivering the stipulated amount by the stipulated date, he shall be liable to deliver 20 maunds. This is a stipulation by way of penalty, and B is only entitled to reasonable compensation in case of breach.\n(f) A undertakes to repay B a loan of Rs. 1,000 by five equal monthly instalments, with a stipulation that in default of payment of any instalment, the whole shall become due. This stipulation is not by way of penalty, and the contract may be enforced according to its terms.\n(g) A borrows Rs. 100 from B and gives him a bond for Rs. 200 payable by five yearly instalments of Rs. 40, with a stipulation that, in default of payment of any instalment, the whole shall become due. This is a stipulation by way of penalty.]"
    },
    {
        "section": "Section 75",
        "sectionNo": "75",
        "chapterNo": 7,
        "chapterRoman": "VI",
        "chapterName": "OF THE CONSEQUENCES OF BREACH OF CONTRACT",
        "title": "Party rightfully rescinding contract, entitled to compensation",
        "description": "75. Party rightfully rescinding contract, entitled to compensation.—A person who rightfully rescinds a contract is entitled to compensation for any damage which he has sustained through the non-fulfilment of the contract.\nIllustration\nA, a singer, contracts with B, the manager of a theatre, to sing at his theatre for two nights in every week during the next two months, and B engages to pay her 100 rupees for each night’s performance. On the sixth night, A wilfully absents herself from the theatre, and B, in consequence, rescinds the contract. B is entitled to claim compensation for the damage which he has sustained through the non-fulfilment of the contract."
    },

    # =========================================================
    # CHAPTER VII: SALE OF GOODS [Repealed]
    # =========================================================
    {
        "section": "Section 76",
        "sectionNo": "76",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[‘Goods’ defined.]",
        "description": "[CHAPTER VII.—SALES OF GOODS.] Rep.by the Indian Sale of Goods Act, 1930 (3 of 1930), s. 65.\n76. [‘Goods’ defined.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 77",
        "sectionNo": "77",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[‘Sale’ defined.]",
        "description": "77. [‘Sale’ defined.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 78",
        "sectionNo": "78",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Sale how effected.]",
        "description": "78. [Sale how effected.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 79",
        "sectionNo": "79",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Transfer of ownership of thing sold, which has yet to be ascertained, made or finished.]",
        "description": "79. [Transfer of ownership of thing sold, which has yet to be ascertained, made or finished.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 80",
        "sectionNo": "80",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Completion of sale of goods which the seller is to put into state in which buyer is to take them.]",
        "description": "80. [Completion of sale of goods which the seller is to put into state in which buyer is to take them.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 81",
        "sectionNo": "81",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Completion of sale of goods, when seller has to do anything thereto in order to ascertain price.]",
        "description": "81. [Completion of sale of goods, when seller has to do anything thereto in order to ascertain price.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 82",
        "sectionNo": "82",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Completion of sale, when goods are unascertained at date of contract.]",
        "description": "82. [Completion of sale, when goods are unascertained at date of contract.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 83",
        "sectionNo": "83",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Ascertainment of goods by subsequent appropriation.]",
        "description": "83. [Ascertainment of goods by subsequent appropriation.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 84",
        "sectionNo": "84",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Ascertainment of goods by seller’s selection.]",
        "description": "84. [Ascertainment of goods by seller’s selection.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 85",
        "sectionNo": "85",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Transfer of ownership of moveable property, when sold together with immoveable.]",
        "description": "85. [Transfer of ownership of moveable property, when sold together with immoveable.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 86",
        "sectionNo": "86",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Buyer to bear loss after goods have become his property.]",
        "description": "86. [Buyer to bear loss after goods have become his property.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 87",
        "sectionNo": "87",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Transfer of ownership of goods agreed to be sold while non existent.]",
        "description": "87. [Transfer of ownership of goods agreed to be sold while non existent.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 88",
        "sectionNo": "88",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Contract to sell and deliver, at a future day, goods not in seller’s possession at date of contract.]",
        "description": "88. [Contract to sell and deliver, at a future day, goods not in seller’s possession at date of contract.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 89",
        "sectionNo": "89",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Determination of price not fixed by contract.]",
        "description": "89. [Determination of price not fixed by contract.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 90",
        "sectionNo": "90",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Delivery how made.]",
        "description": "[DELIVERY.] Rep. by s. 65, ibid.\n90. [Delivery how made.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 91",
        "sectionNo": "91",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Effect of delivery to wharfinger or carrier.]",
        "description": "91. [Effect of delivery to wharfinger or carrier.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 92",
        "sectionNo": "92",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Effect of part-delivery.]",
        "description": "92. [Effect of part-delivery.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 93",
        "sectionNo": "93",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Seller not bound to deliver until buyer applies for delivery.]",
        "description": "93. [Seller not bound to deliver until buyer applies for delivery.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 94",
        "sectionNo": "94",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Place of delivery.]",
        "description": "94. [Place of delivery.] Rep. by the Indian Sale of Goods Act, 1930 (3 of 1930), s. 65."
    },
    {
        "section": "Section 95",
        "sectionNo": "95",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Seller’s lien.]",
        "description": "[SELLER’S LIEN.] Rep. by s. 65, ibid.\n95. [Seller’s lien.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 96",
        "sectionNo": "96",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Lien where payment to be made at a future day, but no time fixed for delivery.]",
        "description": "96. [Lien where payment to be made at a future day, but no time fixed for delivery.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 97",
        "sectionNo": "97",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Seller’s lien where payment to be made at future day, and buyer allows goods to remain in seller’s possession.]",
        "description": "97. [Seller’s lien where payment to be made at future day, and buyer allows goods to remain in seller’s possession.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 98",
        "sectionNo": "98",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Seller’s lien against subsequent buyer.]",
        "description": "98. [Seller’s lien against subsequent buyer.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 99",
        "sectionNo": "99",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Power of seller to stop in transit.]",
        "description": "[STOPPAGE IN TRANSIT.] Rep. by s. 65, ibid.\n99. [Power of seller to stop in transit.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 100",
        "sectionNo": "100",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[When goods are to be deemed in transit.]",
        "description": "100. [When goods are to be deemed in transit.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 101",
        "sectionNo": "101",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Continuance of right of stoppage.]",
        "description": "101. [Continuance of right of stoppage.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 102",
        "sectionNo": "102",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Cessation of right on assignment, by buyer, of document showing title.]",
        "description": "102. [Cessation of right on assignment, by buyer, of document showing title.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 103",
        "sectionNo": "103",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[How seller may stop where instrument of title assigned to secure specific advance.]",
        "description": "103. [How seller may stop where instrument of title assigned to secure specific advance.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 104",
        "sectionNo": "104",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Stoppage how effected.]",
        "description": "104. [Stoppage how effected.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 105",
        "sectionNo": "105",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Notice of seller’s claim.]",
        "description": "105. [Notice of seller’s claim.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 106",
        "sectionNo": "106",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Right of seller on stoppage.]",
        "description": "106. [Right of seller on stoppage.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 107",
        "sectionNo": "107",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Resale on buyer’s failure to perform.]",
        "description": "[RESALE.] Rep. by s. 65, ibid.\n107. [Resale on buyer’s failure to perform.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 108",
        "sectionNo": "108",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Title conveyed by seller of goods to buyer.]",
        "description": "[TITLE.] Rep. by s. 65, ibid.\n108. [Title conveyed by seller of goods to buyer.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 109",
        "sectionNo": "109",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Seller’s responsibility for badness of title.]",
        "description": "[WARRANTY.] Rep. by s. 65, ibid.\n109. [Seller’s responsibility for badness of title.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 110",
        "sectionNo": "110",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Establishment of implied warranty of goodness or quality.]",
        "description": "110. [Establishment of implied warranty of goodness or quality.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 111",
        "sectionNo": "111",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Warranty of soundness implied on sale of provisions.]",
        "description": "111. [Warranty of soundness implied on sale of provisions.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 112",
        "sectionNo": "112",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Warranty of bulk implied on sale of goods by sample.]",
        "description": "112. [Warranty of bulk implied on sale of goods by sample.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 113",
        "sectionNo": "113",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Warranty implied where goods are sold as being of a certain denomination.]",
        "description": "113. [Warranty implied where goods are sold as being of a certain denomination.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 114",
        "sectionNo": "114",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Warranty where goods ordered for a specified purpose.]",
        "description": "114. [Warranty where goods ordered for a specified purpose.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 115",
        "sectionNo": "115",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Warranty on sale of article of well known ascertained kind.]",
        "description": "115. [Warranty on sale of article of well known ascertained kind.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 116",
        "sectionNo": "116",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Seller when not responsible for latent defects.]",
        "description": "116. [Seller when not responsible for latent defects.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 117",
        "sectionNo": "117",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Buyer’s right on breach of warranty.]",
        "description": "117. [Buyer’s right on breach of warranty.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 118",
        "sectionNo": "118",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Right of buyer on breach of warranty in respect of goods not ascertained.]",
        "description": "118. [Right of buyer on breach of warranty in respect of goods not ascertained.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 119",
        "sectionNo": "119",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[When buyer may refuse to accept, if goods not ordered are sent with goods ordered.]",
        "description": "[MISCELLANEOUS.] Rep. by s. 65, ibid.\n119. [When buyer may refuse to accept, if goods not ordered are sent with goods ordered.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 120",
        "sectionNo": "120",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Effect of wrongful refusal to accept.]",
        "description": "120. [Effect of wrongful refusal to accept.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 121",
        "sectionNo": "121",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Right of seller as to rescission, on failure of buyer to pay price at time fixed.]",
        "description": "121. [Right of seller as to rescission, on failure of buyer to pay price at time fixed.] Rep. by the Indian Sale of Goods Act, 1930 (3 of 1930), s. 65."
    },
    {
        "section": "Section 122",
        "sectionNo": "122",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Sale and transfer of lots sold by auction.]",
        "description": "122. [Sale and transfer of lots sold by auction.] Rep. by s. 65, ibid."
    },
    {
        "section": "Section 123",
        "sectionNo": "123",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "SALE OF GOODS [Repealed.]",
        "title": "[Effect of use, by seller, of pretended biddings to raise price.]",
        "description": "123. [Effect of use, by seller, of pretended biddings to raise price.] Rep. by s. 65, ibid."
    },

    # =========================================================
    # CHAPTER VIII: OF INDEMNITY AND GUARANTEE
    # =========================================================
    {
        "section": "Section 124",
        "sectionNo": "124",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "“Contract of indemnity” defined",
        "description": "CHAPTER VIII\nOF INDEMNITY AND GUARANTEE\n124. “Contract of indemnity” defined.—A contract by which one party promises to save the other from loss caused to him by the conduct of the promisor himself, or by the conduct of any other person, is called a “contract of indemnity”.\nIllustration\nA contracts to indemnify B against the consequences of any proceedings which C may take against B in respect of a certain sum of 200 rupees. This is a contract of indemnity."
    },
    {
        "section": "Section 125",
        "sectionNo": "125",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Rights of indemnity-holder when sued",
        "description": "125. Rights of indemnity-holder when sued.—The promisee in a contract of indemnity, acting within the scope of his authority, is entitled to recover from the promisor—\n(1) all damages which he may be compelled to pay in any suit in respect of any matter to which the promise to indemnify applies;\n(2) all costs which he may be compelled to pay in any such suit if, in bringing or defending it, he did not contravene the orders of the promisor, and acted as it would have been prudent for him to act in the absence of any contract of indemnity, or if the promisor authorized him to bring or defend the suit;\n(3) all sums which he may have paid under the terms of any compromise of any such suit, if the compromise was not contrary to the orders of the promisor, and was one which it would have been prudent for the promisee to make in the absence of any contract of indemnity, or if the promisor authorized him to compromise the suit."
    },
    {
        "section": "Section 126",
        "sectionNo": "126",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "“Contract of guarantee”, “surety”, “principal debtor” and “creditor”",
        "description": "126. “Contract of guarantee”, “surety”, “principal debtor” and “creditor”.—A “contract of guarantee” is a contract to perform the promise, or discharge the liability, of a third person in case of his default. The person who gives the guarantee is called the “surety”; the person in respect of whose default the guarantee is given is called the “principal debtor”, and the person to whom the guarantee is given is called the “creditor”. A guarantee may be either oral or written."
    },
    {
        "section": "Section 127",
        "sectionNo": "127",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Consideration for guarantee",
        "description": "127. Consideration for guarantee.—Anything done, or any promise made, for the benefit of the principal debtor, may be a sufficient consideration to the surety for giving the guarantee.\nIllustrations\n(a) B requests A to sell and deliver to him goods on credit. A agrees to do so, provided C will guarantee the payment of the price of the goods. C promises to guarantee the payment in consideration of A’s promise to deliver the goods. This is a sufficient consideration for C’s promise.\n(b) A sells and delivers goods to B. C afterwards requests A to forbear to sue B for the debt for a year, and promises that, if he does so, C will pay for them in default of payment by B. A agrees to forbear as requested. This is a sufficient consideration for C’s promise.\n(c) A sells and delivers goods to B. C afterwards, without consideration, agrees to pay for them in default of B. The agreement is void."
    },
    {
        "section": "Section 128",
        "sectionNo": "128",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Surety’s liability",
        "description": "128. Surety’s liability.—The liability of the surety is co-extensive with that of the principal debtor, unless it is otherwise provided by the contract.\nIllustration\nA guarantees to B the payment of a bill of exchange by C, the acceptor. The bill is dishonoured by C. A is liable, not only for the amount of the bill, but also for any interest and charges which may have become due on it."
    },
    {
        "section": "Section 129",
        "sectionNo": "129",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "“Continuing guarantee”",
        "description": "129. “Continuing guarantee”.—A guarantee which extends to a series of transactions, is called a “continuing guarantee”.\nIllustrations\n(a) A, in consideration that B will employ C in collecting the rent of B’s zamindari, promises B to be responsible, to the amount of 5,000 rupees, for the due collection and payment by C of those rents. This is a continuing guarantee.\n(b) A guarantees payment to B, a tea-dealer, to the amount of £100, for any tea he may from time to time supply to C. B supplies C with tea to above the value of £100, and C pays B for it. Afterwards, B supplies C with tea to the value of £200. C fails to pay. The guarantee given by A was a continuing guarantee, and he is accordingly liable to B to the extent of £100.\n(c) A guarantees payment to B of the price of five sacks of flour to be delivered by B to C and to be paid for in a month. B delivers five sacks to C. C pays for them. Afterwards B delivers four sacks to C, which C does riot pay for. The guarantee given by A was not a continuing guarantee, and accordingly he is not liable for the price of the four sacks."
    },
    {
        "section": "Section 130",
        "sectionNo": "130",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Revocation of continuing guarantee",
        "description": "130. Revocation of continuing guarantee.—A continuing guarantee may at any time be revoked by the surety, as to future transactions, by notice to the creditor.\nIllustrations\n(a) A, in consideration of B’s discounting, at A’s request, bills of exchange for C, guarantees to B, for twelve months, the due payment of all such bills to the extent of 5,000 rupees. B discounts bills for C to the extent of 2,000 rupees. Afterwards, at the end of three months, A revokes the guarantee. This revocation discharges A from all liability to B for any subsequent discount. But A is liable to B for the 2,000 rupees, on default of C.\n(b) A guarantees to B, to the extent of 10,000 rupees, that C shall pay all the bills that B shall draw upon him. B draws upon C. C accepts the bill. A gives notice of revocation. C dishonours the bill at maturity. A is liable upon his guarantee."
    },
    {
        "section": "Section 131",
        "sectionNo": "131",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Revocation of continuing guarantee by surety’s death",
        "description": "131. Revocation of continuing guarantee by surety’s death.—The death of the surety operates, in the absence of any contract to the contrary, as a revocation of a continuing guarantee, so far as regards future transactions."
    },
    {
        "section": "Section 132",
        "sectionNo": "132",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Liability of two persons, primarily liable, not affected by arrangement between them that one shall be surety on other’s default",
        "description": "132. Liability of two persons, primarily liable, not affected by arrangement between them that one shall be surety on other’s default.—Where two persons contract with a third person to undertake a certain liability, and also contract with each other that one of them shall be liable only on the default of the other, the third person not being a party to such contract, the liability of each of such two persons to the third person under the first contract is not affected by the existence of the second contract, although such third person may have been aware of its existence.\nIllustration\nA and B make a joint and several promissory note to C. A makes it, in fact, as surety for B, and C knows this at the time when the note is made. The fact that A, to the knowledge of C, made the note as surety for B, is no answer to a suit by C against A upon the note."
    },
    {
        "section": "Section 133",
        "sectionNo": "133",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Discharge of surety by variance in terms of contract",
        "description": "133. Discharge of surety by variance in terms of contract.—Any variance, made without the surety’s consent, in the terms of the contract between the principal 1[debtor] and the creditor, discharges the surety as to transactions subsequent to the variance.\nIllustrations\n(a) A becomes surety to C for B’s conduct as a manager in C’s bank. Afterwards, B and C contract, without A’s consent, that B’s salary shall be raised, and that he shall become liable for one-fourth of the losses on overdrafts. B allows a customer to overdraw, and the bank loses a sum of money. A is discharged from his suretyship by the variance made without his consent, and is not liable to make good this loss.\n(b) A guarantees C against the misconduct of B in an office to which B is appointed by C, and of which the duties are defined by an Act of the Legislature. By a subsequent Act, the nature of the office is materially altered. Afterwards, B misconducts himself. A is discharged by the change from future liability under his guarantee, though the misconduct of B is in respect of a duty not affected by the later Act.\n(c) C agrees to appoint B as his clerk to sell goods at a yearly salary, upon A’s becoming surety to C for B’s duly accounting for moneys received by him as such clerk. Afterwards, without A’s knowledge or consent, C and B agree that B should be paid by a commission on the goods sold by him and not by a fixed salary. A is not liable for subsequent misconduct of B.\n(d) A gives to C a continuing guarantee to the extent of 3,000 rupees for any oil supplied by C to B on credit. Afterwards B becomes embarrassed, and, without the knowledge of A, B and C contract that C shall continue to supply B with oil for ready money, and that the payments shall be applied to the then, existing debts between B and C. A is not liable on his guarantee for any goods supplied after: this new arrangement.\n(e) C contracts to lend B 5,000 rupees on the 1st March. A guarantees repayment. C pays the 5,000 rupees to B on the 1st January. A is discharged from his liability, as the contract has been varied, inasmuch as C might sue B for the money before the 1st of March."
    },
    {
        "section": "Section 134",
        "sectionNo": "134",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Discharge of surety by release or discharge of principal debtor",
        "description": "134. Discharge of surety by release or discharge of principal debtor.—The surety is discharged by any contract between the creditor and the principal debtor, by which the principal debtor is released, or by any act or omission of the creditor, the legal consequence of which is the discharge of the principal debtor.\nIllustrations\n(a) A gives a guarantee to C for goods to be supplied by C to B. C supplies goods to B, and afterwards B becomes embarrassed and contracts with his creditors (including C) to assign to them his property in consideration of their releasing him from their demands. Here B is released from his debt by the contract with C, and A is discharged from his suretyship.\n(b) A contracts with B to grow a crop of indigo on A’s land and to deliver it to B at a fixed rate, and C guarantees A’s performance of this contract. B diverts a stream of water which is necessary for the irrigation of A’s land and thereby prevents him from raising the indigo. C is no longer liable on his guarantee.\n(c) A contracts with B for a fixed price to build a house for B within a stipulated time, B supplying the necessary timber. C guarantees A’s performance of the contract. B omits to supply the timber. C is discharged from his suretyship."
    },
    {
        "section": "Section 135",
        "sectionNo": "135",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Discharge of surety when creditor compounds with, gives time to, or agrees not to sue, principal debtor",
        "description": "135. Discharge of surety when creditor compounds with, gives time to, or agrees not to sue, principal debtor.—A contract between the creditor and the principal debtor, by which the creditor makes a composition with, or promises to give time to, or not to sue, the principal debtor, discharges the surety, unless the surety assents to such contract."
    },
    {
        "section": "Section 136",
        "sectionNo": "136",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Surety not discharged when agreement made with third person to give time to principal debtor",
        "description": "136. Surety not discharged when agreement made with third person to give time to principal debtor.—Where a contract to give time to the principal debtor is made by the creditor with a third person, and not with the principal debtor, the surety is not discharged.\nIllustration\nC, the holder of an overdue bill of exchange drawn by A as surety for B, and accepted by B, contracts with M to give time to B. A is not discharged."
    },
    {
        "section": "Section 137",
        "sectionNo": "137",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Creditor’s forbearance to sue does not discharge surety",
        "description": "137. Creditor’s forbearance to sue does not discharge surety.—Mere forbearance on the part of the creditor to sue the principal debtor or to enforce any other remedy against him does not, in the absence of any provision in the guarantee to the contrary, discharge the surety.\nIllustration\nB owes to C a debt guaranteed by A. The debt becomes payable. C does not sue B for a year after the debt has become payable. A is not discharged from his suretyship."
    },
    {
        "section": "Section 138",
        "sectionNo": "138",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Release of one co-surety does not discharge others",
        "description": "138. Release of one co-surety does not discharge others.—Where there are co-sureties, a release by the creditor of one of them does not discharge the others; neither does it free the surety so released from his responsibility to the other sureties1."
    },
    {
        "section": "Section 139",
        "sectionNo": "139",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Discharge of surety by creditor’s act or omission impairing surety’s eventual remedy",
        "description": "139. Discharge of surety by creditor’s act or omission impairing surety’s eventual remedy.—If the creditor does any act which is inconsistent with the rights of the surety, or omits to do any act which his duty to the surety requires him to do, and the eventual remedy of the surety himself against the principal debtor is thereby impaired, the surety is discharged.\nIllustrations\n(a) B contracts to build a ship for C for a given sum, to be paid by instalments as the work reaches certain stages. A becomes surety to C for B’s due performance of the contract. C, without the knowledge of A, prepays to B the last two instalments. A is discharged by this prepayment.\n(b) C lends money to B on the security of a joint and several promissory note made in C’s favour by B, and by A as surety for B, together with a bill of sale of B’s furniture, which gives power to C to sell the furniture, and apply the proceeds in discharge of the note. Subsequently, C sells the furniture, but, owing to his misconduct and wilful negligence, only a small price is realized. A is discharged from liability on the note.\n(c) A puts M as apprentice to B, and gives a guarantee to B for M’s fidelity. B promises on his part that he will, at least once a month, see M make up the cash. B omits to see this done as promised, and M embezzles. A is not liable to B on his guarantee."
    },
    {
        "section": "Section 140",
        "sectionNo": "140",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Rights of surety on payment or performance",
        "description": "140. Rights of surety on payment or performance.—Where a guaranteed debt has become due, or default of the principal debtor to perform a guaranteed duty has taken place, the surety upon payment or performance of all that he is liable for, is invested with all the rights which the creditor had against the principal debtor."
    },
    {
        "section": "Section 141",
        "sectionNo": "141",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Surety’s right to benefit of creditor’s securities",
        "description": "141. Surety’s right to benefit of creditor’s securities.—A surety is entitled to the benefit of every security which the creditor has against the principal debtor at the time when the contract of suretyship is entered into, whether the surety knows of the existence of such security or not; and if the creditor loses, or, without the consent of the surety, parts with such security, the surety is discharged to the extent of the value of the security.\nIllustrations\n(a) C, advances to B, his tenant, 2,000 rupees on the guarantee of A. C has also a further security for the 2,000 rupees by a mortgage of B’s furniture. C cancels the mortgage. B becomes insolvent and C sues A on his guarantee. A is discharged from liability to the amount of the value of the furniture.\n(b) C, a creditor, whose advance to B is secured by a decree, receives also a guarantee for that advance from A. C afterwards takes B’s goods in execution under the decree, and then, without the knowledge of A, withdraws the execution. A is discharged.\n(c) A, as surety for B, makes a bond jointly with B to C, to secure a loan from C to B. Afterwards, C obtains from B a further security for the same debt. Subsequently, C gives up the further security. A is not discharged."
    },
    {
        "section": "Section 142",
        "sectionNo": "142",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Guarantee obtained by misrepresentation invalid",
        "description": "142. Guarantee obtained by misrepresentation invalid.—Any guarantee which has been obtained by means of misrepresentation made by the creditor, or with his knowledge and assent, concerning a material part of the transaction, is invalid."
    },
    {
        "section": "Section 143",
        "sectionNo": "143",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Guarantee obtained by concealment invalid",
        "description": "143. Guarantee obtained by concealment invalid.—Any guarantee which the creditor has obtained by means of keeping silence as to material circumstances, is invalid.\nIllustrations\n(a) A engages B as clerk to collect money for him. B fails to account for some of his receipts, and A in consequence calls upon him to furnish security for his duly accounting. C gives his guarantee for B’s duly accounting. A does not acquaint C with B’s previous conduct. B afterwards makes default. The guarantee is invalid.\n(b) A guarantees to C payment for iron to be supplied by him to B to the amount of 2,000 tons. B and C have privately agreed that B should pay five rupees per ton beyond the market price, such excess to be applied in liquidation of an old debt. This agreement is concealed from A. A is not liable as a surety."
    },
    {
        "section": "Section 144",
        "sectionNo": "144",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Guarantee on contract that creditor shall not act on it until co-surety joins",
        "description": "144. Guarantee on contract that creditor shall not act on it until co-surety joins.—Where a person gives a guarantee upon a contract that the creditor shall not act upon it until another person has joined in it as co-surety, the guarantee is not valid if that other person does not join."
    },
    {
        "section": "Section 145",
        "sectionNo": "145",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Implied promise to indemnify surety",
        "description": "145. Implied promise to indemnify surety.—In every contract of guarantee there is an implied promise by the principal debtor to indemnify the surety, and the surety is entitled to recover from the principal debtor whatever sum he has rightfully paid under the guarantee, but, no sums which he has paid wrongfully.\nIllustrations\n(a) B is indebted to C, and A is surety for the debt. C demands payment from A, and on his refusal sues him for the amount. A defends the suit, having reasonable grounds for doing so, but is compelled to pay the amount of the debt with costs. He can recover from B the amount paid by him for costs, as well as the principal debt.\n(b) C lends B a sum of money, and A, at the request of B, accepts a bill of exchange drawn by B upon A to secure the amount. C, the holder of the bill, demands payment of it from A, and, on A’s refusal to pay, sues him upon the bill. A, not having reasonable grounds for so doing, defends the suit, and has to pay the amount of the bill and costs. He can recover from B the amount of the bill, but not the sum paid for costs, as there was no real ground for defending the action.\n(c) A guarantees to C, to the extent of 2,000 rupees, payment for rice to be supplied by C to B. C supplies to B rice to a less amount than 2,000 rupees, but obtains from A payment of the sum of 2,000 rupees in respect of the rice supplied. A cannot recover from B more than the price of the rice actually supplied."
    },
    {
        "section": "Section 146",
        "sectionNo": "146",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Co-sureties liable to contribute equally",
        "description": "146. Co-sureties liable to contribute equally.—Where two or more persons are co-sureties for the same debt or duty, either jointly or severally, and whether under the same or different contracts, and whether with or without the knowledge of each other, the co-sureties, in the absence of any contract to the contrary, are liable, as between themselves, to pay each an equal share of the whole debt, or of that part of it which remains unpaid by the principal debtor1.\nIllustrations\n(a) A, B and C are sureties to D for the sum of 3,000 rupees lent to E. E makes default in payment. A, B and C are liable, as between themselves, to pay 1,000 rupees each.\n(b) A, B and C are sureties to D for the sum of 1,000 rupees lent to E, and there is a contract between A, B and C that A is to be responsible to the extent of one-quarter, B to the extent of one-quarter, and C to the extent of one-half. E makes default in payment. As between the sureties, A is liable to pay 250 rupees, B 250 rupees, and C 500 rupees."
    },
    {
        "section": "Section 147",
        "sectionNo": "147",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "OF INDEMNITY AND GUARANTEE",
        "title": "Liability of co-sureties bound in different sums",
        "description": "147. Liability of co-sureties bound in different sums.—Co-sureties who are bound in different sums are liable to pay equally as far as the limits of their respective obligations permit.\nIllustrations\n(a) A, B and C, as sureties for D, enter into three several bonds, each in a different penalty, namely, A in the penalty of each 10,000 rupees, B in that of 20,000 rupees, C in that of 40,000 rupees, conditioned for D’s duly accounting to E. D makes default to the extent of 30,000 rupees. A, B and C are each liable to pay 10,000 rupees.\n(b) A, B and C, as sureties for D, enter into three several bonds, each in a different penalty, namely, A in the penalty of 10,000 rupees, B in that of 20,000 rupees, C in that of 40,000 rupees, conditioned for D’s duly accounting to E. D makes default to the extent of 40,000 rupees. A is liable to pay 10,000 rupees, and B and C 15,000 rupees each.\n(c) A, B and C, as sureties for D, enter into three several bonds, each in a different penalty, namely, A in the penalty of 10,000 rupees, B in that of 20,000 rupees, C in that of 40,000 rupees, conditioned for D’s duly accounting to E. D makes default to the extent of 70,000 rupees. A, B and C have to pay each the full penalty of his bond."
    },

    # =========================================================
    # CHAPTER IX: OF BAILMENT
    # =========================================================
    {
        "section": "Section 148",
        "sectionNo": "148",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "“Bailment”“bailor” and “bailee” defined",
        "description": "CHAPTER IX\nOF BAILMENT\n148. “Bailment”“bailor” and “bailee” defined.—A “bailment” is the delivery of goods by one person to another for some purpose, upon a contract that they shall, when the purpose is accomplished, be returned or otherwise disposed of according to the directions of the person delivering them. The person delivering the goods is called the “bailor”. The person to whom they are delivered is called, the “bailee”.\nExplanation.—If a person already in possession of the goods of another contracts to hold them as a bailee, he thereby becomes the bailee, and the owner becomes the bailor of such goods, although they may not have been delivered by way of bailment."
    },
    {
        "section": "Section 149",
        "sectionNo": "149",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Delivery to bailee how made",
        "description": "149. Delivery to bailee how made.—The delivery to the bailee may be made by doing anything which has the effect of putting the goods in the possession of the intended bailee or of any person authorized to hold them on his behalf."
    },
    {
        "section": "Section 150",
        "sectionNo": "150",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailor’s duty to disclose faults in goods bailed",
        "description": "150. Bailor’s duty to disclose faults in goods bailed.—The bailor is bound to disclose to the bailee faults in the goods bailed, of which the bailor is aware, and which materially interfere with the use of them, or expose the bailee to extraordinary risks; and if he does not make such disclosure, he is responsible for damage arising to the bailee directly from such faults.\nIf the goods are bailed for hire, the bailor is responsible for such damage, whether he was or was not aware of the existence of such faults in the goods bailed.\nIllustrations\n(a) A lends a horse, which he knows to be vicious, to B. He does not disclose the fact that the horse is vicious. The horse runs away. B is thrown and injured. A is responsible to B for damage sustained.\n(b) A hires a carriage of B. The carriage is unsafe, though B is not aware of it, and A is injured. B is responsible to A for the injury."
    },
    {
        "section": "Section 151",
        "sectionNo": "151",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Care to be taken by bailee",
        "description": "1151. Care to be taken by bailee.—In all cases of bailment the bailee is bound to take as much care of the goods bailed to him as a man of ordinary prudence would, under similar circumstances, take of his own goods of the same bulk, quality and value as the goods bailed2."
    },
    {
        "section": "Section 152",
        "sectionNo": "152",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailee when not liable for loss, etc., of thing bailed",
        "description": "152. Bailee when not liable for loss, etc., of thing bailed.—The bailee, in the absence of any special contract, is not responsible for the loss, destruction or deterioration of the thing bailed, if he has taken the amount of care of it described in section 151."
    },
    {
        "section": "Section 153",
        "sectionNo": "153",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Termination of bailment by bailee’s act inconsistent with conditions",
        "description": "153. Termination of bailment by bailee’s act inconsistent with conditions.—A contract of bailment is avoidable at the option of the bailor, if the bailee does any act with regard to the goods bailed, inconsistent with the conditions of the bailment.\nIllustration\nA lets to B, for hire, a horse for his own riding. B drives the horse in his carriage. This is, at the ‘option of A, a termination of the bailment."
    },
    {
        "section": "Section 154",
        "sectionNo": "154",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Liability of bailee making unauthorized use of goods bailed",
        "description": "154. Liability of bailee making unauthorized use of goods bailed.—If the bailee makes any use of the goods bailed which is not according to the conditions of the bailment, he is liable to make compensation to the bailor for any damage arising to the goods from or during such use of them.\nIllustrations\n(a) A lends a horse to B for his own riding only. B allows C, a member of his family, to ride the horse. C rides with care, but the horse accidentally falls and is injured. B is liable to make compensation to A for the injury done to the horse.\n(b) A hires a horse in Calcutta from B expressly to march to Benares. A rides with due care, but marches to Cuttack instead. The horse accidentally falls and is injured. A is liable to make compensation to B for the injury to the horse."
    },
    {
        "section": "Section 155",
        "sectionNo": "155",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Effect of mixture, with bailor’s consent, of his goods with bailee’s",
        "description": "155. Effect of mixture, with bailor’s consent, of his goods with bailee’s.—If the bailee, with the consent of the bailor, mixes the goods of the bailor with his own goods, the bailor and the bailee shall have an interest, in proportion to their respective shares, in the mixture thus produced."
    },
    {
        "section": "Section 156",
        "sectionNo": "156",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Effect of mixture without bailor’s consent, when the goods can be separated",
        "description": "156. Effect of mixture without bailor’s consent, when the goods can be separated.—If the bailee, without the consent of the bailor, mixes the goods of the bailor with his own goods, and the goods can be separated or divided, the property in the goods remains in the parties respectively; but the bailee is bound to bear the expense of separation or division, and any damage arising from the mixture.\nIllustration\nA bails 100 bales of cotton marked with a particular mark to B. B, without A’s consent, mixes the 100 bales with other bales of his own, bearing a different mark: A is entitled to have his 100 bales returned, and B is bound to bear all the expense incurred in the separation of the bales, and any other incidental damage."
    },
    {
        "section": "Section 157",
        "sectionNo": "157",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Effect of mixture, without bailor’s consent, when the goods cannot be separated",
        "description": "157. Effect of mixture, without bailor’s consent, when the goods cannot be separated.—If the bailee, without the consent of the bailor, mixes the goods of the bailor with his own goods, in such a manner that it is impossible to separate the goods bailed from the other goods, and deliver them back, the bailor is entitled to be compensated by the bailee for the loss of the goods.\nIllustration\nA bails a barrel of Cape flour worth Rs. 45 to B. B, without A’s consent, mixes the flour with country flour of his own, worth only Rs. 25 a barrel. B must compensate A for the loss of his flour."
    },
    {
        "section": "Section 158",
        "sectionNo": "158",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Repayment, by bailor, of necessary expenses",
        "description": "158. Repayment, by bailor, of necessary expenses.—Where, by the conditions of the bailment, the goods are to be kept or to be carried, or to have work done upon them by the bailee for the bailor, and the bailee is to receive no remuneration, the bailor shall repay to the bailee the necessary expenses incurred by him for the purpose of the bailment."
    },
    {
        "section": "Section 159",
        "sectionNo": "159",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Restoration of goods lent gratuitously",
        "description": "159. Restoration of goods lent gratuitously.—The lender of a thing for use may at any time require its return, if the loan was gratuitous, even though he lent it for a specified time or purpose. But if, on the faith of such loan made for a specified time or purpose, the borrower has acted in such a manner that the return of the thing lent before the time agreed upon would cause him loss exceeding the benefit actually derived by him from the loan, the lender must, if he compels the return, indemnify the borrower for the amount in which the loss so occasioned exceeds the benefit so derived."
    },
    {
        "section": "Section 160",
        "sectionNo": "160",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Return of goods bailed, on expiration of time or accomplishment of purpose",
        "description": "160. Return of goods bailed, on expiration of time or accomplishment of purpose.—It is the duty of the bailee to return, or deliver according to the bailor’s directions, the goods bailed, without demand, as soon as the time for which they were bailed has expired, or the purpose for which they were bailed has been accomplished."
    },
    {
        "section": "Section 161",
        "sectionNo": "161",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailee’s responsibility when goods are not duly returned",
        "description": "1161. Bailee’s responsibility when goods are not duly returned.—If, by the default of the bailee, the goods are not returned, delivered or tendered at the proper time, he is responsible to the bailor for any loss, destruction or deterioration of the goods from that time.2"
    },
    {
        "section": "Section 162",
        "sectionNo": "162",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Termination of gratuitous bailment by death",
        "description": "162. Termination of gratuitous bailment by death.—A gratuitous bailment is terminated by the death either of the bailor or of the bailee."
    },
    {
        "section": "Section 163",
        "sectionNo": "163",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailor entitled to increase or profit from goods bailed",
        "description": "163. Bailor entitled to increase or profit from goods bailed.—In the absence of any contract to the contrary, the bailee is bound to deliver to the bailor, or according to his directions, any increase or profit which may have accrued from the goods bailed.\nIllustration\nA leaves a cow in the custody of B to be taken care of. The cow has a calf. B is bound to deliver the calf as well as the cow to A."
    },
    {
        "section": "Section 164",
        "sectionNo": "164",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailor’s responsibility to bailee",
        "description": "164. Bailor’s responsibility to bailee.—The bailor is responsible to the bailee for any loss which the bailee may sustain by reason that the bailor was not entitled to make the bailment, or to receive back the goods, or to give directions respecting them."
    },
    {
        "section": "Section 165",
        "sectionNo": "165",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailment by several joint owners",
        "description": "165. Bailment by several joint owners.—If several joint owners of goods bail them, the bailee may deliver them back to, or according to the directions of, one joint owner without the consent of all in the absence of any agreement to the contrary."
    },
    {
        "section": "Section 166",
        "sectionNo": "166",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailee not responsible on re-delivery to bailor without title",
        "description": "166. Bailee not responsible on re-delivery to bailor without title.—If the bailor has no title to the goods, and the bailee, in good faith, delivers them back to, or according to the directions of, the bailor, the bailee is not responsible to the owner in respect of such delivery1."
    },
    {
        "section": "Section 167",
        "sectionNo": "167",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Right of third person claiming goods bailed",
        "description": "167. Right of third person claiming goods bailed.—If a person, other than the bailor, claims goods bailed he may apply to the Court to stop the delivery of the goods to the bailor, and to decide the title to the goods."
    },
    {
        "section": "Section 168",
        "sectionNo": "168",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Right of finder of goods, may sue for specific reward offered",
        "description": "168. Right of finder of goods, may sue for specific reward offered.—The finder of goods has no right to sue the owner for compensation for trouble and expense voluntarily incurred by him to preserve the goods and to find out the owner; but he may retain the goods against the owner until he receives such compensation; and, where the owner has offered a specific reward for the return of goods lost, the finder may sue for such reward, and may retain the goods until he receives it."
    },
    {
        "section": "Section 169",
        "sectionNo": "169",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "When finder of thing commonly on sale may sell it",
        "description": "169. When finder of thing commonly on sale may sell it.—When a thing which is commonly the subject of sale is lost, if the owner cannot with reasonable diligence be found, or if he refuses, upon demand, to pay the lawful charges of the finder, the finder may sell it—\n(1) when the thing is in danger of perishing or of losing the greater part of its value, or,\n(2) when the lawful charges of the finder, in respect of the thing found, amount to two-thirds of its value."
    },
    {
        "section": "Section 170",
        "sectionNo": "170",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Bailee’s particular lien",
        "description": "170. Bailee’s particular lien.—Where the bailee has, in accordance with the purpose of the bailment, rendered any service involving the exercise of labour or skill in respect of the goods bailed, he has, in the absence of a contract to the contrary, a right to retain such goods until he receives due remuneration for the services he has rendered in respect of them.\nIllustrations\n(a) A delivers a rough diamond to B, a jeweller, to be cut and polished, which is accordingly done. B is entitled to retain the stone till he is paid for the services he has rendered.\n(b) A gives, cloth to B, a tailor, to make into a coat. B promises A to deliver the coat as soon as it is finished, and to give a three months’ credit for the price. B is not entitled to retain the coat until he is paid."
    },
    {
        "section": "Section 171",
        "sectionNo": "171",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "General lien of bankers, factors, wharfingers, attorneys and policy-brokers",
        "description": "171. General lien of bankers, factors, wharfingers, attorneys and policy-brokers.—Bankers, factors, wharfingers, attorneys of a High Court and policy-brokers may, in the absence of a contract to the contrary, retain as a security for a general balance of account, any goods bailed to them; but no other persons have a right to retain, as a security for such balance, goods bailed to them, unless there is an express contract to that effect1."
    },
    {
        "section": "Section 172",
        "sectionNo": "172",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "“Pledge”“pawnor”,and “pawnee” defined",
        "description": "Bailments of Pledges\n172. “Pledge”“pawnor”,and “pawnee” defined.—The bailment of goods as security for payment of a debt or performance of a promise is called “pledge”. The bailor is in this case called the “pawnor”. The bailee is called the “pawnee”."
    },
    {
        "section": "Section 173",
        "sectionNo": "173",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Pawnee’s right of retainer",
        "description": "173. Pawnee’s right of retainer.—The pawnee may retain the goods pledged, not only for payment of the debt or the performance of the promise, but for the interest of the debt, and all necessary expenses incurred by him in respect of the possession or for the preservation of the goods pledged."
    },
    {
        "section": "Section 174",
        "sectionNo": "174",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Pawnee not to retain for debt or promise other than that for which goods pledged. Presumption in case of subsequent advances.",
        "description": "174. Pawnee not to retain for debt or promise other than that for which goods pledged. Presumption in case of subsequent advances.—The pawnee shall not, in the absence of a contract to that effect, retain the goods pledged for any debt or promise other than the debt or promise for which they are pledged; but such contract, in the absence of anything to the contrary, shall be presumed in regard to subsequent advances made by the pawnee."
    },
    {
        "section": "Section 175",
        "sectionNo": "175",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Pawnee’s right as to extraordinary expenses incurred",
        "description": "175. Pawnee’s right as to extraordinary expenses incurred.—The pawnee is entitled to receive from the pawnor extraordinary expenses incurred by him for the preservation of the goods pledged."
    },
    {
        "section": "Section 176",
        "sectionNo": "176",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Pawnee’s right where pawnor makes default",
        "description": "176. Pawnee’s right where pawnor makes default.—If the pawnor makes default in payment of the debt, or performance, at the stipulated time of the promise, in respect of which the goods were pledged, the pawnee may bring a suit against the pawnor upon the debt or promise, and retain the goods pledged as a collateral security; or he may sell the thing pledged, on giving the pawnor reasonable notice of the sale.\nIf the proceeds of such sale are less than the amount due in respect of the debt or promise, the pawnor is still liable to pay the balance. If the proceeds of the sale are greater than the amount so due, the pawnee shall pay over the surplus to the pawnor."
    },
    {
        "section": "Section 177",
        "sectionNo": "177",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Defaulting pawner’s right to redeem",
        "description": "177. Defaulting pawner’s right to redeem.—If a time is stipulated for the payment of the debt, or performance of the promise, for which the pledge is made, and the pawnor makes default in payment of the debt or performance of the promise at the stipulated time, he may redeem the goods pledged at any subsequent time before the actual sale of them2; but he must, in that case, pay, in addition, any expenses which have arisen from his default."
    },
    {
        "section": "Section 178",
        "sectionNo": "178",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Pledge by mercantile agent",
        "description": "3[178. Pledge by mercantile agent.—Where a mercantile agent is, with the consent of the owner, in possession of goods or the document of title to goods, any pledge made by him, when acting in the ordinary course of business of a mercantile agent, shall be as valid as if he were expressly authorised by the owner of the goods to make the same; provided that the pawnee acts in good faith and has not at the time of the pledge notice that the pawnor has not authority to pledge.\nExplanation.—In this section, the expressions “mercantile agent” and “documents of title” shall have the meanings assigned to them in the Indian Sale of Goods Act, 1930 (3 of 1930)."
    },
    {
        "section": "Section 178A",
        "sectionNo": "178A",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Pledge by person in possession under voidable contract",
        "description": "178A. Pledge by person in possession under voidable contract.—When the pawnor has obtained possession of the goods pledged by him under a contract voidable under section 19 or section 19A, but the contract has not been rescinded at the time of the pledge, the pawnee acquires a good title to the goods, provided he acts in good faith and without notice of the pawnor’s defect of title.]"
    },
    {
        "section": "Section 179",
        "sectionNo": "179",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Pledge where pawnor has only a limited interest",
        "description": "179. Pledge where pawnor has only a limited interest.—Where a person pledges goods in which he has only a limited interest, the pledge is valid to the extent of that interest."
    },
    {
        "section": "Section 180",
        "sectionNo": "180",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Suit by bailor or bailee against wrong-doer",
        "description": "Suits by bailees or bailors against wrong-doers\n180. Suit by bailor or bailee against wrong-doer.—If a third person wrongfully deprives the bailee of the use or possession of the goods bailed, or does them any injury, the bailee is entitled to use such remedies as the owner might have used in the like case if no bailment had been made; and either the bailor or the bailee may bring a suit against a third person for such deprivation or injury."
    },
    {
        "section": "Section 181",
        "sectionNo": "181",
        "chapterNo": 10,
        "chapterRoman": "IX",
        "chapterName": "OF BAILMENT",
        "title": "Apportionment of relief or compensation obtained by such suits",
        "description": "181. Apportionment of relief or compensation obtained by such suits.—Whatever is obtained by way of relief or compensation in any such suit shall, as between the bailor and the bailee, be dealt with according to their respective interests."
    },

    # =========================================================
    # CHAPTER X: AGENCY
    # =========================================================
    {
        "section": "Section 182",
        "sectionNo": "182",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "“Agent” and “principal” defined",
        "description": "CHAPTER X\nAGENCY\nAppointment and authority of agents\n182. “Agent” and “principal” defined.—An “agent” is a person employed to do any act for another, or to represent another in dealings with third persons. The person for whom such act is done, or who is so represented, is called the “principal”."
    },
    {
        "section": "Section 183",
        "sectionNo": "183",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Who may employ agent",
        "description": "183. Who may employ agent.—Any person who is of the age of majority according to the law to which he is subject, and who is of sound mind, may employ an agent."
    },
    {
        "section": "Section 184",
        "sectionNo": "184",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Who may be an agent",
        "description": "184. Who may be an agent.—As between the principal and third persons, any person may become an agent, but no person who is not of the age of majority and of sound mind can become an agent, so as to be responsible to his principal according to the provisions in that behalf herein contained."
    },
    {
        "section": "Section 185",
        "sectionNo": "185",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Consideration not necessary",
        "description": "185. Consideration not necessary.—No consideration is necessary to create an agency."
    },
    {
        "section": "Section 186",
        "sectionNo": "186",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s authority may be expressed or implied",
        "description": "186. Agent’s authority may be expressed or implied.—The authority of an agent may be expressed or implied1."
    },
    {
        "section": "Section 187",
        "sectionNo": "187",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Definitions of express and implied authority",
        "description": "187. Definitions of express and implied authority.—An authority is said to be express when it is given by words spoken or written. An authority is said to be implied when it is to be inferred from the circumstances of the case; and things spoken or written, or the ordinary course of dealing, may be accounted circumstances of the case.\nIllustration\nA owns a shop in Serampore, living himself in Calcutta, and visiting the shop occasionally. The shop is managed by B, and he is in the habit of ordering goods from C in the name of A for the purposes of the shop, and of paying for them out of A’s funds with A’s knowledge. B has an implied authority from A to order goods from C in the name of A for the purposes of the shop."
    },
    {
        "section": "Section 188",
        "sectionNo": "188",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Extent of agent’s authority",
        "description": "188. Extent of agent’s authority.—An agent, having an authority to do an act, has authority to do every lawful thing which is necessary in order to do such act.\nAn agent having an authority to carry on a business, has authority to do every lawful thing necessary for the purpose, or usually done in the course, of conducting such business.\nIllustrations\n(a) A is employed by B, residing in London, to recover at Bombay a debt due to B. A may adopt any legal process necessary for the purpose of recovering the debt, and may give a valid discharge for the same.\n(b) A constitutes B his agent to carry on his business of a ship-builder. B may purchase timber and other materials, and hire workmen, for the purpose of carrying on the business."
    },
    {
        "section": "Section 189",
        "sectionNo": "189",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s authority in an emergency",
        "description": "189. Agent’s authority in an emergency.—An agent has authority, in an emergency, to do all such acts for the purpose of protecting his principal from loss as would be done by a person of ordinary prudence, in his own case, under similar circumstances.\nIllustrations\n(a) An agent for sale may have goods repaired if it be necessary.\n(b) A consigns provisions to B at Calcutta, with directions to send them immediately to C, at Cuttack. B may sell the provisions at Calcutta, if they will not bear the journey to Cuttack without spoiling."
    },
    {
        "section": "Section 190",
        "sectionNo": "190",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "When agent cannot delegate",
        "description": "Sub-Agents\n190. When agent cannot delegate.—An agent cannot lawfully employ another to perform acts which he has expressly or impliedly undertaken to perform personally, unless by the ordinary custom of trade a sub-agent may, or, from the nature of the agency, a sub-agent must, be employed."
    },
    {
        "section": "Section 191",
        "sectionNo": "191",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "“Sub-agent” defined",
        "description": "191. “Sub-agent” defined.—A “sub-agent” is a person employed by, and acting under the control of, the original agent in the business of the agency."
    },
    {
        "section": "Section 192",
        "sectionNo": "192",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Representation of principal by sub-agent properly appointed. Agent’s responsibility for sub-agent. Sub-agent’s responsibility.",
        "description": "192. Representation of principal by sub-agent properly appointed.—Where a sub-agent is properly appointed, the principal is, so far as regards third persons, represented by the sub-agent, and is bound by and responsible for his acts, as if he were an agent originally appointed by the principal.\nAgent’s responsibility for sub-agent.—The agent is responsible to the principal for the acts of the sub-agent.\nSub-agent’s responsibility.—The sub-agent is responsible for his acts to the agent, but not tothe principal, except in cases of fraud or wilful wrong."
    },
    {
        "section": "Section 193",
        "sectionNo": "193",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s responsibility for sub-agent appointed without authority",
        "description": "193. Agent’s responsibility for sub-agent appointed without authority.—Where an agent, without having authority to do so, has appointed a person to act as a sub-agent, the agent stands towards such person in the relation of a principal to an agent, and is responsible for his acts both to the principal and to third persons; the principal is not represented, by or responsible for the acts of the person so employed, nor is that person responsible to the principal."
    },
    {
        "section": "Section 194",
        "sectionNo": "194",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Relation between principal and person duly appointed by agent to act in business of agency",
        "description": "194. Relation between principal and person duly appointed by agent to act in business of agency.—Where an agent, holding an express or implied authority to name another person to act for the principal in the business of the agency, has named another person accordingly, such person is not a sub-agent, but an agent of the principal for such part of the business of the agency as is entrusted to him.\nIllustrations\n(a) A directs B, his solicitor, to sell his estate by auction, and to employ an auctioneer for the purpose. B names C, an auctioneer, to conduct the sale. C is not a sub-agent, but is A’s agent for the conduct of the sale.\n(b) A authorizes B, a merchant in Calcutta, to recover the moneys due to A from C & Co. B instructs D, a solicitor, to take legal proceedings against C & Co. for the recovery of the money. D is not a sub-agent, but is solicitor for A."
    },
    {
        "section": "Section 195",
        "sectionNo": "195",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s duty in naming such person",
        "description": "195. Agent’s duty in naming such person.—In selecting such agent for his principal, an agent is bound to exercise the same amount of discretion as a man of ordinary prudence would exercise in his own case; and, if he does this, he is not responsible to the principal for the acts or negligence of the agent so selected.\nIllustrations\n(a) A instructs B, a merchant, to buy a ship for him. B employs a ship-surveyor of good reputation to choose a ship for A. The surveyor makes the choice negligently and the ship turns out to be unseaworthy and is lost. B is not, but the surveyor is, responsible to A.\n(b) A consigns goods to B, a merchant, for sale. B, in due course, employs an auctioneer in good credit to sell the goods of A, and allows the auctioneer to receive the proceeds of the sale. The auctioneer afterwards becomes insolvent without having accounted for the proceeds. B is not responsible to A for the proceeds."
    },
    {
        "section": "Section 196",
        "sectionNo": "196",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Right of person as to acts done for him without his authority. Effect of ratification.",
        "description": "Ratification\n196. Right of person as to acts done for him without his authority. Effect of ratification.—Where acts are done by one person on behalf of another, but without his knowledge or authority, he may elect to ratify or to disown such acts. If he ratify them, the same effects will follow as if they had been performed by his authority."
    },
    {
        "section": "Section 197",
        "sectionNo": "197",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Ratification may be expressed or implied",
        "description": "197. Ratification may be expressed or implied.—Ratification may be expressed or may be implied in the conduct of the person on whose behalf the acts are done.\nIllustrations\n(a) A, without authority, buys goods for B. Afterwards B sells them to C on his own account; B’s conduct implies a ratification of the purchase made for him by A.\n(b) A, without B’s authority, lends B’s money to C. Afterwards B accepts interest on the money from C. B’s conduct implies a ratification of the loan."
    },
    {
        "section": "Section 198",
        "sectionNo": "198",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Knowledge requisite for valid ratification",
        "description": "198. Knowledge requisite for valid ratification.—No valid ratification can be made by a person whose knowledge of the facts of the case is materially defective."
    },
    {
        "section": "Section 199",
        "sectionNo": "199",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Effect of ratifying unauthorized act forming part of a transaction",
        "description": "199. Effect of ratifying unauthorized act forming part of a transaction.—A person ratifying any unauthorized act done on his behalf ratifies the whole of the transaction of which such act formed a part."
    },
    {
        "section": "Section 200",
        "sectionNo": "200",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Ratification of unauthorized act cannot injure third person",
        "description": "200. Ratification of unauthorized act cannot injure third person.—An act done by one person on behalf of another, without such other person’s authority, which, if done with authority, would have the effect of subjecting a third person to damages, or of terminating any right or interest of a third person, cannot, by ratification, be made to have such effect.\nIllustrations\n(a) A, not being authorized thereto by B, demands, on behalf of B, the delivery of a chattel, the property of B, from C, who is in possession of it. This demand cannot be ratified by B, so as to make C liable for damages for his refusal to deliver.\n(b) A holds a lease from B, terminable on three months’ notice. C, an unauthorized person, gives notice of termination to A. The notice cannot be ratified by B, so as to be binding on A."
    },
    {
        "section": "Section 201",
        "sectionNo": "201",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Termination of agency",
        "description": "Revocation of Authority\n201. Termination of agency.—An agency is terminated by the principal revoking his authority; or by the agent renouncing the business of the agency; or by the business of the agency being completed; or by either the principal or agent dying or becoming of unsound mind; or by the principal being adjudicated an insolvent under the provisions of any Act for the time being in force for the relief of insolvent debtors."
    },
    {
        "section": "Section 202",
        "sectionNo": "202",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Termination of agency, where agent has an interest in subject-matter",
        "description": "202. Termination of agency, where agent has an interest in subject-matter.—Where the agent has himself an interest in the property which forms the subject-matter of the agency, the agency cannot, in the absence of an express contract, be terminated to the prejudice of such interest.\nIllustrations\n(a) A gives authority to B to sell A’s land, and to pay himself, out of the proceeds, the debts due to him from A. A cannot revoke this authority, nor can it be terminated by his insanity or death.\n(b) A assigns 1,000 bales of cotton to B, who has made advances to him on such cotton, and desires B to sell the cotton, and to repay himself out of the price, the amount of his own advances. A cannot revoke this authority, nor is it terminated by his insanity or death."
    },
    {
        "section": "Section 203",
        "sectionNo": "203",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "When principal may revoke agent’s authority",
        "description": "203. When principal may revoke agent’s authority.—The principal may, save as is otherwise provided by the last preceding section, revoke the authority given to his agent at any time before the authority has been exercised so as to bind the principal."
    },
    {
        "section": "Section 204",
        "sectionNo": "204",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Revocation where authority has been partly exercised",
        "description": "204. Revocation where authority has been partly exercised.—The principal cannot revoke the authority given to his agent after the authority has been partly exercised, so far as regards such acts and obligations as arise from acts already done in the agency.\nIllustrations\n(a) A authorizes B to buy 1,000 bales of cotton on account of A, and to pay for it out of A’s moneys remaining in B’s hands. B buys 1,000 bales of cotton in his own name, so as to make himself personally liable for the price. A cannot revoke B’s authority so far as regards payment for the cotton.\n(b) A authorizes B to buy 1,000 bales of cotton on account of A, and to pay for it out of A’s moneys remaining in B’s hands. B buys 1,000 bales of cotton in A’s name, and so as not to render himself personally liable for the price. A can revoke B’s authority to pay for the cotton."
    },
    {
        "section": "Section 205",
        "sectionNo": "205",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Compensation for revocation by principal, or renunciation by agent",
        "description": "205. Compensation for revocation by principal, or renunciation by agent.—Where there is an express or implied contract that the agency should be continued for any period of time, the principal must make compensation to the agent, or the agent to the principal, as the case may be, for any previous revocation or renunciation of the agency without sufficient cause."
    },
    {
        "section": "Section 206",
        "sectionNo": "206",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Notice of revocation or renunciation",
        "description": "206. Notice of revocation or renunciation.—Reasonable notice must be given of such revocation or renunciation, otherwise the damage thereby resulting to the principal or the agent, as the case may be, must be made good to the one by the other."
    },
    {
        "section": "Section 207",
        "sectionNo": "207",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Revocation and renunciation may be expressed or implied",
        "description": "207. Revocation and renunciation may be expressed or implied.—Revocation and renunciation may be expressed or may be implied in the conduct of the principal or agent respectively.\nIllustration\nA empowers B to let A’s house. Afterwards A lets it himself. This is an implied revocation of B’s authority."
    },
    {
        "section": "Section 208",
        "sectionNo": "208",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "When termination of agent’s authority takes effect as to agent, and as to third persons",
        "description": "208. When termination of agent’s authority takes effect as to agent, and as to third persons.—The termination of the authority of an agent does not, so far as regards the agent, take effect before it becomes known to him, or, so far as regards third persons, before it becomes known to them.\nIllustrations\n(a) A directs B to sell goods for him, and agrees to give B five per cent. commission on the price fetched by the goods. A afterwards, by letter, revoke B’s authority. B, after the letter is sent, but before he receives it, sells the goods for 100 rupees. The sale is binding on A, and B is entitled to five rupees as his commission.\n(b) A, at Madras, by letter, directs B to sell for him some cotton lying in a warehouse in Bombay, and afterwards, by letter, revokes his authority to sell, and directs B to send the cotton to Madras. B, after receiving the second letter, enters into a contract with C, who knows of the first letter, but not of the second, for the sale to him of the cotton. C pays B the money, with which B absconds. C’s payment is good as against A.\n(c) A directs B, his agent, to pay certain money to C. A dies, and D takes out probate to his will. B, after A’s death, but before hearing of it, pays the money to C. The payment is good as against D, the executor."
    },
    {
        "section": "Section 209",
        "sectionNo": "209",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s duty on termination of agency by principal’s death or insanity",
        "description": "209. Agent’s duty on termination of agency by principal’s death or insanity.—When an agency is terminated by the principal dying or becoming of unsound mind, the agent is bound to take, on behalf of the representatives of his late principal, all reasonable steps for the protection and preservation of the interests entrusted to him."
    },
    {
        "section": "Section 210",
        "sectionNo": "210",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Termination of sub-agent’s authority",
        "description": "210. Termination of sub-agent’s authority.—The termination of the authority of an agent causes the termination (subject to the rules herein contained regarding the termination of an agent’s authority) of the authority of all sub-agents appointed by him."
    },
    {
        "section": "Section 211",
        "sectionNo": "211",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s duty in conducting principal’s business",
        "description": "Agent’s duty to principal\n211. Agent’s duty in conducting principal’s business.—An agent is bound to conduct the business of his principal according to the directions given by the principal, or, in the absence of any such directions, according to the custom which prevails in doing business of the same kind at the place where the agent conducts such business. When the agent acts otherwise, if any loss be sustained, he must make it good to his principal, and if any profit accrues, he must account for it.\nIllustrations\n(a) A, an agent engaged in carrying on for B a business, in which it is the custom to invest from time to time, at interest, the moneys which may be in hand, omits to make such investment. A must make good to B the interest usually obtained by such investments.\n(b) B, a broker, in whose business it is not the custom to sell on credit, sells goods of A on credit to C, whose credit at the time was very high. C, before payment, becomes insolvent. B must make good the loss to A."
    },
    {
        "section": "Section 212",
        "sectionNo": "212",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Skill and diligence required from agent",
        "description": "212. Skill and diligence required from agent.—An agent is bound to conduct the business of the agency with as much skill as is generally possessed by persons engaged in similar business, unless the principal has notice of his want of skill. The agent is always bound to act with reasonable diligence, and to use such skill as he possesses; and to make compensation to his principal in respect of the direct consequences of his own neglect, want of skill, or misconduct, but not in respect of loss or damage which are indirectly or remotely caused by such neglect, want of skill, or misconduct.\nIllustrations\n(a) A, a merchant in Calcutta, has an agent, B, in London, to whom a sum of money is paid on A’s account, with orders to remit. B retains the money for a considerable time. A, in consequence of not receiving the money, becomes insolvent. B is liable for the money and interest from the day on which it ought to have been paid, according to the usual rate, and for any further direct loss-as, e.g., by variation of rate of exchange-but not further.\n(b) A, an agent for the sale of goods, having authority to sell on credit, sells to B on credit, without making the proper and usual enquiries as to the solvency of B. B, at the time of such sale, is insolvent. A must make compensation to his principal in respect of any loss thereby sustained.\n(c) A, an insurance-broker employed by B to effect an insurance on a ship, omits to see that the usual clauses are inserted in the policy. The ship is after wards lost. In consequence of the omission of the clauses nothing can be recovered from the underwriters. A is bound to make good the loss to B.\n(d) A, a merchant in England, directs B, his agent at Bombay, who accepts the agency, to send him 100 bales of cotton by a certain ship. B, having it in his power to send the cotton, omits to do so. The ship arrives safely in England. Soon after her arrival the price of cotton rises. B is bound to make good to A the profit which he might have made by the 100 bales of cotton at the time the ship arrived, but not any profit he might have made by the subsequent rise."
    },
    {
        "section": "Section 213",
        "sectionNo": "213",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s accounts",
        "description": "213. Agent’s accounts.—An agent is bound to render proper accounts to his principal on demand."
    },
    {
        "section": "Section 214",
        "sectionNo": "214",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s duty to communicate with principal",
        "description": "214. Agent’s duty to communicate with principal.—It is the duty of an agent, in cases of difficulty, to use all reasonable diligence in communicating with his principal, and in seeking to obtain his instructions."
    },
    {
        "section": "Section 215",
        "sectionNo": "215",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Right of principal when agent deals, on his own account, in business of agency without principal’s consent",
        "description": "215. Right of principal when agent deals, on his own account, in business of agency without principal’s consent.—If an agent deals on his own account in the business of the agency, without first obtaining the consent of his principal and acquainting him with all material circumstances which have come to his own knowledge on the subject, the principal may repudiate the transaction, if the case shows, either that any material fact has been dishonestly concealed from him by the agent, or that the dealings of the agent have been disadvantageous to him.\nIllustrations\n(a) A directs B to sell A’s estate. B buys the estate for himself in the name of C. A, on discovering that B has bought the estate for himself, may repudiate the sale, if he can show that B has dishonestly concealed any material fact, or that the sale has been disadvantageous to him.\n(b) A directs B to sell A’s estate B, on looking over the estate before selling it, finds a mine on the estate which is unknown to A. B informs A that he wishes to buy the estate for himself, but conceals the discovery of the mine. A allows B to buy, in ignorance of the existence of the mine. A, on discovering that B knew of the mine at the time he bought the estate, may either repudiate or adopt the sale at his option."
    },
    {
        "section": "Section 216",
        "sectionNo": "216",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Principal’s right to benefit gained by agent dealing on his own account in business of agency",
        "description": "216. Principal’s right to benefit gained by agent dealing on his own account in business of agency.—If an agent, without the knowledge of his principal, deals in the business of the agency on his own account instead of on account of his principal, the principal is entitled to claim from the agent any benefit which may have resulted to him from the transaction.\nIllustration\nA directs B, his agent, to buy a certain house for him. B tells A it cannot be bought, and buys the house for himself. A may, on discovering that B has bought the house, compel him to sell it to A at the price he gave for it."
    },
    {
        "section": "Section 217",
        "sectionNo": "217",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s right of retainer out of sums received on principal’s account",
        "description": "217. Agent’s right of retainer out of sums received on principal’s account.—An agent may retain, out of any sums received on account of the principal in the business of the agency, all moneys due to himself in respect of advances made or expenses properly incurred by him in conducting such business, and also such remuneration as may be payable to him for acting as agent."
    },
    {
        "section": "Section 218",
        "sectionNo": "218",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s duty to pay sums received for principal",
        "description": "218. Agent’s duty to pay sums received for principal.—Subject to such deductions, the agent is bound to pay to his principal all sums received on his account."
    },
    {
        "section": "Section 219",
        "sectionNo": "219",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "When agent’s remuneration becomes due",
        "description": "219. When agent’s remuneration becomes due.—In the absence of any special contract, payment for the performance of any act is not due to the agent until the completion of such act; but an agent may detain moneys received by him on account of goods sold, although the whole of the goods consigned to him for sale may not have been sold, or although the sale may not be actually complete."
    },
    {
        "section": "Section 220",
        "sectionNo": "220",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent not entitled to remuneration for business misconducted",
        "description": "220. Agent not entitled to remuneration for business misconducted.—An agent who is guilty of misconduct in the business of the agency, is not entitled to any remuneration in respect of that part of the business which he has misconducted.\nIllustrations\n(a) A employs B to recover, 1,00,000 rupees from C, and to lay it out on good security. B recovers the 1,00,000 rupees; and lays out 90,000 rupees on good security, but lays out 10,000 rupees on security which he ought to have known to be bad, whereby A loses 2,000 rupees. B is entitled to remuneration for recovering the 1,00,000 rupees and for investing the 90,000 rupees. He is not entitled to any remuneration for investing the 10,000 rupees, and he must make good the 2,000 rupees to B.\n(b) A employs B to recover 1,000 rupees from C. Through B’s misconduct the money is not recovered. B is entitled to no remuneration for his services, and must make good the loss."
    },
    {
        "section": "Section 221",
        "sectionNo": "221",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent’s lien on principal’s property",
        "description": "221. Agent’s lien on principal’s property.—In the absence of any contract to the contrary, an agent is entitled to retain goods, papers and other property, whether movable or immovable of the principal received by him, until the amount due to himself for commission, disbursements and services in respect of the same has been paid or accounted for to him."
    },
    {
        "section": "Section 222",
        "sectionNo": "222",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent to be indemnified against consequences of lawful acts",
        "description": "Principal’s duty to agent\n222. Agent to be indemnified against consequences of lawful acts.—The employer of an agent is bound to indemnify him against the consequences of all lawful acts done by such agent in exercise of the authority conferred upon him.\nIllustrations\n(a) B, at Singapur, under instructions from A of Calcutta, contracts with C to deliver certain goods to him. A does not send the goods to B, and C sues B for breach of contract. B informs A of the suit, and A authorizes him to defend the suit. B defends the suit, and is compelled to pay damages and costs, and incurs expenses. A is liable to B for such damages, costs and expenses.\n(b) B, a broker at Calcutta, by the orders of A, a merchant there, contracts with C for the purchase of 10 casks of oil for A. Afterwards A refuses to receive the oil, and C sues B. B informs A, who repudiates the contract altogether. B defends, but unsuccessfully, and has to pay damages and costs and incurs expenses. A is liable to B for such damages, costs and expenses."
    },
    {
        "section": "Section 223",
        "sectionNo": "223",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent to be indemnified against consequences of acts done in good faith",
        "description": "223. Agent to be indemnified against consequences of acts done in good faith.—Where one person employs another to do an act, and the agent does the act in good faith, the employer is liable to indemnify the agent against the consequences of that act, though it cause an injury to the rights of third persons.\nIllustrations\n(a) A, a decree-holder and entitled to execution of B’s goods, requires the officer of the Court to seize certain goods, representing them to be the goods of B. The officer seizes the goods, and is sued by C, the true owner of the goods. A is liable to indemnify the officer for the sum which he is compelled to pay to C, in consequence of obeying A’s directions.\n(b) B, at the request of A, sells goods in the possession of A, but which A had no right to dispose of, B does not know this, and hands over the proceeds of the sale to A. Afterwards C, the true owner of the goods, sues B and recovers the value of the goods and costs. A is liable to indemnify B for what he has been compelled to pay to C, and for B’s own expenses."
    },
    {
        "section": "Section 224",
        "sectionNo": "224",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Non-liability of employer of agent to do a criminal act",
        "description": "224. Non-liability of employer of agent to do a criminal act.—Where one person employs another to do an act which is criminal, the employer is not liable to the agent, either upon an express or an implied promise, to indemnify him against the consequences of that Act1.\nIllustrations\n(a) A employs B to beat C, and agrees to indemnify him against all consequences of the act. B thereupon beats C, and has to pay damages to C for so doing. A is not liable to indemnify B for those damages.\n(b) B, the proprietor of a newspaper, publishes, at A’s request, a libel upon C in the paper, and A agrees to indemnify B against the consequences of the publication, and all costs and damages of any action in respect thereof. B is sued by C and has to pay damages, and also incurs expenses. A is not liable to B upon the indemnity."
    },
    {
        "section": "Section 225",
        "sectionNo": "225",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Compensation to agent for injury caused by principal’s neglect",
        "description": "225. Compensation to agent for injury caused by principal’s neglect.—The principal must make compensation to his agent in respect of injury2 caused to such agent by the principal’s neglect or want of skill.\nIllustration\nA employs B as a bricklayer in building a house, and puts up the scaffolding himself. The scaffolding is unskilfully put up, and B is in consequence hurt. A must make compensation to B."
    },
    {
        "section": "Section 226",
        "sectionNo": "226",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Enforcement and consequences of agent’s contracts",
        "description": "Effect of agency on contracts with third persons\n226. Enforcement and consequences of agent’s contracts.—Contracts entered into through an agent, and obligations arising from acts done by an agent, may be enforced in the same manner, and will have the same legal consequences, as if the contracts had been entered into and the acts done by the principal in person.\nIllustrations\n(a) A buys goods from B, knowing that he is an agent for their sale, but not knowing who is the principal. B’s principal is the person entitled to claim from A the price of the goods, and A cannot, in a suit by the principal, set-off against that claim a debt due to himself from B.\n(b) A, being B’s agent, with authority to receive money on his behalf, receives from C a sum of money due to B. C is discharged of his obligation to pay the sum in question to B."
    },
    {
        "section": "Section 227",
        "sectionNo": "227",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Principal how far bound, when agent exceeds authority",
        "description": "227. Principal how far bound, when agent exceeds authority.—When an agent does more than he is authorized to do, and when the part of what he does, which is within his authority, can be separated from the part which is beyond his authority, so much only of what he does as is within his authority is binding as between him and his principal.\nIllustration\nA, being owner of a ship and cargo, authorizes B to procure an insurance for 4,000 rupees on the ship. B procures a policy for 4,000 rupees on the ship, and another for the like sum on the cargo. A is bound to pay the premium for the policy on the ship, but not the premium for the policy on the cargo."
    },
    {
        "section": "Section 228",
        "sectionNo": "228",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Principal not bound when excess of agent’s authority is not separable",
        "description": "228. Principal not bound when excess of agent’s authority is not separable.—Where an agent does more than he is authorized to do, and what he does beyond the scope of his authority cannot be separated from what is within it, the principal is not bound to recognize the transaction.\nIllustration\nA authorizes B to buy 500 sheep for him. B buys 500 sheep and 200 lambs for one sum of 6,000 rupees. A may repudiate the whole transaction."
    },
    {
        "section": "Section 229",
        "sectionNo": "229",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Consequences of notice given to agent",
        "description": "229. Consequences of notice given to agent.—Any notice given to or information obtained by the agent, provided it be given or obtained in the course of the business transacted by him for the principal, shall, as between the principal and third parties, have the same legal consequences as if it had been given to or obtained by the principal.\nIllustrations\n(a) A is employed by B to buy from C certain goods, of which C is the apparent owner, and buys them accordingly. In the course of the treaty for the sale, A learns that the goods really belonged to D, but B is ignorant of that fact. B is not entitled to set-off a debt owing to him from C against the price of the goods.\n(b) A is employed by B to buy from C goods of which C is the apparent owner. A was, before he was so employed, a servant of C, and then learnt that the goods really belonged to D, but B is ignorant of that fact. In spite of the knowledge of his agent, B may set-off against the price of the goods a debt owing to him from C."
    },
    {
        "section": "Section 230",
        "sectionNo": "230",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Agent cannot personally enforce, nor be bound by, contracts on behalf of principal. Presumption of contract to contrary",
        "description": "230. Agent cannot personally enforce, nor be bound by, contracts on behalf of principal.—In the absence of any contract to that effect, an agent cannot personally enforce contracts entered into by him on behalf of his principal, nor is he personally bound by them.\nPresumption of contract to contrary—Such a contract shall be presumed to exist in the following cases:—\n(1) where the contract is made by an agent for the sale or purchase of goods for a merchant resident abroad;\n(2) where the agent does not disclose the name of his principal;\n(3) where the principal, though disclosed, cannot be sued."
    },
    {
        "section": "Section 231",
        "sectionNo": "231",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Rights of parties to a contract made by agent not disclosed",
        "description": "231. Rights of parties to a contract made by agent not disclosed.—If an agent makes a contract with a person who neither knows, nor has reason to suspect, that he is an agent, his principal may require the performance of the contract; but the other contracting party has, as against the principal, the same rights as he would have had as against the agent if the agent had been principal.\nIf the principal discloses himself before the contract is completed, the other contracting party may refuse to fulfil the contract, if he can show that, if he had known who was the principal in the contract, or if he had known that the agent was not a principal, he would not have entered into the contract."
    },
    {
        "section": "Section 232",
        "sectionNo": "232",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Performance of contract with agent supposed to be principal",
        "description": "232. Performance of contract with agent supposed to be principal.—Where one man makes a contract with another, neither knowing nor having reasonable ground to suspect that the other is an agent, the principal, if he requires the performance of the contract, can only obtain such performance subject to the rights and obligations subsisting between the agent and the other party to the contract.\nIllustration\nA, who owes 500 rupees to B, sells 1,000 rupees worth of rice to B. A is acting as agent for C in the transaction, but B has no knowledge nor reasonable ground of suspicion that such is the case. C cannot compel B to take the rice without allowing him to set-off A’s debt."
    },
    {
        "section": "Section 233",
        "sectionNo": "233",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Right of person dealing with agent personally liable",
        "description": "233. Right of person dealing with agent personally liable.—In cases where the agent is personally liable, a person dealing with him may hold either him or his principal, or both of them, liable.\nIllustration\nA enters into a contract with B to sell him 100 bales of cotton, and afterwards discovers that B was acting as agent for C. A may sue either B or C, or both, for the price of the cotton."
    },
    {
        "section": "Section 234",
        "sectionNo": "234",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Consequence of inducing agent or principal to act on belief that principal or agent will be held exclusively liable",
        "description": "234. Consequence of inducing agent or principal to act on belief that principal or agent will be held exclusively liable.—When a person who has made a contract with an agent induces the agent to act upon the belief that the principal only will be held liable, or induces the principal to act upon the belief that the agent only will be held liable, he cannot afterwards hold liable the agent or principal respectively."
    },
    {
        "section": "Section 235",
        "sectionNo": "235",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Liability of pretended agent",
        "description": "235. Liability of pretended agent.—A person untruly representing himself to be the authorized agent of another, and thereby inducing a third person to deal with him as such agent, is liable, if his alleged employer does not ratify his acts, to make compensation to the other in respect of any loss or damage which he has incurred by so dealing."
    },
    {
        "section": "Section 236",
        "sectionNo": "236",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Person falsely contracting as agent not entitled to performance",
        "description": "236. Person falsely contracting as agent not entitled to performance.—A person with whom a contract has been entered into in the character of agent, is not entitled to require the performance of it, if he was in reality acting, not as agent, but on his own account."
    },
    {
        "section": "Section 237",
        "sectionNo": "237",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Liability of principal inducing belief that agent’s unauthorized acts were authorized",
        "description": "237. Liability of principal inducing belief that agent’s unauthorized acts were authorized.—When an agent has, without authority, done acts or incurred obligations to third persons on behalf of his principal, the principal is bound by such acts or obligations, if he has by his words or conduct induced such third persons to believe that such acts and obligations were within the scope of the agent’s authority.\nIllustrations\n(a) A consigns goods to B for sale, and gives him instructions not to sell under a fixed price. C, being ignorant of B’s instructions, enters into a contract with B to buy the goods at a price lower than the reserved price. A is bound by the contract.\n(b) A entrusts B with negotiable instruments endorsed in blank. B sells them to C in violation of private orders from A. The sale is good."
    },
    {
        "section": "Section 238",
        "sectionNo": "238",
        "chapterNo": 11,
        "chapterRoman": "X",
        "chapterName": "AGENCY",
        "title": "Effect, on agreement, of misrepresentation of fraud, by agent",
        "description": "238. Effect, on agreement, of misrepresentation of fraud, by agent.—Misrepresentation made, or frauds committed, by agents acting in the course of their business for their principals, have the same effect on agreements made by such agents as if such misrepresentations or frauds had been made or committed by the principals; but misrepresentations made, or frauds committed, by agents, in matters which do not fall within their authority, do not affect their principals.\nIllustrations\n(a) A, being B’s agent for the sale of goods, induces C to buy them by a misrepresentation, which he was not authorized by B to make. The contract is voidable, as between B and C, at the option of C.\n(b) A, the captain of B’s ship, signs bills of lading without having received on board the goods mentioned therein. The bills of lading are void as between B and the pretended cosignor."
    },

    # =========================================================
    # CHAPTER XI: OF PARTNERSHIP [Repealed]
    # =========================================================
    {
        "section": "Section 239",
        "sectionNo": "239",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[‘Partnership’ defined.]",
        "description": "CHAPTER XI.—[OF PARTNERSHIP.]Rep. by the Indian Partnership Act, 1932 (9 of 1932), s. 73 and the Second Schedule.\n239. [‘Partnership’ defined.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 240",
        "sectionNo": "240",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Lender not a partner by advancing money for share of profits.]",
        "description": "240. [Lender not a partner by advancing money for share of profits.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 241",
        "sectionNo": "241",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Property left in business by retiring partner, or decreased partner’s preventative.]",
        "description": "241. [Property left in business by retiring partner, or decreased partner’s preventative.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 242",
        "sectionNo": "242",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Servant or agent remunerated by share of profits, not a partner.]",
        "description": "242. [Servant or agent remunerated by share of profits, not a partner.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 243",
        "sectionNo": "243",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Widow or child of deceased partner receiving annuity out of profits, not a partner.]",
        "description": "243. [Widow or child of deceased partner receiving annuity out of profits, not a partner.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 244",
        "sectionNo": "244",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Person receiving portion of profits for sale of good-will, no a partner.]",
        "description": "244. [Person receiving portion of profits for sale of good-will, no a partner.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 245",
        "sectionNo": "245",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Responsibility of person leading another to believe him a partner.]",
        "description": "245. [Responsibility of person leading another to believe him a partner.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 246",
        "sectionNo": "246",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Liability of person permitting him self to be represented as a partner.]",
        "description": "246. [Liability of person permitting him self to be represented as a partner.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 247",
        "sectionNo": "247",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Minor partner not personally liable, but his share is.]",
        "description": "247. [Minor partner not personally liable, but his share is.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 248",
        "sectionNo": "248",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Liability of minor partner on attaining majority.]",
        "description": "248. [Liability of minor partner on attaining majority.] Rep. by s. 73 and the Second Schedule, ibid"
    },
    {
        "section": "Section 249",
        "sectionNo": "249",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Partner’s liability for debts of partnership.]",
        "description": "249. [Partner’s liability for debts of partnership.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 250",
        "sectionNo": "250",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Partner’s liability to third person for neglect or fraud of co-partner.]",
        "description": "250. [Partner’s liability to third person for neglect or fraud of co-partner.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 251",
        "sectionNo": "251",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Partner’s power to bind co-partners.]",
        "description": "251. [Partner’s power to bind co-partners.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 252",
        "sectionNo": "252",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Annulment of contract defining partner’s rights and obligations.]",
        "description": "252. [Annulment of contract defining partner’s rights and obligations.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 253",
        "sectionNo": "253",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Rules determining partner’s mutual relations, where no contract to contrary.]",
        "description": "253. [Rules determining partner’s mutual relations, where no contract to contrary.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 254",
        "sectionNo": "254",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[When Court may dissolve partnership.]",
        "description": "254. [When Court may dissolve partnership.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 255",
        "sectionNo": "255",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Dissolution of partnership by prohibition of business.]",
        "description": "255. [Dissolution of partnership by prohibition of business.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 256",
        "sectionNo": "256",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Rights and obligations of partners in partnership continued after expiry of term for which it was entered into.]",
        "description": "256. [Rights and obligations of partners in partnership continued after expiry of term for which it was entered into.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 257",
        "sectionNo": "257",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[General duties of partners.]",
        "description": "257. [General duties of partners.] Rep. by s. 73 and the Second Schedule, ibid"
    },
    {
        "section": "Section 258",
        "sectionNo": "258",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Account, to firm, of benefit derived from transaction affecting partnership.]",
        "description": "258. [Account, to firm, of benefit derived from transaction affecting partnership.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 259",
        "sectionNo": "259",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Obligations, to firm, of partner carrying on business.]",
        "description": "259. [Obligations, to firm, of partner carrying on business.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 260",
        "sectionNo": "260",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Revocation of continuing guarantee by charge by change in firm.]",
        "description": "260. [Revocation of continuing guarantee by charge by change in firm.] Rep. by the Indian Partnership Act, 1932 (9 of 1932), s. 73 and the Second Schedule."
    },
    {
        "section": "Section 261",
        "sectionNo": "261",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Non-liability of deceased partner’s estate for subsequent obligations.]",
        "description": "261. [Non-liability of deceased partner’s estate for subsequent obligations.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 262",
        "sectionNo": "262",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Payment of partnership debts, and of separate debts.]",
        "description": "262. [Payment of partnership debts, and of separate debts.] Rep. by s. 73and the Second Schedule, ibid."
    },
    {
        "section": "Section 263",
        "sectionNo": "263",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Continuance, of partners rights and obligations after dissolution.]",
        "description": "263. [Continuance, of partners rights and obligations after dissolution.] Rep. by s. 73and the Second Schedule, ibid."
    },
    {
        "section": "Section 264",
        "sectionNo": "264",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Notice of dissolution.]",
        "description": "264. [Notice of dissolution.] Rep. by s. 73and the Second Schedule, ibid."
    },
    {
        "section": "Section 265",
        "sectionNo": "265",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Right of partners to apply for winding-up after termination of partnership.]",
        "description": "265. [Right of partners to apply for winding-up after termination of partnership.] Rep. by s. 73 and the Second Schedule, ibid."
    },
    {
        "section": "Section 266",
        "sectionNo": "266",
        "chapterNo": 12,
        "chapterRoman": "XI",
        "chapterName": "OF PARTNERSHIP [Repealed.]",
        "title": "[Limited-liability partnerships, incorporate partnerships, and joint-stock companies.]",
        "description": "266. [Limited-liability partnerships, incorporate partnerships, and joint-stock companies.] Rep. by s. 73and the Second Schedule, ibid.\n\nSCHEDULE.—[Enactments repealed.] Rep. by the Repealing and Amending Act, 1914 (10 of 1914), s. 3 and the Second Schedule."
    }
]

# Enrich sections with metadata fields consistent with other bearer acts
for s in sections_data:
    if s["chapterRoman"] == "PRELIMINARY":
        s["metaData"] = f"Chapter {s['chapterRoman']} {s['chapterName']}"
    else:
        s["metaData"] = f"Chapter {s['chapterRoman']} {s['chapterName']}"
    s["metaDescription"] = f"{act_title} {s['section']} - {s['title']}"
    s["metaTitle"] = f"{s['section']} - {act_title}"

# Write to JSON
json_path = os.path.join(os.path.dirname(__file__), '../prisma/contractBearerActData.json')
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(sections_data, f, indent=2, ensure_ascii=False)

# Write to JS
js_path = os.path.join(os.path.dirname(__file__), '../prisma/contractBearerActData.js')
with open(js_path, 'w', encoding='utf-8') as f:
    f.write('export const contractBearerActSections = ')
    json.dump(sections_data, f, indent=2, ensure_ascii=False)
    f.write(';\n')

print(f"Generated {len(sections_data)} sections across 12 chapters successfully!")

chapter_counts = {}
for s in sections_data:
    ch = s["chapterNo"]
    chapter_counts[ch] = chapter_counts.get(ch, 0) + 1

for ch, cnt in sorted(chapter_counts.items()):
    print(f"Chapter {ch}: {cnt} sections")
