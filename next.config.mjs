/** @type {import('next').NextConfig} */
const nextConfig = {
    // API 요청 크기 제한 증가 (큰 이미지를 위해)
    api: {
        bodyParser: {
            sizeLimit: "10mb",
        },
    },
};

export default nextConfig;
