"use client";

import { useState } from "react";
import styles from "./ComprehensiveAnalysis.module.css";

// 플레이어 정보를 포맷팅하는 함수
function formatPlayerInfo(player) {
    if (!player) return "플레이어 정보 없음";

    const info = [];
    if (player.champion) info.push(`챔피언: ${player.champion}`);
    if (player.role) info.push(`역할: ${player.role}`);
    if (player.level) info.push(`레벨: ${player.level}`);
    if (player.health) info.push(`체력: ${player.health}`);
    if (player.mana) info.push(`마나: ${player.mana}`);
    if (player.gold) info.push(`골드: ${player.gold}`);

    return info.length > 0 ? info.join(", ") : "상세 정보 없음";
}

// 스킬 상태를 포맷팅하는 함수
function formatSkills(skills) {
    if (!skills) return "스킬 정보 없음";

    const skillInfo = [];
    if (skills.q) skillInfo.push(`Q: ${skills.q}`);
    if (skills.w) skillInfo.push(`W: ${skills.w}`);
    if (skills.e) skillInfo.push(`E: ${skills.e}`);
    if (skills.r) skillInfo.push(`R: ${skills.r}`);

    return skillInfo.length > 0 ? skillInfo.join(", ") : "스킬 상태 불명";
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
    const game = getMostCommonValue(frames.map((f) => f.gameAnalysis.game));
    const champion = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.player?.champion)
    );
    const role = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.player?.role)
    );
    const location = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.gameState?.location)
    );
    const situation = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.gameState?.situation)
    );
    const phase = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.gameState?.phase)
    );

    return `${game || "게임"}에서 ${champion || "캐릭터"}(${
        role || "역할"
    })로 플레이 중입니다. ${location || "맵"}에서 ${
        situation || "활동"
    } 상황이며, 현재 게임은 ${phase || "진행"} 단계입니다.`;
}

