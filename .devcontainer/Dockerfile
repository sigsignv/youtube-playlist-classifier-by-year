FROM node:20-bookworm

ARG USERNAME=node

ENV LANG=C.UTF-8
ENV TZ=Asia/Tokyo

# Add Packages
RUN export DEBIAN_FRONTEND=noninteractive \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
        bash-completion \
        bind9-dnsutils \
        less \
        nkf \
        publicsuffix \
        sudo \
        vim-nox \
        whiptail \
        zip \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# sudo
RUN usermod -aG adm,sudo ${USERNAME} \
 && echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/poweruser \
 && chmod 440 /etc/sudoers.d/poweruser

USER ${USERNAME}
CMD [ "/bin/bash", "-l" ]
