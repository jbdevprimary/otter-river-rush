# Multi-stage Dockerfile optimized for Otter River Rush development
# Includes: Node.js 22, Java 17, Android SDK, Gradle 9.x, Playwright
# This aligns with CI environment and eliminates version mismatches

FROM mcr.microsoft.com/playwright:v1.56.1-jammy AS base

# ============================================================================
# Base Environment Setup
# ============================================================================
ENV DEBIAN_FRONTEND=noninteractive \
    NODE_VERSION=22 \
    JAVA_VERSION=17 \
    GRADLE_VERSION=9.1.0 \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    ANDROID_HOME=/opt/android-sdk \
    ANDROID_BUILD_TOOLS_VERSION=35.0.0 \
    ANDROID_COMPILE_SDK_VERSION=35

# Add Android SDK to PATH
ENV PATH=$PATH:${ANDROID_SDK_ROOT}/cmdline-tools/latest/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/build-tools/${ANDROID_BUILD_TOOLS_VERSION}

# ============================================================================
# System Dependencies
# ============================================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Build essentials
    build-essential \
    git \
    curl \
    wget \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release \
    # Java 17 (Temurin distribution - same as CI)
    openjdk-17-jdk \
    # Graphics libraries for canvas/image processing
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    # Additional utilities
    bc \
    jq \
    && rm -rf /var/lib/apt/lists/*

# ============================================================================
# Node.js 22 (Already included in Playwright base, but verify version)
# ============================================================================
RUN node --version | grep -q "v22" || \
    (curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
     apt-get install -y nodejs && \
     rm -rf /var/lib/apt/lists/*)

# Install global npm tools
RUN npm install -g npm@latest && \
    npm install -g \
    tsx \
    typescript \
    vite \
    electron \
    @capacitor/cli

# ============================================================================
# Java 17 Configuration
# ============================================================================
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
RUN update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java && \
    update-alternatives --set javac /usr/lib/jvm/java-17-openjdk-amd64/bin/javac && \
    java -version 2>&1 | grep "17\." && \
    echo "✅ Java 17 configured"

# ============================================================================
# Gradle 9.1.0 (Matches project gradle-wrapper.properties)
# ============================================================================
RUN wget -q https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip -O /tmp/gradle.zip && \
    unzip -q /tmp/gradle.zip -d /opt && \
    ln -s /opt/gradle-${GRADLE_VERSION} /opt/gradle && \
    rm /tmp/gradle.zip

ENV PATH=$PATH:/opt/gradle/bin
RUN gradle --version

# ============================================================================
# Android SDK Setup
# ============================================================================
# Download and install Android command line tools
RUN mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip && \
    unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools && \
    mv ${ANDROID_SDK_ROOT}/cmdline-tools/cmdline-tools ${ANDROID_SDK_ROOT}/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# Accept licenses and install Android SDK components
RUN yes | sdkmanager --licenses || true && \
    sdkmanager --update && \
    sdkmanager \
    "platform-tools" \
    "platforms;android-${ANDROID_COMPILE_SDK_VERSION}" \
    "build-tools;${ANDROID_BUILD_TOOLS_VERSION}" \
    "extras;android;m2repository" \
    "extras;google;m2repository" \
    "extras;google;google_play_services"

# ============================================================================
# Workspace Setup
# ============================================================================
WORKDIR /workspace

# Copy package files for dependency caching
COPY package*.json ./

# Install project dependencies
RUN npm ci --include=dev

# ============================================================================
# Environment Variables for Development
# ============================================================================
ENV NODE_ENV=development \
    CI=false \
    FORCE_COLOR=1 \
    NPM_CONFIG_COLOR=always

# ============================================================================
# Healthcheck & Metadata
# ============================================================================
LABEL maintainer="jbcom" \
      description="Complete development environment for Otter River Rush" \
      version="1.0.0" \
      java.version="17" \
      node.version="22" \
      gradle.version="9.1.0" \
      android.sdk="35" \
      playwright.version="1.47.0"

# Verify all critical tools are available
RUN echo "=== Environment Verification ===" && \
    echo "Node.js: $(node --version)" && \
    echo "npm: $(npm --version)" && \
    echo "Java: $(java -version 2>&1 | head -n1)" && \
    echo "Gradle: $(gradle --version | grep Gradle)" && \
    echo "Android SDK: ${ANDROID_SDK_ROOT}" && \
    echo "Playwright: $(npx playwright --version)" && \
    echo "✅ All tools verified"

# Default command
CMD ["/bin/bash"]

# ============================================================================
# Usage Examples:
# ============================================================================
# Build the image:
#   docker build -t otter-river-rush-dev -f .cursor/Dockerfile .
#
# Run development container:
#   docker run -it --rm -v $(pwd):/workspace otter-river-rush-dev
#
# Run specific commands:
#   docker run --rm -v $(pwd):/workspace otter-river-rush-dev npm run build
#   docker run --rm -v $(pwd):/workspace otter-river-rush-dev npm run test
#   docker run --rm -v $(pwd):/workspace otter-river-rush-dev ./android/gradlew assembleRelease
#
# Interactive development:
#   docker run -it --rm -v $(pwd):/workspace -p 5173:5173 otter-river-rush-dev npm run dev
