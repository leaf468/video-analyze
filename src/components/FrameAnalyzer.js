"use client";

import styles from "./FrameAnalyzer.module.css";

export default function FrameAnalyzer({ frames }) {
    if (!frames || frames.length === 0) {
        return null;
    }

    return (
        <div className={styles.container}>
            <h2>분석 결과</h2>
            <div className={styles.framesGrid}>
                {frames.map((frame, index) => (
                    <div key={index} className={styles.frame}>
                        <img
                            src={frame.dataUrl}
                            alt={`프레임 ${index + 1}`}
                            className={styles.frameImage}
                        />
                        <div className={styles.frameDescription}>
                            {frame.description}
                        </div>
                        {frame.time > 0 && (
                            <div className={styles.frameTime}>
                                시간: {Math.floor(frame.time / 60)}:
                                {Math.floor(frame.time % 60)
                                    .toString()
                                    .padStart(2, "0")}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
