// UI와 프로필 저장에서 공통으로 사용하는 닉네임 규칙.
export function validateNickname(value) {
  const nickname = String(value ?? "").normalize("NFC").trim();
  if (!/^[가-힣a-zA-Z0-9_]{2,12}$/.test(nickname)) {
    throw new Error("닉네임은 한글, 영문, 숫자, 밑줄(_)로 2~12자 입력해 주세요. 공백은 사용할 수 없어요.");
  }
  return nickname;
}
export function hasProfile(profile) {
  if (!profile) return false;
  try { return validateNickname(profile.nickname) === profile.nickname; }
  catch { return false; }
}
