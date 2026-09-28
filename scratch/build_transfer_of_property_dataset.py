import json
import os

# Define all 143 sections/entries of THE TRANSFER OF PROPERTY ACT, 1882 directly from the attached PDF

act_name = "THE TRANSFER OF PROPERTY ACT, 1882"

sections = [
    # ---------------------------------------------------------
    # CHAPTER I : PRELIMINARY
    # ---------------------------------------------------------
    {
        "section": "Section 1",
        "sectionNo": "1",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Short title. Commencement. Extent.",
        "description": "1. Short title.—This Act may be called the Transfer of Property Act, 1882.\nCommencement.—It shall come into force on the first day of July, 1882.\nExtent.— 1[It extends 2in the first instance to the whole of India. except 3[the territories which, immediately before the 1st November, 1956, were comprised in Part B States or in the States of], Bombay, Punjab and Delhi.]\n4[But this Act or any part thereof may by 5notification in the Official Gazette be extended to the whole or any part of 6[the said territories] by the State Government concerned.]\n7[And any State Government may 8*** from time to time, by notification in the Official Gazette, exempt, either retrospectively or prospectively, any part of the territories administered by such State Government from all or any of the following provisions, namely:—\nSections 54, paragraphs 2 and 3, 59, 107 and 123.]\n1[Notwithstanding anything in the foregoing part of this section, sections 54, paragraphs 2 and 3, 59, 107 and 123 shall not extend or be extended to any district or tract of country for the time being excluded from the operation of the Indian Registration Act, 2[1908 (16 of 1908)], under the power conferred by the first section of that Act or otherwise.]"
    },
    {
        "section": "Section 2",
        "sectionNo": "2",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Repeal of Acts. Saving of certain enactments, incidents, rights, liabilities, etc.",
        "description": "2. Repeal of Acts. Saving of certain enactments, incidents, rights, liabilities, etc.—In the territories to which this Act extends for the time being the enactments specified in the Schedule hereto annexed shall be repealed to the extent therein mentioned. But nothing herein contained shall be deemed to affect—\n(a) the provisions of any enactment not hereby expressly repealed:\n(b) any terms or incidents of any contract or constitution of property which are consistent with the provisions of this Act, and are allowed by the law for the time being in force:\n(c) any right or liability arising out of a legal relation constituted before this Act comes into force, or any relief in respect of any such right or liability: or\n(d) save as provided by section 57 and Chapter IV of this Act, any transfer by operation of law or by, or in execution of, a decree or order of a Court of competent jurisdiction:\nand nothing in the second chapter of this Act shall be deemed to affect any rule of 3*** Muhammadan 4*** law."
    },
    {
        "section": "Section 3",
        "sectionNo": "3",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Interpretation-clause",
        "description": "3. Interpretation-clause.—In this Act, unless there is something repugnant in the subject or context,—\n“immoveable property” does not include standing timber, growing crops or grass:\n“instrument”, means a non-testamentary instrument:\n5[“attested”, in relation to an instrument, means and shall be deemed always to have meant attested by two or more witnesses each of whom has seen the executant sign or affix his mark to the instrument, or has seen some other person sign the instrument in the presence and by the direction of the executant, or has received from the executant a personal acknowledgement of his signature or mark, or of the signature of such other person, and each of whom has signed the instrument in the presence of the executant; but it shall not be necessary that more than one of such witnesses shall have been present at the same time, and no particular form of attestation shall be necessary:]\n“registered” means registered in 6[7[any part of the territories] to which this Act extends] under the law8 for the time being in force regulating the registration of documents:\n“attached to the earth” means—\n(a) rooted in the earth, as in the case of trees and shrubs;\n(b) imbedded in the earth, as in the case of walls or buildings; or\n(c) attached to what is so imbedded for the permanent beneficial enjoyment of that to which it is attached:\n9[“actionable claim” means a claim to any debt, other than a debt secured by mortgage of immoveable property or by hypothecation or pledge of moveable property, or to any beneficial interest in moveable property not in the possession, either actual or constructive, of the claimant, which the Civil Courts recognise as affording grounds for relief, whether such debt or beneficial interest be existent, accuring, conditional or contingent:]\n1[“a person is said to have notice”] of a fact when he actually knows that fact, or when, but for wilful abstention from an enquiry or search which he ought to have made, or gross negligence, he would have known it.\nExplanation I.—Where any transaction relating to immovable property is required by law to be and has been effected by a registered instrument, any person acquiring such property or any part of, or share or interest in, such property shall be deemed to have notice of such instrument as from the date of registration or, 2[where the property is not all situated in one sub-district, or where the registered instrument has been registered under sub-section (2) of section 30 of the Indian Registration Act, 1908 (16 of 1908), from the earliest date on which any memorandum of such registered instrument has been filed by any Sub-Registrar within whose sub-district any part of the property which is being acquired, or of the property wherein a share or interest is being acquired, is situated]:\nProvided that—\n(1) the instrument has been registered and its registration completed in the manner prescribed by the Indian Registration Act, 1908 (16 of 1908) and the rules made thereunder,\n(2) the instrument 3[or memorandum] has been duly entered or filed, as the case may be, in books kept under section 51 of that Act, and\n(3) the particulars regarding the transaction to which the instrument relates have been correctly entered in the indexes kept under section 55 of that Act.\nExplanation II.—Any person acquiring any immoveable property or any share or interest in any such property shall be deemed to have notice of the title, if any, of any person who is for the time being in actual possession thereof.\nExplanation III.—A person shall be deemed to have had notice of any fact if his agent acquires notice thereof whilst acting on his behalf in the course of business to which that fact is material:\nProvided that, if the agent fraudulently conceals the fact, the principal shall not be charged with notice thereof as against any person who was a party to or otherwise cognizant of the fraud.]"
    },
    {
        "section": "Section 4",
        "sectionNo": "4",
        "chapterNo": 1,
        "chapterRoman": "I",
        "chapterName": "PRELIMINARY",
        "title": "Enactments relating to contracts to be taken as part of Contract Act and supplemental to the Registration Act",
        "description": "4. Enactments relating to contracts to be taken as part of Contract Act and supplemental to the Registration Act.—The chapters and sections of this Act which relate to contracts shall be taken as part of the Indian Contract Act, 1872 (9 of 1872).\n4[And sections 54, paragraphs 2 and 3, 59, 107 and 123 shall be read as supplemental to the Indian Registration Act, 5[1908 (16 of 1908)].]"
    },

    # ---------------------------------------------------------
    # CHAPTER II : OF TRANSFERS OF PROPERTY BY ACT OF PARTIES
    # ---------------------------------------------------------
    {
        "section": "Section 5",
        "sectionNo": "5",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "“Transfer of property” defined",
        "description": "5. “Transfer of property” defined.—In the following sections “transfer of property” means an act by which a living person conveys property, in present or in future, to one or more other living persons, or to himself, 2[or to himself] and one or more other living persons; and “to transfer property” is to perform such act.\n3[In this section “living person” includes a company or association or body of individuals, whether incorporated or not, but nothing herein contained shall affect any law for the time being in force relating to transfer of property to or by companies, associations or bodies of individuals.]"
    },
    {
        "section": "Section 6",
        "sectionNo": "6",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "What may be transferred",
        "description": "6. What may be transferred.—Property of any kind may be transferred, except as otherwise provided by this Act or by any other law for the time being in force.\n(a) The chance of an heir-apparent succeeding to an estate, the chance of a relation obtaining a legacy on the death of a kinsman, or any other mere possibility of a like nature, cannot be transferred.\n(b) A mere right of re-entry for breach of a condition subsequent cannot be transferred to any one except the owner of the property affected thereby.\n(c) An easement cannot be transferred apart from the dominant heritage.\n(d) An interest in property restricted in its enjoyment to the owner personally cannot be transferred by him.\n4[(dd) A right to future maintenance, in whatsoever manner arising, secured or determined, cannot be transferred.]\n(e) A mere right to sue 5***cannot be transferred.\n(f) A public office cannot be transferred, nor can the salary of a public officer, whether before or after it has become payable.\n(g) Stipends allowed to military 6[,naval], 7[air-force] and civil pensioners of 8[Government] and political pensions cannot be transferred.\n(h) No transfer can be made (1) in so far as it is opposed to the nature of the interest affected thereby, or (2) 9[for an unlawful object or consideration within the meaning of section 23 of the Indian Contract Act, 1872 (9 of 1872), or (3) to a person legally disqualified to be transferee].\n10[(i) Nothing in this section shall be deemed to authorise a tenant having an untransferable right of occupancy, the farmer of an estate in respect of which default has been made in paying revenue, or the lessee of an estate under the management of a Court of Wards, to assign his interest as such tenant, farmer or lessee.]"
    },
    {
        "section": "Section 7",
        "sectionNo": "7",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Persons competent to transfer",
        "description": "7. Persons competent to transfer.—Every person competent to contract and entitled to transferable property, or authorised to dispose of transferable property not his own, is competent to transfer such property either wholly or in part and either absolutely or conditionally, in the circumstances, to the extent and in the manner, allowed and prescribed by any law for the time being in force."
    },
    {
        "section": "Section 8",
        "sectionNo": "8",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Operation of transfer",
        "description": "8. Operation of transfer.—Unless a different intention is expressed or necessarily implied, a transfer of property passes forthwith to the transferee all the interest which the transferor is then capable of passing in the property, and in the legal incidents thereof.\nSuch incidents include, where the property is land, the easements annexed thereto, the rents and profits thereof accruing after the transfer, and all things attached to the earth;\nand, where the property is machinery attached to the earth, the moveable parts thereof;\nand, where the property is a house, the easements annexed thereto, the rent thereof accruing after the transfer, and the locks, keys, bars, doors, windows and all other things provided for permanent use therewith;\nand, where the property is a debt or other actionable claim, the securities therefor (except where they are also for other debts or claims not transferred to the transferee), but not arrears of interest accrued before the transfer;\nand, where the property is money or other property yielding income, the interest or income thereof accruing after the transfer takes effect."
    },
    {
        "section": "Section 9",
        "sectionNo": "9",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Oral transfer",
        "description": "9. Oral transfer.—A transfer of property may be made without writing in every case in which a writing is not expressly required by law."
    },
    {
        "section": "Section 10",
        "sectionNo": "10",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Condition restraining alienation",
        "description": "10. Condition restraining alienation.—Where property is transferred subject to a condition or limitation absolutely restraining the transferee or any person claiming under him from parting with or disposing of his interest in the property, the condition or limitation is void, except in the case of a lease where the condition is for the benefit of the lessor or those claiming under him: provided that property may be transferred to or for the benefit of a woman (not being a Hindu, Muhammadan or Buddhist), so that she shall not have power during her marriage to transfer or charge the same or her beneficial interest therein."
    },
    {
        "section": "Section 11",
        "sectionNo": "11",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Restriction repugnant to interest created",
        "description": "11. Restriction repugnant to interest created.—Where, on a transfer of property, an interest therein is created absolutely in favour of any person, but the terms of the transfer direct that such interest shall be applied or enjoyed by him in a particular manner, he shall be entitled to receive and dispose of such interest as if there were no such direction.\n1[Where any such direction has been made in respect of one piece of immoveable property for the purpose of securing the beneficial enjoyment of another piece of such property, nothing in this section shall be deemed to affect any right which the transferor may have to enforce such direction or any remedy which he may have in respect of a breach thereof.]"
    },
    {
        "section": "Section 12",
        "sectionNo": "12",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Condition making interest determinable on insolvency or attempted alienation",
        "description": "12. Condition making interest determinable on insolvency or attempted alienation.—Where property is transferred subject to a condition or limitation making any interest therein, reserved or given to or for the benefit of any person, to cease on his becoming insolvent or endeavouring to transfer or dispose of the same, such condition or limitation is void.\nNothing in this section applies to a condition in a lease for the benefit of the lessor or those claiming under him."
    },
    {
        "section": "Section 13",
        "sectionNo": "13",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer for benefit of unborn person",
        "description": "13. Transfer for benefit of unborn person.—Where, on a transfer of property, an interest therein is created for the benefit of a person not in existence at the date of the transfer, subject to a prior interest created by the same transfer, the interest created for the benefit of such person shall not take effect, unless it extends to the whole of the remaining interest of the transferor in the property.\n\nIllustration\nA transfers property of which he is the owner to B in trust for A and his intended wife succesively for their lives, and, after the death of the survivor for the eldest son of the intended marriage for life, and after his death for A's second son. The interest so created for the benefit of the eldest son does not take effect, because it does not extend to the whole of A's remaining interest in the property."
    },
    {
        "section": "Section 14",
        "sectionNo": "14",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Rule against perpetuity",
        "description": "14. Rule against perpetuity.—No transfer of property can operate to create an interest which is to take effect after the lifetime of one or more persons living at the date of such transfer, and the minority of some person who shall be in existence at the expiration of that period, and to whom, if he attains full age, the interest created is to belong."
    },
    {
        "section": "Section 15",
        "sectionNo": "15",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer to class some of whom come under sections 13 and 14",
        "description": "15. Transfer to class some of whom come under sections 13 and 14.—If, on a transfer of property, an interest therein is created for the benefit of a class of persons with regard to some of whom such interest fails by reason of any of the rules contained in sections 13 and 14; such interest fails 1[in regard to those persons only and not in regard to the whole class]."
    },
    {
        "section": "Section 16",
        "sectionNo": "16",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer to take effect on failure of prior interest",
        "description": "2[16. Transfer to take effect on failure of prior interest.—Where, by reason of any of the rules contained in sections 13 and 14, an interest created for the benefit of a person or of a class of persons fails in regard to such person or the whole of such class, any interest created in the same transaction and intended to take effect after or upon failure of such prior interest also fails."
    },
    {
        "section": "Section 17",
        "sectionNo": "17",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Direction for accumulation",
        "description": "17. Direction for accumulation.—(1) Where the terms of a transfer of property direct that the income arising from the property shall be accumulated either wholly or in part during a period longer than—\n(a) the life of the transferor, or\n(b) a period of eighteen years from the date of the transfer,\nsuch direction shall, save as hereinafter provided, be void to the extent to which the period during which the accumulation is directed exceeds the longer of the aforesaid periods, and at the end of such last-mentioned period the property and the income thereof shall be disposed of as if the period during which the accumulation has been directed to be made had elapsed.\n(2) This section shall not affect any direction for accumulation for the purpose of—\n(i) the payment of the debts of the transferor or any other person taking any interest under the transfer, or\n(ii) the provision of portions for children or remoter issue of the transferor or of any other person taking any interest under the transfer, or\n(iii) the preservation or maintenance of the property transferred;\nand such direction may be made accordingly."
    },
    {
        "section": "Section 18",
        "sectionNo": "18",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer in perpetuity for benefit of public",
        "description": "18. Transfer in perpetuity for benefit of public.—The restrictions in sections 14, 16 and 17 shall not apply in the case of a transfer of property for the benefit of the public in the advancement of religion, knowledge, commerce, health, safety, or any other object beneficial to mankind.]"
    },
    {
        "section": "Section 19",
        "sectionNo": "19",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Vested interest",
        "description": "19. Vested interest.—Where, on a transfer of property, an interest therein is created in favour of a person without specifying the time when it is to take effect, or in terms specifying that it is to take effect forthwith or on the happening of an event which must happen, such interest is vested, unless a contrary intention appears from the terms of the transfer.\nA vested interest is not defeated by the death of the transferee before he obtains possession.\nExplanation.—An intention that an interest shall not be vested is not to be inferred merely-from a provision whereby the enjoyment thereof is postponed, or whereby a prior interest in the same property is given or reserved to some other person, or whereby income arising from the property is directed to be accumulated until the time of enjoyment arrives, or from a provision that if a particular event shall happen the interest shall pass to another person."
    },
    {
        "section": "Section 20",
        "sectionNo": "20",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "When unborn person acquires vested interest on transfer for his benefit",
        "description": "20. When unborn person acquires vested interest on transfer for his benefit.—Where, on a transfer of property, an interest therein is created for the benefit of a person not then living, he acquires upon his birth, unless a contrary intention appear from the terms of the transfer, a vested interest, although he may not be entitled to the enjoyment thereof immediately on his birth."
    },
    {
        "section": "Section 21",
        "sectionNo": "21",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Contingent interest",
        "description": "21. Contingent interest.—Where, on a transfer of property, an interest therein is created in favour of a person to take effect only on the happening of a specified uncertain event, or if a specified uncertain event shall not happen, such person thereby acquires a contingent interest in the property. Such interest becomes a vested interest, in the former case, on the happening of the event, in the latter, when the happening of the event becomes impossible.\nException.—Where, under a transfer of property, a person becomes entitled to an interest therein upon attaining a particular age, and the transferor also gives to him absolutely the income to arise from such interest before he reaches that age, or directs the income or so much thereof as may be necessary to be applied for his benefit, such interest is not contingent."
    },
    {
        "section": "Section 22",
        "sectionNo": "22",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer to members of a class who attain a particular age",
        "description": "22. Transfer to members of a class who attain a particular age.—Where, on a transfer of property, an interest therein is created in favour of such members only of a class as shall attain a particular age, such interest does not vest in any member of the class who has not attained that age."
    },
    {
        "section": "Section 23",
        "sectionNo": "23",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer contingent on happening of specified uncertain event",
        "description": "23. Transfer contingent on happening of specified uncertain event.—Where, on a transfer of property, an interest therein is to accrue to a specified person if a specified uncertain event shall happen, and no time is mentioned for the occurrence of that event, the interest fails unless such event happens before, or at the same time as, the intermediate or precedent interest ceases to exist."
    },
    {
        "section": "Section 24",
        "sectionNo": "24",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer to such of certain persons as survive at some period not specified",
        "description": "24. Transfer to such of certain persons as survive at some period not specified.—Where, on a transfer of property, an interest therein is to accrue to such of certain persons as shall be surviving at some period, but the exact period is not specified, the interest shall go to such of them as shall be alive when the intermediate or precedent interest ceases to exist, unless a contrary intention appears from the terms of the transfer.\n\nIllustration\nA transfers property to B for life, and after his death to C and D, equally to be divided between them, or to the survivor of them. C dies during the life of B. D survives B. At B's death the property passes to D."
    },
    {
        "section": "Section 25",
        "sectionNo": "25",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Conditional transfer",
        "description": "25. Conditional transfer.—An interest created on a transfer of property and dependent upon a condition fails if the fulfilment of the condition is impossible, or is forbidden by law, or is of such a nature that, if permitted, it would defeat the provisions of any law, or is fraudulent, or involves or implies injury to the person or property of another, or the Court regards it as immoral or opposed to public policy.\n\nIllustrations\n(a) A lets a farm to B on condition that he shall walk a hundred miles in an hour. The lease is void.\n(b) A gives Rs. 500 to B on condition that he shall marry A's daughter C. At the date of the transfer C was dead. The transfer is void.\n(c) A transfers Rs. 500 to B or condition that she shall murder C. The transfer is void.\n(d) A transfers Rs. 500 to his niece C if she will desert her husband. The transfer is void."
    },
    {
        "section": "Section 26",
        "sectionNo": "26",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Fulfilment of condition precedent",
        "description": "26. Fulfilment of condition precedent.—Where the terms of a transfer of property impose a condition to be fulfilled before a person can take an interest in the property, the condition shall be deemed to have been fulfilled if it has been substantially complied with.\n\nIllustrations\n(a) A transfers Rs. 5,000 to B on condition that he shall marry with the consent of C, D, and E. E dies. B marries with the consent of C and D. B is deemed to have fulfilled the condition.\n(b) A transfers Rs. 5,000 to B on condition that he shall marry with the consent of C, D and E. B marries without the consent of C, D and E, but obtains their consent after the marriage. B has not fulfilled the condition."
    },
    {
        "section": "Section 27",
        "sectionNo": "27",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Conditional transfer to one person coupled with transfer to another on failure of prior disposition",
        "description": "27. Conditional transfer to one person coupled with transfer to another on failure of prior disposition.—Where, on a transfer of property, an interest therein is created in favour of one person, and by the same transaction an ulterior disposition of the same interest is made in favour of another, if the prior disposition under the transfer shall fail, the ulterior disposition shall take effect upon the failure of the prior disposition, although the failure may not have occurred in the manner contemplated by the transferor.\nBut, where the intention of the parties to the transaction is that the ulterior disposition shall take effect only in the event of the prior disposition failing in a particular manner, the ulterior disposition shall not take effect unless the prior disposition fails in that manner.\n\nIllustrations\n(a) A transfers Rs. 500 to B on condition that he shall execute a certain lease within three months after A’s death, and, if he should neglect to do so, to C. B dies in A's life-time. The disposition in favour of C takes effect.\n(b) A transfers property to his wife; but, in case she should die in his life-time, transfers to B that which he had transferred to her. A and his wife perish together, under circumstances which make it impossible to prove that she died before him. The disposition in favour of B does not take effect."
    },
    {
        "section": "Section 28",
        "sectionNo": "28",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Ulterior transfer conditional on happening or not happening of specified event",
        "description": "28. Ulterior transfer conditional on happening or not happening of specified event.—On a transfer of property an interest therein may be created to accrue to any person with the condition superadded that in case a specified uncertain event shall happen such interest shall pass to another person, or that in case a specified uncertain event shall not happen such interest shall pass to another person. In each case the dispositions are subject to the rules contained in sections 10, 12, 21, 22, 23, 24, 25 and 27."
    },
    {
        "section": "Section 29",
        "sectionNo": "29",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Fulfilment of condition subsequent",
        "description": "29. Fulfilment of condition subsequent.—An ulterior disposition of the kind contemplated by the last preceding section cannot take effect unless the condition is strictly fulfilled.\n\nIllustration\nA transfers Rs. 500 to B, to be paid to him on his attaining his majority or marrying, with a proviso that, if B dies a minor or marries without C's consent, the Rs. 500 shall go to D. B marries when only 17 years of age, without C's consent. The transfer to D takes effect."
    },
    {
        "section": "Section 30",
        "sectionNo": "30",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Prior disposition not affected by invalidity of ulterior disposition",
        "description": "30. Prior disposition not affected by invalidity of ulterior disposition.—If the ulterior disposition is not valid, the prior disposition is not affected by it.\n\nIllustration\nA transfers a farm to B for her life, and, if she do not desert her husband to C. B is entitled to the farm during her life as if no condition had been inserted."
    },
    {
        "section": "Section 31",
        "sectionNo": "31",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Condition that transfer shall cease to have effect in case specified uncertain event happens or does not happen",
        "description": "31. Condition that transfer shall cease to have effect in case specified uncertain event happens or does not happen.—Subject to the provisions of section 12, on a transfer of property an interest therein may be created with the condition superadded that it shall cease to exist in case a specified uncertain event shall happen, or in case a specified uncertain event shall not happen.\n\nIllustrations\n(a) A transfers a farm to B for his life, with a proviso that, in case B cuts down a certain wood, the transfer shall cease to have any effect. B cuts down the wood. He loses his life-interest in the farm.\n(b) A transfers a farm to B, provided that, if B shall not go to England within three years after the date of the transfer, his interest in the farm shall cease. B does not go to England within the term prescribed. His interest in the farm ceases."
    },
    {
        "section": "Section 32",
        "sectionNo": "32",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Such condition must not be invalid",
        "description": "32. Such condition must not be invalid.—In order that a condition that an interest shall cease to exist may be valid, it is necessary that the event to which it relates be one which could legally constitute the condition of the creation of an interest."
    },
    {
        "section": "Section 33",
        "sectionNo": "33",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer conditional on performance of act, no time being specified for performance",
        "description": "33. Transfer conditional on performance of act, no time being specified for performance.—Where, on a transfer of property, an interest therein is created subject to a condition that the person taking it shall perform a certain act, but no time is specified for the performance of the act, the condition is broken when he renders impossible, permanently or for an indefinite period, the performance of the act."
    },
    {
        "section": "Section 34",
        "sectionNo": "34",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer conditional on performance of act, time being specified",
        "description": "34. Transfer conditional on performance of act, time being specified.—Where an act is to be performed by a person either as a condition to be fulfilled before an interest created on a transfer of property is enjoyed by him, or as a condition on the non-fulfillment of which the interest is to pass from him to another person, and a time is specified for the performance of the act, if such performance within the specified time is prevented by the fraud of a person who would be directly benefited by non-fulfilment of the condition, such further time shall as against him be allowed for performing the act as shall be requisite to make up for the delay caused by such fraud. But if no time is specified for the performance of the act, then, if its performance is by the fraud of a person interested in the non-fulfilment of the condition rendered impossible or indefinitely postponed, the condition shall as against him be deemed to have been fulfilled."
    },
    {
        "section": "Section 35",
        "sectionNo": "35",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Election when necessary",
        "description": "Election\n35. Election when necessary.—Where a person professes to transfer property which he has no right to transfer, and as part of the same transaction confers any benefit on the owner of the property, such owner must elect either to confirm such transfer or to dissent from it; and in the latter case he shall relinquish the benefit so conferred, and the benefit so relinquished shall revert to the transferor or his representative as if it had not been disposed of,\nsubject nevertheless,\nwhere the transfer is gratuitous, and the transferor has, before the election, died or otherwise become incapable of making a fresh transfer,\nand in all cases where the transfer is for consideration,\nto the charge of making good to the disappointed transferee the amount or value of the property attempted to be transferred to him.\n\nIllustrations\nThe farm of Sultanpur is the property of C and worth Rs. 800. A by an instrument of gift professes to transfer it to B, giving by the same instrument Rs. 1,000 to C. C elects to retain the farm. He forfeits the gift of Rs. 1,000.\nIn the same case, A dies before the election. His representative must out of the Rs. 1,000 pay Rs. 800 to B.\n\nThe rule in the first paragraph of this section applies whether the transferor does or does not believe that which he professes to transfer to be his own.\nA person taking no benefit directly under a transaction, but deriving a benefit under it indirectly, need not elect.\nA person who in his one capacity takes a benefit under the transaction may in another dissent therefrom.\n\nException to the last preceding four rules.—Where a particular benefit is expressed to be conferred on the owner of the property which the transferor professes to transfer, and such benefit is expressed to be in lieu of that property, if such owner claim the property, he must relinquish the particular benefit, but he is not bound to relinquish any other benefit conferred upon him by the same transaction.\nAcceptance of the benefit by the person on whom it is conferred constitutes an election by him to confirm the transfer, if he is aware of his duty to elect and of those circumstances which would influence the judgment of a reasonable man in making an election, or if he waives enquiry into the circumstances.\nSuch knowledge or waiver shall, in the absence of evidence to the contrary, be presumed, if the person on whom the benefit has been conferred has enjoyed it for two years without doing any act to express dissent.\nSuch knowledge of waiver may be inferred from any act of his which renders it impossible to place the persons interested in the property professed to be transferred in the same condition as if such act had not been done.\n\nIllustration\nA transfers to B an estate to which C is entitled, and as part of the same transaction gives C a coal-mine. C takes possession of the mine and exhausts it. He has thereby confirmed the transfer of the estate to B.\n\nIf he does not within one year after the date of the transfer signify to the transferor or his representatives his intention to confirm or to dissent from the transfer, the transferor or his representative may, upon the expiration of that period, require him to make his election; and, if he does not comply with such requisition within a reasonable time after he has received it, he shall be deemed to have elected to confirm the transfer.\nIn case of disability, the election shall be postponed until the disability ceases, or until the election is made by some competent authority."
    },
    {
        "section": "Section 36",
        "sectionNo": "36",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Apportionment of periodical payments determination of interest of person entitled",
        "description": "Appointment\n36. Apportionment of periodical payments determination of interest of person entitled.—In the absence of a contract or local usage to the contrary, all rents annuities, pensions, dividends and other periodical payments in the nature of income shall, upon the transfer of the interest of the person entitled to receive such payments, be deemed, as between the transferor and the transferee, to accrue due from day to day, and to be apportionable accordingly, but to be payable on the days appointed for the payment thereof."
    },
    {
        "section": "Section 37",
        "sectionNo": "37",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Apportionment of benefit of obligation on severance",
        "description": "37. Apportionment of benefit of obligation on severance.—When, in consequence of a transfer, property is divided and held in several shares, and thereupon the benefit of any obligation relating to the property as a whole passes from one to several owners of the property, the corresponding duty shall, in the absence of a contract to the contrary amongst the owners, be performed in favour of each of such owners in proportion to the value of his share in the property, provided that the duty can be severed and that the severance does not substantially increase the burden of the obligation; but if the duty cannot be severed, or if the severance would substantially increase the burden of the obligation the duty shall be performed for the benefit of such one of the several owners as they shall jointly designate for that purpose:\nProvided that no person on whom the burden of the obligation lies shall be answerable for failure to discharge it in manner provided by this section, unless and until he has had reasonable notice of the severance.\nNothing in this section applies to leases for agricultural purposes unless and until the State Government by notification in the Official Gazette so directs.\n\nIllustrations\n(a) A sells to B, C and D a house situated in a village and leased to E at an annual rent of Rs. 30 and delivery of one fat sheep, B having provided half the purchase-money and C and D one quarter each. E, having notice of this, must pay Rs. 15 to B, Rs. 7½ to C, and Rs. 7½ to D, and must deliver the sheep according to the Joint direction of B, C and D.\n(b) In the same case, each house in the village being bound to provide ten days' labour each year on a dyke to prevent inundation, E had agreed as a term of his lease to perform this work for A. B, C and D severally require E to perform the ten days' work due on account of the house of each. E is not bound to do more than ten days' work in all, according to such directions as B, C and D may join in giving."
    },
    {
        "section": "Section 38",
        "sectionNo": "38",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer by person authorised only under certain circumstances to transfer",
        "description": "(B) Transfer of Immovable property\n38. Transfer by person authorised only under certain circumstances to transfer.—Where any person, authorised only under circumstances in their nature variable to dispose of immoveable property, transfers such property for consideration, alleging the existence of such circumstances, they shall, as between the transferee on the one part and the transferor and other persons (if any) affected by the transfer on the other part, be deemed to have existed, if the transferee, after using reasonable care to ascertain the existence of such circumstances, has acted in good faith.\n\nIllustration\nA, a Hindu widow, whose husband has left collateral heirs, alleging that the property held by her as such is insufficient for her maintenance, agrees, for purposes neither religious nor charitable, to sell a field, part of such property, to B. B satisfies himself by reasonable enquiry that the income of the property is insufficient for A's maintenance, and that the sale of the field is necessary, and acting in good faith, buys the field from A. As between B on the one part and A and the collateral heirs on the other part, a necessity for the sale shall be deemed to have existed."
    },
    {
        "section": "Section 39",
        "sectionNo": "39",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer where third person is entitled to maintenance",
        "description": "39. Transfer where third person is entitled to maintenance.—Where a third person has a right to receive maintenance, or a provision for advancement or marriage, from the profits of immoveable property, and such property is transferred 1*** the right may be enforced against the transferee, if he has notice 2[thereof] or if the transfer is gratuitous; but not against a transferee for consideration and without notice of the right, nor against such property in his hands.\n1* * * * *"
    },
    {
        "section": "Section 40",
        "sectionNo": "40",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Burden of obligation imposing restriction on use of land or of obligation annexed to ownership but not amounting to interest or easement",
        "description": "40. Burden of obligation imposing restriction on use of land.—Where, for the more beneficial enjoyment of his own immoveable property, a third person has, independently of any interest in the immoveable property of another or of any easement thereon, a right to restrain the enjoyment2[in a particular manner of the latter property], or\nor of obligation annexed to ownership but not amounting to interest or easement.—where a third person is entitled to the benefit of an obligation arising out of contract and annexed to the ownership of immoveable property, but not amounting to an interest therein or easement thereon,\nsuch right or obligation may be enforced against a transferee with notice thereof or a gratuitous transferee of the property affected thereby, but not against a transferee for consideration and without notice of the right or obligation, nor against such property in his hands.\n\nIllustration\nA contracts to sell Sultanpur to B. While the contract is still in force he sells Sultanpur to C, who has notice of the contract. B may enforce the contract against C to the same extent as against A."
    },
    {
        "section": "Section 41",
        "sectionNo": "41",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer by ostensible owner",
        "description": "41. Transfer by ostensible owner.—Where, with the consent, express or implied, of the persons interested in immoveable property, a person is the ostensible owner of such property and transfers the same for consideration, the transfer shall not be violable on the ground that the transferor was not authorised to make it:\nProvided that the transferee, after taking reasonable care to ascertain that the transferor had power to make the transfer, has acted in good faith."
    },
    {
        "section": "Section 42",
        "sectionNo": "42",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer by person having authority to revoke former transfer",
        "description": "42. Transfer by person having authority to revoke former transfer.—Where a person transfers any immoveable property, reserving power to revoke the transfer, and subsequently transfers the property for consideration to another transferee, such transfer operates in favour of such transferee (subject to any condition attached to the exercise of the power) as a revocation of the former transfer to the extent of the power.\n\nIllustration\nA lets a house to B, and reserves power to revoke the lease if, in the opinion of a specified surveyor, B should make a use of it detrimental to its value. Afterwards A, thinking that such a use has been made, lets the house to C. This operates as a revocation of B's lease subject to the opinion of the surveyor as to B's use of the house having been detrimental to its value."
    },
    {
        "section": "Section 43",
        "sectionNo": "43",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer by unauthorised person who subsequently acquires interest in property transferred",
        "description": "43. Transfer by unauthorised person who subsequently acquires interest in property transferred.—Where a person 3[fraudulently or] erroneously represents that he is authorised to transfer certain immovable property and professes to transfer such property for consideration, such transfer shall, at the option of the transferee, operate on any interest which the transferor may acquire in such property at any time during which the contract of transfer subsists.\nNothing in this section shall impair the right of transferees in good faith for consideration without notice of the existence of the said option.\n\nIllustration\nA, a Hindu who has separated from his father B, sells to C three fields, X, Y and Z, representing that A is authorised to transfer the same. Of these fields Z does not belong to A, it having been retained by B on the partition; but on B's dying A as heir obtains Z.C, not having rescinded the contract of sale, may require A to deliver Z to him ."
    },
    {
        "section": "Section 44",
        "sectionNo": "44",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer by one co-owner",
        "description": "44. Transfer by one co-owner.—Where one of two or more co-owners of immoveable property legally competent in that behalf transfers his share of such property or any interest therein, the transferee acquires as to such share or interest, and so far as is necessary to give effect to the transfer, the transferor's right to joint possession or other common or part enjoyment of the property, and to enforce a partition of the same, but subject to the conditions and liabilities affecting, at the date of the transfer, the share or interest so transferred.\nWhere the transferee of a share of a dwelling-house belonging to an undivided family is not a member of the family, nothing in this section shall be deemed to entitle him to joint possession or other common or part enjoyment of the house."
    },
    {
        "section": "Section 45",
        "sectionNo": "45",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Joint transfer for consideration",
        "description": "45. Joint transfer for consideration.—Where immoveable property is transferred for consideration to two or more persons and such consideration is paid out of a fund belonging to them in common, they are, in the absence of a contract to the contrary, respectively entitled to interests in such property identical, as nearly as may be, with the interests to which they were respectively entitled in the fund; and, where such consideration is paid out of separate funds belonging to them respectively, they are, in the absence of a contract to the contrary, respectively entitled to interests in such property in proportion to the shares of the consideration which they respectively advanced.\nIn the absence of evidence as to the interests in the fund to which they were respectively entitled, or as to the shares which they respectively advanced, such persons shall be presumed to be equally interested in the property."
    },
    {
        "section": "Section 46",
        "sectionNo": "46",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer for consideration by persons having distinct interests",
        "description": "46. Transfer for consideration by persons having distinct interests.—Where immoveable property is transferred for consideration by persons having distinct interests therein, the transferors are, in the absence of a contract to the contrary, entitled to share in the consideration equally, where their interests in the property were of equal value, and, where such interests were of unequal value, proportionately to the value of their respective interests.\n\nIllustration\n(a) A, owing a moiety, and B and C, each a quarter share, of mauza Sultanpur, exchange an eighth share of that mauza for a quarter share of mauza Lalpura. There being no agreement to the contrary, A is entitled to an eighth share in Lalpura, and B and C each to a sixteenth share in that mauza.\n(b) A, being entitled to a life-interest in mauza Atrali and B and C to the reversion, sell the mauza for Rs. 1,000. A's life-interest is ascertained to be worth Rs. 600, the reversion Rs. 400. A is entitled to receive Rs. 600 out of the purchase-money. B and C to receive Rs. 4000."
    },
    {
        "section": "Section 47",
        "sectionNo": "47",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer by co-owners of share in common property",
        "description": "47. Transfer by co-owners of share in common property.—Where several co-owners of immoveable property transfer a share therein without specifying that the transfer is to take effect on any particular share or shares of the transferors, the transfer, as among such transferors, takes effect on such shares equally where the shares were equal, and, where they were unequal, proprotionately to the extent of such shares.\n\nIllustration\nA, the owner of an eight-anna share, and B and C, each the owner of a four-anna share, in mauza Sultanpur, transfer a two-anna share in the mauza to D, without specifying from which of their several shares the transfer is made. To give effect to the transfer one-anna share is taken from the share of A, and half-an-anna share from each of the shares of B and C."
    },
    {
        "section": "Section 48",
        "sectionNo": "48",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Priority of rights created by transfer",
        "description": "48. Priority of rights created by transfer.—Where a person purports to create by transfer at different times rights in or over the same immoveable property, and such rights cannot all exist or be exercised to their full extent together, each later created right shall, in the absence of a special contract or reservation binding the earlier transferees, be subject to the rights previously created."
    },
    {
        "section": "Section 49",
        "sectionNo": "49",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transferee's right under policy",
        "description": "49. Transferee’s right under policy.—Where immoveable property is transferred for consideration, and such property or any part thereof is at the date of the transfer insured against loss or damage by fire, the transferee, in case of such loss or damage, may, in the absence of a contract to the contrary, require any money which the transferor actually receives under the policy, or so much thereof as may be necessary, to be applied in reinstating the property."
    },
    {
        "section": "Section 50",
        "sectionNo": "50",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Rent bona fide paid to holder under defective title",
        "description": "50. Rent bona fide paid to holder under defective title.—No person shall be chargeable with any rents or profits of any immoveable property, which he has in good faith paid or delivered to any person of whom he in good faith held such property, notwithstanding it may afterwards appear that the person to whom such payment or delivery was made had no right to receive such rents or profits.\n\nIllustration\nA lets a field to B at a rent of Rs. 50, and then transfers the field to C. B, having no notice of the transfer, in good faith pays the rent to A. B is not chargeable with the rent so paid."
    },
    {
        "section": "Section 51",
        "sectionNo": "51",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Improvements made by bona fide holders under defective titles",
        "description": "51. Improvements made by bona fide holders under defective titles.—When the transferee of immoveable property makes any improvement on the property, believing in good faith that he is absolutely entitled thereto, and he is subsequently evicted there from by any person having a better title, the transferee has a right to require the person causing the eviction either to have the value of the improvement estimated and paid or secured to the transferee, or to sell his interest in the property to the transferee at the then market value thereof, irrespective of the value of such improvement.\nThe amount to be paid or secured in respect of such improvement shall be the estimated value thereof at the time of the eviction.\nWhen, under the circumstances aforesaid, the transferee has planted or sown on the property crops which are growing when he is evicted therefrom, he is entitled to such crops and to free ingress and egress to gather and carry them."
    },
    {
        "section": "Section 52",
        "sectionNo": "52",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Transfer of property pending suit relating thereto",
        "description": "52. Transfer of property pending suit relating thereto.—During the 1[pendency] in any Court having authority 2[3[within the limits of India excluding the State of Jammu and Kashmir] or established beyond such limits] by 4[the Central Government 5 ***], of 6[any] suit or proceeding 7[which is not collusive and] in. which any right to immoveable property is directly and specifically in question, the property cannot be transferred or otherwise dealt with by any party to the suit or proceeding so as to affect the rights of any other party thereto under any decree or order which may be made therein, except under the authority of the Court and on such terms as it may impose.\n7[Explanation.—For the purposes of this section, the pendency of a suit or proceeding shall be deemed to commence from the date of the presentation of the plaint or the institution of the proceeding in a Court of competent jurisdiction, and to continue until the suit or proceeding has been disposed of by a final decree or order and complete satisfaction or discharge of such decree or order, has been obtained, or has become unobtainable by reason of the expiration of any period of limitation prescribed for the execution thereof by any law for the time being in force.]"
    },
    {
        "section": "Section 53",
        "sectionNo": "53",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Fraudulent transfer",
        "description": "8[53. Fraudulent transfer.—(1) Every transfer of immoveable property made with intent to defeat or delay the creditors of the transferor shall be voidable at the option of any creditor so defeated or delayed.\nNothing in this sub-section shall impair the rights of a transferee in good faith and for consideration.\nNothing in this sub-section shall affect any law for the time being in force relating to insolvency.\nA suit instituted by a creditor (which term includes a decree-holder whether he has or has not applied for execution of his decree) to avoid a transfer on the ground that it has been made with intent to defeat or delay the creditors of the transferor, shall be instituted on behalf of, or for the benefit of, all the creditors.\n(2) Every transfer of immoveable property made without consideration with intent to defraud a subsequent transferee shall be voidable at the option of such transferee.\nFor the purposes of this sub-section, no transfer made without consideration shall be deemed to have been made with intent to defraud by reason only that a subsequent transfer for consideration was made.]"
    },
    {
        "section": "Section 53A",
        "sectionNo": "53A",
        "chapterNo": 2,
        "chapterRoman": "II",
        "chapterName": "OF TRANSFERS OF PROPERTY BY ACT OF PARTIES",
        "title": "Part performance",
        "description": "1[53A. Part performance.—Where any person contracts to transfer for consideration any immoveable property by writing signed by him or on his behalf from which the terms necessary to constitute the transfer can be ascertained with reasonable certainty,\nand the transferee has, in part performance of the contract, taken possession of the property or any part thereof, or the transferee, being already in possession, continues in possession in part performance of the contract and has done some act in furtherance of the contract,\nand the transferee has performed or is willing to perform his part of the contract,\nthen, notwithstanding that 2***, or, where there is an instrument of transfer, that the transfer has not been completed in the manner prescribed therefor by the law for the time being in force, the transferor or any person claiming under him shall be debarred from enforcing against the transferee and persons claiming under him any right in respect of the property of which the transferee has taken or continued in possession, other than a right expressly provided by the terms of the contract:\nProvided that nothing in this section shall affect the rights of a transferee for consideration who has no notice of the contract or of the part performance thereof.]"
    },

    # ---------------------------------------------------------
    # CHAPTER III : OF SALES OF IMMOVEABLE PROPERTY
    # ---------------------------------------------------------
    {
        "section": "Section 54",
        "sectionNo": "54",
        "chapterNo": 3,
        "chapterRoman": "III",
        "chapterName": "OF SALES OF IMMOVEABLE PROPERTY",
        "title": "“Sale” defined. Sale how made. Contract for sale.",
        "description": "54. “Sale” defined.—“Sale” is a transfer of ownership in exchange for a price paid or promised or part-paid and part-promised.\nSale how made.—Such transfer, in the case of tangible immoveable property of the value of one hundred rupees and upwards, or in the case of a reversion or other intangible thing, can be made only by a registered instrument.\nIn the case of tangible immoveable property of a value less than one hundred rupees, such transfer may be made either by a registered instrument or by delivery of the property.\nDelivery of tangible immoveable property takes place when the seller places the buyer, or such person as he directs, in possession of the property.\nContract for sale.—A contract for the sale of immoveable property is a contract that a sale of such property shall take place on terms settled between the parties.\nIt does not, of itself, create any interest in or charge on such property."
    },
    {
        "section": "Section 55",
        "sectionNo": "55",
        "chapterNo": 3,
        "chapterRoman": "III",
        "chapterName": "OF SALES OF IMMOVEABLE PROPERTY",
        "title": "Rights and liabilities of buyer and seller",
        "description": "55. Rights and liabilities of buyer and seller.—In the absence of a contract to the contrary, the buyer and the seller of immoveable property respectively are subject to the liabilities, and have the rights, mentioned in the rules next following, or such of them as are applicable to the property sold:\n(1) The seller is bound—\n(a) to disclose to the buyer any material defect in the property 3[or in the seller’s title thereto] of which the seller is, and the buyer is not, aware, and which the buyer could not with ordinary care discover;\n(b) to produce to the buyer on his request for examination all documents of title relating to the property which are in the seller's possession or power;\n(c) to answer to the best of his information all relevant questions put to him by the buyer in respect to the property or the title thereto;\n(d) on payment or tender of the amount due in respect of the price, to execute a proper conveyance of the property when the buyer tenders it to him for execution at a proper time and place;\n(e) between the date of the contract of sale and the delivery of the property, to take as much care of the property and all documents of title relating thereto which are in his possession as an owner of ordinary prudence would take of such property and documents;\n(f) to give, on being so required, the buyer, or such person as he directs, such possession of the property as its nature admits;\n(g) to pay all public charges and rent accrued due in respect of the property up to the date of the sale, the interest on all incumbrances on such property due on such date, and, except where the property is sold subject to incumbrances, to discharge all incumbrances on the property then existing.\n(2) The seller shall be deemed to contract with the buyer that the interest which the seller professes to transfer to the buyer subsists and that he has power to transfer the same:\nProvided that, where the sale is made by a person in a fiduciary character, he shall be deemed to contract with the buyer that the seller has done no act whereby the property is incumbered or whereby he is hindered from transferring it.\nThe benefit of the contract mentioned in this rule shall be annexed to, and shall go with, the interest of the transferee as such, and may be enforced by every person in whom that interest is for the whole or any part thereof from time to time vested.\n(3) Where the whole of the purchase-money has been paid to the seller, he is also bound to deliver to the buyer all documents of title relating to the property which are in the seller’s possession or power:\nProvided that, (a) where the seller retains any part of the property comprised in such documents, he is entitled to retain them all, and, (b) where the whole of such property is sold to different buyers the buyers, of the lot of greatest value is entitled to such documents. But in case (a) the seller, and in case (b) the buyer, of the lot of greatest value, is bound, upon every reasonable request by the buyer, or by any of the other buyers, as the case may be, and at the cost of the person making the request, to produce the said documents and furnish such true copies thereof or extracts therefrom as he may require; and in the meantime, the seller, or the buyer of the lot of greatest value, as the case may be, shall keep the said documents safe, uncancelled and undefaced, unless prevented from so doing by fire or other inevitable accident.\n(4) The seller is entitled—\n(a) to the rents and profits of the property till the ownership thereof passes to the buyer;\n(b) where the ownership of the property has passed to the buyer before payment of the whole of the purchase-money, to a charge upon the property in the hands of the buyer, 1[any transferee without consideration or any transferee with notice of the non-payment,] for the amount of the purchase-money, or any part thereof remaining unpaid, and for interest on such amount or part 1[from the date on which possession has been delivered].\n(5) The buyer is bound—\n(a) to disclose to the seller any fact as to the nature or extent of the seller’s interest in the property of which the buyer is aware, but of which he has reason to believe that the seller is not aware, and which materially increases the value of such interest;\n(b) to pay or tender, at the time and place of completing the sale, the purchase-money to the seller or such person, as he directs: provided that, where the property is sold free from incumbrances, the buyer may retain out of the purchase-money the amount of any incumbrances on the property existing at the date of the sale, and shall pay the amount so retained to the persons entitled thereto;\n(c) where the ownership of the property has passed to the buyer, to bear any loss arising from the destruction, injury or decrease in value of the property not caused by the seller;\n(d) where the ownership of the property has passed to the buyer, as between himself and the seller, to pay all public charges and rent which may become payable in respect of the property, the principal moneys due on any incumbrances subject to which the property is sold, and the interest thereon afterwards accruing due.\n(6) The buyer is entitled—\n(a) where the ownership of the property has passed to him, to the benefit of any improvement in, or increase in value of, the property, and to the rents and profits thereof;\n(b) unless he has improperly declined to accept delivery of the property, to a charge on the property, as against the seller and all persons claiming under him 1*** to the extent of the seller's interest in the property, for the amount of any purchase-money properly paid by the buyer in anticipation of the delivery and for interest on such amount; and, when he properly declines to accept the delivery, also for the earnest (if any) and for the costs (if any) awarded to him of a suit to compel specific performance of the contract or to obtain a decree for its rescission.\nAn omission to make such disclosures as are mentioned in this section, paragraph (1), clause (a), and paragraph (5), clause (a), is fraudulent."
    },
    {
        "section": "Section 56",
        "sectionNo": "56",
        "chapterNo": 3,
        "chapterRoman": "III",
        "chapterName": "OF SALES OF IMMOVEABLE PROPERTY",
        "title": "Marshalling by subsequent purchaser",
        "description": "2[56. Marshalling by subsequent purchaser.—If the owner of two or more properties mortgages them to one person and then sells one or more of the properties to another person, the buyer is, in the absence of a contract to the contrary, entitled to have the mortgage-debt satisfied out of the property or properties not sold to him, so far as the same will extend, but not so as to prejudice the rights of the mortgagee or persons claiming under him or any other person who has for consideration acquired an interest in any of the properties.]"
    },
    {
        "section": "Section 57",
        "sectionNo": "57",
        "chapterNo": 3,
        "chapterRoman": "III",
        "chapterName": "OF SALES OF IMMOVEABLE PROPERTY",
        "title": "Provision by Court for incumbrances and sale freed therefrom",
        "description": "Discharge of Incumbrances on Sale\n57. Provision by Court for incumbrances and sale freed therefrom.—(a) Where immoveable property subject to any incumbrance, whether immediately payable or not, is sold by the Court or in execution of a decree, or out of Court, the Court may, if it thinks fit, on the application of any party to the sale, direct or allow payment into Court,—\n(1) in case of an annual or monthly sum charged on the property, or of a capital sum charged on a determinable interest in the property—of such amount as, when invested in securities of the Central Government, the Court considers will be sufficient, by means of the interest thereof, to keep down or otherwise provide for that charge, and\n(2) in any other case of a capital sum charged on the property—of the amount sufficient to meet the incumbrance and an interest due thereon.\nBut in either case there shall also be paid into Court such additional amount as the Court considers will be sufficient to meet the contingency of further costs, expenses and interest, and any other contingency, except depreciation of investments, not exceeding one-tenth part of the original amount to be paid in, unless the Court for special reasons (which it shall record) thinks fit to require a larger additional amount.\n(b) Thereupon the Court may, if it thinks fit, and after notice to the incumbrancer, unless the Court, for reasons to be recorded in writing, thinks fit to dispense with such notice, declare the property to be freed from the incumbrance, and make any order for conveyance, or vesting order, proper for giving effect to the sale, and give directions for the retention and investment of the money in Court.\n(c) After notice served on the persons interested in or entitled to the money or fund in Court, the Court may direct payment or transfer thereof to the persons entitled to receive or give a discharge for the same, and generally may give directions respecting the application or distribution of the capital or income thereof.\n(d) An appeal shall lie from any declaration, order or direction under this section as if the same were a decree.\n(e) In this section “Court” means (1) a High Court in the exercise of its ordinary or extraordinary original civil jurisdiction, (2) the Court of a District Judge within the local limits of whose jurisdiction the property or any part thereof is situate, (3) any other Court which the State Government may, from time to time, by notification in the Official Gazette, declare to be competent to exercise the jurisdiction conferred by this section."
    }
]

print(f"Loaded {len(sections)} sections so far...")
