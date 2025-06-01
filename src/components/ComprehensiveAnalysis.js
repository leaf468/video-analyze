"use client";

import { useState } from "react";
import styles from "./ComprehensiveAnalysis.module.css";

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
                frames.map((f) => f.gameAnalysis.characters.player)
            ),
            allies: combineArrays(
                frames.map((f) => f.gameAnalysis.characters.allies)
            ),
            enemies: combineArrays(
                frames.map((f) => f.gameAnalysis.characters.enemies)
            ),
        },
        situation: {
            action: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.situation.action)
            ),
            gamePhase: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.situation.gamePhase)
            ),
            playerStatus:
                frames[Math.floor(frames.length / 2)].gameAnalysis.situation
                    .playerStatus, // 중간 프레임 값 사용
        },
        map: {
            location: getMostCommonValue(
                frames.map((f) => f.gameAnalysis.map.location)
            ),
            features: combineArrays(
                frames.map((f) => f.gameAnalysis.map.features)
            ),
        },
        tags: combineAndLimitTags(frames.map((f) => f.gameAnalysis.tags)),
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
        frames.map((f) => f.gameAnalysis.characters.player)
    );
    const location = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.map.location)
    );
    const action = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.situation.action)
    );
    const gamePhase = getMostCommonValue(
        frames.map((f) => f.gameAnalysis.situation.gamePhase)
    );

    return `${game}에서 ${player}(으)로 플레이 중이며, ${location}에서 ${action} 상황입니다. 현재 게임은 ${gamePhase} 단계에 있습니다.`;
}
