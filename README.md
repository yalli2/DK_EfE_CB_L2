# English for Everyone · Level 2 — Interactive Course Book (Units 1–15)

수업용 인터랙티브 사이트 (교재 pp. 12–57). 각 단원에 도표·그림 설명과 교재의 모든 연습문제(채우기, 고르기, 연결, 듣기, 단어 찾기, 그림 보고 쓰기 등)가 들어 있습니다.

| Unit | 주제 | 링크 |
|---|---|---|
| 1 | Talking about yourself (be동사) | [Unit1](https://yalli2.github.io/DK_EfE_CB_L2/Unit1/) |
| 2 | Talking about routines (현재 단순) | [Unit2](https://yalli2.github.io/DK_EfE_CB_L2/Unit2/) |
| 3 | Today I'm wearing… (현재진행형) | [Unit3](https://yalli2.github.io/DK_EfE_CB_L2/Unit3/) |
| 4 | What's happening? (진행형 의문문) | [Unit4](https://yalli2.github.io/DK_EfE_CB_L2/Unit4/) |
| 5 | Types of verbs (동작/상태동사) | [Unit5](https://yalli2.github.io/DK_EfE_CB_L2/Unit5/) |
| 6 | Vocabulary: Feelings and moods (감정 어휘) | [Unit6](https://yalli2.github.io/DK_EfE_CB_L2/Unit6/) |
| 7 | How are you feeling? (기분 말하기) | [Unit7](https://yalli2.github.io/DK_EfE_CB_L2/Unit7/) |
| 8 | Vocabulary: Transportation (교통수단) | [Unit8](https://yalli2.github.io/DK_EfE_CB_L2/Unit8/) |
| 9 | Routines and exceptions (습관 vs 예외) | [Unit9](https://yalli2.github.io/DK_EfE_CB_L2/Unit9/) |
| 10 | Vocabulary: The body (신체) | [Unit10](https://yalli2.github.io/DK_EfE_CB_L2/Unit10/) |
| 11 | What's the matter? (아픈 곳 말하기) | [Unit11](https://yalli2.github.io/DK_EfE_CB_L2/Unit11/) |
| 12 | Vocabulary: Weather (날씨) | [Unit12](https://yalli2.github.io/DK_EfE_CB_L2/Unit12/) |
| 13 | What's the weather like? (날씨 묘사·기온) | [Unit13](https://yalli2.github.io/DK_EfE_CB_L2/Unit13/) |
| 14 | Vocabulary: Travel (여행) | [Unit14](https://yalli2.github.io/DK_EfE_CB_L2/Unit14/) |
| 15 | Making comparisons (비교급) | [Unit15](https://yalli2.github.io/DK_EfE_CB_L2/Unit15/) |

메인: https://yalli2.github.io/DK_EfE_CB_L2/

- 어휘 단원(6·8·10·12·14)은 교재에 연습문제가 없어 추가 연습(6.A 등, 교재 외)을 넣었습니다.
- 빌드 과정 없는 정적 사이트(HTML/CSS/JS). `shared/` 에 공통 엔진·스타일·그림이 있습니다.
- 듣기 문제는 브라우저 음성(TTS)을 사용합니다. 공식 오디오는 dkefe.com 에서 받을 수 있습니다.
- 풀이 기록은 학생 브라우저(localStorage)에 저장되고, 우리반 로그인을 하면 점수가 실시간으로 공유됩니다.

## 🏆 우리반 모드 (로그인 · 실시간 순위)
- 학생: 단원 페이지 오른쪽 위 **로그인** → 반 코드 + 이름 + PIN 4자리. 다른 기기에서도 같은 정보로 로그인하면 점수가 이어집니다.
- 순위: 단원 페이지의 **🏆 우리반** 버튼(이 단원 / 전체), 메인 페이지 아래 **우리반 대시보드**(단원별 표).
- 점수: 연습문제 = 맞힌 비율×10 + 만점 보너스 5 (최고 기록) · 말하기 = 발음 정확도 10%당 1점 (단원별 최고 10문장). 정답 보기 후 푼 문제는 제외.
- 교사: `https://yalli2.github.io/DK_EfE_CB_L2/?room=반코드&teacher` → 공유 링크·QR, CSV 내보내기, 학생 삭제, 반 초기화.
- 학생 공유 링크: `https://yalli2.github.io/DK_EfE_CB_L2/?room=반코드`
- 실시간 공유는 공개 MQTT 브로커(EMQX → HiveMQ → Mosquitto 자동 전환)의 retained 메시지를 사용합니다. 공개 서버이므로 중요한 개인정보는 쓰지 마세요.

## 🎙 말하기 (녹음 + 발음 인식)
- 각 단원 끝 **Speaking Challenge** 10문장, 그리고 페이지 곳곳의 🎙 버튼(예문·단어 카드·말하기 문제).
- 녹음하면 발음 인식으로 정확도(%)와 단어별 맞음/틀림을 보여 주고, ▶ 내 녹음 듣기 · ⬇ 녹음 저장이 됩니다. 녹음 파일은 학생 기기에만 남습니다.
- 채점: 먼저 브라우저 음성 인식(Chrome·Edge·Safari)으로 바로 채점하고, 인식이 결과를 못 주면(마이크 충돌, 카카오톡 인앱 브라우저, Firefox 등) **녹음 파일을 AI(Whisper tiny.en, 브라우저 안에서 실행)로 분석**해 채점합니다. 처음 한 번 약 40MB를 내려받고 이후엔 캐시를 씁니다. 학교 방화벽이 cdn.jsdelivr.net · huggingface.co 를 막으면 AI 분석이 되지 않습니다.
- 코드: `shared/class.js`
- GitHub Pages: Settings → Pages → Branch `main` / `(root)`.
