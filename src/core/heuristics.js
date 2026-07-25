export const NNG_SOURCE = {
  label: "Jakob Nielsen’s 10 usability heuristics",
  url: "https://www.nngroup.com/articles/ten-usability-heuristics/",
  disclaimer:
    "Independent heuristic review. SiteProof is not affiliated with or endorsed by Nielsen Norman Group."
};

export const HEURISTICS = [
  {
    id: "H1",
    title: "Visibility of system status",
    titleZh: "系統狀態是否清楚",
    questionEn:
      "After an important action, can people immediately tell whether the system is working, succeeded, or failed?",
    questionZh:
      "重要操作後，使用者能否立即知道系統正在處理、成功或失敗？"
  },
  {
    id: "H2",
    title: "Match between system and the real world",
    titleZh: "是否使用使用者熟悉的語言",
    questionEn:
      "Do the words, order, and concepts match the target audience instead of internal terminology?",
    questionZh:
      "文字、順序和概念是否貼近目標使用者，而不是內部術語？"
  },
  {
    id: "H3",
    title: "User control and freedom",
    titleZh: "使用者是否保有控制權",
    questionEn:
      "Can people cancel, go back, or correct an action without starting over?",
    questionZh:
      "使用者能否取消、返回或修正操作，而不必從頭開始？"
  },
  {
    id: "H4",
    title: "Consistency and standards",
    titleZh: "一致性與既有慣例",
    questionEn:
      "Do equivalent actions use consistent names, appearances, and locations?",
    questionZh:
      "相同操作是否使用一致的名稱、外觀與位置？"
  },
  {
    id: "H5",
    title: "Error prevention",
    titleZh: "是否預防錯誤",
    questionEn:
      "Does the interface use constraints, confirmation, or clear guidance before risky actions?",
    questionZh:
      "介面是否在高風險操作前提供限制、確認或清楚提示？"
  },
  {
    id: "H6",
    title: "Recognition rather than recall",
    titleZh: "辨識優於記憶",
    questionEn:
      "Are the information and choices required for the primary task kept visible?",
    questionZh:
      "完成主要任務所需的資訊與選項是否保持可見？"
  },
  {
    id: "H7",
    title: "Flexibility and efficiency of use",
    titleZh: "彈性與效率",
    questionEn:
      "Can a first-time visitor understand the interface while experienced users remain efficient?",
    questionZh:
      "新手能否理解，熟練使用者是否也能有效率地完成任務？"
  },
  {
    id: "H8",
    title: "Aesthetic and minimalist design",
    titleZh: "內容是否少而有用",
    questionEn:
      "Does secondary information compete with the primary task, message, or action?",
    questionZh:
      "次要資訊是否干擾主要任務、訊息或行動？"
  },
  {
    id: "H9",
    title: "Recognize, diagnose, and recover from errors",
    titleZh: "能否理解並修復錯誤",
    questionEn:
      "Do error messages explain the problem, likely cause, and useful next step?",
    questionZh:
      "錯誤訊息是否指出問題、原因以及下一步？"
  },
  {
    id: "H10",
    title: "Help and documentation",
    titleZh: "是否在需要時提供協助",
    questionEn:
      "Do unfamiliar or complex actions provide contextual guidance or easy-to-find help?",
    questionZh:
      "複雜或不熟悉的操作是否提供就地說明或容易找到的協助？"
  }
];

export function buildHeuristicReview(findings = [], primaryTask = "") {
  return HEURISTICS.map((heuristic) => {
    const relatedFindings = findings
      .filter((finding) => finding.heuristics?.includes(heuristic.id))
      .map((finding) => finding.id);

    return {
      ...heuristic,
      status: relatedFindings.length ? "potential-risk" : "needs-human-review",
      relatedFindings,
      primaryTask,
      automation: relatedFindings.length ? "assisted" : "human",
      confidence: relatedFindings.length ? "medium" : "unrated"
    };
  });
}
