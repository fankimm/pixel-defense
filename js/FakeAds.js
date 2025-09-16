class FakeAdManager {
    constructor() {
        this.adTemplates = [
            {
                template: 1,
                title: "🤑 1명의 한국인이 이 방법으로 억만장자가 됨!",
                text: "타워디펜스 전문가들이 이 한가지 팁을 싫어합니다!",
                button: "지금 클릭!!!",
                clickMessage: "404: 억만장자 되는 방법을 찾을 수 없습니다 ㅋㅋ"
            },
            {
                template: 2,
                title: "⚠️ 시스템 경고 ⚠️",
                text: "당신의 타워가 바이러스에 감염되었습니다!",
                button: "지금 치료하기",
                clickMessage: "농담입니다! 계속 게임하세요 😄"
            },
            {
                template: 3,
                title: "🔥 핫딜! 🔥 무료 다이아몬드 999개!",
                text: "선착순 1명! (이미 100만명이 클릭함)",
                button: "받기! 받기! 받기!",
                clickMessage: "다이아몬드는 이 게임에 없습니다... 🤷"
            },
            {
                template: 4,
                title: "💰 비트코인 무료로 받기 💰",
                text: "클릭 한번으로 부자되기 (진짜임) (거짓말 아님)",
                button: "💎 채굴 시작 💎",
                clickMessage: "당신의 CPU는 이미 게임 돌리느라 바쁩니다!"
            },
            {
                template: 5,
                title: "🌈 IQ 999 되는 방법 🌈",
                text: "의사들이 숨기고 싶어하는 두뇌 트레이닝 비법",
                button: "천재 되기",
                clickMessage: "이미 이 게임 하는 것만으로도 충분히 똑똑해요!"
            },
            {
                template: 6,
                title: "😱 충격! 당신 근처의 싱글 타워들!",
                text: "외로운 타워들이 당신을 기다립니다",
                button: "지금 만나기 💕",
                clickMessage: "타워는 이미 게임 안에 많이 있잖아요..."
            },
            {
                template: 1,
                title: "🎮 프로게이머가 되는 단 한가지 방법",
                text: "e스포츠 코치들이 절대 알려주지 않는 비밀",
                button: "프로 되기",
                clickMessage: "비밀: 그냥 많이 하면 됩니다 ㅎㅎ"
            },
            {
                template: 2,
                title: "🚨 RAM 다운로드 🚨",
                text: "컴퓨터 2배 빠르게 만들기 (100% 작동)",
                button: "16GB 다운로드",
                clickMessage: "RAM은 다운로드 할 수 없어요... 하드웨어입니다!"
            },
            {
                template: 3,
                title: "🍕 피자 쿠폰 당첨! 🍕",
                text: "축하합니다! 무료 피자에 당첨되셨습니다!",
                button: "쿠폰 받기",
                clickMessage: "죄송합니다, 픽셀 피자만 가능합니다 🍕"
            },
            {
                template: 4,
                title: "📱 아이폰 15 Pro Max 1원! 📱",
                text: "재고 소진 임박! (재고: -50개)",
                button: "지금 구매",
                clickMessage: "재고가 마이너스면... 이미 늦은거죠? 😅"
            },
            {
                template: 5,
                title: "🦄 유니콘 입양하기 🦄",
                text: "귀여운 유니콘이 주인을 찾습니다",
                button: "입양하기 ✨",
                clickMessage: "유니콘은 전설의 동물입니다... 아시죠?"
            },
            {
                template: 6,
                title: "🏠 화성 부동산 투자 🚀",
                text: "일론 머스크도 투자한 그곳! (거짓말)",
                button: "땅 구매하기",
                clickMessage: "아직 화성 이주는 시기상조입니다 🚀"
            },
            {
                template: 2,
                title: "⚡ 인터넷 속도 9999% 향상 ⚡",
                text: "ISP가 숨기는 이 한가지 트릭!",
                button: "속도 올리기",
                clickMessage: "공유기 재시작해보세요. 그게 진짜 트릭입니다!"
            },
            {
                template: 3,
                title: "🎯 미래 예측 100% 적중! 🎯",
                text: "내일 로또 번호 알려드림 (진심)",
                button: "번호 보기",
                clickMessage: "1, 2, 3, 4, 5, 6... 아 이건 아니네요 😂"
            },
            {
                template: 1,
                title: "💪 복근 만들기 쉬운 방법 💪",
                text: "운동 안하고 초콜릿 복근 만들기",
                button: "비법 보기",
                clickMessage: "비법: 포토샵을 사용하세요!"
            }
        ];
        
        this.currentAdIndex = 0;
        this.initAds();
    }
    
    initAds() {
        // Try multiple times to ensure DOM is ready
        let attempts = 0;
        const tryShowAd = () => {
            const adContent = document.getElementById('ad-content');
            if (adContent || attempts > 10) {
                this.showRandomAd();
                
                // 30초마다 광고 변경
                setInterval(() => {
                    this.showRandomAd();
                }, 30000);
            } else {
                attempts++;
                setTimeout(tryShowAd, 100);
            }
        };
        
        tryShowAd();
        
        // 광고 클릭 이벤트 - null 체크 추가
        const adContent = document.getElementById('ad-content');
        if (adContent) {
            adContent.addEventListener('click', () => {
                this.handleAdClick();
            });
        }
        
        // Window resize 이벤트 처리
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.showRandomAd();
            }, 250);
        });
    }
    
    showRandomAd() {
        const randomAd = this.adTemplates[Math.floor(Math.random() * this.adTemplates.length)];
        const adContent = document.getElementById('ad-content');
        
        if (!adContent) {
            console.warn('Ad content element not found');
            return;
        }
        
        adContent.className = `ad-content-wrapper ad-template-${randomAd.template}`;
        
        // Check screen width
        const windowWidth = window.innerWidth;
        
        if (windowWidth <= 500) {
            // Very narrow - show title only
            adContent.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; padding: 5px;">
                    <span class="fake-ad-title" style="font-size: 12px;">${randomAd.title}</span>
                </div>
            `;
        } else if (windowWidth <= 768) {
            // Mobile layout - title and text
            adContent.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; text-align: center; padding: 5px;">
                    <span class="fake-ad-title" style="font-size: 13px;">${randomAd.title}</span>
                    <span class="fake-ad-text" style="font-size: 11px;">${randomAd.text}</span>
                </div>
            `;
        } else {
            // Desktop layout - horizontal with all text
            adContent.innerHTML = `
                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 20px;">
                    <span class="fake-ad-title">${randomAd.title}</span>
                    <span class="fake-ad-text">${randomAd.text}</span>
                </div>
            `;
        }
        
        adContent.dataset.clickMessage = randomAd.clickMessage;
        
        // 배너 다시 표시 (X 버튼으로 닫았을 경우를 위해)
        document.getElementById('fake-ad-banner').style.display = 'flex';
    }
    
    handleAdClick() {
        const adContent = document.getElementById('ad-content');
        const message = adContent.dataset.clickMessage;
        
        // 잠시 메시지 표시
        const originalContent = adContent.innerHTML;
        adContent.innerHTML = `
            <div style="padding: 20px; font-size: 18px; color: #ff0000;">
                ${message}
            </div>
        `;
        
        // 3초 후 새로운 광고 표시
        setTimeout(() => {
            this.showRandomAd();
        }, 3000);
    }
    
    // 광고 "효과" - 게임에 재미있는 이벤트 추가
    triggerAdEffect() {
        const effects = [
            () => {
                // 화면 흔들기 효과
                const gameContainer = document.getElementById('game-container');
                gameContainer.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    gameContainer.style.animation = '';
                }, 500);
            },
            () => {
                // 임시 무지개 효과
                document.body.style.filter = 'hue-rotate(360deg)';
                document.body.style.transition = 'filter 2s';
                setTimeout(() => {
                    document.body.style.filter = '';
                }, 2000);
            },
            () => {
                // 가짜 팝업 알림
                const popup = document.createElement('div');
                popup.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: yellow;
                    color: black;
                    padding: 20px;
                    border: 5px solid red;
                    z-index: 9999;
                    font-size: 24px;
                    font-weight: bold;
                    animation: spin 1s linear infinite;
                `;
                popup.innerHTML = '축하합니다! 🎉<br>당신은 100만번째 방문자!';
                document.body.appendChild(popup);
                
                setTimeout(() => {
                    popup.remove();
                }, 2000);
            }
        ];
        
        // 랜덤 효과 실행 (10% 확률)
        if (Math.random() < 0.1) {
            const effect = effects[Math.floor(Math.random() * effects.length)];
            effect();
        }
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;
document.head.appendChild(style);