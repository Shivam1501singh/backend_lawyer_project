const DEFAULT_PRACTICE_AREAS = [
  { id: "Criminal Law", name: "Criminal Law" },
  { id: "Civil Law", name: "Civil Law" },
  { id: "Family Law", name: "Family Law" },
  { id: "Constitutional Law", name: "Constitutional Law" },
  { id: "Corporate Law", name: "Corporate Law" },
  { id: "Intellectual Property", name: "Intellectual Property" },
  { id: "Labor Law", name: "Labor Law" },
  { id: "Tax Law", name: "Tax Law" },
  { id: "Real Estate Law", name: "Real Estate Law" },
  { id: "Environmental Law", name: "Environmental Law" }
];

const DEFAULT_COURTS = [
  { id: "Supreme Court of India", name: "Supreme Court of India" },
  { id: "Delhi High Court", name: "Delhi High Court" },
  { id: "Bombay High Court", name: "Bombay High Court" },
  { id: "Calcutta High Court", name: "Calcutta High Court" },
  { id: "Madras High Court", name: "Madras High Court" },
  { id: "Allahabad High Court", name: "Allahabad High Court" },
  { id: "Patna High Court", name: "Patna High Court" },
  { id: "Karnataka High Court", name: "Karnataka High Court" },
  { id: "Gujarat High Court", name: "Gujarat High Court" },
  { id: "Rajasthan High Court", name: "Rajasthan High Court" }
];

export const getPracticeAreas = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      practiceAreas: DEFAULT_PRACTICE_AREAS
    });
  } catch (error) {
    next(error);
  }
};

export const getCourts = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      courts: DEFAULT_COURTS
    });
  } catch (error) {
    next(error);
  }
};
