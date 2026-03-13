FROM node:20-bookworm

RUN apt-get update && apt-get install -y git curl jq && rm -rf /var/lib/apt/lists/*

RUN curl -L https://foundry.paradigm.xyz | bash && /root/.foundry/bin/foundryup

ENV PATH="/root/.foundry/bin:${PATH}"

RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh && \
    ssh-keyscan github.com >> /root/.ssh/known_hosts 2>/dev/null

RUN git config --global user.name "Jeannie" && \
    git config --global user.email "jeannie@fractall.xyz"

WORKDIR /workspace
