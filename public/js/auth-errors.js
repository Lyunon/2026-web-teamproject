export function authErrorMessage(error) {
  const messages = {
    "auth/popup-closed-by-user": "로그인 창이 닫혔어요. 다시 시도해 주세요.",
    "auth/cancelled-popup-request": "로그인 창이 이미 열려 있어요.",
    "auth/popup-blocked": "팝업이 차단됐어요. 팝업을 허용한 뒤 다시 시도해 주세요.",
    "auth/unauthorized-domain": "이 주소에서는 로그인할 수 없어요. 관리자에게 문의해 주세요.",
    "auth/operation-not-allowed": "구글 로그인을 준비하고 있어요. 잠시 후 다시 시도해 주세요.",
    "auth/network-request-failed": "인터넷 연결을 확인한 뒤 다시 시도해 주세요.",
    "permission-denied": "회원 정보를 확인하거나 저장할 수 없어요. 관리자에게 문의해 주세요.",
    "unavailable": "서버에 연결할 수 없어요. 인터넷 연결을 확인하고 다시 시도해 주세요.",
    "deadline-exceeded": "서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.",
  };
  return messages[error?.code] || "요청을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
