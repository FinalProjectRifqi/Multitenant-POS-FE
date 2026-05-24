// =============================================================================
// Jenkinsfile — Multitenant POS Frontend
//
// PRASYARAT (sekali, di server tempat Jenkins & Docker berjalan):
//   1. Jalankan perintah berikut di server untuk membuat external network:
//        docker network create proxy
//   2. Tambahkan kredensial berikut di Jenkins → Manage Credentials:
//        ID: mpos-fe-auth-secret         Nilai: AUTH_SECRET (NextAuth secret key)
//        ID: mpos-fe-auth-url            Nilai: AUTH_URL    (contoh: https://multitenant-pos.rifqifzn.my.id)
//        ID: mpos-fe-api-base-url        Nilai: API_BASE_URL (contoh: https://api-multitenant-pos.rifqifzn.my.id)
//
// CATATAN:
//   - NEXT_PUBLIC_* order status UUIDs sudah ada default-nya di Dockerfile (seed values).
//     Tidak perlu dimasukkan sebagai credential kecuali kamu pakai UUID berbeda.
//   - Domain Traefik sudah hardcoded di docker-compose.yml: multitenant-pos.rifqifzn.my.id
//   - Semua credential harus bertipe "Secret text" di Jenkins Credentials Manager.
// =============================================================================

pipeline {
    agent any

    options {
        // Cegah dua build berjalan bersamaan (menghindari konflik container/port)
        disableConcurrentBuilds()
    }

    environment {
        CONTAINER_NAME = 'multitenant-pos-fe-frontend-1'
        PROJECT_NAME   = 'multitenant-pos-fe'
        COMPOSE_FILE   = 'docker-compose.yml'
        HEALTH_PORT    = '3020'
        HEALTH_PATH    = '/api/health'
    }

    stages {

        // ── Stage 1: Setup Environment ────────────────────────────────────
        stage('Setup Environment') {
            steps {
                script {
                    echo "🚀 Starting deployment for ${PROJECT_NAME}"
                    echo "📋 Build Number: ${env.BUILD_NUMBER}"
                    echo "🔖 Git Branch: ${env.GIT_BRANCH}"

                    sh '''
                        echo "📊 System Information:"
                        echo "  Docker: $(docker --version)"
                        echo "  Docker Compose: $(docker-compose --version)"
                        echo "  Disk usage:"
                        df -h / | tail -1
                    '''
                }
            }
        }

        // ── Stage 2: Build & Deploy ───────────────────────────────────────
        stage('Build & Deploy') {
            steps {
                script {
                    echo "🔨 Building and deploying ${PROJECT_NAME}..."

                    withCredentials([
                        // NextAuth — wajib, tidak ada default
                        string(credentialsId: 'mpos-fe-auth-secret',  variable: 'AUTH_SECRET'),
                        string(credentialsId: 'mpos-fe-auth-url',     variable: 'AUTH_URL'),
                        // Backend API — wajib diset ke URL BE yang bisa dijangkau FE
                        // (contoh: https://api-multitenant-pos.rifqifzn.my.id, atau
                        //  http://backend:3004 jika FE & BE berbagi pos-network)
                        string(credentialsId: 'mpos-fe-api-base-url', variable: 'API_BASE_URL'),
                    ]) {
                        sh '''
                            echo "🔐 Credentials loaded from Jenkins"

                            # Pastikan external network proxy sudah ada
                            docker network inspect proxy >/dev/null 2>&1 \
                                || { echo "⚠️  Network 'proxy' tidak ditemukan, membuatnya..."; docker network create proxy; }

                            # Stop container lama (ignore error jika belum ada)
                            docker-compose -f ${COMPOSE_FILE} down frontend || true

                            # Build image baru dan jalankan container
                            docker-compose -f ${COMPOSE_FILE} up -d --build frontend

                            echo "✅ Container deployed"
                            echo "⏳ Menunggu container inisialisasi (15s)..."
                            sleep 15
                        '''
                    }
                }
            }
        }

        // ── Stage 3: Health Check ─────────────────────────────────────────
        stage('Health Check') {
            steps {
                script {
                    echo "🏥 Performing HTTP health check on port ${HEALTH_PORT}..."

                    sh '''
                        HEALTH_URL="http://localhost:${HEALTH_PORT}${HEALTH_PATH}"
                        MAX_RETRIES=12
                        RETRY=0

                        echo "⏳ Menghubungi ${HEALTH_URL} ..."
                        until curl -sf "${HEALTH_URL}" > /dev/null 2>&1; do
                            if [ ${RETRY} -ge ${MAX_RETRIES} ]; then
                                echo "❌ Health check timeout setelah $((MAX_RETRIES * 5))s"
                                echo "📋 Container logs (tail 100):"
                                docker logs ${CONTAINER_NAME} --tail 100 || true
                                exit 1
                            fi
                            echo "⏳ Attempt $((RETRY + 1))/${MAX_RETRIES} — retry dalam 5s..."
                            sleep 5
                            RETRY=$((RETRY + 1))
                        done

                        echo "✅ Health check passed"
                        echo "📋 Container logs terbaru:"
                        docker logs ${CONTAINER_NAME} --tail 30
                    '''
                }
            }
        }

        // ── Stage 4: Cleanup ──────────────────────────────────────────────
        stage('Cleanup') {
            steps {
                script {
                    echo "🧹 Cleaning up unused Docker resources..."
                    sh '''
                        docker image prune -f || true
                        docker volume prune -f || true
                        echo "✅ Cleanup completed"
                    '''
                }
            }
        }
    }

    // ── Post Actions ──────────────────────────────────────────────────────
    post {
        always {
            script {
                echo "📊 Deployment Summary"
                sh '''
                    echo "================================"
                    echo "Container Status:"
                    docker ps -a -f name=${CONTAINER_NAME}
                    echo "================================"
                    echo "Image Info:"
                    docker images | grep multitenant-pos-fe || echo "No images found"
                    echo "================================"
                '''
            }
        }

        success {
            script {
                echo '✅ Deployment completed successfully!'
                sh '''
                    echo "🎉 ${PROJECT_NAME} is now running"
                    echo "📋 Check container logs: docker logs ${CONTAINER_NAME}"
                    echo "🌐 URL: https://multitenant-pos.rifqifzn.my.id"
                '''
            }
        }

        failure {
            script {
                echo '❌ Deployment failed!'
                sh '''
                    echo "📋 Container logs (tail 100):"
                    docker logs ${CONTAINER_NAME} --tail 100 || echo "No logs available"

                    echo "📋 Docker Compose status:"
                    docker-compose -f ${COMPOSE_FILE} ps || true
                '''
            }
        }
    }
}
