"use client";

import { useState } from "react";
import styles from "./ComprehensiveAnalysis.module.css";

// playerStatus 객체를 문자열로 포맷팅하는 함수
function formatPlayerStatus(playerStatus) {
    if (!playerStatus) return "";

    if (typeof playerStatus === "string") {
        return playerStatus;
    }

    if (typeof playerStatus === "object") {
        const statusParts = [];

        if (playerStatus.health)
            statusParts.push(`체력: ${playerStatus.health}`);
        if (playerStatus.mana) statusParts.push(`마나: ${playerStatus.mana}`);
        if (playerStatus.level) statusParts.push(`레벨: ${playerStatus.level}`);
        if (playerStatus.gold) statusParts.push(`골드: ${playerStatus.gold}`);
        if (playerStatus.items && Array.isArray(playerStatus.items)) {
            statusParts.push(`아이템: ${playerStatus.items.join(", ")}`);
        }

        return statusParts.length > 0
            ? statusParts.join(", ")
            : "상태 정보 없음";
    }

    return String(playerStatus);
}

// 배열에서 가장 많이 나타나는 값 찾기
function getMostCommonValue(arr) {
    if (!arr || arr.length === 0) return "";

    const counts = {};
    let maxCount = 0;
    let maxValue = "";

    for (const value of arr) {
        if (!value) continue;
        counts[value] = (counts[value] || 0) + 1;
        if (counts[value] > maxCount) {
            maxCount = counts[value];
            maxValue = value;
        }
    }

    return maxValue;
}

// 여러 배열의 요소를 합치고 중복 제거
function combineArrays(arrayOfArrays) {
    if (!arrayOfArrays || arrayOfArrays.length === 0) return [];

    const combinedSet = new Set();
    for (const arr of arrayOfArrays) {
        if (Array.isArray(arr)) {
            for (const item of arr) {
                if (item) combinedSet.add(item);
            }
        }
    }

    return Array.from(combinedSet);
}

// 여러 태그 배열을 합치고, 빈도수에 따라 가장 많이 나타나는 7개 태그 선택
function combineAndLimitTags(arrayOfTagArrays) {
    if (!arrayOfTagArrays || arrayOfTagArrays.length === 0) return [];

    const tagCounts = {};

    // 각 태그의 등장 횟수 계산
    for (const tagArray of arrayOfTagArrays) {
        if (Array.isArray(tagArray)) {
            for (const tag of tagArray) {
                if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
        }
    }

    // 태그를 빈도수에 따라 정렬
    const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

    // 상위 7개 태그 반환 (또는 태그가 7개 미만이면 모두 반환)
    return sortedTags.slice(0, 7);
}

// 종합적인 요약 생성
function createComprehensiveSummary(frames) {
    // 모든 요약을 통합하고 패턴을 찾아 새로운 요약 생성
    const game = getMostCommonValue(frames.map((f) => f.gameAnalysis.game));
    const player = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.characters?.player)
    );
    const location = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.map?.location)
    );
    const action = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.situation?.action)
    );
    const gamePhase = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.situation?.gamePhase)
    );

    return `${game || "게임"}에서 ${
        player || "플레이어"
    }(으)로 플레이 중이며, ${location || "맵"}에서 ${
        action || "게임"
    } 상황입니다. 현재 게임은 ${gamePhase || "진행"} 단계에 있습니다.`;
}

