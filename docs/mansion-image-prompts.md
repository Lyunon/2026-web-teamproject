# 송림 저택 사건 이미지 생성 가이드

사건 현장(`play.html`)을 사실적인 그림으로 바꾸기 위한 이미지 생성 프롬프트입니다.
영어 프롬프트가 이미지 생성 AI에서 결과가 더 안정적이라 영어로 적었습니다.

## 방식

1. **현장 배경 1장 (필수)** — 증거물 9개가 모두 그려진 서재 전체 그림.
   게임에서는 그림 속 물건 위에 클릭 표시(🔎)와 이름표를 올립니다. 물건을 따로 오려 낼 필요가 없습니다.
2. **증거물 클로즈업 9장 (선택)** — 증거물을 클릭했을 때 감식 팝업에 크게 보여 줄 그림.
   없으면 배경에서 해당 부분을 잘라 씁니다. 따로 만들면 훨씬 선명합니다.

모든 그림에 아래 **공통 스타일**을 붙여서 톤을 맞춥니다.

### 목표 분위기

한국 추리 예능 포스터처럼 **실사 사진** 느낌으로 갑니다.
- 어두운 방에 조명이 한두 개뿐이고, 그림자가 깊다.
- 차가운 청록색과 어두운 핏빛 붉은색이 섞인 색감.
- 거칠고 낡은 질감, 필름 노이즈.
- 그림이나 일러스트가 아니라 드라마 세트를 찍은 사진처럼.

## 공통 스타일 (모든 프롬프트 끝에 붙이기)

```text
photorealistic, cinematic still from a Korean mystery thriller TV show, shot on a full-frame camera with a 35mm lens, low-key lighting, a single warm practical lamp as the main light, deep shadows, cold teal-green ambient light mixed with dim crimson accents, desaturated gritty color grade, dust in the air, film grain, ultra detailed real textures, no people, no text, no watermark, not an illustration
```

## 1. 현장 배경 — 서재 전체

- 비율: **16:9 가로** (가능하면 2560×1440 이상)
- 파일 이름: `bg-study.png`

```text
Wide establishing shot of a luxurious old-fashioned private study on the second floor of a secluded hillside mansion, at night during a violent rainstorm. Eye-level view from the room's entrance, the whole room visible.
Left wall: a heavy dark wooden inner door, slightly ajar, leading to a bedroom.
Back left: a tall window with rain streaming down the glass and lightning in the distance, latched shut from inside.
Back wall: built-in bookshelves, and a wall-mounted wooden medicine cabinet with a glass front holding a few amber pill bottles.
Left foreground: an empty high-backed burgundy leather armchair with a wool blanket slipped off onto the floor.
Center: a large mahogany desk with a green banker's lamp, a silver tray holding an empty brandy glass and a torn pill wrapper, a neat stack of legal papers (an unsigned will draft), and one desk drawer pulled slightly open.
Back right: a small security monitor on a side cabinet showing four grainy CCTV feeds of hallways.
Right foreground: a black leather doctor's bag left on a side chair.
Persian rug on a dark hardwood floor. The room is mostly dark: only the green desk lamp is on, the rest lit by cold light from the stormy window and lightning. Tense, eerie atmosphere, as if the room was left untouched right after something happened.
```

> 시신은 그리지 않습니다. 빈 안락의자와 흘러내린 담요로 분위기만 냅니다.
> AI가 물건 위치를 정확히 따르지 않아도 괜찮습니다. 그림이 나오면 클릭 위치를 그림에 맞춰 다시 잡습니다.

## 2. 증거물 클로즈업 (선택)

- 비율: **1:1 정사각형** (1024×1024 정도)
- 배경: 어두운 배경 그대로 괜찮습니다. 투명 배경이 아니어도 됩니다.
- 게임에서 **테이프로 붙인 폴라로이드 증거 사진** 틀을 씌워 보여 줄 예정이라, 사진 자체에는 틀이나 글자를 넣지 않습니다.
- 각 프롬프트 뒤에 `, forensic evidence photograph, close-up taken with a flash in a dark room, harsh flash light and hard shadows` + 공통 스타일을 붙입니다.

| 파일 이름 | 증거물 | 프롬프트 |
| --- | --- | --- |
| `ev-door.png` | 서재의 안쪽 문 | `a heavy dark wooden door slightly ajar, brass handle with fresh fingerprints smudged in dust, a thin strip of dim light from the next room` |
| `ev-window.png` | 폭우로 고립된 창밖 | `a tall mansion window latched from inside, heavy rain streaming down the glass, flooded mountain road and fallen tree visible outside under lightning` |
| `ev-medicine-cabinet.png` | 서재 약장 | `an open wall-mounted wooden medicine cabinet, several amber pharmacy pill bottles, one brand-new bottle with a suspiciously perfect, crisp label standing in front` |
| `ev-armchair.png` | 안락의자 현장 | `an empty high-backed burgundy leather armchair with a deep impression in the cushion, a wool blanket slipped to the floor, reading glasses on the armrest` |
| `ev-tray.png` | 취침 전 쟁반 | `a silver serving tray with an empty crystal brandy glass and a torn foil pill wrapper` |
| `ev-will.png` | 서재 책상 위 유언장 | `a stack of legal papers titled as a will draft on a mahogany desk, empty signature line, a fountain pen with the cap on beside it` |
| `ev-drawer.png` | 서재 책상 서랍 | `a half-open desk drawer revealing a worn leather pocket notebook with a handwritten memo page` |
| `ev-cctv.png` | 보안실 복도 CCTV | `a small security monitor split into four grainy black-and-white CCTV feeds of a mansion hallway, timestamps glowing in the corner` |
| `ev-doctor-bag.png` | 오진석의 의료 가방 | `an open black leather doctor's bag, a stethoscope, an amber pharmacy pill bottle and a sheet of blank adhesive labels inside` |

## 넣는 방법

만든 그림을 `public/images/mansion/raw/` 폴더에 위 파일 이름으로 넣거나 채팅창에 올려 주세요.
크기 조절, 용량 압축, 색감 맞추기, 클릭 위치 배치, 코드 연결은 Claude가 합니다.

이미지는 사용 권한이 있는 것만 씁니다. 직접 생성한 이미지라면 사용하는 생성 서비스의 이용 약관을 확인해 주세요.
