# Đi Chùa Online — deploy lên Dokploy (dichua.bla.io.vn)
# Build từ repo Git, chạy bằng tsx + Vite build (production serve dist/).
FROM node:22-alpine

WORKDIR /app

# Cài dependency trước để tận dụng Docker layer cache.
# KHÔNG dùng --omit=dev: tsx (chạy server.ts) và vite (build) đều nằm ở
# devDependencies nhưng cần có lúc build và lúc chạy.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . ./
RUN npm run build

# Chỉ từ đây mới đặt production: npm ci ở trên cần devDependencies.
ENV NODE_ENV=production
ENV PORT=4191

EXPOSE 4191
CMD ["npx", "tsx", "server.ts"]
