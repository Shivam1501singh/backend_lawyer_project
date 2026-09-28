import json
import os

# Complete script to generate all sections of THE SPECIFIC RELIEF ACT, 1963
# Sourced strictly and authoritatively from the attached PDF (Pages 1 to 17)

act_title = "THE SPECIFIC RELIEF ACT, 1963"
act_year = 1963
bearer_act_category = "Civil and Property"

sections_data = [
    # =========================================================
    # PART I - PRELIMINARY (Chapter 1)
    # =========================================================
    {
        "section": "Section 1",
        "sectionNo": "1",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Short title, extent and commencement",
        "description": "1. Short title, extent and commencement.—(1) This Act may be called the Specific Relief Act, 1963.\n(2) It extends to the whole of India 1[***].\n(3) It shall come into force on such date2 as the Central Government may, by notification in the Official Gazette, appoint."
    },
    {
        "section": "Section 2",
        "sectionNo": "2",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Definitions",
        "description": "2. Definitions.—In this Act, unless the context otherwise requires,—\n(a) “obligation” includes every duty enforceable by law;\n(b) “settlement” means an instrument (other than a will or codicil as defined by the Indian Succession Act, 1925 (39 of 1925), whereby the destination or devolution of successive interests in movable or immovable property is disposed of or is agreed to be disposed of;\n(c) “trust” has the same meaning as in section 3 of the Indian Trusts Act, 1882 (2 of 1882), and includes an obligation in the nature of a trust within the meaning of Chapter IX of that Act;\n(d) “trustee” includes every person holding property in trust;\n(e) all other words and expressions used herein but not defined, and defined in the Indian Contract Act, 1872 (9 of 1872), have the meanings respectively assigned to them in that Act."
    },
    {
        "section": "Section 3",
        "sectionNo": "3",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Savings",
        "description": "3. Savings.—Except as otherwise provided herein, nothing in this Act shall be deemed—\n(a) to deprive any person of any right to relief, other than specific performance, which he may have under any contract; or\n(b) to affect the operation of the Indian Registration Act, 1908 (16 of 1908), on documents."
    },
    {
        "section": "Section 4",
        "sectionNo": "4",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Specific relief to be granted only for enforcing individual civil rights and not for enforcing penal laws",
        "description": "4. Specific relief to be granted only for enforcing individual civil rights and not for enforcing penal laws.—Specific relief can be granted only for the purpose of enforcing individual civil rights and not for the mere purpose of enforcing a penal law."
    },

    # =========================================================
    # PART II - SPECIFIC RELIEF
    # CHAPTER I: RECOVERING POSSESSION OF PROPERTY (Chapter 2)
    # =========================================================
    {
        "section": "Section 5",
        "sectionNo": "5",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "RECOVERING POSSESSION OF PROPERTY",
        "title": "Recovery of specific immovable property",
        "description": "5. Recovery of specific immovable property.—A person entitled to the possession of specific immovable property may recover it in the manner provided by the Code of Civil Procedure, 1908 (5 of 1908)."
    },
    {
        "section": "Section 6",
        "sectionNo": "6",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "RECOVERING POSSESSION OF PROPERTY",
        "title": "Suit by person dispossessed of immovable property",
        "description": "6. Suit by person dispossessed of immovable property.—(1) If any person is dispossessed without his consent of immovable property otherwise than in due course of law, he or any person 3[through whom he has been in possession or any person] claiming through him may, by suit, recover possession thereof, notwithstanding any other title that may be set up in such suit.\n(2) No suit under this section shall be brought—\n(a) after the expiry of six months from the date of dispossession; or\n(b) against the Government.\n(3) No appeal shall lie from any order or decree passed in any suit instituted under this section, nor shall any review of any such order or decree be allowed.\n(4) Nothing in this section shall bar any person from suing to establish his title to such property and to recover possession thereof."
    },
    {
        "section": "Section 7",
        "sectionNo": "7",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "RECOVERING POSSESSION OF PROPERTY",
        "title": "Recovery of specific movable property",
        "description": "7. Recovery of specific movable property.—A person entitled to the possession of specific movable property may recover it in the manner provided by the Code of Civil Procedure, 1908 (5 of 1908).\nExplanation 1.—A trustee may sue under this section for the possession of movable property to the beneficial interest in which the person for whom he is trustee is entitled.\nExplanation 2.—A special or temporary right to the present possession of movable property is sufficient to support a suit under this section."
    },
    {
        "section": "Section 8",
        "sectionNo": "8",
        "chapterNo": 2,
        "chapterRoman": "I",
        "chapterName": "RECOVERING POSSESSION OF PROPERTY",
        "title": "Liability of person in possession, not as owner, to deliver to persons entitled to immediate possession",
        "description": "8. Liability of person in possession, not as owner, to deliver to persons entitled to immediate possession.—Any person having the possession or control of a particular article of movable property, of which he is not the owner, may be compelled specifically to deliver it to the person entitled to its immediate possession, in any of the following cases:—\n(a) when the thing claimed is held by the defendant as the agent or trustee of the plaintiff;\n(b) when compensation in money would not afford the plaintiff adequate relief for the loss of the thing claimed;\n(c) when it would be extremely difficult to ascertain the actual damage caused by its loss;\n(d) when the possession of the thing claimed has been wrongfully transferred from the plaintiff.\nExplanation.—Unless and until the contrary is proved, the court shall, in respect of any article of movable property claimed under clause (b) or clause (c) of this section, presume—\n(a) that compensation in money would not afford the plaintiff adequate relief for the loss of the thing claimed, or, as the case may be;\n(b) that it would be extremely difficult to ascertain the actual damage caused by its loss."
    },

    # =========================================================
    # CHAPTER II: SPECIFIC PERFORMANCE OF CONTRACTS (Chapter 3)
    # =========================================================
    {
        "section": "Section 9",
        "sectionNo": "9",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Defences respecting suits for relief based on contract",
        "description": "9. Defences respecting suits for relief based on contract.—Except as otherwise provided herein where any relief is claimed under this Chapter in respect of a contract, the person against whom the relief is claimed may plead by way of defence any ground which is available to him under any law relating to contracts."
    },
    {
        "section": "Section 10",
        "sectionNo": "10",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Specific performance in respect of contracts",
        "description": "CONTRACTS WHICH CAN BE SPECIFICALLY ENFORCED\n1[10. Specific performance in respect of contracts.—The specific performance of a contract shall be enforced by the court subject to the provisions contained in sub-section (2) of section 11, section 14 and section 16.]"
    },
    {
        "section": "Section 11",
        "sectionNo": "11",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Cases in which specific performance of contracts connected with trusts enforceable",
        "description": "11. Cases in which specific performance of contracts connected with trusts enforceable.—(1) Except as otherwise provided in this Act, specific performance of a 1[contract shall], be enforced when the act agreed to be done is in the performance wholly or partly of a trust.\n(2) A contract made by a trustee in excess of his powers or in breach of trust cannot be specifically enforced."
    },
    {
        "section": "Section 12",
        "sectionNo": "12",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Specific performance of part of contract",
        "description": "12. Specific performance of part of contract.—(1) Except as otherwise hereinafter provided in this section, the court shall not direct the specific performance of a part of a contract.\n(2) Where a party to a contract is unable to perform the whole of his part of it, but the part which must be left unperformed be a only a small proportion to the whole in value and admits of compensation in money, the court may, at the suit of either party, direct the specific performance of so much of the contract as can be performed, and award compensation in money for the deficiency.\n(3) Where a party to a contract is unable to perform the whole of his part of it, and the part which must be left unperformed either—\n(a) forms a considerable part of the whole, though admitting of compensation in money; or\n(b) does not admit of compensation in money;\nhe is not entitled to obtain a decree for specific performance; but the court may, at the suit of the other party, direct the party in default to perform specifically so much of his part of the contract as he can perform, if the other party—\n(i) in a case falling under clause (a), pays or has paid the agreed consideration for the whole of the contract reduced by the consideration for the part which must be left unperformed and in a case falling under clause (b) 2[pays or has paid] the consideration for the whole of the contract without any abatement; and\n(ii) in either case, relinquishes all claims to the performance of the remaining part of the contract and all right to compensation, either for the deficiency or for the loss or damage sustained by him through the default of the defendant.\n(4) When a part of a contract which, taken by itself, can and ought to be specifically performed, stands on a separate and independent footing from another part of the same contract which cannot or ought not to be specifically performed, the court may direct specific performance of the former part.\nExplanation.—For the purposes of this section, a party to a contract shall be deemed to be unable to perform the whole of his part of it if a portion of its subject-matter existing at the date of the contract has ceased to exist at the time of its performance."
    },
    {
        "section": "Section 13",
        "sectionNo": "13",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Rights of purchaser or lessee against person with no title or imperfect title",
        "description": "13. Rights of purchaser or lessee against person with no title or imperfect title.—(1) Where a person contracts to sell or let certain immovable property having no title or only an imperfect title, the purchaser or lessee (subject to the other provisions of this Chapter), has the following rights, namely:—\n(a) if the vendor or lessor has subsequently to the contract acquired any interest in the property, the purchaser or lessee may compel him to make good the contract out of such interest;\n(b) where the concurrence of other person is necessary for validating the title, and they are bound to concur at the request of the vendor or lessor, the purchaser or lessee may compel him to procure such concurrence, and when a conveyance by other persons is necessary to validate the title and they are bound to convey at the request of the vendor or lessor, the purchaser or lessee may compel him to procure such conveyance;\n(c) where the vendor professes to sell unencumbered property, but the property is mortgaged for an amount not exceeding the purchase money and the vendor has in fact only a right to redeem it, the purchaser may compel him to redeem the mortgage and to obtain a valid discharge, and, where necessary, also a conveyance from the mortgagee;\n(d) where the vendor or lessor sues for specific performance of the contract and the suit is dismissed on the ground of his want of title or imperfect title, the defendant has a right to a return of his deposit, if any, with interest thereon, to his costs of the suit, and to a lien for such deposit, interest and costs on the interest, if any, of the vendor or lesser in the property which is the subject-matter of the contract.\n(2) The provisions of sub-section (1) shall also apply, as far as may be, to contracts for the sale or hire of movable property."
    },
    {
        "section": "Section 14",
        "sectionNo": "14",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Contracts not specifically enforceable",
        "description": "CONTRACTS WHICH CANNOT BE SPECIFICALLY ENFORCED\n1[14. Contracts not specifically enforceable.—The following contracts cannot be specifically enforced, namely:—\n(a) where a party to the contract has obtained substituted performance of contract in accordance with the provisions of section 20;\n(b) a contract, the performance of which involves the performance of a continuous duty which the court cannot supervise;\n(c) a contract which is so dependent on the personal qualifications of the parties that the court cannot enforce specific performance of its material terms; and\n(d) a contract which is in its nature determinable.]"
    },
    {
        "section": "Section 14A",
        "sectionNo": "14A",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Power of court to engage experts",
        "description": "14A. Power of court to engage experts.—(1) Without prejudice to the generality of the provisions contained in the Code of Civil Procedure, 1908 (5 of 1908), in any suit under this Act, where the court considers it necessary to get expert opinion to assist it on any specific issue involved in the suit, it may engage one or more experts and direct to report to it on such issue and may secure attendance of the expert for providing evidence, including production of documents on the issue.\n(2) The court may require or direct any person to give relevant information to the expert or to produce, or to provide access to, any relevant documents, goods or other property for his inspection.\n(3) The opinion or report given by the expert shall form part of the record of the suit; and the court, or with the permission of the court any of the parties to the suit, may examine the expert personally in open court on any of the matters referred to him or mentioned in his opinion or report, or as to his opinion or report, or as to the manner in which he has made the inspection.\n(4) The expert shall be entitled to such fee, cost or expense as the court may fix, which shall be payable by the parties in such proportion, and at such time, as the court may direct.]"
    },
    {
        "section": "Section 15",
        "sectionNo": "15",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Who may obtain specific performance",
        "description": "PERSONS FOR OR AGAINST WHOM CONTRACTS MAY BE SPECIFICALLY ENFORCED\n15. Who may obtain specific performance.—Except as otherwise provided by this Chapter, the specific performance of a contract may be obtained by—\n(a) any party thereto;\n(b) the representative in interest or the principal, of any party thereto:\nProvided that where the learning, skill, solvency or any personal quality of such party is a material ingredient in the contract, or where the contract provides that his interest shall not be assigned, his representative in interest or his principal shall not be entitled to specific performance of the contract, unless such party has already performed his part of the contract, or the performance thereof by his representative in interest, or his principal, has been accepted by the other party;\n(c) where the contract is a settlement on marriage, or a compromise of doubtful rights between members of the same family, any person beneficially entitled thereunder;\n(d) where the contract has been entered into by a tenant for life in due exercise of a power, the remainderman;\n(e) a reversioner in possession, where the agreement is a covenant entered into with his predecessor in title and the reversioner is entitled to the benefit of such covenant;\n(f) a reversioner in remainder, where the agreement is such a covenant, and the reversioner is entitled to the benefit thereof and will sustain material injury by reason of its breach;\n1[(fa) when a limited liability partnership has entered into a contract and subsequently becomes amalgamated with another limited liability partnership, the new limited liability partnership which arises out of the amalgamation.]\n(g) when a company has entered into a contract and subsequently becomes amalgamated with another company, the new company which arises out of the amalgamation;\n(h) when the promoters of a company have, before its incorporation, entered into a contract for the purposes of the company, and such contract is warranted by the terms of the incorporation, the company:\nProvided that the company has accepted the contract and has communicated such acceptance to the other party to the contract."
    },
    {
        "section": "Section 16",
        "sectionNo": "16",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Personal bars to relief",
        "description": "16. Personal bars to relief.—Specific performance of a contract cannot be enforced in favour of a person—\n2[(a) who has obtained substituted performance of contract under section 20; or]\n(b) who has become incapable of performing, or violates any essential term of, the contract that on his part remains to be performed, or acts in fraud of the contract, or wilfully acts at variance with, or in subversion of, the relation intended to be established by the contract; or\n(c) 3[who fails to prove] that he has performed or has always been ready and willing to perform the essential terms of the contract which are to be performed by him, other than terms the performance of which has been prevented or waived by the defendant.\nExplanation.—For the purposes of clause (c),—\n(i) where a contract involves the payment of money, it is not essential for the plaintiff to actually tender to the defendant or to deposit in court any money except when so directed by the court;\n(ii) the plaintiff 4[must prove] performance of, or readiness and willingness to perform, the contract according to its true construction."
    },
    {
        "section": "Section 17",
        "sectionNo": "17",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Contract to sell or let property by one who has no title, not specifically enforceable",
        "description": "17. Contract to sell or let property by one who has no title, not specifically enforceable.—(1) A contract to sell or let any immovable property cannot be specifically enforced in favour of a vendor or lessor—\n(a) who, knowing himself not to have any title to the property, has contracted to sell or let the property;\n(b) who, though he entered into the contract believing that he had a good title to the property, cannot at the time fixed by the parties or by the court for the completion of the sale or letting, give the purchaser or lessee a title free from reasonable doubt.\n(2) The provisions of sub-section (1) shall also apply, as far as may be, to contracts for the sale or hire of movable property."
    },
    {
        "section": "Section 18",
        "sectionNo": "18",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Non-enforcement except with variation",
        "description": "18. Non-enforcement except with variation.—Where a plaintiff seeks specific performance of a contract in writing, to which the defendant sets up a variation, the plaintiff cannot obtain the performance sought, except with the variation so set up, in the following cases, namely:—\n(a) where by fraud, mistake of fact or mis-representation, the written contract of which performance is sought is in its terms or effect different from what the parties agreed to, or does not contain all the terms agreed to between the parties on the basis of which the defendant entered into the contact;\n(b) where the object of the parties was to produce a certain legal result which the contract as framed is not calculated to produce;\n(c) where the parties have, subsequently to the execution of the contract, varied its terms."
    },
    {
        "section": "Section 19",
        "sectionNo": "19",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Relief against parties and persons claiming under them by subsequent title",
        "description": "19. Relief against parties and persons claiming under them by subsequent title.—Except as otherwise provided by this Chapter, specific performance of a contract may be enforced against—\n(a) either party thereto;\n(b) any other person claiming under him by a title arising subsequently to the contract, except a transferee for value who has paid his money in good faith and without notice of the original contract;\n(c) any person claiming under a title which, though prior to the contract and known to the plaintiff, might have been displaced by the defendant;\n1[(ca) when a limited liability partnership has entered into a contract and subsequently becomes amalgamated with another limited liability partnership, the new limited liability partnership which arises out of the amalgamation.]\n(d) when a company has entered into a contract and subsequently becomes amalgamated with another company, the new company which arises out of the amalgamation;\n(e) when the promoters of a company have, before its incorporation, entered into a contract for the purpose of the company and such contract is warranted by the terms of the incorporation, the company:\nProvided that the company has accepted the contract and communicated such acceptance to the other party to the contract."
    },
    {
        "section": "Section 20",
        "sectionNo": "20",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Substituted performance of contract",
        "description": "2[Substituted performance of contracts, etc.]\n3[20. Substituted performance of contract.—(1) Without prejudice to the generality of the provisions contained in the Indian Contract Act, 1872 (9 of 1872), and, except as otherwise agreed upon by the parties, where the contract is broken due to non-performance of promise by any party, the party who suffers by such breach shall have the option of substituted performance through a third party or by his own agency, and, recover the expenses and other costs actually incurred, spent or suffered by him, from the party committing such breach.\n(2) No substituted performance of contract under sub-section (1) shall be undertaken unless the party who suffers such breach has given a notice in writing, of not less than thirty days, to the party in breach calling upon him to perform the contract within such time as specified in the notice, and on his refusal or failure to do so, he may get the same performed by a third party or by his own agency:\nProvided that the party who suffers such breach shall not be entitled to recover the expenses and costs under sub-section (1) unless he has got the contract performed through a third party or by his own agency.\n(3) Where the party suffering breach of contract has got the contract performed through a third party or by his own agency after giving notice under sub-section (1), he shall not be entitled to claim relief of specific performance against the party in breach.\n(4) Nothing in this section shall prevent the party who has suffered breach of contract from claiming compensation from the party in breach.]"
    },
    {
        "section": "Section 20A",
        "sectionNo": "20A",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Special provisions for contract relating to infrastructure project",
        "description": "20A. Special provisions for contract relating to infrastructure project.—(1) No injunction shall be granted by a court in a suit under this Act involving a contract relating to an infrastructure project specified in the Schedule, where granting injunction would cause impediment or delay in the progress or completion of such infrastructure project.\nExplanation.—For the purposes of this section, section 20B and clause (ha) of section 41, the expression “infrastructure project” means the category of projects and infrastructure Sub-Sectors specified in the Schedule.\n(2) The Central Government may, depending upon the requirement for development of infrastructure projects, and if it considers necessary or expedient to do so, by notification in the Official Gazette, amend the Schedule relating to any Category of projects or Infrastructure Sub-Sectors.\n(3) Every notification issued under this Act by the Central Government shall be laid, as soon as may be after it is issued, before each House of Parliament, while it is in session, for a total period of thirty days which may be comprised in one session or in two or more successive sessions, and if, before the expiry of the session immediately following the session or the successive sessions aforesaid, both Houses agree in making any modification in the notification or both Houses agree that the notification should not be made, the notification shall thereafter have effect only in such modified form or be of no effect, as the case may be; so, however, that any such modification or annulment shall be without prejudice to the validity of anything previously done under that notification."
    },
    {
        "section": "Section 20B",
        "sectionNo": "20B",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Special Courts",
        "description": "20B. Special Courts.—The State Government, in consultation with the Chief Justice of the High Court, shall designate, by notification published in the Official Gazette, one or more Civil Courts as Special Courts, within the local limits of the area to exercise jurisdiction and to try a suit under this Act in respect of contracts relating to infrastructure projects."
    },
    {
        "section": "Section 20C",
        "sectionNo": "20C",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Expeditious disposal of suits",
        "description": "20C. Expeditious disposal of suits.—Notwithstanding anything contained in the Code of Civil Procedure, 1908 (5 of 1908), a suit filed under the provisions of this Act shall be disposed of by the court within a period of twelve months from the date of service of summons to the defendant:\nProvided that the said period may be extended for a further period not exceeding six months in aggregate after recording reasons in writing for such extension by the court.]"
    },
    {
        "section": "Section 21",
        "sectionNo": "21",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Power to award compensation in certain cases",
        "description": "21. Power to award compensation in certain cases.—(1) In a suit for specific performance of a contract, the plaintiff may also claim compensation for its breach 1[in addition to] such performance.\n(2) If, in any such suit, the court decides that specific performance ought not to be granted, but that there is a contract between the parties which has been broken by the defendant, and that the plaintiff is entitled to compensation for that breach, it shall award him such compensation accordingly.\n(3) If, in any such suit, the court decides that specific performance ought to be granted, but that it is not sufficient to satisfy the justice of the case, and that some compensation for breach of the contract should also be made to the plaintiff, it shall award him such compensation accordingly.\n(4) In determining the amount of any compensation awarded under this section, the court shall be guided by the principles specified in section 73 of the Indian Contract Act, 1872 (9 of 1872).\n(5) No compensation shall be awarded under this section unless the plaintiff has claimed such compensation in his plaint:\nProvided that where the plaintiff has not claimed any such compensation in the plaint, the court shall, at any stage of the proceeding, allow him to amend the plaint on such terms as may be just, for including a claim for such compensation.\nExplanation.—The circumstances that the contract has become incapable of specific performance does not preclude the court from exercising the jurisdiction conferred by this section."
    },
    {
        "section": "Section 22",
        "sectionNo": "22",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Power to grant relief for possession, partition, refund of earnest money, etc.",
        "description": "22. Power to grant relief for possession, partition, refund of earnest money, etc.—(1) Notwithstanding anything to the contrary contained in the Code of Civil Procedure,1908 (5 of 1908), any person suing for the specific performance of a contract for the transfer of immovable property may, in an appropriate case, ask for—\n(a) possession, or partition and separate possession, of the property, in addition to such performance; or\n(b) any other relief to which he may be entitled, including the refund of any earnest money or deposit paid or 1[made by] him, in case his claim for specific performance is refused.\n(2) No relief under clause (a) or clause (b) of sub-section (1) shall be granted by the court unless it has been specifically claimed:\nProvident that where the plaintiff has not claimed any such relief in the plaint, the court shall, at any stage of the proceeding, allow him to amend the plaint on such terms as may be just for including a claim for such relief.\n(3) The power of the court to grant relief under clause (b) of sub-section (1) shall be without prejudice to its powers to award compensation under section 21."
    },
    {
        "section": "Section 23",
        "sectionNo": "23",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Liquidation of damages not a bar to specific performance",
        "description": "23. Liquidation of damages not a bar to specific performance.—(1) A contract, otherwise proper to be specifically enforced, may be so enforced, though a sum be named in it as the amount to be paid in case of its breach and the party in default is willing to pay the same, if the court, having regard to the terms of the contract and other attending circumstances, is satisfied that the sum was named only for the purpose of securing performance of the contract and not for the purpose of giving to the party in default an option of paying money in lieu of specific performance.\n(2) When enforcing specific performance under this section, the court shall not also decree payment of the sum so named in the contract."
    },
    {
        "section": "Section 24",
        "sectionNo": "24",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Bar of suit for compensation for breach after dismissal of suit for specific performance",
        "description": "24. Bar of suit for compensation for breach after dismissal of suit for specific performance.—The dismissal of a suit for specific performance of a contract or part thereof shall bar the plaintiff’s right to sue for compensation for the breach of such contract or part, as the case may be, but shall not bar his right to sue for any other relief to which he may be entitled, by reason of such breach."
    },
    {
        "section": "Section 25",
        "sectionNo": "25",
        "chapterNo": 3,
        "chapterRoman": "II",
        "chapterName": "SPECIFIC PERFORMANCE OF CONTRACTS",
        "title": "Application of preceding sections to certain awards and testamentary directions to execute settlements",
        "description": "ENFORCEMENT OF AWARDS AND DIRECTIONS TO EXECUTE SETTLEMENTS\n25. Application of preceding sections to certain awards and testamentary directions to execute settlements.—The provisions of this Chapter as to contracts shall apply to awards to which 2[the Arbitration and Conciliation Act, 1996 (26 of 1996)], does not apply and to directions in a will or codicil to execute a particular settlement."
    },

    # =========================================================
    # CHAPTER III: RECTIFICATION OF INSTRUMENTS (Chapter 4)
    # =========================================================
    {
        "section": "Section 26",
        "sectionNo": "26",
        "chapterNo": 4,
        "chapterRoman": "III",
        "chapterName": "RECTIFICATION OF INSTRUMENTS",
        "title": "When instrument may be rectified",
        "description": "26. When instrument may be rectified.—(1) When, through fraud or a mutual mistake of the parties, a contract or other instrument in writing [not being the articles of association of a company to which the Companies Act, 1956 (1 of 1956), applies] does not express their real intention, then—\n(a) either party or his representative in interest may institute a suit to have the instrument rectified; or\n(b) the plaintiff may, in any suit in which any right arising under the instrument is in issue, claim in his pleading that the instrument be rectified; or\n(c) a defendant in any such suit as is referred to in clause (b), may, in addition to any other defence open to him, ask for rectification of the instrument.\n(2) If, in any suit in which a contract or other instrument is sought to be rectified under sub-section (1), the court finds that the instrument, through fraud or mistake, does not express the real intention of the parties, the court may, in its discretion, direct rectification of the instrument so as to express that intention, so far as this can be done without prejudice to rights acquired by third persons in good faith and for value.\n(3) A contract in writing may first be rectified, and then if the party claiming rectification has so prayed in his pleading and the court thinks fit, may be specifically enforced.\n(4) No relief for the rectification of an instrument shall be granted to any party under this section unless it has been specifically claimed:\nProvided that where a party has not claimed any such relief in his pleading, the court shall, at any stage of the proceeding, allow him to amend the pleading on such terms as may be just for including such claim."
    },

    # =========================================================
    # CHAPTER IV: RESCISSION OF CONTRACTS (Chapter 5)
    # =========================================================
    {
        "section": "Section 27",
        "sectionNo": "27",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "RESCISSION OF CONTRACTS",
        "title": "When rescission may be adjudged or refused",
        "description": "27. When rescission may be adjudged or refused.—(1) Any person interested in a contract may sue to have it rescinded, and such rescission may be adjudged by the court in any of the following cases, namely:—\n(a) where the contract is voidable or terminable by the plaintiff;\n(b) where the contract is unlawful for causes not apparent on its face and the defendant is more to blame than the plaintiff.\n(2) Notwithstanding anything contained in sub-section (1), the court may refuse to rescind the contract—\n(a) where the plaintiff has expressly or impliedly ratified the contract; or\n(b) where, owing to the change of circumstances which has taken place since the making of the contract (not being due to any act of the defendant himself), the parties cannot be substantially restored to the position in which they stood when the contract was made;\n(c) where third parties have, during the subsistence of the contract, acquired rights in good faith without notice and for value; or\n(d) where only a part of the contract is sought to be rescinded and such part is not severable from the rest of the contract.\nExplanation.—In this section “contract” in relation to the territories to which the Transfer of Property Act, 1882 (4 of 1882), does not extend, means a contract in writing."
    },
    {
        "section": "Section 28",
        "sectionNo": "28",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "RESCISSION OF CONTRACTS",
        "title": "Rescission in certain circumstances of contracts for the sale or lease of immovable property, the specific performance of which has been decreed",
        "description": "28. Rescission in certain circumstances of contracts for the sale or lease of immovable property, the specific performance of which has been decreed.—(1) Where in any suit a decree for specific performance of a contract for the sale or lease of immovable property has been made and the purchaser or lessee does not, within the period allowed by the decree or such further period as the court may allow, pay the purchase money or other sum which the court has ordered him to pay, the vendor or lessor may apply in the same suit in which the decree is made, to have the contract rescinded and on such application the court may, by order, rescind the contract either so far as regards the party in default or altogether, as the justice of the case may require.\n(2) Where a contract is rescinded under sub-section (1), the court—\n(a) shall direct the purchaser or the lessee, if he has obtained possession of the property under the contract, to restore such possession to the vendor or lessor, and\n(b) may direct payment to the vendor or lessor of all the rents and profits which have accrued in respect of the property from the date on which possession was so obtained by the purchaser or lessee until restoration of possession to the vendor or lessor, and, if the justice of the case so requires, the refund of any sum paid by the vendee or the lessee as earnest money or deposit in connection with the contract.\n(3) If the purchase or lessee pays the purchase money or other sum which he is ordered to pay under the decree within the period referred to in sub-section (1), the court may, on application made in the same suit, award the purchaser or lessee such further relief as he may be entitled to, including in appropriate cases all or any of the following reliefs, namely:—\n(a) the execution of a proper conveyance or lease by the vendor or lessor;\n(b) the delivery of possession, or partition and separate possession, of the property on the execution of such conveyance or lease.\n(4) No separate suit in respect of any relief which may be claimed under this section shall lie at the instance of a vendor, purchaser, lessor or lessee, as the case may be.\n(5) The costs of any proceedings under this section shall be in the discretion of the court."
    },
    {
        "section": "Section 29",
        "sectionNo": "29",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "RESCISSION OF CONTRACTS",
        "title": "Alternative prayer for rescission in suit for specific performance",
        "description": "29. Alternative prayer for rescission in suit for specific performance.—A plaintiff instituting a suit for the specific performance of a contract in writing may pray in the alternative that, if the contract cannot be specifically enforced, it may be rescinded and delivered up to be cancelled; and the court, if it refuses to enforce the contract specifically, may direct it to be rescinded and delivered up accordingly."
    },
    {
        "section": "Section 30",
        "sectionNo": "30",
        "chapterNo": 5,
        "chapterRoman": "IV",
        "chapterName": "RESCISSION OF CONTRACTS",
        "title": "Court may require parties rescinding to do equity",
        "description": "30. Court may require parties rescinding to do equity.—On adjudging the rescission of a contract, the court may require the party to whom such relief is granted to restore, so far as may be, any benefit which he may have received from the other party and to make any compensation to him which justice may require."
    },

    # =========================================================
    # CHAPTER V: CANCELLATION OF INSTRUMENTS (Chapter 6)
    # =========================================================
    {
        "section": "Section 31",
        "sectionNo": "31",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "CANCELLATION OF INSTRUMENTS",
        "title": "When cancellation may be ordered",
        "description": "31. When cancellation may be ordered.—(1) Any person against whom a written instrument is void or voidable, and who has reasonable apprehension that such instrument, if left outstanding may cause him serious injury, may sue to have it adjudged void or voidable; and the court may, in its discretion, so adjudge it and order it to be delivered up and cancelled.\n(2) If the instrument has been registered under the Indian Registration Act, 1908 (16 of 1908), the court shall also send a copy of its decree to the officer in whose office the instrument has been so registered; and such officer shall note on the copy of the instrument contained in his books the fact of its cancellation."
    },
    {
        "section": "Section 32",
        "sectionNo": "32",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "CANCELLATION OF INSTRUMENTS",
        "title": "What instruments may be partially cancelled",
        "description": "32. What instruments may be partially cancelled.—Where an instrument is evidence of different rights or different obligations, the court may, in a proper case, cancel it in part and allow it to stand for the residue."
    },
    {
        "section": "Section 33",
        "sectionNo": "33",
        "chapterNo": 6,
        "chapterRoman": "V",
        "chapterName": "CANCELLATION OF INSTRUMENTS",
        "title": "Power to require benefit to be restored or compensation to be made when instrument is cancelled or is successfully resisted as being void or voidable",
        "description": "33. Power to require benefit to be restored or compensation to be made when instrument is cancelled or is successfully resisted as being void or voidable.—(1) On adjudging the cancellation of an instrument, the court may require the party to whom such relief is granted, to restore, so far as may be any benefit which he may have received from the other party and to make any compensation to him which justice may require.\n(2) Where a defendant successfully resists any suit on the ground—\n(a) that the instrument sought to be enforced against him in the suit is voidable, the court may if the defendant has received any benefit under the instrument from the other party, require him to restore, so far as may be, such benefit to that party or to make compensation for it;\n(b) that the agreement sought to be enforced against him in the suit is void by reason of his not having been competent to contract under section 11 of the Indian Contract Act, 1872 (9 of 1872), the court may, if the defendant has received any benefit under the agreement from the other party, require him to restore, so far as may be, such benefit to that party, to the extent to which he or his estate has benefited thereby."
    },

    # =========================================================
    # CHAPTER VI: DECLARATORY DECREES (Chapter 7)
    # =========================================================
    {
        "section": "Section 34",
        "sectionNo": "34",
        "chapterNo": 7,
        "chapterRoman": "VI",
        "chapterName": "DECLARATORY DECREES",
        "title": "Discretion of court as to declaration of status or right",
        "description": "34. Discretion of court as to declaration of status or right.—Any person entitled to any legal character, or to any right as to any property, may institute a suit against any person denying, or interested to deny, his title to such character or right, and the court may in its discretion make therein a declaration that he is so entitled, and the plaintiff need not in such suit ask for any further relief:\nProvided that no court shall make any such declaration where the plaintiff, being able to seek further relief than a mere declaration of title, omits to do so.\nExplanation.—A trustee of property is a “person interested to deny” a title adverse to the title of some one who is not inexistence, and for whom, if in existence, he would be a trustee."
    },
    {
        "section": "Section 35",
        "sectionNo": "35",
        "chapterNo": 7,
        "chapterRoman": "VI",
        "chapterName": "DECLARATORY DECREES",
        "title": "Effect of declaration",
        "description": "35. Effect of declaration.—A declaration made under this Chapter is binding only on the parties to the suit, persons claiming through them respectively, and, where any of the parties are trustees, on the persons for whom, if in existence at the date of the declaration, such parties would be trustees."
    },

    # =========================================================
    # PART III - PREVENTIVE RELIEF
    # CHAPTER VII: INJUNCTIONS GENERALLY (Chapter 8)
    # =========================================================
    {
        "section": "Section 36",
        "sectionNo": "36",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "INJUNCTIONS GENERALLY",
        "title": "Preventive relief how granted",
        "description": "36. Preventive relief how granted.—Preventive relief is granted at the discretion of the court by injunction, temporary or perpetual."
    },
    {
        "section": "Section 37",
        "sectionNo": "37",
        "chapterNo": 8,
        "chapterRoman": "VII",
        "chapterName": "INJUNCTIONS GENERALLY",
        "title": "Temporary and perpetual injunctions",
        "description": "37. Temporary and perpetual injunctions.—(1) Temporary injunctions are such as are to continue until a specific time, or until the further order of the court, and they may be granted at any stage of a suit, and are regulated by the Code of Civil Procedure, 1908 (5 of 1908).\n(2) A perpetual injunction can only be granted by the decree made at the hearing and upon the merits of the suit; the defendant is thereby perpetually enjoined from the assertion of a right, or from the commission of an act, which would be contrary to the rights of the plaintiff."
    },

    # =========================================================
    # CHAPTER VIII: PERPETUAL INJUNCTIONS (Chapter 9)
    # =========================================================
    {
        "section": "Section 38",
        "sectionNo": "38",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "PERPETUAL INJUNCTIONS",
        "title": "Perpetual injunction when granted",
        "description": "38. Perpetual injunction when granted.—(1) Subject to the other provisions contained in or referred to by this Chapter, a perpetual injunction may be granted to the plaintiff to prevent the breach of an obligation existing in his favour, whether expressly or by implication.\n(2) When any such obligation arises from contract, the court shall be guided by the rules and provisions contained in Chapter II.\n(3) When the defendant invades or threatens to invade the plaintiff’s right to, or enjoyment of, property, the court may grant a perpetual injunction in the following cases, namely:—\n(a) where the defendant is trustee of the property for the plaintiff;\n(b) where there exists no standard for ascertaining the actual damage caused, or likely to be caused, by the invasion;\n(c) where the invasion is such that compensation in money would not afford adequate relief;\n(d) where the injunction is necessary to prevent a multiplicity of judicial proceedings."
    },
    {
        "section": "Section 39",
        "sectionNo": "39",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "PERPETUAL INJUNCTIONS",
        "title": "Mandatory injunctions",
        "description": "39. Mandatory injunctions.—When, to prevent the breach of an obligation, it is necessary to compel the performance of certain acts which the court is capable of enforcing, the court may in its discretion grant an injunction to prevent the breach complained of, and also to compel performance of the requisite acts."
    },
    {
        "section": "Section 40",
        "sectionNo": "40",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "PERPETUAL INJUNCTIONS",
        "title": "Damages in lieu of, or in addition to, injunction",
        "description": "40. Damages in lieu of, or in addition to, injunction.—(1) The plaintiff in a suit for perpetual injunction under section 38, or mandatory injunction under section 39, may claim damages either in addition to, or in substitution for, such injunction and the court may, if it thinks fit, award such damages.\n(2) No relief for damages shall be granted under this section unless the plaintiff has claimed such relief in his plaint:\nProvided that where no such damages have been claimed in the plaint, the court shall, at any stage of the proceedings, allow the plaintiff to amend the plaint on such terms as may be just for including such claim.\n(3) The dismissal of a suit to prevent the breach of an obligation existing in favour of the plaintiff shall bar his right to sue for damages for such breach."
    },
    {
        "section": "Section 41",
        "sectionNo": "41",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "PERPETUAL INJUNCTIONS",
        "title": "Injunction when refused",
        "description": "41. Injunction when refused.—An injunction cannot be granted—\n(a) to restrain any person from prosecuting a judicial proceeding pending at the institution of the suit in which the injunction is sought, unless such restraint is necessary to prevent a multiplicity of proceedings;\n(b) to restrain any person from instituting or prosecuting any proceeding in a court not subordinate to that from which the injunction is sought;\n(c) to restrain any person from applying to any legislative body;\n(d) to restrain any person from instituting or prosecuting any proceeding in a criminal matter;\n(e) to prevent the breach of a contract the performance of which would not be specifically enforced;\n(f) to prevent, on the ground of nuisance, an act of which it is not reasonably clear that it will be a nuisance;\n(g) to prevent a continuing breach in which the plaintiff has acquiesced;\n(h) when equally efficacious relief can certainly be obtained by any other usual mode of proceeding except in case of breach of trust;\n1[(ha) if it would impede or delay the progress or completion of any infrastructure project or interfere with the continued provision of relevant facility related thereto or services being the subject matter of such project.]\n(i) when the conduct of the plaintiff or his agents has been such as to disentitle him to be the assistance of the court;\n(j) when the plaintiff has no personal interest in the matter."
    },
    {
        "section": "Section 42",
        "sectionNo": "42",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "PERPETUAL INJUNCTIONS",
        "title": "Injunction to perform negative agreement",
        "description": "42. Injunction to perform negative agreement.—Notwithstanding anything contained in clause (e) of section 41, where a contract comprises an affirmative agreement to do a certain act, coupled with a negative agreement, express or implied, not to do a certain act, the circumstance that the court is unable to compel specific performance of the affirmative agreement shall not preclude it from granting an injunction to perform the negative agreement:\nProvided that the plaintiff has not failed to perform the contract so far as it is binding on him."
    },
    {
        "section": "Section 43",
        "sectionNo": "43",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "PERPETUAL INJUNCTIONS",
        "title": "[Repealed.]",
        "description": "43. [Repealed.] Rep. by the Repealing and Amending Act, 1974 (56 of 1974), s. 2 and the First Schedule (w.e.f. 20-12-1974)."
    },
    {
        "section": "Section 44",
        "sectionNo": "44",
        "chapterNo": 9,
        "chapterRoman": "VIII",
        "chapterName": "PERPETUAL INJUNCTIONS",
        "title": "[Repealed.]",
        "description": "44. [Repealed.] Rep. by the Repealing and Amending Act, 1974 (56 of 1974), s. 2 and the First Schedule (w.e.f. 20-12-1974).\n\nTHE SCHEDULE\n[See sections 20A and 41 (ha)]\nCategory of projects and Infrastructure Sub-Sectors\n\n1. Transport:\n(a) Road and bridges\n(b) Ports (including Capital Dredging)\n(c) Shipyards (including a floating or land-based facility with the essential features of waterfront, turning basin, berthing and docking facility, slipways or ship lifts, and which is self-sufficient for carrying on shipbuilding/repair/breaking activities)\n(d) Inland Waterways\n(e) Airports\n(f) Railway Track, tunnels, viaducts, bridges, terminal infrastructure including stations and adjoining commercial infrastructure\n(g) Urban Public Transport (except rolling stock in case of urban road transport)\n\n2. Energy:\n(a) Electricity Generation\n(b) Electricity Transmission\n(c) Electricity Distribution\n(d) Oil pipelines\n(e) Oil/Gas/Liquefied Natural Gas (LNG) storage facility(including strategic storage of crude oil)\n(f) Gas pipelines (including city gas distribution network)\n\n3. Water and Sanitation:\n(a) Solid Waste Management\n(b) Water supply pipelines\n(c) Water treatment plants\n(d) Sewage collection, treatment and disposal system\n(e) Irrigation (dams, channels, embankments, etc.)\n(f) Storm Water Drainage System\n(g) Slurry pipelines\n\n4. Communication:\n(a) Telecommunication (Fixed network including optic fibre/wire/cable networks which provide broadband/internet)\n(b) Telecommunication towers\n(c) Telecommunications and Telecom Services\n\n5. Social and Commercial Infrastructure:\n(a) Education Institutions (capital stock)\n(b) Sports infrastructure (including provision of Sports Stadia and Infrastructure for Academies for Training/Research in Sports and Sports-relating activities)\n(c) Hospitals (capital stock including Medical Colleges, Para Medical Training Institutes and Diagnostic Centres)\n(d) Tourism infrastructure viz.\n(i) three-star or higher category classified hotels located outside cities with population of more than one million;\n(ii) ropeways and cable cars\n(e) Common infrastructure for industrial parks and other parks with industrial activity such as food parks, textile parks, Special Economic Zones, tourism facilities and agriculture markets\n(f) Post-harvest storage infrastructure for agriculture and horticulture produce including cold storage\n(g) Terminal markets\n(h) Soil-testing laboratories\n(i) Cold chain (including cold room facility for farm level pre-cooling, for preservation or storage of agriculture and allied produce, marine products and meat)\n(j) Affordable Housing (including a housing project using at least 50% of the Floor Area Ratio (FAR)/Floor Space Index (FSI) for dwelling units with carpet area of not more than 60 square meters\nExplanation.—For the purposes of this sub-clause, the term “carpet area” shall have the same meaning as assigned to it in clause (k) of section 2 of the Real Estate (Regulation and Development) Act, 2016 (16 of 2016)."
    }
]

# Add meta fields according to project standards
for s in sections_data:
    s["metaData"] = f"Chapter {s['chapterRoman']} {s['chapterName']}"
    s["metaDescription"] = f"{act_title} {s['section']} - {s['title']}"
    s["metaTitle"] = f"{s['section']} - {act_title}"

print(f"Total sections prepared: {len(sections_data)}")

# Output file paths
prisma_dir = "/Users/admin/Desktop/lawyer_project/backend_lawyer_project/prisma"
json_path = os.path.join(prisma_dir, "specificReliefBearerActData.json")
js_path = os.path.join(prisma_dir, "specificReliefBearerActData.js")

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(sections_data, f, indent=2, ensure_ascii=False)
print(f"Saved JSON to {json_path}")

with open(js_path, "w", encoding="utf-8") as f:
    f.write("export const specificReliefBearerActSections = ")
    json.dump(sections_data, f, indent=2, ensure_ascii=False)
    f.write(";\n")
print(f"Saved JS module to {js_path}")
