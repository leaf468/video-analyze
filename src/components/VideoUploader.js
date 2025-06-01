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

                // 1분 30초 이상 길이 체크
                if (videoDuration > 90) {
                    setError("1분 30초 이하의 비디오만 분석 가능합니다.");
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
                    1분 내외 비디오 업로드
                </button>

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

                    <button
                        className={styles.analyzeButton}
                        onClick={onAnalyze}
                        disabled={isLoading || error || !videoUrl}
                    >
                        3개 프레임 캡처 및 분석
                    </button>
                </>
            )}
        </div>
    );
}