// GameAnalysis 컴포넌트 정의
function GameAnalysis({ analysis }) {
    if (!analysis) return <div>분석 결과가 없습니다.</div>;

    return (
        <div style={{ marginBottom: "1.5rem" }}>
            {/* 게임 정보 */}
            <div style={{ marginBottom: "1rem" }}>
                <strong>게임:</strong> {analysis.game || "확인되지 않음"}
            </div>

            {/* 플레이어 정보 - 가장 중요한 섹션 */}
            {analysis.player && (
                <div
                    style={{
                        marginBottom: "1.5rem",
                        padding: "1rem",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "2px solid #007bff",
                    }}
                >
                    <h4 style={{ color: "#007bff", marginBottom: "1rem" }}>
                        🎮 플레이어 정보
                    </h4>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <div>
                            <strong>챔피언:</strong>{" "}
                            {analysis.player.champion || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>역할:</strong>{" "}
                            {analysis.player.role || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>레벨:</strong>{" "}
                            {analysis.player.level || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>골드:</strong>{" "}
                            {analysis.player.gold || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>체력:</strong>{" "}
                            {analysis.player.health || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>마나:</strong>{" "}
                            {analysis.player.mana || "확인되지 않음"}
                        </div>
                    </div>

                    {analysis.player.skills && (
                        <div style={{ marginBottom: "1rem" }}>
                            <strong>스킬 상태:</strong>
                            <div
                                style={{
                                    marginLeft: "1rem",
                                    marginTop: "0.5rem",
                                }}
                            >
                                {formatSkills(analysis.player.skills)}
                            </div>
                        </div>
                    )}

                    {analysis.player.items &&
                        analysis.player.items.length > 0 && (
                            <div style={{ marginBottom: "1rem" }}>
                                <strong>아이템:</strong>
                                <div style={{ marginTop: "0.5rem" }}>
                                    {analysis.player.items.map(
                                        (item, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    display: "inline-block",
                                                    backgroundColor: "#e8f4fd",
                                                    color: "#0056b3",
                                                    padding: "0.2rem 0.5rem",
                                                    margin: "0.2rem",
                                                    borderRadius: "4px",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                {item}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                        }}
                    >
                        <div>
                            <strong>포지셔닝:</strong>{" "}
                            {analysis.player.positioning || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>현재 행동:</strong>{" "}
                            {analysis.player.currentAction || "확인되지 않음"}
                        </div>
                    </div>
                </div>
            )}

            {/* 게임 상태 */}
            {analysis.gameState && (
                <div style={{ marginBottom: "1rem" }}>
                    <strong>게임 상태:</strong>
                    <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                        <div>
                            <strong>게임 시간:</strong>{" "}
                            {analysis.gameState.gameTime || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>게임 단계:</strong>{" "}
                            {analysis.gameState.phase || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>위치:</strong>{" "}
                            {analysis.gameState.location || "확인되지 않음"}
                        </div>
                        <div>
                            <strong>상황:</strong>{" "}
                            {analysis.gameState.situation || "확인되지 않음"}
                        </div>
                    </div>
                </div>
            )}

            {/* 주변 상황 */}
            {analysis.surroundings && (
                <div style={{ marginBottom: "1rem" }}>
                    <strong>주변 상황:</strong>
                    <div style={{ marginLeft: "1rem", marginTop: "0.5rem" }}>
                        {analysis.surroundings.allies &&
                            analysis.surroundings.allies.length > 0 && (
                                <div>
                                    <strong>아군:</strong>{" "}
                                    {analysis.surroundings.allies.join(", ")}
                                </div>
                            )}
                        {analysis.surroundings.enemies &&
                            analysis.surroundings.enemies.length > 0 && (
                                <div>
                                    <strong>적군:</strong>{" "}
                                    {analysis.surroundings.enemies.join(", ")}
                                </div>
                            )}
                        <div>
                            <strong>위험도:</strong>{" "}
                            {analysis.surroundings.threatLevel ||
                                "확인되지 않음"}
                        </div>
                    </div>
                </div>
            )}

            {/* 플레이 분석 */}
            {analysis.analysis && (
                <div
                    style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        backgroundColor: "#f0f8f0",
                        borderRadius: "8px",
                    }}
                >
                    <h4 style={{ color: "#28a745", marginBottom: "1rem" }}>
                        📊 플레이 분석
                    </h4>

                    {analysis.analysis.playStyle && (
                        <div style={{ marginBottom: "0.8rem" }}>
                            <strong>플레이 스타일:</strong>{" "}
                            {analysis.analysis.playStyle}
                        </div>
                    )}

                    {analysis.analysis.strengths &&
                        analysis.analysis.strengths.length > 0 && (
                            <div style={{ marginBottom: "0.8rem" }}>
                                <strong>👍 잘한 점:</strong>
                                <ul
                                    style={{
                                        marginLeft: "1.5rem",
                                        marginTop: "0.3rem",
                                    }}
                                >
                                    {analysis.analysis.strengths.map(
                                        (strength, index) => (
                                            <li key={index}>{strength}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                    {analysis.analysis.improvements &&
                        analysis.analysis.improvements.length > 0 && (
                            <div style={{ marginBottom: "0.8rem" }}>
                                <strong>💡 개선할 점:</strong>
                                <ul
                                    style={{
                                        marginLeft: "1.5rem",
                                        marginTop: "0.3rem",
                                    }}
                                >
                                    {analysis.analysis.improvements.map(
                                        (improvement, index) => (
                                            <li key={index}>{improvement}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                    {analysis.analysis.recommendation && (
                        <div style={{ marginBottom: "0.8rem" }}>
                            <strong>🎯 추천 행동:</strong>{" "}
                            {analysis.analysis.recommendation}
                        </div>
                    )}
                </div>
            )}

            {/* 태그 */}
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

            {/* 요약 */}
            {analysis.summary && (
                <div style={{ marginBottom: "1rem" }}>
                    <strong>요약:</strong>
                    <div
                        style={{
                            marginTop: "0.5rem",
                            fontStyle: "italic",
                            color: "#555",
                            padding: "0.8rem",
                            backgroundColor: "#f8f9fa",
                            borderLeft: "4px solid #007bff",
                            borderRadius: "4px",
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
        player: {
            champion: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.champion)
            ),
            role: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.role)
            ),
            level: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.level)
            ),
            health: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.health)
            ),
            mana: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.mana)
            ),
            gold: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.gold)
            ),
            skills: {
                q: getMostCommonValue(
                    frames.map((f) => f.gameAnalysis.player?.skills?.q)
                ),
                w: getMostCommonValue(
                    frames.map((f) => f.gameAnalysis.player?.skills?.w)
                ),
                e: getMostCommonValue(
                    frames.map((f) => f.gameAnalysis.player?.skills?.e)
                ),
                r: getMostCommonValue(
                    frames.map((f) => f.gameAnalysis.player?.skills?.r)
                ),
            },
            items: combineArrays(
                frames.map((f) => f.gameAnalysis.player?.items || [])
            ),
            positioning: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.positioning)
            ),
            currentAction: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.player?.currentAction)
            ),
        },
        gameState: {
            gameTime: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.gameState?.gameTime)
            ),
            phase: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.gameState?.phase)
            ),
            location: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.gameState?.location)
            ),
            situation: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.gameState?.situation)
            ),
        },
        surroundings: {
            allies: combineArrays(
                frames.map((f) => f.gameAnalysis.surroundings?.allies || [])
            ),
            enemies: combineArrays(
                frames.map((f) => f.gameAnalysis.surroundings?.enemies || [])
            ),
            threatLevel: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.surroundings?.threatLevel)
            ),
        },
        analysis: {
            playStyle: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.analysis?.playStyle)
            ),
            strengths: combineArrays(
                frames.map((f) => f.gameAnalysis.analysis?.strengths || [])
            ),
            improvements: combineArrays(
                frames.map((f) => f.gameAnalysis.analysis?.improvements || [])
            ),
            recommendation: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.analysis?.recommendation)
            ),
        },
        tags: combineAndLimitTags(frames.map((f) => f.gameAnalysis.tags || [])),
        summary: createComprehensiveSummary(frames),
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>🎯 종합 분석 결과</h2>
            <p className={styles.description}>
                {frames.length}개의 프레임을 종합적으로 분석한 결과입니다.
                플레이어의 챔피언, 스킬 사용, 포지셔닝, 플레이 스타일을 중심으로
                분석했습니다.
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
