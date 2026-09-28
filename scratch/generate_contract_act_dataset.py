import json
import os

# Complete script to generate all sections of THE INDIAN CONTRACT ACT, 1872
# Sourced strictly and authoritatively from the attached PDF (Pages 1 to 53)

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
        "description": "31. “Contingent contract” defined.—A “contingent contract is a contract to do or not to do something, if some event, collateral to such contract, does or does not happen.\nIllustration\nA contracts to pay B Rs. 10,000 if B’s house is burnt. This is a contingent contract."
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
        "description": "Contracts which must be performed\n37. Obligation of parties to contracts.—The parties to a contract must either perform, or offer to perform, their respective promises, unless such performance is dispensed with or excused under the provisions of this Act, or of any other law.\nPromises bind the representatives of the promisors in case of the death of such promisors before performance, unless a contrary intention appears from the contract.\nIllustrations\n(a) A promises to deliver goods to B on a certain day on payment of Rs. 1,000. A dies before that day. A’s representatives are bound to deliver the goods to B, and B is bound to pay the Rs. 1,000 to A’s representatives.\n(b) A promises to paint a picture for B by a certain day, at a certain price. A dies before the day. The contract cannot be enforced either by A’s representatives or by B."
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
    }
]

print(f"Loaded initial {len(sections_data)} sections.")
