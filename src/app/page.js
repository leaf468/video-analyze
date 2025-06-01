"use client";

import { useState, useRef } from "react";
import VideoUploader from "../components/VideoUploader";
import ComprehensiveAnalysis from "../components/ComprehensiveAnalysis";
import styles from "./page.module.css";

export default function Home() {
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState("");
    const [frames, setFrames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [captureMethod, setCaptureMethod] = useState("canvas");
    const [selectedImages, setSelectedImages] = useState([null, null, null]);
    const [analysisComplete, setAnalysisComplete] = useState(false);

    const videoRef = useRef(null);

    // 비디오 파일 선택 핸들러
    const handleVideoSelect = (file) => {
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }

        setVideoFile(file);
        setFrames([]);
        setError("");
        setAnalysisComplete(false);

        if (file) {
            const url = URL.createObjectURL(file);
            setVideoUrl(url);
        } else {
            setVideoUrl("");
        }
    };

    // 이미지 파일 선택 핸들러
    const handleImageSelect = (index, file) => {
        const newImages = [...selectedImages];
        newImages[index] = file;
        setSelectedImages(newImages);
        setAnalysisComplete(false);
    };

    // 캡처 방식 변경 핸들러
    const handleMethodChange = (method) => {
        setCaptureMethod(method);
        setFrames([]);
        setAnalysisComplete(false);
    };

    // 비디오에서 프레임 캡처 및 분석
    const handleAnalyzeVideo = async () => {
        if (!videoFile) {
            setError("비디오 파일을 선택해주세요.");
            return;
        }

        setIsLoading(true);
        setError("");
        setFrames([]);
        setAnalysisComplete(false);

        try {
            // 비디오 로드 대기
            if (videoRef.current && videoRef.current.readyState < 2) {
                await new Promise((resolve) => {
                    const canPlayHandler = () => {
                        videoRef.current.removeEventListener(
                            "canplay",
                            canPlayHandler
                        );
                        resolve();
                    };
                    videoRef.current.addEventListener(
                        "canplay",
                        canPlayHandler
                    );

                    // 5초 타임아웃
                    setTimeout(resolve, 5000);
                });
            }

            // 비디오 재생 시도 (일부 브라우저에서는 재생 후 캡처가 더 안정적)
            try {
                await videoRef.current.play();
                // 잠시 재생 후 일시정지
                setTimeout(() => {
                    videoRef.current.pause();
                }, 500);
            } catch (e) {
                console.log("비디오 재생 오류 (무시 가능):", e);
            }

            // 캡처할 프레임 수
            const numFrames = 3;

            // 프레임 캡처
            const capturedFrames = await captureFrames(
                videoRef.current,
                numFrames
            );

            // 캡처된 프레임 설정 (분석 전)
            setFrames(
                capturedFrames.map((frame) => ({
                    ...frame,
                    description: "분석 중...",
                }))
            );

            // 각 프레임 분석
            const analyzedFrames = [];

            for (const frame of capturedFrames) {
                try {
                    const gameAnalysis = await analyzeImage(frame.dataUrl);
                    analyzedFrames.push({
                        ...frame,
                        gameAnalysis,
                    });
                } catch (error) {
                    analyzedFrames.push({
                        ...frame,
                        description: `분석 오류: ${error.message}`,
                    });
                }
            }

            setFrames(analyzedFrames);
            setAnalysisComplete(true);
        } catch (error) {
            setError(`오류 발생: ${error.message}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // 선택한 이미지 분석
    const handleAnalyzeImages = async () => {
        if (selectedImages.some((img) => !img)) {
            setError("3개의 이미지를 모두 선택해주세요.");
            return;
        }

        setIsLoading(true);
        setError("");
        setFrames([]);
        setAnalysisComplete(false);

        try {
            // 이미지 파일을 dataURL로 변환
            const imageFrames = await Promise.all(
                selectedImages.map((file) => readImageFile(file))
            );

            // 초기 프레임 설정 (분석 전)
            setFrames(
                imageFrames.map((frame) => ({
                    ...frame,
                    description: "분석 중...",
                }))
            );

            // 각 이미지 분석
            const analyzedFrames = [];

            for (const frame of imageFrames) {
                try {
                    const gameAnalysis = await analyzeImage(frame.dataUrl);
                    analyzedFrames.push({
                        ...frame,
                        gameAnalysis,
                    });
                } catch (error) {
                    analyzedFrames.push({
                        ...frame,
                        description: `분석 오류: ${error.message}`,
                    });
                }
            }

            setFrames(analyzedFrames);
            setAnalysisComplete(true);
        } catch (error) {
            setError(`오류 발생: ${error.message}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className="container">
                <h1 className="title">게임 프레임 분석기</h1>

                <div className={styles.methodSwitch}>
                    <label>
                        <input
                            type="radio"
                            name="captureMethod"
                            value="canvas"
                            checked={captureMethod === "canvas"}
                            onChange={() => handleMethodChange("canvas")}
                        />
                        비디오 업로드 (자동 캡처)
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="captureMethod"
                            value="manual"
                            checked={captureMethod === "manual"}
                            onChange={() => handleMethodChange("manual")}
                        />
                        직접 이미지 선택
                    </label>
                </div>

                {captureMethod === "canvas" ? (
                    <VideoUploader
                        onVideoSelect={handleVideoSelect}
                        videoUrl={videoUrl}
                        videoRef={videoRef}
                        onAnalyze={handleAnalyzeVideo}
                        isLoading={isLoading}
                    />
                ) : (
                    <div className={styles.imageUploadContainer}>
                        <h3>이미지 직접 선택 (3개)</h3>
                        <p className={styles.uploadInstructions}>
                            분석하고자 하는 게임 화면 스크린샷 3장을
                            선택해주세요. 가능한 서로 다른 장면이나 시점의
                            이미지를 선택하면 더 정확한 분석 결과를 얻을 수
                            있습니다.
                        </p>
                        {[0, 1, 2].map((index) => (
                            <div key={index} className={styles.imageUploadItem}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleImageSelect(
                                            index,
                                            e.target.files[0]
                                        )
                                    }
                                />
                                {selectedImages[index] && (
                                    <span>
                                        {selectedImages[index].name}(
                                        {Math.round(
                                            selectedImages[index].size / 1024
                                        )}{" "}
                                        KB)
                                    </span>
                                )}
                            </div>
                        ))}
                        <button
                            className={styles.analyzeButton}
                            onClick={handleAnalyzeImages}
                            disabled={
                                isLoading || selectedImages.some((img) => !img)
                            }
                        >
                            이미지 분석하기
                        </button>
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                {isLoading && (
                    <div className={styles.loading}>
                        <div className={styles.loadingSpinner}></div>
                        <p>프레임 캡처 및 분석 중...</p>
                        <p className={styles.loadingNote}>
                            분석에는 약 10-30초가 소요될 수 있습니다.
                        </p>
                    </div>
                )}

                {analysisComplete && frames.length > 0 && (
                    <ComprehensiveAnalysis frames={frames} />
                )}
            </div>
        </main>
    );
}

// 비디오에서 프레임 캡처
async function captureFrames(video, numFrames) {
    const frames = [];

    if (!video) return frames;

    const duration = video.duration;

    // NaN 처리 (일부 비디오 포맷에서 발생할 수 있음)
    if (isNaN(duration) || duration <= 0) {
        console.warn("비디오 길이를 확인할 수 없습니다. 기본값 60초 사용");
        // 기본값 60초 가정
        const assumedDuration = 60;
        const interval = (assumedDuration * 0.8) / (numFrames - 1);
        const startTime = assumedDuration * 0.1;

        // 캔버스 생성
        const canvas = document.createElement("canvas");
        // 비디오 크기가 0이면 기본값 설정
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < numFrames; i++) {
            try {
                // 특정 시간으로 비디오 이동
                const time = startTime + interval * i;
                console.log(`프레임 ${i + 1} 캡처 시도, 시간: ${time}초`);

                // 프레임 캡처
                const frame = await captureFrame(video, time, ctx, canvas);
                frames.push({
                    time: time,
                    dataUrl: frame,
                    description: "분석 중...",
                });
            } catch (err) {
                console.error(`프레임 ${i + 1} 캡처 실패:`, err);
                // 빈 이미지 생성
                frames.push({
                    time: 0,
                    dataUrl: createEmptyImage(canvas.width, canvas.height),
                    description: "프레임 캡처 실패",
                });
            }
        }
    } else {
        // 정상적인 비디오 길이 처리
        // 시간 간격 계산 (첫 프레임은 10% 지점, 마지막 프레임은 90% 지점)
        const interval = (duration * 0.8) / (numFrames - 1);
        const startTime = duration * 0.1;

        console.log(
            `비디오 길이: ${duration}초, 간격: ${interval}초, 시작: ${startTime}초`
        );

        // 캔버스 생성
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < numFrames; i++) {
            try {
                // 특정 시간으로 비디오 이동
                const time = startTime + interval * i;
                console.log(`프레임 ${i + 1} 캡처 시도, 시간: ${time}초`);

                // 프레임 캡처
                const frame = await captureFrame(video, time, ctx, canvas);
                frames.push({
                    time: time,
                    dataUrl: frame,
                    description: "분석 중...",
                });
            } catch (err) {
                console.error(`프레임 ${i + 1} 캡처 실패:`, err);
                // 빈 이미지 생성
                frames.push({
                    time: 0,
                    dataUrl: createEmptyImage(canvas.width, canvas.height),
                    description: "프레임 캡처 실패",
                });
            }
        }
    }

    return frames;
}

// 특정 시간의 프레임 캡처
function captureFrame(video, time, ctx, canvas) {
    return new Promise((resolve, reject) => {
        // 이미 비디오가 준비된 상태라면 바로 캡처 시도
        if (video.readyState >= 3 && Math.abs(video.currentTime - time) < 0.1) {
            try {
                // 캔버스에 현재 프레임 그리기
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // 데이터 URL로 변환
                const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                return resolve(dataUrl);
            } catch (e) {
                console.error("drawImage 오류:", e);
                return reject(e);
            }
        }

        // 비디오가 준비되지 않았거나 다른 시간대라면 시간 설정
        let seekAttempts = 0;
        const maxSeekAttempts = 3;

        function attemptSeek() {
            seekAttempts++;
            console.log(`시간 이동 시도 ${seekAttempts}: ${time}초`);
            try {
                video.currentTime = time;
            } catch (e) {
                console.error("시간 이동 오류:", e);
                reject(e);
            }
        }

        // 시간 이동 완료 후 이벤트
        const seekedHandler = () => {
            console.log(`시간 이동 완료: ${video.currentTime}초`);
            try {
                // 캔버스에 현재 프레임 그리기
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // 데이터 URL로 변환
                const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

                // 이벤트 리스너 제거
                video.removeEventListener("seeked", seekedHandler);
                video.removeEventListener("error", errorHandler);

                resolve(dataUrl);
            } catch (e) {
                console.error("drawImage 오류:", e);

                // 재시도
                if (seekAttempts < maxSeekAttempts) {
                    setTimeout(attemptSeek, 500);
                } else {
                    video.removeEventListener("seeked", seekedHandler);
                    video.removeEventListener("error", errorHandler);
                    reject(new Error("프레임 그리기 실패"));
                }
            }
        };

        // 오류 이벤트
        const errorHandler = (e) => {
            console.error("비디오 오류:", e);

            // 재시도
            if (seekAttempts < maxSeekAttempts) {
                setTimeout(attemptSeek, 500);
            } else {
                video.removeEventListener("seeked", seekedHandler);
                video.removeEventListener("error", errorHandler);
                reject(new Error("비디오 시간 이동 실패"));
            }
        };

        // 이벤트 리스너 등록
        video.addEventListener("seeked", seekedHandler);
        video.addEventListener("error", errorHandler);

        // 첫 번째 시간 이동 시도
        attemptSeek();

        // 8초 타임아웃
        setTimeout(() => {
            video.removeEventListener("seeked", seekedHandler);
            video.removeEventListener("error", errorHandler);
            reject(new Error("프레임 캡처 타임아웃"));
        }, 8000);
    });
}

// 빈 이미지 생성 (프레임 캡처 실패 시 사용)
function createEmptyImage(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width || 640;
    canvas.height = height || 360;
    const ctx = canvas.getContext("2d");

    // 회색 배경
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 오류 메시지
    ctx.fillStyle = "#FF0000";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("프레임 캡처 실패", canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL("image/jpeg", 0.8);
}

// 이미지 파일 읽기
function readImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve({
                time: 0, // 이미지에는 시간 정보가 없음
                dataUrl: e.target.result,
                description: "분석 중...",
            });
        };
        reader.onerror = () => reject(new Error("이미지 파일 읽기 실패"));
        reader.readAsDataURL(file);
    });
}

// 이미지 분석 API 호출 (내부 API 라우트 사용)
async function analyzeImage(dataUrl) {
    try {
        const response = await fetch("/api/analyze_image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dataUrl: dataUrl,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "이미지 분석 실패");
        }

        const data = await response.json();
        return data.gameAnalysis;
    } catch (error) {
        console.error("API 호출 오류:", error);
        throw new Error(`API 오류: ${error.message}`);
    }
}
