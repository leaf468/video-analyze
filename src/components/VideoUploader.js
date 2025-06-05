"use client";

import { useState } from "react";
import styles from "./VideoUploader.module.css";

export default function VideoUploader({
    onVideoSelect,
    videoUrl,
    videoRef,
    onAnalyze,
    isLoading,
}) {
    const [fileInfo, setFileInfo] = useState("");
    const [error, setError] = useState("");

    // 비디오 메타데이터 로드 핸들러
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const videoDuration = videoRef.current.duration;

            if (isNaN(videoDuration)) {
                setFileInfo((prev) => `${prev}, 길이: 확인 불가`);
            } else {
                setFileInfo(
                    (prev) =>
                        `${prev}, 길이: ${Math.floor(
                            videoDuration / 60
                        )}분 ${Math.floor(videoDuration % 60)}초`
                );

                // 2분 이상 길이 체크 (10프레임 캡처를 위해 조금 더 긴 영상 허용)
                if (videoDuration > 120) {
                    setError("2분 이하의 비디오만 분석 가능합니다.");
                } else {
                    setError("");
                }
            }
        }
    };

    // 비디오 오류 핸들러
    const handleVideoError = () => {
        setError("비디오를 로드할 수 없습니다. 다른 파일을 시도해주세요.");
    };

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 비디오 파일 형식 확인
        if (!file.type.startsWith("video/")) {
            setError("비디오 파일만 업로드 가능합니다.");
            return;
        }

        setFileInfo(
            `파일명: ${file.name}, 유형: ${file.type}, 크기: ${(
                file.size /
                (1024 * 1024)
            ).toFixed(2)}MB`
        );
        setError("");
        onVideoSelect(file);
    };

    return (
        <div className={styles.container}>
            <div className={styles.uploadArea}>
                <input
                    type="file"
                    id="videoUpload"
                    accept="video/*"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                />
                <button
                    className={styles.uploadButton}
                    onClick={() =>
                        document.getElementById("videoUpload").click()
                    }
                >
                    게임 플레이 비디오 업로드 (2분 이내)
                </button>

                <div className={styles.uploadInstructions}>
                    <p>
                        <strong>💡 정확한 분석을 위한 팁:</strong>
                    </p>
                    <ul>
                        <li>게임 UI가 명확히 보이는 영상을 업로드하세요</li>
                        <li>
                            화면 하단의 챔피언 정보와 스킬 아이콘이 잘 보여야
                            합니다
                        </li>
                        <li>미니맵이 포함된 전체 화면 녹화가 가장 좋습니다</li>
                        <li>
                            10개 프레임을 자동으로 캡처하여 더 정확한 분석을
                            제공합니다
                        </li>
                    </ul>
                </div>

                {fileInfo && <p className={styles.fileInfo}>{fileInfo}</p>}
                {error && <p className={styles.error}>{error}</p>}
            </div>

            {videoUrl && (
                <>
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        className={styles.videoPreview}
                        controls
                        playsInline
                        onLoadedMetadata={handleLoadedMetadata}
                        onError={handleVideoError}
                    />

                    <div className={styles.analysisInfo}>
                        <h4>🔍 분석 과정:</h4>
                        <ol>
                            <li>비디오에서 10개 프레임 자동 캡처</li>
                            <li>각 프레임의 UI 요소 정밀 분석</li>
                            <li>플레이어 챔피언 및 스킬 상태 식별</li>
                            <li>플레이 스타일 및 전략적 조언 제공</li>
                        </ol>
                    </div>

                    <button
                        className={styles.analyzeButton}
                        onClick={onAnalyze}
                        disabled={isLoading || error || !videoUrl}
                    >
                        🎮 10개 프레임 캡처 및 정밀 분석 시작
                    </button>
                </>
            )}
        </div>
    );
}