// GameAnalysis 컴포넌트 정의
function GameAnalysis({ analysis }) {
    if (!analysis) return <div>분석 결과가 없습니다.</div>;

    return (
        <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
                <strong>게임:</strong> {analysis.game || "확인되지 않음"}
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <strong>캐릭터 정보:</strong>
                <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                    <div>
                        <strong>플레이어:</strong>{" "}
                        {analysis.characters?.player || "확인되지 않음"}
                    </div>
                    {analysis.characters?.allies &&
                        analysis.characters.allies.length > 0 && (
                            <div>
                                <strong>아군:</strong>{" "}
                                {analysis.characters.allies.join(", ")}
                            </div>
                        )}
                    {analysis.characters?.enemies &&
                        analysis.characters.enemies.length > 0 && (
                            <div>
                                <strong>적군:</strong>{" "}
                                {analysis.characters.enemies.join(", ")}
                            </div>
                        )}
                </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <strong>게임 상황:</strong>
                <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                    <div>
                        <strong>행동:</strong>{" "}
                        {analysis.situation?.action || "확인되지 않음"}
                    </div>
                    <div>
                        <strong>게임 단계:</strong>{" "}
                        {analysis.situation?.gamePhase || "확인되지 않음"}
                    </div>
                    <div>
                        <strong>플레이어 상태:</strong>{" "}
                        {formatPlayerStatus(analysis.situation?.playerStatus) ||
                            "확인되지 않음"}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <strong>맵 정보:</strong>
                <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                    <div>
                        <strong>위치:</strong>{" "}
                        {analysis.map?.location || "확인되지 않음"}
                    </div>
                    {analysis.map?.features &&
                        analysis.map.features.length > 0 && (
                            <div>
                                <strong>특징:</strong>{" "}
                                {analysis.map.features.join(", ")}
                            </div>
                        )}
                </div>
            </div>

            {analysis.tags && analysis.tags.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                    <strong>태그:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                        {analysis.tags.map((tag, index) => (
                            <span
                                key={index}
                                style={{
                                    display: "inline-block",
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
                                    padding: "0.2rem 0.5rem",
                                    margin: "0.2rem",
                                    borderRadius: "12px",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {analysis.summary && (
                <div style={{ marginBottom: "1rem" }}>
                    <strong>요약:</strong>
                    <div
                        style={{
                            marginTop: "0.5rem",
                            fontStyle: "italic",
                            color: "#555",
                        }}
                    >
                        {analysis.summary}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ComprehensiveAnalysis({ frames }) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!frames || frames.length === 0) {
        return null;
    }

    // 모든 프레임의 분석 결과가 있는지 확인
    const allFramesAnalyzed = frames.every((frame) => frame.gameAnalysis);
    if (!allFramesAnalyzed) {
        return null;
    }

    // 모든 프레임 분석 결과를 종합적으로 분석
    const comprehensiveAnalysis = {
        game: getMostCommonValue(frames.map((f) => f.gameAnalysis.game)),
        characters: {
            player: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.characters?.player)
            ),
            allies: combineArrays(
                frames.map((f) => f.gameAnalysis.characters?.allies || [])
            ),
            enemies: combineArrays(
                frames.map((f) => f.gameAnalysis.characters?.enemies || [])
            ),
        },
        situation: {
            action: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.situation?.action)
            ),
            gamePhase: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.situation?.gamePhase)
            ),
            playerStatus:
                formatPlayerStatus(
                    frames[Math.floor(frames.length / 2)].gameAnalysis.situation
                        ?.playerStatus
                ) || "확인되지 않음",
        },
        map: {
            location: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.map?.location)
            ),
            features: combineArrays(
                frames.map((f) => f.gameAnalysis.map?.features || [])
            ),
        },
        tags: combineAndLimitTags(frames.map((f) => f.gameAnalysis.tags || [])),
        summary: createComprehensiveSummary(frames),
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>종합 분석 결과</h2>
            <p className={styles.description}>
                3개의 프레임을 종합적으로 분석한 결과입니다. 이 분석은 시간의
                흐름에 따른 게임 상황 변화를 고려하여 더 정확한 정보를
                제공합니다.
            </p>

            <GameAnalysis analysis={comprehensiveAnalysis} />

            <div className={styles.toggleContainer}>
                <button
                    className={styles.toggleButton}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded
                        ? "개별 프레임 분석 숨기기"
                        : "개별 프레임 분석 보기"}
                </button>
            </div>

            {isExpanded && (
                <div className={styles.individualFrames}>
                    <h3>개별 프레임 분석</h3>
                    {frames.map((frame, index) => (
                        <div key={index} className={styles.frameContainer}>
                            <h4>프레임 {index + 1}</h4>
                            <div className={styles.frameContent}>
                                <div className={styles.frameImageContainer}>
                                    <img
                                        src={frame.dataUrl}
                                        alt={`프레임 ${index + 1}`}
                                        className={styles.frameImage}
                                    />
                                    {frame.time > 0 && (
                                        <div className={styles.frameTime}>
                                            시간: {Math.floor(frame.time / 60)}:
                                            {Math.floor(frame.time % 60)
                                                .toString()
                                                .padStart(2, "0")}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.frameAnalysis}>
                                    <GameAnalysis
                                        analysis={frame.gameAnalysis}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
