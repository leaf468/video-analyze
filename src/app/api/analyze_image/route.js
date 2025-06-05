import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
    try {
        const { dataUrl } = await request.json();

        if (!dataUrl) {
            return NextResponse.json(
                { error: "이미지 데이터가 누락되었습니다." },
                { status: 400 }
            );
        }

        // 환경 변수에서 API 키 가져오기
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error: "API 키가 서버에 설정되지 않았습니다. .env.local 파일을 확인하세요.",
                },
                { status: 500 }
            );
        }

        // Base64 데이터 추출
        const base64Image = dataUrl.split(",")[1];

        const openai = new OpenAI({
            apiKey: apiKey,
        });

        const response = await openai.chat.completions.create({
            model: "gpt-4o", // 이미지를 지원하는 최신 모델 사용
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `당신은 게임 분석 전문가입니다. 이 게임 화면을 매우 정확하게 분석해주세요.

**중요: 플레이어 캐릭터 식별 방법**
플레이어가 현재 조작 중인 캐릭터를 식별하는 핵심 요소들:

1. **UI 중심 분석 (가장 중요)**:
   - 화면 하단 중앙의 스킬 아이콘들 (Q, W, E, R 스킬)
   - 화면 하단 좌측의 캐릭터 초상화/아바타
   - 캐릭터 체력바, 마나바, 경험치바의 위치와 디자인
   - 아이템 슬롯에 있는 아이템들
   - 레벨 표시

2. **시점 분석**:
   - 3인칭 시점에서 화면 중앙에 위치한 캐릭터
   - 카메라가 따라다니는 중심 캐릭터
   - 플레이어 컨트롤 하에 있는 것으로 보이는 캐릭터

3. **게임별 특징**:
   - **리그 오브 레전드**: 하단 UI의 챔피언 초상화와 스킬 아이콘이 핵심
   - **도타 2**: 하단 좌측의 영웅 초상화와 스킬 바
   - **오버워치**: 화면 하단의 능력 아이콘과 체력바
   - **발로란트**: 하단 우측의 에이전트 능력 아이콘

**분석 순서**:
1. 먼저 게임을 정확히 식별하세요
2. 해당 게임의 UI 패턴을 기반으로 플레이어 캐릭터를 식별하세요
3. UI에서 확인한 정보와 화면의 시점을 교차 검증하세요
4. 불확실한 경우 "확실하지 않음"이라고 명시하세요

**요구사항**:
- 화면에서 직접 보이는 정보만 사용하세요
- 추측이나 가정을 하지 마세요
- UI 요소를 우선적으로 분석하세요
- 플레이어 캐릭터 식별에 특히 주의하세요

다음 정보를 JSON 형식으로 제공해주세요:

{
  "confidence": "분석 신뢰도 (high/medium/low)",
  "game": "게임 이름",
  "ui_analysis": {
    "skill_icons_visible": "스킬 아이콘이 보이는가 (true/false)",
    "character_portrait_visible": "캐릭터 초상화가 보이는가 (true/false)",
    "health_mana_bars_visible": "체력/마나바가 보이는가 (true/false)",
    "ui_layout": "UI 레이아웃 설명"
  },
  "characters": {
    "player": "플레이어 캐릭터 (UI 기반으로 식별)",
    "player_confidence": "플레이어 캐릭터 식별 신뢰도 (high/medium/low)",
    "identification_method": "플레이어 캐릭터를 어떻게 식별했는지 설명",
    "allies": ["아군 캐릭터들"],
    "enemies": ["적 캐릭터들"]
  },
  "situation": {
    "action": "현재 상황",
    "gamePhase": "게임 진행 단계 (초반/중반/후반)",
    "playerStatus": {
      "health": "체력 상태",
      "mana": "마나 상태",
      "level": "레벨",
      "gold": "골드 (보이는 경우)",
      "items": ["아이템 목록"]
    }
  },
  "map": {
    "location": "맵 위치",
    "features": ["지형지물"]
  },
  "tags": ["#태그1", "#태그2", "#태그3", "#태그4", "#태그5"],
  "summary": "전체 상황 요약",
  "analysis_notes": "분석 과정에서 주목한 점들"
}

**절대 규칙**:
- 플레이어 캐릭터가 확실하지 않으면 "확실하지 않음"으로 표시
- UI 요소가 명확하지 않으면 confidence를 "low"로 설정
- 보이지 않는 정보는 "확인되지 않음"으로 표시
- 모든 식별은 화면에서 직접 보이는 증거에 기반해야 함`,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1, // 일관성을 위해 낮은 temperature 사용
        });

        let gameAnalysis;
        try {
            gameAnalysis = JSON.parse(response.choices[0].message.content);
        } catch (parseError) {
            console.error("JSON 파싱 오류:", parseError);
            return NextResponse.json(
                { error: "AI 응답을 파싱할 수 없습니다." },
                { status: 500 }
            );
        }

        return NextResponse.json({ gameAnalysis });
    } catch (error) {
        console.error("이미지 분석 오류:", error);
        return NextResponse.json(
            { error: error.message || "이미지 분석 실패" },
            { status: 500 }
        );
    }
}
