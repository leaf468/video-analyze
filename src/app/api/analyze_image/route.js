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
                            text: `당신은 게임 분석 전문가입니다. 이 게임 화면을 분석하고 다음 정보를 제공해주세요:

1. 게임 제목: 이 게임이 무엇인지 식별해주세요 (예: League of Legends, Dota 2, Overwatch 등).

2. 챔피언/캐릭터 정보:
   - 플레이어가 조작 중인 챔피언/캐릭터는 누구인가요? (UI 정보, 스킬 아이콘, 시점 등을 통해 확인)
   - 화면에 보이는 아군 챔피언/캐릭터는 누구인가요? (이름 및 역할 명시)
   - 화면에 보이는 적 챔피언/캐릭터는 누구인가요? (이름 및 역할 명시)

3. 게임 상황 분석:
   - 현재 어떤 상황인가요? (전투 중, 정글링, 라인전, 타워 공격 등)
   - 경기 시간은 어느 정도인가요? (게임 UI에서 시간 확인, 초반/중반/후반 판단)
   - 플레이어의 현재 상태는 어떤가요? (체력, 마나, 레벨, 골드, 아이템 등)

4. 맵 정보:
   - 현재 플레이어가 위치한 맵의 어느 부분인가요? (탑 라인, 미드 라인, 봇 라인, 정글, 강 등)
   - 맵의 특징적인 지형지물이 있나요? (타워, 억제기, 넥서스, 바론, 드래곤 등)

5. 게임 태그:
   - 이 장면을 가장 잘 설명하는 5개의 태그를 제시해주세요 (예: #전투, #드래곤, #갱킹, #팀파이트, #스플릿푸싱)

매우 정확하게 분석해주세요. 화면에서 보이는 정보를 바탕으로 확실한 것만 언급하고, 불확실한 것은 언급하지 마세요.
모든 정보는 다음 JSON 형식으로 구조화하여 답변해주세요:

{
  "game": "게임 이름",
  "characters": {
    "player": "플레이어 캐릭터",
    "allies": ["아군1", "아군2"],
    "enemies": ["적1", "적2"]
  },
  "situation": {
    "action": "현재 상황",
    "gamePhase": "게임 진행 단계",
    "playerStatus": "플레이어 상태"
  },
  "map": {
    "location": "위치",
    "features": ["지형지물1", "지형지물2"]
  },
  "tags": ["#태그1", "#태그2", "#태그3", "#태그4", "#태그5"],
  "summary": "전체 상황에 대한 간결한 요약"
}`,
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
